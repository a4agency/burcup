BEGIN;

INSERT INTO tournaments (
  slug,
  name,
  season_year,
  short_label,
  logo_path,
  description,
  start_date,
  end_date,
  location,
  status,
  is_featured,
  countdown_enabled
)
VALUES
  (
    'burchalkin-cup-2026',
    'Burchalkin Cup 2026',
    2026,
    'BCUP 2026',
    'images/logo-burchalkin.webp',
    'Основной турнир сезона 2026 года. Используется как текущий турнир сайта и содержит таблицу, расписание, новости и партнёров.',
    DATE '2026-05-15',
    DATE '2026-05-17',
    'Санкт-Петербург',
    'upcoming',
    TRUE,
    TRUE
  ),
  (
    'burchalkin-cup-2025',
    'Burchalkin Cup 2025',
    2025,
    'BCUP 2025',
    'images/logo-burchalkin.webp',
    'Архивный турнир прошлого сезона. Нужен как основа для масштабирования сайта по годам.',
    DATE '2025-05-16',
    DATE '2025-05-20',
    'Санкт-Петербург',
    'completed',
    FALSE,
    FALSE
  )
ON CONFLICT (slug) DO UPDATE
SET
  name = EXCLUDED.name,
  season_year = EXCLUDED.season_year,
  short_label = EXCLUDED.short_label,
  logo_path = EXCLUDED.logo_path,
  description = EXCLUDED.description,
  start_date = EXCLUDED.start_date,
  end_date = EXCLUDED.end_date,
  location = EXCLUDED.location,
  status = EXCLUDED.status,
  is_featured = EXCLUDED.is_featured,
  countdown_enabled = EXCLUDED.countdown_enabled;

INSERT INTO clubs (
  slug,
  name,
  short_name,
  logo_path,
  country,
  city,
  description
)
VALUES
  ('almaz-antey', 'Алмаз-Антей', 'Алмаз-Антей', 'images/team-almaz-antey.webp', 'Россия', 'Санкт-Петербург', 'Футбольный клуб, регулярно участвующий в турнирах Burchalkin Cup.'),
  ('zenit', 'Зенит', 'Зенит', 'images/team-zenit.webp', 'Россия', 'Санкт-Петербург', 'Один из ключевых клубов турнирной сетки и истории матчей сайта.'),
  ('palmeiras', 'Палмейрас', 'Палмейрас', 'images/team-palmeiras.webp', 'Бразилия', NULL, 'Международный участник турнира Burchalkin Cup.'),
  ('kairat', 'Кайрат', 'Кайрат', 'images/team-kairat.webp', 'Казахстан', 'Алматы', 'Клуб для международной турнирной линейки и страницы истории матчей.'),
  ('crvena-zvezda', 'Црвена Звезда', 'Црвена Звезда', 'images/team-crvena-zvezda.webp', 'Сербия', 'Белград', 'Участник международного состава турнира.'),
  ('fenerbahce', 'Фенербахче', 'Фенербахче', 'images/team-fenerbahce.webp', 'Турция', 'Стамбул', 'Клуб для будущих и архивных сезонов турнира.'),
  ('san-lorenzo', 'Сан-Лоренсо', 'Сан-Лоренсо', 'images/team-san-lorenzo.webp', 'Аргентина', 'Буэнос-Айрес', 'Клуб с будущими и архивными матчами в общей истории сайта.'),
  ('dinamo-minsk', 'Динамо-Минск', 'Динамо-Минск', 'images/team-dinamo-minsk.webp', 'Беларусь', 'Минск', 'Клуб для турнирной истории и карточки команды.')
ON CONFLICT (slug) DO UPDATE
SET
  name = EXCLUDED.name,
  short_name = EXCLUDED.short_name,
  logo_path = EXCLUDED.logo_path,
  country = EXCLUDED.country,
  city = EXCLUDED.city,
  description = EXCLUDED.description;

