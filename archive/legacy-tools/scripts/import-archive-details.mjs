import fs from 'fs';
import path from 'path';
import vm from 'vm';
import mysql from 'mysql2/promise';
import { fileURLToPath } from 'url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const SITE_JS_PATH = path.join(ROOT, 'js', 'site.js');

function loadArchiveData() {
  const code = fs.readFileSync(SITE_JS_PATH, 'utf8');
  const start = code.indexOf('const ARCHIVE_TOURNAMENTS = ');
  const end = code.indexOf('function pluralizeRu', start);

  if (start === -1 || end === -1) {
    throw new Error('Не удалось найти ARCHIVE_TOURNAMENTS в js/site.js');
  }

  const snippet = code
    .slice(start, end)
    .replace('const ARCHIVE_TOURNAMENTS =', 'globalThis.ARCHIVE_TOURNAMENTS =')
    .replace('const ARCHIVE_TOURNAMENT_SLUG_BY_YEAR =', 'globalThis.ARCHIVE_TOURNAMENT_SLUG_BY_YEAR =');

  const context = { console, globalThis: {} };
  vm.createContext(context);
  vm.runInContext(snippet, context);

  return {
    tournaments: context.globalThis.ARCHIVE_TOURNAMENTS || {},
    slugByYear: context.globalThis.ARCHIVE_TOURNAMENT_SLUG_BY_YEAR || {},
  };
}

function normalizeArchiveDetail(entry = {}, year) {
  const detail = entry.detail && typeof entry.detail === 'object' ? entry.detail : entry;
  return {
    title: cleanupText(entry.title, cleanupText(detail.title, `Burchalkin Cup ${year}`)),
    season: cleanupText(entry.season, cleanupText(detail.season)),
    description: cleanupText(entry.description, cleanupText(detail.description)),
    status: cleanupText(entry.status, cleanupText(detail.status)),
    logo: cleanupText(entry.logo, cleanupText(detail.logo)),
    hero_image: cleanupText(entry.hero_image, cleanupText(detail.hero_image)),
    start_date: cleanupText(entry.start_date, cleanupText(detail.start_date)),
    end_date: cleanupText(entry.end_date, cleanupText(detail.end_date)),
    location: cleanupText(entry.location, cleanupText(detail.location)),
    clubs_count: Number(detail.clubs_count ?? entry.clubs_count ?? 0),
    matches_count: Number(detail.matches_count ?? entry.matches_count ?? 0),
    clubs: Array.isArray(detail.clubs) ? detail.clubs : [],
    standings: Array.isArray(detail.standings) ? detail.standings : [],
    grouped_standings: Array.isArray(detail.grouped_standings) ? detail.grouped_standings : [],
    playoff_matches: Array.isArray(detail.playoff_matches)
      ? detail.playoff_matches
      : (Array.isArray(detail.playoff) ? detail.playoff : []),
    matches: Array.isArray(detail.matches) ? detail.matches : [],
  };
}

function normalizeStatus(statusLabel = '') {
  const value = String(statusLabel).trim().toLowerCase();
  if (value.includes('заверш')) return 'done';
  if (value.includes('эфир')) return 'live';
  return 'soon';
}

function parseScore(score = '') {
  const match = String(score).match(/(\d+)\s*[:\-]\s*(\d+)/);
  if (!match) {
    return { home: 0, away: 0 };
  }
  return {
    home: Number(match[1]) || 0,
    away: Number(match[2]) || 0,
  };
}

function cleanupText(value, fallback = '') {
  const normalized = String(value ?? '').trim();
  return normalized || fallback;
}

function deriveTournamentStatus(year) {
  if (year === 2025) return 'completed';
  return 'archived';
}

function mapLegacyClub(club = {}, position = null) {
  return {
    slug: cleanupText(club.slug, `archive-club-${Date.now()}`),
    name: cleanupText(club.name, cleanupText(club.team, 'Клуб')),
    logo_path: cleanupText(club.logo, cleanupText(club.logo_path)),
    city: cleanupText(club.city),
    country: cleanupText(club.country),
    description: cleanupText(
      club.description,
      'Участник прошлых розыгрышей турнира.'
    ),
    position,
  };
}

function makeArchiveMatchId(year, index) {
  return Number(`${year}${String(index + 1).padStart(3, '0')}`);
}

async function ensureClub(connection, club) {
  const [rows] = await connection.execute(
    'SELECT id FROM clubs WHERE slug = ? LIMIT 1',
    [club.slug]
  );

  if (rows.length) {
    await connection.execute(
      `UPDATE clubs
       SET name = ?, logo_path = ?, city = ?, country = ?, description = ?, is_active = 1
       WHERE id = ?`,
      [
        club.name,
        club.logo_path,
        club.city,
        club.country,
        club.description,
        rows[0].id,
      ]
    );
    return rows[0].id;
  }

  const [result] = await connection.execute(
    `INSERT INTO clubs
      (slug, name, logo_path, city, country, description, is_active)
     VALUES (?, ?, ?, ?, ?, ?, 1)`,
    [
      club.slug,
      club.name,
      club.logo_path,
      club.city,
      club.country,
      club.description,
    ]
  );

  return result.insertId;
}

