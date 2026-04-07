# Database migrations

Это версия схемы базы по шагам, а не один общий snapshot.

## Что здесь лежит

- `0001_create_core_entities.sql`
- `0002_create_matches_and_news.sql`
- `0003_create_partner_entities.sql`
- `0004_add_partner_logo_asset_metadata.sql`
- `0005_add_tournament_countdown_flag.sql`
- `0006_add_match_media_links.sql`
- `0007_create_content_translations.sql`
- `apply-all.psql.sql`

## Как применять на пустую базу

Через `psql`:

```bash
psql "$DATABASE_URL" -f database/migrations/apply-all.psql.sql
psql "$DATABASE_URL" -f database/postgresql-seed.sql
```

## Как проверить, что миграции применились

```sql
SELECT version, name, applied_at
FROM schema_migrations
ORDER BY version;
```

## Как добавлять новую миграцию

1. Создай новый файл по порядку, например:
   `0007_add_something.sql`
2. Помести в него только новое изменение схемы
3. В конце добавь запись в `schema_migrations`
4. Добавь файл в `apply-all.psql.sql`
5. Если нужно, обнови `postgresql-schema.sql` как compatibility snapshot

## Зачем snapshot всё ещё нужен

Файл [postgresql-schema.sql](/Users/kainarbaev_daniar/Downloads/последний%20эталон/database/postgresql-schema.sql) оставлен как быстрый совместимый bootstrap для случаев, когда нужно вставить схему целиком в GUI-редактор или разово поднять базу без psql-скрипта. Он также создаёт `schema_migrations` и помечает текущий baseline как применённый.
