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
  - `/api/translate`
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
- `TRANSLATION_ENABLED`
- `TRANSLATION_PROVIDER`

If your host does not keep environment variables, copy
[`config.local.example.php`](./config.local.example.php) to
`config.local.php` and fill in the same values there. The bootstrap loads that
file automatically when present, so the same API code works on shared hosting
without extra setup.

## Deployment modes

### 1. Current Railway runtime

For the current Railway deployment, use the root `Dockerfile` in this repository.

That runtime:

- serves the static site from `/var/www/html`
- routes `/api/*` through `router.php`
- runs PHP via the CLI dev server
- keeps uploads available at `/uploads/*`

If you use a Railway volume for persistent uploads, mount it at:

- `/var/www/html/lamp-api/public/uploads`

### 2. Classic Apache / LAMP runtime

For Apache-style hosting, use:

- the repository root as the site root
- root `.htaccess`
- `lamp-api/public/.htaccess`
- [Dockerfile.apache](/Users/kainarbaev_daniar/Downloads/последний%20эталон/Dockerfile.apache) when you want to test the same layout in Docker

That mode is closer to a normal shared hosting setup:

- Apache serves static HTML directly
- Apache rewrites `/api/*` into PHP
- no CLI router is required

Use [lamp-api/.env.example](/Users/kainarbaev_daniar/Downloads/последний%20эталон/lamp-api/.env.example) as the environment template.

## Next migration target

The PHP API already covers the main production scenarios. The remaining goal is
to verify every public/admin workflow under the Apache-style runtime so the site
can move to a typical LAMP host without relying on Railway-specific behavior.
