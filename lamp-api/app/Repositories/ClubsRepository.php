<?php
declare(strict_types=1);

final class ClubsRepository extends BaseRepository
{
    public function all(): array
    {
        $rows = $this->queryAll(
            'SELECT
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
                (SELECT COUNT(*) FROM matches m WHERE m.home_team_slug = c.slug OR m.away_team_slug = c.slug) AS matches_count
             FROM clubs c
             ORDER BY c.name ASC'
        );

        return array_map([$this, 'formatClub'], $rows);
    }

    public function bySlug(string $slug): ?array
    {
        $row = $this->queryOne(
            'SELECT
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
             WHERE c.slug = ?
             LIMIT 1',
            [$slug]
        );

        return $row ? $this->formatClub($row) : null;
    }

    private function formatClub(array $row): array
    {
        return [
            'id' => (int) $row['id'],
            'slug' => (string) $row['slug'],
            'name' => (string) $row['name'],
            'short_name' => (string) ($row['short_name'] ?? ''),
            'logo' => (string) ($row['logo_path'] ?? ''),
            'country' => (string) ($row['country'] ?? ''),
            'city' => (string) ($row['city'] ?? ''),
            'founded_year' => $row['founded_year'] !== null ? (int) $row['founded_year'] : null,
            'website_url' => (string) ($row['website_url'] ?? ''),
            'hero_image' => (string) ($row['hero_image_url'] ?? ''),
            'description' => (string) ($row['description'] ?? ''),
            'is_active' => (int) (($row['is_active'] ?? 0) !== 0),
            'matches_count' => (int) ($row['matches_count'] ?? 0),
        ];
    }
}
