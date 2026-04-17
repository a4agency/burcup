import fs from 'node:fs/promises';
import path from 'node:path';
import mysql from 'mysql2/promise';

const SOURCE_API_BASE_URL = process.env.SOURCE_API_BASE_URL || 'https://burcup-production.up.railway.app';
const SOURCE_ADMIN_TOKEN = process.env.SOURCE_ADMIN_TOKEN || '';
const SOURCE_ADMIN_PASSWORD = process.env.SOURCE_ADMIN_PASSWORD || 'agency';
const MYSQL_URL = process.env.MYSQL_URL || process.env.DATABASE_URL || '';
const APPLY_SCHEMA = process.env.APPLY_SCHEMA === '1';
const WIPE_TARGET = process.env.WIPE_TARGET !== '0';

const CATEGORY_NAME_MAP = new Map([
  ['general', 'Партнёры'],
  ['media', 'Информационные партнёры'],
  ['other', 'Прочее'],
]);

function requiredEnv(value, name) {
  if (!value) {
    throw new Error(`${name} is required`);
  }
  return value;
}

function normalizeString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function normalizeNullableString(value) {
  const normalized = normalizeString(value);
  return normalized || null;
}

function normalizeDate(value) {
  const normalized = normalizeString(value);
  return normalized || null;
}

function normalizeTime(value) {
  const normalized = normalizeString(value);
  return normalized || null;
}

function normalizeBool(value, defaultValue = false) {
  if (value == null) return defaultValue;
  return value === true || value === 1 || value === '1';
}

function parseInteger(value, defaultValue = 0) {
  const parsed = Number.parseInt(String(value ?? ''), 10);
  return Number.isFinite(parsed) ? parsed : defaultValue;
}

function parseScore(score) {
  const [homeRaw = '0', awayRaw = '0'] = String(score || '0:0').split(':');
  return {
    home: parseInteger(homeRaw, 0),
    away: parseInteger(awayRaw, 0),
  };
}

function buildBodyHtmlFallback(body) {
  const parts = String(body || '')
    .split(/\n\s*\n+/)
    .map(part => part.trim())
    .filter(Boolean);
  return parts.map(part => `<p>${escapeHtml(part).replace(/\n/g, '<br>')}</p>`).join('\n');
}

function escapeHtml(value) {
  return String(value || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function categoryNameForSlug(slug) {
  const normalized = normalizeString(slug) || 'general';
  return CATEGORY_NAME_MAP.get(normalized) || normalized;
}

async function fetchJson(url, options = {}) {
  const response = await fetch(url, options);
  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new Error(`Request failed ${response.status} ${response.statusText}: ${url}\n${body.slice(0, 400)}`);
  }
  return response.json();
}

async function getAdminToken(baseUrl) {
  if (SOURCE_ADMIN_TOKEN) return SOURCE_ADMIN_TOKEN;
  const session = await fetchJson(`${baseUrl}/api/admin/session`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ password: SOURCE_ADMIN_PASSWORD }),
  });
  return session.token;
}

async function loadSourceData(baseUrl, adminToken) {
  const headers = { 'x-admin-token': adminToken };
  const resources = ['tournaments', 'clubs', 'matches', 'news', 'partners', 'standings', 'playoff', 'albums', 'pages'];
  const results = await Promise.all(resources.map(resource => (
    fetchJson(`${baseUrl}/api/admin/${resource}`, { headers }).then(data => [resource, data])
  )));
  return Object.fromEntries(results);
}

async function loadPublicMatches(baseUrl) {
  const data = await fetchJson(`${baseUrl}/api/matches`);
  return Array.isArray(data) ? data : [];
}

function mergeMatchEvents(matches = [], publicMatches = []) {
  const publicMap = new Map(publicMatches.map(match => [parseInteger(match?.id, 0), match]));
  return matches.map(match => {
    const matchId = parseInteger(match?.id, 0);
    const publicMatch = publicMap.get(matchId) || {};
    const events = Array.isArray(match?.events) && match.events.length
      ? match.events
      : Array.isArray(publicMatch?.events)
        ? publicMatch.events
        : [];
    return { ...match, events };
  });
}

async function applySchema(pool) {
  const schemaPath = path.join(process.cwd(), 'database', 'mysql-schema.sql');
  const sql = await fs.readFile(schemaPath, 'utf8');
  await pool.query(sql);
}

