require('dotenv').config();

const crypto = require('crypto');
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

const app = express();
const port = Number(process.env.PORT || 3000);
const databaseUrl = [
  process.env.MYSQL_URL,
  process.env.MYSQL_PUBLIC_URL,
  process.env.DATABASE_URL,
  process.env.DATABASE_PUBLIC_URL,
  process.env.DB_URL,
]
  .map(value => String(value || '').trim())
  .find(Boolean);
const adminToken = (process.env.ADMIN_TOKEN || '').trim();
const adminPassword = (process.env.ADMIN_PASSWORD || 'agency').trim();
const cloudinaryCloudName = (process.env.CLOUDINARY_CLOUD_NAME || '').trim();
const cloudinaryApiKey = (process.env.CLOUDINARY_API_KEY || '').trim();
const cloudinaryApiSecret = (process.env.CLOUDINARY_API_SECRET || '').trim();
const translationEnabled = process.env.TRANSLATION_ENABLED !== 'false';
const translationProvider = (process.env.TRANSLATION_PROVIDER || 'google-gtx').trim().toLowerCase();

if (!databaseUrl) {
  throw new Error('DATABASE_URL is required');
}

function createPool(connectionString) {
  const url = new URL(connectionString);
  return mysql.createPool({
    host: url.hostname,
    port: url.port ? Number(url.port) : 3306,
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: url.pathname.replace(/^\//, ''),
    waitForConnections: true,
    connectionLimit: 10,
    charset: 'utf8mb4',
    multipleStatements: true,
    dateStrings: true,
    connectTimeout: Number(process.env.MYSQL_CONNECT_TIMEOUT || 5000),
  });
}

const pool = createPool(databaseUrl);

const allowedOrigins = (() => {
  const raw = (process.env.CORS_ORIGIN || '*').trim();
  if (!raw || raw === '*') return '*';

  const values = raw.split(',').map(item => item.trim()).filter(Boolean);
  const railwayPublicDomain = (process.env.RAILWAY_PUBLIC_DOMAIN || '').trim();
  const railwayStaticUrl = (process.env.RAILWAY_STATIC_URL || '').trim();

  [
    'https://burcup-production.up.railway.app',
    railwayPublicDomain ? `https://${railwayPublicDomain}` : '',
    railwayStaticUrl,
  ].forEach((origin) => {
    const normalized = origin.replace(/\/+$/, '');
    if (normalized && !values.includes(normalized)) values.push(normalized);
  });

  return values;
})();

const CATEGORY_NAMES = {
  general: 'Партнёры',
  media: 'Информационные партнёры',
  title: 'Титульные партнёры',
  official: 'Официальные партнёры',
  other: 'Прочее',
};

let translationTableEnsured = false;
let editablePagesTableEnsured = false;
let newsArticlePhotosTableEnsured = false;
let newsArticleVideoColumnEnsured = false;
let newsArticleBodyHtmlColumnEnsured = false;
let partnerLogoAssetMetadataColumnsEnsured = false;

function isStaticSiteRoot(candidatePath) {
  if (!candidatePath) return false;
  try {
    return fs.existsSync(path.join(candidatePath, 'index.html'))
      && fs.existsSync(path.join(candidatePath, 'css'))
      && fs.existsSync(path.join(candidatePath, 'js'));
  } catch (error) {
    return false;
  }
}

function resolveStaticSiteRoot() {
  const candidates = [
    process.env.STATIC_ROOT,
    path.resolve(__dirname, '..'),
    path.resolve(__dirname, '../site'),
    path.resolve(process.cwd(), '..'),
  ]
    .map(value => String(value || '').trim())
    .filter(Boolean);

  return candidates.find(isStaticSiteRoot) || '';
}

const staticSiteRoot = resolveStaticSiteRoot();
const faviconPngPath = staticSiteRoot
  ? path.join(staticSiteRoot, 'favicon.png')
  : path.resolve(__dirname, '..', 'favicon.png');
const faviconIcoPath = staticSiteRoot
  ? path.join(staticSiteRoot, 'favicon.ico')
  : path.resolve(__dirname, '..', 'favicon.ico');

function normalizeDate(value) {
  return value || '';
}

function normalizeTime(value) {
  return value ? String(value).slice(0, 5) : '';
}

function normalizeString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function normalizeHtmlString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function nullIfEmpty(value) {
  const normalized = normalizeString(value);
  return normalized || null;
}

function parseInteger(value, fallback = 0) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
}

function parseBoolean(value, fallback = false) {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value !== 0;
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (['true', '1', 'yes', 'on'].includes(normalized)) return true;
    if (['false', '0', 'no', 'off'].includes(normalized)) return false;
  }
  return fallback;
}

function parseScore(score) {
  const parts = String(score || '0:0').split(':');
  return {
    home: parseInteger(parts[0], 0),
    away: parseInteger(parts[1], 0),
  };
}

function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9а-яё]+/gi, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-+/g, '-');
}

function normalizeTranslationText(value) {
  return String(value || '')
    .replace(/\s+/g, ' ')
    .trim();
}

function containsCyrillic(value) {
  return /[А-Яа-яЁё]/.test(String(value || ''));
}

function ensureArray(value) {
  return Array.isArray(value) ? value : [];
}

function sqlInPlaceholders(values) {
  return values.map(() => '?').join(', ');
}

async function queryRows(queryable, sql, params = []) {
  const [rows] = await queryable.query(sql, params);
  return rows;
}

async function queryOne(queryable, sql, params = []) {
  const rows = await queryRows(queryable, sql, params);
  return rows[0] || null;
}

async function execute(queryable, sql, params = []) {
  const [result] = await queryable.execute(sql, params);
  return result;
}

async function getColumns(queryable, tableName) {
  const rows = await queryRows(queryable, `
    SELECT COLUMN_NAME
    FROM information_schema.columns
    WHERE table_schema = DATABASE()
      AND table_name = ?
  `, [tableName]);
  return new Set(rows.map(row => String(row.COLUMN_NAME || '')));
}

async function hasColumn(queryable, tableName, columnName) {
  const row = await queryOne(queryable, `
    SELECT COUNT(*) AS count
    FROM information_schema.columns
    WHERE table_schema = DATABASE()
      AND table_name = ?
      AND column_name = ?
  `, [tableName, columnName]);
  return Number(row?.count || 0) > 0;
}

async function hasTable(queryable, tableName) {
  const row = await queryOne(queryable, `
    SELECT COUNT(*) AS count
    FROM information_schema.tables
    WHERE table_schema = DATABASE()
      AND table_name = ?
  `, [tableName]);
  return Number(row?.count || 0) > 0;
}

function getCloudinaryConfig() {
  if (!cloudinaryCloudName || !cloudinaryApiKey || !cloudinaryApiSecret) {
    return null;
  }

  return {
    cloudName: cloudinaryCloudName,
    apiKey: cloudinaryApiKey,
    apiSecret: cloudinaryApiSecret,
  };
}

function createCloudinarySignature(params, apiSecret) {
  const payload = Object.keys(params)
    .sort()
    .map(key => `${key}=${params[key]}`)
    .join('&');
  return crypto.createHash('sha1').update(payload + apiSecret).digest('hex');
}

async function uploadAssetToCloudinary({
  file,
  folder,
  publicId,
  resourceType = 'image',
  fileName = '',
  mimeType = '',
}) {
  const config = getCloudinaryConfig();
  if (!config) {
    throw new Error('Cloudinary is not configured on the server');
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const uploadParams = {
    folder: folder || 'burcup/uploads',
    public_id: publicId || `asset-${timestamp}`,
    timestamp,
  };

  const signature = createCloudinarySignature(uploadParams, config.apiSecret);
  let body;
  let headers;

  if (file && typeof file === 'object') {
    body = new FormData();
    const binaryMimeType = normalizeString(mimeType) || 'application/octet-stream';
    const binaryFileName = normalizeString(fileName) || `${uploadParams.public_id}`;
    const blob = file instanceof Blob ? file : new Blob([file], { type: binaryMimeType });
    body.append('file', blob, binaryFileName);
    body.append('folder', uploadParams.folder);
    body.append('public_id', uploadParams.public_id);
    body.append('timestamp', String(timestamp));
    body.append('api_key', config.apiKey);
    body.append('signature', signature);
  } else {
    body = new URLSearchParams({
      file,
      folder: uploadParams.folder,
      public_id: uploadParams.public_id,
      timestamp: String(timestamp),
      api_key: config.apiKey,
      signature,
    });
    headers = {
      'Content-Type': 'application/x-www-form-urlencoded',
    };
  }

  const normalizedResourceType = normalizeString(resourceType) || 'image';
  const response = await fetch(`https://api.cloudinary.com/v1_1/${config.cloudName}/${normalizedResourceType}/upload`, {
    method: 'POST',
    headers,
    body,
  });

  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(result.error?.message || 'Cloudinary upload failed');
  }

  return {
    url: result.secure_url || result.url || '',
    publicId: result.public_id || '',
    width: result.width || null,
    height: result.height || null,
    format: result.format || '',
    bytes: result.bytes || 0,
    storageProvider: 'cloudinary',
    resourceType: normalizedResourceType,
  };
}

async function uploadImageToCloudinary({ file, folder, publicId }) {
  return uploadAssetToCloudinary({ file, folder, publicId, resourceType: 'image' });
}

async function uploadVideoToCloudinary({ file, folder, publicId }) {
  return uploadAssetToCloudinary({ file, folder, publicId, resourceType: 'video' });
}

async function uploadRawToCloudinary({ file, folder, publicId, fileName, mimeType }) {
  return uploadAssetToCloudinary({ file, folder, publicId, resourceType: 'raw', fileName, mimeType });
}

