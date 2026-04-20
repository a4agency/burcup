# Журнал изменений BurCup

Этот файл нужен как рабочий журнал проекта, чтобы можно было быстро восстановить контекст после сбоя, перерыва или потери истории чата.

## Правила ведения

- Каждое заметное изменение добавляем новой записью сверху.
- Используем один и тот же формат записи:
  - `Что сделали`
  - `Что проверили`
  - `Что осталось`
  - `Файлы`
  - `Коммиты`
- Если есть риск, временный костыль или незавершенный перенос, фиксируем это явно.
- После каждого значимого шага журнал обновляется сразу.
- Коммиты по рабочим изменениям можно делать без отдельного подтверждения пользователя.

---

## Сводка проекта

### Уже сделано

- Основной сайт переведен с Node/старого API на PHP API в структуре `lamp-api`.
- База данных проекта переведена с PostgreSQL на MySQL.
- Поднят новый Railway-проект под PHP-версию сайта.
- Подключен отдельный volume для загрузок.
- Архивированы старые Node-инструменты и legacy-бэкенд в `archive/`.

### Текущая инфраструктура

- Продовый адрес: `https://burcup-production.up.railway.app`
- Проверка API: `https://burcup-production.up.railway.app/api/health`
- Базовый API: `https://burcup-production.up.railway.app/api`
- Проверка турниров: `https://burcup-production.up.railway.app/api/tournaments`
- Ожидаемый ответ health:
  - `{"ok":true,"runtime":"php","database":"mysql"}`

### Карта подключений

- Рабочий каталог проекта:
  - `/Users/kainarbaev_daniar/Downloads/последний эталон`
- Основной PHP API:
  - `/Users/kainarbaev_daniar/Downloads/последний эталон/lamp-api`
- Архив старых Node-инструментов и миграций:
  - `/Users/kainarbaev_daniar/Downloads/последний эталон/archive`
- Railway project:
  - `BurCup`
- Railway service:
  - `burcup`
- Railway database service:
  - `MySQL`
- Railway uploads volume:
  - `burcup-volume`
- Mount path для загрузок:
  - `/var/www/html/lamp-api/public/uploads`
- Git branch по умолчанию:
  - `main`

### Основные переменные окружения

- `ADMIN_PASSWORD`
- `ADMIN_TOKEN`
- `CORS_ORIGIN`
- `MYSQLHOST`
- `MYSQLPORT`
- `MYSQLDATABASE`
- `MYSQLUSER`
- `MYSQLPASSWORD`
- `TRANSLATION_ENABLED`
- `TRANSLATION_PROVIDER`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

### Где лежат секреты

- Реальные значения паролей, токенов и connection string в этот файл не записываем.
- Все секреты хранятся в Railway Variables у сервиса `burcup`.
- Данные новой MySQL берутся из Railway Variables у сервиса `MySQL`.
- Если нужно восстановить доступы:
  - открыть Railway project `BurCup`
  - открыть service `burcup` -> `Variables`
  - открыть service `MySQL` -> `Variables`
- В репозиторий коммитим только имена переменных и схему подключения, но не секретные значения.

### Важные проверки после деплоя

- `https://burcup-production.up.railway.app/`
- `https://burcup-production.up.railway.app/api/health`
- `https://burcup-production.up.railway.app/api/tournaments`
- `https://burcup-production.up.railway.app/api/news`
- `https://burcup-production.up.railway.app/api/matches`
- вход в админку
- загрузка партнеров, новостей, клубов и архивных турниров

### Краткая история миграции

- Сайт изначально работал на статическом фронте и старом Node/Express API.
- Затем проект перевели с PostgreSQL на MySQL.
- После этого начали перевод API на PHP для совместимости с будущим LAMP-хостингом.
- На Railway поднимали новый сервис, отдельно подключали volume для `uploads`.
- Во время миграции был этап с Apache-конфигурацией и ошибкой `More than one MPM loaded`.
- После стабилизации новый продовый сервис начал отвечать через PHP и MySQL.
- Затем отдельно добивали архивные турниры, чтобы `api/tournaments` возвращал не только `2026`, но и прошлые сезоны.

### Что уже переведено на PHP

- Основной API-роутер:
  - `lamp-api/public/api/index.php`
