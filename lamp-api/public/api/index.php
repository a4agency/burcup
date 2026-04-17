<?php
declare(strict_types=1);

require_once __DIR__ . '/../../app/bootstrap.php';
require_once __DIR__ . '/../../app/Database.php';
require_once __DIR__ . '/../../app/Http/Response.php';
require_once __DIR__ . '/../../app/Repositories/BaseRepository.php';
require_once __DIR__ . '/../../app/Repositories/TournamentsRepository.php';
require_once __DIR__ . '/../../app/Repositories/ClubsRepository.php';
require_once __DIR__ . '/../../app/Repositories/PagesRepository.php';

$origin = get_env('CORS_ORIGIN', '*');
header('Access-Control-Allow-Origin: ' . ($origin === '' ? '*' : $origin));
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Admin-Token');
header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
header('Vary: Origin');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

$pdo = Database::pdo();
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$path = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/';
$path = preg_replace('#^/api#', '', $path);
$path = '/' . trim($path, '/');

$tournaments = new TournamentsRepository($pdo);
$clubs = new ClubsRepository($pdo);
$pages = new PagesRepository($pdo);

try {
    if ($path === '/health') {
        Response::json(['ok' => true]);
    }

    if ($method === 'GET' && $path === '/tournaments') {
        Response::json($tournaments->all());
    }

    if ($method === 'GET' && preg_match('#^/tournaments/([^/]+)$#', $path, $m)) {
        $row = $tournaments->bySlug($m[1]);
        if (!$row) {
            Response::json(['error' => 'Tournament not found'], 404);
        }
        Response::json($row);
    }

    if ($method === 'GET' && $path === '/clubs') {
        Response::json($clubs->all());
    }

    if ($method === 'GET' && preg_match('#^/clubs/([^/]+)$#', $path, $m)) {
        $row = $clubs->bySlug($m[1]);
        if (!$row) {
            Response::json(['error' => 'Club not found'], 404);
        }
        Response::json($row);
    }

    if ($method === 'GET' && preg_match('#^/pages/([^/]+)$#', $path, $m)) {
        Response::json($pages->bySlug($m[1]));
    }

    Response::json(['error' => 'Not found', 'path' => $path], 404);
} catch (Throwable $error) {
    Response::json(['error' => $error->getMessage()], 500);
}

