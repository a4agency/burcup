<?php
declare(strict_types=1);

final class MediaRepository extends BaseRepository
{
    public function albums(bool $onlyVisible = true): array
    {
        $sql = '
            SELECT
              a.id,
              a.slug,
              a.title,
              a.card_excerpt,
              a.description,
              a.badge,
              a.cover_image_url,
              a.cover_alt_text,
              a.published_on,
              a.sort_order,
              a.is_visible,
              t.slug AS tournament_slug,
              t.name AS tournament_name,
              COUNT(p.id) AS photos_count
            FROM media_albums a
            LEFT JOIN tournaments t ON t.id = a.tournament_id
            LEFT JOIN media_album_photos p ON p.album_id = a.id
        ';
        if ($onlyVisible) {
            $sql .= ' WHERE a.is_visible = 1';
        }
        $sql .= ' GROUP BY a.id ORDER BY a.sort_order, a.published_on DESC, a.id';
        $rows = api_query_rows($this->pdo, $sql);

        return array_map(static function (array $row): array {
            return [
                'id' => (int) ($row['id'] ?? 0),
                'slug' => (string) ($row['slug'] ?? ''),
                'title' => (string) ($row['title'] ?? ''),
                'card_excerpt' => (string) ($row['card_excerpt'] ?? ''),
                'description' => (string) ($row['description'] ?? ''),
                'badge' => (string) ($row['badge'] ?? 'Фотоальбом'),
                'cover_image_url' => (string) ($row['cover_image_url'] ?? ''),
                'cover_alt_text' => (string) ($row['cover_alt_text'] ?? ''),
                'published_on' => api_normalize_date($row['published_on'] ?? ''),
                'sort_order' => api_parse_integer($row['sort_order'] ?? 0, 0) ?? 0,
                'is_visible' => (($row['is_visible'] ?? 0) != 0),
                'tournament_slug' => (string) ($row['tournament_slug'] ?? ''),
                'tournament_name' => (string) ($row['tournament_name'] ?? ''),
                'photos_count' => api_parse_integer($row['photos_count'] ?? 0, 0) ?? 0,
            ];
        }, $rows);
    }

    public function albumsWithPhotos(bool $onlyVisible = true): array
    {
        $rows = api_query_rows($this->pdo, '
            SELECT
              a.id,
              a.slug,
              a.title,
              a.card_excerpt,
              a.description,
              a.badge,
              a.cover_image_url,
              a.cover_alt_text,
              a.published_on,
              a.sort_order,
              a.is_visible,
              t.slug AS tournament_slug,
              t.name AS tournament_name
            FROM media_albums a
            LEFT JOIN tournaments t ON t.id = a.tournament_id
            ' . ($onlyVisible ? 'WHERE a.is_visible = 1' : '') . '
            ORDER BY a.sort_order, a.published_on DESC, a.id
        ');
        $photoMap = $this->loadPhotoMap(array_map(static fn(array $row): int => (int) $row['id'], $rows));
        return array_map(static function (array $row) use ($photoMap): array {
            return [
                'slug' => (string) ($row['slug'] ?? ''),
                'title' => (string) ($row['title'] ?? ''),
                'tournament_slug' => (string) ($row['tournament_slug'] ?? ''),
                'published_on' => api_normalize_date($row['published_on'] ?? ''),
                'badge' => (string) ($row['badge'] ?? 'Фотоальбом'),
                'cover_image_url' => (string) ($row['cover_image_url'] ?? ''),
                'cover_alt_text' => (string) ($row['cover_alt_text'] ?? ''),
                'card_excerpt' => (string) ($row['card_excerpt'] ?? ''),
                'description' => (string) ($row['description'] ?? ''),
                'sort_order' => api_parse_integer($row['sort_order'] ?? 0, 0) ?? 0,
                'is_visible' => (($row['is_visible'] ?? 0) != 0),
                'photos' => $photoMap[(int) $row['id']] ?? [],
            ];
        }, $rows);
    }

    public function album(string $slug): ?array
    {
        $row = api_query_one($this->pdo, '
            SELECT
              a.id,
              a.slug,
              a.title,
              a.card_excerpt,
              a.description,
              a.badge,
              a.cover_image_url,
              a.cover_alt_text,
              a.published_on,
              a.sort_order,
              a.is_visible,
              t.slug AS tournament_slug,
              t.name AS tournament_name
            FROM media_albums a
            LEFT JOIN tournaments t ON t.id = a.tournament_id
            WHERE a.slug = ?
              AND a.is_visible = 1
            LIMIT 1
        ', [$slug]);
        if (!$row) {
            return null;
        }

        $photos = $this->loadPhotoMap([(int) $row['id']]);
        $items = $photos[(int) $row['id']] ?? [];

        return [
            'id' => (int) $row['id'],
            'slug' => (string) $row['slug'],
            'title' => (string) $row['title'],
            'card_excerpt' => (string) ($row['card_excerpt'] ?? ''),
            'description' => (string) ($row['description'] ?? ''),
            'badge' => (string) ($row['badge'] ?? 'Фотоальбом'),
            'cover_image_url' => (string) ($row['cover_image_url'] ?? ''),
            'cover_alt_text' => (string) ($row['cover_alt_text'] ?? ''),
            'published_on' => api_normalize_date($row['published_on'] ?? ''),
            'sort_order' => api_parse_integer($row['sort_order'] ?? 0, 0) ?? 0,
            'is_visible' => (($row['is_visible'] ?? 0) != 0),
            'tournament_slug' => (string) ($row['tournament_slug'] ?? ''),
            'tournament_name' => (string) ($row['tournament_name'] ?? ''),
            'photos' => $items,
        ];
    }

    private function loadPhotoMap(array $albumIds): array
    {
        if (!$albumIds) {
            return [];
        }
        $rows = api_query_rows($this->pdo, '
            SELECT album_id, image_url, alt_text, caption, sort_order
            FROM media_album_photos
            WHERE album_id IN (' . api_sql_in_placeholders($albumIds) . ')
            ORDER BY album_id, sort_order, id
        ', $albumIds);

        $map = [];
        foreach ($rows as $row) {
            $albumId = (int) $row['album_id'];
            $map[$albumId] ??= [];
            $map[$albumId][] = [
                'image_url' => (string) ($row['image_url'] ?? ''),
                'alt_text' => (string) ($row['alt_text'] ?? ''),
                'caption' => (string) ($row['caption'] ?? ''),
                'sort_order' => api_parse_integer($row['sort_order'] ?? 0, 0) ?? 0,
            ];
        }
        return $map;
    }
}