- Публичные GET-ручки:
  - `/api/health`
  - `/api/tournaments`
  - `/api/tournaments/{slug}`
  - `/api/tournaments/{slug}/standings`
  - `/api/tournaments/{slug}/playoff`
  - `/api/tournaments/{slug}/matches`
  - `/api/tournaments/{slug}/news`
  - `/api/tournaments/{slug}/partners`
  - `/api/clubs`
  - `/api/clubs/{slug}`
  - `/api/clubs/{slug}/matches`
  - `/api/matches`
  - `/api/news`
  - `/api/news/{slug|id}`
  - `/api/media/albums`
  - `/api/media/albums/{slug}`
  - `/api/standings`
  - `/api/playoff`
  - `/api/results`
  - `/api/pages/{slug}`
  - `/api/translate`
- Админ-авторизация:
  - `/api/admin/session`
- Админские чтение и сохранение:
  - `/api/admin/{resource}`
- Загрузка файлов:
  - `/api/admin/uploads/image`
  - `/api/admin/uploads/video`
  - `/api/admin/uploads/raw`
- Работа с базой:
  - PHP API использует MySQL через `pdo_mysql`
- Фронт:
  - основные страницы сайта уже ходят в `/api/*`
  - админка `admin-almaz.html` работает через PHP API

### Что еще осталось добить по LAMP-переносу

- Перевести запуск с текущего Railway PHP router/dev-server на классический Apache/PHP режим без временного CLI-роутера.
- Подготовить финальную Apache-конфигурацию под обычный LAMP-хостинг:
  - `DocumentRoot`
  - `mod_rewrite`
  - прокидка `/api/*`
  - корректная раздача статики и `uploads`
- Проверить, что сайт полностью работает без Railway-специфичных допущений:
  - без Railway volume-логики
  - без Railway-specific startup hacks
  - без зависимости от старого проекта
- Финально перенести данные в отдельную целевую MySQL на новом хостинге, если Railway MySQL не будет использоваться в проде.
- Подготовить `.env`/конфиг для типового LAMP-хостинга:
  - MySQL credentials
  - admin secrets
  - CORS
  - translation
  - Cloudinary
- Проверить файловые права на `uploads` в среде Apache/PHP.
- Прогнать финальную сверку JSON-ответов фронта на новом хостинге.
- После этого уже можно будет отключать старые Railway/Node/legacy хвосты окончательно.

### Если чат пропадет

Продолжать нужно с проверки:

1. Railway service `burcup`
2. `https://burcup-production.up.railway.app/api/health`
3. `https://burcup-production.up.railway.app/api/tournaments`
4. содержимого этого файла

---

## 2026-04-20 01:40

### Что сделали

- Зафиксировали в журнале отдельным блоком текущий статус PHP-переноса.
- Разложили по пунктам, какие части проекта уже работают через PHP API.
- Добавили список оставшихся задач именно для LAMP-переноса.

### Что проверили

- По коду фронт уже обращается к `/api/*`.
- Админка работает через PHP admin endpoints.
- В проекте есть рабочий PHP API для публичных данных, админки и загрузки файлов.
- Текущий Railway runtime сейчас уже PHP, но не классический Apache LAMP-режим.

### Что осталось

- Добить именно финальный хостинговый слой под классический LAMP.
- После этого обновить журнал новым статусом: «LAMP-ready».

### Файлы

- [WORKLOG.md](/Users/kainarbaev_daniar/Downloads/последний эталон/WORKLOG.md)
- [lamp-api/public/api/index.php](/Users/kainarbaev_daniar/Downloads/последний эталон/lamp-api/public/api/index.php)
- [js/site.js](/Users/kainarbaev_daniar/Downloads/последний эталон/js/site.js)
- [js/admin.js](/Users/kainarbaev_daniar/Downloads/последний эталон/js/admin.js)

### Коммиты

- Будет отдельный коммит после обновления журнала.

---

## 2026-04-20 01:25

### Что сделали

- Расширили рабочий журнал более ранним контекстом миграции.
- Добавили в журнал карту подключений, сервисов и путей.
- Зафиксировали, где искать переменные окружения и как восстанавливать подключение к Railway.
- Зафиксировали правило, что секреты и реальные пароли в репозиторий не записываются.
- Добавили в журнал контрольные URL и список проверок после деплоя.

### Что проверили

