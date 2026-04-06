BEGIN;

ALTER TABLE partner_logo_assets
  ADD COLUMN IF NOT EXISTS public_id TEXT,
  ADD COLUMN IF NOT EXISTS file_name TEXT,
  ADD COLUMN IF NOT EXISTS mime_type TEXT,
  ADD COLUMN IF NOT EXISTS asset_format TEXT,
  ADD COLUMN IF NOT EXISTS width INTEGER,
  ADD COLUMN IF NOT EXISTS height INTEGER,
  ADD COLUMN IF NOT EXISTS bytes INTEGER;

INSERT INTO schema_migrations (version, name)
VALUES ('0004', 'add_partner_logo_asset_metadata')
ON CONFLICT (version) DO NOTHING;

COMMIT;
