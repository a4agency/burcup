<?php
declare(strict_types=1);

final class PartnersRepository extends BaseRepository
{
    public function all(): array
    {
        return $this->readPartners(null, false, false);
    }

    public function byTournamentSlug(string $slug): array
    {
        return $this->readPartners($slug, true, false);
    }

    public function groupedByTournamentSlug(string $slug): array
    {
        return $this->readPartners($slug, true, true);
    }

    private function readPartners(?string $tournamentSlug, bool $visibleOnly, bool $grouped): array
    {
        $rows = api_query_rows($this->pdo, '
            SELECT
              pc.slug AS category_slug,
              pc.name AS category_name,
              p.slug AS partner_slug,
              p.name AS partner_name,
              p.website_url,
              p.description,
              COALESCE(pla.image_url, "") AS logo_url,
              COALESCE(pla.alt_text, p.name) AS logo_alt,
              COALESCE(pla.storage_provider, "") AS logo_storage_provider,
              COALESCE(pla.public_id, "") AS logo_public_id,
              COALESCE(pla.file_name, "") AS logo_file_name,
              COALESCE(pla.mime_type, "") AS logo_mime_type,
              COALESCE(pla.asset_format, "") AS logo_format,
              pla.width AS logo_width,
              pla.height AS logo_height,
              pla.bytes AS logo_bytes,
              tp.sort_order,
              tp.is_visible,
              t.slug AS tournament_slug
            FROM partners p
            LEFT JOIN tournament_partners tp ON tp.partner_id = p.id
            LEFT JOIN tournaments t ON t.id = tp.tournament_id
            LEFT JOIN partner_categories pc ON pc.id = tp.category_id
            LEFT JOIN partner_logo_assets pla ON pla.partner_id = p.id AND pla.is_current = 1
            ' . ($tournamentSlug ? ('WHERE ' . ($visibleOnly ? 'tp.is_visible = 1 AND ' : '') . 't.slug = ?') : '') . '
            ORDER BY COALESCE(pc.slug, "general"), tp.sort_order, p.name
        ', $tournamentSlug ? [$tournamentSlug] : []);

        if (!$grouped) {
            return array_map(static function (array $row): array {
                return [
                    'slug' => (string) ($row['partner_slug'] ?? ''),
                    'name' => (string) ($row['partner_name'] ?? ''),
                    'category' => (string) ($row['category_slug'] ?? 'general'),
                    'tournament_slug' => (string) ($row['tournament_slug'] ?? ''),
                    'website_url' => (string) ($row['website_url'] ?? ''),
                    'logo_url' => (string) ($row['logo_url'] ?? ''),
                    'alt_text' => (string) ($row['logo_alt'] ?? ''),
                    'logo_storage_provider' => (string) ($row['logo_storage_provider'] ?? ''),
                    'logo_public_id' => (string) ($row['logo_public_id'] ?? ''),
                    'logo_file_name' => (string) ($row['logo_file_name'] ?? ''),
                    'logo_mime_type' => (string) ($row['logo_mime_type'] ?? ''),
                    'logo_format' => (string) ($row['logo_format'] ?? ''),
                    'logo_width' => $row['logo_width'] !== null ? api_parse_integer($row['logo_width'], null) : null,
                    'logo_height' => $row['logo_height'] !== null ? api_parse_integer($row['logo_height'], null) : null,
                    'logo_bytes' => $row['logo_bytes'] !== null ? api_parse_integer($row['logo_bytes'], null) : null,
                    'sort_order' => api_parse_integer($row['sort_order'] ?? 0, 0) ?? 0,
                    'is_visible' => (($row['is_visible'] ?? 0) != 0),
                    'note' => (string) ($row['description'] ?? ''),
                ];
            }, $rows);
        }

        $groupedRows = [];
        foreach ($rows as $row) {
            $key = (string) ($row['category_slug'] ?? 'other');
            if (!isset($groupedRows[$key])) {
                $groupedRows[$key] = [
                    'slug' => $key,
                    'name' => (string) ($row['category_name'] ?? 'Прочее'),
                    'items' => [],
                ];
            }
            $groupedRows[$key]['items'][] = [
                'slug' => (string) ($row['partner_slug'] ?? ''),
                'name' => (string) ($row['partner_name'] ?? ''),
                'website_url' => (string) ($row['website_url'] ?? ''),
                'description' => (string) ($row['description'] ?? ''),
                'logo_url' => (string) ($row['logo_url'] ?? ''),
                'logo_alt' => (string) ($row['logo_alt'] ?? ''),
                'sort_order' => api_parse_integer($row['sort_order'] ?? 0, 0) ?? 0,
            ];
        }

        return array_values($groupedRows);
    }
}
