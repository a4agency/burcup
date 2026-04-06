# Migration Plan

Этот документ нужен, чтобы сайт можно было без боли переносить с одного хостинга на другой.

## Текущая архитектура

Проект уже разделён на 4 независимые части:

- `frontend`
  Статический сайт в корне репозитория: `index.html`, `css/`, `js/`, `images/`
- `api`
  Node/Express API в [railway-api/server.js](/Users/kainarbaev_daniar/Downloads/последний%20эталон/railway-api/server.js)
- `database`
  PostgreSQL схема и стартовые данные в [database/postgresql-schema.sql](/Users/kainarbaev_daniar/Downloads/последний%20эталон/database/postgresql-schema.sql) и [database/postgresql-seed.sql](/Users/kainarbaev_daniar/Downloads/последний%20эталон/database/postgresql-seed.sql)
- `storage`
  Внешнее хранение изображений через Cloudinary, URL сохраняются в базе

Это уже хорошая база для миграции: провайдеры можно менять по частям.

## Что не должно быть жёстко привязано к провайдеру

При переносе должны меняться только:

- URL фронтенда
- URL API
- параметры подключения к PostgreSQL
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
- `DATABASE_SSL`
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

При переносе на другой backend меняется только `apiBaseUrl`.

## Что менять при переносе API

API находится в отдельной папке:

- [railway-api/package.json](/Users/kainarbaev_daniar/Downloads/последний%20эталон/railway-api/package.json)
- [railway-api/server.js](/Users/kainarbaev_daniar/Downloads/последний%20эталон/railway-api/server.js)

Это обычный Express-сервис. Его можно поднять на:

- Railway
- Render
- Fly.io
- VPS
- Docker-хостинге
- любом Node.js hosting

Требования:

- Node.js 18+
- PostgreSQL
- env-переменные

## Что менять при переносе базы

База должна подниматься не вручную по таблицам, а через SQL-файлы:

1. Выполнить [database/postgresql-schema.sql](/Users/kainarbaev_daniar/Downloads/последний%20эталон/database/postgresql-schema.sql)
2. При необходимости выполнить [database/postgresql-seed.sql](/Users/kainarbaev_daniar/Downloads/последний%20эталон/database/postgresql-seed.sql)

Для уже живого проекта сиды лучше не запускать поверх продакшн-данных без проверки.

## Как переносить проект на новый хостинг

### Вариант 1. Меняем только фронтенд-хостинг

Если backend и база остаются прежними:

1. Залить корень репозитория на новый static hosting
2. Проверить, что новый домен разрешён в `CORS_ORIGIN`
3. При необходимости обновить `js/config.js`

### Вариант 2. Меняем только backend/API-хостинг

Если фронтенд остаётся на месте:

1. Поднять PostgreSQL или использовать текущую базу
2. Задеплоить папку `railway-api`
3. Прописать env-переменные
4. Проверить `/health`
5. Обновить `js/config.js` новым `apiBaseUrl`

### Вариант 3. Полный перенос

1. Поднять новую PostgreSQL-базу
2. Применить `postgresql-schema.sql`
3. Перенести боевые данные
4. Подключить storage credentials
5. Задеплоить API
6. Проверить админку
7. Задеплоить фронтенд
8. Проверить публичный сайт
9. Переключить домен

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

## Что стоит сделать следующим техническим этапом

Чтобы следующий перенос был ещё проще, стоит добавить:

1. Нормальные SQL migrations по версиям
   Сейчас есть один schema-файл, но лучше перейти на папку `migrations/`
2. Docker для API
   Тогда backend переносится почти в один клик
3. Отдельный production config
   Например через `.env.production`
4. Резервное копирование базы
5. Отдельный staging environment

## Минимальный чек-лист перед переездом

- есть бэкап PostgreSQL
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

создать `Dockerfile` для API и подготовить проект к запуску не только на Railway, но и на любом VPS или другом хостинге.
