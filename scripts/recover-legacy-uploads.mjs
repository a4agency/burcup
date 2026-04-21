#!/usr/bin/env node

import fs from 'node:fs/promises';
import path from 'node:path';

const DEFAULT_INPUTS = [
  '/tmp/burcup-audit-news.json',
  '/tmp/burcup-audit-albums.json',
];

const DEFAULT_OLD_SITE_BASE = 'https://burchalkin-cup.ru/wp-content';
const DEFAULT_TARGET_ROOT = 'lamp-api/public';
const uploadPattern = /\/uploads\/[^"'\\\s<>]+/g;

function parseArgs(argv) {
  const options = {
    inputs: [],
    output: '',
    targetRoot: DEFAULT_TARGET_ROOT,
    oldSiteBase: DEFAULT_OLD_SITE_BASE,
    download: false,
    limit: 0,
    check: false,
  };

  for (const arg of argv) {
    if (arg.startsWith('--input=')) {
      options.inputs.push(arg.slice('--input='.length));
    } else if (arg.startsWith('--output=')) {
      options.output = arg.slice('--output='.length);
    } else if (arg.startsWith('--target-root=')) {
      options.targetRoot = arg.slice('--target-root='.length);
    } else if (arg.startsWith('--old-site-base=')) {
      options.oldSiteBase = arg.slice('--old-site-base='.length).replace(/\/+$/, '');
    } else if (arg === '--download') {
      options.download = true;
    } else if (arg === '--check') {
      options.check = true;
    } else if (arg.startsWith('--limit=')) {
      options.limit = Number(arg.slice('--limit='.length)) || 0;
    } else if (arg === '--help') {
      printHelp();
      process.exit(0);
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  if (!options.inputs.length) {
    options.inputs = [...DEFAULT_INPUTS];
  }

  return options;
}

function printHelp() {
  console.log(`Usage:
  node scripts/recover-legacy-uploads.mjs [options]

Options:
  --input=/path/file.json      Add JSON source with old content data
  --output=/path/manifest.json Save collected manifest
  --target-root=lamp-api/public
                               Root folder where /uploads/... will be restored
  --old-site-base=https://burchalkin-cup.ru/wp-content
                               Base URL for old WordPress uploads
  --check                      HEAD-check old files on legacy site
  --download                   Download found files into target root
  --limit=10                   Process only first N files for check/download
  --help                       Show this message
`);
}

function collectUploads(value, bucket) {
  if (typeof value === 'string') {
    const matches = value.match(uploadPattern);
    if (matches) {
      for (const raw of matches) {
        bucket.add(normalizeUploadRef(raw));
      }
    }
    return;
  }

  if (Array.isArray(value)) {
    value.forEach((item) => collectUploads(item, bucket));
    return;
  }

  if (value && typeof value === 'object') {
    Object.values(value).forEach((item) => collectUploads(item, bucket));
  }
}

function normalizeUploadRef(input) {
  return input
    .trim()
    .replace(/[)'",]+$/g, '')
    .replace(/\\+$/g, '');
}

async function loadJson(filePath) {
  const raw = await fs.readFile(filePath, 'utf8');
  return JSON.parse(raw);
}

function makeManifestEntry(ref, oldSiteBase, targetRoot) {
  const relative = ref.replace(/^\/+/, '');
  return {
    ref,
    sourceUrl: `${oldSiteBase}${ref}`,
    targetPath: path.join(targetRoot, relative),
  };
}

async function ensureParentDir(filePath) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
}

async function headCheck(url) {
  const response = await fetch(url, {
    method: 'HEAD',
    redirect: 'follow',
  });
  return {
    ok: response.ok,
    status: response.status,
    contentType: response.headers.get('content-type') || '',
    contentLength: response.headers.get('content-length') || '',
  };
}

async function downloadFile(sourceUrl, targetPath) {
  const response = await fetch(sourceUrl, { redirect: 'follow' });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  await ensureParentDir(targetPath);
  const arrayBuffer = await response.arrayBuffer();
  await fs.writeFile(targetPath, Buffer.from(arrayBuffer));
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const bucket = new Set();
  const usedInputs = [];

  for (const input of options.inputs) {
    try {
      const json = await loadJson(input);
      collectUploads(json, bucket);
      usedInputs.push(input);
    } catch (error) {
      console.warn(`[warn] skipped ${input}: ${error.message}`);
    }
  }

  const refs = [...bucket].sort();
  const limitedRefs = options.limit > 0 ? refs.slice(0, options.limit) : refs;
  const manifest = limitedRefs.map((ref) =>
    makeManifestEntry(ref, options.oldSiteBase, options.targetRoot),
  );

  if (options.check) {
    for (const item of manifest) {
      try {
        item.check = await headCheck(item.sourceUrl);
      } catch (error) {
        item.check = {
          ok: false,
          status: 0,
          error: error.message,
        };
      }
    }
  }

  if (options.download) {
    for (const item of manifest) {
      try {
        await downloadFile(item.sourceUrl, item.targetPath);
        item.downloaded = true;
      } catch (error) {
        item.downloaded = false;
        item.downloadError = error.message;
      }
    }
  }

  const result = {
    inputsUsed: usedInputs,
    totalFound: refs.length,
    processed: manifest.length,
    oldSiteBase: options.oldSiteBase,
    targetRoot: options.targetRoot,
    downloadsEnabled: options.download,
    checksEnabled: options.check,
    items: manifest,
  };

  if (options.output) {
    await ensureParentDir(options.output);
    await fs.writeFile(options.output, `${JSON.stringify(result, null, 2)}\n`);
  }

  console.log(JSON.stringify(result, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
