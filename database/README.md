# PostgreSQL for Burchalkin Cup

This folder now contains the long-term data model for the site.

## Files

- `migrations/` contains versioned SQL migrations
- `postgresql-schema.sql` is a compatibility snapshot of the current structure
- `postgresql-seed.sql` fills it with the current site content and starter archive data

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

## Suggested order

1. Create a PostgreSQL database in Railway.
2. Run `database/migrations/apply-all.psql.sql`.
3. Run `postgresql-seed.sql`.
4. Configure the API service to read from this database.
5. Move uploaded images and partner logos to object storage and save their public URLs.
6. Connect the frontend pages to the new API endpoints.

If you cannot run `psql` scripts and need to paste SQL into a GUI editor, you can still use `postgresql-schema.sql` as a one-shot snapshot. It also creates `schema_migrations` and marks the current baseline versions as applied.

## Migration tracking

Applied migrations are written into:

- `schema_migrations`

This gives you a simple history of which schema steps have already been executed.

## Migration notes

- The old one-season `teams`/`standings` shape has been replaced by `clubs`, `tournaments`, and `tournament_standings`.
- Existing JSON-based content is still mirrored into the new model through the seed file.
- News images are still left as `NULL` because they should be uploaded to storage instead of being stored as base64 strings in the database.
- Partner records are seeded from the current footer blocks, but logo assets are intentionally empty so the admin flow can add them properly later.
