import fs from 'node:fs/promises';
import path from 'node:path';

const inputDir = process.argv[2] || '/tmp/burcup-news';
const outputPath = process.argv[3] || path.join(inputDir, 'news-import.json');

const monthMap = {
  jan: '01',
  feb: '02',
  mar: '03',
  apr: '04',
  may: '05',
  jun: '06',
  jul: '07',
  aug: '08',
  sep: '09',
  oct: '10',
  nov: '11',
  dec: '12',
};

function decodeHtml(value = '') {
  return String(value)
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(parseInt(code, 16)))
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&laquo;/gi, '«')
    .replace(/&raquo;/gi, '»')
    .replace(/&hellip;/gi, '...')
    .replace(/&mdash;/gi, '—')
    .replace(/&ndash;/gi, '–')
    .replace(/&rsquo;/gi, '’')
    .replace(/&lsquo;/gi, '‘')
    .replace(/&rdquo;/gi, '”')
    .replace(/&ldquo;/gi, '“')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>');
}

function stripTags(value = '') {
  return decodeHtml(String(value).replace(/<[^>]+>/g, ' '));
}

function normalizeText(value = '') {
  return decodeHtml(String(value))
    .replace(/\u00a0/g, ' ')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n[ \t]+/g, '\n')
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function slugFromUrl(url = '') {
  const clean = String(url).split('?')[0].replace(/\/+$/, '');
  return clean.split('/').filter(Boolean).pop() || '';
}

function normalizeWordPressImageUrl(url = '') {
  return String(url || '').replace(/-\d+x\d+(?=\.[a-z]{3,4}(?:$|\?))/i, '');
}

function normalizeDate(raw = '') {
  const value = String(raw).trim().toLowerCase();
  const match = value.match(/(\d{1,2})\s+([a-z]{3})\s+(\d{4})/i);
  if (!match) return '';
  const [, day, monthToken, year] = match;
  const month = monthMap[monthToken.toLowerCase()];
  if (!month) return '';
  return `${year}-${month}-${String(day).padStart(2, '0')}`;
}

function htmlToParagraphs(html = '') {
  let value = String(html);

  value = value.replace(/<h[1-6][^>]*class="[^"]*entry-title[^"]*"[\s\S]*?<\/h[1-6]>/gi, '');
  value = value.replace(/<p>\s*Похожие записи:\s*<\/p>[\s\S]*$/i, '');
  value = value.replace(/<div[^>]*class="jp-relatedposts[\s\S]*$/i, '');

  value = value.replace(/<div[^>]*class="wp-video"[^>]*>[\s\S]*?<\/div>/gi, '');
  value = value.replace(/<iframe[\s\S]*?<\/iframe>/gi, '');
  value = value.replace(/<video[\s\S]*?<\/video>/gi, '');
  value = value.replace(/<script[\s\S]*?<\/script>/gi, '');
  value = value.replace(/<style[\s\S]*?<\/style>/gi, '');

  value = value.replace(/<a\b[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi, (_, href, text) => {
    const label = normalizeText(stripTags(text));
    const url = decodeHtml(href).trim();
    if (!url) return label;
    if (!label || label === url) return url;
    return `${label}: ${url}`;
  });

  value = value.replace(/<br\s*\/?>/gi, '\n');
  value = value.replace(/<\/p>/gi, '\n\n');
  value = value.replace(/<\/div>/gi, '\n\n');
  value = value.replace(/<\/li>/gi, '\n');
  value = value.replace(/<li[^>]*>/gi, '• ');
  value = value.replace(/<\/h[1-6]>/gi, '\n\n');
  value = value.replace(/<img[^>]*>/gi, '');
  value = value.replace(/<[^>]+>/g, '');

  return normalizeText(value)
    .split(/\n\s*\n+/)
    .map(part => normalizeText(part))
    .filter(Boolean);
}

function firstMatch(html, regex) {
  const match = html.match(regex);
  return match ? match[1] : '';
}

function collectMatches(html, regex, mapper) {
  const result = [];
  let match;
  while ((match = regex.exec(html)) !== null) {
    result.push(mapper(match));
  }
  return result;
}

function parseCategoryEntries(html = '') {
  const pattern = /<div class="archive_wrap[\s\S]*?<img class="arc_img--image" src="([^"]+)"[\s\S]*?<a href="([^"]+)" class="arc_text-title--link">[\s\S]*?<div class="arc_text-title">\s*([\s\S]*?)\s*<\/div>[\s\S]*?<div class="arc_text-date">\s*([^<]+?)\s*<\/div>[\s\S]*?<div class="arc_text--excerpt">\s*([\s\S]*?)<span class="arc_read-more">/gi;

  return collectMatches(html, pattern, match => {
    const image = normalizeWordPressImageUrl(decodeHtml(match[1]).trim());
    const url = decodeHtml(match[2]).trim();
    const title = normalizeText(stripTags(match[3]));
    const date = normalizeDate(match[4]);
    const excerpt = htmlToParagraphs(match[5]).join('\n\n');
    return {
      slug: slugFromUrl(url),
      source_url: url,
      image,
      title,
      date,
      excerpt,
    };
  });
}

function parseArticle(html = '') {
  const bodyHtml = firstMatch(html, /<div class="entry-content">([\s\S]*?)<\/div><!-- \.entry-content -->/i);
  const videoUrl = firstMatch(bodyHtml, /<source[^>]+src="([^"]+)"/i)
    || firstMatch(bodyHtml, /<iframe[^>]+src="([^"]+)"/i);
  const photoUrls = collectMatches(bodyHtml, /<img[^>]+src="([^"]+)"/gi, match => normalizeWordPressImageUrl(decodeHtml(match[1]).trim()))
    .filter(Boolean);
  const bodyParagraphs = htmlToParagraphs(bodyHtml);

  return {
    video_url: videoUrl.replace(/\?_=1$/, ''),
    body: bodyParagraphs.join('\n\n'),
    photos: Array.from(new Set(photoUrls)),
  };
}

