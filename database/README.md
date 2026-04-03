# PostgreSQL for Burchalkin Cup

This folder contains a PostgreSQL base for the current static site.

## Files

- `postgresql-schema.sql` creates the core tables
- `postgresql-seed.sql` fills the database with the current site content

## What is covered

- teams
- standings
- matches
- match events
- news
- results

## Important

This site is hosted as static HTML on GitHub. A browser should not connect directly to raw PostgreSQL with database credentials.

Recommended deployment options:

- Supabase: PostgreSQL + Auth + Storage + REST API
- Your own backend on Render, Railway, Fly.io, or another server

## Suggested order

1. Create a PostgreSQL database.
2. Run `postgresql-schema.sql`.
3. Run `postgresql-seed.sql`.
4. Upload news images to storage and save public URLs in `news_articles.image_url`.
5. Replace frontend reads from `data/*.json` with API calls.

## JSON to SQL mapping

- `data/standings.json` -> `standings`
- `data/matches.json` -> `matches`
- `data/news.json` -> `news_articles`
- `data/results.json` -> `results`

## Notes

- Team logos remain as file paths like `images/team-zenit.png`, so the current frontend can keep using the same asset structure.
- News images in the current JSON are stored as large `data:image` strings. The seed file intentionally leaves them as `NULL` and expects normal public image URLs later.
- The site already has a dynamic match page fed from the match JSON, so moving matches into PostgreSQL will cover both list pages and single match pages cleanly.