- `api/tournaments` уже отдает не только сезон `2026`, но и прошлые розыгрыши.
- Текущий health-check продолжает отвечать ожидаемо:
  - `{"ok":true,"runtime":"php","database":"mysql"}`
- Для продолжения работ уже достаточно одного `WORKLOG.md`, даже если история чата прервется.

### Что осталось

- После каждого следующего шага дополнять журнал новой записью сверху.
- При изменении Railway или базы данных обновлять в журнале схему подключений и список проверок.

### Файлы

- [WORKLOG.md](/Users/kainarbaev_daniar/Downloads/последний эталон/WORKLOG.md)

### Коммиты

- Будет отдельный коммит после обновления журнала.

---

## 2026-04-20 01:00

### Что сделали

- Создали рабочий журнал проекта.
- Зафиксировали правило, что дальше ведем его пошагово.
- Зафиксировали, что рабочие коммиты можно делать без отдельного подтверждения.

### Что проверили

- Отдельного журнала в проекте до этого не было.
- Для хранения контекста удобнее вести один файл в корне проекта.

### Что осталось

- После каждого следующего заметного шага дополнять журнал новой записью сверху.

### Файлы

- [WORKLOG.md](/Users/kainarbaev_daniar/Downloads/последний эталон/WORKLOG.md)

### Коммиты

- Пока не коммитили отдельно эту структурную правку.

---

## 2026-04-20 00:40

### Что сделали

- Подготовили и запушили в `main` правку для PHP API, чтобы список турниров мог включать прошлые розыгрыши.
- Добавили одноразовый скрипт импорта архивных турниров в MySQL.
- Импортировали архивные турниры в новую MySQL.

### Что проверили

- PHP health-check нового Railway-проекта отвечает корректно:
  - `/api/health` -> `{"ok":true,"runtime":"php","database":"mysql"}`
- Новый Railway-сервис уже поднят и работает на PHP.
- Новый Railway-проект подключен к новой MySQL и отдельному volume для `uploads`.
- В новую MySQL добавлены архивные турниры:
  - `burchalkin-cup-2025`
  - `burchalkin-cup-2024`
  - `burchalkin-cup-2023`
  - `burchalkin-cup-2019`
  - `burchalkin-cup-2018`
- В Railway-графе сервис уже связан с новой MySQL.
- На уровне API `api/tournaments` все еще требовал дополнительной страховки, поэтому был добавлен PHP fallback.

### Что осталось

- Проверить после свежего деплоя, что `/api/tournaments` возвращает не только `2026`, но и архивные сезоны.
- Если потребуется, добить уже не код, а продовую конфигурацию или кэш/окружение Railway.

### Файлы

- [lamp-api/app/Repositories/TournamentsRepository.php](/Users/kainarbaev_daniar/Downloads/последний эталон/lamp-api/app/Repositories/TournamentsRepository.php)
- [archive/legacy-tools/scripts/import-archive-tournaments.mjs](/Users/kainarbaev_daniar/Downloads/последний эталон/archive/legacy-tools/scripts/import-archive-tournaments.mjs)

### Коммиты

- `b459781` — Add archive tournaments to PHP API fallback

---

## 2026-04-19

### Что сделали

- Переключили Railway-контейнер на PHP-роутер.
- Исправляли запуск контейнера и конфигурацию рантайма.
- Архивировали старые Node migration tools и legacy Node Railway backend.

### Что проверили

- На этапе миграции были проблемы с Apache MPM, из-за чего контейнер падал.
- В результате текущий новый проект поднят в рабочем виде и отвечает через PHP.

### Что осталось

- Полностью дочистить следы перехода и убедиться, что все публичные данные читаются уже из новой схемы так, как ожидает фронт.

### Файлы

- [Dockerfile](/Users/kainarbaev_daniar/Downloads/последний эталон/Dockerfile)
- [lamp-api](/Users/kainarbaev_daniar/Downloads/последний эталон/lamp-api)
- [archive](/Users/kainarbaev_daniar/Downloads/последний эталон/archive)

### Коммиты

- `4913551` — Switch Railway container to PHP CLI router
- `35b028a` — Remove extra Apache MPM modules
- `483b3e9` — Force Apache prefork MPM
- `ea6362f` — Chown Railway uploads volume at startup
- `40c241d` — Add Railway PHP Docker container
- `4ff5afe` — Archive legacy Node migration tools
- `5d03da5` — Archive legacy Node Railway backend
