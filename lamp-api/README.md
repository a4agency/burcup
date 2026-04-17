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
  - `/api/clubs`
  - `/api/clubs/{slug}`
  - `/api/pages/{slug}`

## Environment

Set one of these:

- `DATABASE_URL=mysql://user:password@host:3306/database`
- or `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`

Optional:

- `ADMIN_PASSWORD`
- `ADMIN_TOKEN`
- `CORS_ORIGIN`

