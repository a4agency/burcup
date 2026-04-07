-- Compatibility snapshot of the current schema.
-- Recommended path for new environments:
-- 1. apply database/migrations/apply-all.psql.sql
-- 2. apply database/postgresql-seed.sql if starter content is needed

BEGIN;

CREATE TABLE IF NOT EXISTS schema_migrations (
  version TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TABLE IF NOT EXISTS tournaments (
  id BIGSERIAL PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  season_year INTEGER,
  short_label TEXT,
  logo_path TEXT,
  hero_image_url TEXT,
  description TEXT NOT NULL DEFAULT '',
  start_date DATE,
  end_date DATE,
  location TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'upcoming', 'active', 'completed', 'archived')),
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  countdown_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS clubs (
  id BIGSERIAL PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL UNIQUE,
  short_name TEXT,
  logo_path TEXT NOT NULL,
  country TEXT,
  city TEXT,
  founded_year INTEGER,
  website_url TEXT,
  hero_image_url TEXT,
  description TEXT NOT NULL DEFAULT '',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tournament_clubs (
  id BIGSERIAL PRIMARY KEY,
  tournament_id BIGINT NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  club_id BIGINT NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  group_name TEXT,
  seeded_order INTEGER,
  notes TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (tournament_id, club_id)
);

CREATE TABLE IF NOT EXISTS tournament_standings (
  id BIGSERIAL PRIMARY KEY,
  tournament_id BIGINT NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  club_id BIGINT NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  group_name TEXT NOT NULL DEFAULT 'overall',
  position INTEGER NOT NULL CHECK (position > 0),
  played INTEGER NOT NULL DEFAULT 0 CHECK (played >= 0),
  won INTEGER NOT NULL DEFAULT 0 CHECK (won >= 0),
  drawn INTEGER NOT NULL DEFAULT 0 CHECK (drawn >= 0),
  lost INTEGER NOT NULL DEFAULT 0 CHECK (lost >= 0),
  goals_for INTEGER NOT NULL DEFAULT 0 CHECK (goals_for >= 0),
  goals_against INTEGER NOT NULL DEFAULT 0 CHECK (goals_against >= 0),
  goal_diff INTEGER GENERATED ALWAYS AS (goals_for - goals_against) STORED,
  points INTEGER NOT NULL DEFAULT 0 CHECK (points >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (tournament_id, club_id, group_name),
  UNIQUE (tournament_id, group_name, position)
);

CREATE TABLE IF NOT EXISTS matches (
  id BIGINT PRIMARY KEY,
  tournament_id BIGINT NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  stage_name TEXT,
  round_name TEXT,
  matchday_label TEXT,
  match_date DATE,
  match_time TIME,
  status TEXT NOT NULL DEFAULT 'soon' CHECK (status IN ('soon', 'live', 'done', 'postponed', 'cancelled')),
  status_label TEXT NOT NULL,
  home_club_id BIGINT NOT NULL REFERENCES clubs(id) ON DELETE RESTRICT,
  away_club_id BIGINT NOT NULL REFERENCES clubs(id) ON DELETE RESTRICT,
  home_score INTEGER NOT NULL DEFAULT 0 CHECK (home_score >= 0),
  away_score INTEGER NOT NULL DEFAULT 0 CHECK (away_score >= 0),
  venue TEXT,
  video_url TEXT,
  summary TEXT NOT NULL DEFAULT '',
  attendance INTEGER,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (home_club_id <> away_club_id)
);

CREATE TABLE IF NOT EXISTS match_events (
  id BIGSERIAL PRIMARY KEY,
  match_id BIGINT NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  minute_label TEXT,
  event_type TEXT NOT NULL DEFAULT 'note',
  title TEXT,
  description TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS news_articles (
  id BIGINT PRIMARY KEY,
  tournament_id BIGINT REFERENCES tournaments(id) ON DELETE SET NULL,
  slug TEXT NOT NULL UNIQUE,
  published_on DATE,
  title TEXT NOT NULL,
  excerpt TEXT NOT NULL,
  body TEXT NOT NULL DEFAULT '',
  link_path TEXT NOT NULL,
  image_url TEXT,
  is_published BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS partner_categories (
  id BIGSERIAL PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS partners (
  id BIGSERIAL PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL UNIQUE,
  website_url TEXT,
  description TEXT NOT NULL DEFAULT '',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS partner_logo_assets (
  id BIGSERIAL PRIMARY KEY,
  partner_id BIGINT NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  alt_text TEXT NOT NULL DEFAULT '',
  storage_provider TEXT,
  public_id TEXT,
  file_name TEXT,
  mime_type TEXT,
  asset_format TEXT,
  width INTEGER,
  height INTEGER,
  bytes INTEGER,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_current BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tournament_partners (
  id BIGSERIAL PRIMARY KEY,
  tournament_id BIGINT REFERENCES tournaments(id) ON DELETE CASCADE,
  partner_id BIGINT NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
  category_id BIGINT REFERENCES partner_categories(id) ON DELETE SET NULL,
  logo_asset_id BIGINT REFERENCES partner_logo_assets(id) ON DELETE SET NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_visible BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (tournament_id, partner_id, category_id)
);

CREATE INDEX IF NOT EXISTS idx_tournaments_year ON tournaments(season_year);
CREATE INDEX IF NOT EXISTS idx_tournaments_status ON tournaments(status);
CREATE INDEX IF NOT EXISTS idx_clubs_name ON clubs(name);
CREATE INDEX IF NOT EXISTS idx_tournament_clubs_tournament ON tournament_clubs(tournament_id, group_name, seeded_order);
CREATE INDEX IF NOT EXISTS idx_tournament_standings_group ON tournament_standings(tournament_id, group_name, position);
CREATE INDEX IF NOT EXISTS idx_matches_tournament_date ON matches(tournament_id, match_date, match_time, sort_order);
CREATE INDEX IF NOT EXISTS idx_matches_home_club ON matches(home_club_id, match_date, match_time);
CREATE INDEX IF NOT EXISTS idx_matches_away_club ON matches(away_club_id, match_date, match_time);
CREATE INDEX IF NOT EXISTS idx_match_events_match_id ON match_events(match_id, sort_order);
CREATE UNIQUE INDEX IF NOT EXISTS idx_match_events_unique_order ON match_events(match_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_news_articles_tournament ON news_articles(tournament_id, published_on DESC);
CREATE INDEX IF NOT EXISTS idx_partner_logo_assets_partner ON partner_logo_assets(partner_id, uploaded_at DESC);
CREATE UNIQUE INDEX IF NOT EXISTS idx_tournament_partners_unique ON tournament_partners(tournament_id, partner_id, category_id);

DROP TRIGGER IF EXISTS tournaments_set_updated_at ON tournaments;
CREATE TRIGGER tournaments_set_updated_at
BEFORE UPDATE ON tournaments
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS clubs_set_updated_at ON clubs;
CREATE TRIGGER clubs_set_updated_at
BEFORE UPDATE ON clubs
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS tournament_standings_set_updated_at ON tournament_standings;
CREATE TRIGGER tournament_standings_set_updated_at
BEFORE UPDATE ON tournament_standings
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS matches_set_updated_at ON matches;
CREATE TRIGGER matches_set_updated_at
BEFORE UPDATE ON matches
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS news_articles_set_updated_at ON news_articles;
CREATE TRIGGER news_articles_set_updated_at
BEFORE UPDATE ON news_articles
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS partners_set_updated_at ON partners;
CREATE TRIGGER partners_set_updated_at
BEFORE UPDATE ON partners
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

INSERT INTO schema_migrations (version, name)
VALUES
  ('0001', 'create_core_entities'),
  ('0002', 'create_matches_and_news'),
  ('0003', 'create_partner_entities'),
  ('0004', 'add_partner_logo_asset_metadata'),
  ('0005', 'add_tournament_countdown_flag')
ON CONFLICT (version) DO NOTHING;

COMMIT;
