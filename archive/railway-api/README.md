# Railway API

This folder contains the Express API for the Burchalkin Cup site.

## Why this exists

The public site is static and should not talk to the database directly.
This API sits between the frontend and the MySQL database.

## Run outside Railway

This API is packaged so it can run on any Docker-capable host, not only Railway.

Files:

- `Dockerfile`
- `.dockerignore`
- `docker-compose.example.yml`

## Endpoints

- `GET /health`
- `GET /api/tournaments`
- `GET /api/tournaments/:slug`
- `GET /api/tournaments/:slug/standings`
- `GET /api/tournaments/:slug/matches`
- `GET /api/tournaments/:slug/news`
- `GET /api/tournaments/:slug/partners`
- `GET /api/clubs`
- `GET /api/clubs/:slug`
- `GET /api/clubs/:slug/matches`
- `GET /api/standings`
- `GET /api/matches`
- `GET /api/news`
- `GET /api/results`
- `POST /api/translate`
- `GET /api/admin/:resource`
- `PUT /api/admin/:resource`
- `POST /api/admin/uploads/image`

The API keeps compatibility with the current site data model and exposes the new entities for tournaments, clubs, club history, partners, albums, and media.

## Railway setup

### Option A. API only

1. Create a Railway project.
2. Add a MySQL service.
3. Add a second service from this repository.
4. Set that service root directory to `railway-api`.
5. Railway will expose `DATABASE_URL` from the MySQL service.
6. In the API service variables, set:
   `DATABASE_URL=${{MySQL.DATABASE_URL}}`
   If your Railway service exposes a separate MySQL URL, `MYSQL_URL` and `MYSQL_PUBLIC_URL` are also supported and take priority if present.
   `CORS_ORIGIN=https://a4agency.github.io`
   `ADMIN_TOKEN=your-strong-secret`
   `CLOUDINARY_CLOUD_NAME=your-cloud-name`
   `CLOUDINARY_API_KEY=your-api-key`
   `CLOUDINARY_API_SECRET=your-api-secret`
   `TRANSLATION_ENABLED=true`
   `TRANSLATION_PROVIDER=google-gtx`
7. Deploy the service.

### Option B. Unified domain: site + API in one Railway service

If you want the whole site to open from the Railway domain itself, use the repository root as the service root and deploy the root-level [Dockerfile](/Users/kainarbaev_daniar/Downloads/последний%20эталон/Dockerfile).

This mode serves:

- the public site from `/`
- static assets from `/css`, `/js`, `/images`, etc.
- the API from `/api/...`

Recommended setup:

1. Create a Railway service from this repository.
2. Set the service root directory to the repository root.
3. Use the root-level `Dockerfile`.
4. Keep the same environment variables as the API-only mode.

In this mode the frontend can use the same origin for API calls, and the current config will automatically prefer the Railway domain itself.

## Docker build

Build the image from the `railway-api` directory:

```bash
docker build -t burcup-api .
```

Run it with env variables:

```bash
docker run --rm -p 3000:3000 \
  -e DATABASE_URL=mysql://user:password@host:3306/railway \
  -e CORS_ORIGIN=https://your-frontend-domain.com \
  -e ADMIN_TOKEN=your-strong-secret \
  -e CLOUDINARY_CLOUD_NAME=your-cloud-name \
  -e CLOUDINARY_API_KEY=your-api-key \
  -e CLOUDINARY_API_SECRET=your-api-secret \
  -e TRANSLATION_ENABLED=true \
  -e TRANSLATION_PROVIDER=google-gtx \
  burcup-api
```

To build the unified site + API image from the repository root:

```bash
docker build -t burcup-site .
```

## Docker Compose example

For a portable local or VPS setup, copy:

- `docker-compose.example.yml`

to:

- `docker-compose.yml`

and adjust:

- `DATABASE_URL`
- `CORS_ORIGIN`
- `ADMIN_TOKEN`
- Cloudinary variables
- translation variables

Then start:

```bash
docker compose up -d --build
```

## Automatic English Translation

The site still keeps its manual Russian-to-English dictionary for UI labels and important fixed wording.

For new Russian content coming from the database, the frontend can now request automatic English translations from:

- `POST /api/translate`

The API caches translated strings in the database, so repeated texts do not need to be translated again on every page load.

Current default provider:

- `google-gtx`

Environment variables:

- `TRANSLATION_ENABLED=true`
- `TRANSLATION_PROVIDER=google-gtx`

If translation is unavailable, the site keeps the original Russian content and does not break.

## Frontend switch

After Railway gives you a public domain, open:

- `js/config.js`

and set:

```js
window.BCUP_CONFIG = window.BCUP_CONFIG || {
  apiBaseUrl: 'https://your-service.up.railway.app'
};
```

Then redeploy or push the frontend changes to GitHub Pages.

## Admin API

Protected admin routes are intended for the custom admin page:

- `POST /api/admin/session`
- `GET /api/admin/tournaments`
- `GET /api/admin/clubs`
- `GET /api/admin/matches`
- `GET /api/admin/news`
- `GET /api/admin/partners`
- `PUT /api/admin/tournaments`
- `PUT /api/admin/clubs`
- `PUT /api/admin/matches`
- `PUT /api/admin/news`
- `PUT /api/admin/partners`
- `POST /api/admin/uploads/image`

The admin page first logs in with a password and receives the current admin token from the API:

```http
POST /api/admin/session
Content-Type: application/json

{
  "password": "agency"
}
```
