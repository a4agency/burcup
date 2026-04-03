require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const port = Number(process.env.PORT || 3000);
const databaseUrl = process.env.DATABASE_URL;

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

app.use(cors({
  origin(origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins === '*' || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Origin not allowed by CORS'));
  }
}));

app.use(express.json());

function normalizeDate(value) {
  return value || '';
}

function normalizeTime(value) {
  return value || '';
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
      '/api/results'
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
  const statusCode = error.message === 'Origin not allowed by CORS' ? 403 : 500;
  console.error(error);
  res.status(statusCode).json({
    error: statusCode === 403 ? 'CORS origin is not allowed' : 'Internal server error'
  });
});

app.listen(port, () => {
  console.log(`API is running on port ${port}`);
});
