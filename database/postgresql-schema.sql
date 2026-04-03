BEGIN;

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TABLE IF NOT EXISTS teams (
  id BIGSERIAL PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL UNIQUE,
  logo_path TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS standings (
  id BIGSERIAL PRIMARY KEY,
  team_id BIGINT NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  group_name TEXT NOT NULL DEFAULT 'overall',
  position INTEGER NOT NULL CHECK (position > 0),
  played INTEGER NOT NULL DEFAULT 0 CHECK (played >= 0),
  goals_for INTEGER NOT NULL DEFAULT 0 CHECK (goals_for >= 0),
  goals_against INTEGER NOT NULL DEFAULT 0 CHECK (goals_against >= 0),
  goal_diff INTEGER GENERATED ALWAYS AS (goals_for - goals_against) STORED,
  points INTEGER NOT NULL DEFAULT 0 CHECK (points >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (team_id, group_name),
  UNIQUE (group_name, position)
);

CREATE TABLE IF NOT EXISTS matches (
  id BIGINT PRIMARY KEY,
  stage_name TEXT,
  match_date DATE,
  match_time TIME,
  status TEXT NOT NULL DEFAULT 'soon' CHECK (status IN ('soon', 'live', 'done')),
  status_label TEXT NOT NULL,
  home_team_id BIGINT NOT NULL REFERENCES teams(id) ON DELETE RESTRICT,
  away_team_id BIGINT NOT NULL REFERENCES teams(id) ON DELETE RESTRICT,
  home_score INTEGER NOT NULL DEFAULT 0 CHECK (home_score >= 0),
  away_score INTEGER NOT NULL DEFAULT 0 CHECK (away_score >= 0),
  venue TEXT,
  video_url TEXT,
  summary TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (home_team_id <> away_team_id)
);

CREATE TABLE IF NOT EXISTS match_events (
  id BIGSERIAL PRIMARY KEY,
  match_id BIGINT NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  description TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS news_articles (
  id BIGINT PRIMARY KEY,
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

CREATE TABLE IF NOT EXISTS results (
  id BIGSERIAL PRIMARY KEY,
  stage_name TEXT NOT NULL,
  match_label TEXT NOT NULL,
  home_team_id BIGINT REFERENCES teams(id) ON DELETE SET NULL,
  away_team_id BIGINT REFERENCES teams(id) ON DELETE SET NULL,
  home_score INTEGER NOT NULL CHECK (home_score >= 0),
  away_score INTEGER NOT NULL CHECK (away_score >= 0),
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_teams_name ON teams(name);
CREATE INDEX IF NOT EXISTS idx_standings_group_position ON standings(group_name, position);
CREATE INDEX IF NOT EXISTS idx_matches_date_time ON matches(match_date, match_time);
CREATE INDEX IF NOT EXISTS idx_matches_stage ON matches(stage_name);
CREATE INDEX IF NOT EXISTS idx_match_events_match_id ON match_events(match_id, sort_order);
CREATE UNIQUE INDEX IF NOT EXISTS idx_match_events_unique_order ON match_events(match_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_news_articles_published_on ON news_articles(published_on DESC);
CREATE INDEX IF NOT EXISTS idx_results_stage_order ON results(stage_name, display_order);
CREATE UNIQUE INDEX IF NOT EXISTS idx_results_unique_match ON results(stage_name, match_label);

DROP TRIGGER IF EXISTS teams_set_updated_at ON teams;
CREATE TRIGGER teams_set_updated_at
BEFORE UPDATE ON teams
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS standings_set_updated_at ON standings;
CREATE TRIGGER standings_set_updated_at
BEFORE UPDATE ON standings
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

COMMIT;