async function upsertTournament(connection, year, slug, detail) {
  const [rows] = await connection.execute(
    'SELECT id FROM tournaments WHERE slug = ? LIMIT 1',
    [slug]
  );

  const payload = {
    slug,
    name: cleanupText(detail.title, `Burchalkin Cup ${year}`),
    season_year: year,
    short_label: `BCUP ${year}`,
    logo_path: cleanupText(detail.logo, 'images/logo-burchalkin.webp'),
    hero_image_url: cleanupText(detail.hero_image),
    description: cleanupText(
      detail.description,
      `Прошлый розыгрыш турнира ${year} года.`
    ),
    start_date: cleanupText(detail.start_date, `${year}-05-15`),
    end_date: cleanupText(detail.end_date, `${year}-05-17`),
    location: cleanupText(detail.location, 'Санкт-Петербург'),
    status: deriveTournamentStatus(year),
    is_featured: 0,
    countdown_enabled: 0,
    standings_mode: 'auto',
    playoff_mode: 'manual',
  };

  if (rows.length) {
    await connection.execute(
      `UPDATE tournaments
       SET name = ?, season_year = ?, short_label = ?, logo_path = ?, hero_image_url = ?, description = ?,
           start_date = ?, end_date = ?, location = ?, status = ?, is_featured = ?,
           countdown_enabled = ?, standings_mode = ?, playoff_mode = ?
       WHERE id = ?`,
      [
        payload.name,
        payload.season_year,
        payload.short_label,
        payload.logo_path,
        payload.hero_image_url,
        payload.description,
        payload.start_date,
        payload.end_date,
        payload.location,
        payload.status,
        payload.is_featured,
        payload.countdown_enabled,
        payload.standings_mode,
        payload.playoff_mode,
        rows[0].id,
      ]
    );
    return rows[0].id;
  }

  const [result] = await connection.execute(
    `INSERT INTO tournaments
      (slug, name, season_year, short_label, logo_path, hero_image_url, description, start_date, end_date,
       location, status, is_featured, countdown_enabled, standings_mode, playoff_mode)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      payload.slug,
      payload.name,
      payload.season_year,
      payload.short_label,
      payload.logo_path,
      payload.hero_image_url,
      payload.description,
      payload.start_date,
      payload.end_date,
      payload.location,
      payload.status,
      payload.is_featured,
      payload.countdown_enabled,
      payload.standings_mode,
      payload.playoff_mode,
    ]
  );

  return result.insertId;
}

function extractStandings(detail) {
  if (Array.isArray(detail.grouped_standings) && detail.grouped_standings.length) {
    return detail.grouped_standings.flatMap((groupBlock, groupIndex) => {
      const groupName = cleanupText(
        groupBlock.group,
        cleanupText(groupBlock.label, `Группа ${groupIndex + 1}`)
      );
      return (groupBlock.rows || []).map((row, rowIndex) => ({
        groupName,
        row,
        sortOrder: rowIndex + 1,
      }));
    });
  }

  return (detail.standings || []).map((row, rowIndex) => ({
    groupName: cleanupText(row.group, 'Общая таблица'),
    row,
    sortOrder: rowIndex + 1,
  }));
}

async function replaceTournamentClubs(connection, tournamentId, detail) {
  await connection.execute('DELETE FROM tournament_clubs WHERE tournament_id = ?', [tournamentId]);

  for (const [index, clubRaw] of (detail.clubs || []).entries()) {
    const club = mapLegacyClub(clubRaw, clubRaw.position ?? index + 1);
    const clubId = await ensureClub(connection, club);
    await connection.execute(
      `INSERT INTO tournament_clubs
        (tournament_id, club_id, group_name, seeded_order, notes, created_at)
       VALUES (?, ?, ?, ?, ?, NOW())`,
      [
        tournamentId,
        clubId,
        cleanupText(clubRaw.group),
        club.position ?? index + 1,
        cleanupText(clubRaw.notes, ''),
      ]
    );
  }
}

async function replaceStandings(connection, tournamentId, detail) {
  await connection.execute('DELETE FROM tournament_standings WHERE tournament_id = ?', [tournamentId]);

  const rows = extractStandings(detail);
  for (const [index, item] of rows.entries()) {
    const club = mapLegacyClub(item.row, item.row.position ?? index + 1);
    const clubId = await ensureClub(connection, club);
    await connection.execute(
      `INSERT INTO tournament_standings
        (tournament_id, club_id, group_name, position, played, won, drawn, lost,
         goals_for, goals_against, points, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        tournamentId,
        clubId,
        item.groupName,
        Number(item.row.position ?? index + 1),
        Number(item.row.played ?? 0),
        Number(item.row.won ?? 0),
        Number(item.row.drawn ?? 0),
        Number(item.row.lost ?? 0),
        Number(item.row.goals_for ?? 0),
        Number(item.row.goals_against ?? 0),
        Number(item.row.points ?? 0),
      ]
    );
  }
}

