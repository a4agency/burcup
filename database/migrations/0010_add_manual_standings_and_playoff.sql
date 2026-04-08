BEGIN;

ALTER TABLE tournaments
  ADD COLUMN IF NOT EXISTS standings_mode TEXT NOT NULL DEFAULT 'auto',
  ADD COLUMN IF NOT EXISTS playoff_mode TEXT NOT NULL DEFAULT 'auto';

ALTER TABLE tournaments
  DROP CONSTRAINT IF EXISTS tournaments_standings_mode_check;

ALTER TABLE tournaments
  ADD CONSTRAINT tournaments_standings_mode_check
  CHECK (standings_mode IN ('auto', 'manual'));

ALTER TABLE tournaments
  DROP CONSTRAINT IF EXISTS tournaments_playoff_mode_check;

ALTER TABLE tournaments
  ADD CONSTRAINT tournaments_playoff_mode_check
  CHECK (playoff_mode IN ('auto', 'manual'));

CREATE TABLE IF NOT EXISTS tournament_playoff_matches (
  id BIGSERIAL PRIMARY KEY,
  tournament_id BIGINT NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  bracket_group TEXT NOT NULL CHECK (bracket_group IN ('top', 'placement')),
  round_group TEXT NOT NULL CHECK (round_group IN ('semifinal', 'final')),
  match_key TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  label TEXT NOT NULL DEFAULT '',
  home_club_id BIGINT REFERENCES clubs(id) ON DELETE SET NULL,
  away_club_id BIGINT REFERENCES clubs(id) ON DELETE SET NULL,
  home_label TEXT NOT NULL DEFAULT '',
  away_label TEXT NOT NULL DEFAULT '',
  home_logo_path TEXT,
  away_logo_path TEXT,
  home_score INTEGER NOT NULL DEFAULT 0 CHECK (home_score >= 0),
  away_score INTEGER NOT NULL DEFAULT 0 CHECK (away_score >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (tournament_id, match_key)
);

CREATE INDEX IF NOT EXISTS idx_tournament_playoff_matches_order
  ON tournament_playoff_matches(tournament_id, bracket_group, round_group, sort_order, id);

DROP TRIGGER IF EXISTS tournament_playoff_matches_set_updated_at ON tournament_playoff_matches;

CREATE TRIGGER tournament_playoff_matches_set_updated_at
BEFORE UPDATE ON tournament_playoff_matches
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

INSERT INTO schema_migrations (version, name)
VALUES ('0010', 'add_manual_standings_and_playoff')
ON CONFLICT (version) DO NOTHING;

COMMIT;