INSERT INTO tournament_clubs (
  tournament_id,
  club_id,
  group_name,
  seeded_order,
  notes
)
SELECT tournament.id, club.id, data.group_name, data.seeded_order, data.notes
FROM (
  VALUES
    ('burchalkin-cup-2026', 'almaz-antey', 'A', 1, ''),
    ('burchalkin-cup-2026', 'crvena-zvezda', 'A', 2, ''),
    ('burchalkin-cup-2026', 'zenit', 'A', 3, ''),
    ('burchalkin-cup-2026', 'dinamo-minsk', 'A', 4, ''),
    ('burchalkin-cup-2026', 'palmeiras', 'B', 1, ''),
    ('burchalkin-cup-2026', 'kairat', 'B', 2, ''),
    ('burchalkin-cup-2026', 'fenerbahce', 'B', 3, ''),
    ('burchalkin-cup-2026', 'san-lorenzo', 'B', 4, ''),
    ('burchalkin-cup-2025', 'almaz-antey', NULL, 1, 'Архивный участник для прошлогоднего турнира'),
    ('burchalkin-cup-2025', 'zenit', NULL, 2, 'Архивный участник для прошлогоднего турнира'),
    ('burchalkin-cup-2025', 'kairat', NULL, 3, 'Архивный участник для прошлогоднего турнира')
) AS data(tournament_slug, club_slug, group_name, seeded_order, notes)
JOIN tournaments tournament ON tournament.slug = data.tournament_slug
JOIN clubs club ON club.slug = data.club_slug
ON CONFLICT (tournament_id, club_id) DO UPDATE
SET
  group_name = EXCLUDED.group_name,
  seeded_order = EXCLUDED.seeded_order,
  notes = EXCLUDED.notes;

INSERT INTO tournament_standings (
  tournament_id,
  club_id,
  group_name,
  position,
  played,
  won,
  drawn,
  lost,
  goals_for,
  goals_against,
  points
)
SELECT
  tournament.id,
  club.id,
  data.group_name,
  data.position,
  data.played,
  data.won,
  data.drawn,
  data.lost,
  data.goals_for,
  data.goals_against,
  data.points
FROM (
  VALUES
    ('burchalkin-cup-2026', 'almaz-antey', 'overall', 1, 3, 2, 1, 0, 16, 3, 7),
    ('burchalkin-cup-2026', 'zenit', 'overall', 2, 3, 2, 0, 1, 5, 4, 6),
    ('burchalkin-cup-2026', 'palmeiras', 'overall', 3, 3, 1, 2, 0, 4, 3, 5),
    ('burchalkin-cup-2026', 'kairat', 'overall', 4, 3, 1, 1, 1, 4, 4, 4),
    ('burchalkin-cup-2026', 'crvena-zvezda', 'overall', 5, 3, 1, 1, 1, 3, 3, 4),
    ('burchalkin-cup-2026', 'fenerbahce', 'overall', 6, 3, 1, 0, 2, 3, 5, 3),
    ('burchalkin-cup-2026', 'san-lorenzo', 'overall', 7, 3, 0, 1, 2, 2, 5, 1),
    ('burchalkin-cup-2026', 'dinamo-minsk', 'overall', 8, 3, 0, 1, 2, 1, 6, 1)
) AS data(tournament_slug, club_slug, group_name, position, played, won, drawn, lost, goals_for, goals_against, points)
JOIN tournaments tournament ON tournament.slug = data.tournament_slug
JOIN clubs club ON club.slug = data.club_slug
ON CONFLICT (tournament_id, club_id, group_name) DO UPDATE
SET
  position = EXCLUDED.position,
  played = EXCLUDED.played,
  won = EXCLUDED.won,
  drawn = EXCLUDED.drawn,
  lost = EXCLUDED.lost,
  goals_for = EXCLUDED.goals_for,
  goals_against = EXCLUDED.goals_against,
  points = EXCLUDED.points;

INSERT INTO matches (
  id,
  tournament_id,
  stage_name,
  round_name,
  matchday_label,
  match_date,
  match_time,
  status,
  status_label,
  home_club_id,
  away_club_id,
  home_score,
  away_score,
  venue,
  video_url,
  review_video_url,
  interview_video_url,
  summary,
  sort_order
)
SELECT
  data.id,
  tournament.id,
  data.stage_name,
  data.round_name,
  data.matchday_label,
  data.match_date,
  data.match_time,
  data.status,
  data.status_label,
  home_club.id,
  away_club.id,
  data.home_score,
  data.away_score,
  data.venue,
  data.video_url,
  data.review_video_url,
  data.interview_video_url,
  data.summary,
  data.sort_order
