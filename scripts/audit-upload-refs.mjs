#!/usr/bin/env node

const base = process.argv[2] || 'https://burcup-production.up.railway.app';
const endpoints = ['/api/news', '/api/media/albums', '/api/admin/partners'];
const uploadPattern = /\/uploads\/[^"'\\\s<>]+/g;

async function fetchJson(path) {
  const response = await fetch(new URL(path, base), {
    headers: { Accept: 'application/json' },
  });
  if (!response.ok) {
    throw new Error(`${path} -> HTTP ${response.status}`);
  }
  return response.json();
}

function collectUploads(value, bucket) {
  if (typeof value === 'string') {
    const matches = value.match(uploadPattern);
    if (matches) {
      matches.forEach((item) => bucket.add(item.replace(/\\+$/, '')));
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

async function main() {
  const bucket = new Set();
  for (const endpoint of endpoints) {
    try {
      const json = await fetchJson(endpoint);
      collectUploads(json, bucket);
    } catch (error) {
      console.error(`[warn] ${error.message}`);
    }
  }

  const items = [...bucket].sort();
  console.log(JSON.stringify({
    base,
    count: items.length,
    uploads: items,
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
