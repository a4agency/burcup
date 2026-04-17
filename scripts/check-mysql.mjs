import mysql from 'mysql2/promise';

const MYSQL_URL = process.env.MYSQL_URL || process.env.DATABASE_URL || '';

function requiredEnv(value, name) {
  if (!value) throw new Error(`${name} is required`);
  return value;
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
    connectionLimit: 2,
    charset: 'utf8mb4',
  });
}

async function queryCount(connection, table) {
  const [rows] = await connection.query(`SELECT COUNT(*) AS count FROM \`${table}\``);
  return Number(rows[0]?.count || 0);
}

async function querySample(connection, sql) {
  const [rows] = await connection.query(sql);
  return rows;
}

async function main() {
  requiredEnv(MYSQL_URL, 'MYSQL_URL');
  const pool = createMysqlPool(MYSQL_URL);

  try {
    const connection = await pool.getConnection();
    try {
      const tables = [
        'tournaments',
        'clubs',
        'tournament_clubs',
        'tournament_standings',
        'matches',
        'match_events',
        'news_articles',
        'news_article_photos',
        'media_albums',
        'media_album_photos',
        'partners',
        'partner_logo_assets',
        'tournament_partners',
        'tournament_playoff_matches',
        'content_translations',
        'site_pages',
      ];

      const counts = {};
      for (const table of tables) {
        counts[table] = await queryCount(connection, table);
      }

      const samples = {
        tournaments: await querySample(connection, `
          SELECT slug, name, season_year, status
          FROM tournaments
          ORDER BY season_year DESC, id DESC
          LIMIT 3
        `),
        clubs: await querySample(connection, `
          SELECT slug, name, city, country
          FROM clubs
          ORDER BY name
          LIMIT 5
        `),
        standings: await querySample(connection, `
          SELECT t.slug AS tournament_slug, c.slug AS club_slug, ts.group_name, ts.position, ts.points
          FROM tournament_standings ts
          JOIN tournaments t ON t.id = ts.tournament_id
          JOIN clubs c ON c.id = ts.club_id
          ORDER BY t.slug, ts.group_name, ts.position
          LIMIT 8
        `),
        matches: await querySample(connection, `
          SELECT m.id, t.slug AS tournament_slug, home.slug AS home_slug, away.slug AS away_slug,
                 m.match_date, m.match_time, m.status, m.home_score, m.away_score
          FROM matches m
          JOIN tournaments t ON t.id = m.tournament_id
          JOIN clubs home ON home.id = m.home_club_id
          JOIN clubs away ON away.id = m.away_club_id
          ORDER BY m.match_date, m.match_time, m.id
          LIMIT 6
        `),
        match_events: await querySample(connection, `
          SELECT match_id, sort_order, minute_label, event_type, title, description
          FROM match_events
          ORDER BY match_id, sort_order, id
          LIMIT 10
        `),
        news: await querySample(connection, `
          SELECT id, slug, published_on, title, video_url
          FROM news_articles
          ORDER BY published_on DESC, id DESC
          LIMIT 5
        `),
        albums: await querySample(connection, `
          SELECT slug, title, published_on, is_visible
          FROM media_albums
          ORDER BY sort_order, id
          LIMIT 5
        `),
        partners: await querySample(connection, `
          SELECT p.slug, p.name, p.website_url, pc.slug AS category_slug
          FROM tournament_partners tp
          JOIN partners p ON p.id = tp.partner_id
          LEFT JOIN partner_categories pc ON pc.id = tp.category_id
          ORDER BY pc.slug, tp.sort_order, p.name
          LIMIT 10
        `),
        playoff: await querySample(connection, `
          SELECT t.slug AS tournament_slug, match_key, label, home_score, away_score
          FROM tournament_playoff_matches pm
          JOIN tournaments t ON t.id = pm.tournament_id
          ORDER BY pm.sort_order, pm.id
          LIMIT 8
        `),
        content_translations: await querySample(connection, `
          SELECT source_lang, target_lang, source_text, translated_text
          FROM content_translations
          ORDER BY id
          LIMIT 5
        `),
        pages: await querySample(connection, `
          SELECT slug, title
          FROM site_pages
          ORDER BY id
          LIMIT 10
        `),
      };

      console.log(JSON.stringify({ counts, samples }, null, 2));
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
