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

const standingsQuery = `
  SELECT
    s.group_name,
    s.position,
    s.played,
    s.goals_for,
    s.goals_against,
    s.points,
    t.name AS team,
    t.logo_path AS logo
  FROM standings s
  JOIN teams t ON t.id = s.team_id
  ORDER BY s.group_name, s.position;
`;

const matchesQuery = `
  SELECT
    m.id,
    m.stage_name,
    TO_CHAR(m.match_date, 'YYYY-MM-DD') AS match_date,
    TO_CHAR(m.match_time, 'HH24:MI') AS match_time,
    m.status,
    m.status_label,
    home_team.name AS home_team,
    home_team.logo_path AS home_logo,
    away_team.name AS away_team,
    away_team.logo_path AS away_logo,
    m.home_score,
    m.away_score,
    m.venue,
    m.video_url,
    m.summary,
    COALESCE(
      JSON_AGG(me.description ORDER BY me.sort_order) FILTER (WHERE me.id IS NOT NULL),
      '[]'::json
    ) AS events
  FROM matches m
  JOIN teams home_team ON home_team.id = m.home_team_id
  JOIN teams away_team ON away_team.id = m.away_team_id
  LEFT JOIN match_events me ON me.match_id = m.id
  GROUP BY
    m.id,
    m.stage_name,
    m.match_date,
    m.match_time,
    m.status,
    m.status_label,
    home_team.name,
    home_team.logo_path,
    away_team.name,
    away_team.logo_path,
    m.home_score,
    m.away_score,
    m.venue,
    m.video_url,
    m.summary
  ORDER BY m.match_date NULLS FIRST, m.match_time NULLS FIRST, m.id;
`;

const newsQuery = `
  SELECT
    id,
    slug,
    TO_CHAR(published_on, 'YYYY-MM-DD') AS published_on,
    title,
    excerpt,
    body,
    link_path,
    image_url,
    is_published
  FROM news_articles
  WHERE is_published = TRUE
  ORDER BY published_on DESC NULLS LAST, id;
`;

const resultsQuery = `
  SELECT
    stage_name,
    match_label,
    home_score,
    away_score,
    display_order
  FROM results
  ORDER BY display_order, id;
`;

app.get('/', (req, res) => {
  res.json({
    service: 'burchalkin-cup-railway-api',
    status: 'ok',
    endpoints: [
      '/health',
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

app.get('/api/standings', async (req, res, next) => {
  try {
    const { rows } = await pool.query(standingsQuery);
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
    const { rows } = await pool.query(matchesQuery);
    res.json(rows.map(row => ({
      id: Number(row.id),
      date: row.match_date || '',
      time: row.match_time || '',
      status: row.status,
      status_label: row.status_label,
      home_team: row.home_team,
      home_logo: row.home_logo,
      away_team: row.away_team,
      away_logo: row.away_logo,
      score: `${row.home_score}:${row.away_score}`,
      group: row.stage_name || '',
      video: row.video_url || '',
      summary: row.summary || '',
      venue: row.venue || '',
      events: row.events || [],
    })));
  } catch (error) {
    next(error);
  }
});

app.get('/api/news', async (req, res, next) => {
  try {
    const { rows } = await pool.query(newsQuery);
    res.json(rows.map(row => ({
      id: Number(row.id),
      date: row.published_on || '',
      title: row.title,
      excerpt: row.excerpt,
      body: row.body || '',
      link: row.link_path,
      image: row.image_url || '',
      slug: row.slug,
    })));
  } catch (error) {
    next(error);
  }
});

app.get('/api/results', async (req, res, next) => {
  try {
    const { rows } = await pool.query(resultsQuery);
    res.json(rows.map(row => ({
      stage: row.stage_name,
      match: row.match_label,
      score: `${row.home_score}:${row.away_score}`,
      display_order: row.display_order,
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
