# BurCup on Timeweb

This guide covers two cases:

- first-time deployment of BurCup on Timeweb
- moving the same site to another Timeweb account later

## Short version for a non-developer

If you are not editing code and just want to turn the site on:

1. Upload the site files to `public_html`.
2. Open the existing `public_html/lamp-api/config.local.php` file.
3. Replace the database name, user, password, and domain inside that file.
4. Make sure `public_html/lamp-api/public/uploads/` exists.
5. Create a MySQL database in Timeweb.
6. Import `burcup_dump_timeweb.sql`.
7. Open `https://<domain>/diag.php`.
8. Open `https://<domain>/lamp-api/diag.php`.
9. Open `https://<domain>/api/health`.

If all three open, the site is active.

## What must stay the same in the repo

- `lamp-api/app/bootstrap.php`
- `lamp-api/public/api/index.php`
- `.htaccess` at the repository root
- `lamp-api/public/.htaccess`
- the frontend files and API routes

These files are part of the codebase and should stay in sync across hosts.

## What is Timeweb-specific

- `public_html/lamp-api/config.local.php`
- `public_html/lamp-api/public/uploads/`
- the domain binding in the Timeweb panel
- the MySQL database inside the Timeweb account

## First-time setup on Timeweb

1. Create the site in Timeweb and point the document root to `public_html`.
2. Upload the repository contents into `public_html`.
3. Keep the existing `public_html/.htaccess` file in place.
4. Keep the existing `public_html/lamp-api/public/.htaccess` file in place.
5. Create the MySQL database in Timeweb.
6. Import `burcup_dump_timeweb.sql` into that database.
7. Open the existing `public_html/lamp-api/config.local.php` file and edit it.
8. Add the DB and admin values to `config.local.php`.
9. Keep `public_html/lamp-api/public/uploads/` present and writable.
10. Open:
   - `https://<domain>/diag.php`
   - `https://<domain>/lamp-api/diag.php`
   - `https://<domain>/api/health`

## What you need from Timeweb

Before filling `config.local.php`, copy these values from the Timeweb panel:

- database host
- database name
- database user
- database password
- your site domain

For the current Timeweb setup we used:

- `DB_HOST = localhost`
- `DB_PORT = 3306`
- `DB_NAME = cu927919_123`
- `DB_USER = cu927919_123`
- `DB_PASSWORD = the password you set in Timeweb`

## What to put in `config.local.php`

This file already exists in the project. Do not create a new one from scratch
unless it was accidentally removed. Just open the file and edit the values.

```php
<?php
declare(strict_types=1);

return [
    'DB_HOST' => 'localhost',
    'DB_PORT' => '3306',
    'DB_NAME' => 'your_database_name',
    'DB_USER' => 'your_database_name',
    'DB_PASSWORD' => 'your_database_password',

    'ADMIN_PASSWORD' => 'your_admin_password',
    'ADMIN_TOKEN' => 'your_admin_token',
    'CORS_ORIGIN' => 'https://your-domain.example',

    'TRANSLATION_ENABLED' => 'true',
    'TRANSLATION_PROVIDER' => 'openai',
    'MYSQL_CONNECT_TIMEOUT' => '5',
];
```

## What changes when moving to another Timeweb account

If the site is moved to a new Timeweb account, update these items:

- `DB_NAME`
- `DB_USER`
- `DB_PASSWORD`
- `CORS_ORIGIN` if the domain changed
- `ADMIN_PASSWORD` if you want to rotate the admin login
- `ADMIN_TOKEN` if you want to rotate the API token

What you usually do not change:

- the PHP code
- the `.htaccess` files
- the upload folder path inside the site tree
- the presence of `config.local.php` itself

## What to tell the new account owner

If someone else receives the site, give them these items:

- the `burcup_dump_timeweb.sql` file
- the site files
- the values for `config.local.php`
- the domain they should point to Timeweb

They do not need to understand the code to activate the site, only to paste the
right values into `config.local.php` and upload the files correctly.

## Transfer checklist

1. Copy the site files to the new Timeweb account.
2. Open `public_html/lamp-api/config.local.php` and edit only the values.
3. Create a fresh MySQL database in the new account.
4. Import `burcup_dump_timeweb.sql`.
5. Confirm `public_html/lamp-api/public/uploads/` exists.
6. Check `https://<domain>/lamp-api/diag.php`.
7. Check `https://<domain>/api/health`.
8. Re-test admin login and one upload.

## If something breaks

- If `diag.php` works but `lamp-api/diag.php` does not, the problem is usually
  `config.local.php` or database credentials.
- If `lamp-api/diag.php` says `PDO: connected` but `/api/health` fails, the
  problem is likely the API route or a runtime exception.
- If uploads fail, re-check folder permissions on `lamp-api/public/uploads/`.
