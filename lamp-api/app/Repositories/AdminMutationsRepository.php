<?php
declare(strict_types=1);

final class AdminMutationsRepository extends BaseRepository
{
    public function saveResource(string $resource, array $payload): int
    {
        return match ($resource) {
            'tournaments', 'archive_tournaments' => $this->replaceTournaments($payload),
            'clubs' => $this->replaceClubs($payload),
            'matches', 'archive_matches' => $this->replaceMatches($payload),
            'media' => $this->replaceMediaSettings($payload),
            'news' => $this->replaceNews($payload),
            'partners', 'partners_media' => $this->replacePartners($payload),
            'standings', 'archive_standings' => $this->replaceStandings($payload),
            'playoff' => $this->replacePlayoff($payload),
            'albums', 'media_albums' => $this->replaceAlbums($payload),
            'pages' => $this->replacePages($payload),
            default => throw new RuntimeException('Unknown admin resource'),
        };
    }

    private function replaceTournaments(array $payload): int
    {
        $items = array_values($payload);
        $slugs = [];

        $this->pdo->beginTransaction();
        try {
            api_execute($this->pdo, 'UPDATE tournaments SET is_featured = 0');

            foreach ($items as $item) {
                $slug = api_normalize_string($item['slug'] ?? '');
                $name = api_normalize_string($item['name'] ?? '');
                if ($slug === '' || $name === '') {
                    throw new RuntimeException('Each tournament must have slug and name');
                }
                $slugs[] = $slug;

                api_execute($this->pdo, '
                    INSERT INTO tournaments (
                        slug, name, season_year, short_label, logo_path, hero_image_url, description,
                        start_date, end_date, location, status, is_featured, countdown_enabled,
                        standings_mode, playoff_mode
                    )
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    ON DUPLICATE KEY UPDATE
                        name = VALUES(name),
                        season_year = VALUES(season_year),
                        short_label = VALUES(short_label),
                        logo_path = VALUES(logo_path),
                        hero_image_url = VALUES(hero_image_url),
                        description = VALUES(description),
                        start_date = VALUES(start_date),
                        end_date = VALUES(end_date),
                        location = VALUES(location),
                        status = VALUES(status),
                        is_featured = VALUES(is_featured),
                        countdown_enabled = VALUES(countdown_enabled),
                        standings_mode = VALUES(standings_mode),
                        playoff_mode = VALUES(playoff_mode)
                ', [
                    $slug,
                    $name,
                    api_parse_integer($item['season_year'] ?? null, null),
                    api_null_if_empty($item['short_label'] ?? null),
                    api_null_if_empty($item['logo'] ?? null),
                    api_null_if_empty($item['hero_image'] ?? null),
                    api_normalize_string($item['description'] ?? ''),
                    api_null_if_empty($item['start_date'] ?? null),
                    api_null_if_empty($item['end_date'] ?? null),
                    api_null_if_empty($item['location'] ?? null),
                    api_normalize_string($item['status'] ?? '') ?: 'draft',
                    api_parse_boolean($item['is_featured'] ?? false) ? 1 : 0,
                    api_parse_boolean($item['countdown_enabled'] ?? true) ? 1 : 0,
                    api_normalize_string($item['standings_mode'] ?? '') ?: 'auto',
                    api_normalize_string($item['playoff_mode'] ?? '') ?: 'auto',
                ]);
            }

            $this->deleteNotIn('tournaments', 'slug', $slugs);
            $this->pdo->commit();
        } catch (Throwable $error) {
            if ($this->pdo->inTransaction()) {
                $this->pdo->rollBack();
            }
            throw $error;
        }

