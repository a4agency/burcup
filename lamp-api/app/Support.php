<?php
declare(strict_types=1);

function api_normalize_date(mixed $value): string
{
    return $value ? (string) $value : '';
}

function api_normalize_time(mixed $value): string
{
    return $value ? substr((string) $value, 0, 5) : '';
}

function api_normalize_string(mixed $value): string
{
    return is_string($value) ? trim($value) : '';
}

function api_normalize_translation_text(mixed $value): string
{
    $normalized = preg_replace('/\s+/u', ' ', (string) $value);
    return $normalized === null ? '' : trim($normalized);
}

function api_normalize_html_string(mixed $value): string
{
    return is_string($value) ? trim($value) : '';
}

function api_null_if_empty(mixed $value): ?string
{
    $normalized = api_normalize_string($value);
    return $normalized === '' ? null : $normalized;
}

function api_parse_integer(mixed $value, ?int $fallback = 0): ?int
{
    if ($value === null || $value === '') {
        return $fallback;
    }
    if (is_bool($value)) {
        return $value ? 1 : 0;
    }
    $numeric = is_numeric($value) ? (int) $value : $fallback;
    return $numeric;
}

function api_parse_boolean(mixed $value, bool $fallback = false): bool
{
    if (is_bool($value)) return $value;
    if (is_int($value)) return $value !== 0;
    if (is_string($value)) {
        $normalized = strtolower(trim($value));
        if (in_array($normalized, ['true', '1', 'yes', 'on'], true)) return true;
        if (in_array($normalized, ['false', '0', 'no', 'off'], true)) return false;
    }
    return $fallback;
}

function api_contains_cyrillic(mixed $value): bool
{
    return preg_match('/[А-Яа-яЁё]/u', (string) $value) === 1;
}

function api_parse_score(mixed $score): array
{
    $parts = explode(':', (string) ($score ?: '0:0'));
    return [
        'home' => api_parse_integer($parts[0] ?? 0, 0) ?? 0,
        'away' => api_parse_integer($parts[1] ?? 0, 0) ?? 0,
    ];
}

function api_slugify(mixed $value): string
{
    $value = strtolower(trim((string) $value));
    $value = preg_replace('/[^a-z0-9а-яё]+/iu', '-', $value) ?: '';
    $value = trim($value, '-');
    return preg_replace('/-+/', '-', $value) ?: '';
}

function api_sql_in_placeholders(array $values): string
{
    return implode(', ', array_fill(0, count($values), '?'));
}

function api_query_rows(PDO $pdo, string $sql, array $params = []): array
{
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}

function api_query_one(PDO $pdo, string $sql, array $params = []): ?array
{
    $rows = api_query_rows($pdo, $sql, $params);
    return $rows[0] ?? null;
}

function api_ensure_array(mixed $value): array
{
    return is_array($value) ? $value : [];
}

function api_read_json_body(): array
{
    $body = json_decode((string) file_get_contents('php://input'), true);
    return is_array($body) ? $body : [];
}

function api_execute(PDO $pdo, string $sql, array $params = []): PDOStatement
{
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    return $stmt;
}

