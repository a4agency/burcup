# LAMP API scaffold

This folder contains the PHP/MySQL version of the Burchalkin Cup API that can be deployed on a classic LAMP host.

## Layout

- `public/` - web root for Apache
- `public/api/index.php` - single API entry point
- `app/` - PHP application code
- `public/.htaccess` - rewrite rules for API routes

## Current status

The first practical migration step is in place:

- MySQL connection bootstrap
- JSON response helpers
- public routes for:
  - `/health`
  - `/api/tournaments`
  - `/api/tournaments/{slug}`
  - `/api/tournaments/{slug}/standings`
  - `/api/tournaments/{slug}/playoff`
  - `/api/tournaments/{slug}/matches`
  - `/api/tournaments/{slug}/news`
  - `/api/tournaments/{slug}/partners`
  - `/api/clubs`
  - `/api/clubs/{slug}`
  - `/api/clubs/{slug}/matches`
  - `/api/matches`
  - `/api/news`
  - `/api/media/albums`
  - `/api/media/albums/{slug}`
  - `/api/standings`
  - `/api/playoff`
  - `/api/results`
  - `/api/pages/{slug}`
- admin login, read and save resources:
  - `/api/admin/session`
  - `/api/admin/{resource}` for tournaments, clubs, matches, news, partners, standings, playoff, albums, pages
  - `PUT` support for the same resources
  - `/api/admin/uploads/image`
  - `/api/admin/uploads/video`
  - `/api/admin/uploads/raw`

Uploads are stored locally under `public/uploads/` by default and returned as same-host URLs.

## Environment

Set one of these:

- `DATABASE_URL=mysql://user:password@host:3306/database`
- `MYSQL_URL=mysql://user:password@host:3306/database`
- `MYSQL_PUBLIC_URL=mysql://user:password@host:3306/database`
- `DATABASE_PUBLIC_URL=mysql://user:password@host:3306/database`
- or `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`

Optional:

- `ADMIN_PASSWORD`
- `ADMIN_TOKEN`
- `CORS_ORIGIN`
