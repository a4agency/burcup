# Railway API

This folder contains a small Express API for the Burchalkin Cup site.

## Why this exists

The public site is static and hosted from GitHub. It should not connect directly to PostgreSQL.

This API sits between the static frontend and your PostgreSQL database on Railway.

## Endpoints

- `GET /health`
- `GET /api/standings`
- `GET /api/matches`
- `GET /api/news`
- `GET /api/results`

The API returns data in the same shape as the current `data/*.json` files, so the frontend can switch over without a full rewrite.

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