FROM (
  VALUES
    (1::BIGINT, 'burchalkin-cup-2026', 'Группа A', '1 тур', 'День 1', DATE '2026-05-15', '10:00'::TIME, 'done', 'Завершен', 'almaz-antey', 'crvena-zvezda', 10, 3, 'Стадион "Алмаз-Антей"', 'https://vkvideo.ru/video_ext.php?oid=-120721420&id=456239434&hash=a4ca6ca1e82ce6c4&hd=4', NULL::TEXT, NULL::TEXT, 'Открывающий матч игрового дня. На этой странице можно показывать прямой эфир или запись игры.', 1),
    (2::BIGINT, 'burchalkin-cup-2026', 'Группа A', '1 тур', 'День 1', DATE '2026-05-15', '12:00'::TIME, 'live', 'В эфире', 'zenit', 'kairat', 4, 1, 'Стадион "Алмаз-Антей"', 'https://vkvideo.ru/video_ext.php?oid=-120721420&id=456239431&hash=90e82e3d00ac220b&hd=4', NULL::TEXT, NULL::TEXT, 'Матч идёт в прямом эфире', 2),
    (3::BIGINT, 'burchalkin-cup-2026', 'Группа B', '1 тур', 'День 1', DATE '2026-05-15', '14:00'::TIME, 'soon', 'Скоро', 'san-lorenzo', 'fenerbahce', 0, 0, 'Стадион "Алмаз-Антей"', 'https://vkvideo.ru/video_ext.php?oid=-120721420&id=456239505&hash=eabac0fc9cb32fa5&hd=4', NULL::TEXT, NULL::TEXT, 'Матч группового этапа. Перед началом можно показывать анонс, а после — запись встречи.', 3),
    (1773883313332::BIGINT, 'burchalkin-cup-2026', 'Группа B', '2 тур', 'День 2', DATE '2026-05-15', '10:00'::TIME, 'soon', 'Скоро', 'dinamo-minsk', 'palmeiras', 0, 0, 'Стадион "Алмаз-Антей"', 'https://vkvideo.ru/video_ext.php?oid=-120721420&id=456239433&hash=bea5fe2662c311f2&hd=4', NULL::TEXT, NULL::TEXT, '', 4),
    (1773883426669::BIGINT, 'burchalkin-cup-2026', 'Группа A', '2 тур', 'День 2', DATE '2026-05-15', '10:00'::TIME, 'soon', 'Скоро', 'almaz-antey', 'zenit', 0, 0, 'Стадион "Алмаз-Антей"', 'https://vkvideo.ru/video_ext.php?oid=-120721420&id=456239433&hash=bea5fe2662c311f2&hd=4', NULL::TEXT, NULL::TEXT, '', 5),
    (1773883471638::BIGINT, 'burchalkin-cup-2026', 'Группа B', '2 тур', 'День 2', DATE '2026-05-15', '10:00'::TIME, 'soon', 'Скоро', 'kairat', 'fenerbahce', 0, 0, 'Стадион "Алмаз-Антей"', 'https://vkvideo.ru/video_ext.php?oid=-120721420&id=456239433&hash=bea5fe2662c311f2&hd=4', NULL::TEXT, NULL::TEXT, '', 6),
    (2025051601::BIGINT, 'burchalkin-cup-2025', 'Группа B', '1 тур', 'Архив', DATE '2025-05-16', '12:00'::TIME, 'done', 'Завершен', 'zenit', 'kairat', 2, 0, 'Стадион "Алмаз-Антей"', 'https://www.youtube.com/embed/5qap5aO4i9A', NULL::TEXT, NULL::TEXT, 'Архивный матч для проверки сквозной истории клуба.', 1)
) AS data(id, tournament_slug, stage_name, round_name, matchday_label, match_date, match_time, status, status_label, home_club_slug, away_club_slug, home_score, away_score, venue, video_url, review_video_url, interview_video_url, summary, sort_order)
JOIN tournaments tournament ON tournament.slug = data.tournament_slug
JOIN clubs home_club ON home_club.slug = data.home_club_slug
JOIN clubs away_club ON away_club.slug = data.away_club_slug
ON CONFLICT (id) DO UPDATE
SET
  tournament_id = EXCLUDED.tournament_id,
  stage_name = EXCLUDED.stage_name,
  round_name = EXCLUDED.round_name,
  matchday_label = EXCLUDED.matchday_label,
  match_date = EXCLUDED.match_date,
  match_time = EXCLUDED.match_time,
  status = EXCLUDED.status,
  status_label = EXCLUDED.status_label,
  home_club_id = EXCLUDED.home_club_id,
  away_club_id = EXCLUDED.away_club_id,
  home_score = EXCLUDED.home_score,
  away_score = EXCLUDED.away_score,
  venue = EXCLUDED.venue,
  video_url = EXCLUDED.video_url,
  review_video_url = EXCLUDED.review_video_url,
  interview_video_url = EXCLUDED.interview_video_url,
  summary = EXCLUDED.summary,
  sort_order = EXCLUDED.sort_order;

