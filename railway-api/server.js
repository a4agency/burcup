require('dotenv').config();

const crypto = require('crypto');
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const port = Number(process.env.PORT || 3000);
const databaseUrl = process.env.DATABASE_URL;
const adminToken = (process.env.ADMIN_TOKEN || '').trim();
const cloudinaryCloudName = (process.env.CLOUDINARY_CLOUD_NAME || '').trim();
const cloudinaryApiKey = (process.env.CLOUDINARY_API_KEY || '').trim();
const cloudinaryApiSecret = (process.env.CLOUDINARY_API_SECRET || '').trim();

if (!databaseUrl) {
  throw new Error('DATABASE_URL is required');
}

const allowedOrigins = (() => {
  const raw = (process.env.CORS_ORIGIN || '*').trim();
  if (!raw || raw === '*') return '*';
  return raw.split(',').map(item => item.trim()).filter(Boolean);
})();

const pool = new Pool({
  connectionString: databaseUrl,
  ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

const CATEGORY_NAMES = {
  general: 'Партнёры',
  media: 'Информационные партнёры',
  title: 'Титульные партнёры',
  official: 'Официальные партнёры',
};

app.use(cors({
  origin(origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins === '*' || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Origin not allowed by CORS'));
  }
}));

app.use(express.json({ limit: '10mb' }));

function normalizeDate(value) {
  return value || '';
}

function normalizeTime(value) {
  return value || '';
}

function normalizeString(value) {
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

function ensureArray(value) {
  return Array.isArray(value) ? value : [];
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

async function uploadImageToCloudinary({ file, folder, publicId }) {
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
  const body = new URLSearchParams({
    file,
    folder: uploadParams.folder,
    public_id: uploadParams.public_id,
    timestamp: String(timestamp),
    api_key: config.apiKey,
    signature,
  });

  const response = await fetch(`https://api.cloudinary.com/v1_1/${config.cloudName}/image/upload`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
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
  };
}

function formatMatchRow(row) {
  return {
    id: Number(row.id),
    tournament_slug: row.tournament_slug,
    tournament_name: row.tournament_name,
    stage: row.stage_name || '',
    round: row.round_name || '',
    matchday: row.matchday_label || '',
    date: normalizeDate(row.match_date),
    time: normalizeTime(row.match_time),
    status: row.status,
    status_label: row.status_label,
    home_team: row.home_team,
    home_logo: row.home_logo,
    away_team: row.away_team,
    away_logo: row.away_logo,
    home_team_slug: row.home_team_slug,
    away_team_slug: row.away_team_slug,
    score: `${row.home_score}:${row.away_score}`,
    group: row.stage_name || '',
    venue: row.venue || '',
    video: row.video_url || '',
    summary: row.summary || '',
    events: row.events || [],
  };
}

async function runInTransaction(work) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await work(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
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

const tournamentsQuery = `
  SELECT
    t.id,
    t.slug,
    t.name,
    t.season_year,
    t.short_label,
    t.logo_path,
    t.hero_image_url,
    t.description,
    TO_CHAR(t.start_date, 'YYYY-MM-DD') AS start_date,
    TO_CHAR(t.end_date, 'YYYY-MM-DD') AS end_date,
    t.location,
    t.status,
    t.is_featured,
    COUNT(DISTINCT tc.club_id) AS clubs_count,
    COUNT(DISTINCT m.id) AS matches_count
  FROM tournaments t
  LEFT JOIN tournament_clubs tc ON tc.tournament_id = t.id
  LEFT JOIN matches m ON m.tournament_id = t.id
  GROUP BY
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
    t.is_featured
  ORDER BY t.season_year DESC NULLS LAST, t.start_date DESC NULLS LAST, t.id DESC;
`;

const tournamentDetailsQuery = `
  SELECT
    t.id,
    t.slug,
    t.name,
    t.season_year,
    t.short_label,
    t.logo_path,
    t.hero_image_url,
    t.description,
    TO_CHAR(t.start_date, 'YYYY-MM-DD') AS start_date,
    TO_CHAR(t.end_date, 'YYYY-MM-DD') AS end_date,
    t.location,
    t.status,
    t.is_featured
  FROM tournaments t
  WHERE t.slug = $1
  LIMIT 1;
`;

const clubsQuery = `
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
  GROUP BY
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
    c.is_active
  ORDER BY c.name;
`;

const clubDetailsQuery = `
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
    c.is_active
  FROM clubs c
  WHERE c.slug = $1
  LIMIT 1;
`;

const standingsQuery = `
  SELECT
    ts.group_name,
    ts.position,
    ts.played,
    ts.goals_for,
    ts.goals_against,
    ts.points,
    c.name AS team,
    c.logo_path AS logo
  FROM tournament_standings ts
  JOIN clubs c ON c.id = ts.club_id
  JOIN tournaments t ON t.id = ts.tournament_id
  WHERE t.slug = COALESCE($1, (SELECT slug FROM tournaments WHERE is_featured = TRUE ORDER BY season_year DESC NULLS LAST, id DESC LIMIT 1))
  ORDER BY ts.group_name, ts.position;
`;

const matchesQuery = `
  SELECT
    m.id,
    t.slug AS tournament_slug,
    t.name AS tournament_name,
    t.season_year AS tournament_season_year,
    m.stage_name,
    m.round_name,
    m.matchday_label,
    TO_CHAR(m.match_date, 'YYYY-MM-DD') AS match_date,
    TO_CHAR(m.match_time, 'HH24:MI') AS match_time,
    m.status,
    m.status_label,
    home_club.name AS home_team,
    home_club.slug AS home_team_slug,
    home_club.logo_path AS home_logo,
    away_club.name AS away_team,
    away_club.slug AS away_team_slug,
    away_club.logo_path AS away_logo,
    m.home_score,
    m.away_score,
    m.venue,
    m.video_url,
    m.summary,
    COALESCE(
      JSON_AGG(
        JSON_BUILD_OBJECT(
          'minute', me.minute_label,
          'type', me.event_type,
          'title', me.title,
          'description', me.description
        )
        ORDER BY me.sort_order
      ) FILTER (WHERE me.id IS NOT NULL),
      '[]'::json
    ) AS events
  FROM matches m
  JOIN tournaments t ON t.id = m.tournament_id
  JOIN clubs home_club ON home_club.id = m.home_club_id
  JOIN clubs away_club ON away_club.id = m.away_club_id
  LEFT JOIN match_events me ON me.match_id = m.id
  WHERE ($1::text IS NULL OR t.slug = $1)
  GROUP BY
    m.id,
    t.slug,
    t.name,
    t.season_year,
    m.stage_name,
    m.round_name,
    m.matchday_label,
    m.match_date,
    m.match_time,
    m.status,
    m.status_label,
    home_club.name,
    home_club.slug,
    home_club.logo_path,
    away_club.name,
    away_club.slug,
    away_club.logo_path,
    m.home_score,
    m.away_score,
    m.venue,
    m.video_url,
    m.summary
  ORDER BY t.season_year DESC NULLS LAST, m.match_date NULLS FIRST, m.match_time NULLS FIRST, m.sort_order, m.id;
`;

const clubMatchesQuery = `
  SELECT
    m.id,
    t.slug AS tournament_slug,
    t.name AS tournament_name,
    m.stage_name,
    m.round_name,
    m.matchday_label,
    TO_CHAR(m.match_date, 'YYYY-MM-DD') AS match_date,
    TO_CHAR(m.match_time, 'HH24:MI') AS match_time,
    m.status,
    m.status_label,
    home_club.name AS home_team,
    home_club.slug AS home_team_slug,
    home_club.logo_path AS home_logo,
    away_club.name AS away_team,
    away_club.slug AS away_team_slug,
    away_club.logo_path AS away_logo,
    m.home_score,
    m.away_score,
    m.venue,
    m.video_url,
    m.summary,
    COALESCE(
      JSON_AGG(
        JSON_BUILD_OBJECT(
          'minute', me.minute_label,
          'type', me.event_type,
          'title', me.title,
          'description', me.description
        )
        ORDER BY me.sort_order
      ) FILTER (WHERE me.id IS NOT NULL),
      '[]'::json
    ) AS events
  FROM matches m
  JOIN tournaments t ON t.id = m.tournament_id
  JOIN clubs club ON club.slug = $1
  JOIN clubs home_club ON home_club.id = m.home_club_id
  JOIN clubs away_club ON away_club.id = m.away_club_id
  LEFT JOIN match_events me ON me.match_id = m.id
  WHERE club.id IN (m.home_club_id, m.away_club_id)
  GROUP BY
    m.id,
    t.slug,
    t.name,
    m.stage_name,
    m.round_name,
    m.matchday_label,
    m.match_date,
    m.match_time,
    m.status,
    m.status_label,
    home_club.name,
    home_club.slug,
    home_club.logo_path,
    away_club.name,
    away_club.slug,
    away_club.logo_path,
    m.home_score,
    m.away_score,
    m.venue,
    m.video_url,
    m.summary,
    club.id
  ORDER BY m.match_date DESC NULLS LAST, m.match_time DESC NULLS LAST, m.id DESC;
`;

const newsQuery = `
  SELECT
    n.id,
    t.slug AS tournament_slug,
    t.name AS tournament_name,
    n.slug,
    TO_CHAR(n.published_on, 'YYYY-MM-DD') AS published_on,
    n.title,
    n.excerpt,
    n.body,
    n.link_path,
    n.image_url,
    n.is_published
  FROM news_articles n
  LEFT JOIN tournaments t ON t.id = n.tournament_id
  WHERE n.is_published = TRUE
    AND ($1::text IS NULL OR t.slug = $1)
  ORDER BY n.published_on DESC NULLS LAST, n.id DESC;
`;

const adminNewsQuery = `
  SELECT
    n.id,
    t.slug AS tournament_slug,
    n.slug,
    TO_CHAR(n.published_on, 'YYYY-MM-DD') AS published_on,
    n.title,
    n.excerpt,
    n.body,
    n.link_path,
    n.image_url,
    n.is_published
  FROM news_articles n
  LEFT JOIN tournaments t ON t.id = n.tournament_id
  ORDER BY n.published_on DESC NULLS LAST, n.id DESC;
`;

const resultsQuery = `
  SELECT
    m.stage_name,
    CONCAT(home_club.name, ' — ', away_club.name) AS match_label,
    m.home_score,
    m.away_score,
    m.sort_order,
    t.slug AS tournament_slug
  FROM matches m
  JOIN tournaments t ON t.id = m.tournament_id
  JOIN clubs home_club ON home_club.id = m.home_club_id
  JOIN clubs away_club ON away_club.id = m.away_club_id
  WHERE m.status = 'done'
    AND ($1::text IS NULL OR t.slug = $1)
  ORDER BY m.sort_order, m.match_date NULLS FIRST, m.match_time NULLS FIRST, m.id;
`;

const tournamentPartnersQuery = `
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
  WHERE tp.is_visible = TRUE
    AND t.slug = $1
  ORDER BY pc.name, tp.sort_order, p.name;
`;

const adminPartnersQuery = `
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
  LEFT JOIN partner_logo_assets pla ON pla.partner_id = p.id AND pla.is_current = TRUE
  ORDER BY COALESCE(pc.slug, 'general'), tp.sort_order, p.name;
`;

async function getAdminTournaments(client) {
  const { rows } = await client.query(`
    SELECT
      slug,
      name,
      season_year,
      short_label,
      status,
      location,
      TO_CHAR(start_date, 'YYYY-MM-DD') AS start_date,
      TO_CHAR(end_date, 'YYYY-MM-DD') AS end_date,
      logo_path,
      hero_image_url,
      description,
      is_featured
    FROM tournaments
    ORDER BY season_year DESC NULLS LAST, start_date DESC NULLS LAST, id DESC;
  `);

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
    is_featured: row.is_featured,
  }));
}

async function getAdminClubs(client) {
  const { rows } = await client.query(`
    SELECT
      slug,
      name,
      short_name,
      country,
      city,
      founded_year,
      logo_path,
      website_url,
      hero_image_url,
      description,
      is_active
    FROM clubs
    ORDER BY name;
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
    is_active: row.is_active,
  }));
}

async function getAdminMatches(client) {
  const { rows } = await client.query(matchesQuery, [null]);
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
    score: `${row.home_score}:${row.away_score}`,
    group: row.stage_name || '',
    round: row.round_name || '',
    matchday: row.matchday_label || '',
    venue: row.venue || '',
    video: row.video_url || '',
    summary: row.summary || '',
  }));
}

async function getAdminNews(client) {
  const { rows } = await client.query(adminNewsQuery);
  return rows.map(row => ({
    id: Number(row.id),
    tournament_slug: row.tournament_slug || '',
    slug: row.slug || '',
    date: normalizeDate(row.published_on),
    title: row.title,
    excerpt: row.excerpt,
    body: row.body || '',
    link: row.link_path,
    image: row.image_url || '',
    is_published: row.is_published,
  }));
}

async function getAdminPartners(client) {
  const { rows } = await client.query(adminPartnersQuery);
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
    is_visible: row.is_visible,
    note: row.description || '',
  }));
}

async function replaceTournaments(client, payload) {
  const items = ensureArray(payload);
  const slugs = [];

  await client.query('UPDATE tournaments SET is_featured = FALSE');

  for (const item of items) {
    const slug = normalizeString(item.slug);
    const name = normalizeString(item.name);
    if (!slug || !name) {
      throw new Error('Each tournament must have slug and name');
    }
    slugs.push(slug);
    await client.query(`
      INSERT INTO tournaments (
        slug,
        name,
        season_year,
        short_label,
        logo_path,
        hero_image_url,
        description,
        start_date,
        end_date,
        location,
        status,
        is_featured
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
      ON CONFLICT (slug) DO UPDATE
      SET
        name = EXCLUDED.name,
        season_year = EXCLUDED.season_year,
        short_label = EXCLUDED.short_label,
        logo_path = EXCLUDED.logo_path,
        hero_image_url = EXCLUDED.hero_image_url,
        description = EXCLUDED.description,
        start_date = EXCLUDED.start_date,
        end_date = EXCLUDED.end_date,
        location = EXCLUDED.location,
        status = EXCLUDED.status,
        is_featured = EXCLUDED.is_featured
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
      parseBoolean(item.is_featured, false),
    ]);
  }

  if (slugs.length) {
    await client.query('DELETE FROM tournaments WHERE NOT (slug = ANY($1::text[]))', [slugs]);
  } else {
    await client.query('DELETE FROM tournaments');
  }
}

async function replaceClubs(client, payload) {
  const items = ensureArray(payload);
  const slugs = [];

  for (const item of items) {
    const slug = normalizeString(item.slug);
    const name = normalizeString(item.name);
    const logo = normalizeString(item.logo);
    if (!slug || !name || !logo) {
      throw new Error('Each club must have slug, name and logo');
    }
    slugs.push(slug);
    await client.query(`
      INSERT INTO clubs (
        slug,
        name,
        short_name,
        logo_path,
        country,
        city,
        founded_year,
        website_url,
        hero_image_url,
        description,
        is_active
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
      ON CONFLICT (slug) DO UPDATE
      SET
        name = EXCLUDED.name,
        short_name = EXCLUDED.short_name,
        logo_path = EXCLUDED.logo_path,
        country = EXCLUDED.country,
        city = EXCLUDED.city,
        founded_year = EXCLUDED.founded_year,
        website_url = EXCLUDED.website_url,
        hero_image_url = EXCLUDED.hero_image_url,
        description = EXCLUDED.description,
        is_active = EXCLUDED.is_active
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
      parseBoolean(item.is_active, true),
    ]);
  }

  if (slugs.length) {
    await client.query('DELETE FROM clubs WHERE NOT (slug = ANY($1::text[]))', [slugs]);
  } else {
    await client.query('DELETE FROM clubs');
  }
}

async function replaceMatches(client, payload) {
  const items = ensureArray(payload);
  const ids = [];
  const tournaments = await client.query('SELECT id, slug FROM tournaments');
  const clubs = await client.query('SELECT id, slug FROM clubs');
  const tournamentMap = new Map(tournaments.rows.map(row => [row.slug, Number(row.id)]));
  const clubMap = new Map(clubs.rows.map(row => [row.slug, Number(row.id)]));

  for (const item of items) {
    const id = parseInteger(item.id, 0);
    const tournamentSlug = normalizeString(item.tournament_slug);
    const homeSlug = normalizeString(item.home_team_slug);
    const awaySlug = normalizeString(item.away_team_slug);
    if (!id || !tournamentSlug || !homeSlug || !awaySlug) {
      throw new Error('Each match must have id, tournament_slug, home_team_slug and away_team_slug');
    }
    const tournamentId = tournamentMap.get(tournamentSlug);
    const homeClubId = clubMap.get(homeSlug);
    const awayClubId = clubMap.get(awaySlug);
    if (!tournamentId) throw new Error(`Tournament not found for match: ${tournamentSlug}`);
    if (!homeClubId) throw new Error(`Home club not found for match: ${homeSlug}`);
    if (!awayClubId) throw new Error(`Away club not found for match: ${awaySlug}`);

    ids.push(id);
    const score = parseScore(item.score);

    await client.query(`
      INSERT INTO matches (
        id,
        tournament_id,
        stage_name,
        round_name,
        matchday_label,
        match_date,
        match_time,
        status,
        status_label,
        home_club_id,
        away_club_id,
        home_score,
        away_score,
        venue,
        video_url,
        summary,
        sort_order
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)
      ON CONFLICT (id) DO UPDATE
      SET
        tournament_id = EXCLUDED.tournament_id,
        stage_name = EXCLUDED.stage_name,
        round_name = EXCLUDED.round_name,
        matchday_label = EXCLUDED.matchday_label,
        match_date = EXCLUDED.match_date,
        match_time = EXCLUDED.match_time,
        status = EXCLUDED.status,
        status_label = EXCLUDED.status_label,
        home_club_id = EXCLUDED.home_club_id,
        away_club_id = EXCLUDED.away_club_id,
        home_score = EXCLUDED.home_score,
        away_score = EXCLUDED.away_score,
        venue = EXCLUDED.venue,
        video_url = EXCLUDED.video_url,
        summary = EXCLUDED.summary,
        sort_order = EXCLUDED.sort_order
    `, [
      id,
      tournamentId,
      nullIfEmpty(item.group),
      nullIfEmpty(item.round),
      nullIfEmpty(item.matchday),
      nullIfEmpty(item.date),
      nullIfEmpty(item.time),
      normalizeString(item.status) || 'soon',
      normalizeString(item.status_label) || 'Скоро',
      homeClubId,
      awayClubId,
      score.home,
      score.away,
      nullIfEmpty(item.venue),
      nullIfEmpty(item.video),
      normalizeString(item.summary),
      parseInteger(item.sort_order, ids.length),
    ]);
  }

  if (ids.length) {
    await client.query('DELETE FROM matches WHERE NOT (id = ANY($1::bigint[]))', [ids]);
  } else {
    await client.query('DELETE FROM matches');
  }
}

async function replaceNews(client, payload) {
  const items = ensureArray(payload);
  const ids = [];
  const tournaments = await client.query('SELECT id, slug FROM tournaments');
  const tournamentMap = new Map(tournaments.rows.map(row => [row.slug, Number(row.id)]));

  for (const item of items) {
    const id = parseInteger(item.id, 0);
    if (!id) {
      throw new Error('Each news item must have numeric id');
    }
    const tournamentSlug = normalizeString(item.tournament_slug);
    const tournamentId = tournamentSlug ? tournamentMap.get(tournamentSlug) || null : null;
    if (tournamentSlug && !tournamentId) {
      throw new Error(`Tournament not found for news: ${tournamentSlug}`);
    }
    ids.push(id);

    await client.query(`
      INSERT INTO news_articles (
        id,
        tournament_id,
        slug,
        published_on,
        title,
        excerpt,
        body,
        link_path,
        image_url,
        is_published
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
      ON CONFLICT (id) DO UPDATE
      SET
        tournament_id = EXCLUDED.tournament_id,
        slug = EXCLUDED.slug,
        published_on = EXCLUDED.published_on,
        title = EXCLUDED.title,
        excerpt = EXCLUDED.excerpt,
        body = EXCLUDED.body,
        link_path = EXCLUDED.link_path,
        image_url = EXCLUDED.image_url,
        is_published = EXCLUDED.is_published
    `, [
      id,
      tournamentId,
      normalizeString(item.slug) || slugify(item.title) || `news-${id}`,
      nullIfEmpty(item.date),
      normalizeString(item.title),
      normalizeString(item.excerpt),
      normalizeString(item.body),
      normalizeString(item.link) || 'news.html',
      nullIfEmpty(item.image),
      parseBoolean(item.is_published, true),
    ]);
  }

  if (ids.length) {
    await client.query('DELETE FROM news_articles WHERE NOT (id = ANY($1::bigint[]))', [ids]);
  } else {
    await client.query('DELETE FROM news_articles');
  }
}

async function ensurePartnerCategory(client, slug) {
  const categorySlug = normalizeString(slug) || 'general';
  const categoryName = CATEGORY_NAMES[categorySlug] || categorySlug;
  const { rows } = await client.query(`
    INSERT INTO partner_categories (slug, name)
    VALUES ($1, $2)
    ON CONFLICT (slug) DO UPDATE
    SET name = EXCLUDED.name
    RETURNING id;
  `, [categorySlug, categoryName]);
  return Number(rows[0].id);
}

async function setPartnerLogo(client, partnerId, logoUrl, altText, metadata = {}) {
  const normalizedLogo = normalizeString(logoUrl);
  if (!normalizedLogo) {
    await client.query('UPDATE partner_logo_assets SET is_current = FALSE WHERE partner_id = $1', [partnerId]);
    return null;
  }

  const normalizedAlt = normalizeString(altText);
  const normalizedStorageProvider = normalizeString(metadata.storage_provider)
    || (normalizedLogo.startsWith('data:') ? 'inline' : 'external');
  const normalizedPublicId = nullIfEmpty(metadata.public_id);
  const normalizedFileName = nullIfEmpty(metadata.file_name);
  const normalizedMimeType = nullIfEmpty(metadata.mime_type);
  const normalizedFormat = nullIfEmpty(metadata.format);
  const normalizedWidth = metadata.width == null || metadata.width === '' ? null : parseInteger(metadata.width, null);
  const normalizedHeight = metadata.height == null || metadata.height === '' ? null : parseInteger(metadata.height, null);
  const normalizedBytes = metadata.bytes == null || metadata.bytes === '' ? null : parseInteger(metadata.bytes, null);
  const existing = await client.query(`
    SELECT id
    FROM partner_logo_assets
    WHERE partner_id = $1
      AND image_url = $2
      AND alt_text = $3
    ORDER BY uploaded_at DESC, id DESC
    LIMIT 1;
  `, [partnerId, normalizedLogo, normalizedAlt]);

  let logoAssetId;

  if (existing.rows.length) {
    logoAssetId = Number(existing.rows[0].id);
    await client.query(`
      UPDATE partner_logo_assets
      SET
        storage_provider = $2,
        public_id = $3,
        file_name = $4,
        mime_type = $5,
        asset_format = $6,
        width = $7,
        height = $8,
        bytes = $9
      WHERE id = $1;
    `, [
      logoAssetId,
      normalizedStorageProvider,
      normalizedPublicId,
      normalizedFileName,
      normalizedMimeType,
      normalizedFormat,
      normalizedWidth,
      normalizedHeight,
      normalizedBytes,
    ]);
  } else {
    logoAssetId = Number((await client.query(`
        INSERT INTO partner_logo_assets (
          partner_id,
          image_url,
          alt_text,
          storage_provider,
          public_id,
          file_name,
          mime_type,
          asset_format,
          width,
          height,
          bytes,
          is_current
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, TRUE)
        RETURNING id;
      `, [
        partnerId,
        normalizedLogo,
        normalizedAlt,
        normalizedStorageProvider,
        normalizedPublicId,
        normalizedFileName,
        normalizedMimeType,
        normalizedFormat,
        normalizedWidth,
        normalizedHeight,
        normalizedBytes,
      ])).rows[0].id);
  }

  await client.query(`
    UPDATE partner_logo_assets
    SET is_current = CASE WHEN id = $2 THEN TRUE ELSE FALSE END
    WHERE partner_id = $1;
  `, [partnerId, logoAssetId]);

  return logoAssetId;
}

async function replacePartners(client, payload) {
  const items = ensureArray(payload);
  const slugs = [];
  const tournaments = await client.query('SELECT id, slug FROM tournaments');
  const tournamentMap = new Map(tournaments.rows.map(row => [row.slug, Number(row.id)]));

  await client.query('DELETE FROM tournament_partners');

  for (const item of items) {
    const slug = normalizeString(item.slug);
    const name = normalizeString(item.name);
    if (!slug || !name) {
      throw new Error('Each partner must have slug and name');
    }
    slugs.push(slug);

    const partnerResult = await client.query(`
      INSERT INTO partners (
        slug,
        name,
        website_url,
        description,
        is_active
      )
      VALUES ($1,$2,$3,$4,$5)
      ON CONFLICT (slug) DO UPDATE
      SET
        name = EXCLUDED.name,
        website_url = EXCLUDED.website_url,
        description = EXCLUDED.description,
        is_active = EXCLUDED.is_active
      RETURNING id;
    `, [
      slug,
      name,
      nullIfEmpty(item.website_url),
      normalizeString(item.note),
      true,
    ]);

    const partnerId = Number(partnerResult.rows[0].id);
    const categoryId = await ensurePartnerCategory(client, item.category);
    const logoAssetId = await setPartnerLogo(client, partnerId, item.logo_url, item.alt_text || name, {
      storage_provider: item.logo_storage_provider,
      public_id: item.logo_public_id,
      file_name: item.logo_file_name,
      mime_type: item.logo_mime_type,
      format: item.logo_format,
      width: item.logo_width,
      height: item.logo_height,
      bytes: item.logo_bytes,
    });
    const tournamentSlug = normalizeString(item.tournament_slug);
    const tournamentId = tournamentSlug ? tournamentMap.get(tournamentSlug) || null : null;
    if (tournamentSlug && !tournamentId) {
      throw new Error(`Tournament not found for partner: ${tournamentSlug}`);
    }

    await client.query(`
      INSERT INTO tournament_partners (
        tournament_id,
        partner_id,
        category_id,
        logo_asset_id,
        sort_order,
        is_visible
      )
      VALUES ($1,$2,$3,$4,$5,$6);
    `, [
      tournamentId,
      partnerId,
      categoryId,
      logoAssetId,
      parseInteger(item.sort_order, 0),
      parseBoolean(item.is_visible, true),
    ]);
  }

  if (slugs.length) {
    await client.query('DELETE FROM partners WHERE NOT (slug = ANY($1::text[]))', [slugs]);
  } else {
    await client.query('DELETE FROM partners');
  }
}

async function loadAdminResource(client, resource) {
  switch (resource) {
    case 'tournaments':
      return getAdminTournaments(client);
    case 'clubs':
      return getAdminClubs(client);
    case 'matches':
      return getAdminMatches(client);
    case 'news':
      return getAdminNews(client);
    case 'partners':
      return getAdminPartners(client);
    default:
      throw new Error('Unknown admin resource');
  }
}

async function saveAdminResource(client, resource, payload) {
  switch (resource) {
    case 'tournaments':
      return replaceTournaments(client, payload);
    case 'clubs':
      return replaceClubs(client, payload);
    case 'matches':
      return replaceMatches(client, payload);
    case 'news':
      return replaceNews(client, payload);
    case 'partners':
      return replacePartners(client, payload);
    default:
      throw new Error('Unknown admin resource');
  }
}

app.get('/', (req, res) => {
  res.json({
    service: 'burchalkin-cup-railway-api',
    status: 'ok',
    endpoints: [
      '/health',
      '/api/tournaments',
      '/api/tournaments/:slug',
      '/api/tournaments/:slug/standings',
      '/api/tournaments/:slug/matches',
      '/api/tournaments/:slug/news',
      '/api/tournaments/:slug/partners',
      '/api/clubs',
      '/api/clubs/:slug',
      '/api/clubs/:slug/matches',
      '/api/standings',
      '/api/matches',
      '/api/news',
      '/api/results',
      '/api/admin/:resource',
      '/api/admin/uploads/image'
    ]
  });
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
    const data = await runInTransaction(client => loadAdminResource(client, req.params.resource));
    res.json(data);
  } catch (error) {
    if (error.message === 'Unknown admin resource') {
      return res.status(404).json({ error: error.message });
    }
    return next(error);
  }
});

app.post('/api/admin/uploads/image', requireAdminAuth, async (req, res, next) => {
  try {
    const file = typeof req.body?.file === 'string' ? req.body.file.trim() : '';
    const folder = normalizeString(req.body?.folder) || 'burcup/uploads';
    const filename = normalizeString(req.body?.filename) || 'image';
    const originalFilename = normalizeString(req.body?.original_filename) || filename;
    const publicId = `${filename}-${Date.now()}`.replace(/[^a-z0-9/_-]+/gi, '-').replace(/-+/g, '-');
    const mimeType = (file.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,/) || [])[1] || '';

    if (!file || !file.startsWith('data:image/')) {
      return res.status(400).json({ error: 'Image payload must be a data URL' });
    }

    const uploaded = await uploadImageToCloudinary({
      file,
      folder,
      publicId,
    });

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

app.put('/api/admin/:resource', requireAdminAuth, async (req, res, next) => {
  try {
    if (!Array.isArray(req.body)) {
      return res.status(400).json({ error: 'Payload must be an array' });
    }
    await runInTransaction(client => saveAdminResource(client, req.params.resource, req.body));
    const data = await runInTransaction(client => loadAdminResource(client, req.params.resource));
    return res.json({
      ok: true,
      resource: req.params.resource,
      count: data.length,
      data
    });
  } catch (error) {
    if (error.message === 'Unknown admin resource') {
      return res.status(404).json({ error: error.message });
    }
    return next(error);
  }
});

app.get('/api/tournaments', async (req, res, next) => {
  try {
    const { rows } = await pool.query(tournamentsQuery);
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
      is_featured: row.is_featured,
      clubs_count: Number(row.clubs_count || 0),
      matches_count: Number(row.matches_count || 0),
    })));
  } catch (error) {
    next(error);
  }
});

app.get('/api/tournaments/:slug', async (req, res, next) => {
  try {
    const tournamentResult = await pool.query(tournamentDetailsQuery, [req.params.slug]);
    if (!tournamentResult.rows.length) {
      return res.status(404).json({ error: 'Tournament not found' });
    }
    const tournament = tournamentResult.rows[0];
    const [standingsResult, matchesResult, newsResult, partnersResult] = await Promise.all([
      pool.query(standingsQuery, [req.params.slug]),
      pool.query(matchesQuery, [req.params.slug]),
      pool.query(newsQuery, [req.params.slug]),
      pool.query(tournamentPartnersQuery, [req.params.slug]),
    ]);

    const groupedPartners = partnersResult.rows.reduce((acc, row) => {
      const key = row.category_slug || 'other';
      if (!acc[key]) {
        acc[key] = {
          slug: row.category_slug || 'other',
          name: row.category_name || 'Прочее',
          items: []
        };
      }
      acc[key].items.push({
        slug: row.partner_slug,
        name: row.partner_name,
        website_url: row.website_url || '',
        description: row.description || '',
        logo_url: row.logo_url || '',
        logo_alt: row.logo_alt || row.partner_name,
        sort_order: row.sort_order
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
      is_featured: tournament.is_featured,
      standings: standingsResult.rows.map(row => ({
        group: row.group_name,
        position: row.position,
        team: row.team,
        logo: row.logo,
        played: row.played,
        goals: `${row.goals_for}-${row.goals_against}`,
        points: row.points,
      })),
      matches: matchesResult.rows.map(formatMatchRow),
      news: newsResult.rows.map(row => ({
        id: Number(row.id),
        slug: row.slug,
        date: normalizeDate(row.published_on),
        title: row.title,
        excerpt: row.excerpt,
        body: row.body || '',
        link: row.link_path,
        image: row.image_url || '',
      })),
      partners: Object.values(groupedPartners),
    });
  } catch (error) {
    next(error);
  }
});

app.get('/api/tournaments/:slug/standings', async (req, res, next) => {
  try {
    const { rows } = await pool.query(standingsQuery, [req.params.slug]);
    res.json(rows.map(row => ({
      group: row.group_name,
      position: row.position,
      team: row.team,
      logo: row.logo,
      played: row.played,
      goals: `${row.goals_for}-${row.goals_against}`,
      points: row.points,
    })));
  } catch (error) {
    next(error);
  }
});

app.get('/api/tournaments/:slug/matches', async (req, res, next) => {
  try {
    const { rows } = await pool.query(matchesQuery, [req.params.slug]);
    res.json(rows.map(formatMatchRow));
  } catch (error) {
    next(error);
  }
});

app.get('/api/tournaments/:slug/news', async (req, res, next) => {
  try {
    const { rows } = await pool.query(newsQuery, [req.params.slug]);
    res.json(rows.map(row => ({
      id: Number(row.id),
      slug: row.slug,
      date: normalizeDate(row.published_on),
      title: row.title,
      excerpt: row.excerpt,
      body: row.body || '',
      link: row.link_path,
      image: row.image_url || '',
      tournament_slug: row.tournament_slug || '',
      tournament_name: row.tournament_name || '',
    })));
  } catch (error) {
    next(error);
  }
});

app.get('/api/tournaments/:slug/partners', async (req, res, next) => {
  try {
    const { rows } = await pool.query(tournamentPartnersQuery, [req.params.slug]);
    res.json(rows.map(row => ({
      category_slug: row.category_slug || 'other',
      category_name: row.category_name || 'Прочее',
      slug: row.partner_slug,
      name: row.partner_name,
      website_url: row.website_url || '',
      description: row.description || '',
      logo_url: row.logo_url || '',
      logo_alt: row.logo_alt || row.partner_name,
      sort_order: row.sort_order,
    })));
  } catch (error) {
    next(error);
  }
});

app.get('/api/clubs', async (req, res, next) => {
  try {
    const { rows } = await pool.query(clubsQuery);
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
      is_active: row.is_active,
      matches_count: Number(row.matches_count || 0),
    })));
  } catch (error) {
    next(error);
  }
});

app.get('/api/clubs/:slug', async (req, res, next) => {
  try {
    const clubResult = await pool.query(clubDetailsQuery, [req.params.slug]);
    if (!clubResult.rows.length) {
      return res.status(404).json({ error: 'Club not found' });
    }
    const club = clubResult.rows[0];
    const matchesResult = await pool.query(clubMatchesQuery, [req.params.slug]);

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
      is_active: club.is_active,
      matches: matchesResult.rows.map(formatMatchRow),
    });
  } catch (error) {
    next(error);
  }
});

app.get('/api/clubs/:slug/matches', async (req, res, next) => {
  try {
    const { rows } = await pool.query(clubMatchesQuery, [req.params.slug]);
    res.json(rows.map(formatMatchRow));
  } catch (error) {
    next(error);
  }
});

app.get('/api/standings', async (req, res, next) => {
  try {
    const { rows } = await pool.query(standingsQuery, [null]);
    res.json(rows.map(row => ({
      group: row.group_name,
      position: row.position,
      team: row.team,
      logo: row.logo,
      played: row.played,
      goals: `${row.goals_for}-${row.goals_against}`,
      points: row.points,
    })));
  } catch (error) {
    next(error);
  }
});

app.get('/api/matches', async (req, res, next) => {
  try {
    const { rows } = await pool.query(matchesQuery, [null]);
    res.json(rows.map(formatMatchRow));
  } catch (error) {
    next(error);
  }
});

app.get('/api/news', async (req, res, next) => {
  try {
    const { rows } = await pool.query(newsQuery, [null]);
    res.json(rows.map(row => ({
      id: Number(row.id),
      slug: row.slug,
      date: normalizeDate(row.published_on),
      title: row.title,
      excerpt: row.excerpt,
      body: row.body || '',
      link: row.link_path,
      image: row.image_url || '',
      tournament_slug: row.tournament_slug || '',
      tournament_name: row.tournament_name || '',
    })));
  } catch (error) {
    next(error);
  }
});

app.get('/api/results', async (req, res, next) => {
  try {
    const { rows } = await pool.query(resultsQuery, [null]);
    res.json(rows.map(row => ({
      stage: row.stage_name || '',
      match: row.match_label,
      score: `${row.home_score}:${row.away_score}`,
      display_order: row.sort_order,
      tournament_slug: row.tournament_slug || '',
    })));
  } catch (error) {
    next(error);
  }
});

app.use((error, req, res, next) => {
  const statusCode = error.message === 'Origin not allowed by CORS'
    ? 403
    : (error.message && error.message.includes('not found') ? 400 : 500);

  console.error(error);
  res.status(statusCode).json({
    error: statusCode === 403
      ? 'CORS origin is not allowed'
      : error.message || 'Internal server error'
  });
});

app.listen(port, () => {
  console.log(`API is running on port ${port}`);
});
