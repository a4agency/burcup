-- MySQL 8+ compatibility snapshot of the current schema.
-- Recommended path for a new MySQL environment:
-- 1. create a database with utf8mb4 charset/collation
-- 2. apply this file
-- 3. import seed data with a dedicated MySQL seed/migration script

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

CREATE TABLE IF NOT EXISTS schema_migrations (
  version VARCHAR(32) NOT NULL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  applied_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS tournaments (
  id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  slug VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  season_year INT NULL,
  short_label VARCHAR(255) NULL,
  logo_path TEXT NULL,
  hero_image_url TEXT NULL,
  description TEXT NOT NULL,
  start_date DATE NULL,
  end_date DATE NULL,
  location VARCHAR(255) NULL,
  status ENUM('draft', 'upcoming', 'active', 'completed', 'archived') NOT NULL DEFAULT 'draft',
  is_featured TINYINT(1) NOT NULL DEFAULT 0,
  countdown_enabled TINYINT(1) NOT NULL DEFAULT 1,
  standings_mode ENUM('auto', 'manual') NOT NULL DEFAULT 'auto',
  playoff_mode ENUM('auto', 'manual') NOT NULL DEFAULT 'auto',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_tournaments_slug (slug),
  KEY idx_tournaments_year (season_year),
  KEY idx_tournaments_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS clubs (
  id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  slug VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  short_name VARCHAR(255) NULL,
  logo_path TEXT NOT NULL,
  country VARCHAR(255) NULL,
  city VARCHAR(255) NULL,
  founded_year INT NULL,
  website_url TEXT NULL,
  hero_image_url TEXT NULL,
  description TEXT NOT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_clubs_slug (slug),
  UNIQUE KEY uq_clubs_name (name),
  KEY idx_clubs_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS tournament_clubs (
  id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  tournament_id BIGINT NOT NULL,
  club_id BIGINT NOT NULL,
  group_name VARCHAR(255) NULL,
  seeded_order INT NULL,
  notes TEXT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_tournament_clubs (tournament_id, club_id),
  KEY idx_tournament_clubs_tournament (tournament_id, group_name, seeded_order),
  CONSTRAINT fk_tournament_clubs_tournament
    FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE CASCADE,
  CONSTRAINT fk_tournament_clubs_club
    FOREIGN KEY (club_id) REFERENCES clubs(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS tournament_standings (
  id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  tournament_id BIGINT NOT NULL,
  club_id BIGINT NOT NULL,
  group_name VARCHAR(255) NOT NULL DEFAULT 'overall',
  position INT NOT NULL,
  played INT NOT NULL DEFAULT 0,
  won INT NOT NULL DEFAULT 0,
  drawn INT NOT NULL DEFAULT 0,
  lost INT NOT NULL DEFAULT 0,
  goals_for INT NOT NULL DEFAULT 0,
  goals_against INT NOT NULL DEFAULT 0,
  goal_diff INT GENERATED ALWAYS AS (goals_for - goals_against) STORED,
  points INT NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_tournament_standings_club_group (tournament_id, club_id, group_name),
  UNIQUE KEY uq_tournament_standings_position (tournament_id, group_name, position),
  KEY idx_tournament_standings_group (tournament_id, group_name, position),
  CONSTRAINT fk_tournament_standings_tournament
    FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE CASCADE,
  CONSTRAINT fk_tournament_standings_club
    FOREIGN KEY (club_id) REFERENCES clubs(id) ON DELETE CASCADE,
  CONSTRAINT chk_tournament_standings_position CHECK (position > 0),
  CONSTRAINT chk_tournament_standings_played CHECK (played >= 0),
  CONSTRAINT chk_tournament_standings_won CHECK (won >= 0),
  CONSTRAINT chk_tournament_standings_drawn CHECK (drawn >= 0),
  CONSTRAINT chk_tournament_standings_lost CHECK (lost >= 0),
  CONSTRAINT chk_tournament_standings_goals_for CHECK (goals_for >= 0),
  CONSTRAINT chk_tournament_standings_goals_against CHECK (goals_against >= 0),
  CONSTRAINT chk_tournament_standings_points CHECK (points >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS matches (
  id BIGINT NOT NULL PRIMARY KEY,
  tournament_id BIGINT NOT NULL,
  stage_name VARCHAR(255) NULL,
  round_name VARCHAR(255) NULL,
  matchday_label VARCHAR(255) NULL,
  match_date DATE NULL,
  match_time TIME NULL,
  status ENUM('soon', 'live', 'done', 'postponed', 'cancelled') NOT NULL DEFAULT 'soon',
  status_label VARCHAR(255) NOT NULL,
  home_club_id BIGINT NOT NULL,
  away_club_id BIGINT NOT NULL,
  home_score INT NOT NULL DEFAULT 0,
  away_score INT NOT NULL DEFAULT 0,
  venue VARCHAR(255) NULL,
  video_url TEXT NULL,
  review_video_url TEXT NULL,
  interview_video_url TEXT NULL,
  is_featured_media TINYINT(1) NOT NULL DEFAULT 0,
  summary TEXT NOT NULL,
  attendance INT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_matches_tournament_date (tournament_id, match_date, match_time, sort_order),
  KEY idx_matches_home_club (home_club_id, match_date, match_time),
  KEY idx_matches_away_club (away_club_id, match_date, match_time),
  CONSTRAINT fk_matches_tournament
    FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE CASCADE,
  CONSTRAINT fk_matches_home_club
    FOREIGN KEY (home_club_id) REFERENCES clubs(id) ON DELETE RESTRICT,
  CONSTRAINT fk_matches_away_club
    FOREIGN KEY (away_club_id) REFERENCES clubs(id) ON DELETE RESTRICT,
  CONSTRAINT chk_matches_home_score CHECK (home_score >= 0),
  CONSTRAINT chk_matches_away_score CHECK (away_score >= 0),
  CONSTRAINT chk_matches_distinct_clubs CHECK (home_club_id <> away_club_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS match_events (
  id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  match_id BIGINT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  minute_label VARCHAR(64) NULL,
  event_type VARCHAR(64) NOT NULL DEFAULT 'note',
  title VARCHAR(255) NULL,
  description TEXT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_match_events_order (match_id, sort_order),
  KEY idx_match_events_match_id (match_id, sort_order),
  CONSTRAINT fk_match_events_match
    FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS news_articles (
  id BIGINT NOT NULL PRIMARY KEY,
  tournament_id BIGINT NULL,
  slug VARCHAR(255) NOT NULL,
  published_on DATE NULL,
  title TEXT NOT NULL,
  excerpt MEDIUMTEXT NOT NULL,
  body LONGTEXT NOT NULL,
  body_html LONGTEXT NOT NULL,
  link_path VARCHAR(1024) NOT NULL,
  image_url TEXT NULL,
  video_url TEXT NULL,
  is_published TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_news_articles_slug (slug),
  KEY idx_news_articles_tournament (tournament_id, published_on),
  CONSTRAINT fk_news_articles_tournament
    FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS news_article_photos (
  id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  news_article_id BIGINT NOT NULL,
  image_url TEXT NOT NULL,
  alt_text TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_news_article_photos_article (news_article_id, sort_order, id),
  CONSTRAINT fk_news_article_photos_article
    FOREIGN KEY (news_article_id) REFERENCES news_articles(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS media_albums (
  id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  tournament_id BIGINT NULL,
  slug VARCHAR(255) NOT NULL,
  title VARCHAR(255) NOT NULL,
  card_excerpt TEXT NOT NULL,
  description LONGTEXT NOT NULL,
  badge VARCHAR(255) NOT NULL DEFAULT 'Фотоальбом',
  cover_image_url TEXT NULL,
  cover_alt_text TEXT NOT NULL,
  published_on DATE NULL,
  sort_order INT NOT NULL DEFAULT 0,
  is_visible TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_media_albums_slug (slug),
  KEY idx_media_albums_tournament (tournament_id, sort_order, published_on),
  CONSTRAINT fk_media_albums_tournament
    FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS media_album_photos (
  id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  album_id BIGINT NOT NULL,
  image_url TEXT NOT NULL,
  alt_text TEXT NOT NULL,
  caption TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_media_album_photos_album (album_id, sort_order, id),
  CONSTRAINT fk_media_album_photos_album
    FOREIGN KEY (album_id) REFERENCES media_albums(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS tournament_playoff_matches (
  id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  tournament_id BIGINT NOT NULL,
  bracket_group ENUM('top', 'placement') NOT NULL,
  round_group ENUM('semifinal', 'final') NOT NULL,
  match_key VARCHAR(255) NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  label VARCHAR(255) NOT NULL,
  home_club_id BIGINT NULL,
  away_club_id BIGINT NULL,
  home_label VARCHAR(255) NOT NULL,
  away_label VARCHAR(255) NOT NULL,
  home_logo_path TEXT NULL,
  away_logo_path TEXT NULL,
  home_score INT NOT NULL DEFAULT 0,
  away_score INT NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_tournament_playoff_match_key (tournament_id, match_key),
  KEY idx_tournament_playoff_matches_order (tournament_id, bracket_group, round_group, sort_order, id),
  CONSTRAINT fk_tournament_playoff_matches_tournament
    FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE CASCADE,
  CONSTRAINT fk_tournament_playoff_matches_home_club
    FOREIGN KEY (home_club_id) REFERENCES clubs(id) ON DELETE SET NULL,
  CONSTRAINT fk_tournament_playoff_matches_away_club
    FOREIGN KEY (away_club_id) REFERENCES clubs(id) ON DELETE SET NULL,
  CONSTRAINT chk_tournament_playoff_home_score CHECK (home_score >= 0),
  CONSTRAINT chk_tournament_playoff_away_score CHECK (away_score >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS partner_categories (
  id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  slug VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_partner_categories_slug (slug),
  UNIQUE KEY uq_partner_categories_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS partners (
  id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  slug VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  website_url TEXT NULL,
  description TEXT NOT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_partners_slug (slug),
  UNIQUE KEY uq_partners_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS partner_logo_assets (
  id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  partner_id BIGINT NOT NULL,
  image_url TEXT NOT NULL,
  alt_text TEXT NOT NULL,
  storage_provider VARCHAR(64) NULL,
  public_id VARCHAR(255) NULL,
  file_name VARCHAR(255) NULL,
  mime_type VARCHAR(128) NULL,
  asset_format VARCHAR(64) NULL,
  width INT NULL,
  height INT NULL,
  bytes INT NULL,
  uploaded_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  is_current TINYINT(1) NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_partner_logo_assets_partner (partner_id, uploaded_at),
  CONSTRAINT fk_partner_logo_assets_partner
    FOREIGN KEY (partner_id) REFERENCES partners(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS tournament_partners (
  id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  tournament_id BIGINT NULL,
  partner_id BIGINT NOT NULL,
  category_id BIGINT NULL,
  logo_asset_id BIGINT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  is_visible TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_tournament_partners_unique (tournament_id, partner_id, category_id),
  CONSTRAINT fk_tournament_partners_tournament
    FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE CASCADE,
  CONSTRAINT fk_tournament_partners_partner
    FOREIGN KEY (partner_id) REFERENCES partners(id) ON DELETE CASCADE,
  CONSTRAINT fk_tournament_partners_category
    FOREIGN KEY (category_id) REFERENCES partner_categories(id) ON DELETE SET NULL,
  CONSTRAINT fk_tournament_partners_logo_asset
    FOREIGN KEY (logo_asset_id) REFERENCES partner_logo_assets(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS content_translations (
  id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  source_lang VARCHAR(16) NOT NULL,
  target_lang VARCHAR(16) NOT NULL,
  source_text MEDIUMTEXT NOT NULL,
  translated_text MEDIUMTEXT NOT NULL,
  provider VARCHAR(64) NOT NULL DEFAULT 'google-gtx',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_content_translations_source (source_lang, target_lang, source_text(255))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS site_pages (
  id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  slug VARCHAR(255) NOT NULL,
  title VARCHAR(255) NOT NULL,
  subtitle TEXT NOT NULL,
  body_html LONGTEXT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_site_pages_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO schema_migrations (version, name)
VALUES
  ('0001', 'create_core_entities'),
  ('0002', 'create_matches_and_news'),
  ('0003', 'create_partner_entities'),
  ('0004', 'add_partner_logo_asset_metadata'),
  ('0005', 'add_tournament_countdown_flag'),
  ('0006', 'add_match_media_links'),
  ('0007', 'create_content_translations'),
  ('0008', 'add_match_featured_media_flag'),
  ('0009', 'create_media_albums'),
  ('0010', 'add_manual_standings_and_playoff'),
  ('0011', 'create_site_pages'),
  ('0012', 'create_news_article_photos');

SET FOREIGN_KEY_CHECKS = 1;
