import fs from 'node:fs/promises';
import path from 'node:path';

const baseUrl = process.env.BURCUP_API_BASE || 'https://burcup-production.up.railway.app';
const adminPassword = process.env.BURCUP_ADMIN_PASSWORD || 'agency';
const cacheDir = process.env.BURCUP_MEDIA_CACHE_DIR || '/tmp/burcup-news-media';
const statePath = process.env.BURCUP_MEDIA_STATE || path.join(cacheDir, 'migration-state.json');
const limit = Number(process.env.BURCUP_MEDIA_LIMIT || 9999);

function normalizeUrl(value = '') {
  return String(value || '').trim();
}

function remoteNeedsMigration(url = '') {
  return /^https:\/\/burchalkin-cup\.ru\//i.test(normalizeUrl(url));
}

function slugify(value = '') {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || 'asset';
}

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

async function readJson(file, fallback) {
  try {
    return JSON.parse(await fs.readFile(file, 'utf8'));
  } catch {
    return fallback;
  }
}

async function writeJson(file, value) {
  await ensureDir(path.dirname(file));
  await fs.writeFile(file, JSON.stringify(value, null, 2));
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

function getUploadMeta(remoteUrl, fallbackPrefix, folder) {
  const clean = new URL(remoteUrl);
  const ext = path.extname(clean.pathname).replace('.', '').toLowerCase() || 'bin';
  const base = path.basename(clean.pathname, path.extname(clean.pathname));
  const filename = slugify(base || fallbackPrefix);
  return {
    folder,
    filename,
    original_filename: `${filename}.${ext}`,
  };
}

async function uploadAsset({ token, endpoint, remoteUrl, folder, fallbackPrefix }) {
  const meta = getUploadMeta(remoteUrl, fallbackPrefix, folder);
  const response = await fetch(`${baseUrl}${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-admin-token': token,
    },
    body: JSON.stringify({
      remote_url: remoteUrl,
      ...meta,
    }),
  });

  const bodyText = await response.text();
  const body = bodyText ? JSON.parse(bodyText) : null;
  if (!response.ok) {
    throw new Error(body?.error || `Upload failed: ${response.status}`);
  }
  return body?.url || '';
}

function newsUsesLegacyMedia(item = {}) {
  if (remoteNeedsMigration(item.image)) return true;
  if (remoteNeedsMigration(item.video_url)) return true;
  return Array.isArray(item.photos) && item.photos.some(photo => remoteNeedsMigration(photo?.image_url));
}

async function main() {
  await ensureDir(cacheDir);
  const token = await createSessionToken();
  const state = await readJson(statePath, { assets: {} });
  const news = await fetchJson(`${baseUrl}/api/news`);

  let migratedCount = 0;
  const nextNews = [];

  for (const item of news) {
    const nextItem = JSON.parse(JSON.stringify(item));
    if (!newsUsesLegacyMedia(item)) {
      nextNews.push(nextItem);
      continue;
    }
    if (migratedCount >= limit) {
      nextNews.push(nextItem);
      continue;
    }

    const itemSlug = slugify(item.slug || item.title || `news-${item.id}`);

    if (remoteNeedsMigration(nextItem.image)) {
      const remoteUrl = normalizeUrl(nextItem.image);
      if (!state.assets[remoteUrl]) {
        state.assets[remoteUrl] = await uploadAsset({
          token,
          endpoint: '/api/admin/uploads/image',
          remoteUrl,
          folder: `burcup/news/${itemSlug}/images`,
          fallbackPrefix: `${itemSlug}-cover`,
        });
        await writeJson(statePath, state);
      }
      nextItem.image = state.assets[remoteUrl];
    }

    if (remoteNeedsMigration(nextItem.video_url)) {
      const remoteUrl = normalizeUrl(nextItem.video_url);
      if (!state.assets[remoteUrl]) {
        state.assets[remoteUrl] = await uploadAsset({
          token,
          endpoint: '/api/admin/uploads/video',
          remoteUrl,
          folder: `burcup/news/${itemSlug}/videos`,
          fallbackPrefix: `${itemSlug}-video`,
        });
        await writeJson(statePath, state);
      }
      nextItem.video_url = state.assets[remoteUrl];
    }

    if (Array.isArray(nextItem.photos)) {
      for (const photo of nextItem.photos) {
        const remoteUrl = normalizeUrl(photo?.image_url);
        if (!remoteNeedsMigration(remoteUrl)) continue;
        if (!state.assets[remoteUrl]) {
          state.assets[remoteUrl] = await uploadAsset({
            token,
            endpoint: '/api/admin/uploads/image',
            remoteUrl,
            folder: `burcup/news/${itemSlug}/gallery`,
            fallbackPrefix: `${itemSlug}-photo`,
          });
          await writeJson(statePath, state);
        }
        photo.image_url = state.assets[remoteUrl];
      }
    }

    migratedCount += 1;
    nextNews.push(nextItem);
    console.log(`Migrated news media: ${item.slug}`);
  }

  await writeJson(path.join(cacheDir, 'news-migrated.json'), nextNews);

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