function deriveTournamentSlug(date = '') {
  const year = Number(String(date).slice(0, 4));
  if (year === 2026) return 'burchalkin-cup-2026';
  return '';
}

async function main() {
  const files = await fs.readdir(inputDir);
  const categoryFiles = files
    .filter(name => /^category-page-\d+\.html$/i.test(name))
    .sort((a, b) => a.localeCompare(b, 'en', { numeric: true }));

  const articleFiles = files.filter(name => /^article-.*\.html$/i.test(name));
  const articleMap = new Map();

  for (const file of articleFiles) {
    const html = await fs.readFile(path.join(inputDir, file), 'utf8');
    articleMap.set(file.replace(/^article-/, '').replace(/\.html$/i, ''), parseArticle(html));
  }

  const entryMap = new Map();
  for (const file of categoryFiles) {
    const html = await fs.readFile(path.join(inputDir, file), 'utf8');
    for (const entry of parseCategoryEntries(html)) {
      if (!entry.slug || entryMap.has(entry.slug)) continue;
      entryMap.set(entry.slug, entry);
    }
  }

  const items = Array.from(entryMap.values())
    .map(entry => {
      const article = articleMap.get(entry.slug) || { video_url: '', body: '', photos: [] };
      const allPhotos = [entry.image, ...article.photos].filter(Boolean);
      const uniquePhotos = Array.from(new Set(allPhotos));
      const bodyParagraphs = String(article.body || entry.excerpt)
        .split(/\n\s*\n+/)
        .map(part => normalizeText(part))
        .filter(Boolean);
      const cleanedBody = bodyParagraphs[0] === entry.title ? bodyParagraphs.slice(1) : bodyParagraphs;
      const bodyWithoutDuplicateTitle = cleanedBody[0] && cleanedBody[0].startsWith(entry.title)
        ? cleanedBody.slice(1)
        : cleanedBody;
      const relatedIndex = bodyWithoutDuplicateTitle.findIndex(part => /^Похожие записи:/i.test(part));
      const finalBodyParts = relatedIndex >= 0
        ? bodyWithoutDuplicateTitle.slice(0, relatedIndex)
        : bodyWithoutDuplicateTitle;
      const excerptSource = normalizeText(entry.excerpt).length >= 24
        ? normalizeText(entry.excerpt)
        : finalBodyParts.slice(0, 2).join('\n\n');
      return {
        id: 0,
        tournament_slug: deriveTournamentSlug(entry.date),
        slug: entry.slug,
        date: entry.date,
        title: entry.title,
        excerpt: excerptSource,
        body: finalBodyParts.join('\n\n') || excerptSource,
        link: `news-article.html?slug=${entry.slug}`,
        image: entry.image,
        video_url: article.video_url || '',
        is_published: true,
        photos: uniquePhotos.map((image_url, index) => ({
          image_url,
          alt_text: entry.title,
          sort_order: index + 1,
        })),
        source_url: entry.source_url,
      };
    })
    .filter(item => item.slug && item.title && item.date)
    .sort((a, b) => {
      if (a.date !== b.date) return b.date.localeCompare(a.date);
      return a.title.localeCompare(b.title, 'ru');
    })
    .map((item, index) => ({
      ...item,
      id: index + 1,
    }));

  await fs.writeFile(outputPath, JSON.stringify(items, null, 2));
  console.log(`Saved ${items.length} news items to ${outputPath}`);
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