INSERT INTO match_events (
  match_id,
  sort_order,
  minute_label,
  event_type,
  title,
  description
)
VALUES
  (1, 1, NULL, 'timeline', 'Открытие эфира', 'Открытие эфира — за 10 минут до матча'),
  (1, 2, '10:00', 'timeline', '1 тайм', '1 тайм — 10:00'),
  (1, 3, NULL, 'timeline', 'Перерыв', 'Перерыв'),
  (1, 4, '10:35', 'timeline', '2 тайм', '2 тайм — 10:35'),
  (2, 1, '14''', 'score', 'Гол', '14'' — 1:0'),
  (2, 2, '52''', 'score', 'Гол', '52'' — 2:0'),
  (2, 3, NULL, 'timeline', 'Финальный свисток', 'Финальный свисток'),
  (3, 1, NULL, 'timeline', 'Эфир', 'Эфир стартует за 10 минут до игры')
ON CONFLICT (match_id, sort_order) DO UPDATE
SET
  minute_label = EXCLUDED.minute_label,
  event_type = EXCLUDED.event_type,
  title = EXCLUDED.title,
  description = EXCLUDED.description;

INSERT INTO news_articles (
  id,
  tournament_id,
  slug,
  published_on,
  title,
  excerpt,
  body,
  link_path,
  image_url,
  is_published
)
SELECT
  data.id,
  tournament.id,
  data.slug,
  data.published_on,
  data.title,
  data.excerpt,
  data.body,
  data.link_path,
  data.image_url,
  data.is_published
FROM (
  VALUES
    (1::BIGINT, 'burchalkin-cup-2026', 'applications-open', NULL::DATE, 'Стартовал приём заявок на Burchalkin Cup', 'Турнир соберёт международный состав команд и продолжит традицию детско-юношеского футбольного фестиваля.', '', 'news.html', NULL, TRUE),
    (2::BIGINT, 'burchalkin-cup-2026', 'first-day-schedule-published', NULL::DATE, 'Опубликовано расписание первого игрового дня', 'На сайте уже доступны первые пары, время матчей и блок трансляций для зрителей и родителей.', '', 'matches.html', NULL, TRUE),
    (3::BIGINT, 'burchalkin-cup-2026', 'playoff-bracket-coming-soon', NULL::DATE, 'Финальная сетка будет доступна после группового этапа', 'В плей-офф выйдут лучшие команды турнира, а сетка появится на сайте сразу после завершения группы.', '', 'results.html', NULL, TRUE)
) AS data(id, tournament_slug, slug, published_on, title, excerpt, body, link_path, image_url, is_published)
JOIN tournaments tournament ON tournament.slug = data.tournament_slug
ON CONFLICT (id) DO UPDATE
SET
  tournament_id = EXCLUDED.tournament_id,
  slug = EXCLUDED.slug,
  published_on = EXCLUDED.published_on,
  title = EXCLUDED.title,
  excerpt = EXCLUDED.excerpt,
  body = EXCLUDED.body,
  link_path = EXCLUDED.link_path,
  image_url = EXCLUDED.image_url,
  is_published = EXCLUDED.is_published;

INSERT INTO partner_categories (slug, name)
VALUES
  ('general', 'Партнёры'),
  ('media', 'Информационные партнёры')
ON CONFLICT (slug) DO UPDATE
SET
  name = EXCLUDED.name;

