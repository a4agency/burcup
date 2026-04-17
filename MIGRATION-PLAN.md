# Migration Plan

Этот документ нужен, чтобы сайт можно было без боли переносить с одного хостинга на другой.

## Текущая архитектура

Проект уже разделён на 4 независимые части:

- `frontend`
  Статический сайт в корне репозитория: `index.html`, `css/`, `js/`, `images/`
- `api`
  Node/Express API в [railway-api/server-mysql.js](/Users/kainarbaev_daniar/Downloads/последний%20эталон/railway-api/server-mysql.js)
- `database`
  MySQL схема в [database/mysql-schema.sql](/Users/kainarbaev_daniar/Downloads/последний%20эталон/database/mysql-schema.sql), а старые PostgreSQL-миграции сохранены только как архив в [database/migrations](/Users/kainarbaev_daniar/Downloads/последний%20эталон/database/migrations/README.md)
- `storage`
  Внешнее хранение изображений через Cloudinary, URL сохраняются в базе

Это уже хорошая база для миграции: провайдеры можно менять по частям.

## Что не должно быть жёстко привязано к провайдеру

При переносе должны меняться только:

- URL фронтенда
- URL API
- параметры подключения к MySQL
- storage credentials
- CORS origin

Не должны меняться:

- HTML/CSS/JS сайта
- схема данных
- структура API
- логика админки

## Обязательные переменные окружения API

Для любого хостинга API нужны такие env-переменные:

- `PORT`
- `DATABASE_URL`
- `CORS_ORIGIN`
- `ADMIN_TOKEN`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

Пример лежит в [railway-api/.env.example](/Users/kainarbaev_daniar/Downloads/последний%20эталон/railway-api/.env.example).

## Что менять при переносе фронтенда

Фронтенд использует только один внешний адрес:

- [js/config.js](/Users/kainarbaev_daniar/Downloads/последний%20эталон/js/config.js)

Сейчас там задаётся:

```js
window.BCUP_CONFIG = window.BCUP_CONFIG || {
  apiBaseUrl: 'https://burcup-production.up.railway.app'
};
```

При переносе на новый backend меняется только `apiBaseUrl`.

## Что менять при переносе API

API находится в отдельной папке:

- [railway-api/package.json](/Users/kainarbaev_daniar/Downloads/последний%20эталон/railway-api/package.json)
- [railway-api/server-mysql.js](/Users/kainarbaev_daniar/Downloads/последний%20эталон/railway-api/server-mysql.js)

Это обычный Express-сервис. Его можно поднять на:

- Railway
- Render
- Fly.io
- VPS
- Docker-хостинге
- любом Node.js hosting

Требования:

- Node.js 18+
- MySQL 8+ или MariaDB 10.6+
- env-переменные

Отдельно стоит учесть, что теперь проект поддерживает и объединённый вариант:

- один Railway-сервис раздаёт сайт с `/`
- тот же Railway-сервис раздаёт API с `/api`

Для этого используется корневой [Dockerfile](/Users/kainarbaev_daniar/Downloads/последний%20эталон/Dockerfile), а не только папка `railway-api`.

## Что менять при переносе базы

База должна подниматься через MySQL-схему и отдельный миграционный скрипт:

1. Выполнить [database/mysql-schema.sql](/Users/kainarbaev_daniar/Downloads/последний%20эталон/database/mysql-schema.sql)
2. Импортировать данные скриптом [scripts/migrate-to-mysql.mjs](/Users/kainarbaev_daniar/Downloads/последний%20эталон/scripts/migrate-to-mysql.mjs)
3. При необходимости прогнать проверку [scripts/check-mysql.mjs](/Users/kainarbaev_daniar/Downloads/последний%20эталон/scripts/check-mysql.mjs)

Для уже живого проекта миграцию лучше запускать поверх новой пустой MySQL-базы после проверки бэкапа.

## Как переносить проект на новый хостинг

### Вариант 1. Меняем только фронтенд-хостинг

Если backend и база остаются прежними:

1. Залить корень репозитория на новый static hosting
2. Проверить, что новый домен разрешён в `CORS_ORIGIN`
3. При необходимости обновить `js/config.js`

### Вариант 2. Меняем только backend/API-хостинг

Если фронтенд остаётся на месте:

1. Поднять MySQL или использовать текущую базу
2. Задеплоить папку `railway-api`
3. Прописать env-переменные
4. Проверить `/health`
5. Обновить `js/config.js` новым `apiBaseUrl`

### Вариант 3. Полный перенос

1. Поднять новую MySQL-базу
2. Применить `mysql-schema.sql`
3. Перенести боевые данные скриптом миграции
4. Подключить storage credentials
5. Задеплоить API
6. Проверить админку
7. Задеплоить фронтенд
8. Проверить публичный сайт
9. Переключить домен

### Вариант 4. Один домен для сайта и API

1. На Railway использовать корень репозитория как service root
2. Деплоить корневой `Dockerfile`
3. Сайт будет открываться с `/`
4. API будет работать с `/api/...`
5. `js/config.js` уже настроен так, чтобы предпочитать same-origin API и падать обратно на внешний API только как fallback

## Безопасный сценарий переноса

Чтобы перенос был без простоя:

1. Сначала поднять новый API на временном домене
2. Подключить новую базу и storage
3. Проверить:
   - `/health`
   - `/api/tournaments`
   - `/api/clubs`
   - `POST /api/admin/uploads/image`
4. Временно переключить `js/config.js` на новый API
5. Протестировать сайт и админку
6. Только потом переключать основной домен

## Что уже добавлено для переносимости базы

Базовая версия MySQL-переноса уже добавлена:

- [database/mysql-schema.sql](/Users/kainarbaev_daniar/Downloads/последний%20эталон/database/mysql-schema.sql)
- [scripts/migrate-to-mysql.mjs](/Users/kainarbaev_daniar/Downloads/последний%20эталон/scripts/migrate-to-mysql.mjs)
- [scripts/check-mysql.mjs](/Users/kainarbaev_daniar/Downloads/последний%20эталон/scripts/check-mysql.mjs)

## Что стоит сделать следующим техническим этапом

Чтобы следующий перенос был ещё проще, стоит добавить:

1. Отдельный production config
   Например через `.env.production`
2. Резервное копирование базы
3. Отдельный staging environment

## Минимальный чек-лист перед переездом

- есть бэкап MySQL
- сохранены все env-переменные
- сохранены Cloudinary credentials
- известен текущий `ADMIN_TOKEN`
- новый домен добавлен в `CORS_ORIGIN`
- `js/config.js` указывает на новый API
- админка открывается и сохраняет данные
- загрузка логотипов работает
- публичные страницы читают данные из новой базы

## Рекомендуемая следующая задача

Следующий практичный шаг:

добавить отдельную миграцию под следующую реальную доработку MySQL-схемы и закрепить процесс: любое изменение таблиц сначала идёт в новый migration-файл, а не редактируется прямо в snapshot.
