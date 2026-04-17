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

    private function queryRows(bool $includeUnpublished, ?string $tournamentSlug): array
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
        $sql .= ' ORDER BY n.published_on DESC, n.id DESC';
        return api_query_rows($this->pdo, $sql, $params);
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

