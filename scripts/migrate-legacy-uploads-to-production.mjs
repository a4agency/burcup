#!/usr/bin/env node

import fs from 'node:fs/promises';
import path from 'node:path';

const DEFAULT_MANIFEST = '/tmp/legacy-uploads-manifest.json';
const DEFAULT_API_BASE = 'https://burcup-production.up.railway.app';
const DEFAULT_PASSWORD = '';

function parseArgs(argv) {
  const options = {
    manifest: DEFAULT_MANIFEST,
    apiBase: DEFAULT_API_BASE,
    password: process.env.ADMIN_PASSWORD || DEFAULT_PASSWORD,
    limit: 0,
    dryRun: false,
    verify: true,
    skipExisting: true,
    output: '',
  };

  for (const arg of argv) {
    if (arg.startsWith('--manifest=')) {
      options.manifest = arg.slice('--manifest='.length);
    } else if (arg.startsWith('--api-base=')) {
      options.apiBase = arg.slice('--api-base='.length).replace(/\/+$/, '');
    } else if (arg.startsWith('--password=')) {
      options.password = arg.slice('--password='.length);
    } else if (arg.startsWith('--limit=')) {
      options.limit = Number(arg.slice('--limit='.length)) || 0;
    } else if (arg === '--dry-run') {
      options.dryRun = true;
    } else if (arg === '--no-verify') {
      options.verify = false;
    } else if (arg === '--no-skip-existing') {
      options.skipExisting = false;
    } else if (arg.startsWith('--output=')) {
      options.output = arg.slice('--output='.length);
    } else if (arg === '--help') {
      printHelp();
      process.exit(0);
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  if (!options.dryRun && !options.password) {
    throw new Error('Admin password is required. Pass --password=... or set ADMIN_PASSWORD.');
  }

  return options;
}

function printHelp() {
  console.log(`Usage:
  node scripts/migrate-legacy-uploads-to-production.mjs [options]

Options:
  --manifest=/tmp/legacy-uploads-manifest.json   Input manifest from recovery audit
  --api-base=https://burcup-production.up.railway.app
                                                 PHP production base URL
  --password=agency                              Admin password for /api/admin/session
  --limit=10                                     Process only first N entries
  --dry-run                                      Only inspect, do not upload
  --no-verify                                    Skip GET check after upload
  --no-skip-existing                             Re-upload even if target already exists
  --output=/tmp/result.json                      Save detailed report
  --help                                         Show this help
`);
}

async function readManifest(filePath) {
  const raw = await fs.readFile(filePath, 'utf8');
  const parsed = JSON.parse(raw);
  if (!Array.isArray(parsed?.items)) {
    throw new Error('Manifest does not contain items array');
  }
  return parsed.items;
}

async function login(apiBase, password) {
  const response = await fetch(`${apiBase}/api/admin/session`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ password }),
  });

  const body = await response.json().catch(() => ({}));
  if (!response.ok || !body?.token) {
    throw new Error(body?.error || `Login failed (${response.status})`);
  }

  return String(body.token);
}

async function requestHead(url) {
  try {
    const response = await fetch(url, { method: 'HEAD', redirect: 'follow' });
    return {
      ok: response.ok,
      status: response.status,
      contentType: response.headers.get('content-type') || '',
      contentLength: response.headers.get('content-length') || '',
    };
  } catch (error) {
    return {
      ok: false,
      status: 0,
      error: error.message,
    };
  }
}

async function fetchBinary(url) {
  const response = await fetch(url, { redirect: 'follow' });
  if (!response.ok) {
    throw new Error(`Source download failed (${response.status})`);
  }
  const buffer = Buffer.from(await response.arrayBuffer());
  const contentType = response.headers.get('content-type') || '';
  return { buffer, contentType };
}

