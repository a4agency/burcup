# Database migrations

Это версия схемы базы по шагам, а не один общий snapshot.

## Что здесь лежит

- `0001_create_core_entities.sql`
- `0002_create_matches_and_news.sql`
- `0003_create_partner_entities.sql`
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
   `0004_add_something.sql`
2. Помести в него только новое изменение схемы
3. В конце добавь запись в `schema_migrations`
4. Добавь файл в `apply-all.psql.sql`
5. Если нужно, обнови `postgresql-schema.sql` как compatibility snapshot

## Зачем snapshot всё ещё нужен

Файл [postgresql-schema.sql](/Users/kainarbaev_daniar/Downloads/последний%20эталон/database/postgresql-schema.sql) оставлен как быстрый совместимый bootstrap для случаев, когда нужно вставить схему целиком в GUI-редактор или разово поднять базу без psql-скрипта.
