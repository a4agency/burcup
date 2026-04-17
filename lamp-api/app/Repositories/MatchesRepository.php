<?php
declare(strict_types=1);

final class MatchesRepository extends BaseRepository
{
    public function all(?string $tournamentSlug = null): array
    {
        [$rows, $eventsMap] = $this->queryMatches($tournamentSlug);
        return array_map(
            static fn(array $row): array => api_format_match_row($row),
            array_map(
                static function (array $row) use ($eventsMap): array {
                    $row['events'] = $eventsMap[(int) $row['id']] ?? [];
                    return $row;
                },
                $rows
            )
        );
    }

    public function byClubSlug(string $clubSlug): array
    {
        [$rows, $eventsMap] = $this->queryClubMatches($clubSlug);
        return array_map(
            static fn(array $row): array => api_format_match_row($row),
            array_map(
                static function (array $row) use ($eventsMap): array {
                    $row['events'] = $eventsMap[(int) $row['id']] ?? [];
                    return $row;
                },
                $rows
            )
        );
    }

    public function standings(?string $tournamentSlug = null): array
    {
        $tournament = api_get_target_tournament($this->pdo, $tournamentSlug);
        if (!$tournament) {
            return [];
        }

        if (($tournament['standings_mode'] ?? 'auto') === 'manual' || (int) ($tournament['is_featured'] ?? 0) !== 1) {
            $rows = api_query_rows($this->pdo, '
                SELECT
                  ts.group_name,
                  ts.position,
                  ts.played,
                  ts.won,
                  ts.drawn,
                  ts.lost,
                  ts.goals_for,
                  ts.goals_against,
                  ts.points,
                  c.name AS team,
                  c.logo_path AS logo,
                  c.slug AS team_slug,
                  c.country,
                  c.city
                FROM tournament_standings ts
                JOIN clubs c ON c.id = ts.club_id
                JOIN tournaments t ON t.id = ts.tournament_id
                WHERE t.slug = ?
                ORDER BY ts.group_name, ts.position, c.name
            ', [$tournament['slug']]);
            return array_map('api_map_standings_row', $rows);
        }

        $computed = $this->computeStandings((int) $tournament['id']);
        if ($computed) {
            return $computed;
        }

        $rows = api_query_rows($this->pdo, '
            SELECT
              ts.group_name,
              ts.position,
              ts.played,
              ts.won,
              ts.drawn,
              ts.lost,
              ts.goals_for,
              ts.goals_against,
              ts.points,
              c.name AS team,
              c.logo_path AS logo,
              c.slug AS team_slug,
              c.country,
              c.city
            FROM tournament_standings ts
            JOIN clubs c ON c.id = ts.club_id
            JOIN tournaments t ON t.id = ts.tournament_id
            WHERE t.slug = ?
            ORDER BY ts.group_name, ts.position, c.name
        ', [$tournament['slug']]);
        return array_map('api_map_standings_row', $rows);
    }

    public function allStandings(): array
    {
        $currentTournament = api_get_target_tournament($this->pdo, null);
        $currentSlug = (string) ($currentTournament['slug'] ?? '');
        $archiveRows = api_query_rows($this->pdo, '
            SELECT
              t.slug AS tournament_slug,
              t.name AS tournament_name,
              t.season_year,
              ts.group_name,
              ts.position,
              ts.played,
              ts.won,
              ts.drawn,
              ts.lost,
              ts.goals_for,
              ts.goals_against,
              ts.points,
              c.name AS team,
              c.logo_path AS logo,
              c.slug AS team_slug,
              c.country,
              c.city
            FROM tournament_standings ts
            JOIN tournaments t ON t.id = ts.tournament_id
            JOIN clubs c ON c.id = ts.club_id
            ORDER BY t.is_featured DESC, t.season_year DESC, t.slug DESC, ts.group_name, ts.position, c.name
        ');

        $archiveItems = array_map(static function (array $row): array {
            return [
                'tournament_slug' => (string) ($row['tournament_slug'] ?? ''),
                'tournament_name' => (string) ($row['tournament_name'] ?? ''),
                'season_year' => api_parse_integer($row['season_year'] ?? null, 0) ?? 0,
                'group_name' => (string) ($row['group_name'] ?? ''),
                'position' => api_parse_integer($row['position'] ?? 0, 0) ?? 0,
                'played' => api_parse_integer($row['played'] ?? 0, 0) ?? 0,
                'won' => api_parse_integer($row['won'] ?? 0, 0) ?? 0,
                'drawn' => api_parse_integer($row['drawn'] ?? 0, 0) ?? 0,
                'lost' => api_parse_integer($row['lost'] ?? 0, 0) ?? 0,
                'goals_for' => api_parse_integer($row['goals_for'] ?? 0, 0) ?? 0,
                'goals_against' => api_parse_integer($row['goals_against'] ?? 0, 0) ?? 0,
                'points' => api_parse_integer($row['points'] ?? 0, 0) ?? 0,
                'team_slug' => (string) ($row['team_slug'] ?? ''),
                'team' => (string) ($row['team'] ?? ''),
                'logo' => (string) ($row['logo'] ?? ''),
                'country' => (string) ($row['country'] ?? ''),
                'city' => (string) ($row['city'] ?? ''),
            ];
        }, $archiveRows);

        if ($currentTournament && $currentSlug !== '') {
            $archiveItems = array_values(array_filter(
                $archiveItems,
                static function (array $row) use ($currentSlug): bool {
                    return (string) ($row['tournament_slug'] ?? '') !== $currentSlug;
                }
            ));
        }

        if (!$currentTournament) {
            return $archiveItems;
        }

        if (
            (string) ($currentTournament['standings_mode'] ?? 'auto') === 'manual'
            || (int) ($currentTournament['is_featured'] ?? 0) !== 1
        ) {
            $currentRows = api_query_rows($this->pdo, '
                SELECT
                  ts.group_name,
                  ts.position,
                  ts.played,
                  ts.won,
                  ts.drawn,
                  ts.lost,
                  ts.goals_for,
                  ts.goals_against,
                  ts.points,
                  c.name AS team,
                  c.logo_path AS logo,
                  c.slug AS team_slug,
                  c.country,
                  c.city
                FROM tournament_standings ts
                JOIN tournaments t ON t.id = ts.tournament_id
                JOIN clubs c ON c.id = ts.club_id
                WHERE t.slug = ?
                ORDER BY ts.group_name, ts.position, c.name
            ', [$currentTournament['slug']]);
        } else {
            $currentRows = $this->computeStandings((int) $currentTournament['id']);
            if (!$currentRows) {
                $currentRows = api_query_rows($this->pdo, '
                    SELECT
                      ts.group_name,
                      ts.position,
                      ts.played,
                      ts.won,
                      ts.drawn,
                      ts.lost,
                      ts.goals_for,
                      ts.goals_against,
                      ts.points,
                      c.name AS team,
                      c.logo_path AS logo,
                      c.slug AS team_slug,
                      c.country,
                      c.city
                    FROM tournament_standings ts
                    JOIN tournaments t ON t.id = ts.tournament_id
                    JOIN clubs c ON c.id = ts.club_id
                    WHERE t.slug = ?
                    ORDER BY ts.group_name, ts.position, c.name
                ', [$currentTournament['slug']]);
            }
        }

        $currentItems = array_map(function (array $row) use ($currentTournament): array {
            return [
                'tournament_slug' => (string) ($currentTournament['slug'] ?? ''),
                'tournament_name' => (string) ($currentTournament['name'] ?? ''),
                'season_year' => api_parse_integer($currentTournament['season_year'] ?? null, 0) ?? 0,
                'group_name' => (string) ($row['group_name'] ?? ''),
                'position' => api_parse_integer($row['position'] ?? 0, 0) ?? 0,
                'played' => api_parse_integer($row['played'] ?? 0, 0) ?? 0,
                'won' => api_parse_integer($row['won'] ?? 0, 0) ?? 0,
                'drawn' => api_parse_integer($row['drawn'] ?? 0, 0) ?? 0,
                'lost' => api_parse_integer($row['lost'] ?? 0, 0) ?? 0,
                'goals_for' => api_parse_integer($row['goals_for'] ?? 0, 0) ?? 0,
                'goals_against' => api_parse_integer($row['goals_against'] ?? 0, 0) ?? 0,
                'points' => api_parse_integer($row['points'] ?? 0, 0) ?? 0,
                'team_slug' => (string) ($row['team_slug'] ?? ''),
                'team' => (string) ($row['team'] ?? ''),
                'logo' => (string) ($row['logo'] ?? ''),
                'country' => (string) ($row['country'] ?? ''),
                'city' => (string) ($row['city'] ?? ''),
            ];
        }, $currentRows);

        return [...$archiveItems, ...$currentItems];
    }

    public function playoff(?string $tournamentSlug = null): array
    {
        $tournament = api_get_target_tournament($this->pdo, $tournamentSlug);
        if (!$tournament) {
            return [];
        }

        if (!api_has_table($this->pdo, 'tournament_playoff_matches') || ($tournament['playoff_mode'] ?? 'auto') !== 'manual') {
            return api_build_default_playoff_rows((string) $tournament['slug']);
        }

        $rows = api_query_rows($this->pdo, '
            SELECT
              t.slug AS tournament_slug,
              t.name AS tournament_name,
              pm.bracket_group,
              pm.round_group,
              pm.match_key,
              pm.sort_order,
              pm.label,
              home.slug AS home_team_slug,
              COALESCE(home.name, pm.home_label) AS home_team,
              COALESCE(home.logo_path, pm.home_logo_path) AS home_logo,
              away.slug AS away_team_slug,
              COALESCE(away.name, pm.away_label) AS away_team,
              COALESCE(away.logo_path, pm.away_logo_path) AS away_logo,
              pm.home_score,
              pm.away_score
            FROM tournament_playoff_matches pm
            JOIN tournaments t ON t.id = pm.tournament_id
            LEFT JOIN clubs home ON home.id = pm.home_club_id
            LEFT JOIN clubs away ON away.id = pm.away_club_id
            WHERE t.slug = ?
            ORDER BY
              CASE pm.bracket_group WHEN "top" THEN 0 ELSE 1 END,
              CASE pm.round_group WHEN "semifinal" THEN 0 ELSE 1 END,
              pm.sort_order,
              pm.id
        ', [$tournament['slug']]);

        if (!$rows) {
            return api_build_default_playoff_rows((string) $tournament['slug']);
        }

        return array_map('api_map_playoff_row', $rows);
    }

    public function results(?string $tournamentSlug = null): array
    {
        $params = [];
        $sql = '
            SELECT
              m.stage_name,
              CONCAT(home.name, " — ", away.name) AS match_label,
              m.home_score,
              m.away_score,
              m.sort_order,
              t.slug AS tournament_slug
            FROM matches m
            JOIN tournaments t ON t.id = m.tournament_id
            JOIN clubs home ON home.id = m.home_club_id
            JOIN clubs away ON away.id = m.away_club_id
            WHERE m.status = "done"
        ';
        if ($tournamentSlug) {
            $sql .= ' AND t.slug = ?';
            $params[] = $tournamentSlug;
        }
        $sql .= ' ORDER BY m.sort_order, m.match_date, m.match_time, m.id';
        return api_query_rows($this->pdo, $sql, $params);
    }

    private function queryMatches(?string $tournamentSlug = null): array
    {
        $sql = '
            SELECT
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
        ';
        $params = [];
        if ($tournamentSlug) {
            $sql .= ' WHERE t.slug = ?';
            $params[] = $tournamentSlug;
        }
        $sql .= ' ORDER BY t.season_year DESC, m.match_date ASC, m.match_time ASC, m.sort_order ASC, m.id ASC';
        $rows = api_query_rows($this->pdo, $sql, $params);
        $eventsMap = $this->loadMatchEventsMap(array_map(static fn(array $row): int => (int) $row['id'], $rows));
        return [$rows, $eventsMap];
    }

    private function queryClubMatches(string $clubSlug): array
    {
        $rows = api_query_rows($this->pdo, '
            SELECT
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
            ORDER BY m.match_date DESC, m.match_time DESC, m.id DESC
        ', [$clubSlug, $clubSlug]);
        $eventsMap = $this->loadMatchEventsMap(array_map(static fn(array $row): int => (int) $row['id'], $rows));
        return [$rows, $eventsMap];
    }

    private function loadMatchEventsMap(array $matchIds): array
    {
        if (!$matchIds || !api_has_table($this->pdo, 'match_events')) {
            return [];
        }
        $rows = api_query_rows($this->pdo, '
            SELECT match_id, minute_label, event_type, title, description, sort_order
            FROM match_events
            WHERE match_id IN (' . api_sql_in_placeholders($matchIds) . ')
            ORDER BY match_id, sort_order, id
        ', $matchIds);

        $map = [];
        foreach ($rows as $row) {
            $matchId = (int) $row['match_id'];
            $map[$matchId] ??= [];
            $map[$matchId][] = [
                'minute' => (string) ($row['minute_label'] ?? ''),
                'type' => (string) ($row['event_type'] ?? 'note'),
                'title' => (string) ($row['title'] ?? ''),
                'description' => (string) ($row['description'] ?? ''),
            ];
        }
        return $map;
    }

    private function computeStandings(int $tournamentId): array
    {
        $participants = api_query_rows($this->pdo, '
            SELECT DISTINCT c.id, c.name, c.logo_path, c.slug, c.country, c.city
            FROM clubs c
            WHERE c.id IN (
              SELECT club_id FROM tournament_clubs WHERE tournament_id = ?
              UNION
              SELECT home_club_id FROM matches WHERE tournament_id = ?
              UNION
              SELECT away_club_id FROM matches WHERE tournament_id = ?
            )
            ORDER BY c.name
        ', [$tournamentId, $tournamentId, $tournamentId]);

        $completed = api_query_rows($this->pdo, '
            SELECT home_club_id, away_club_id, home_score, away_score
            FROM matches
            WHERE tournament_id = ?
              AND status = "done"
        ', [$tournamentId]);

        $stats = [];
        foreach ($participants as $participant) {
            $stats[(int) $participant['id']] = [
                'id' => (int) $participant['id'],
                'name' => (string) $participant['name'],
                'logo_path' => (string) $participant['logo_path'],
                'slug' => (string) $participant['slug'],
                'country' => (string) ($participant['country'] ?? ''),
                'city' => (string) ($participant['city'] ?? ''),
                'played' => 0,
                'won' => 0,
                'drawn' => 0,
                'lost' => 0,
                'goals_for' => 0,
                'goals_against' => 0,
                'points' => 0,
            ];
        }

        foreach ($completed as $match) {
            $homeId = (int) $match['home_club_id'];
            $awayId = (int) $match['away_club_id'];
            if (!isset($stats[$homeId], $stats[$awayId])) {
                continue;
            }
            $homeScore = api_parse_integer($match['home_score'] ?? 0, 0) ?? 0;
            $awayScore = api_parse_integer($match['away_score'] ?? 0, 0) ?? 0;
            $stats[$homeId]['played'] += 1;
            $stats[$awayId]['played'] += 1;
            $stats[$homeId]['goals_for'] += $homeScore;
            $stats[$homeId]['goals_against'] += $awayScore;
            $stats[$awayId]['goals_for'] += $awayScore;
            $stats[$awayId]['goals_against'] += $homeScore;
            if ($homeScore > $awayScore) {
                $stats[$homeId]['won'] += 1;
                $stats[$awayId]['lost'] += 1;
                $stats[$homeId]['points'] += 3;
            } elseif ($homeScore < $awayScore) {
                $stats[$awayId]['won'] += 1;
                $stats[$homeId]['lost'] += 1;
                $stats[$awayId]['points'] += 3;
            } else {
                $stats[$homeId]['drawn'] += 1;
                $stats[$awayId]['drawn'] += 1;
                $stats[$homeId]['points'] += 1;
                $stats[$awayId]['points'] += 1;
            }
        }

        $sorted = array_values($stats);
        usort($sorted, static function (array $a, array $b): int {
            $goalDiffA = $a['goals_for'] - $a['goals_against'];
            $goalDiffB = $b['goals_for'] - $b['goals_against'];
            return $b['points'] <=> $a['points']
                ?: $goalDiffB <=> $goalDiffA
                ?: $b['goals_for'] <=> $a['goals_for']
                ?: strcmp((string) $a['name'], (string) $b['name']);
        });

        $rows = [];
        foreach ($sorted as $index => $item) {
            $rows[] = [
                'group_name' => 'overall',
                'position' => $index + 1,
                'played' => $item['played'],
                'won' => $item['won'],
                'drawn' => $item['drawn'],
                'lost' => $item['lost'],
                'goals_for' => $item['goals_for'],
                'goals_against' => $item['goals_against'],
                'points' => $item['points'],
                'team' => $item['name'],
                'logo' => $item['logo_path'],
                'team_slug' => $item['slug'],
                'country' => $item['country'],
                'city' => $item['city'],
            ];
        }
        return $rows;
    }
}