        return count($items);
    }

    private function replaceClubs(array $payload): int
    {
        $items = array_values($payload);
        $slugs = [];

        $this->pdo->beginTransaction();
        try {
            foreach ($items as $item) {
                $slug = api_normalize_string($item['slug'] ?? '');
                $name = api_normalize_string($item['name'] ?? '');
                $logo = api_normalize_string($item['logo'] ?? '');
                if ($slug === '' || $name === '' || $logo === '') {
                    throw new RuntimeException('Each club must have slug, name and logo');
                }
                $slugs[] = $slug;

                api_execute($this->pdo, '
                    INSERT INTO clubs (
                        slug, name, short_name, logo_path, country, city, founded_year,
                        website_url, hero_image_url, description, is_active
                    )
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    ON DUPLICATE KEY UPDATE
                        name = VALUES(name),
                        short_name = VALUES(short_name),
                        logo_path = VALUES(logo_path),
                        country = VALUES(country),
                        city = VALUES(city),
                        founded_year = VALUES(founded_year),
                        website_url = VALUES(website_url),
                        hero_image_url = VALUES(hero_image_url),
                        description = VALUES(description),
                        is_active = VALUES(is_active)
                ', [
                    $slug,
                    $name,
                    api_null_if_empty($item['short_name'] ?? null),
                    $logo,
                    api_null_if_empty($item['country'] ?? null),
                    api_null_if_empty($item['city'] ?? null),
                    api_parse_integer($item['founded_year'] ?? null, null),
                    api_null_if_empty($item['website_url'] ?? null),
                    api_null_if_empty($item['hero_image'] ?? null),
                    api_normalize_string($item['description'] ?? ''),
                    api_parse_boolean($item['is_active'] ?? true) ? 1 : 0,
                ]);
            }

            $this->deleteNotIn('clubs', 'slug', $slugs);
            $this->pdo->commit();
        } catch (Throwable $error) {
            if ($this->pdo->inTransaction()) {
                $this->pdo->rollBack();
            }
            throw $error;
        }

        return count($items);
    }

    private function replaceMatches(array $payload): int
    {
        $items = array_values($payload);
        $tournamentMap = $this->loadSlugMap('tournaments');
        $clubMap = $this->loadSlugMap('clubs');
        $ids = [];
        $eventsMap = $this->loadMatchEventsMap(array_values(array_filter(array_map(
            static fn(array $item): ?int => api_parse_integer($item['id'] ?? null, null),
            $items
        ))));

        $this->pdo->beginTransaction();
        try {
            foreach ($items as $index => $item) {
                $id = api_parse_integer($item['id'] ?? null, 0);
                if (!$id) {
                    throw new RuntimeException('Each match must have numeric id');
                }

                $tournamentSlug = api_normalize_string($item['tournament_slug'] ?? '');
                $homeTeamSlug = api_normalize_string($item['home_team_slug'] ?? '');
                $awayTeamSlug = api_normalize_string($item['away_team_slug'] ?? '');
                $tournamentId = $tournamentMap[$tournamentSlug] ?? null;
                $homeClubId = $clubMap[$homeTeamSlug] ?? null;
                $awayClubId = $clubMap[$awayTeamSlug] ?? null;
                if (!$tournamentId || !$homeClubId || !$awayClubId) {
                    throw new RuntimeException("Match references missing tournament or clubs: {$id}");
                }

                $score = api_parse_score($item['score'] ?? '0:0');
                $status = api_normalize_string($item['status'] ?? '') ?: 'soon';
                $statusLabel = api_normalize_string($item['status_label'] ?? '') ?: $this->matchStatusLabel($status);

                $ids[] = $id;
                api_execute($this->pdo, '
                    INSERT INTO matches (
                        id, tournament_id, stage_name, round_name, matchday_label, match_date, match_time,
                        status, status_label, home_club_id, away_club_id, home_score, away_score,
                        venue, video_url, review_video_url, interview_video_url, is_featured_media, summary, sort_order
                    )
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    ON DUPLICATE KEY UPDATE
                        tournament_id = VALUES(tournament_id),
                        stage_name = VALUES(stage_name),
                        round_name = VALUES(round_name),
                        matchday_label = VALUES(matchday_label),
                        match_date = VALUES(match_date),
                        match_time = VALUES(match_time),
                        status = VALUES(status),
                        status_label = VALUES(status_label),
                        home_club_id = VALUES(home_club_id),
                        away_club_id = VALUES(away_club_id),
                        home_score = VALUES(home_score),
                        away_score = VALUES(away_score),
                        venue = VALUES(venue),
                        video_url = VALUES(video_url),
                        review_video_url = VALUES(review_video_url),
                        interview_video_url = VALUES(interview_video_url),
                        is_featured_media = VALUES(is_featured_media),
                        summary = VALUES(summary),
                        sort_order = VALUES(sort_order)
                ', [
                    $id,
                    $tournamentId,
                    api_null_if_empty($item['group'] ?? null),
                    api_null_if_empty($item['round'] ?? null),
                    api_null_if_empty($item['matchday'] ?? null),
                    api_null_if_empty($item['date'] ?? null),
                    api_null_if_empty($item['time'] ?? null),
                    $status,
                    $statusLabel,
                    $homeClubId,
                    $awayClubId,
                    $score['home'],
                    $score['away'],
                    api_null_if_empty($item['venue'] ?? null),
                    api_null_if_empty($item['video'] ?? null),
                    api_null_if_empty($item['review_video'] ?? null),
                    api_null_if_empty($item['interview_video'] ?? null),
                    api_parse_boolean($item['is_featured_media'] ?? false) ? 1 : 0,
                    api_normalize_string($item['summary'] ?? ''),
                    api_parse_integer($item['sort_order'] ?? null, $index + 1),
                ]);

                $events = array_key_exists('events', $item) && is_array($item['events'])
                    ? $item['events']
                    : ($eventsMap[$id] ?? []);

                api_execute($this->pdo, 'DELETE FROM match_events WHERE match_id = ?', [$id]);
                foreach (array_values($events) as $eventIndex => $event) {
                    api_execute($this->pdo, '
                        INSERT INTO match_events (
                            match_id, sort_order, minute_label, event_type, title, description
                        )
                        VALUES (?, ?, ?, ?, ?, ?)
                    ', [
                        $id,
                        api_parse_integer($event['sort_order'] ?? null, $eventIndex + 1),
                        api_null_if_empty($event['minute'] ?? null),
                        api_normalize_string($event['type'] ?? '') ?: 'note',
                        api_null_if_empty($event['title'] ?? null),
                        api_normalize_string($event['description'] ?? ''),
                    ]);
                }
            }

            $this->deleteNotIn('matches', 'id', $ids);
            $this->pdo->commit();
        } catch (Throwable $error) {
            if ($this->pdo->inTransaction()) {
                $this->pdo->rollBack();
            }
            throw $error;
        }

        return count($items);
    }

    private function replaceMediaSettings(array $payload): int
    {
        $items = array_values($payload);
        $item = $items[0] ?? [];
        $featuredTournament = api_get_target_tournament($this->pdo, null);
        if (!$featuredTournament) {
            throw new RuntimeException('Featured tournament not found');
        }

        $selectedId = api_parse_integer($item['featured_match_id'] ?? null, 0) ?? 0;
        $photoReportsEnabled = api_parse_boolean($item['photo_reports_enabled'] ?? true) ? 1 : 0;

        $this->pdo->beginTransaction();
        try {
            api_ensure_tournament_photo_reports_flag($this->pdo);
            api_execute($this->pdo, 'UPDATE matches SET is_featured_media = 0');
            if ($selectedId > 0) {
                $matchRow = api_query_one($this->pdo, 'SELECT id FROM matches WHERE id = ? LIMIT 1', [$selectedId]);
                if (!$matchRow) {
                    throw new RuntimeException('Selected featured match was not found');
                }
                api_execute($this->pdo, 'UPDATE matches SET is_featured_media = 1 WHERE id = ?', [$selectedId]);
            }

            api_execute($this->pdo, '
                UPDATE tournaments
                SET photo_reports_enabled = ?
                WHERE id = ?
            ', [
                $photoReportsEnabled,
                (int) $featuredTournament['id'],
            ]);

            $this->pdo->commit();
        } catch (Throwable $error) {
            if ($this->pdo->inTransaction()) {
                $this->pdo->rollBack();
            }
            throw $error;
        }

        return 1;
    }

    private function replaceNews(array $payload): int
    {
        $items = array_values($payload);
        $tournamentMap = $this->loadSlugMap('tournaments');
        $articleIds = array_values(array_filter(array_map(
            static fn(array $item): ?int => api_parse_integer($item['id'] ?? null, null),
            $items
        )));
        $photoMap = $this->loadNewsPhotoMap($articleIds);

        $this->pdo->beginTransaction();
        try {
            foreach ($items as $item) {
                $id = api_parse_integer($item['id'] ?? null, 0);
                if (!$id) {
                    throw new RuntimeException('Each news item must have numeric id');
                }

                $tournamentSlug = api_normalize_string($item['tournament_slug'] ?? '');
                $tournamentId = $tournamentSlug ? ($tournamentMap[$tournamentSlug] ?? null) : null;
                $slug = api_normalize_string($item['slug'] ?? '') ?: api_slugify($item['title'] ?? '') ?: "news-{$id}";

                api_execute($this->pdo, '
                    INSERT INTO news_articles (
                        id, tournament_id, slug, published_on, title, excerpt, body, body_html,
                        link_path, image_url, video_url, is_published
                    )
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    ON DUPLICATE KEY UPDATE
                        tournament_id = VALUES(tournament_id),
                        slug = VALUES(slug),
                        published_on = VALUES(published_on),
                        title = VALUES(title),
                        excerpt = VALUES(excerpt),
                        body = VALUES(body),
                        body_html = VALUES(body_html),
                        link_path = VALUES(link_path),
                        image_url = VALUES(image_url),
                        video_url = VALUES(video_url),
                        is_published = VALUES(is_published)
                ', [
                    $id,
                    $tournamentId,
                    $slug,
                    api_null_if_empty($item['date'] ?? null),
                    api_normalize_string($item['title'] ?? ''),
                    api_normalize_string($item['excerpt'] ?? ''),
                    api_normalize_string($item['body'] ?? ''),
                    api_normalize_html_string($item['body_html'] ?? ''),
                    api_normalize_string($item['link'] ?? '') ?: '',
                    api_null_if_empty($item['image'] ?? null),
                    api_null_if_empty($item['video_url'] ?? null),
                    api_parse_boolean($item['is_published'] ?? true) ? 1 : 0,
                ]);

                $photos = array_key_exists('photos', $item) && is_array($item['photos'])
                    ? $item['photos']
                    : ($photoMap[$id] ?? []);

                api_execute($this->pdo, 'DELETE FROM news_article_photos WHERE news_article_id = ?', [$id]);
                foreach (array_values($photos) as $photoIndex => $photo) {
                    if (api_normalize_string($photo['image_url'] ?? '') === '') {
                        continue;
                    }
                    api_execute($this->pdo, '
                        INSERT INTO news_article_photos (news_article_id, image_url, alt_text, sort_order)
                        VALUES (?, ?, ?, ?)
                    ', [
                        $id,
                        api_normalize_string($photo['image_url'] ?? ''),
                        api_normalize_string($photo['alt_text'] ?? ''),
                        api_parse_integer($photo['sort_order'] ?? null, $photoIndex + 1),
                    ]);
                }
            }

            $this->deleteNotIn('news_articles', 'id', $articleIds);
            $this->pdo->commit();
        } catch (Throwable $error) {
            if ($this->pdo->inTransaction()) {
                $this->pdo->rollBack();
            }
            throw $error;
        }

        return count($items);
    }

    private function replacePartners(array $payload): int
    {
        $items = array_values($payload);
        $tournamentMap = $this->loadSlugMap('tournaments');
        $this->pdo->beginTransaction();
        try {
            api_execute($this->pdo, 'DELETE FROM tournament_partners');
            $slugs = [];
            foreach ($items as $item) {
                $slug = api_normalize_string($item['slug'] ?? '');
                $name = api_normalize_string($item['name'] ?? '');
                if ($slug === '' || $name === '') {
                    throw new RuntimeException('Each partner must have slug and name');
                }
                $slugs[] = $slug;

                api_execute($this->pdo, '
                    INSERT INTO partners (slug, name, website_url, description, is_active)
                    VALUES (?, ?, ?, ?, 1)
                    ON DUPLICATE KEY UPDATE
                        name = VALUES(name),
                        website_url = VALUES(website_url),
                        description = VALUES(description),
                        is_active = VALUES(is_active)
                ', [
                    $slug,
                    $name,
                    api_null_if_empty($item['website_url'] ?? null),
                    api_normalize_string($item['note'] ?? ''),
                ]);

                $partnerRow = api_query_one($this->pdo, 'SELECT id FROM partners WHERE slug = ? LIMIT 1', [$slug]);
                if (!$partnerRow) {
                    throw new RuntimeException("Partner not found after save: {$slug}");
                }
                $partnerId = (int) $partnerRow['id'];
                $categoryId = $this->ensurePartnerCategory(api_normalize_string($item['category'] ?? 'general'));
                $logoAssetId = $this->setPartnerLogo($partnerId, $item, $name);

                $tournamentSlug = api_normalize_string($item['tournament_slug'] ?? '');
                $tournamentId = $tournamentSlug === '' ? null : ($tournamentMap[$tournamentSlug] ?? null);
                if ($tournamentSlug !== '' && !$tournamentId) {
                    throw new RuntimeException("Tournament not found for partner: {$tournamentSlug}");
                }

                api_execute($this->pdo, '
                    INSERT INTO tournament_partners (
                        tournament_id, partner_id, category_id, logo_asset_id, sort_order, is_visible
                    )
                    VALUES (?, ?, ?, ?, ?, ?)
                ', [
                    $tournamentId,
                    $partnerId,
                    $categoryId,
                    $logoAssetId,
                    api_parse_integer($item['sort_order'] ?? null, 0),
                    api_parse_boolean($item['is_visible'] ?? true) ? 1 : 0,
                ]);
            }

            $this->deleteNotIn('partners', 'slug', $slugs);
            $this->pdo->commit();
        } catch (Throwable $error) {
            if ($this->pdo->inTransaction()) {
                $this->pdo->rollBack();
            }
            throw $error;
        }

        return count($items);
    }

    private function replaceStandings(array $payload): int
    {
        $items = array_values($payload);
        $tournamentMap = $this->loadSlugMap('tournaments');
        $clubMap = $this->loadSlugMap('clubs');

        $this->pdo->beginTransaction();
        try {
            api_execute($this->pdo, 'DELETE FROM tournament_standings');
            foreach ($items as $item) {
                $tournamentSlug = api_normalize_string($item['tournament_slug'] ?? '');
                $teamSlug = api_normalize_string($item['team_slug'] ?? '');
                $tournamentId = $tournamentMap[$tournamentSlug] ?? null;
                $clubId = $clubMap[$teamSlug] ?? null;
                if (!$tournamentId || !$clubId) {
                    throw new RuntimeException('Standings row references missing tournament or club');
                }

                api_execute($this->pdo, '
                    INSERT INTO tournament_standings (
                        tournament_id, club_id, group_name, position, played, won, drawn, lost,
                        goals_for, goals_against, points
                    )
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ', [
                    $tournamentId,
                    $clubId,
                    api_normalize_string($item['group_name'] ?? '') ?: 'overall',
                    api_parse_integer($item['position'] ?? null, 0),
                    api_parse_integer($item['played'] ?? null, 0),
                    api_parse_integer($item['won'] ?? null, 0),
                    api_parse_integer($item['drawn'] ?? null, 0),
                    api_parse_integer($item['lost'] ?? null, 0),
                    api_parse_integer($item['goals_for'] ?? null, 0),
                    api_parse_integer($item['goals_against'] ?? null, 0),
                    api_parse_integer($item['points'] ?? null, 0),
                ]);
            }
            $this->pdo->commit();
        } catch (Throwable $error) {
            if ($this->pdo->inTransaction()) {
                $this->pdo->rollBack();
            }
            throw $error;
        }

        return count($items);
    }

    private function replacePlayoff(array $payload): int
    {
        $items = array_values($payload);
        $currentTournament = api_get_target_tournament($this->pdo, null);
        if (!$currentTournament) {
            throw new RuntimeException('Current tournament not found');
        }
        $clubMap = $this->loadSlugMap('clubs');

        $this->pdo->beginTransaction();
        try {
            api_execute($this->pdo, 'DELETE FROM tournament_playoff_matches WHERE tournament_id = ?', [(int) $currentTournament['id']]);
            foreach ($items as $item) {
                api_execute($this->pdo, '
                    INSERT INTO tournament_playoff_matches (
                        tournament_id, bracket_group, round_group, match_key, sort_order, label,
                        home_club_id, away_club_id, home_label, away_label, home_logo_path, away_logo_path,
                        home_score, away_score
                    )
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ', [
                    (int) $currentTournament['id'],
                    api_normalize_string($item['bracket_group'] ?? '') ?: 'top',
                    api_normalize_string($item['round_group'] ?? '') ?: 'semifinal',
                    api_normalize_string($item['match_key'] ?? ''),
                    api_parse_integer($item['sort_order'] ?? null, 0),
                    api_normalize_string($item['label'] ?? ''),
                    $clubMap[api_normalize_string($item['home_team_slug'] ?? '')] ?? null,
                    $clubMap[api_normalize_string($item['away_team_slug'] ?? '')] ?? null,
                    api_normalize_string($item['home_team'] ?? ''),
                    api_normalize_string($item['away_team'] ?? ''),
                    api_null_if_empty($item['home_logo'] ?? null),
                    api_null_if_empty($item['away_logo'] ?? null),
                    api_parse_integer($item['home_score'] ?? null, 0),
                    api_parse_integer($item['away_score'] ?? null, 0),
                ]);
            }
            $this->pdo->commit();
        } catch (Throwable $error) {
            if ($this->pdo->inTransaction()) {
                $this->pdo->rollBack();
            }
            throw $error;
        }

        return count($items);
    }

    private function replaceAlbums(array $payload): int
    {
        $items = array_values($payload);
        $tournamentMap = $this->loadSlugMap('tournaments');
        $albumIds = array_values(array_filter(array_map(
            static fn(array $item): ?int => api_parse_integer($item['id'] ?? null, null),
            $items
        )));
        $photoMap = $this->loadAlbumPhotoMap($albumIds);
        $slugs = [];

        $this->pdo->beginTransaction();
        try {
            foreach ($items as $item) {
                $slug = api_normalize_string($item['slug'] ?? '') ?: api_slugify($item['title'] ?? '');
                $title = api_normalize_string($item['title'] ?? '');
                if ($slug === '' || $title === '') {
                    throw new RuntimeException('Each album must have slug and title');
                }
                $slugs[] = $slug;
                $tournamentSlug = api_normalize_string($item['tournament_slug'] ?? '');
                $tournamentId = $tournamentSlug === '' ? null : ($tournamentMap[$tournamentSlug] ?? null);

                api_execute($this->pdo, '
                    INSERT INTO media_albums (
                        tournament_id, slug, title, card_excerpt, description, badge,
                        cover_image_url, cover_alt_text, published_on, sort_order, is_visible
                    )
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    ON DUPLICATE KEY UPDATE
                        tournament_id = VALUES(tournament_id),
                        title = VALUES(title),
                        card_excerpt = VALUES(card_excerpt),
                        description = VALUES(description),
                        badge = VALUES(badge),
                        cover_image_url = VALUES(cover_image_url),
                        cover_alt_text = VALUES(cover_alt_text),
                        published_on = VALUES(published_on),
                        sort_order = VALUES(sort_order),
                        is_visible = VALUES(is_visible)
                ', [
                    $tournamentId,
                    $slug,
                    $title,
                    api_normalize_string($item['card_excerpt'] ?? ''),
                    api_normalize_string($item['description'] ?? ''),
                    api_normalize_string($item['badge'] ?? '') ?: 'Фотоальбом',
                    api_null_if_empty($item['cover_image_url'] ?? null),
                    api_normalize_string($item['cover_alt_text'] ?? '') ?: $title,
                    api_null_if_empty($item['published_on'] ?? null),
                    api_parse_integer($item['sort_order'] ?? null, 0),
                    api_parse_boolean($item['is_visible'] ?? true) ? 1 : 0,
                ]);

                $albumRow = api_query_one($this->pdo, 'SELECT id FROM media_albums WHERE slug = ? LIMIT 1', [$slug]);
                if (!$albumRow) {
                    throw new RuntimeException("Album not found after save: {$slug}");
                }
                $albumId = (int) $albumRow['id'];
                $photos = array_key_exists('photos', $item) && is_array($item['photos'])
                    ? $item['photos']
                    : ($photoMap[$albumId] ?? []);

                api_execute($this->pdo, 'DELETE FROM media_album_photos WHERE album_id = ?', [$albumId]);
                foreach (array_values($photos) as $photoIndex => $photo) {
                    if (api_normalize_string($photo['image_url'] ?? '') === '') {
                        continue;
                    }
                    api_execute($this->pdo, '
                        INSERT INTO media_album_photos (album_id, image_url, alt_text, caption, sort_order)
                        VALUES (?, ?, ?, ?, ?)
                    ', [
                        $albumId,
                        api_normalize_string($photo['image_url'] ?? ''),
                        api_normalize_string($photo['alt_text'] ?? ''),
                        api_normalize_string($photo['caption'] ?? ''),
                        api_parse_integer($photo['sort_order'] ?? null, $photoIndex + 1),
                    ]);
                }
            }

            $this->deleteNotIn('media_albums', 'slug', $slugs);
            $this->pdo->commit();
        } catch (Throwable $error) {
            if ($this->pdo->inTransaction()) {
                $this->pdo->rollBack();
            }
            throw $error;
        }

        return count($items);
    }

    private function replacePages(array $payload): int
    {
        $items = array_values($payload);
        $slugs = [];
        $this->pdo->beginTransaction();
        try {
            foreach ($items as $item) {
                $slug = api_normalize_string($item['slug'] ?? '');
                if ($slug === '') {
                    continue;
                }
                $slugs[] = $slug;
                api_execute($this->pdo, '
                    INSERT INTO site_pages (slug, title, subtitle, body_html)
                    VALUES (?, ?, ?, ?)
                    ON DUPLICATE KEY UPDATE
                        title = VALUES(title),
                        subtitle = VALUES(subtitle),
                        body_html = VALUES(body_html)
                ', [
                    $slug,
                    api_normalize_string($item['title'] ?? ''),
                    api_normalize_string($item['subtitle'] ?? ''),
                    api_normalize_html_string($item['body_html'] ?? ''),
                ]);
            }
            $this->deleteNotIn('site_pages', 'slug', $slugs);
            $this->pdo->commit();
        } catch (Throwable $error) {
            if ($this->pdo->inTransaction()) {
                $this->pdo->rollBack();
            }
            throw $error;
        }

        return count($items);
    }

    private function deleteNotIn(string $tableName, string $columnName, array $values): void
    {
        if (!$values) {
            api_execute($this->pdo, "DELETE FROM `{$tableName}`");
            return;
        }
        api_execute(
            $this->pdo,
            "DELETE FROM `{$tableName}` WHERE `{$columnName}` NOT IN (" . api_sql_in_placeholders($values) . ")",
            array_values($values)
        );
    }

    private function loadSlugMap(string $tableName): array
    {
        $rows = api_query_rows($this->pdo, "SELECT id, slug FROM `{$tableName}`");
        $map = [];
        foreach ($rows as $row) {
            $map[(string) $row['slug']] = (int) $row['id'];
        }
        return $map;
    }

    private function ensurePartnerCategory(string $slug): int
    {
        $categorySlug = $slug !== '' ? $slug : 'general';
        $categoryName = match ($categorySlug) {
            'general' => 'Партнёры турнира',
            'media' => 'Информационные партнёры',
            'title' => 'Титульные партнёры',
            'official' => 'Официальные партнёры',
            default => $categorySlug,
        };
        api_execute($this->pdo, '
            INSERT INTO partner_categories (slug, name)
            VALUES (?, ?)
            ON DUPLICATE KEY UPDATE
              name = VALUES(name)
        ', [$categorySlug, $categoryName]);
        $row = api_query_one($this->pdo, 'SELECT id FROM partner_categories WHERE slug = ? LIMIT 1', [$categorySlug]);
        if (!$row) {
            throw new RuntimeException("Partner category not found: {$categorySlug}");
        }
        return (int) $row['id'];
    }

    private function setPartnerLogo(int $partnerId, array $item, string $partnerName): ?int
    {
        api_execute($this->pdo, 'DELETE FROM partner_logo_assets WHERE partner_id = ?', [$partnerId]);
        $logoUrl = api_normalize_string($item['logo_url'] ?? '');
        if ($logoUrl === '') {
            return null;
        }
        $result = api_execute($this->pdo, '
            INSERT INTO partner_logo_assets (
                partner_id, image_url, alt_text, storage_provider, public_id, file_name,
                mime_type, asset_format, width, height, bytes, is_current
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
        ', [
            $partnerId,
            $logoUrl,
            api_normalize_string($item['alt_text'] ?? '') ?: $partnerName,
            api_null_if_empty($item['logo_storage_provider'] ?? null),
            api_null_if_empty($item['logo_public_id'] ?? null),
            api_null_if_empty($item['logo_file_name'] ?? null),
            api_null_if_empty($item['logo_mime_type'] ?? null),
            api_null_if_empty($item['logo_format'] ?? null),
            $item['logo_width'] ?? null,
            $item['logo_height'] ?? null,
            $item['logo_bytes'] ?? null,
        ]);
        return (int) $this->pdo->lastInsertId();
    }

    private function loadMatchEventsMap(array $matchIds): array
    {
        if (!$matchIds) {
            return [];
        }

        $rows = api_query_rows($this->pdo, '
            SELECT match_id, minute_label, event_type, title, description, sort_order
            FROM match_events
            WHERE match_id IN (' . api_sql_in_placeholders($matchIds) . ')
            ORDER BY match_id, sort_order, id
        ', array_values($matchIds));

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

    private function loadNewsPhotoMap(array $articleIds): array
    {
        if (!$articleIds) {
            return [];
        }

        $rows = api_query_rows($this->pdo, '
            SELECT news_article_id, image_url, alt_text, sort_order
            FROM news_article_photos
            WHERE news_article_id IN (' . api_sql_in_placeholders($articleIds) . ')
            ORDER BY news_article_id, sort_order, id
        ', array_values($articleIds));

        $map = [];
        foreach ($rows as $row) {
            $articleId = (int) $row['news_article_id'];
            $map[$articleId] ??= [];
            $map[$articleId][] = [
                'image_url' => (string) ($row['image_url'] ?? ''),
                'alt_text' => (string) ($row['alt_text'] ?? ''),
                'sort_order' => api_parse_integer($row['sort_order'] ?? null, 0) ?? 0,
            ];
        }
        return $map;
    }

    private function loadAlbumPhotoMap(array $albumIds): array
    {
        if (!$albumIds) {
            return [];
        }

        $rows = api_query_rows($this->pdo, '
            SELECT album_id, image_url, alt_text, caption, sort_order
            FROM media_album_photos
            WHERE album_id IN (' . api_sql_in_placeholders($albumIds) . ')
            ORDER BY album_id, sort_order, id
        ', array_values($albumIds));

        $map = [];
        foreach ($rows as $row) {
            $albumId = (int) $row['album_id'];
            $map[$albumId] ??= [];
            $map[$albumId][] = [
                'image_url' => (string) ($row['image_url'] ?? ''),
                'alt_text' => (string) ($row['alt_text'] ?? ''),
                'caption' => (string) ($row['caption'] ?? ''),
                'sort_order' => api_parse_integer($row['sort_order'] ?? null, 0) ?? 0,
            ];
        }
        return $map;
    }

    private function matchStatusLabel(string $status): string
    {
        return match (strtolower($status)) {
            'soon' => 'Скоро',
            'live' => 'В эфире',
            'done' => 'Завершен',
            'postponed' => 'Перенесен',
            'cancelled' => 'Отменен',
            default => '',
        };
    }
}
