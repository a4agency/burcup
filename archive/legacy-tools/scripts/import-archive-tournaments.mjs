import mysql from 'mysql2/promise';

const MYSQL_URL = process.env.MYSQL_URL || process.env.DATABASE_URL || '';

if (!MYSQL_URL) {
  throw new Error('MYSQL_URL or DATABASE_URL is required');
}

const archiveTournaments = [
  {
    slug: 'burchalkin-cup-2025',
    name: 'Burchalkin Cup 2025',
    season_year: 2025,
    short_label: 'BCUP 2025',
    logo_path: 'images/logo-burchalkin.webp',
    hero_image_url: '',
    description: 'Прошлый розыгрыш турнира 2025 года.',
    start_date: '2025-05-15',
    end_date: '2025-05-17',
    location: 'Санкт-Петербург',
    status: 'completed',
    is_featured: 0,
    countdown_enabled: 0,
    standings_mode: 'auto',
    playoff_mode: 'manual',
  },
  {
    slug: 'burchalkin-cup-2024',
    name: 'Burchalkin Cup 2024',
    season_year: 2024,
    short_label: 'BCUP 2024',
    logo_path: 'images/logo-burchalkin.webp',
    hero_image_url: '',
    description: 'Прошлый розыгрыш турнира 2024 года.',
    start_date: '2024-05-15',
    end_date: '2024-05-17',
    location: 'Санкт-Петербург',
    status: 'archived',
    is_featured: 0,
    countdown_enabled: 0,
    standings_mode: 'auto',
    playoff_mode: 'manual',
  },
  {
    slug: 'burchalkin-cup-2023',
    name: 'Burchalkin Cup 2023',
    season_year: 2023,
    short_label: 'BCUP 2023',
    logo_path: 'images/logo-burchalkin.webp',
    hero_image_url: '',
    description: 'Прошлый розыгрыш турнира 2023 года.',
    start_date: '2023-05-15',
    end_date: '2023-05-17',
    location: 'Санкт-Петербург',
    status: 'archived',
    is_featured: 0,
    countdown_enabled: 0,
    standings_mode: 'auto',
    playoff_mode: 'manual',
  },
  {
    slug: 'burchalkin-cup-2019',
    name: 'Burchalkin Cup 2019',
    season_year: 2019,
    short_label: 'BCUP 2019',
    logo_path: 'images/logo-burchalkin.webp',
    hero_image_url: '',
    description: 'Прошлый розыгрыш турнира 2019 года.',
    start_date: '2019-05-15',
    end_date: '2019-05-17',
    location: 'Санкт-Петербург',
    status: 'archived',
    is_featured: 0,
    countdown_enabled: 0,
    standings_mode: 'auto',
    playoff_mode: 'manual',
  },
  {
    slug: 'burchalkin-cup-2018',
    name: 'Burchalkin Cup 2018',
    season_year: 2018,
    short_label: 'BCUP 2018',
    logo_path: 'images/logo-burchalkin.webp',
    hero_image_url: '',
    description: 'Прошлый розыгрыш турнира 2018 года.',
    start_date: '2018-05-15',
    end_date: '2018-05-17',
    location: 'Санкт-Петербург',
    status: 'archived',
    is_featured: 0,
    countdown_enabled: 0,
    standings_mode: 'auto',
    playoff_mode: 'manual',
  },
];

function createPool(connectionString) {
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

const pool = createPool(MYSQL_URL);

try {
  for (const item of archiveTournaments) {
    await pool.execute(
      `
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
      `,
      [
        item.slug,
        item.name,
        item.season_year,
        item.short_label,
        item.logo_path,
        item.hero_image_url,
        item.description,
        item.start_date,
        item.end_date,
        item.location,
        item.status,
        item.is_featured,
        item.countdown_enabled,
        item.standings_mode,
        item.playoff_mode,
      ],
    );
  }

  const [rows] = await pool.query(
    'SELECT slug, name, season_year, status FROM tournaments ORDER BY season_year DESC, id DESC'
  );
  console.log(JSON.stringify(rows, null, 2));
} finally {
  await pool.end();
}
