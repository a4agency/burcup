BEGIN;

INSERT INTO teams (slug, name, logo_path)
VALUES
  ('almaz-antey', 'Алмаз-Антей', 'images/team-almaz-antey.png'),
  ('zenit', 'Зенит', 'images/team-zenit.png'),
  ('palmeiras', 'Палмейрас', 'images/team-palmeiras.png'),
  ('kairat', 'Кайрат', 'images/team-kairat.png'),
  ('crvena-zvezda', 'Црвена Звезда', 'images/team-crvena-zvezda.png'),
  ('fenerbahce', 'Фенербахче', 'images/team-fenerbahce.png'),
  ('san-lorenzo', 'Сан-Лоренсо', 'images/team-san-lorenzo.png'),
  ('dinamo-minsk', 'Динамо-Минск', 'images/team-dinamo-minsk.png')
ON CONFLICT (slug) DO UPDATE
SET
  name = EXCLUDED.name,
  logo_path = EXCLUDED.logo_path;

INSERT INTO standings (
  team_id,
  group_name,
  position,
  played,
  goals_for,
  goals_against,
  points
)
SELECT t.id, v.group_name, v.position, v.played, v.goals_for, v.goals_against, v.points
FROM (
  VALUES
    ('Алмаз-Антей', 'overall', 1, 3, 16, 3, 7),
    ('Зенит', 'overall', 2, 3, 5, 4, 6),
    ('Палмейрас', 'overall', 3, 3, 4, 3, 5),
    ('Кайрат', 'overall', 4, 3, 4, 4, 4),
    ('Црвена Звезда', 'overall', 5, 3, 3, 3, 4),
    ('Фенербахче', 'overall', 6, 3, 3, 5, 3),
    ('Сан-Лоренсо', 'overall', 7, 3, 2, 5, 1),
    ('Динамо-Минск', 'overall', 8, 3, 1, 6, 1)
) AS v(team_name, group_name, position, played, goals_for, goals_against, points)
JOIN teams t ON t.name = v.team_name
ON CONFLICT (team_id, group_name) DO UPDATE
SET
  position = EXCLUDED.position,
  played = EXCLUDED.played,
  goals_for = EXCLUDED.goals_for,
  goals_against = EXCLUDED.goals_against,
  points = EXCLUDED.points;

INSERT INTO matches (
  id,
  stage_name,
  match_date,
  match_time,
  status,
  status_label,
  home_team_id,
  away_team_id,
  home_score,
  away_score,
  venue,
  video_url,
  summary
)
SELECT
  v.id,
  v.stage_name,
  v.match_date,
  v.match_time,
  v.status,
  v.status_label,
  home_team.id,
  away_team.id,
  v.home_score,
  v.away_score,
  v.venue,
  v.video_url,
  v.summary
FROM (
  VALUES
    (1::BIGINT, 'Группа A', NULL::DATE, '10:00'::TIME, 'done', 'Завершен', 'Алмаз-Антей', 'Црвена Звезда', 10, 3, 'Стадион «Алмаз-Антей»', 'https://vkvideo.ru/video_ext.php?oid=-120721420&id=456239434&hash=a4ca6ca1e82ce6c4&hd=4', 'Открывающий матч игрового дня. На этой странице можно показывать прямой эфир или запись игры.'),
    (2::BIGINT, 'Группа А', NULL::DATE, '12:00'::TIME, 'live', 'В эфире', 'Зенит', 'Кайрат', 4, 1, 'Главное поле', 'https://vkvideo.ru/video_ext.php?oid=-120721420&id=456239431&hash=90e82e3d00ac220b&hd=4', 'Матч идёт в прямом эфире'),
    (3::BIGINT, 'Группа B', NULL::DATE, '14:00'::TIME, 'soon', 'Скоро', 'Сан-Лоренсо', 'Фенербахче', 0, 0, 'Поле №2', 'https://vkvideo.ru/video_ext.php?oid=-120721420&id=456239505&hash=eabac0fc9cb32fa5&hd=4', 'Матч группового этапа. Перед началом можно показывать анонс, а после — запись встречи.'),
    (1773883313332::BIGINT, 'Группа B', DATE '2026-03-15', '10:00'::TIME, 'soon', 'Скоро', 'Динамо-Минск', 'Палмейрас', 0, 0, NULL, 'https://vkvideo.ru/video_ext.php?oid=-120721420&id=456239433&hash=bea5fe2662c311f2&hd=4', ''),
    (1773883426669::BIGINT, 'Группа А', DATE '2026-03-15', '10:00'::TIME, 'soon', 'Скоро', 'Алмаз-Антей', 'Зенит', 0, 0, NULL, 'https://vkvideo.ru/video_ext.php?oid=-120721420&id=456239433&hash=bea5fe2662c311f2&hd=4', ''),
    (1773883471638::BIGINT, 'Группа B', DATE '2026-03-15', '10:00'::TIME, 'soon', 'Скоро', 'Кайрат', 'Фенербахче', 0, 0, NULL, 'https://vkvideo.ru/video_ext.php?oid=-120721420&id=456239433&hash=bea5fe2662c311f2&hd=4', '')
) AS v(id, stage_name, match_date, match_time, status, status_label, home_team_name, away_team_name, home_score, away_score, venue, video_url, summary)
JOIN teams home_team ON home_team.name = v.home_team_name
JOIN teams away_team ON away_team.name = v.away_team_name
ON CONFLICT (id) DO UPDATE
SET
  stage_name = EXCLUDED.stage_name,
  match_date = EXCLUDED.match_date,
  match_time = EXCLUDED.match_time,
  status = EXCLUDED.status,
  status_label = EXCLUDED.status_label,
  home_team_id = EXCLUDED.home_team_id,
  away_team_id = EXCLUDED.away_team_id,
  home_score = EXCLUDED.home_score,
  away_score = EXCLUDED.away_score,
  venue = EXCLUDED.venue,
  video_url = EXCLUDED.video_url,
  summary = EXCLUDED.summary;

