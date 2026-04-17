<?php
declare(strict_types=1);

require_once __DIR__ . '/../../app/bootstrap.php';
require_once __DIR__ . '/../../app/Database.php';
require_once __DIR__ . '/../../app/Http/Response.php';
require_once __DIR__ . '/../../app/Support.php';
require_once __DIR__ . '/../../app/Repositories/BaseRepository.php';
require_once __DIR__ . '/../../app/Repositories/TournamentsRepository.php';
require_once __DIR__ . '/../../app/Repositories/ClubsRepository.php';
require_once __DIR__ . '/../../app/Repositories/PagesRepository.php';
require_once __DIR__ . '/../../app/Repositories/MatchesRepository.php';
require_once __DIR__ . '/../../app/Repositories/NewsRepository.php';
require_once __DIR__ . '/../../app/Repositories/MediaRepository.php';
require_once __DIR__ . '/../../app/Repositories/PartnersRepository.php';
require_once __DIR__ . '/../../app/Repositories/AdminMutationsRepository.php';
require_once __DIR__ . '/../../app/Controllers/AdminController.php';

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
$matches = new MatchesRepository($pdo);
$news = new NewsRepository($pdo);
$media = new MediaRepository($pdo);
$partners = new PartnersRepository($pdo);
$mutations = new AdminMutationsRepository($pdo);
$admin = new AdminController($pdo, $tournaments, $clubs, $matches, $news, $media, $partners, $pages, $mutations);

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
        $standings = $matches->standings($m[1]);
        $playoff = $matches->playoff($m[1]);
        $matchRows = $matches->all($m[1]);
        $newsRows = $news->all(false, $m[1]);
        $partnerGroups = $partners->groupedByTournamentSlug($m[1]);
        Response::json(array_merge($row, [
            'standings' => $standings,
            'playoff' => $playoff,
            'matches' => $matchRows,
            'news' => $newsRows,
            'partners' => $partnerGroups,
        ]));
    }

    if ($method === 'GET' && preg_match('#^/tournaments/([^/]+)/standings$#', $path, $m)) {
        Response::json($matches->standings($m[1]));
    }

    if ($method === 'GET' && preg_match('#^/tournaments/([^/]+)/playoff$#', $path, $m)) {
        Response::json($matches->playoff($m[1]));
    }

    if ($method === 'GET' && preg_match('#^/tournaments/([^/]+)/matches$#', $path, $m)) {
        Response::json($matches->all($m[1]));
    }

    if ($method === 'GET' && preg_match('#^/tournaments/([^/]+)/news$#', $path, $m)) {
        Response::json($news->all(false, $m[1]));
    }

    if ($method === 'GET' && preg_match('#^/tournaments/([^/]+)/partners$#', $path, $m)) {
        Response::json($partners->groupedByTournamentSlug($m[1]));
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

    if ($method === 'GET' && preg_match('#^/clubs/([^/]+)/matches$#', $path, $m)) {
        Response::json($matches->byClubSlug($m[1]));
    }

    if ($method === 'GET' && $path === '/standings') {
        Response::json($matches->standings(null));
    }

    if ($method === 'GET' && $path === '/playoff') {
        Response::json($matches->playoff(null));
    }

    if ($method === 'GET' && $path === '/matches') {
        Response::json($matches->all(null));
    }

    if ($method === 'GET' && $path === '/news') {
        Response::json($news->all(false, null));
    }

    if ($method === 'GET' && $path === '/media/albums') {
        Response::json($media->albums(true));
    }

    if ($method === 'GET' && preg_match('#^/media/albums/([^/]+)$#', $path, $m)) {
        $row = $media->album($m[1]);
        if (!$row) {
            Response::json(['error' => 'Album not found'], 404);
        }
        Response::json($row);
    }

    if ($method === 'GET' && $path === '/results') {
        Response::json($matches->results(null));
    }

    if ($method === 'GET' && preg_match('#^/pages/([^/]+)$#', $path, $m)) {
        Response::json($pages->bySlug($m[1]));
    }

    if ($method === 'POST' && $path === '/admin/session') {
        Response::json($admin->login(json_decode((string) file_get_contents('php://input'), true) ?: []));
    }

    if ($method === 'GET' && preg_match('#^/admin/([^/]+)$#', $path, $m)) {
        $token = $_SERVER['HTTP_X_ADMIN_TOKEN'] ?? '';
        if (api_normalize_string($token) === '' || api_normalize_string($token) !== api_normalize_string(get_env('ADMIN_TOKEN'))) {
            Response::json(['error' => 'Admin token is invalid or missing'], 401);
        }
        try {
            Response::json($admin->readResource($m[1]));
        } catch (RuntimeException $error) {
            if ($error->getMessage() === 'Unknown admin resource') {
                Response::json(['error' => $error->getMessage()], 404);
            }
            throw $error;
        }
    }

    if ($method === 'PUT' && preg_match('#^/admin/([^/]+)$#', $path, $m)) {
        $token = $_SERVER['HTTP_X_ADMIN_TOKEN'] ?? '';
        if (api_normalize_string($token) === '' || api_normalize_string($token) !== api_normalize_string(get_env('ADMIN_TOKEN'))) {
            Response::json(['error' => 'Admin token is invalid or missing'], 401);
        }
        $payload = json_decode((string) file_get_contents('php://input'), true);
        if (!is_array($payload) || !array_is_list($payload)) {
            Response::json(['error' => 'Payload must be an array'], 400);
        }
        try {
            Response::json($admin->saveResource($m[1], $payload));
        } catch (RuntimeException $error) {
            if ($error->getMessage() === 'Unknown admin resource') {
                Response::json(['error' => $error->getMessage()], 404);
            }
            throw $error;
        }
    }

    Response::json(['error' => 'Not found', 'path' => $path], 404);
} catch (Throwable $error) {
    Response::json(['error' => $error->getMessage()], 500);
}