async function replacePlayoff(connection, tournamentId, detail) {
  await connection.execute('DELETE FROM tournament_playoff_matches WHERE tournament_id = ?', [tournamentId]);

  for (const [index, item] of (detail.playoff_matches || []).entries()) {
    const homeSlug = cleanupText(item.home_team_slug);
    const awaySlug = cleanupText(item.away_team_slug);

    let homeClubId = null;
    let awayClubId = null;

    if (homeSlug) {
      homeClubId = await ensureClub(connection, mapLegacyClub({
        slug: homeSlug,
        name: item.home_team,
        logo: item.home_logo,
      }));
    }

    if (awaySlug) {
      awayClubId = await ensureClub(connection, mapLegacyClub({
        slug: awaySlug,
        name: item.away_team,
        logo: item.away_logo,
      }));
    }

    await connection.execute(
      `INSERT INTO tournament_playoff_matches
        (tournament_id, bracket_group, round_group, match_key, sort_order, label,
         home_club_id, away_club_id, home_label, away_label, home_logo_path, away_logo_path, home_score, away_score,
         created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        tournamentId,
        cleanupText(item.bracket_group, 'top'),
        cleanupText(item.round_group, 'semifinal'),
        cleanupText(item.match_key, `archive_${tournamentId}_${index + 1}`),
        Number(item.sort_order ?? index + 1),
        cleanupText(item.label, `Матч ${index + 1}`),
        homeClubId,
        awayClubId,
        cleanupText(item.home_team),
        cleanupText(item.away_team),
        cleanupText(item.home_logo),
        cleanupText(item.away_logo),
        Number(item.home_score ?? 0),
        Number(item.away_score ?? 0),
      ]
    );
  }
}

async function replaceMatches(connection, tournamentId, year, detail) {
  await connection.execute('DELETE FROM matches WHERE tournament_id = ?', [tournamentId]);

  for (const [index, item] of (detail.matches || []).entries()) {
    const homeClubId = await ensureClub(
      connection,
      mapLegacyClub({
        slug: item.home_team_slug,
        name: item.home_team,
        logo: item.home_logo,
      })
    );
    const awayClubId = await ensureClub(
      connection,
      mapLegacyClub({
        slug: item.away_team_slug,
        name: item.away_team,
        logo: item.away_logo,
      })
    );

    const score = parseScore(item.score);
    const matchId = makeArchiveMatchId(year, index);

    await connection.execute(
      `INSERT INTO matches
        (id, tournament_id, stage_name, round_name, matchday_label, match_date, match_time,
         venue, status, status_label, home_club_id, away_club_id, home_score, away_score,
         summary, video_url, review_video_url, interview_video_url, sort_order, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        matchId,
        tournamentId,
        cleanupText(item.round || item.group, 'Матч'),
        cleanupText(item.group || item.round, 'Матч'),
        cleanupText(item.day_label),
        cleanupText(item.date, `${year}-05-15`),
        cleanupText(item.time, '10:00'),
        cleanupText(item.venue, 'Стадион "Алмаз-Антей"'),
        normalizeStatus(item.status_label),
        cleanupText(item.status_label, 'Завершён'),
        homeClubId,
        awayClubId,
        score.home,
        score.away,
        cleanupText(item.summary),
        cleanupText(item.stream_url || item.video_url),
        cleanupText(item.highlights_url || item.review_video_url),
        cleanupText(item.interview_url),
        Number(item.sort_order ?? index + 1),
      ]
    );
  }
}

async function main() {
  const mysqlUrl = process.env.MYSQL_URL;
  if (!mysqlUrl) {
    throw new Error('Нужна переменная MYSQL_URL');
  }

  const { tournaments, slugByYear } = loadArchiveData();
  const years = [2025, 2024, 2023, 2019, 2018];
  const connection = await mysql.createConnection(mysqlUrl);

  try {
    for (const year of years) {
      const source = tournaments[String(year)];
      const slug = slugByYear[String(year)] || `burchalkin-cup-${year}`;

      if (!source) {
        console.warn(`Пропускаю ${year}: нет данных`);
        continue;
      }

      const detail = normalizeArchiveDetail(source, year);

      await connection.beginTransaction();
      try {
        const tournamentId = await upsertTournament(connection, year, slug, detail);
        await replaceTournamentClubs(connection, tournamentId, detail);
        await replaceStandings(connection, tournamentId, detail);
        await replacePlayoff(connection, tournamentId, detail);
        await replaceMatches(connection, tournamentId, year, detail);
        await connection.commit();
        console.log(`Импортирован архив ${year} (tournament_id=${tournamentId})`);
      } catch (error) {
        await connection.rollback();
        throw error;
      }
    }
  } finally {
    await connection.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