async function ensureMysqlCompatibility(pool) {
  const [subtitleRows] = await pool.query(`
    SELECT COUNT(*) AS count
    FROM information_schema.columns
    WHERE table_schema = DATABASE()
      AND table_name = 'site_pages'
      AND column_name = 'subtitle'
  `);
  if (Number(subtitleRows[0]?.count || 0) === 0) {
    await pool.query(`ALTER TABLE site_pages ADD COLUMN subtitle TEXT NOT NULL`);
  }

  const [bodyHtmlRows] = await pool.query(`
    SELECT COUNT(*) AS count
    FROM information_schema.columns
    WHERE table_schema = DATABASE()
      AND table_name = 'site_pages'
      AND column_name = 'body_html'
  `);
  if (Number(bodyHtmlRows[0]?.count || 0) === 0) {
    await pool.query(`ALTER TABLE site_pages ADD COLUMN body_html LONGTEXT NOT NULL`);
  }
}

async function getTableColumns(pool, tableName) {
  const [rows] = await pool.query(`
    SELECT COLUMN_NAME
    FROM information_schema.columns
    WHERE table_schema = DATABASE()
      AND table_name = ?
  `, [tableName]);
  return new Set(rows.map(row => String(row.COLUMN_NAME || row.column_name || '')));
}

