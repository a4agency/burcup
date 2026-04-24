# Database schemas for Burchalkin Cup

This folder now contains the MySQL data model for the site.

## Files

- `mysql-schema.sql` is the current bootstrap schema for MySQL 8+ / MariaDB 10.6+
- `migrations/` is kept as an archive of the old PostgreSQL migration history
- `postgresql-schema.sql` and `postgresql-seed.sql` are legacy snapshots kept only for reference

## Main entities

- `tournaments` — one tournament per year or named season
- `clubs` — persistent clubs with their own pages
- `tournament_clubs` — clubs participating in a tournament
- `tournament_standings` — standings inside a specific tournament
- `matches` — matches linked to both a tournament and clubs
- `match_events` — timeline/history for a single match
- `news_articles` — tournament news
- `partner_categories` — partner groups such as general and media
- `partners` — persistent partner directory
- `partner_logo_assets` — uploaded logo history for each partner
  including storage metadata such as public id, dimensions and file info
- `tournament_partners` — which partners are shown in which tournament

## Why this structure

It supports:

- yearly tournament cards
- an archive of tournaments
- club pages with a cross-tournament match history
- partner blocks with upload history for logos
- a future admin panel where data is not tied to one season only

## Suggested order for MySQL

1. Create a MySQL 8+ or MariaDB 10.6+ database with `utf8mb4`.
2. Run `mysql-schema.sql`.
3. Import data with a dedicated migration script or MySQL seed file.
4. Repoint the API to MySQL only after the imported data has been verified.

If you already have a live database, apply `mysql-add-media-photo-reports-flag.sql` so the admin toggle for "Фоторепортажи" is available.

Example migration command:

`MYSQL_URL=mysql://user:pass@host:3306/db APPLY_SCHEMA=1 node archive/legacy-tools/scripts/migrate-to-mysql.mjs`

Optional source settings:

- `SOURCE_API_BASE_URL=https://burcup-production.up.railway.app`
- `SOURCE_ADMIN_PASSWORD=agency`
- `SOURCE_ADMIN_TOKEN=...`
- `WIPE_TARGET=0` if you want to skip table replacement

## Migration tracking

Applied migrations are written into:

- `schema_migrations`

This gives you a simple history of which schema steps have already been executed.

## Migration notes

- The old one-season `teams`/`standings` shape has been replaced by `clubs`, `tournaments`, and `tournament_standings`.
- Existing JSON-based content is still mirrored into the new model through the migration scripts.
- News images are uploaded to storage and saved as public URLs, not stored as base64 strings in the database.
- Partner records are seeded from the current footer blocks, and logo assets are stored as URL-backed assets.

## Legacy archive

If you need to inspect the old PostgreSQL bootstrap, the legacy files are still here for reference only:

- `postgresql-schema.sql`
- `postgresql-seed.sql`
- `migrations/`
