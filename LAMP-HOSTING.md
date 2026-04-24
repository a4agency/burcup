# BurCup LAMP hosting notes

This file is the practical checklist for moving the current BurCup site from the
Railway PHP runtime to a regular Apache + PHP + MySQL host.

## What is already ready

- Frontend pages use same-origin API requests.
- Main read endpoints already run from PHP in `lamp-api/public/api/index.php`.
- Admin read/save endpoints already run from PHP.
- Upload handlers already run from PHP.
- Production MySQL read/write was verified on:
  - `partners`
  - `matches`
  - `news`
- Root `.htaccess` already routes `/api/*` into the PHP API.
- `lamp-api/public/.htaccess` already supports Apache rewrite rules for API paths.

## What is still Railway-specific today

- The current production `Dockerfile` starts PHP with the CLI dev server:
  - `php -S ... router.php`
- Railway uses a mounted volume for uploads at:
  - `/var/www/html/lamp-api/public/uploads`
- Railway variables currently provide the production secrets and MySQL access.

## What a normal LAMP host should look like

Recommended layout on the target host:

- site document root -> repository root
- Apache rewrite enabled
- `.htaccess` allowed
- PHP 8.2+ with:
  - `pdo`
  - `pdo_mysql`
  - `json`
  - `mbstring`
- writable uploads directory:
  - `lamp-api/public/uploads`

If the host only gives `public_html`, copy the repository contents into that
public root and keep relative paths unchanged.

## Required environment values

Set either the `DB_*` variables or the `MYSQL*` variables. For classic shared
hosting, you can also use a local PHP config file.

Minimum set:

- `DB_HOST`
- `DB_PORT`
- `DB_NAME`
- `DB_USER`
- `DB_PASSWORD`
- `ADMIN_PASSWORD`
- `ADMIN_TOKEN`
- `CORS_ORIGIN`

Use [lamp-api/.env.example](/Users/kainarbaev_daniar/Downloads/последний%20эталон/lamp-api/.env.example) as the template.

If the host does not support persistent environment variables, copy
[lamp-api/config.local.example.php](/Users/kainarbaev_daniar/Downloads/последний%20эталон/lamp-api/config.local.example.php)
to `lamp-api/config.local.php` and fill in the values there. The PHP bootstrap
loads that file automatically when it exists, so the shared-hosting setup works
without changing the runtime.

## Apache checklist

1. Enable `mod_rewrite`.
2. Ensure `AllowOverride All` is enabled for the site root.
3. Point the domain to the repository root.
4. Ensure `lamp-api/public/uploads` exists and is writable by Apache/PHP.
5. Confirm these URLs work:
   - `/`
   - `/matches.html`
   - `/api/health`
   - `/api/tournaments`
   - `/api/news`
   - `/api/admin/session`

## Local Apache-compatible container

To test the classic Apache mode locally or on a Docker-capable host, use:

- [Dockerfile.apache](/Users/kainarbaev_daniar/Downloads/последний%20эталон/Dockerfile.apache)

It runs:

- Apache instead of the PHP CLI router
- `mod_rewrite`
- `pdo_mysql`

## Remaining migration tasks after this step

- Run the site against the Apache variant and verify all public pages.
- Verify admin login/save/upload flows under Apache mode.
- Make sure uploads remain available without Railway-specific assumptions.
- After that, the project will be structurally ready for a typical LAMP host.