INSERT INTO match_events (match_id, sort_order, description)
VALUES
  (1, 1, 'Открытие эфира — за 10 минут до матча'),
  (1, 2, '1 тайм — 10:00'),
  (1, 3, 'Перерыв'),
  (1, 4, '2 тайм — 10:35'),
  (2, 1, '14'' — 1:0'),
  (2, 2, '52'' — 2:0'),
  (2, 3, 'Финальный свисток'),
  (3, 1, 'Эфир стартует за 10 минут до игры')
ON CONFLICT (match_id, sort_order) DO UPDATE
SET
  description = EXCLUDED.description;

-- Current JSON stores news images as large data:image blobs.
-- It is better to upload those files to object storage and save the public URL here.
INSERT INTO news_articles (
  id,
  slug,
  published_on,
  title,
  excerpt,
  body,
  link_path,
  image_url,
  is_published
)
VALUES
  (1, 'applications-open', NULL, 'Стартовал приём заявок на Burchalkin Cup', 'Турнир соберёт международный состав команд и продолжит традицию детско-юношеского футбольного фестиваля.', '', 'news.html', NULL, TRUE),
  (2, 'first-day-schedule-published', NULL, 'Опубликовано расписание первого игрового дня', 'На сайте уже доступны первые пары, время матчей и блок трансляций для зрителей и родителей.', '', 'matches.html', NULL, TRUE),
  (3, 'playoff-bracket-coming-soon', NULL, 'Финальная сетка будет доступна после группового этапа', 'В плей-офф выйдут лучшие команды турнира, а сетка появится на сайте сразу после завершения группы.', '', 'results.html', NULL, TRUE)
ON CONFLICT (id) DO UPDATE
SET
  slug = EXCLUDED.slug,
  published_on = EXCLUDED.published_on,
  title = EXCLUDED.title,
  excerpt = EXCLUDED.excerpt,
  body = EXCLUDED.body,
  link_path = EXCLUDED.link_path,
  image_url = EXCLUDED.image_url,
  is_published = EXCLUDED.is_published;

INSERT INTO results (
  stage_name,
  match_label,
  home_team_id,
  away_team_id,
  home_score,
  away_score,
  display_order
)
SELECT
  v.stage_name,
  v.match_label,
  home_team.id,
  away_team.id,
  v.home_score,
  v.away_score,
  v.display_order
FROM (
  VALUES
    ('Группа A', 'Алмаз-Антей — Динамо-Минск', 'Алмаз-Антей', 'Динамо-Минск', 2, 1, 1),
    ('Группа B', 'Зенит — Кайрат', 'Зенит', 'Кайрат', 2, 0, 2),
    ('Группа B', 'Палмейрас — Сан-Лоренсо', 'Палмейрас', 'Сан-Лоренсо', 1, 0, 3)
) AS v(stage_name, match_label, home_team_name, away_team_name, home_score, away_score, display_order)
JOIN teams home_team ON home_team.name = v.home_team_name
JOIN teams away_team ON away_team.name = v.away_team_name
ON CONFLICT (stage_name, match_label) DO UPDATE
SET
  home_team_id = EXCLUDED.home_team_id,
  away_team_id = EXCLUDED.away_team_id,
  home_score = EXCLUDED.home_score,
  away_score = EXCLUDED.away_score,
  display_order = EXCLUDED.display_order;

COMMIT;
