const SITE_URL = String(process.env.SITE_URL || 'https://burcup-production.up.railway.app').replace(/\/+$/, '');
const LEGACY_BASE_URL = String(process.env.LEGACY_BASE_URL || 'https://burchalkin-cup.ru').replace(/\/+$/, '');
const ADMIN_PASSWORD = String(process.env.ADMIN_PASSWORD || 'agency').trim();
const USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0 Safari/537.36';
const ONLY_SLUG = String(process.env.ONLY_SLUG || '').trim();
const LIMIT = Number(process.env.NEWS_LIMIT || 0);
const DRY_RUN = process.env.DRY_RUN === '1';

function normalizeAssetKey(value = '') {
  const source = String(value || '').trim();
  if (!source) return '';
  const fileName = source.split('?')[0].split('/').pop() || '';
  return fileName
    .replace(/\.[a-z0-9]+$/i, '')
    .replace(/-\d+x\d+$/i, '')
    .replace(/-\d{10,}$/i, '')
    .toLowerCase();
}

function normalizeNewsUrl(date = '', slug = '') {
  const [year, month, day] = String(date || '').split('-');
  if (!year || !month || !day || !slug) return '';
  return `${LEGACY_BASE_URL}/${year}/${month}/${day}/${slug}/`;
}

async function fetchJson(url, options = {}) {
  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(`Request failed ${response.status} for ${url}`);
  }
  return response.json();
}

async function fetchText(url, options = {}) {
  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(`Request failed ${response.status} for ${url}`);
  }
  return response.text();
}

function extractEntryContent(html = '') {
  const match = String(html).match(/<div class="entry-content">([\s\S]*?)<\/div><!-- \.entry-content -->/i);
  return match ? String(match[1] || '').trim() : '';
}

function buildMediaMap(item = {}) {
  const map = new Map();
  [item.image, ...(Array.isArray(item.photos) ? item.photos.map(photo => photo?.image_url) : [])]
    .map(value => String(value || '').trim())
    .filter(Boolean)
    .forEach((url) => {
      const key = normalizeAssetKey(url);
      if (key && !map.has(key)) {
        map.set(key, url);
      }
    });
  return map;
}

function replaceMediaUrls(html = '', mediaMap = new Map()) {
  return String(html).replace(/(src|href)=("([^"]+)"|'([^']+)')/gi, (match, attr, quoted, doubleValue, singleValue) => {
    const rawUrl = String(doubleValue || singleValue || '').trim();
    const key = normalizeAssetKey(rawUrl);
    if (key && mediaMap.has(key)) {
      const replacement = mediaMap.get(key);
      const quote = quoted.startsWith("'") ? "'" : '"';
      return `${attr}=${quote}${replacement}${quote}`;
    }

    if (/^https?:\/\/burchalkin-cup\.ru\/?$/i.test(rawUrl)) {
      const quote = quoted.startsWith("'") ? "'" : '"';
      return `${attr}=${quote}${SITE_URL}/${quote}`;
    }

    return match;
  });
}

function stripEmptyParagraphs(html = '') {
  let result = String(html);
  for (let pass = 0; pass < 5; pass += 1) {
    const next = result
      .replace(/<p[^>]*>\s*(?:&nbsp;|&#160;|\u00a0|<br\s*\/?>|<span[^>]*id="more-[^"]*"[^>]*><\/span>|\s)*<\/p>/gi, '')
      .replace(/<span[^>]*id="more-[^"]*"[^>]*><\/span>/gi, '')
      .trim();
    if (next === result) break;
    result = next;
  }
  return result;
}

function removeVideoPreviewImage(html = '', item = {}) {
  if (!item?.video_url) return String(html);
  const coverKeys = new Set(
    [item.image, ...(Array.isArray(item.photos) ? item.photos.map(photo => photo?.image_url) : [])]
      .map(normalizeAssetKey)
      .filter(Boolean)
  );

  return String(html).replace(
    /<p[^>]*>\s*(?:<a[^>]*>\s*)?<img\b[^>]*src=("([^"]+)"|'([^']+)')[^>]*>\s*(?:<\/a>)?\s*<\/p>/gi,
    (match, _quoted, doubleValue, singleValue) => {
      const key = normalizeAssetKey(doubleValue || singleValue || '');
      return coverKeys.has(key) ? '' : match;
    }
  );
}

function cleanupLegacyArticleHtml(html = '', item = {}) {
  const mediaMap = buildMediaMap(item);
  let result = String(html);

  result = result
    .replace(/<div class=['"]yarpp[\s\S]*$/i, '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<iframe[\s\S]*?<\/iframe>/gi, '')
    .replace(/<video[\s\S]*?<\/video>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/\s+(?:loading|decoding|srcset|sizes|class|width|height)=("([^"]*)"|'([^']*)')/gi, '')
    .replace(/<a([^>]*?)href=("https?:\/\/burchalkin-cup\.ru\/?"|'https?:\/\/burchalkin-cup\.ru\/?')([^>]*)>/gi, `<a$1href="${
      SITE_URL
    }/"$3>`);

  result = replaceMediaUrls(result, mediaMap);
  result = removeVideoPreviewImage(result, item);
  result = stripEmptyParagraphs(result);

  return result.trim();
}

async function createAdminSession() {
  const body = await fetchJson(`${SITE_URL}/api/admin/session`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify({ password: ADMIN_PASSWORD }),
  });

  if (!body?.token) {
    throw new Error('Admin token was not returned by the server');
  }

  return body.token;
}

async function updateNews(token, items) {
  const response = await fetch(`${SITE_URL}/api/admin/news`, {
    method: 'PUT',
    headers: {
      'content-type': 'application/json',
      'x-admin-token': token,
    },
    body: JSON.stringify(items),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload?.error || `Admin save failed (${response.status})`);
  }
  return payload;
}

async function main() {
  const allNews = await fetchJson(`${SITE_URL}/api/news`);
  const selectedNews = (Array.isArray(allNews) ? allNews : [])
    .filter(item => !ONLY_SLUG || item.slug === ONLY_SLUG)
    .slice(0, LIMIT > 0 ? LIMIT : undefined);

  if (!selectedNews.length) {
    console.log('No news matched the current filter.');
    return;
  }

  let updatedCount = 0;
  const nextNews = [];

  for (const item of allNews) {
    const shouldProcess = selectedNews.some(entry => entry.id === item.id);
    if (!shouldProcess) {
      nextNews.push(item);
      continue;
    }

    const sourceUrl = normalizeNewsUrl(item.date, item.slug);
    if (!sourceUrl) {
      nextNews.push(item);
      continue;
    }

    try {
      const html = await fetchText(sourceUrl, {
        headers: {
          'user-agent': USER_AGENT,
        },
      });
      const entryContent = extractEntryContent(html);
      const bodyHtml = cleanupLegacyArticleHtml(entryContent, item);

      if (!bodyHtml) {
        console.warn(`Skipped ${item.slug}: empty entry-content`);
        nextNews.push(item);
        continue;
      }

      nextNews.push({
        ...item,
        body_html: bodyHtml,
      });
      updatedCount += 1;
      console.log(`Updated ${item.slug}`);
    } catch (error) {
      console.warn(`Skipped ${item.slug}: ${error.message}`);
      nextNews.push(item);
    }
  }

  console.log(`Prepared ${updatedCount} updated news items.`);
  if (DRY_RUN) return;

  const token = await createAdminSession();
  const result = await updateNews(token, nextNews);
  console.log(`Saved ${result.count || 0} news items.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
