BEGIN;

ALTER TABLE matches
  ADD COLUMN IF NOT EXISTS review_video_url TEXT,
  ADD COLUMN IF NOT EXISTS interview_video_url TEXT;

INSERT INTO schema_migrations (version, name)
VALUES ('0006', 'add_match_media_links')
ON CONFLICT (version) DO NOTHING;

COMMIT;
