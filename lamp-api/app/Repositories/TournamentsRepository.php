<?php
declare(strict_types=1);

final class TournamentsRepository extends BaseRepository
{
    private const FALLBACK_ARCHIVE_TOURNAMENTS = [
        [
            'id' => 0,
            'slug' => 'burchalkin-cup-2025',
            'name' => 'Burchalkin Cup 2025',
            'season_year' => 2025,
            'short_label' => 'BCUP 2025',
            'logo' => 'images/logo-burchalkin.webp',
            'hero_image' => '',
            'description' => 'Прошлый розыгрыш турнира 2025 года.',
            'start_date' => '2025-05-15',
            'end_date' => '2025-05-17',
            'location' => 'Санкт-Петербург',
            'status' => 'completed',
            'is_featured' => 0,
            'countdown_enabled' => 0,
            'standings_mode' => 'auto',
            'playoff_mode' => 'manual',
            'clubs_count' => 0,
            'matches_count' => 0,
        ],
        [
            'id' => 0,
            'slug' => 'burchalkin-cup-2024',
            'name' => 'Burchalkin Cup 2024',
            'season_year' => 2024,
            'short_label' => 'BCUP 2024',
            'logo' => 'images/logo-burchalkin.webp',
            'hero_image' => '',
            'description' => 'Прошлый розыгрыш турнира 2024 года.',
            'start_date' => '2024-05-15',
            'end_date' => '2024-05-17',
            'location' => 'Санкт-Петербург',
            'status' => 'archived',
            'is_featured' => 0,
            'countdown_enabled' => 0,
            'standings_mode' => 'auto',
            'playoff_mode' => 'manual',
            'clubs_count' => 0,
            'matches_count' => 0,
        ],
        [
            'id' => 0,
            'slug' => 'burchalkin-cup-2023',
            'name' => 'Burchalkin Cup 2023',
            'season_year' => 2023,
            'short_label' => 'BCUP 2023',
            'logo' => 'images/logo-burchalkin.webp',
            'hero_image' => '',
            'description' => 'Прошлый розыгрыш турнира 2023 года.',
            'start_date' => '2023-05-15',
            'end_date' => '2023-05-17',
            'location' => 'Санкт-Петербург',
            'status' => 'archived',
            'is_featured' => 0,
            'countdown_enabled' => 0,
            'standings_mode' => 'auto',
            'playoff_mode' => 'manual',
            'clubs_count' => 0,
            'matches_count' => 0,
        ],
        [
            'id' => 0,
            'slug' => 'burchalkin-cup-2019',
            'name' => 'Burchalkin Cup 2019',
            'season_year' => 2019,
            'short_label' => 'BCUP 2019',
            'logo' => 'images/logo-burchalkin.webp',
            'hero_image' => '',
            'description' => 'Прошлый розыгрыш турнира 2019 года.',
            'start_date' => '2019-05-15',
            'end_date' => '2019-05-17',
            'location' => 'Санкт-Петербург',
            'status' => 'archived',
            'is_featured' => 0,
            'countdown_enabled' => 0,
            'standings_mode' => 'auto',
            'playoff_mode' => 'manual',
            'clubs_count' => 0,
            'matches_count' => 0,
        ],
        [
            'id' => 0,
            'slug' => 'burchalkin-cup-2018',
            'name' => 'Burchalkin Cup 2018',
            'season_year' => 2018,
            'short_label' => 'BCUP 2018',
            'logo' => 'images/logo-burchalkin.webp',
            'hero_image' => '',
            'description' => 'Прошлый розыгрыш турнира 2018 года.',
            'start_date' => '2018-05-15',
            'end_date' => '2018-05-17',
            'location' => 'Санкт-Петербург',
            'status' => 'archived',
            'is_featured' => 0,
            'countdown_enabled' => 0,
            'standings_mode' => 'auto',
            'playoff_mode' => 'manual',
            'clubs_count' => 0,
            'matches_count' => 0,
        ],
    ];

    public function all(): array
    {
        $rows = $this->queryAll(
            'SELECT
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
                t.is_featured,
                t.countdown_enabled,
                t.standings_mode,
                t.playoff_mode,
                (SELECT COUNT(*) FROM tournament_clubs tc WHERE tc.tournament_id = t.id) AS clubs_count,
                (SELECT COUNT(*) FROM matches m WHERE m.tournament_id = t.id) AS matches_count
             FROM tournaments t
             ORDER BY t.season_year DESC, t.id DESC'
        );

        $items = array_map([$this, 'formatTournament'], $rows);
        return $this->mergeWithFallbackArchives($items);
    }

    public function bySlug(string $slug): ?array
    {
        $row = $this->queryOne(
            'SELECT
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
                t.is_featured,
                t.countdown_enabled,
                t.standings_mode,
                t.playoff_mode,
                (SELECT COUNT(*) FROM tournament_clubs tc WHERE tc.tournament_id = t.id) AS clubs_count,
                (SELECT COUNT(*) FROM matches m WHERE m.tournament_id = t.id) AS matches_count
             FROM tournaments t
             WHERE t.slug = ?
             LIMIT 1',
            [$slug]
        );

        if ($row) {
            return $this->formatTournament($row);
        }

        foreach (self::FALLBACK_ARCHIVE_TOURNAMENTS as $item) {
            if (($item['slug'] ?? '') === $slug) {
                return $item;
            }
        }

        return null;
    }

    private function mergeWithFallbackArchives(array $items): array
    {
        $bySlug = [];
        foreach ($items as $item) {
            $bySlug[$item['slug']] = $item;
        }

        foreach (self::FALLBACK_ARCHIVE_TOURNAMENTS as $item) {
            if (!isset($bySlug[$item['slug']])) {
                $bySlug[$item['slug']] = $item;
            }
        }

        $merged = array_values($bySlug);
        usort($merged, static function (array $left, array $right): int {
            $yearCompare = (int) ($right['season_year'] ?? 0) <=> (int) ($left['season_year'] ?? 0);
            if ($yearCompare !== 0) {
                return $yearCompare;
            }

            return (int) ($right['id'] ?? 0) <=> (int) ($left['id'] ?? 0);
        });

        return $merged;
    }

    private function formatTournament(array $row): array
    {
        return [
            'id' => (int) $row['id'],
            'slug' => (string) $row['slug'],
            'name' => (string) $row['name'],
            'season_year' => (int) $row['season_year'],
            'short_label' => (string) ($row['short_label'] ?? ''),
            'logo' => (string) ($row['logo_path'] ?? ''),
            'hero_image' => (string) ($row['hero_image_url'] ?? ''),
            'description' => (string) ($row['description'] ?? ''),
            'start_date' => (string) ($row['start_date'] ?? ''),
            'end_date' => (string) ($row['end_date'] ?? ''),
            'location' => (string) ($row['location'] ?? ''),
            'status' => (string) ($row['status'] ?? ''),
            'is_featured' => (int) (($row['is_featured'] ?? 0) !== 0),
            'countdown_enabled' => (int) (($row['countdown_enabled'] ?? 0) !== 0),
            'standings_mode' => (string) ($row['standings_mode'] ?? 'auto'),
            'playoff_mode' => (string) ($row['playoff_mode'] ?? 'auto'),
            'clubs_count' => (int) ($row['clubs_count'] ?? 0),
            'matches_count' => (int) ($row['matches_count'] ?? 0),
        ];
    }
}
