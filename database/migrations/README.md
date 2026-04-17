# Database migrations archive

This folder keeps the old PostgreSQL migration history for reference.
It is no longer the active path for new deployments.

## What is here

- `0001_create_core_entities.sql`
- `0002_create_matches_and_news.sql`
- `0003_create_partner_entities.sql`
- `0004_add_partner_logo_asset_metadata.sql`
- `0005_add_tournament_countdown_flag.sql`
- `0006_add_match_media_links.sql`
- `0007_create_content_translations.sql`
- `apply-all.psql.sql`

## Legacy only

These files are kept to document how the old PostgreSQL schema evolved.
For new setups, use `database/mysql-schema.sql` and the MySQL migration script instead.
