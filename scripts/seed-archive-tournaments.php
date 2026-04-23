<?php
declare(strict_types=1);

$mysqlUrl = getenv('MYSQL_URL') ?: getenv('DATABASE_URL') ?: '';
if ($mysqlUrl === '') {
    fwrite(STDERR, "MYSQL_URL or DATABASE_URL is required\n");
    exit(1);
}

$parts = parse_url($mysqlUrl);
if (!is_array($parts) || (($parts['scheme'] ?? '') !== 'mysql')) {
    fwrite(STDERR, "Expected mysql:// DSN\n");
    exit(1);
}

$host = (string) ($parts['host'] ?? '');
$port = (int) ($parts['port'] ?? 3306);
$database = ltrim((string) ($parts['path'] ?? ''), '/');
$user = rawurldecode((string) ($parts['user'] ?? ''));
$password = rawurldecode((string) ($parts['pass'] ?? ''));

if ($host === '' || $database === '' || $user === '') {
    fwrite(STDERR, "Incomplete MySQL connection data\n");
    exit(1);
}

$pdo = new PDO(
    sprintf('mysql:host=%s;port=%d;dbname=%s;charset=utf8mb4', $host, $port, $database),
    $user,
    $password,
    [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]
);

$items = [
    [
        'slug' => 'burchalkin-cup-2025',
        'name' => 'Burchalkin Cup 2025',
        'season_year' => 2025,
        'short_label' => 'BCUP 2025',
        'logo_path' => 'images/logo-burchalkin.webp',
        'hero_image_url' => '',
        'description' => 'Прошлый розыгрыш турнира 2025 года.',
        'start_date' => '2025-05-15',
        'end_date' => '2025-05-17',
        'location' => 'Санкт-Петербург',
        'status' => 'completed',
        'is_featured' => 0,
        'countdown_enabled' => 0,
        'standings_mode' => 'auto',
        'playoff_mode' => 'manual',
    ],
    [
        'slug' => 'burchalkin-cup-2024',
        'name' => 'Burchalkin Cup 2024',
        'season_year' => 2024,
        'short_label' => 'BCUP 2024',
        'logo_path' => 'images/logo-burchalkin.webp',
        'hero_image_url' => '',
        'description' => 'Прошлый розыгрыш турнира 2024 года.',
        'start_date' => '2024-05-15',
        'end_date' => '2024-05-17',
        'location' => 'Санкт-Петербург',
        'status' => 'archived',
        'is_featured' => 0,
        'countdown_enabled' => 0,
        'standings_mode' => 'auto',
        'playoff_mode' => 'manual',
    ],
    [
        'slug' => 'burchalkin-cup-2023',
        'name' => 'Burchalkin Cup 2023',
        'season_year' => 2023,
        'short_label' => 'BCUP 2023',
        'logo_path' => 'images/logo-burchalkin.webp',
        'hero_image_url' => '',
        'description' => 'Прошлый розыгрыш турнира 2023 года.',
        'start_date' => '2023-05-15',
        'end_date' => '2023-05-17',
        'location' => 'Санкт-Петербург',
        'status' => 'archived',
        'is_featured' => 0,
        'countdown_enabled' => 0,
        'standings_mode' => 'auto',
        'playoff_mode' => 'manual',
    ],
    [
        'slug' => 'burchalkin-cup-2019',
        'name' => 'Burchalkin Cup 2019',
        'season_year' => 2019,
        'short_label' => 'BCUP 2019',
        'logo_path' => 'images/logo-burchalkin.webp',
        'hero_image_url' => '',
        'description' => 'Прошлый розыгрыш турнира 2019 года.',
        'start_date' => '2019-05-15',
        'end_date' => '2019-05-17',
        'location' => 'Санкт-Петербург',
        'status' => 'archived',
        'is_featured' => 0,
        'countdown_enabled' => 0,
        'standings_mode' => 'auto',
        'playoff_mode' => 'manual',
    ],
    [
        'slug' => 'burchalkin-cup-2018',
        'name' => 'Burchalkin Cup 2018',
        'season_year' => 2018,
        'short_label' => 'BCUP 2018',
        'logo_path' => 'images/logo-burchalkin.webp',
        'hero_image_url' => '',
        'description' => 'Прошлый розыгрыш турнира 2018 года.',
        'start_date' => '2018-05-15',
        'end_date' => '2018-05-17',
        'location' => 'Санкт-Петербург',
        'status' => 'archived',
        'is_featured' => 0,
        'countdown_enabled' => 0,
        'standings_mode' => 'auto',
        'playoff_mode' => 'manual',
    ],
];

$sql = <<<SQL
INSERT INTO tournaments (
    slug, name, season_year, short_label, logo_path, hero_image_url, description,
    start_date, end_date, location, status, is_featured, countdown_enabled,
    standings_mode, playoff_mode
) VALUES (
    :slug, :name, :season_year, :short_label, :logo_path, :hero_image_url, :description,
    :start_date, :end_date, :location, :status, :is_featured, :countdown_enabled,
    :standings_mode, :playoff_mode
)
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
SQL;

$stmt = $pdo->prepare($sql);
$count = 0;
foreach ($items as $item) {
    $stmt->execute($item);
    $count++;
}

fwrite(STDOUT, "Upserted {$count} archive tournaments\n");
