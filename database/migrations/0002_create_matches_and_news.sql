BEGIN;

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

CREATE INDEX IF NOT EXISTS idx_matches_tournament_date ON matches(tournament_id, match_date, match_time, sort_order);
CREATE INDEX IF NOT EXISTS idx_matches_home_club ON matches(home_club_id, match_date, match_time);
CREATE INDEX IF NOT EXISTS idx_matches_away_club ON matches(away_club_id, match_date, match_time);
CREATE INDEX IF NOT EXISTS idx_match_events_match_id ON match_events(match_id, sort_order);
CREATE UNIQUE INDEX IF NOT EXISTS idx_match_events_unique_order ON match_events(match_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_news_articles_tournament ON news_articles(tournament_id, published_on DESC);

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

INSERT INTO schema_migrations (version, name)
VALUES ('0002', 'create_matches_and_news')
ON CONFLICT (version) DO NOTHING;

COMMIT;
