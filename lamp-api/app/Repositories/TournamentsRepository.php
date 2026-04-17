<?php
declare(strict_types=1);

final class TournamentsRepository extends BaseRepository
{
    public function all(): array
    {
        $rows = $this->all(
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

        return array_map([$this, 'formatTournament'], $rows);
    }

    public function bySlug(string $slug): ?array
    {
        $row = $this->one(
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

        return $row ? $this->formatTournament($row) : null;
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

