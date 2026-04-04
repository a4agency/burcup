# Railway API

This folder contains a small Express API for the Burchalkin Cup site.

## Why this exists

The public site is static and hosted from GitHub. It should not connect directly to PostgreSQL.

This API sits between the static frontend and your PostgreSQL database on Railway.

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
- `GET /api/admin/:resource`
- `PUT /api/admin/:resource`
- `POST /api/admin/uploads/image`

The API keeps compatibility with the current `data/*.json` shape, and also exposes the new entities for tournaments, clubs, club history, and partners.

## Railway setup

1. Create a Railway project.
2. Add a PostgreSQL service.
3. Add a second service from this repository.
4. Set that service root directory to `railway-api`.
5. Railway will expose `DATABASE_URL` from the PostgreSQL service.
6. In the API service variables, set:
   `DATABASE_URL=${{Postgres.DATABASE_URL}}`
   `DATABASE_SSL=true`
   `CORS_ORIGIN=https://a4agency.github.io`
   `ADMIN_TOKEN=your-strong-secret`
   `CLOUDINARY_CLOUD_NAME=your-cloud-name`
   `CLOUDINARY_API_KEY=your-api-key`
   `CLOUDINARY_API_SECRET=your-api-secret`
7. Deploy the service.

Railway documents:

- [PostgreSQL](https://docs.railway.com/guides/postgresql)
- [Deploying a Monorepo](https://docs.railway.com/guides/monorepo)
- [Using Variables](https://docs.railway.com/develop/variables)

## Run SQL

Create the tables first, then seed them:

```sql
\i ../database/postgresql-schema.sql
\i ../database/postgresql-seed.sql
```

If you run SQL from another client, use the files in the top-level `database/` directory.

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

Send the Railway secret in the request header:

```http
x-admin-token: your-strong-secret
```

The admin page `admin-lkjuft.html` now stores this token locally in the browser and uses it to read and write data directly through Railway API.

For partner logos and other image fields, the admin page can upload files through Railway API into Cloudinary. The server stores only the resulting public URL in PostgreSQL, which keeps the database cleaner than saving long base64 strings.

## New data model notes

- `GET /api/tournaments` returns yearly tournament cards
- `GET /api/clubs/:slug` returns club info plus full match history across tournaments
- `GET /api/tournaments/:slug/partners` returns partners grouped by tournament relation
- old endpoints still exist so the current site can continue working while the new pages are being built