INSERT INTO partners (slug, name, description)
VALUES
  ('b-sight', 'Система спортивной аналитики B-SIGHT', 'Основной партнёр турнира. Логотип можно будет загружать и хранить с историей версий.'),
  ('rossiyskaya-promyshlennaya-kollegiya', 'АО «Российская промышленная коллегия»', ''),
  ('baz', 'БАЗ', ''),
  ('medialiga', 'Медиалига', ''),
  ('vtb-strana', 'БФ «ВТБ Страна»', ''),
  ('bank-vtb', 'Банк ВТБ', ''),
  ('izhora-stal-invest', 'Ижора Сталь Инвест', ''),
  ('spring-center', 'ООО Фирма «Спринг-Центр»', ''),
  ('novye-tekhnologii-materialy', 'ООО «Новые технологии и материалы»', ''),
  ('saturn', 'ПАО Сатурн', ''),
  ('bank-psb', 'Банк ПСБ', ''),
  ('tekhprom', 'ТехПром', ''),
  ('tass', 'ТАСС', ''),
  ('sport-express', 'Спорт-Экспресс', ''),
  ('rfs', 'РФС', ''),
  ('fontanka', 'Фонтанка.ру', ''),
  ('sport-den-za-dnem', 'Спорт День за Днем', ''),
  ('komsomolskaya-pravda', 'Комсомольская правда', ''),
  ('radio-zenit', 'Радио «Зенит»', ''),
  ('football-peterburga', 'Футбол Петербурга', ''),
  ('spb-vedomosti', 'Санкт-Петербургские ведомости', ''),
  ('tv-spb', 'Телеканал «Санкт-Петербург»', '')
ON CONFLICT (slug) DO UPDATE
SET
  name = EXCLUDED.name,
  description = EXCLUDED.description;

INSERT INTO tournament_partners (
  tournament_id,
  partner_id,
  category_id,
  sort_order,
  is_visible
)
SELECT
  tournament.id,
  partner.id,
  category.id,
  data.sort_order,
  TRUE
FROM (
  VALUES
    ('burchalkin-cup-2026', 'b-sight', 'general', 1),
    ('burchalkin-cup-2026', 'rossiyskaya-promyshlennaya-kollegiya', 'general', 2),
    ('burchalkin-cup-2026', 'baz', 'general', 3),
    ('burchalkin-cup-2026', 'medialiga', 'general', 4),
    ('burchalkin-cup-2026', 'vtb-strana', 'general', 5),
    ('burchalkin-cup-2026', 'bank-vtb', 'general', 6),
    ('burchalkin-cup-2026', 'izhora-stal-invest', 'general', 7),
    ('burchalkin-cup-2026', 'spring-center', 'general', 8),
    ('burchalkin-cup-2026', 'novye-tekhnologii-materialy', 'general', 9),
    ('burchalkin-cup-2026', 'saturn', 'general', 10),
    ('burchalkin-cup-2026', 'bank-psb', 'general', 11),
    ('burchalkin-cup-2026', 'tekhprom', 'general', 12),
    ('burchalkin-cup-2026', 'tass', 'media', 1),
    ('burchalkin-cup-2026', 'sport-express', 'media', 2),
    ('burchalkin-cup-2026', 'rfs', 'media', 3),
    ('burchalkin-cup-2026', 'fontanka', 'media', 4),
    ('burchalkin-cup-2026', 'sport-den-za-dnem', 'media', 5),
    ('burchalkin-cup-2026', 'komsomolskaya-pravda', 'media', 6),
    ('burchalkin-cup-2026', 'radio-zenit', 'media', 7),
    ('burchalkin-cup-2026', 'football-peterburga', 'media', 8),
    ('burchalkin-cup-2026', 'spb-vedomosti', 'media', 9),
    ('burchalkin-cup-2026', 'tv-spb', 'media', 10)
) AS data(tournament_slug, partner_slug, category_slug, sort_order)
JOIN tournaments tournament ON tournament.slug = data.tournament_slug
JOIN partners partner ON partner.slug = data.partner_slug
JOIN partner_categories category ON category.slug = data.category_slug
ON CONFLICT (tournament_id, partner_id, category_id) DO UPDATE
SET
  sort_order = EXCLUDED.sort_order,
  is_visible = EXCLUDED.is_visible;

COMMIT;
