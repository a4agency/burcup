BEGIN;

ALTER TABLE matches
  ADD COLUMN IF NOT EXISTS is_featured_media BOOLEAN NOT NULL DEFAULT FALSE;

INSERT INTO schema_migrations (version, name)
VALUES ('0008', 'add_match_featured_media_flag')
ON CONFLICT (version) DO NOTHING;

COMMIT;
