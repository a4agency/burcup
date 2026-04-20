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
- Ожидаемый ответ health:
  - `{"ok":true,"runtime":"php","database":"mysql"}`

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

### Если чат пропадет

Продолжать нужно с проверки:

1. Railway service `burcup`
2. `https://burcup-production.up.railway.app/api/health`
3. `https://burcup-production.up.railway.app/api/tournaments`
4. содержимого этого файла

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
