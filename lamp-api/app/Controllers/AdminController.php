<?php
declare(strict_types=1);

final class AdminController
{
    public function __construct(
        private readonly PDO $pdo,
        private readonly TournamentsRepository $tournaments,
        private readonly ClubsRepository $clubs,
        private readonly MatchesRepository $matches,
        private readonly NewsRepository $news,
        private readonly MediaRepository $media,
        private readonly PartnersRepository $partners,
        private readonly PagesRepository $pages,
        private readonly AdminMutationsRepository $mutations,
    ) {
    }

    public function login(array $body): array
    {
        $adminToken = api_normalize_string(get_env('ADMIN_TOKEN'));
        if ($adminToken === '') {
            throw new RuntimeException('ADMIN_TOKEN is not configured on the server');
        }

        $adminPassword = api_normalize_string(get_env('ADMIN_PASSWORD', 'agency'));
        $password = api_normalize_string($body['password'] ?? '');
        if ($password === '' || $password !== $adminPassword) {
            throw new RuntimeException('Invalid admin password');
        }

        return ['token' => $adminToken];
    }

    public function readResource(string $resource): array
    {
        return match ($resource) {
            'tournaments' => $this->tournaments->all(),
            'archive_tournaments' => $this->tournaments->all(),
            'clubs' => $this->clubs->all(),
            'matches' => $this->matches->all(),
            'archive_matches' => $this->matches->all(),
            'news' => $this->news->all(true),
            'partners' => $this->partners->all(),
            'partners_media' => $this->partners->all(),
            'standings' => $this->matches->allStandings(),
            'archive_standings' => $this->matches->allStandings(),
            'playoff' => $this->matches->playoff(null),
            'albums' => $this->media->albumsWithPhotos(false),
            'media' => $this->matches->all(),
            'media_albums' => $this->media->albumsWithPhotos(false),
            'pages' => $this->pages->all(),
            default => throw new RuntimeException('Unknown admin resource'),
        };
    }

    public function saveResource(string $resource, array $payload): array
    {
        if (!array_is_list($payload)) {
            throw new RuntimeException('Payload must be a list');
        }

        $count = $this->mutations->saveResource($resource, $payload);
        return [
            'ok' => true,
            'resource' => $resource,
            'count' => $count,
            'data' => $payload,
        ];
    }
}
