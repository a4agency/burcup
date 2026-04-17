<?php
declare(strict_types=1);

final class PagesRepository extends BaseRepository
{
    public function all(): array
    {
        $rows = api_query_rows($this->pdo, '
            SELECT slug, title, subtitle, body_html, content_html, content_json
            FROM site_pages
            ORDER BY slug ASC
        ');
        return array_map('api_normalize_site_page_row', $rows);
    }

    public function bySlug(string $slug): array
    {
        $row = api_query_one(
            $this->pdo,
            'SELECT slug, title, subtitle, body_html, content_html, content_json
             FROM site_pages
             WHERE slug = ?
             LIMIT 1',
            [$slug]
        );

        if (!$row) {
            return [
                'slug' => $slug,
                'title' => '',
                'subtitle' => '',
                'body_html' => '',
            ];
        }

        return api_normalize_site_page_row($row);
    }
}
