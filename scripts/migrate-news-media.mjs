import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { spawn } from 'node:child_process';
import sharp from 'sharp';
import ffmpegPath from 'ffmpeg-static';

const baseUrl = process.env.BURCUP_API_BASE || 'https://burcup-production.up.railway.app';
const adminPassword = process.env.BURCUP_ADMIN_PASSWORD || 'agency';
const cacheDir = process.env.BURCUP_MEDIA_CACHE_DIR || '/tmp/burcup-news-media';
const statePath = process.env.BURCUP_MEDIA_STATE || path.join(cacheDir, 'migration-state.json');
const limit = Number(process.env.BURCUP_MEDIA_LIMIT || 9999);
const imageUploadLimitBytes = 9_500_000;
const videoUploadTargetBytes = 95_000_000;

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

async function pathExists(file) {
  try {
    await fs.access(file);
    return true;
  } catch {
    return false;
  }
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

async function downloadBuffer(remoteUrl) {
  const response = await fetch(remoteUrl);
  if (!response.ok) {
    throw new Error(`Download failed: ${response.status}`);
  }
  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

function inferMimeType(extension, fallback) {
  const ext = String(extension || '').toLowerCase();
  if (ext === 'jpg' || ext === 'jpeg') return 'image/jpeg';
  if (ext === 'png') return 'image/png';
  if (ext === 'webp') return 'image/webp';
  if (ext === 'gif') return 'image/gif';
  if (ext === 'mp4') return 'video/mp4';
  if (ext === 'mov') return 'video/quicktime';
  return fallback || 'application/octet-stream';
}

async function uploadBinaryAsset({ token, endpoint, buffer, folder, filename, originalFilename, mimeType }) {
  const response = await fetch(`${baseUrl}${endpoint}`, {
    method: 'POST',
    headers: {
      'x-admin-token': token,
      'content-type': mimeType,
      'x-upload-folder': folder,
      'x-upload-filename': filename,
      'x-upload-original-filename': originalFilename,
    },
    body: buffer,
  });

  const bodyText = await response.text();
  const body = bodyText ? JSON.parse(bodyText) : null;
  if (!response.ok) {
    throw new Error(body?.error || `Binary upload failed: ${response.status}`);
  }
  return body?.url || '';
}

async function compressImageBuffer(remoteUrl, meta) {
  const input = await downloadBuffer(remoteUrl);
  const transformer = sharp(input, { failOn: 'none' }).rotate();
  const image = transformer.clone();
  const info = await image.metadata();
  const maxWidth = info.width && info.width > 2400 ? 2400 : undefined;

  const resized = image.resize({
    width: maxWidth,
    withoutEnlargement: true,
  });

  let output;
  let mimeType = 'image/webp';
  let ext = 'webp';

  if (String(info.format || '').toLowerCase() === 'png' && info.hasAlpha) {
    output = await resized.webp({ quality: 82 }).toBuffer();
  } else {
    output = await resized.jpeg({ quality: 82, mozjpeg: true }).toBuffer();
    mimeType = 'image/jpeg';
    ext = 'jpg';
  }

  if (output.length > imageUploadLimitBytes) {
    const tighter = image.resize({
      width: maxWidth ? Math.min(maxWidth, 1920) : 1920,
      withoutEnlargement: true,
    });
    if (mimeType === 'image/jpeg') {
      output = await tighter.jpeg({ quality: 72, mozjpeg: true }).toBuffer();
    } else {
      output = await tighter.webp({ quality: 72 }).toBuffer();
    }
  }

  return {
    buffer: output,
    mimeType,
    filename: `${meta.filename}.${ext}`,
  };
}

function runFfmpeg(args) {
  return new Promise((resolve, reject) => {
    const child = spawn(ffmpegPath, args, { stdio: ['ignore', 'ignore', 'pipe'] });
    let stderr = '';
    child.stderr.on('data', chunk => {
      stderr += String(chunk);
    });
    child.on('error', reject);
    child.on('close', code => {
      if (code === 0) {
        resolve(stderr);
      } else {
        reject(new Error(stderr || `ffmpeg exited with code ${code}`));
      }
    });
  });
}

async function compressVideoBuffer(remoteUrl, meta) {
  if (!ffmpegPath) {
    throw new Error('ffmpeg-static is not available');
  }

  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'burcup-video-'));
  const inputPath = path.join(tmpDir, `input-${meta.filename}.${meta.ext}`);
  const outputPath = path.join(tmpDir, `output-${meta.filename}.mp4`);

  try {
    const input = await downloadBuffer(remoteUrl);
    await fs.writeFile(inputPath, input);

    await runFfmpeg([
      '-y',
      '-i', inputPath,
      '-vf', 'scale=\'min(1280,iw)\':-2',
      '-c:v', 'libx264',
      '-preset', 'veryfast',
      '-crf', '30',
      '-movflags', '+faststart',
      '-c:a', 'aac',
      '-b:a', '96k',
      outputPath,
    ]);

    let output = await fs.readFile(outputPath);

    if (output.length > videoUploadTargetBytes) {
      await runFfmpeg([
        '-y',
        '-i', inputPath,
        '-vf', 'scale=\'min(960,iw)\':-2',
        '-c:v', 'libx264',
        '-preset', 'veryfast',
        '-crf', '34',
        '-movflags', '+faststart',
        '-c:a', 'aac',
        '-b:a', '80k',
        outputPath,
      ]);
      output = await fs.readFile(outputPath);
    }

    if (output.length > videoUploadTargetBytes) {
      throw new Error(`Compressed video is still too large: ${output.length} bytes`);
    }

    return {
      buffer: output,
      mimeType: 'video/mp4',
      filename: `${meta.filename}.mp4`,
    };
  } finally {
    await fs.rm(tmpDir, { recursive: true, force: true });
  }
}