function createMysqlPool(connectionString) {
  const url = new URL(connectionString);
  return mysql.createPool({
    host: url.hostname,
    port: url.port ? Number(url.port) : 3306,
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: url.pathname.replace(/^\//, ''),
    waitForConnections: true,
    connectionLimit: 4,
    multipleStatements: true,
    charset: 'utf8mb4',
  });
}

async function wipeTargetTables(connection) {
  const tables = [
    'news_article_photos',
    'media_album_photos',
    'tournament_playoff_matches',
    'tournament_standings',
    'tournament_clubs',
    'tournament_partners',
    'partner_logo_assets',
    'match_events',
    'matches',
    'news_articles',
    'media_albums',
    'partners',
    'partner_categories',
    'content_translations',
    'site_pages',
    'clubs',
    'tournaments',
  ];
  await connection.query('SET FOREIGN_KEY_CHECKS = 0');
  for (const table of tables) {
    await connection.query(`TRUNCATE TABLE \`${table}\``);
  }
  await connection.query('SET FOREIGN_KEY_CHECKS = 1');
}

async function loadIdMap(connection, table) {
  const [rows] = await connection.query(`SELECT id, slug FROM \`${table}\``);
  return new Map(rows.map(row => [row.slug, Number(row.id)]));
}

function deriveTournamentClubs(source) {
  const perTournament = new Map();

  const ensureEntry = (tournamentSlug, teamSlug) => {
    if (!tournamentSlug || !teamSlug) return null;
    if (!perTournament.has(tournamentSlug)) perTournament.set(tournamentSlug, new Map());
    const teams = perTournament.get(tournamentSlug);
    if (!teams.has(teamSlug)) {
      teams.set(teamSlug, {
        tournament_slug: tournamentSlug,
        team_slug: teamSlug,
        group_name: null,
        seeded_order: null,
      });
    }
    return teams.get(teamSlug);
  };

  for (const row of source.standings || []) {
    const entry = ensureEntry(row.tournament_slug, row.team_slug);
    if (!entry) continue;
    const groupName = normalizeString(row.group_name);
    if (groupName && groupName !== 'overall') {
      entry.group_name = groupName;
    }
    if (entry.seeded_order == null) {
      entry.seeded_order = parseInteger(row.position, null);
    }
  }

  for (const match of source.matches || []) {
    const stageName = normalizeString(match.group);
    const home = ensureEntry(match.tournament_slug, match.home_team_slug);
    const away = ensureEntry(match.tournament_slug, match.away_team_slug);
    for (const entry of [home, away]) {
      if (!entry) continue;
      if (!entry.group_name && stageName && !/полуфинал|финал|плей-офф|матч за/i.test(stageName)) {
        entry.group_name = stageName;
      }
    }
  }

  const items = [];
  for (const [, teams] of perTournament) {
    let fallbackOrder = 1;
    for (const [, entry] of teams) {
      items.push({
        tournament_slug: entry.tournament_slug,
        team_slug: entry.team_slug,
        group_name: entry.group_name,
        seeded_order: entry.seeded_order ?? fallbackOrder++,
        notes: '',
      });
    }
  }

  items.sort((a, b) => (
    a.tournament_slug.localeCompare(b.tournament_slug)
    || String(a.group_name || '').localeCompare(String(b.group_name || ''))
    || parseInteger(a.seeded_order, 9999) - parseInteger(b.seeded_order, 9999)
    || a.team_slug.localeCompare(b.team_slug)
  ));

  return items;
}

async function insertTournaments(connection, tournaments) {
  for (const item of tournaments) {
    await connection.execute(`
      INSERT INTO tournaments (
        slug, name, season_year, short_label, logo_path, hero_image_url, description,
        start_date, end_date, location, status, is_featured, countdown_enabled,
        standings_mode, playoff_mode
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      item.slug,
      item.name,
      item.season_year == null ? null : parseInteger(item.season_year, null),
      normalizeNullableString(item.short_label),
      normalizeNullableString(item.logo),
      normalizeNullableString(item.hero_image),
      normalizeString(item.description),
      normalizeDate(item.start_date),
      normalizeDate(item.end_date),
      normalizeNullableString(item.location),
      normalizeString(item.status) || 'draft',
      normalizeBool(item.is_featured),
      normalizeBool(item.countdown_enabled, true),
      normalizeString(item.standings_mode) || 'auto',
      normalizeString(item.playoff_mode) || 'auto',
    ]);
  }
}

async function insertClubs(connection, clubs) {
  for (const item of clubs) {
    await connection.execute(`
      INSERT INTO clubs (
        slug, name, short_name, logo_path, country, city, founded_year,
        website_url, hero_image_url, description, is_active
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      item.slug,
      item.name,
      normalizeNullableString(item.short_name),
      normalizeString(item.logo),
      normalizeNullableString(item.country),
      normalizeNullableString(item.city),
      item.founded_year === '' ? null : parseInteger(item.founded_year, null),
      normalizeNullableString(item.website_url),
      normalizeNullableString(item.hero_image),
      normalizeString(item.description),
      normalizeBool(item.is_active, true),
    ]);
  }
}

async function insertTournamentClubs(connection, items, tournamentIdMap, clubIdMap) {
  for (const item of items) {
    const tournamentId = tournamentIdMap.get(item.tournament_slug);
    const clubId = clubIdMap.get(item.team_slug);
    if (!tournamentId || !clubId) continue;
    await connection.execute(`
      INSERT INTO tournament_clubs (tournament_id, club_id, group_name, seeded_order, notes)
      VALUES (?, ?, ?, ?, ?)
    `, [
      tournamentId,
      clubId,
      normalizeNullableString(item.group_name),
      item.seeded_order == null ? null : parseInteger(item.seeded_order, null),
      normalizeString(item.notes),
    ]);
  }
}

async function insertStandings(connection, standings, tournamentIdMap, clubIdMap) {
  for (const row of standings) {
    const tournamentId = tournamentIdMap.get(row.tournament_slug);
    const clubId = clubIdMap.get(row.team_slug);
    if (!tournamentId || !clubId) continue;
    await connection.execute(`
      INSERT INTO tournament_standings (
        tournament_id, club_id, group_name, position, played, won, drawn, lost,
        goals_for, goals_against, points
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      tournamentId,
      clubId,
      normalizeString(row.group_name) || 'overall',
      parseInteger(row.position, 0),
      parseInteger(row.played, 0),
      parseInteger(row.won, 0),
      parseInteger(row.drawn, 0),
      parseInteger(row.lost, 0),
      parseInteger(row.goals_for, 0),
      parseInteger(row.goals_against, 0),
      parseInteger(row.points, 0),
    ]);
  }
}

async function insertMatches(connection, matches, tournamentIdMap, clubIdMap) {
  let sortOrder = 1;
  for (const match of matches) {
    const tournamentId = tournamentIdMap.get(match.tournament_slug);
    const homeClubId = clubIdMap.get(match.home_team_slug);
    const awayClubId = clubIdMap.get(match.away_team_slug);
    if (!tournamentId || !homeClubId || !awayClubId) continue;
    const score = parseScore(match.score);
    await connection.execute(`
      INSERT INTO matches (
        id, tournament_id, stage_name, round_name, matchday_label, match_date, match_time,
        status, status_label, home_club_id, away_club_id, home_score, away_score, venue,
        video_url, review_video_url, interview_video_url, is_featured_media, summary,
        attendance, sort_order
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      parseInteger(match.id, 0),
      tournamentId,
      normalizeNullableString(match.group),
      normalizeNullableString(match.round),
      normalizeNullableString(match.matchday),
      normalizeDate(match.date),
      normalizeTime(match.time),
      normalizeString(match.status) || 'soon',
      normalizeString(match.status_label),
      homeClubId,
      awayClubId,
      score.home,
      score.away,
      normalizeNullableString(match.venue),
      normalizeNullableString(match.video),
      normalizeNullableString(match.review_video),
      normalizeNullableString(match.interview_video),
      normalizeBool(match.is_featured_media),
      normalizeString(match.summary),
      null,
      sortOrder++,
    ]);
  }
}

async function insertMatchEvents(connection, matches) {
  for (const match of matches) {
    const matchId = parseInteger(match.id, 0);
    if (!matchId) continue;
    const events = Array.isArray(match.events) ? match.events : [];
    for (let index = 0; index < events.length; index += 1) {
      const event = events[index] || {};
      await connection.execute(`
        INSERT INTO match_events (
          match_id, sort_order, minute_label, event_type, title, description
        )
        VALUES (?, ?, ?, ?, ?, ?)
      `, [
        matchId,
        parseInteger(event.sort_order, index + 1),
        normalizeNullableString(event.minute),
        normalizeString(event.type) || 'note',
        normalizeNullableString(event.title),
        normalizeString(event.description),
      ]);
    }
  }
}

async function insertNews(connection, news, tournamentIdMap) {
  for (const item of news) {
    const tournamentId = item.tournament_slug ? (tournamentIdMap.get(item.tournament_slug) || null) : null;
    await connection.execute(`
      INSERT INTO news_articles (
        id, tournament_id, slug, published_on, title, excerpt, body, body_html,
        link_path, image_url, video_url, is_published
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      parseInteger(item.id, 0),
      tournamentId,
      item.slug,
      normalizeDate(item.date),
      normalizeString(item.title),
      normalizeString(item.excerpt),
      normalizeString(item.body),
      normalizeString(item.body_html) || buildBodyHtmlFallback(item.body),
      normalizeString(item.link),
      normalizeNullableString(item.image),
      normalizeNullableString(item.video_url),
      normalizeBool(item.is_published, true),
    ]);

    for (const photo of Array.isArray(item.photos) ? item.photos : []) {
      await connection.execute(`
        INSERT INTO news_article_photos (news_article_id, image_url, alt_text, sort_order)
        VALUES (?, ?, ?, ?)
      `, [
        parseInteger(item.id, 0),
        normalizeString(photo.image_url),
        normalizeString(photo.alt_text),
        parseInteger(photo.sort_order, 0),
      ]);
    }
  }
}

async function insertAlbums(connection, albums, tournamentIdMap) {
  const albumIdMap = new Map();

  for (const item of albums) {
    const tournamentId = item.tournament_slug ? (tournamentIdMap.get(item.tournament_slug) || null) : null;
    const [result] = await connection.execute(`
      INSERT INTO media_albums (
        tournament_id, slug, title, card_excerpt, description, badge,
        cover_image_url, cover_alt_text, published_on, sort_order, is_visible
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      tournamentId,
      item.slug,
      normalizeString(item.title),
      normalizeString(item.card_excerpt),
      normalizeString(item.description),
      normalizeString(item.badge) || 'Фотоальбом',
      normalizeNullableString(item.cover_image_url),
      normalizeString(item.cover_alt_text || item.title),
      normalizeDate(item.published_on),
      parseInteger(item.sort_order, 0),
      normalizeBool(item.is_visible, true),
    ]);
    albumIdMap.set(item.slug, Number(result.insertId));
  }

  for (const item of albums) {
    const albumId = albumIdMap.get(item.slug);
    if (!albumId) continue;
    for (const photo of Array.isArray(item.photos) ? item.photos : []) {
      await connection.execute(`
        INSERT INTO media_album_photos (album_id, image_url, alt_text, caption, sort_order)
        VALUES (?, ?, ?, ?, ?)
      `, [
        albumId,
        normalizeString(photo.image_url),
        normalizeString(photo.alt_text),
        normalizeString(photo.caption),
        parseInteger(photo.sort_order, 0),
      ]);
    }
  }
}

async function insertPartners(connection, partners) {
  const categorySlugs = Array.from(new Set(
    partners
      .map(item => normalizeString(item.category) || 'general')
      .filter(Boolean)
  ));

  for (const slug of categorySlugs) {
    await connection.execute(`
      INSERT INTO partner_categories (slug, name)
      VALUES (?, ?)
    `, [slug, categoryNameForSlug(slug)]);
  }

  const [categoryRows] = await connection.query('SELECT id, slug FROM partner_categories');
  const categoryIdMap = new Map(categoryRows.map(row => [row.slug, Number(row.id)]));

  for (const item of partners) {
    await connection.execute(`
      INSERT INTO partners (slug, name, website_url, description)
      VALUES (?, ?, ?, ?)
    `, [
      item.slug,
      normalizeString(item.name),
      normalizeNullableString(item.website_url),
      normalizeString(item.note),
    ]);
  }

  const [partnerRows] = await connection.query('SELECT id, slug FROM partners');
  const partnerIdMap = new Map(partnerRows.map(row => [row.slug, Number(row.id)]));
  const assetIdMap = new Map();

  for (const item of partners) {
    const partnerId = partnerIdMap.get(item.slug);
    if (!partnerId || !normalizeString(item.logo_url)) continue;
    const [result] = await connection.execute(`
      INSERT INTO partner_logo_assets (
        partner_id, image_url, alt_text, storage_provider, public_id, file_name,
        mime_type, asset_format, width, height, bytes, is_current
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      partnerId,
      normalizeString(item.logo_url),
      normalizeString(item.alt_text || item.name),
      normalizeNullableString(item.logo_storage_provider),
      normalizeNullableString(item.logo_public_id),
      normalizeNullableString(item.logo_file_name),
      normalizeNullableString(item.logo_mime_type),
      normalizeNullableString(item.logo_format),
      item.logo_width == null ? null : parseInteger(item.logo_width, null),
      item.logo_height == null ? null : parseInteger(item.logo_height, null),
      item.logo_bytes == null ? null : parseInteger(item.logo_bytes, null),
      1,
    ]);
    assetIdMap.set(item.slug, Number(result.insertId));
  }

  return {
    categoryIdMap,
    partnerIdMap,
    assetIdMap,
  };
}

async function insertTournamentPartners(connection, partners, maps, tournamentIdMap) {
  const seen = new Set();
  for (const item of partners) {
    const tournamentSlug = normalizeString(item.tournament_slug);
    const tournamentId = tournamentSlug ? tournamentIdMap.get(tournamentSlug) : null;
    const partnerId = maps.partnerIdMap.get(item.slug);
    if (!tournamentId || !partnerId) continue;

    const key = `${tournamentId}:${partnerId}:${normalizeString(item.category) || 'general'}`;
    if (seen.has(key)) continue;
    seen.add(key);

    await connection.execute(`
      INSERT INTO tournament_partners (
        tournament_id, partner_id, category_id, logo_asset_id, sort_order, is_visible
      )
      VALUES (?, ?, ?, ?, ?, ?)
    `, [
      tournamentId,
      partnerId,
      maps.categoryIdMap.get(normalizeString(item.category) || 'general') || null,
      maps.assetIdMap.get(item.slug) || null,
      parseInteger(item.sort_order, 0),
      normalizeBool(item.is_visible, true),
    ]);
  }
}

async function insertPlayoff(connection, playoffRows, tournamentIdMap, clubIdMap) {
  for (const row of playoffRows) {
    const tournamentId = tournamentIdMap.get(row.tournament_slug);
    if (!tournamentId) continue;
    await connection.execute(`
      INSERT INTO tournament_playoff_matches (
        tournament_id, bracket_group, round_group, match_key, sort_order, label,
        home_club_id, away_club_id, home_label, away_label, home_logo_path, away_logo_path,
        home_score, away_score
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      tournamentId,
      normalizeString(row.bracket_group),
      normalizeString(row.round_group),
      normalizeString(row.match_key),
      parseInteger(row.sort_order, 0),
      normalizeString(row.label),
      clubIdMap.get(row.home_team_slug) || null,
      clubIdMap.get(row.away_team_slug) || null,
      normalizeString(row.home_team),
      normalizeString(row.away_team),
      normalizeNullableString(row.home_logo),
      normalizeNullableString(row.away_logo),
      parseInteger(row.home_score, 0),
      parseInteger(row.away_score, 0),
    ]);
  }
}

async function insertPages(connection, pages, sitePagesColumns) {
  const hasSubtitle = sitePagesColumns.has('subtitle');
  const hasBodyHtml = sitePagesColumns.has('body_html');
  const hasContentHtml = sitePagesColumns.has('content_html');
  const hasContentJson = sitePagesColumns.has('content_json');

  for (const item of pages) {
    const columns = ['slug', 'title'];
    const values = [
      normalizeString(item.slug),
      normalizeString(item.title),
    ];

    if (hasSubtitle) {
      columns.push('subtitle');
      values.push(normalizeString(item.subtitle));
    }

    if (hasBodyHtml) {
      columns.push('body_html');
      values.push(normalizeString(item.body_html));
    }

    if (hasContentHtml) {
      columns.push('content_html');
      values.push(normalizeString(item.body_html));
    }

    if (hasContentJson) {
      columns.push('content_json');
      values.push(null);
    }

    const placeholders = columns.map(() => '?').join(', ');
    await connection.execute(`
      INSERT INTO site_pages (${columns.join(', ')})
      VALUES (${placeholders})
    `, values);
  }
}

async function main() {
  requiredEnv(MYSQL_URL, 'MYSQL_URL');

  console.log(`Loading source data from ${SOURCE_API_BASE_URL}`);
  const adminToken = await getAdminToken(SOURCE_API_BASE_URL);
  const source = await loadSourceData(SOURCE_API_BASE_URL, adminToken);
  const publicMatches = await loadPublicMatches(SOURCE_API_BASE_URL);
  source.matches = mergeMatchEvents(source.matches || [], publicMatches);

  console.log('Connecting to MySQL');
  const pool = createMysqlPool(MYSQL_URL);

  try {
    if (APPLY_SCHEMA) {
      console.log('Applying MySQL schema');
      await applySchema(pool);
    }

    await ensureMysqlCompatibility(pool);

    const connection = await pool.getConnection();
    try {
      if (WIPE_TARGET) {
        console.log('Replacing target data');
        await wipeTargetTables(connection);
      }

      await connection.beginTransaction();

      await insertTournaments(connection, source.tournaments || []);
      await insertClubs(connection, source.clubs || []);

      const tournamentIdMap = await loadIdMap(connection, 'tournaments');
      const clubIdMap = await loadIdMap(connection, 'clubs');

      const tournamentClubs = deriveTournamentClubs(source);
      await insertTournamentClubs(connection, tournamentClubs, tournamentIdMap, clubIdMap);
      await insertStandings(connection, source.standings || [], tournamentIdMap, clubIdMap);
      await insertMatches(connection, source.matches || [], tournamentIdMap, clubIdMap);
      await insertMatchEvents(connection, source.matches || []);
      await insertNews(connection, source.news || [], tournamentIdMap);
      await insertAlbums(connection, source.albums || [], tournamentIdMap);

      const partnerMaps = await insertPartners(connection, source.partners || []);
      await insertTournamentPartners(connection, source.partners || [], partnerMaps, tournamentIdMap);
      await insertPlayoff(connection, source.playoff || [], tournamentIdMap, clubIdMap);
      const sitePagesColumns = await getTableColumns(connection, 'site_pages');
      await insertPages(connection, source.pages || [], sitePagesColumns);

      await connection.commit();

      console.log('MySQL migration completed');
      console.log(JSON.stringify({
        tournaments: (source.tournaments || []).length,
        clubs: (source.clubs || []).length,
        derived_tournament_clubs: tournamentClubs.length,
        standings: (source.standings || []).length,
        matches: (source.matches || []).length,
        news: (source.news || []).length,
        albums: (source.albums || []).length,
        partners: (source.partners || []).length,
        playoff: (source.playoff || []).length,
        pages: (source.pages || []).length,
      }, null, 2));
      console.log('Not migrated yet: content_translations');
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } finally {
    await pool.end();
  }
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
