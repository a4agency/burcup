import fs from 'node:fs/promises';
import path from 'node:path';

const baseUrl = process.env.BURCUP_API_BASE || 'https://burcup-production.up.railway.app';
const adminPassword = process.env.BURCUP_ADMIN_PASSWORD || 'agency';
const cacheDir = process.env.BURCUP_MEDIA_CACHE_DIR || '/tmp/burcup-news-media';
const statePath = process.env.BURCUP_MEDIA_STATE || path.join(cacheDir, 'migration-state.json');

async function readJson(file, fallback) {
  try {
    return JSON.parse(await fs.readFile(file, 'utf8'));
  } catch {
    return fallback;
  }
}

async function fetchJson(url, options = {}) {
  const response = await fetch(url, options);
  const body = await response.text();
  const json = body ? JSON.parse(body) : null;
  if (!response.ok) {
    throw new Error(json?.error || `Request failed: ${response.status}`);
  }
  return json;
}

async function createSessionToken() {
  const body = await fetchJson(`${baseUrl}/api/admin/session`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password: adminPassword }),
  });
  if (!body?.token) {
    throw new Error('Admin token was not returned');
  }
  return body.token;
}

function slugify(value = '') {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || 'asset';
}

function removeStandaloneAssetLines(value = '') {
  const text = String(value || '');
  if (!text.trim()) return text;
  return text
    .split('\n')
    .filter(line => {
      const trimmed = line.trim();
      if (!trimmed) return true;
      return !/^https?:\/\/\S+\.(?:jpg|jpeg|png|webp|gif|mp4|mov)(?:\?\S*)?$/i.test(trimmed);
    })
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function replaceAssetUrlsInText(value = '', assets = {}) {
  let next = String(value || '');
  for (const [from, to] of Object.entries(assets)) {
    if (!from || !to || from === to) continue;
    next = next.split(from).join(to);
  }
  return removeStandaloneAssetLines(next);
}

function extractPdfUrls(value = '') {
  return [...new Set(String(value || '').match(/https:\/\/burchalkin-cup\.ru\/\S+?\.pdf\b/gi) || [])];
}

async function uploadRawAsset({ token, remoteUrl, folder, filename, originalFilename, mimeType = 'application/pdf' }) {
  const response = await fetch(`${baseUrl}/api/admin/uploads/raw`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-admin-token': token,
    },
    body: JSON.stringify({
      remote_url: remoteUrl,
      folder,
      filename,
      original_filename: originalFilename,
      mime_type: mimeType,
    }),
  });

  const bodyText = await response.text();
  const body = bodyText ? JSON.parse(bodyText) : null;
  if (!response.ok) {
    throw new Error(body?.error || `Raw upload failed: ${response.status}`);
  }
  return body?.url || '';
}

async function main() {
  const state = await readJson(statePath, { assets: {} });
  const assets = state.assets || {};
  const token = await createSessionToken();
  const news = await fetchJson(`${baseUrl}/api/news`);

  const pdfUrls = new Set();
  for (const item of news) {
    extractPdfUrls(item.body).forEach(url => pdfUrls.add(url));
    if (Array.isArray(item.content)) {
      item.content.forEach(part => extractPdfUrls(part).forEach(url => pdfUrls.add(url)));
    }
    extractPdfUrls(item.excerpt).forEach(url => pdfUrls.add(url));
  }

  for (const remoteUrl of pdfUrls) {
    if (assets[remoteUrl]) continue;
    const pathname = new URL(remoteUrl).pathname;
    const base = path.basename(pathname, path.extname(pathname));
    const filename = slugify(base);
    assets[remoteUrl] = await uploadRawAsset({
      token,
      remoteUrl,
      folder: 'burcup/news/documents',
      filename,
      originalFilename: `${filename}.pdf`,
    });
  }

  const homepageReplacements = {
    'https://burchalkin-cup.ru/': `${baseUrl}/`,
    'https://burchalkin-cup.ru': baseUrl,
    'burchalkin-cup.ru': new URL(baseUrl).host,
  };
  const textReplacements = { ...assets, ...homepageReplacements };

  const nextNews = news.map(item => {
    const nextItem = JSON.parse(JSON.stringify(item));
    nextItem.body = replaceAssetUrlsInText(nextItem.body, textReplacements);
    nextItem.excerpt = replaceAssetUrlsInText(nextItem.excerpt, textReplacements);
    if (Array.isArray(nextItem.content)) {
      nextItem.content = nextItem.content
        .map(part => replaceAssetUrlsInText(part, textReplacements))
        .filter(Boolean);
    }
    return nextItem;
  });

  const response = await fetch(`${baseUrl}/api/admin/news`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'x-admin-token': token,
    },
    body: JSON.stringify(nextNews),
  });

  const bodyText = await response.text();
  const body = bodyText ? JSON.parse(bodyText) : null;
  if (!response.ok) {
    throw new Error(body?.error || `News update failed: ${response.status}`);
  }

  console.log(`Updated ${body?.count || nextNews.length} news items`);
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
