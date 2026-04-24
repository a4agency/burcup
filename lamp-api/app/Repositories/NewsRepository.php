<?php
declare(strict_types=1);

final class NewsRepository extends BaseRepository
{
    public function all(bool $includeUnpublished = false, ?string $tournamentSlug = null): array
    {
        $rows = $this->queryRows($includeUnpublished, $tournamentSlug);
        $photoMap = $this->loadPhotoMap(array_map(static fn(array $row): int => (int) $row['id'], $rows));
        return array_map(
            static fn(array $row): array => api_map_news_article_row($row, $photoMap[(int) $row['id']] ?? []),
            $rows
        );
    }

    public function latest(bool $includeUnpublished = false, ?string $tournamentSlug = null, int $limit = 3): array
    {
        $rows = $this->queryRows($includeUnpublished, $tournamentSlug, max(1, $limit), 0);
        $photoMap = $this->loadPhotoMap(array_map(static fn(array $row): int => (int) $row['id'], $rows));
        return array_map(
            static fn(array $row): array => api_map_news_article_row($row, $photoMap[(int) $row['id']] ?? []),
            $rows
        );
    }

    public function page(bool $includeUnpublished = false, ?string $tournamentSlug = null, int $page = 1, int $perPage = 9): array
    {
        $page = max(1, $page);
        $perPage = max(1, $perPage);
        $totalItems = $this->countRows($includeUnpublished, $tournamentSlug);
        $totalPages = max(1, (int) ceil($totalItems / $perPage));
        $page = min($page, $totalPages);
        $offset = ($page - 1) * $perPage;

        $rows = $this->queryRows($includeUnpublished, $tournamentSlug, $perPage, $offset);
        $photoMap = $this->loadPhotoMap(array_map(static fn(array $row): int => (int) $row['id'], $rows));
        $items = array_map(
            static fn(array $row): array => api_map_news_article_row($row, $photoMap[(int) $row['id']] ?? []),
            $rows
        );

        return [
            'items' => $items,
            'pagination' => [
                'page' => $page,
                'per_page' => $perPage,
                'total_items' => $totalItems,
                'total_pages' => $totalPages,
                'has_prev' => $page > 1,
                'has_next' => $page < $totalPages,
            ],
        ];
    }

    public function bySlugOrId(string $value): ?array
    {
        $row = api_query_one($this->pdo, '
            SELECT
              n.id,
              t.slug AS tournament_slug,
              t.name AS tournament_name,
              n.slug,
              n.published_on,
              n.title,
              n.excerpt,
              n.body,
              n.body_html,
              n.link_path,
              n.image_url,
              n.video_url,
              n.is_published
            FROM news_articles n
            LEFT JOIN tournaments t ON t.id = n.tournament_id
            WHERE n.slug = ? OR n.id = ?
            LIMIT 1
        ', [$value, api_parse_integer($value, 0) ?? 0]);

        if (!$row) {
            return null;
        }

        $photoMap = $this->loadPhotoMap([(int) $row['id']]);
        return api_map_news_article_row($row, $photoMap[(int) $row['id']] ?? []);
    }

    private function queryRows(bool $includeUnpublished, ?string $tournamentSlug, ?int $limit = null, ?int $offset = null): array
    {
        $sql = '
            SELECT
              n.id,
              t.slug AS tournament_slug,
              t.name AS tournament_name,
              n.slug,
              n.published_on,
              n.title,
              n.excerpt,
              n.body,
              n.body_html,
              n.link_path,
              n.image_url,
              n.video_url,
              n.is_published
            FROM news_articles n
            LEFT JOIN tournaments t ON t.id = n.tournament_id
        ';
        $conditions = [];
        $params = [];
        if (!$includeUnpublished) {
            $conditions[] = 'n.is_published = 1';
        }
        if ($tournamentSlug) {
            $conditions[] = 't.slug = ?';
            $params[] = $tournamentSlug;
        }
        if ($conditions) {
            $sql .= ' WHERE ' . implode(' AND ', $conditions);
        }
        $sql .= ' ORDER BY n.created_at DESC, n.published_on DESC, n.id DESC';
        if ($limit !== null) {
            $sql .= ' LIMIT ' . max(1, (int) $limit);
            if ($offset !== null && (int) $offset > 0) {
                $sql .= ' OFFSET ' . max(0, (int) $offset);
            }
        }
        return api_query_rows($this->pdo, $sql, $params);
    }

    private function countRows(bool $includeUnpublished, ?string $tournamentSlug): int
    {
        $sql = '
            SELECT COUNT(*) AS total
            FROM news_articles n
            LEFT JOIN tournaments t ON t.id = n.tournament_id
        ';
        $conditions = [];
        $params = [];
        if (!$includeUnpublished) {
            $conditions[] = 'n.is_published = 1';
        }
        if ($tournamentSlug) {
            $conditions[] = 't.slug = ?';
            $params[] = $tournamentSlug;
        }
        if ($conditions) {
            $sql .= ' WHERE ' . implode(' AND ', $conditions);
        }
        $row = api_query_one($this->pdo, $sql, $params);
        return (int) ($row['total'] ?? 0);
    }

    private function loadPhotoMap(array $articleIds): array
    {
        if (!$articleIds) {
            return [];
        }

        $rows = api_query_rows($this->pdo, '
            SELECT news_article_id, image_url, alt_text, sort_order
            FROM news_article_photos
            WHERE news_article_id IN (' . api_sql_in_placeholders($articleIds) . ')
            ORDER BY news_article_id, sort_order, id
        ', $articleIds);

        $map = [];
        foreach ($rows as $row) {
            $articleId = (int) $row['news_article_id'];
            $map[$articleId] ??= [];
            $map[$articleId][] = [
                'image_url' => (string) ($row['image_url'] ?? ''),
                'alt_text' => (string) ($row['alt_text'] ?? ''),
                'sort_order' => api_parse_integer($row['sort_order'] ?? 0, 0) ?? 0,
            ];
        }
        return $map;
    }
}
