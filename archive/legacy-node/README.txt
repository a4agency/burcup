Burchalkin Cup — MySQL deployment snapshot

This repository contains the public static site and the Node API for the tournament.

Current stack:
- frontend: static HTML/CSS/JS in the repository root
- api: Node/Express service in railway-api
- database: MySQL schema and migration scripts in database/
- storage: Cloudinary for uploaded images and partner logos

Main paths:
- index.html
- about-tournament.html
- about-lev-burchalkin.html
- news.html
- matches.html
- results.html
- multimedia.html
- partners.html
- contacts.html
- match.html
- css/style.css
- js/site.js
- js/matches.js
- railway-api/server-mysql.js

Live content:
- data/standings.json
- data/matches.json
- data/news.json
- data/results.json

Admin:
- admin-almaz.html
- the admin UI talks to the API and MySQL

Legacy archive:
- old PostgreSQL migration files are kept in database/migrations only as an archive
- legacy PostgreSQL schema/seed snapshots are also preserved for reference