async function uploadAsset({ token, endpoint, remoteUrl, folder, fallbackPrefix }) {
  const meta = getUploadMeta(remoteUrl, fallbackPrefix, folder);
  try {
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
  } catch (error) {
    const message = String(error.message || error);
    if (!message.includes('File size too large')) {
      throw error;
    }
  }

  if (endpoint === '/api/admin/uploads/image') {
    const compressed = await compressImageBuffer(remoteUrl, meta);
    return uploadBinaryAsset({
      token,
      endpoint: '/api/admin/uploads/image-binary',
      buffer: compressed.buffer,
      folder,
      filename: meta.filename,
      originalFilename: compressed.filename,
      mimeType: compressed.mimeType,
    });
  }

  if (endpoint === '/api/admin/uploads/video') {
    const compressed = await compressVideoBuffer(remoteUrl, meta);
    return uploadBinaryAsset({
      token,
      endpoint: '/api/admin/uploads/video-binary',
      buffer: compressed.buffer,
      folder,
      filename: meta.filename,
      originalFilename: compressed.filename,
      mimeType: compressed.mimeType,
    });
  }

  throw new Error(`Unsupported upload endpoint fallback: ${endpoint}`);
}

function newsUsesLegacyMedia(item = {}) {
  if (remoteNeedsMigration(item.image)) return true;
  if (remoteNeedsMigration(item.video_url)) return true;
  return Array.isArray(item.photos) && item.photos.some(photo => remoteNeedsMigration(photo?.image_url));
}

function shouldRetrySkipped(state, remoteUrl) {
  const error = String(state.skipped?.[remoteUrl] || '');
  return error.includes('File size too large') || error.includes('Compressed video is still too large');
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

async function main() {
  await ensureDir(cacheDir);
  const token = await createSessionToken();
  const state = await readJson(statePath, { assets: {}, skipped: {} });
  state.assets = state.assets || {};
  state.skipped = state.skipped || {};
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
      if (!state.assets[remoteUrl] && (!state.skipped[remoteUrl] || shouldRetrySkipped(state, remoteUrl))) {
        try {
          delete state.skipped[remoteUrl];
          state.assets[remoteUrl] = await uploadAsset({
            token,
            endpoint: '/api/admin/uploads/image',
            remoteUrl,
            folder: `burcup/news/${itemSlug}/images`,
            fallbackPrefix: `${itemSlug}-cover`,
          });
        } catch (error) {
          state.skipped[remoteUrl] = String(error.message || error);
        }
        await writeJson(statePath, state);
      }
      nextItem.image = state.assets[remoteUrl] || remoteUrl;
    }

    if (remoteNeedsMigration(nextItem.video_url)) {
      const remoteUrl = normalizeUrl(nextItem.video_url);
      if (!state.assets[remoteUrl] && (!state.skipped[remoteUrl] || shouldRetrySkipped(state, remoteUrl))) {
        try {
          delete state.skipped[remoteUrl];
          state.assets[remoteUrl] = await uploadAsset({
            token,
            endpoint: '/api/admin/uploads/video',
            remoteUrl,
            folder: `burcup/news/${itemSlug}/videos`,
            fallbackPrefix: `${itemSlug}-video`,
          });
        } catch (error) {
          state.skipped[remoteUrl] = String(error.message || error);
        }
        await writeJson(statePath, state);
      }
      nextItem.video_url = state.assets[remoteUrl] || remoteUrl;
    }

    if (Array.isArray(nextItem.photos)) {
      for (const photo of nextItem.photos) {
        const remoteUrl = normalizeUrl(photo?.image_url);
        if (!remoteNeedsMigration(remoteUrl)) continue;
        if (!state.assets[remoteUrl] && (!state.skipped[remoteUrl] || shouldRetrySkipped(state, remoteUrl))) {
          try {
            delete state.skipped[remoteUrl];
            state.assets[remoteUrl] = await uploadAsset({
              token,
              endpoint: '/api/admin/uploads/image',
              remoteUrl,
              folder: `burcup/news/${itemSlug}/gallery`,
              fallbackPrefix: `${itemSlug}-photo`,
            });
          } catch (error) {
            state.skipped[remoteUrl] = String(error.message || error);
          }
          await writeJson(statePath, state);
        }
        photo.image_url = state.assets[remoteUrl] || remoteUrl;
      }
    }

    nextItem.body = replaceAssetUrlsInText(nextItem.body, state.assets);
    if (Array.isArray(nextItem.content)) {
      nextItem.content = nextItem.content
        .map(part => replaceAssetUrlsInText(part, state.assets))
        .filter(Boolean);
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
  console.log(`Uploaded assets: ${Object.keys(state.assets || {}).length}`);
  console.log(`Skipped assets: ${Object.keys(state.skipped || {}).length}`);
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
