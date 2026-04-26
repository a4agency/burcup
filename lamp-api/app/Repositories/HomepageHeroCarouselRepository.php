<?php
declare(strict_types=1);

final class HomepageHeroCarouselRepository extends BaseRepository
{
    public function __construct(PDO $pdo)
    {
        parent::__construct($pdo);
        api_ensure_homepage_hero_carousel($this->pdo);
    }

    public function all(): array
    {
        $rows = api_query_rows($this->pdo, '
            SELECT id, image_url, mobile_image_url, alt_text, sort_order
            FROM homepage_hero_slides
            ORDER BY sort_order, id
        ');

        return array_map('api_normalize_homepage_hero_carousel_row', $rows);
    }
}
