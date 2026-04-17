<?php
declare(strict_types=1);

final class PartnersRepository extends BaseRepository
{
    private const FALLBACKS = [
        'Система спортивной аналитики B-SIGHT' => ['website_url' => 'https://bsight.pro', 'logo_url' => 'images/partners/b-sight.png', 'logo_alt' => 'Система спортивной аналитики B-SIGHT'],
        'АО «Российская промышленная коллегия»' => ['website_url' => 'https://www.rosprom.ru', 'logo_url' => 'images/partners/rossiyskaya-promyshlennaya-kollegiya.png', 'logo_alt' => 'АО «Российская промышленная коллегия»'],
        'БАЗ' => ['website_url' => 'https://baz.ru', 'logo_url' => 'images/partners/baz.png', 'logo_alt' => 'БАЗ'],
        'Медиалига' => ['website_url' => 'https://mfl.life', 'logo_url' => 'images/partners/medialiga.png', 'logo_alt' => 'Медиалига'],
        'БФ «ВТБ Страна»' => ['website_url' => 'https://vtbstrana.ru', 'logo_url' => 'images/partners/vtb-strana.png', 'logo_alt' => 'БФ «ВТБ Страна»'],
        'Банк ВТБ' => ['website_url' => 'https://www.vtb.ru', 'logo_url' => 'images/partners/bank-vtb.png', 'logo_alt' => 'Банк ВТБ'],
        'Ижора Сталь Инвест' => ['website_url' => 'https://izhorastalinvest.ru', 'logo_url' => 'images/partners/izhora-stal-invest.png', 'logo_alt' => 'Ижора Сталь Инвест'],
        'ООО Фирма «Спринг-Центр»' => ['website_url' => 'https://www.spring-centr.ru', 'logo_url' => 'images/partners/spring-center.png', 'logo_alt' => 'ООО Фирма «Спринг-Центр»'],
        'ООО «Новые технологии и материалы»' => ['website_url' => 'https://ntmsp.ru', 'logo_url' => 'images/partners/novye-tekhnologii-materialy.png', 'logo_alt' => 'ООО «Новые технологии и материалы»'],
        'ПАО Сатурн' => ['website_url' => 'https://saturn-omsk.ru', 'logo_url' => 'images/partners/saturn.png', 'logo_alt' => 'ПАО Сатурн'],
        'Банк ПСБ' => ['website_url' => 'https://www.psbank.ru', 'logo_url' => 'images/partners/bank-psb.png', 'logo_alt' => 'Банк ПСБ'],
        'ТехПром' => ['website_url' => '', 'logo_url' => 'images/partners/tekhprom.png', 'logo_alt' => 'ТехПром'],
        'ТАСС' => ['website_url' => 'https://tass.ru', 'logo_url' => 'images/partners/tass.png', 'logo_alt' => 'ТАСС'],
        'Спорт-Экспресс' => ['website_url' => 'https://www.sport-express.ru', 'logo_url' => 'images/partners/sport-express.png', 'logo_alt' => 'Спорт-Экспресс'],
        'РФС' => ['website_url' => 'https://rfs.ru', 'logo_url' => 'images/partners/rfs.png', 'logo_alt' => 'РФС'],
        'Фонтанка.ру' => ['website_url' => 'https://www.fontanka.ru', 'logo_url' => 'images/partners/fontanka.png', 'logo_alt' => 'Фонтанка.ру'],
        'Спорт День за Днем' => ['website_url' => 'https://www.sportsdaily.ru', 'logo_url' => 'images/partners/sport-den-za-dnem.png', 'logo_alt' => 'Спорт День за Днем'],
        'Комсомольская правда' => ['website_url' => 'https://www.spb.kp.ru', 'logo_url' => 'images/partners/komsomolskaya-pravda.png', 'logo_alt' => 'Комсомольская правда'],
        'Радио «Зенит»' => ['website_url' => 'https://www.radiozenit.ru', 'logo_url' => 'images/partners/radio-zenit.png', 'logo_alt' => 'Радио «Зенит»'],
        'Футбол Петербурга' => ['website_url' => 'https://stat.ffspb.org', 'logo_url' => 'images/partners/football-peterburga.png', 'logo_alt' => 'Футбол Петербурга'],
        'Санкт-Петербургские ведомости' => ['website_url' => 'https://spbvedomosti.ru', 'logo_url' => 'images/partners/spb-vedomosti.png', 'logo_alt' => 'Санкт-Петербургские ведомости'],
        'Телеканал «Санкт-Петербург»' => ['website_url' => 'https://tvspb.ru', 'logo_url' => 'images/partners/tv-spb.png', 'logo_alt' => 'Телеканал «Санкт-Петербург»'],
    ];

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
        $rows = array_map([$this, 'applyFallbacks'], $rows);

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

    private function applyFallbacks(array $row): array
    {
        $name = trim((string) ($row['partner_name'] ?? ''));
        if ($name === '') {
            return $row;
        }

        $fallback = self::FALLBACKS[$name] ?? null;
        if ($fallback === null) {
            return $row;
        }

        $row['website_url'] = (string) ($row['website_url'] ?? '');
        if ($row['website_url'] === '') {
            $row['website_url'] = (string) ($fallback['website_url'] ?? '');
        }

        $row['logo_url'] = (string) ($row['logo_url'] ?? '');
        if ($row['logo_url'] === '') {
            $row['logo_url'] = (string) ($fallback['logo_url'] ?? '');
        }

        $row['logo_alt'] = (string) ($row['logo_alt'] ?? '');
        if ($row['logo_alt'] === '') {
            $row['logo_alt'] = (string) ($fallback['logo_alt'] ?? $name);
        }

        return $row;
    }
}