function inferUploadPayload(ref, contentType = '') {
  const relative = ref.replace(/^\/uploads\//, '');
  const dir = path.posix.dirname(relative);
  const baseName = path.posix.basename(relative);
  const parsed = path.posix.parse(baseName);

  return {
    folder: dir === '.' ? '' : dir,
    filename: parsed.name,
    original_filename: baseName,
    contentType,
  };
}

function buildDataUrl(buffer, contentType, originalFilename) {
  const fallbackType = inferMimeFromName(originalFilename);
  const mime = String(contentType || '').trim() || fallbackType || 'application/octet-stream';
  return `data:${mime};base64,${buffer.toString('base64')}`;
}

function inferMimeFromName(name) {
  const ext = path.extname(name).toLowerCase();
  return (
    {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
      '.avif': 'image/avif',
      '.bmp': 'image/bmp',
      '.svg': 'image/svg+xml',
      '.mp4': 'video/mp4',
      '.webm': 'video/webm',
      '.mov': 'video/quicktime',
      '.mkv': 'video/x-matroska',
      '.pdf': 'application/pdf',
    }[ext] || ''
  );
}

async function uploadRaw(apiBase, token, payload) {
  const response = await fetch(`${apiBase}/api/admin/uploads/raw`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Admin-Token': token,
    },
    body: JSON.stringify(payload),
  });

  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(body?.error || `Upload failed (${response.status})`);
  }

  return body;
}

async function verifyUrl(apiBase, ref) {
  const url = `${apiBase}${ref}`;
  try {
    const response = await fetch(url, { method: 'GET', redirect: 'follow' });
    return {
      ok: response.ok,
      status: response.status,
      url,
    };
  } catch (error) {
    return {
      ok: false,
      status: 0,
      url,
      error: error.message,
    };
  }
}

async function ensureParentDir(filePath) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const allItems = await readManifest(options.manifest);
  const items = options.limit > 0 ? allItems.slice(0, options.limit) : allItems;
  const results = [];

  const token = options.dryRun ? '' : await login(options.apiBase, options.password);

  for (const item of items) {
    const result = {
      ref: item.ref,
      sourceUrl: item.sourceUrl,
    };

    const targetHead = await requestHead(`${options.apiBase}${item.ref}`);
    result.targetBefore = targetHead;
    if (options.skipExisting && targetHead.ok) {
      result.skipped = 'already-exists';
      results.push(result);
      continue;
    }

    const sourceHead = await requestHead(item.sourceUrl);
    result.sourceCheck = sourceHead;
    if (!sourceHead.ok) {
      result.skipped = 'source-missing';
      results.push(result);
      continue;
    }

    if (options.dryRun) {
      result.skipped = 'dry-run';
      results.push(result);
      continue;
    }

    try {
      const { buffer, contentType } = await fetchBinary(item.sourceUrl);
      const payloadMeta = inferUploadPayload(item.ref, contentType);
      const body = await uploadRaw(options.apiBase, token, {
        file: buildDataUrl(buffer, payloadMeta.contentType, payloadMeta.original_filename),
        folder: payloadMeta.folder,
        filename: payloadMeta.filename,
        original_filename: payloadMeta.original_filename,
      });

      result.uploaded = true;
      result.returnedUrl = body?.url || '';
      result.urlMatches = result.returnedUrl === item.ref;
      if (options.verify) {
        result.targetAfter = await verifyUrl(options.apiBase, item.ref);
      }
    } catch (error) {
      result.uploaded = false;
      result.error = error.message;
    }

    results.push(result);
  }

  const summary = {
    apiBase: options.apiBase,
    manifest: options.manifest,
    totalItems: allItems.length,
    processed: items.length,
    dryRun: options.dryRun,
    skipExisting: options.skipExisting,
    uploaded: results.filter(item => item.uploaded).length,
    alreadyExisting: results.filter(item => item.skipped === 'already-exists').length,
    sourceMissing: results.filter(item => item.skipped === 'source-missing').length,
    dryRunSkipped: results.filter(item => item.skipped === 'dry-run').length,
    mismatchedUrls: results.filter(item => item.uploaded && item.urlMatches === false).map(item => ({
      ref: item.ref,
      returnedUrl: item.returnedUrl,
    })),
    failed: results.filter(item => item.uploaded === false).map(item => ({
      ref: item.ref,
      error: item.error,
    })),
    items: results,
  };

  if (options.output) {
    await ensureParentDir(options.output);
    await fs.writeFile(options.output, `${JSON.stringify(summary, null, 2)}\n`);
  }

  console.log(JSON.stringify(summary, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
