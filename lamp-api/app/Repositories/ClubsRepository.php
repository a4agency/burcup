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
                (SELECT COUNT(*) FROM matches m WHERE m.home_club_id = c.id OR m.away_club_id = c.id) AS matches_count
             FROM clubs c
             ORDER BY c.name ASC'
        );

        return array_map([$this, 'formatClub'], $rows);
    }

    public function currentTournamentClubs(): array
    {
        $tournament = api_get_target_tournament($this->pdo, null);
        if (!$tournament) {
            return $this->all();
        }

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
                (SELECT COUNT(*) FROM matches m WHERE m.home_club_id = c.id OR m.away_club_id = c.id) AS matches_count
             FROM clubs c
             INNER JOIN tournament_clubs tc ON tc.club_id = c.id
             INNER JOIN tournaments t ON t.id = tc.tournament_id
             WHERE t.id = ?
             ORDER BY tc.group_name ASC, tc.seeded_order ASC, c.name ASC',
            [(int) $tournament['id']]
        );

        if (!$rows) {
            return $this->all();
        }

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
                c.is_active,
                (SELECT COUNT(*) FROM matches m WHERE m.home_club_id = c.id OR m.away_club_id = c.id) AS matches_count
             FROM clubs c
             WHERE c.slug = ?
             LIMIT 1',
            [$slug]
        );

        if (!$row) {
            return null;
        }

        $club = $this->formatClub($row);
        $club['matches'] = $this->loadMatchesByClubSlug($club['slug']);
        return $club;
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

    private function loadMatchesByClubSlug(string $slug): array
    {
        $rows = $this->queryAll(
            'SELECT
                m.id,
                t.slug AS tournament_slug,
                t.name AS tournament_name,
                m.stage_name,
                m.round_name,
                m.matchday_label,
                m.match_date,
                m.match_time,
                m.status,
                m.status_label,
                home.name AS home_team,
                home.slug AS home_team_slug,
                home.logo_path AS home_logo,
                away.name AS away_team,
                away.slug AS away_team_slug,
                away.logo_path AS away_logo,
                m.home_score,
                m.away_score,
                m.venue,
                m.video_url,
                m.review_video_url,
                m.interview_video_url,
                m.is_featured_media,
                m.summary
             FROM matches m
             JOIN tournaments t ON t.id = m.tournament_id
             JOIN clubs home ON home.id = m.home_club_id
             JOIN clubs away ON away.id = m.away_club_id
             WHERE home.slug = ? OR away.slug = ?
             ORDER BY m.match_date DESC, m.match_time DESC, m.id DESC',
            [$slug, $slug]
        );

        return array_map(static function (array $row): array {
            $row['events'] = [];
            return api_format_match_row($row);
        }, $rows);
    }
}
