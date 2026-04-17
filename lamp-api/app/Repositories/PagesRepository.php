<?php
declare(strict_types=1);

final class PagesRepository extends BaseRepository
{
    public function bySlug(string $slug): array
    {
        $row = $this->one(
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

        return [
            'slug' => (string) $row['slug'],
            'title' => (string) ($row['title'] ?? ''),
            'subtitle' => (string) ($row['subtitle'] ?? ''),
            'body_html' => (string) ($row['body_html'] ?? ($row['content_html'] ?? '')),
            'content_json' => $row['content_json'] ?? null,
        ];
    }
}