function api_get_columns(PDO $pdo, string $tableName): array
{
    $rows = api_query_rows($pdo, '
        SELECT COLUMN_NAME
        FROM information_schema.columns
        WHERE table_schema = DATABASE()
          AND table_name = ?
    ', [$tableName]);
    return array_map(static fn(array $row): string => (string) $row['COLUMN_NAME'], $rows);
}

function api_has_column(PDO $pdo, string $tableName, string $columnName): bool
{
    $row = api_query_one($pdo, '
        SELECT COUNT(*) AS count
        FROM information_schema.columns
        WHERE table_schema = DATABASE()
          AND table_name = ?
          AND column_name = ?
    ', [$tableName, $columnName]);
    return (int) ($row['count'] ?? 0) > 0;
}

function api_has_table(PDO $pdo, string $tableName): bool
{
    $row = api_query_one($pdo, '
        SELECT COUNT(*) AS count
        FROM information_schema.tables
        WHERE table_schema = DATABASE()
          AND table_name = ?
    ', [$tableName]);
    return (int) ($row['count'] ?? 0) > 0;
}

function api_split_news_body_to_content(string $body): array
{
    $parts = preg_split('/\n\s*\n+/', $body) ?: [];
    $parts = array_map('trim', $parts);
    return array_values(array_filter($parts, static fn(string $part): bool => $part !== ''));
}

function api_normalize_site_page_row(array $row = []): array
{
    $bodyHtml = (string) ($row['body_html'] ?? ($row['content_html'] ?? ''));
    $subtitle = (string) ($row['subtitle'] ?? '');

    if ($subtitle === '' && !empty($row['content_json'])) {
        $parsed = json_decode((string) $row['content_json'], true);
        if (is_array($parsed)) {
            $subtitle = api_normalize_string($parsed['subtitle'] ?? '');
        }
    }

    return [
        'slug' => (string) ($row['slug'] ?? ''),
        'title' => (string) ($row['title'] ?? ''),
        'subtitle' => $subtitle,
        'body_html' => $bodyHtml,
    ];
}

function api_map_standings_row(array $row): array
{
    return [
        'group' => (string) ($row['group_name'] ?? 'overall'),
        'position' => api_parse_integer($row['position'] ?? 0, 0) ?? 0,
        'slug' => (string) ($row['team_slug'] ?? ''),
        'team' => (string) ($row['team'] ?? ''),
        'logo' => (string) ($row['logo'] ?? ''),
        'country' => (string) ($row['country'] ?? ''),
        'city' => (string) ($row['city'] ?? ''),
        'played' => api_parse_integer($row['played'] ?? 0, 0) ?? 0,
        'won' => api_parse_integer($row['won'] ?? 0, 0) ?? 0,
        'drawn' => api_parse_integer($row['drawn'] ?? 0, 0) ?? 0,
        'lost' => api_parse_integer($row['lost'] ?? 0, 0) ?? 0,
        'goals' => sprintf(
            '%d-%d',
            api_parse_integer($row['goals_for'] ?? 0, 0) ?? 0,
            api_parse_integer($row['goals_against'] ?? 0, 0) ?? 0
        ),
        'points' => api_parse_integer($row['points'] ?? 0, 0) ?? 0,
    ];
}

function api_group_standings_rows(array $rows): array
{
    $groups = [];
    foreach ($rows as $row) {
        $groupKey = (string) ($row['group'] ?? 'overall');
        if (!isset($groups[$groupKey])) {
            $groups[$groupKey] = [
                'key' => $groupKey,
                'label' => $groupKey ? 'Группа ' . $groupKey : '',
                'rows' => [],
            ];
        }
        $groups[$groupKey]['rows'][] = $row;
    }

    return array_values($groups);
}

function api_map_playoff_row(array $row): array
{
    return [
        'tournament_slug' => (string) ($row['tournament_slug'] ?? ''),
        'tournament_name' => (string) ($row['tournament_name'] ?? ''),
        'bracket_group' => (string) ($row['bracket_group'] ?? ''),
        'round_group' => (string) ($row['round_group'] ?? ''),
        'match_key' => (string) ($row['match_key'] ?? ''),
        'sort_order' => api_parse_integer($row['sort_order'] ?? 0, 0) ?? 0,
        'label' => (string) ($row['label'] ?? ''),
        'home_team' => (string) ($row['home_team'] ?? ''),
        'home_team_slug' => (string) ($row['home_team_slug'] ?? ''),
        'home_logo' => (string) ($row['home_logo'] ?? ''),
        'away_team' => (string) ($row['away_team'] ?? ''),
        'away_team_slug' => (string) ($row['away_team_slug'] ?? ''),
        'away_logo' => (string) ($row['away_logo'] ?? ''),
        'home_score' => api_parse_integer($row['home_score'] ?? 0, 0) ?? 0,
        'away_score' => api_parse_integer($row['away_score'] ?? 0, 0) ?? 0,
    ];
}

function api_map_news_article_row(array $row, array $photos = []): array
{
    $body = (string) ($row['body'] ?? '');
    return [
        'id' => (int) ($row['id'] ?? 0),
        'slug' => (string) ($row['slug'] ?? ''),
        'date' => api_normalize_date($row['published_on'] ?? ''),
        'title' => (string) ($row['title'] ?? ''),
        'excerpt' => (string) ($row['excerpt'] ?? ''),
        'body' => $body,
        'body_html' => (string) ($row['body_html'] ?? ''),
        'content' => api_split_news_body_to_content($body),
        'link' => (string) ($row['link_path'] ?? ''),
        'image' => (string) ($row['image_url'] ?? ''),
        'video_url' => (string) ($row['video_url'] ?? ''),
        'photos' => $photos,
        'tournament_slug' => (string) ($row['tournament_slug'] ?? ''),
        'tournament_name' => (string) ($row['tournament_name'] ?? ''),
        'is_published' => (($row['is_published'] ?? 0) != 0),
    ];
}

function api_format_match_row(array $row): array
{
    return [
        'id' => (int) ($row['id'] ?? 0),
        'tournament_slug' => (string) ($row['tournament_slug'] ?? ''),
        'tournament_name' => (string) ($row['tournament_name'] ?? ''),
        'stage' => (string) ($row['stage_name'] ?? ''),
        'round' => (string) ($row['round_name'] ?? ''),
        'matchday' => (string) ($row['matchday_label'] ?? ''),
        'date' => api_normalize_date($row['match_date'] ?? ''),
        'time' => api_normalize_time($row['match_time'] ?? ''),
        'status' => (string) ($row['status'] ?? 'soon'),
        'status_label' => (string) ($row['status_label'] ?? ''),
        'home_team' => (string) ($row['home_team'] ?? ''),
        'home_logo' => (string) ($row['home_logo'] ?? ''),
        'away_team' => (string) ($row['away_team'] ?? ''),
        'away_logo' => (string) ($row['away_logo'] ?? ''),
        'home_team_slug' => (string) ($row['home_team_slug'] ?? ''),
        'away_team_slug' => (string) ($row['away_team_slug'] ?? ''),
        'score' => sprintf(
            '%d:%d',
            api_parse_integer($row['home_score'] ?? 0, 0) ?? 0,
            api_parse_integer($row['away_score'] ?? 0, 0) ?? 0
        ),
        'group' => (string) ($row['stage_name'] ?? ''),
        'venue' => (string) ($row['venue'] ?? ''),
        'video' => (string) ($row['video_url'] ?? ''),
        'review_video' => (string) ($row['review_video_url'] ?? ''),
        'interview_video' => (string) ($row['interview_video_url'] ?? ''),
        'is_featured_media' => (($row['is_featured_media'] ?? 0) != 0),
        'summary' => (string) ($row['summary'] ?? ''),
        'events' => $row['events'] ?? [],
    ];
}

function api_build_default_playoff_rows(string $tournamentSlug = 'burchalkin-cup-2026'): array
{
    $logo = 'images/logo-burchalkin.webp';
    return [
        ['tournament_slug' => $tournamentSlug, 'bracket_group' => 'top', 'round_group' => 'semifinal', 'match_key' => 'top_sf1', 'sort_order' => 1, 'label' => 'Полуфинал 1–4 №1', 'home_team' => 'Команда 1', 'home_team_slug' => 'placeholder-team-1', 'home_logo' => $logo, 'away_team' => 'Команда 2', 'away_team_slug' => 'placeholder-team-2', 'away_logo' => $logo, 'home_score' => 0, 'away_score' => 0],
        ['tournament_slug' => $tournamentSlug, 'bracket_group' => 'top', 'round_group' => 'semifinal', 'match_key' => 'top_sf2', 'sort_order' => 2, 'label' => 'Полуфинал 1–4 №2', 'home_team' => 'Команда 3', 'home_team_slug' => 'placeholder-team-3', 'home_logo' => $logo, 'away_team' => 'Команда 4', 'away_team_slug' => 'placeholder-team-4', 'away_logo' => $logo, 'home_score' => 0, 'away_score' => 0],
        ['tournament_slug' => $tournamentSlug, 'bracket_group' => 'top', 'round_group' => 'final', 'match_key' => 'top_final', 'sort_order' => 1, 'label' => 'Матч за 1 место', 'home_team' => 'Победитель 1–4 №1', 'home_team_slug' => '', 'home_logo' => '', 'away_team' => 'Победитель 1–4 №2', 'away_team_slug' => '', 'away_logo' => '', 'home_score' => 0, 'away_score' => 0],
        ['tournament_slug' => $tournamentSlug, 'bracket_group' => 'top', 'round_group' => 'final', 'match_key' => 'top_third', 'sort_order' => 2, 'label' => 'Матч за 3 место', 'home_team' => 'Проигравший 1–4 №1', 'home_team_slug' => '', 'home_logo' => '', 'away_team' => 'Проигравший 1–4 №2', 'away_team_slug' => '', 'away_logo' => '', 'home_score' => 0, 'away_score' => 0],
        ['tournament_slug' => $tournamentSlug, 'bracket_group' => 'placement', 'round_group' => 'semifinal', 'match_key' => 'placement_sf1', 'sort_order' => 1, 'label' => 'Полуфинал 5–8 №1', 'home_team' => 'Команда 5', 'home_team_slug' => 'placeholder-team-5', 'home_logo' => $logo, 'away_team' => 'Команда 6', 'away_team_slug' => 'placeholder-team-6', 'away_logo' => $logo, 'home_score' => 0, 'away_score' => 0],
        ['tournament_slug' => $tournamentSlug, 'bracket_group' => 'placement', 'round_group' => 'semifinal', 'match_key' => 'placement_sf2', 'sort_order' => 2, 'label' => 'Полуфинал 5–8 №2', 'home_team' => 'Команда 7', 'home_team_slug' => 'placeholder-team-7', 'home_logo' => $logo, 'away_team' => 'Команда 8', 'away_team_slug' => 'placeholder-team-8', 'away_logo' => $logo, 'home_score' => 0, 'away_score' => 0],
        ['tournament_slug' => $tournamentSlug, 'bracket_group' => 'placement', 'round_group' => 'final', 'match_key' => 'placement_fifth', 'sort_order' => 1, 'label' => 'Матч за 5 место', 'home_team' => 'Победитель 5–8 №1', 'home_team_slug' => '', 'home_logo' => '', 'away_team' => 'Победитель 5–8 №2', 'away_team_slug' => '', 'away_logo' => '', 'home_score' => 0, 'away_score' => 0],
        ['tournament_slug' => $tournamentSlug, 'bracket_group' => 'placement', 'round_group' => 'final', 'match_key' => 'placement_seventh', 'sort_order' => 2, 'label' => 'Матч за 7 место', 'home_team' => 'Проигравший 5–8 №1', 'home_team_slug' => '', 'home_logo' => '', 'away_team' => 'Проигравший 5–8 №2', 'away_team_slug' => '', 'away_logo' => '', 'home_score' => 0, 'away_score' => 0],
    ];
}

function api_get_target_tournament(PDO $pdo, ?string $slug = null): ?array
{
    if ($slug !== null && $slug !== '') {
        return api_query_one($pdo, '
            SELECT id, slug, name, season_year, is_featured, standings_mode, playoff_mode
            FROM tournaments
            WHERE slug = ?
            LIMIT 1
        ', [$slug]);
    }

    return api_query_one($pdo, '
        SELECT id, slug, name, season_year, is_featured, standings_mode, playoff_mode
        FROM tournaments
        ORDER BY is_featured DESC, season_year DESC, id DESC
        LIMIT 1
    ');
}

function api_get_news_body_content(string $body): array
{
    return api_split_news_body_to_content($body);
}
