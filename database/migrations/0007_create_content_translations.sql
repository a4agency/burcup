BEGIN;

CREATE TABLE IF NOT EXISTS content_translations (
  id BIGSERIAL PRIMARY KEY,
  source_lang TEXT NOT NULL,
  target_lang TEXT NOT NULL,
  source_text TEXT NOT NULL,
  translated_text TEXT NOT NULL,
  provider TEXT NOT NULL DEFAULT 'google-gtx',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (source_lang, target_lang, source_text)
);

INSERT INTO schema_migrations (version, name)
VALUES ('0007', 'create_content_translations')
ON CONFLICT (version) DO NOTHING;

COMMIT;
