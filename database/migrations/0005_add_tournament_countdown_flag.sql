BEGIN;

ALTER TABLE tournaments
  ADD COLUMN IF NOT EXISTS countdown_enabled BOOLEAN NOT NULL DEFAULT TRUE;

UPDATE tournaments
SET countdown_enabled = FALSE
WHERE is_featured = FALSE;

INSERT INTO schema_migrations (version, name)
VALUES ('0005', 'add_tournament_countdown_flag')
ON CONFLICT (version) DO NOTHING;

COMMIT;
