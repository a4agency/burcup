# BurCup Dual Deployment Playbook

This file keeps the working split between the two live targets:

- Railway: the current Docker-based runtime
- Timeweb: the classic Apache + PHP + MySQL host

## Rule of thumb

- If a change touches PHP runtime, env variables, DB access, or uploads, update
  both targets.
- If a change touches static frontend files only, publish the same files to both
  targets as needed, but Railway remains the primary deploy path.
- Every meaningful step is recorded in `WORKLOG.md`.

## Railway

What to change:

- Update the repository files locally.
- Push the branch to GitHub.
- Let Railway pick up the pushed commit.

What to verify:

- `router.php` still routes `/api/*`.
- uploads are still mounted at `/var/www/html/lamp-api/public/uploads`.
- environment variables are still present in Railway.

## Timeweb

What to change:

- Upload the same changed files into `public_html`.
- Keep `public_html/.htaccess` and `public_html/lamp-api/public/.htaccess`
  aligned with the repo.
- Keep `public_html/lamp-api/config.local.php` updated when DB or admin secrets
  change.
- Keep `public_html/lamp-api/public/uploads/` present and writable.

What to verify:

- `https://<domain>/diag.php` proves PHP is alive.
- `https://<domain>/lamp-api/diag.php` proves `config.local.php` and MySQL.
- `https://<domain>/api/health` returns JSON.

## When we make a code change

1. Update local source files.
2. Update `WORKLOG.md`.
3. Validate syntax locally.
4. Push to Railway/GitHub if the change should go live there.
5. Mirror the same source files to Timeweb if the change affects the shared host.
6. Re-run the two diagnostic URLs on Timeweb if the backend touched config, DB,
   or PHP bootstrap logic.