async function ensureTranslationCacheTable(queryable = pool) {
  if (translationTableEnsured) return;
  await queryable.query(`
    CREATE TABLE IF NOT EXISTS content_translations (
      id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
      source_lang VARCHAR(16) NOT NULL,
      target_lang VARCHAR(16) NOT NULL,
      source_text TEXT NOT NULL,
      translated_text LONGTEXT NOT NULL,
      provider VARCHAR(64) NOT NULL DEFAULT 'google-gtx',
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY uq_content_translations_unique (source_lang, target_lang, source_text(255))
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
  translationTableEnsured = true;
}

async function ensureEditablePagesTable(queryable = pool) {
  if (editablePagesTableEnsured) return;
  await queryable.query(`
    CREATE TABLE IF NOT EXISTS site_pages (
      id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
      slug VARCHAR(255) NOT NULL,
      title VARCHAR(255) NOT NULL,
      subtitle TEXT NOT NULL,
      body_html LONGTEXT NOT NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY uq_site_pages_slug (slug)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
  editablePagesTableEnsured = true;
}

async function getSitePagesColumns(queryable = pool) {
  await ensureEditablePagesTable(queryable);
  return getColumns(queryable, 'site_pages');
}

function normalizeSitePageRow(row = {}) {
  const bodyHtml = row.body_html || row.content_html || '';
  let subtitle = row.subtitle || '';

  if (!subtitle && row.content_json) {
    try {
      const parsed = JSON.parse(row.content_json);
      subtitle = normalizeString(parsed?.subtitle || '');
    } catch (error) {}
  }

  return {
    slug: row.slug || '',
    title: row.title || '',
    subtitle,
    body_html: bodyHtml,
  };
}

async function ensureNewsArticlePhotosTable(queryable = pool) {
  if (newsArticlePhotosTableEnsured) return;
  await queryable.query(`
    CREATE TABLE IF NOT EXISTS news_article_photos (
      id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
      news_article_id BIGINT NOT NULL,
      image_url TEXT NOT NULL,
      alt_text TEXT NOT NULL,
      sort_order INT NOT NULL DEFAULT 0,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      KEY idx_news_article_photos_article (news_article_id, sort_order, id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
  newsArticlePhotosTableEnsured = true;
}

async function ensureNewsArticleVideoColumn(queryable = pool) {
  if (newsArticleVideoColumnEnsured) return;
  if (!(await hasColumn(queryable, 'news_articles', 'video_url'))) {
    await queryable.query(`ALTER TABLE news_articles ADD COLUMN video_url TEXT NULL`);
  }
  newsArticleVideoColumnEnsured = true;
}

async function ensureNewsArticleBodyHtmlColumn(queryable = pool) {
  if (newsArticleBodyHtmlColumnEnsured) return;
  if (!(await hasColumn(queryable, 'news_articles', 'body_html'))) {
    await queryable.query(`ALTER TABLE news_articles ADD COLUMN body_html LONGTEXT NOT NULL`);
  }
  newsArticleBodyHtmlColumnEnsured = true;
}

async function ensurePartnerLogoAssetMetadataColumns(queryable = pool) {
  if (partnerLogoAssetMetadataColumnsEnsured) return;
  const columns = [
    ['public_id', 'VARCHAR(255) NULL'],
    ['file_name', 'VARCHAR(255) NULL'],
    ['mime_type', 'VARCHAR(128) NULL'],
    ['asset_format', 'VARCHAR(64) NULL'],
    ['width', 'INT NULL'],
    ['height', 'INT NULL'],
    ['bytes', 'INT NULL'],
  ];
  for (const [name, definition] of columns) {
    if (!(await hasColumn(queryable, 'partner_logo_assets', name))) {
      await queryable.query(`ALTER TABLE partner_logo_assets ADD COLUMN ${name} ${definition}`);
    }
  }
  partnerLogoAssetMetadataColumnsEnsured = true;
}

async function translateTextWithGoogleGtx(text, sourceLang, targetLang) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);
  try {
    const url = new URL('https://translate.googleapis.com/translate_a/single');
    url.searchParams.set('client', 'gtx');
    url.searchParams.set('sl', sourceLang);
    url.searchParams.set('tl', targetLang);
    url.searchParams.set('dt', 't');
    url.searchParams.set('q', text);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': 'BurchalkinCupTranslate/1.0' },
    });
    if (!response.ok) {
      throw new Error(`Translation request failed with status ${response.status}`);
    }
    const payload = await response.json().catch(() => null);
    const translatedText = Array.isArray(payload?.[0])
      ? payload[0].map(item => Array.isArray(item) ? item[0] : '').join('').trim()
      : '';
    return translatedText || text;
  } finally {
    clearTimeout(timeoutId);
  }
}

async function translateText(text, sourceLang, targetLang) {
  if (sourceLang === targetLang || !containsCyrillic(text)) return text;
  if (translationProvider !== 'google-gtx') {
    throw new Error(`Unsupported translation provider: ${translationProvider}`);
  }
  return translateTextWithGoogleGtx(text, sourceLang, targetLang);
}

async function getCachedTranslations(queryable, sourceLang, targetLang, texts) {
  if (!texts.length) return {};
  await ensureTranslationCacheTable(queryable);
  const placeholders = sqlInPlaceholders(texts);
  const rows = await queryRows(queryable, `
    SELECT source_text, translated_text
    FROM content_translations
    WHERE source_lang = ?
      AND target_lang = ?
      AND source_text IN (${placeholders})
  `, [sourceLang, targetLang, ...texts]);
  return rows.reduce((acc, row) => {
    acc[row.source_text] = row.translated_text;
    return acc;
  }, {});
}

async function saveTranslations(queryable, sourceLang, targetLang, translations) {
  const entries = Object.entries(translations).filter(([, value]) => normalizeString(value));
  if (!entries.length) return;
  await ensureTranslationCacheTable(queryable);
  for (const [sourceText, translatedText] of entries) {
    await execute(queryable, `
      INSERT INTO content_translations (
        source_lang, target_lang, source_text, translated_text, provider
      )
      VALUES (?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        translated_text = VALUES(translated_text),
        provider = VALUES(provider),
        updated_at = CURRENT_TIMESTAMP
    `, [sourceLang, targetLang, sourceText, translatedText, translationProvider]);
  }
}

async function translateTexts(texts, sourceLang = 'ru', targetLang = 'en') {
  if (!translationEnabled || sourceLang === targetLang) {
    return texts.reduce((acc, text) => {
      acc[text] = text;
      return acc;
    }, {});
  }

  const normalizedTexts = Array.from(new Set(
    ensureArray(texts).map(normalizeTranslationText).filter(text => text && containsCyrillic(text))
  ));
  if (!normalizedTexts.length) return {};

  const cached = await getCachedTranslations(pool, sourceLang, targetLang, normalizedTexts);
  const missing = normalizedTexts.filter(text => !cached[text]);
  if (!missing.length) return cached;

  const translated = {};
  for (const text of missing) {
    translated[text] = await translateText(text, sourceLang, targetLang);
  }
  await saveTranslations(pool, sourceLang, targetLang, translated);
  return { ...cached, ...translated };
}

function buildDefaultPlayoffRows(tournamentSlug = 'burchalkin-cup-2026') {
  const logo = 'images/logo-burchalkin.webp';
  return [
    { tournament_slug: tournamentSlug, bracket_group: 'top', round_group: 'semifinal', match_key: 'top_sf1', sort_order: 1, label: 'Полуфинал 1–4 №1', home_team: 'Команда 1', home_team_slug: 'placeholder-team-1', home_logo: logo, away_team: 'Команда 2', away_team_slug: 'placeholder-team-2', away_logo: logo, home_score: 0, away_score: 0 },
    { tournament_slug: tournamentSlug, bracket_group: 'top', round_group: 'semifinal', match_key: 'top_sf2', sort_order: 2, label: 'Полуфинал 1–4 №2', home_team: 'Команда 3', home_team_slug: 'placeholder-team-3', home_logo: logo, away_team: 'Команда 4', away_team_slug: 'placeholder-team-4', away_logo: logo, home_score: 0, away_score: 0 },
    { tournament_slug: tournamentSlug, bracket_group: 'top', round_group: 'final', match_key: 'top_final', sort_order: 1, label: 'Матч за 1 место', home_team: 'Победитель 1–4 №1', home_team_slug: '', home_logo: '', away_team: 'Победитель 1–4 №2', away_team_slug: '', away_logo: '', home_score: 0, away_score: 0 },
    { tournament_slug: tournamentSlug, bracket_group: 'top', round_group: 'final', match_key: 'top_third', sort_order: 2, label: 'Матч за 3 место', home_team: 'Проигравший 1–4 №1', home_team_slug: '', home_logo: '', away_team: 'Проигравший 1–4 №2', away_team_slug: '', away_logo: '', home_score: 0, away_score: 0 },
    { tournament_slug: tournamentSlug, bracket_group: 'placement', round_group: 'semifinal', match_key: 'placement_sf1', sort_order: 1, label: 'Полуфинал 5–8 №1', home_team: 'Команда 5', home_team_slug: 'placeholder-team-5', home_logo: logo, away_team: 'Команда 6', away_team_slug: 'placeholder-team-6', away_logo: logo, home_score: 0, away_score: 0 },
    { tournament_slug: tournamentSlug, bracket_group: 'placement', round_group: 'semifinal', match_key: 'placement_sf2', sort_order: 2, label: 'Полуфинал 5–8 №2', home_team: 'Команда 7', home_team_slug: 'placeholder-team-7', home_logo: logo, away_team: 'Команда 8', away_team_slug: 'placeholder-team-8', away_logo: logo, home_score: 0, away_score: 0 },
    { tournament_slug: tournamentSlug, bracket_group: 'placement', round_group: 'final', match_key: 'placement_fifth', sort_order: 1, label: 'Матч за 5 место', home_team: 'Победитель 5–8 №1', home_team_slug: '', home_logo: '', away_team: 'Победитель 5–8 №2', away_team_slug: '', away_logo: '', home_score: 0, away_score: 0 },
    { tournament_slug: tournamentSlug, bracket_group: 'placement', round_group: 'final', match_key: 'placement_seventh', sort_order: 2, label: 'Матч за 7 место', home_team: 'Проигравший 5–8 №1', home_team_slug: '', home_logo: '', away_team: 'Проигравший 5–8 №2', away_team_slug: '', away_logo: '', home_score: 0, away_score: 0 },
  ];
}

function mapStandingsRow(row) {
  return {
    group: row.group_name || 'overall',
    position: parseInteger(row.position, 0),
    slug: row.team_slug || '',
    team: row.team || '',
    logo: row.logo || '',
    country: row.country || '',
    city: row.city || '',
    played: parseInteger(row.played, 0),
    won: parseInteger(row.won, 0),
    drawn: parseInteger(row.drawn, 0),
    lost: parseInteger(row.lost, 0),
    goals: `${parseInteger(row.goals_for, 0)}-${parseInteger(row.goals_against, 0)}`,
    points: parseInteger(row.points, 0),
  };
}

function mapPlayoffRow(row) {
  return {
    tournament_slug: row.tournament_slug || '',
    tournament_name: row.tournament_name || '',
    bracket_group: row.bracket_group || '',
    round_group: row.round_group || '',
    match_key: row.match_key || '',
    sort_order: parseInteger(row.sort_order, 0),
    label: row.label || '',
    home_team: row.home_team || '',
    home_team_slug: row.home_team_slug || '',
    home_logo: row.home_logo || '',
    away_team: row.away_team || '',
    away_team_slug: row.away_team_slug || '',
    away_logo: row.away_logo || '',
    home_score: parseInteger(row.home_score, 0),
    away_score: parseInteger(row.away_score, 0),
  };
}

function splitNewsBodyToContent(body) {
  return String(body || '')
    .split(/\n\s*\n+/)
    .map(part => String(part || '').trim())
    .filter(Boolean);
}

function mapNewsArticleRow(row, photos = []) {
  const body = row.body || '';
  return {
    id: Number(row.id),
    slug: row.slug || '',
    date: normalizeDate(row.published_on),
    title: row.title || '',
    excerpt: row.excerpt || '',
    body,
    body_html: row.body_html || '',
    content: splitNewsBodyToContent(body),
    link: row.link_path || '',
    image: row.image_url || '',
    video_url: row.video_url || '',
    photos: Array.isArray(photos) ? photos : [],
    tournament_slug: row.tournament_slug || '',
    tournament_name: row.tournament_name || '',
    is_published: row.is_published !== 0,
  };
}

function formatMatchRow(row) {
  return {
    id: Number(row.id),
    tournament_slug: row.tournament_slug || '',
    tournament_name: row.tournament_name || '',
    stage: row.stage_name || '',
    round: row.round_name || '',
    matchday: row.matchday_label || '',
    date: normalizeDate(row.match_date),
    time: normalizeTime(row.match_time),
    status: row.status || 'soon',
    status_label: row.status_label || '',
    home_team: row.home_team || '',
    home_logo: row.home_logo || '',
    away_team: row.away_team || '',
    away_logo: row.away_logo || '',
    home_team_slug: row.home_team_slug || '',
    away_team_slug: row.away_team_slug || '',
    score: `${parseInteger(row.home_score, 0)}:${parseInteger(row.away_score, 0)}`,
    group: row.stage_name || '',
    venue: row.venue || '',
    video: row.video_url || '',
    review_video: row.review_video_url || '',
    interview_video: row.interview_video_url || '',
    is_featured_media: row.is_featured_media === 1 || row.is_featured_media === true,
    summary: row.summary || '',
    events: row.events || [],
  };
}

async function runInTransaction(work) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const result = await work(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function getTargetTournament(queryable, tournamentSlug = null) {
  const sql = tournamentSlug
    ? `SELECT id, slug, name, season_year, is_featured, standings_mode, playoff_mode FROM tournaments WHERE slug = ? LIMIT 1`
    : `SELECT id, slug, name, season_year, is_featured, standings_mode, playoff_mode FROM tournaments ORDER BY is_featured DESC, season_year DESC, id DESC LIMIT 1`;
  return queryOne(queryable, sql, tournamentSlug ? [tournamentSlug] : []);
}

async function getStandingsRowsStored(queryable, tournamentSlug) {
  return queryRows(queryable, `
    SELECT
      ts.group_name,
      ts.position,
      ts.played,
      ts.won,
      ts.drawn,
      ts.lost,
      ts.goals_for,
      ts.goals_against,
      ts.points,
      c.name AS team,
      c.logo_path AS logo,
      c.slug AS team_slug,
      c.country,
      c.city
    FROM tournament_standings ts
    JOIN clubs c ON c.id = ts.club_id
    JOIN tournaments t ON t.id = ts.tournament_id
    WHERE t.slug = ?
    ORDER BY ts.group_name, ts.position, c.name
  `, [tournamentSlug]);
}

async function computeStandingsRows(queryable, tournamentId) {
  const participantRows = await queryRows(queryable, `
    SELECT DISTINCT c.id, c.name, c.logo_path, c.slug, c.country, c.city
    FROM clubs c
    WHERE c.id IN (
      SELECT club_id FROM tournament_clubs WHERE tournament_id = ?
      UNION
      SELECT home_club_id FROM matches WHERE tournament_id = ?
      UNION
      SELECT away_club_id FROM matches WHERE tournament_id = ?
    )
    ORDER BY c.name
  `, [tournamentId, tournamentId, tournamentId]);

  const completedMatches = await queryRows(queryable, `
    SELECT home_club_id, away_club_id, home_score, away_score
    FROM matches
    WHERE tournament_id = ?
      AND status = 'done'
  `, [tournamentId]);

  const stats = new Map();
  for (const participant of participantRows) {
    stats.set(Number(participant.id), {
      ...participant,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      goals_for: 0,
      goals_against: 0,
      points: 0,
    });
  }

  for (const match of completedMatches) {
    const home = stats.get(Number(match.home_club_id));
    const away = stats.get(Number(match.away_club_id));
    if (!home || !away) continue;
    const homeScore = parseInteger(match.home_score, 0);
    const awayScore = parseInteger(match.away_score, 0);

    home.played += 1;
    away.played += 1;
    home.goals_for += homeScore;
    home.goals_against += awayScore;
    away.goals_for += awayScore;
    away.goals_against += homeScore;

    if (homeScore > awayScore) {
      home.won += 1;
      away.lost += 1;
      home.points += 3;
    } else if (homeScore < awayScore) {
      away.won += 1;
      home.lost += 1;
      away.points += 3;
    } else {
      home.drawn += 1;
      away.drawn += 1;
      home.points += 1;
      away.points += 1;
    }
  }

  return Array.from(stats.values())
    .sort((a, b) => (
      b.points - a.points
      || (b.goals_for - b.goals_against) - (a.goals_for - a.goals_against)
      || b.goals_for - a.goals_for
      || String(a.name).localeCompare(String(b.name), 'ru')
    ))
    .map((item, index) => ({
      group_name: 'overall',
      position: index + 1,
      played: item.played,
      won: item.won,
      drawn: item.drawn,
      lost: item.lost,
      goals_for: item.goals_for,
      goals_against: item.goals_against,
      points: item.points,
      team: item.name,
      logo: item.logo_path,
      team_slug: item.slug,
      country: item.country,
      city: item.city,
    }));
}

async function getStandingsRows(queryable, tournamentSlug = null) {
  const tournament = await getTargetTournament(queryable, tournamentSlug);
  if (!tournament) return [];
  if (String(tournament.standings_mode || 'auto') === 'manual' || Number(tournament.is_featured) !== 1) {
    return getStandingsRowsStored(queryable, tournament.slug);
  }
  const computed = await computeStandingsRows(queryable, Number(tournament.id));
  if (computed.length) return computed;
  return getStandingsRowsStored(queryable, tournament.slug);
}

async function getPlayoffRows(queryable, tournamentSlug = null) {
  const tournament = await getTargetTournament(queryable, tournamentSlug);
  if (!tournament) return [];
  if (!(await hasTable(queryable, 'tournament_playoff_matches')) || String(tournament.playoff_mode || 'auto') !== 'manual') {
    return buildDefaultPlayoffRows(tournament.slug);
  }

  const rows = await queryRows(queryable, `
    SELECT
      t.slug AS tournament_slug,
      t.name AS tournament_name,
      pm.bracket_group,
      pm.round_group,
      pm.match_key,
      pm.sort_order,
      pm.label,
      home.slug AS home_team_slug,
      COALESCE(home.name, pm.home_label) AS home_team,
      COALESCE(home.logo_path, pm.home_logo_path) AS home_logo,
      away.slug AS away_team_slug,
      COALESCE(away.name, pm.away_label) AS away_team,
      COALESCE(away.logo_path, pm.away_logo_path) AS away_logo,
      pm.home_score,
      pm.away_score
    FROM tournament_playoff_matches pm
    JOIN tournaments t ON t.id = pm.tournament_id
    LEFT JOIN clubs home ON home.id = pm.home_club_id
    LEFT JOIN clubs away ON away.id = pm.away_club_id
    WHERE t.slug = ?
    ORDER BY
      CASE pm.bracket_group WHEN 'top' THEN 0 ELSE 1 END,
      CASE pm.round_group WHEN 'semifinal' THEN 0 ELSE 1 END,
      pm.sort_order,
      pm.id
  `, [tournament.slug]);

  if (!rows.length) return buildDefaultPlayoffRows(tournament.slug);
  return rows.map(mapPlayoffRow);
}

async function getMatchEventsMap(queryable, matchIds = []) {
  if (!matchIds.length || !(await hasTable(queryable, 'match_events'))) return new Map();
  const rows = await queryRows(queryable, `
    SELECT match_id, minute_label, event_type, title, description, sort_order
    FROM match_events
    WHERE match_id IN (${sqlInPlaceholders(matchIds)})
    ORDER BY match_id, sort_order, id
  `, matchIds);
  return rows.reduce((acc, row) => {
    const id = Number(row.match_id);
    if (!acc.has(id)) acc.set(id, []);
    acc.get(id).push({
      minute: row.minute_label || '',
      type: row.event_type || 'note',
      title: row.title || '',
      description: row.description || '',
    });
    return acc;
  }, new Map());
}

async function queryMatches(queryable, tournamentSlug = null) {
  let sql = `
    SELECT
      m.id,
      t.slug AS tournament_slug,
      t.name AS tournament_name,
      m.stage_name,
      m.round_name,
      m.matchday_label,
      m.match_date,
      m.match_time,
      m.status,
      m.status_label,
      home.name AS home_team,
      home.slug AS home_team_slug,
      home.logo_path AS home_logo,
      away.name AS away_team,
      away.slug AS away_team_slug,
      away.logo_path AS away_logo,
      m.home_score,
      m.away_score,
      m.venue,
      m.video_url,
      m.review_video_url,
      m.interview_video_url,
      m.is_featured_media,
      m.summary
    FROM matches m
    JOIN tournaments t ON t.id = m.tournament_id
    JOIN clubs home ON home.id = m.home_club_id
    JOIN clubs away ON away.id = m.away_club_id
  `;
  const params = [];
  if (tournamentSlug) {
    sql += ' WHERE t.slug = ?';
    params.push(tournamentSlug);
  }
  sql += ' ORDER BY t.season_year DESC, m.match_date ASC, m.match_time ASC, m.sort_order ASC, m.id ASC';
  const rows = await queryRows(queryable, sql, params);
  const eventsMap = await getMatchEventsMap(queryable, rows.map(row => Number(row.id)));
  return {
    rows: rows.map(row => ({ ...row, events: eventsMap.get(Number(row.id)) || [] })),
  };
}

async function queryClubMatches(queryable, clubSlug) {
  const rows = await queryRows(queryable, `
    SELECT
      m.id,
      t.slug AS tournament_slug,
      t.name AS tournament_name,
      m.stage_name,
      m.round_name,
      m.matchday_label,
      m.match_date,
      m.match_time,
      m.status,
      m.status_label,
      home.name AS home_team,
      home.slug AS home_team_slug,
      home.logo_path AS home_logo,
      away.name AS away_team,
      away.slug AS away_team_slug,
      away.logo_path AS away_logo,
      m.home_score,
      m.away_score,
      m.venue,
      m.video_url,
      m.review_video_url,
      m.interview_video_url,
      m.is_featured_media,
      m.summary
    FROM matches m
    JOIN tournaments t ON t.id = m.tournament_id
    JOIN clubs home ON home.id = m.home_club_id
    JOIN clubs away ON away.id = m.away_club_id
    WHERE home.slug = ? OR away.slug = ?
    ORDER BY m.match_date DESC, m.match_time DESC, m.id DESC
  `, [clubSlug, clubSlug]);
  const eventsMap = await getMatchEventsMap(queryable, rows.map(row => Number(row.id)));
  return {
    rows: rows.map(row => ({ ...row, events: eventsMap.get(Number(row.id)) || [] })),
  };
}

async function getNewsArticlePhotoMap(queryable, articleIds = []) {
  if (!articleIds.length) return new Map();
  await ensureNewsArticlePhotosTable(queryable);
  const rows = await queryRows(queryable, `
    SELECT news_article_id, image_url, alt_text, sort_order
    FROM news_article_photos
    WHERE news_article_id IN (${sqlInPlaceholders(articleIds)})
    ORDER BY news_article_id, sort_order, id
  `, articleIds);
  return rows.reduce((acc, row) => {
    const articleId = Number(row.news_article_id);
    if (!acc.has(articleId)) acc.set(articleId, []);
    acc.get(articleId).push({
      image_url: row.image_url || '',
      alt_text: row.alt_text || '',
      sort_order: parseInteger(row.sort_order, 0),
    });
    return acc;
  }, new Map());
}

async function getMediaAlbumPhotoMap(queryable, albumIds = []) {
  if (!albumIds.length) return new Map();
  const rows = await queryRows(queryable, `
    SELECT album_id, image_url, alt_text, caption, sort_order
    FROM media_album_photos
    WHERE album_id IN (${sqlInPlaceholders(albumIds)})
    ORDER BY album_id, sort_order, id
  `, albumIds);
  return rows.reduce((acc, row) => {
    const albumId = Number(row.album_id);
    if (!acc.has(albumId)) acc.set(albumId, []);
    acc.get(albumId).push({
      image_url: row.image_url || '',
      alt_text: row.alt_text || '',
      caption: row.caption || '',
      sort_order: parseInteger(row.sort_order, 0),
    });
    return acc;
  }, new Map());
}

async function getTournamentsSummary(queryable) {
  return queryRows(queryable, `
    SELECT
      t.id,
      t.slug,
      t.name,
      t.season_year,
      t.short_label,
      t.logo_path,
      t.hero_image_url,
      t.description,
      t.start_date,
      t.end_date,
      t.location,
      t.status,
      t.is_featured,
      t.countdown_enabled,
      t.standings_mode,
      t.playoff_mode,
      (SELECT COUNT(*) FROM tournament_clubs tc WHERE tc.tournament_id = t.id) AS clubs_count,
      (SELECT COUNT(*) FROM matches m WHERE m.tournament_id = t.id) AS matches_count
    FROM tournaments t
    ORDER BY t.season_year DESC, t.start_date DESC, t.id DESC
  `);
}

async function getTournamentBySlug(queryable, slug) {
  return queryOne(queryable, `
    SELECT
      id, slug, name, season_year, short_label, logo_path, hero_image_url,
      description, start_date, end_date, location, status, is_featured,
      countdown_enabled, standings_mode, playoff_mode
    FROM tournaments
    WHERE slug = ?
    LIMIT 1
  `, [slug]);
}

async function getPartnersForTournament(queryable, slug) {
  return queryRows(queryable, `
    SELECT
      pc.slug AS category_slug,
      pc.name AS category_name,
      p.slug AS partner_slug,
      p.name AS partner_name,
      p.website_url,
      p.description,
      COALESCE(pla.image_url, '') AS logo_url,
      COALESCE(pla.alt_text, p.name) AS logo_alt,
      tp.sort_order
    FROM tournament_partners tp
    JOIN tournaments t ON t.id = tp.tournament_id
    JOIN partners p ON p.id = tp.partner_id
    LEFT JOIN partner_categories pc ON pc.id = tp.category_id
    LEFT JOIN partner_logo_assets pla ON pla.id = tp.logo_asset_id
    WHERE tp.is_visible = 1
      AND t.slug = ?
    ORDER BY pc.name, tp.sort_order, p.name
  `, [slug]);
}

async function getAllClubs(queryable) {
  return queryRows(queryable, `
    SELECT
      c.id,
      c.slug,
      c.name,
      c.short_name,
      c.logo_path,
      c.country,
      c.city,
      c.founded_year,
      c.website_url,
      c.hero_image_url,
      c.description,
      c.is_active,
      COUNT(DISTINCT m.id) AS matches_count
    FROM clubs c
    LEFT JOIN matches m ON m.home_club_id = c.id OR m.away_club_id = c.id
    WHERE c.is_active = 1
    GROUP BY c.id
    ORDER BY CASE WHEN c.slug LIKE 'placeholder-team-%' THEN 1 ELSE 0 END, c.name
  `);
}

async function getClubBySlug(queryable, slug) {
  return queryOne(queryable, `
    SELECT
      id, slug, name, short_name, logo_path, country, city,
      founded_year, website_url, hero_image_url, description, is_active
    FROM clubs
    WHERE slug = ?
    LIMIT 1
  `, [slug]);
}

async function getNewsRows(queryable, tournamentSlug = null, includeUnpublished = false) {
  await ensureNewsArticleVideoColumn(queryable);
  await ensureNewsArticleBodyHtmlColumn(queryable);
  let sql = `
    SELECT
      n.id,
      t.slug AS tournament_slug,
      t.name AS tournament_name,
      n.slug,
      n.published_on,
      n.title,
      n.excerpt,
      n.body,
      n.body_html,
      n.link_path,
      n.image_url,
      n.video_url,
      n.is_published
    FROM news_articles n
    LEFT JOIN tournaments t ON t.id = n.tournament_id
  `;
  const conditions = [];
  const params = [];
  if (!includeUnpublished) conditions.push('n.is_published = 1');
  if (tournamentSlug) {
    conditions.push('t.slug = ?');
    params.push(tournamentSlug);
  }
  if (conditions.length) sql += ` WHERE ${conditions.join(' AND ')}`;
  sql += ' ORDER BY n.published_on DESC, n.id DESC';
  return queryRows(queryable, sql, params);
}

async function getMediaAlbums(queryable, onlyVisible = true) {
  let sql = `
    SELECT
      a.id,
      a.slug,
      a.title,
      a.card_excerpt,
      a.description,
      a.badge,
      a.cover_image_url,
      a.cover_alt_text,
      a.published_on,
      a.sort_order,
      a.is_visible,
      t.slug AS tournament_slug,
      t.name AS tournament_name,
      COUNT(p.id) AS photos_count
    FROM media_albums a
    LEFT JOIN tournaments t ON t.id = a.tournament_id
    LEFT JOIN media_album_photos p ON p.album_id = a.id
  `;
  if (onlyVisible) sql += ' WHERE a.is_visible = 1';
  sql += ' GROUP BY a.id ORDER BY a.sort_order, a.published_on DESC, a.id';
  return queryRows(queryable, sql);
}

async function getMediaAlbumBySlug(queryable, slug) {
  return queryOne(queryable, `
    SELECT
      a.id,
      a.slug,
      a.title,
      a.card_excerpt,
      a.description,
      a.badge,
      a.cover_image_url,
      a.cover_alt_text,
      a.published_on,
      a.sort_order,
      a.is_visible,
      t.slug AS tournament_slug,
      t.name AS tournament_name
    FROM media_albums a
    LEFT JOIN tournaments t ON t.id = a.tournament_id
    WHERE a.slug = ?
      AND a.is_visible = 1
    LIMIT 1
  `, [slug]);
}

async function getResultsRows(queryable, tournamentSlug = null) {
  let sql = `
    SELECT
      m.stage_name,
      CONCAT(home.name, ' — ', away.name) AS match_label,
      m.home_score,
      m.away_score,
      m.sort_order,
      t.slug AS tournament_slug
    FROM matches m
    JOIN tournaments t ON t.id = m.tournament_id
    JOIN clubs home ON home.id = m.home_club_id
    JOIN clubs away ON away.id = m.away_club_id
    WHERE m.status = 'done'
  `;
  const params = [];
  if (tournamentSlug) {
    sql += ' AND t.slug = ?';
    params.push(tournamentSlug);
  }
  sql += ' ORDER BY m.sort_order, m.match_date, m.match_time, m.id';
  return queryRows(queryable, sql, params);
}

async function getAdminTournaments(queryable) {
  const rows = await getTournamentsSummary(queryable);
  return rows.map(row => ({
    slug: row.slug,
    name: row.name,
    season_year: row.season_year,
    short_label: row.short_label || '',
    status: row.status,
    location: row.location || '',
    start_date: normalizeDate(row.start_date),
    end_date: normalizeDate(row.end_date),
    logo: row.logo_path || '',
    hero_image: row.hero_image_url || '',
    description: row.description || '',
    is_featured: row.is_featured === 1,
    countdown_enabled: row.countdown_enabled !== 0,
    standings_mode: row.standings_mode || 'auto',
    playoff_mode: row.playoff_mode || 'auto',
  }));
}

async function getAdminClubs(queryable) {
  const rows = await queryRows(queryable, `
    SELECT slug, name, short_name, country, city, founded_year, logo_path,
           website_url, hero_image_url, description, is_active
    FROM clubs
    ORDER BY CASE WHEN slug LIKE 'placeholder-team-%' THEN 1 ELSE 0 END, name
  `);
  return rows.map(row => ({
    slug: row.slug,
    name: row.name,
    short_name: row.short_name || '',
    country: row.country || '',
    city: row.city || '',
    founded_year: row.founded_year || '',
    logo: row.logo_path || '',
    website_url: row.website_url || '',
    hero_image: row.hero_image_url || '',
    description: row.description || '',
    is_active: row.is_active === 1,
  }));
}

async function getAdminMatches(queryable) {
  const { rows } = await queryMatches(queryable, null);
  return rows.map(row => ({
    id: Number(row.id),
    tournament_slug: row.tournament_slug,
    date: normalizeDate(row.match_date),
    time: normalizeTime(row.match_time),
    status: row.status,
    status_label: row.status_label,
    home_team: row.home_team,
    home_team_slug: row.home_team_slug,
    home_logo: row.home_logo || '',
    away_team: row.away_team,
    away_team_slug: row.away_team_slug,
    away_logo: row.away_logo || '',
    score: `${parseInteger(row.home_score, 0)}:${parseInteger(row.away_score, 0)}`,
    group: row.stage_name || '',
    round: row.round_name || '',
    matchday: row.matchday_label || '',
    venue: row.venue || '',
    video: row.video_url || '',
    review_video: row.review_video_url || '',
    interview_video: row.interview_video_url || '',
    is_featured_media: row.is_featured_media === 1,
    summary: row.summary || '',
  }));
}

async function getAdminNews(queryable) {
  const rows = await getNewsRows(queryable, null, true);
  const photoMap = await getNewsArticlePhotoMap(queryable, rows.map(row => Number(row.id)));
  return rows.map(row => mapNewsArticleRow(row, photoMap.get(Number(row.id)) || []));
}

async function getAdminPartners(queryable) {
  await ensurePartnerLogoAssetMetadataColumns(queryable);
  const rows = await queryRows(queryable, `
    SELECT
      p.slug,
      p.name,
      COALESCE(pc.slug, 'general') AS category_slug,
      t.slug AS tournament_slug,
      p.website_url,
      COALESCE(pla.image_url, '') AS logo_url,
      COALESCE(pla.alt_text, p.name) AS alt_text,
      COALESCE(pla.storage_provider, '') AS logo_storage_provider,
      COALESCE(pla.public_id, '') AS logo_public_id,
      COALESCE(pla.file_name, '') AS logo_file_name,
      COALESCE(pla.mime_type, '') AS logo_mime_type,
      COALESCE(pla.asset_format, '') AS logo_format,
      pla.width AS logo_width,
      pla.height AS logo_height,
      pla.bytes AS logo_bytes,
      tp.sort_order,
      tp.is_visible,
      p.description
    FROM partners p
    LEFT JOIN tournament_partners tp ON tp.partner_id = p.id
    LEFT JOIN tournaments t ON t.id = tp.tournament_id
    LEFT JOIN partner_categories pc ON pc.id = tp.category_id
    LEFT JOIN partner_logo_assets pla ON pla.partner_id = p.id AND pla.is_current = 1
    ORDER BY COALESCE(pc.slug, 'general'), tp.sort_order, p.name
  `);
  return rows.map(row => ({
    slug: row.slug,
    name: row.name,
    category: row.category_slug || 'general',
    tournament_slug: row.tournament_slug || '',
    website_url: row.website_url || '',
    logo_url: row.logo_url || '',
    alt_text: row.alt_text || row.name,
    logo_storage_provider: row.logo_storage_provider || '',
    logo_public_id: row.logo_public_id || '',
    logo_file_name: row.logo_file_name || '',
    logo_mime_type: row.logo_mime_type || '',
    logo_format: row.logo_format || '',
    logo_width: row.logo_width == null ? null : parseInteger(row.logo_width, null),
    logo_height: row.logo_height == null ? null : parseInteger(row.logo_height, null),
    logo_bytes: row.logo_bytes == null ? null : parseInteger(row.logo_bytes, null),
    sort_order: parseInteger(row.sort_order, 0),
    is_visible: row.is_visible !== 0,
    note: row.description || '',
  }));
}

async function getAdminStandings(queryable) {
  const currentTournament = await getTargetTournament(queryable, null);
  const archiveRows = await queryRows(queryable, `
    SELECT
      t.slug AS tournament_slug,
      t.name AS tournament_name,
      t.season_year,
      ts.group_name,
      ts.position,
      ts.played,
      ts.won,
      ts.drawn,
      ts.lost,
      ts.goals_for,
      ts.goals_against,
      ts.points,
      c.slug AS team_slug,
      c.name AS team_name,
      c.logo_path AS team_logo
    FROM tournament_standings ts
    JOIN tournaments t ON t.id = ts.tournament_id
    JOIN clubs c ON c.id = ts.club_id
    ORDER BY t.season_year DESC, t.slug, ts.group_name, ts.position, c.name
  `);
  const archiveItems = archiveRows
    .filter(row => !currentTournament || row.tournament_slug !== currentTournament.slug)
    .map(row => ({
      tournament_slug: row.tournament_slug,
      tournament_name: row.tournament_name,
      season_year: row.season_year,
      group_name: row.group_name || '',
      position: parseInteger(row.position, 0),
      played: parseInteger(row.played, 0),
      won: parseInteger(row.won, 0),
      drawn: parseInteger(row.drawn, 0),
      lost: parseInteger(row.lost, 0),
      goals_for: parseInteger(row.goals_for, 0),
      goals_against: parseInteger(row.goals_against, 0),
      points: parseInteger(row.points, 0),
      team_slug: row.team_slug || '',
      team: row.team_name || '',
      logo: row.team_logo || '',
    }));

  if (!currentTournament) return archiveItems;
  const currentRows = await getStandingsRows(queryable, currentTournament.slug);
  const currentItems = currentRows.map(row => ({
    tournament_slug: currentTournament.slug,
    tournament_name: currentTournament.name,
    season_year: currentTournament.season_year,
    group_name: row.group_name || row.group || '',
    position: parseInteger(row.position, 0),
    played: parseInteger(row.played, 0),
    won: parseInteger(row.won, 0),
    drawn: parseInteger(row.drawn, 0),
    lost: parseInteger(row.lost, 0),
    goals_for: parseInteger(row.goals_for, 0),
    goals_against: parseInteger(row.goals_against, 0),
    points: parseInteger(row.points, 0),
    team_slug: row.team_slug || row.slug || '',
    team: row.team || '',
    logo: row.logo || '',
  }));
  return [...archiveItems, ...currentItems];
}

async function getAdminPlayoff(queryable) {
  const currentTournament = await getTargetTournament(queryable, null);
  if (!currentTournament) return [];
  return getPlayoffRows(queryable, currentTournament.slug);
}

async function getAdminAlbums(queryable) {
  const rows = await getMediaAlbums(queryable, false);
  const photoMap = await getMediaAlbumPhotoMap(queryable, rows.map(row => Number(row.id)));
  return rows.map(row => ({
    slug: row.slug,
    title: row.title,
    tournament_slug: row.tournament_slug || '',
    published_on: normalizeDate(row.published_on),
    badge: row.badge || 'Фотоальбом',
    cover_image_url: row.cover_image_url || '',
    cover_alt_text: row.cover_alt_text || row.title,
    card_excerpt: row.card_excerpt || '',
    description: row.description || '',
    sort_order: parseInteger(row.sort_order, 0),
    is_visible: row.is_visible !== 0,
    photos: photoMap.get(Number(row.id)) || [],
  }));
}

async function getAdminPages(queryable) {
  const columns = await getSitePagesColumns(queryable);
  const selectColumns = ['slug', 'title'];
  if (columns.has('subtitle')) selectColumns.push('subtitle');
  if (columns.has('body_html')) selectColumns.push('body_html');
  if (columns.has('content_html')) selectColumns.push('content_html');
  if (columns.has('content_json')) selectColumns.push('content_json');

  const rows = await queryRows(queryable, `
    SELECT ${selectColumns.join(', ')}
    FROM site_pages
    ORDER BY slug ASC
  `);
  return rows.map(normalizeSitePageRow);
}

async function clearTable(queryable, tableName) {
  await queryable.query(`DELETE FROM \`${tableName}\``);
}

async function deleteNotIn(queryable, tableName, columnName, values) {
  if (!values.length) {
    await clearTable(queryable, tableName);
    return;
  }
  await queryable.query(`DELETE FROM \`${tableName}\` WHERE \`${columnName}\` NOT IN (${sqlInPlaceholders(values)})`, values);
}

async function loadSlugMap(queryable, tableName) {
  const rows = await queryRows(queryable, `SELECT id, slug FROM \`${tableName}\``);
  return new Map(rows.map(row => [row.slug, Number(row.id)]));
}

async function replaceTournaments(queryable, payload) {
  const items = ensureArray(payload);
  const slugs = [];
  await queryable.query('UPDATE tournaments SET is_featured = 0');
  for (const item of items) {
    const slug = normalizeString(item.slug);
    const name = normalizeString(item.name);
    if (!slug || !name) throw new Error('Each tournament must have slug and name');
    slugs.push(slug);
    await execute(queryable, `
      INSERT INTO tournaments (
        slug, name, season_year, short_label, logo_path, hero_image_url, description,
        start_date, end_date, location, status, is_featured, countdown_enabled,
        standings_mode, playoff_mode
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        name = VALUES(name),
        season_year = VALUES(season_year),
        short_label = VALUES(short_label),
        logo_path = VALUES(logo_path),
        hero_image_url = VALUES(hero_image_url),
        description = VALUES(description),
        start_date = VALUES(start_date),
        end_date = VALUES(end_date),
        location = VALUES(location),
        status = VALUES(status),
        is_featured = VALUES(is_featured),
        countdown_enabled = VALUES(countdown_enabled),
        standings_mode = VALUES(standings_mode),
        playoff_mode = VALUES(playoff_mode)
    `, [
      slug,
      name,
      item.season_year ? parseInteger(item.season_year, null) : null,
      nullIfEmpty(item.short_label),
      nullIfEmpty(item.logo),
      nullIfEmpty(item.hero_image),
      normalizeString(item.description),
      nullIfEmpty(item.start_date),
      nullIfEmpty(item.end_date),
      nullIfEmpty(item.location),
      normalizeString(item.status) || 'draft',
      parseBoolean(item.is_featured, false) ? 1 : 0,
      parseBoolean(item.countdown_enabled, true) ? 1 : 0,
      normalizeString(item.standings_mode) || 'auto',
      normalizeString(item.playoff_mode) || 'auto',
    ]);
  }
  await deleteNotIn(queryable, 'tournaments', 'slug', slugs);
}

async function replaceClubs(queryable, payload) {
  const items = ensureArray(payload);
  const slugs = [];
  for (const item of items) {
    const slug = normalizeString(item.slug);
    const name = normalizeString(item.name);
    const logo = normalizeString(item.logo);
    if (!slug || !name || !logo) throw new Error('Each club must have slug, name and logo');
    slugs.push(slug);
    await execute(queryable, `
      INSERT INTO clubs (
        slug, name, short_name, logo_path, country, city, founded_year,
        website_url, hero_image_url, description, is_active
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        name = VALUES(name),
        short_name = VALUES(short_name),
        logo_path = VALUES(logo_path),
        country = VALUES(country),
        city = VALUES(city),
        founded_year = VALUES(founded_year),
        website_url = VALUES(website_url),
        hero_image_url = VALUES(hero_image_url),
        description = VALUES(description),
        is_active = VALUES(is_active)
    `, [
      slug,
      name,
      nullIfEmpty(item.short_name),
      logo,
      nullIfEmpty(item.country),
      nullIfEmpty(item.city),
      item.founded_year ? parseInteger(item.founded_year, null) : null,
      nullIfEmpty(item.website_url),
      nullIfEmpty(item.hero_image),
      normalizeString(item.description),
      parseBoolean(item.is_active, true) ? 1 : 0,
    ]);
  }
  await deleteNotIn(queryable, 'clubs', 'slug', slugs);
}

async function replaceMatches(queryable, payload) {
  const items = ensureArray(payload);
  const tournamentMap = await loadSlugMap(queryable, 'tournaments');
  const clubMap = await loadSlugMap(queryable, 'clubs');
  const ids = [];
  for (const item of items) {
    const id = parseInteger(item.id, 0);
    if (!id) throw new Error('Each match must have numeric id');
    const tournamentId = tournamentMap.get(normalizeString(item.tournament_slug));
    const homeClubId = clubMap.get(normalizeString(item.home_team_slug));
    const awayClubId = clubMap.get(normalizeString(item.away_team_slug));
    if (!tournamentId || !homeClubId || !awayClubId) {
      throw new Error(`Match references missing tournament or clubs: ${id}`);
    }
    const score = parseScore(item.score);
    ids.push(id);
    await execute(queryable, `
      INSERT INTO matches (
        id, tournament_id, stage_name, round_name, matchday_label, match_date, match_time,
        status, status_label, home_club_id, away_club_id, home_score, away_score,
        venue, video_url, review_video_url, interview_video_url, is_featured_media, summary, sort_order
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        tournament_id = VALUES(tournament_id),
        stage_name = VALUES(stage_name),
        round_name = VALUES(round_name),
        matchday_label = VALUES(matchday_label),
        match_date = VALUES(match_date),
        match_time = VALUES(match_time),
        status = VALUES(status),
        status_label = VALUES(status_label),
        home_club_id = VALUES(home_club_id),
        away_club_id = VALUES(away_club_id),
        home_score = VALUES(home_score),
        away_score = VALUES(away_score),
        venue = VALUES(venue),
        video_url = VALUES(video_url),
        review_video_url = VALUES(review_video_url),
        interview_video_url = VALUES(interview_video_url),
        is_featured_media = VALUES(is_featured_media),
        summary = VALUES(summary),
        sort_order = VALUES(sort_order)
    `, [
      id,
      tournamentId,
      nullIfEmpty(item.group),
      nullIfEmpty(item.round),
      nullIfEmpty(item.matchday),
      nullIfEmpty(item.date),
      nullIfEmpty(item.time),
      normalizeString(item.status) || 'soon',
      normalizeString(item.status_label) || '',
      homeClubId,
      awayClubId,
      score.home,
      score.away,
      nullIfEmpty(item.venue),
      nullIfEmpty(item.video),
      nullIfEmpty(item.review_video),
      nullIfEmpty(item.interview_video),
      parseBoolean(item.is_featured_media, false) ? 1 : 0,
      normalizeString(item.summary),
      parseInteger(item.sort_order, ids.length),
    ]);

    await queryable.query('DELETE FROM match_events WHERE match_id = ?', [id]);
    const events = ensureArray(item.events);
    for (let index = 0; index < events.length; index += 1) {
      const event = events[index] || {};
      await execute(queryable, `
        INSERT INTO match_events (
          match_id, sort_order, minute_label, event_type, title, description
        )
        VALUES (?, ?, ?, ?, ?, ?)
      `, [
        id,
        parseInteger(event.sort_order, index + 1),
        nullIfEmpty(event.minute),
        normalizeString(event.type) || 'note',
        nullIfEmpty(event.title),
        normalizeString(event.description),
      ]);
    }
  }
  await deleteNotIn(queryable, 'matches', 'id', ids);
}

async function replaceNews(queryable, payload) {
  await ensureNewsArticlePhotosTable(queryable);
  await ensureNewsArticleVideoColumn(queryable);
  await ensureNewsArticleBodyHtmlColumn(queryable);
  const items = ensureArray(payload);
  const tournamentMap = await loadSlugMap(queryable, 'tournaments');
  const ids = [];
  for (const item of items) {
    const id = parseInteger(item.id, 0);
    if (!id) throw new Error('Each news item must have numeric id');
    ids.push(id);
    const tournamentSlug = normalizeString(item.tournament_slug);
    const tournamentId = tournamentSlug ? (tournamentMap.get(tournamentSlug) || null) : null;
    await execute(queryable, `
      INSERT INTO news_articles (
        id, tournament_id, slug, published_on, title, excerpt, body, body_html,
        link_path, image_url, video_url, is_published
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        tournament_id = VALUES(tournament_id),
        slug = VALUES(slug),
        published_on = VALUES(published_on),
        title = VALUES(title),
        excerpt = VALUES(excerpt),
        body = VALUES(body),
        body_html = VALUES(body_html),
        link_path = VALUES(link_path),
        image_url = VALUES(image_url),
        video_url = VALUES(video_url),
        is_published = VALUES(is_published)
    `, [
      id,
      tournamentId,
      normalizeString(item.slug) || slugify(item.title) || `news-${id}`,
      nullIfEmpty(item.date),
      normalizeString(item.title),
      normalizeString(item.excerpt),
      normalizeString(item.body),
      normalizeHtmlString(item.body_html),
      normalizeString(item.link) || '',
      nullIfEmpty(item.image),
      nullIfEmpty(item.video_url),
      parseBoolean(item.is_published, true) ? 1 : 0,
    ]);
    await queryable.query('DELETE FROM news_article_photos WHERE news_article_id = ?', [id]);
    const photos = ensureArray(item.photos).filter(photo => normalizeString(photo?.image_url));
    for (let index = 0; index < photos.length; index += 1) {
      const photo = photos[index];
      await execute(queryable, `
        INSERT INTO news_article_photos (news_article_id, image_url, alt_text, sort_order)
        VALUES (?, ?, ?, ?)
      `, [
        id,
        normalizeString(photo.image_url),
        normalizeString(photo.alt_text),
        parseInteger(photo.sort_order, index + 1),
      ]);
    }
  }
  await deleteNotIn(queryable, 'news_articles', 'id', ids);
}

async function ensurePartnerCategory(queryable, slug) {
  const categorySlug = normalizeString(slug) || 'general';
  const categoryName = CATEGORY_NAMES[categorySlug] || categorySlug;
  await execute(queryable, `
    INSERT INTO partner_categories (slug, name)
    VALUES (?, ?)
    ON DUPLICATE KEY UPDATE
      name = VALUES(name)
  `, [categorySlug, categoryName]);
  const row = await queryOne(queryable, 'SELECT id FROM partner_categories WHERE slug = ? LIMIT 1', [categorySlug]);
  return Number(row.id);
}

async function setPartnerLogo(queryable, partnerId, item, partnerName) {
  await queryable.query('DELETE FROM partner_logo_assets WHERE partner_id = ?', [partnerId]);
  const logoUrl = normalizeString(item.logo_url);
  if (!logoUrl) return null;
  const result = await execute(queryable, `
    INSERT INTO partner_logo_assets (
      partner_id, image_url, alt_text, storage_provider, public_id, file_name,
      mime_type, asset_format, width, height, bytes, is_current
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
  `, [
    partnerId,
    logoUrl,
    normalizeString(item.alt_text || partnerName),
    nullIfEmpty(item.logo_storage_provider),
    nullIfEmpty(item.logo_public_id),
    nullIfEmpty(item.logo_file_name),
    nullIfEmpty(item.logo_mime_type),
    nullIfEmpty(item.logo_format),
    item.logo_width == null ? null : parseInteger(item.logo_width, null),
    item.logo_height == null ? null : parseInteger(item.logo_height, null),
    item.logo_bytes == null ? null : parseInteger(item.logo_bytes, null),
  ]);
  return Number(result.insertId);
}

async function replacePartners(queryable, payload) {
  await ensurePartnerLogoAssetMetadataColumns(queryable);
  const items = ensureArray(payload);
  const tournamentMap = await loadSlugMap(queryable, 'tournaments');
  const slugs = [];
  await clearTable(queryable, 'tournament_partners');
  for (const item of items) {
    const slug = normalizeString(item.slug);
    const name = normalizeString(item.name);
    if (!slug || !name) throw new Error('Each partner must have slug and name');
    slugs.push(slug);
    await execute(queryable, `
      INSERT INTO partners (slug, name, website_url, description, is_active)
      VALUES (?, ?, ?, ?, 1)
      ON DUPLICATE KEY UPDATE
        name = VALUES(name),
        website_url = VALUES(website_url),
        description = VALUES(description),
        is_active = VALUES(is_active)
    `, [slug, name, nullIfEmpty(item.website_url), normalizeString(item.note)]);
    const partnerRow = await queryOne(queryable, 'SELECT id FROM partners WHERE slug = ? LIMIT 1', [slug]);
    const partnerId = Number(partnerRow.id);
    const categoryId = await ensurePartnerCategory(queryable, item.category);
    const logoAssetId = await setPartnerLogo(queryable, partnerId, item, name);
    const tournamentSlug = normalizeString(item.tournament_slug);
    const tournamentId = tournamentSlug ? (tournamentMap.get(tournamentSlug) || null) : null;
    if (tournamentSlug && !tournamentId) throw new Error(`Tournament not found for partner: ${tournamentSlug}`);
    await execute(queryable, `
      INSERT INTO tournament_partners (
        tournament_id, partner_id, category_id, logo_asset_id, sort_order, is_visible
      )
      VALUES (?, ?, ?, ?, ?, ?)
    `, [
      tournamentId,
      partnerId,
      categoryId,
      logoAssetId,
      parseInteger(item.sort_order, 0),
      parseBoolean(item.is_visible, true) ? 1 : 0,
    ]);
  }
  await deleteNotIn(queryable, 'partners', 'slug', slugs);
}

async function replaceStandings(queryable, payload) {
  const items = ensureArray(payload);
  const tournamentMap = await loadSlugMap(queryable, 'tournaments');
  const clubMap = await loadSlugMap(queryable, 'clubs');
  await clearTable(queryable, 'tournament_standings');
  for (const item of items) {
    const tournamentId = tournamentMap.get(normalizeString(item.tournament_slug));
    const clubId = clubMap.get(normalizeString(item.team_slug));
    if (!tournamentId || !clubId) throw new Error('Standings row references missing tournament or club');
    await execute(queryable, `
      INSERT INTO tournament_standings (
        tournament_id, club_id, group_name, position, played, won, drawn, lost,
        goals_for, goals_against, points
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      tournamentId,
      clubId,
      normalizeString(item.group_name) || 'overall',
      parseInteger(item.position, 0),
      parseInteger(item.played, 0),
      parseInteger(item.won, 0),
      parseInteger(item.drawn, 0),
      parseInteger(item.lost, 0),
      parseInteger(item.goals_for, 0),
      parseInteger(item.goals_against, 0),
      parseInteger(item.points, 0),
    ]);
  }
}

async function replacePlayoff(queryable, payload) {
  const currentTournament = await getTargetTournament(queryable, null);
  if (!currentTournament) throw new Error('Current tournament not found');
  const clubMap = await loadSlugMap(queryable, 'clubs');
  await queryable.query('DELETE FROM tournament_playoff_matches WHERE tournament_id = ?', [Number(currentTournament.id)]);
  for (const item of ensureArray(payload)) {
    await execute(queryable, `
      INSERT INTO tournament_playoff_matches (
        tournament_id, bracket_group, round_group, match_key, sort_order, label,
        home_club_id, away_club_id, home_label, away_label, home_logo_path, away_logo_path,
        home_score, away_score
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      Number(currentTournament.id),
      normalizeString(item.bracket_group) || 'top',
      normalizeString(item.round_group) || 'semifinal',
      normalizeString(item.match_key),
      parseInteger(item.sort_order, 0),
      normalizeString(item.label),
      clubMap.get(normalizeString(item.home_team_slug)) || null,
      clubMap.get(normalizeString(item.away_team_slug)) || null,
      normalizeString(item.home_team),
      normalizeString(item.away_team),
      nullIfEmpty(item.home_logo),
      nullIfEmpty(item.away_logo),
      parseInteger(item.home_score, 0),
      parseInteger(item.away_score, 0),
    ]);
  }
}

async function replaceAlbums(queryable, payload) {
  const items = ensureArray(payload);
  const tournamentMap = await loadSlugMap(queryable, 'tournaments');
  const slugs = [];
  for (const item of items) {
    const slug = normalizeString(item.slug) || slugify(item.title);
    const title = normalizeString(item.title);
    if (!slug || !title) throw new Error('Each album must have slug and title');
    slugs.push(slug);
    const tournamentSlug = normalizeString(item.tournament_slug);
    const tournamentId = tournamentSlug ? (tournamentMap.get(tournamentSlug) || null) : null;
    await execute(queryable, `
      INSERT INTO media_albums (
        tournament_id, slug, title, card_excerpt, description, badge,
        cover_image_url, cover_alt_text, published_on, sort_order, is_visible
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        tournament_id = VALUES(tournament_id),
        title = VALUES(title),
        card_excerpt = VALUES(card_excerpt),
        description = VALUES(description),
        badge = VALUES(badge),
        cover_image_url = VALUES(cover_image_url),
        cover_alt_text = VALUES(cover_alt_text),
        published_on = VALUES(published_on),
        sort_order = VALUES(sort_order),
        is_visible = VALUES(is_visible)
    `, [
      tournamentId,
      slug,
      title,
      normalizeString(item.card_excerpt),
      normalizeString(item.description),
      normalizeString(item.badge) || 'Фотоальбом',
      nullIfEmpty(item.cover_image_url),
      normalizeString(item.cover_alt_text) || title,
      nullIfEmpty(item.published_on),
      parseInteger(item.sort_order, 0),
      parseBoolean(item.is_visible, true) ? 1 : 0,
    ]);
    const albumRow = await queryOne(queryable, 'SELECT id FROM media_albums WHERE slug = ? LIMIT 1', [slug]);
    const albumId = Number(albumRow.id);
    await queryable.query('DELETE FROM media_album_photos WHERE album_id = ?', [albumId]);
    const photos = ensureArray(item.photos).filter(photo => normalizeString(photo?.image_url));
    for (let index = 0; index < photos.length; index += 1) {
      const photo = photos[index];
      await execute(queryable, `
        INSERT INTO media_album_photos (album_id, image_url, alt_text, caption, sort_order)
        VALUES (?, ?, ?, ?, ?)
      `, [
        albumId,
        normalizeString(photo.image_url),
        normalizeString(photo.alt_text),
        normalizeString(photo.caption),
        parseInteger(photo.sort_order, index + 1),
      ]);
    }
  }
  await deleteNotIn(queryable, 'media_albums', 'slug', slugs);
}

async function replacePages(queryable, payload) {
  const columns = await getSitePagesColumns(queryable);
  const items = ensureArray(payload).map(item => ({
    slug: normalizeString(item?.slug),
    title: normalizeString(item?.title),
    subtitle: normalizeString(item?.subtitle),
    body_html: normalizeHtmlString(item?.body_html),
  })).filter(item => item.slug);
  const slugs = items.map(item => item.slug);
  await deleteNotIn(queryable, 'site_pages', 'slug', slugs);
  for (const item of items) {
    const insertColumns = ['slug', 'title'];
    const values = [item.slug, item.title];
    const updates = ['title = VALUES(title)', 'updated_at = CURRENT_TIMESTAMP'];

    if (columns.has('subtitle')) {
      insertColumns.push('subtitle');
      values.push(item.subtitle);
      updates.push('subtitle = VALUES(subtitle)');
    }

    if (columns.has('body_html')) {
      insertColumns.push('body_html');
      values.push(item.body_html);
      updates.push('body_html = VALUES(body_html)');
    }

    if (columns.has('content_html')) {
      insertColumns.push('content_html');
      values.push(item.body_html);
      updates.push('content_html = VALUES(content_html)');
    }

    if (columns.has('content_json')) {
      insertColumns.push('content_json');
      values.push(JSON.stringify({ subtitle: item.subtitle }));
      updates.push('content_json = VALUES(content_json)');
    }

    await execute(queryable, `
      INSERT INTO site_pages (${insertColumns.join(', ')})
      VALUES (${insertColumns.map(() => '?').join(', ')})
      ON DUPLICATE KEY UPDATE
        ${updates.join(', ')}
    `, values);
  }
}

async function loadAdminResource(queryable, resource) {
  switch (resource) {
    case 'tournaments': return getAdminTournaments(queryable);
    case 'clubs': return getAdminClubs(queryable);
    case 'matches': return getAdminMatches(queryable);
    case 'news': return getAdminNews(queryable);
    case 'partners': return getAdminPartners(queryable);
    case 'standings': return getAdminStandings(queryable);
    case 'playoff': return getAdminPlayoff(queryable);
    case 'albums': return getAdminAlbums(queryable);
    case 'pages': return getAdminPages(queryable);
    default: throw new Error('Unknown admin resource');
  }
}

async function saveAdminResource(queryable, resource, payload) {
  switch (resource) {
    case 'tournaments': return replaceTournaments(queryable, payload);
    case 'clubs': return replaceClubs(queryable, payload);
    case 'matches': return replaceMatches(queryable, payload);
    case 'news': return replaceNews(queryable, payload);
    case 'partners': return replacePartners(queryable, payload);
    case 'standings': return replaceStandings(queryable, payload);
    case 'playoff': return replacePlayoff(queryable, payload);
    case 'albums': return replaceAlbums(queryable, payload);
    case 'pages': return replacePages(queryable, payload);
    default: throw new Error('Unknown admin resource');
  }
}

function requireAdminAuth(req, res, next) {
  if (!adminToken) {
    return res.status(503).json({ error: 'ADMIN_TOKEN is not configured on the server' });
  }
  const token = req.get('x-admin-token');
  if (!token || token !== adminToken) {
    return res.status(401).json({ error: 'Admin token is invalid or missing' });
  }
  return next();
}

app.get('/favicon.png', (req, res, next) => {
  if (!fs.existsSync(faviconPngPath)) return next();
  res.sendFile(faviconPngPath);
});

app.get('/favicon.ico', (req, res, next) => {
  if (fs.existsSync(faviconIcoPath)) return res.sendFile(faviconIcoPath);
  if (fs.existsSync(faviconPngPath)) return res.sendFile(faviconPngPath);
  return next();
});

app.use(cors({
  origin(origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins === '*' || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Origin not allowed by CORS'));
  }
}));

app.use(express.json({ limit: '10mb' }));

app.post('/api/admin/session', (req, res) => {
  if (!adminToken) {
    return res.status(503).json({ error: 'ADMIN_TOKEN is not configured on the server' });
  }
  const password = normalizeString(req.body?.password);
  if (!password || password !== adminPassword) {
    return res.status(401).json({ error: 'Invalid admin password' });
  }
  return res.json({ token: adminToken });
});

app.post('/api/translate', async (req, res, next) => {
  try {
    const sourceLang = normalizeString(req.body?.source_lang) || 'ru';
    const targetLang = normalizeString(req.body?.target_lang) || 'en';
    const texts = Array.from(new Set(ensureArray(req.body?.texts).map(normalizeTranslationText).filter(Boolean)));
    if (!texts.length) {
      return res.json({ ok: true, source_lang: sourceLang, target_lang: targetLang, translations: {} });
    }
    const translations = await translateTexts(texts, sourceLang, targetLang);
    return res.json({ ok: true, source_lang: sourceLang, target_lang: targetLang, translations });
  } catch (error) {
    return next(error);
  }
});

app.get('/health', async (req, res, next) => {
  try {
    await pool.query('SELECT 1');
    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
});

app.get('/api/admin/:resource', requireAdminAuth, async (req, res, next) => {
  try {
    const data = await runInTransaction(connection => loadAdminResource(connection, req.params.resource));
    res.json(data);
  } catch (error) {
    if (error.message === 'Unknown admin resource') {
      return res.status(404).json({ error: error.message });
    }
    return next(error);
  }
});

app.put('/api/admin/:resource', requireAdminAuth, async (req, res, next) => {
  try {
    if (!Array.isArray(req.body)) {
      return res.status(400).json({ error: 'Payload must be an array' });
    }
    await runInTransaction(connection => saveAdminResource(connection, req.params.resource, req.body));
    const data = await runInTransaction(connection => loadAdminResource(connection, req.params.resource));
    return res.json({ ok: true, resource: req.params.resource, count: data.length, data });
  } catch (error) {
    if (error.message === 'Unknown admin resource') {
      return res.status(404).json({ error: error.message });
    }
    return next(error);
  }
});

app.get('/api/pages/:slug', async (req, res, next) => {
  try {
    const columns = await getSitePagesColumns(pool);
    const selectColumns = ['slug', 'title'];
    if (columns.has('subtitle')) selectColumns.push('subtitle');
    if (columns.has('body_html')) selectColumns.push('body_html');
    if (columns.has('content_html')) selectColumns.push('content_html');
    if (columns.has('content_json')) selectColumns.push('content_json');

    const row = await queryOne(pool, `
      SELECT ${selectColumns.join(', ')}
      FROM site_pages
      WHERE slug = ?
      LIMIT 1
    `, [req.params.slug]);
    if (!row) {
      return res.json({ slug: req.params.slug, title: '', subtitle: '', body_html: '' });
    }
    return res.json(normalizeSitePageRow(row));
  } catch (error) {
    return next(error);
  }
});

app.post('/api/admin/uploads/image', requireAdminAuth, async (req, res, next) => {
  try {
    const file = typeof req.body?.file === 'string' ? req.body.file.trim() : '';
    const remoteUrl = typeof req.body?.remote_url === 'string' ? req.body.remote_url.trim() : '';
    const folder = normalizeString(req.body?.folder) || 'burcup/uploads';
    const filename = normalizeString(req.body?.filename) || 'image';
    const originalFilename = normalizeString(req.body?.original_filename) || filename;
    const publicId = `${filename}-${Date.now()}`.replace(/[^a-z0-9/_-]+/gi, '-').replace(/-+/g, '-');
    const mimeType = (file.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,/) || [])[1] || '';
    if (!remoteUrl && (!file || !file.startsWith('data:image/'))) {
      return res.status(400).json({ error: 'Image payload must be a data URL or remote URL' });
    }
    const uploaded = await uploadImageToCloudinary({ file: remoteUrl || file, folder, publicId });
    return res.json({
      ok: true,
      url: uploaded.url,
      public_id: uploaded.publicId,
      storage_provider: uploaded.storageProvider,
      file_name: originalFilename,
      mime_type: mimeType,
      width: uploaded.width,
      height: uploaded.height,
      format: uploaded.format,
      bytes: uploaded.bytes,
    });
  } catch (error) {
    return next(error);
  }
});

app.post('/api/admin/uploads/video', requireAdminAuth, async (req, res, next) => {
  try {
    const file = typeof req.body?.file === 'string' ? req.body.file.trim() : '';
    const remoteUrl = typeof req.body?.remote_url === 'string' ? req.body.remote_url.trim() : '';
    const folder = normalizeString(req.body?.folder) || 'burcup/uploads';
    const filename = normalizeString(req.body?.filename) || 'video';
    const originalFilename = normalizeString(req.body?.original_filename) || filename;
    const publicId = `${filename}-${Date.now()}`.replace(/[^a-z0-9/_-]+/gi, '-').replace(/-+/g, '-');
    const mimeType = (file.match(/^data:(video\/[a-zA-Z0-9.+-]+);base64,/) || [])[1] || '';
    if (!remoteUrl && (!file || !file.startsWith('data:video/'))) {
      return res.status(400).json({ error: 'Video payload must be a data URL or remote URL' });
    }
    const uploaded = await uploadVideoToCloudinary({ file: remoteUrl || file, folder, publicId });
    return res.json({
      ok: true,
      url: uploaded.url,
      public_id: uploaded.publicId,
      storage_provider: uploaded.storageProvider,
      resource_type: uploaded.resourceType,
      file_name: originalFilename,
      mime_type: mimeType,
      width: uploaded.width,
      height: uploaded.height,
      format: uploaded.format,
      bytes: uploaded.bytes,
    });
  } catch (error) {
    return next(error);
  }
});

app.post('/api/admin/uploads/image-binary', requireAdminAuth, express.raw({ type: '*/*', limit: '100mb' }), async (req, res, next) => {
  try {
    const folder = normalizeString(req.headers['x-upload-folder']) || 'burcup/uploads';
    const filename = normalizeString(req.headers['x-upload-filename']) || 'image';
    const originalFilename = normalizeString(req.headers['x-upload-original-filename']) || filename;
    const mimeType = normalizeString(req.headers['content-type']) || 'application/octet-stream';
    const publicId = `${filename}-${Date.now()}`.replace(/[^a-z0-9/_-]+/gi, '-').replace(/-+/g, '-');
    if (!req.body || !req.body.length) {
      return res.status(400).json({ error: 'Binary image payload is required' });
    }
    const uploaded = await uploadImageToCloudinary({ file: req.body, folder, publicId, fileName: originalFilename, mimeType });
    return res.json({
      ok: true,
      url: uploaded.url,
      public_id: uploaded.publicId,
      storage_provider: uploaded.storageProvider,
      file_name: originalFilename,
      mime_type: mimeType,
      width: uploaded.width,
      height: uploaded.height,
      format: uploaded.format,
      bytes: uploaded.bytes,
    });
  } catch (error) {
    return next(error);
  }
});

app.post('/api/admin/uploads/video-binary', requireAdminAuth, express.raw({ type: '*/*', limit: '400mb' }), async (req, res, next) => {
  try {
    const folder = normalizeString(req.headers['x-upload-folder']) || 'burcup/uploads';
    const filename = normalizeString(req.headers['x-upload-filename']) || 'video';
    const originalFilename = normalizeString(req.headers['x-upload-original-filename']) || filename;
    const mimeType = normalizeString(req.headers['content-type']) || 'application/octet-stream';
    const publicId = `${filename}-${Date.now()}`.replace(/[^a-z0-9/_-]+/gi, '-').replace(/-+/g, '-');
    if (!req.body || !req.body.length) {
      return res.status(400).json({ error: 'Binary video payload is required' });
    }
    const uploaded = await uploadVideoToCloudinary({ file: req.body, folder, publicId, fileName: originalFilename, mimeType });
    return res.json({
      ok: true,
      url: uploaded.url,
      public_id: uploaded.publicId,
      storage_provider: uploaded.storageProvider,
      resource_type: uploaded.resourceType,
      file_name: originalFilename,
      mime_type: mimeType,
      width: uploaded.width,
      height: uploaded.height,
      format: uploaded.format,
      bytes: uploaded.bytes,
    });
  } catch (error) {
    return next(error);
  }
});

app.post('/api/admin/uploads/raw', requireAdminAuth, async (req, res, next) => {
  try {
    const file = typeof req.body?.file === 'string' ? req.body.file.trim() : '';
    const remoteUrl = typeof req.body?.remote_url === 'string' ? req.body.remote_url.trim() : '';
    const folder = normalizeString(req.body?.folder) || 'burcup/uploads';
    const filename = normalizeString(req.body?.filename) || 'file';
    const originalFilename = normalizeString(req.body?.original_filename) || filename;
    const mimeType = normalizeString(req.body?.mime_type) || 'application/octet-stream';
    const publicId = `${filename}-${Date.now()}`.replace(/[^a-z0-9/_-]+/gi, '-').replace(/-+/g, '-');
    if (!remoteUrl && !file) {
      return res.status(400).json({ error: 'Raw payload must be a data URL, text payload or remote URL' });
    }
    const uploaded = await uploadRawToCloudinary({ file: remoteUrl || file, folder, publicId, fileName: originalFilename, mimeType });
    return res.json({
      ok: true,
      url: uploaded.url,
      public_id: uploaded.publicId,
      storage_provider: uploaded.storageProvider,
      resource_type: uploaded.resourceType,
      file_name: originalFilename,
      mime_type: mimeType,
      format: uploaded.format,
      bytes: uploaded.bytes,
    });
  } catch (error) {
    return next(error);
  }
});

app.post('/api/admin/uploads/raw-binary', requireAdminAuth, express.raw({ type: '*/*', limit: '100mb' }), async (req, res, next) => {
  try {
    const folder = normalizeString(req.headers['x-upload-folder']) || 'burcup/uploads';
    const filename = normalizeString(req.headers['x-upload-filename']) || 'file';
    const originalFilename = normalizeString(req.headers['x-upload-original-filename']) || filename;
    const mimeType = normalizeString(req.headers['content-type']) || 'application/octet-stream';
    const publicId = `${filename}-${Date.now()}`.replace(/[^a-z0-9/_-]+/gi, '-').replace(/-+/g, '-');
    if (!req.body || !req.body.length) {
      return res.status(400).json({ error: 'Binary raw payload is required' });
    }
    const uploaded = await uploadRawToCloudinary({ file: req.body, folder, publicId, fileName: originalFilename, mimeType });
    return res.json({
      ok: true,
      url: uploaded.url,
      public_id: uploaded.publicId,
      storage_provider: uploaded.storageProvider,
      resource_type: uploaded.resourceType,
      file_name: originalFilename,
      mime_type: mimeType,
      format: uploaded.format,
      bytes: uploaded.bytes,
    });
  } catch (error) {
    return next(error);
  }
});

app.get('/api/tournaments', async (req, res, next) => {
  try {
    const rows = await getTournamentsSummary(pool);
    res.json(rows.map(row => ({
      id: Number(row.id),
      slug: row.slug,
      name: row.name,
      season_year: row.season_year,
      short_label: row.short_label || '',
      logo: row.logo_path || '',
      hero_image: row.hero_image_url || '',
      description: row.description || '',
      start_date: normalizeDate(row.start_date),
      end_date: normalizeDate(row.end_date),
      location: row.location || '',
      status: row.status,
      is_featured: row.is_featured === 1,
      countdown_enabled: row.countdown_enabled !== 0,
      standings_mode: row.standings_mode || 'auto',
      playoff_mode: row.playoff_mode || 'auto',
      clubs_count: parseInteger(row.clubs_count, 0),
      matches_count: parseInteger(row.matches_count, 0),
    })));
  } catch (error) {
    next(error);
  }
});

app.get('/api/tournaments/:slug', async (req, res, next) => {
  try {
    const tournament = await getTournamentBySlug(pool, req.params.slug);
    if (!tournament) return res.status(404).json({ error: 'Tournament not found' });
    const [standingsRows, playoffRows, matchesResult, newsRows, partnersRows] = await Promise.all([
      getStandingsRows(pool, req.params.slug),
      getPlayoffRows(pool, req.params.slug),
      queryMatches(pool, req.params.slug),
      getNewsRows(pool, req.params.slug, false),
      getPartnersForTournament(pool, req.params.slug),
    ]);
    const newsPhotoMap = await getNewsArticlePhotoMap(pool, newsRows.map(row => Number(row.id)));
    const groupedPartners = partnersRows.reduce((acc, row) => {
      const key = row.category_slug || 'other';
      if (!acc[key]) acc[key] = { slug: key, name: row.category_name || 'Прочее', items: [] };
      acc[key].items.push({
        slug: row.partner_slug,
        name: row.partner_name,
        website_url: row.website_url || '',
        description: row.description || '',
        logo_url: row.logo_url || '',
        logo_alt: row.logo_alt || row.partner_name,
        sort_order: parseInteger(row.sort_order, 0),
      });
      return acc;
    }, {});

    res.json({
      id: Number(tournament.id),
      slug: tournament.slug,
      name: tournament.name,
      season_year: tournament.season_year,
      short_label: tournament.short_label || '',
      logo: tournament.logo_path || '',
      hero_image: tournament.hero_image_url || '',
      description: tournament.description || '',
      start_date: normalizeDate(tournament.start_date),
      end_date: normalizeDate(tournament.end_date),
      location: tournament.location || '',
      status: tournament.status,
      is_featured: tournament.is_featured === 1,
      countdown_enabled: tournament.countdown_enabled !== 0,
      standings_mode: tournament.standings_mode || 'auto',
      playoff_mode: tournament.playoff_mode || 'auto',
      standings: standingsRows.map(mapStandingsRow),
      playoff: playoffRows,
      matches: matchesResult.rows.map(formatMatchRow),
      news: newsRows.map(row => mapNewsArticleRow(row, newsPhotoMap.get(Number(row.id)) || [])),
      partners: Object.values(groupedPartners),
    });
  } catch (error) {
    next(error);
  }
});

app.get('/api/tournaments/:slug/standings', async (req, res, next) => {
  try {
    const rows = await getStandingsRows(pool, req.params.slug);
    res.json(rows.map(mapStandingsRow));
  } catch (error) {
    next(error);
  }
});

app.get('/api/tournaments/:slug/playoff', async (req, res, next) => {
  try {
    const rows = await getPlayoffRows(pool, req.params.slug);
    res.json(rows);
  } catch (error) {
    next(error);
  }
});

app.get('/api/tournaments/:slug/matches', async (req, res, next) => {
  try {
    const { rows } = await queryMatches(pool, req.params.slug);
    res.json(rows.map(formatMatchRow));
  } catch (error) {
    next(error);
  }
});

app.get('/api/tournaments/:slug/news', async (req, res, next) => {
  try {
    const rows = await getNewsRows(pool, req.params.slug, false);
    const photoMap = await getNewsArticlePhotoMap(pool, rows.map(row => Number(row.id)));
    res.json(rows.map(row => mapNewsArticleRow(row, photoMap.get(Number(row.id)) || [])));
  } catch (error) {
    next(error);
  }
});

app.get('/api/tournaments/:slug/partners', async (req, res, next) => {
  try {
    const rows = await getPartnersForTournament(pool, req.params.slug);
    res.json(rows.map(row => ({
      category_slug: row.category_slug || 'other',
      category_name: row.category_name || 'Прочее',
      slug: row.partner_slug,
      name: row.partner_name,
      website_url: row.website_url || '',
      description: row.description || '',
      logo_url: row.logo_url || '',
      logo_alt: row.logo_alt || row.partner_name,
      sort_order: parseInteger(row.sort_order, 0),
    })));
  } catch (error) {
    next(error);
  }
});

app.get('/api/clubs', async (req, res, next) => {
  try {
    const rows = await getAllClubs(pool);
    res.json(rows.map(row => ({
      id: Number(row.id),
      slug: row.slug,
      name: row.name,
      short_name: row.short_name || '',
      logo: row.logo_path,
      country: row.country || '',
      city: row.city || '',
      founded_year: row.founded_year,
      website_url: row.website_url || '',
      hero_image: row.hero_image_url || '',
      description: row.description || '',
      is_active: row.is_active === 1,
      matches_count: parseInteger(row.matches_count, 0),
    })));
  } catch (error) {
    next(error);
  }
});

app.get('/api/clubs/:slug', async (req, res, next) => {
  try {
    const club = await getClubBySlug(pool, req.params.slug);
    if (!club) return res.status(404).json({ error: 'Club not found' });
    const matchesResult = await queryClubMatches(pool, req.params.slug);
    res.json({
      id: Number(club.id),
      slug: club.slug,
      name: club.name,
      short_name: club.short_name || '',
      logo: club.logo_path,
      country: club.country || '',
      city: club.city || '',
      founded_year: club.founded_year,
      website_url: club.website_url || '',
      hero_image: club.hero_image_url || '',
      description: club.description || '',
      is_active: club.is_active === 1,
      matches: matchesResult.rows.map(formatMatchRow),
    });
  } catch (error) {
    next(error);
  }
});

app.get('/api/clubs/:slug/matches', async (req, res, next) => {
  try {
    const { rows } = await queryClubMatches(pool, req.params.slug);
    res.json(rows.map(formatMatchRow));
  } catch (error) {
    next(error);
  }
});

app.get('/api/standings', async (req, res, next) => {
  try {
    const rows = await getStandingsRows(pool, null);
    res.json(rows.map(mapStandingsRow));
  } catch (error) {
    next(error);
  }
});

app.get('/api/playoff', async (req, res, next) => {
  try {
    const rows = await getPlayoffRows(pool, null);
    res.json(rows);
  } catch (error) {
    next(error);
  }
});

app.get('/api/matches', async (req, res, next) => {
  try {
    const { rows } = await queryMatches(pool, null);
    res.json(rows.map(formatMatchRow));
  } catch (error) {
    next(error);
  }
});

app.get('/api/news', async (req, res, next) => {
  try {
    const rows = await getNewsRows(pool, null, false);
    const photoMap = await getNewsArticlePhotoMap(pool, rows.map(row => Number(row.id)));
    res.json(rows.map(row => mapNewsArticleRow(row, photoMap.get(Number(row.id)) || [])));
  } catch (error) {
    next(error);
  }
});

app.get('/api/media/albums', async (req, res, next) => {
  try {
    const rows = await getMediaAlbums(pool, true);
    res.json(rows.map(row => ({
      slug: row.slug,
      title: row.title,
      tournament_slug: row.tournament_slug || '',
      tournament_name: row.tournament_name || '',
      published_on: normalizeDate(row.published_on),
      badge: row.badge || 'Фотоальбом',
      cover_image_url: row.cover_image_url || '',
      cover_alt_text: row.cover_alt_text || row.title,
      card_excerpt: row.card_excerpt || '',
      description: row.description || '',
      sort_order: parseInteger(row.sort_order, 0),
      photos_count: parseInteger(row.photos_count, 0),
    })));
  } catch (error) {
    next(error);
  }
});

app.get('/api/media/albums/:slug', async (req, res, next) => {
  try {
    const album = await getMediaAlbumBySlug(pool, req.params.slug);
    if (!album) return res.status(404).json({ error: 'Album not found' });
    const photos = await getMediaAlbumPhotoMap(pool, [Number(album.id)]);
    res.json({
      slug: album.slug,
      title: album.title,
      tournament_slug: album.tournament_slug || '',
      tournament_name: album.tournament_name || '',
      published_on: normalizeDate(album.published_on),
      badge: album.badge || 'Фотоальбом',
      cover_image_url: album.cover_image_url || '',
      cover_alt_text: album.cover_alt_text || album.title,
      card_excerpt: album.card_excerpt || '',
      description: album.description || '',
      sort_order: parseInteger(album.sort_order, 0),
      photos: photos.get(Number(album.id)) || [],
    });
  } catch (error) {
    next(error);
  }
});

app.get('/api/results', async (req, res, next) => {
  try {
    const rows = await getResultsRows(pool, null);
    res.json(rows.map(row => ({
      stage: row.stage_name || '',
      match: row.match_label,
      score: `${parseInteger(row.home_score, 0)}:${parseInteger(row.away_score, 0)}`,
      display_order: parseInteger(row.sort_order, 0),
      tournament_slug: row.tournament_slug || '',
    })));
  } catch (error) {
    next(error);
  }
});

if (staticSiteRoot) {
  app.use(express.static(staticSiteRoot, {
    extensions: ['html'],
    index: false,
    maxAge: 0,
    setHeaders(res, filePath) {
      const ext = path.extname(filePath).toLowerCase();
      if (['.html', '.js', '.css'].includes(ext)) {
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        return;
      }
      if (['.webp', '.png', '.jpg', '.jpeg', '.svg', '.ico', '.woff', '.woff2'].includes(ext)) {
        res.setHeader('Cache-Control', 'public, max-age=604800');
      }
    }
  }));
  app.get('/', (req, res) => {
    res.sendFile(path.join(staticSiteRoot, 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    const endpoints = [
      '/health',
      '/api/tournaments',
      '/api/matches',
      '/api/news',
      '/api/clubs',
      '/api/results',
    ];
    res.type('html').send(`<!doctype html>
<html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Burchalkin Cup API</title></head><body><h1>Burchalkin Cup API</h1><ul>${endpoints.map(endpoint => `<li><a href="${endpoint}">${endpoint}</a></li>`).join('')}</ul></body></html>`);
  });
}

app.use((error, req, res, next) => {
  const statusCode = error.message === 'Origin not allowed by CORS'
    ? 403
    : (error.message && error.message.includes('not found') ? 400 : 500);
  console.error(error);
  res.status(statusCode).json({
    error: statusCode === 403 ? 'CORS origin is not allowed' : error.message || 'Internal server error'
  });
});

app.listen(port, () => {
  console.log(`MySQL API is running on port ${port}`);
});
