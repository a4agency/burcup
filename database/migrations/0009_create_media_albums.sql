BEGIN;

CREATE TABLE IF NOT EXISTS media_albums (
  id BIGSERIAL PRIMARY KEY,
  tournament_id BIGINT REFERENCES tournaments(id) ON DELETE SET NULL,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  card_excerpt TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  badge TEXT NOT NULL DEFAULT 'Фотоальбом',
  cover_image_url TEXT,
  cover_alt_text TEXT NOT NULL DEFAULT '',
  published_on DATE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_visible BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS media_album_photos (
  id BIGSERIAL PRIMARY KEY,
  album_id BIGINT NOT NULL REFERENCES media_albums(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  alt_text TEXT NOT NULL DEFAULT '',
  caption TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_media_albums_tournament ON media_albums(tournament_id, sort_order, published_on DESC);
CREATE INDEX IF NOT EXISTS idx_media_album_photos_album ON media_album_photos(album_id, sort_order, id);

DROP TRIGGER IF EXISTS media_albums_set_updated_at ON media_albums;
CREATE TRIGGER media_albums_set_updated_at
BEFORE UPDATE ON media_albums
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

INSERT INTO schema_migrations (version, name)
VALUES ('0009', 'create_media_albums')
ON CONFLICT (version) DO NOTHING;

COMMIT;
