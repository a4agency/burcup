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

### Текущее состояние на сейчас

- Новый Railway-проект `BurCup` поднят и отвечает.
- Основной продовый сайт сейчас работает на:
  - `https://burcup-production.up.railway.app`
- PHP health-check отвечает корректно:
  - `https://burcup-production.up.railway.app/api/health`
  - подтвержденный ответ:
    - `{"ok":true,"runtime":"php","database":"mysql"}`
- Новый MySQL уже подключен к новому Railway-проекту.
- Volume для загрузок подключен и смонтирован.
- `api/tournaments` уже возвращает не только сезон `2026`, но и прошлые розыгрыши.
- Страницы сайта и основные API-ручки открываются.

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

### Текущий Railway-ландшафт

- Railway project:
  - `BurCup`
- App service:
  - `burcup`
- DB service:
  - `MySQL`
- Uploads volume:
  - `burcup-volume`
- Текущий проект должен быть независим от старого Railway-проекта.
- Если снова появятся сомнения по подключению:
  - сперва смотреть `api/health`
  - потом смотреть `api/tournaments`
  - потом сверять Variables у `burcup` и `MySQL`

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

### Непубличные данные, которые нельзя коммитить

- `ADMIN_PASSWORD`
- `ADMIN_TOKEN`
- Cloudinary keys
- Полные `MYSQL_URL` и `MYSQL_PUBLIC_URL`
- Пароли MySQL
- Любые session tokens, cookies и временные доступы

### Что можно безопасно записывать в журнал

- Названия сервисов и переменных
- Mount path volume
- Публичные URL сайта и API
- Имена файлов и папок
- Список уже переведенных PHP-ручек
- Порядок действий для восстановления

### Новая MySQL: схема подключения без секрета

- Engine:
  - `MySQL`
- Host:
  - `switchyard.proxy.rlwy.net`
- Port:
  - `37018`
- Database:
  - `railway`
- User:
  - `root`
- Пароль:
  - хранится только в Railway Variables, в журнал не записывается

### Что проверять первым делом, если снова что-то сломалось

1. Проверить Railway service `burcup`, что он `Online`.
2. Открыть:
   - `https://burcup-production.up.railway.app/api/health`
3. Открыть:
   - `https://burcup-production.up.railway.app/api/tournaments`
4. Открыть:
   - `https://burcup-production.up.railway.app/api/news`
   - `https://burcup-production.up.railway.app/api/matches`
   - `https://burcup-production.up.railway.app/api/clubs`
5. Если данные не совпадают:
   - сверить Variables у `burcup`
   - проверить, что `MYSQLHOST`, `MYSQLPORT`, `MYSQLDATABASE`, `MYSQLUSER`, `MYSQLPASSWORD` ведут на новую MySQL текущего проекта
6. Если пропали загрузки:
   - проверить mount path `/var/www/html/lamp-api/public/uploads`
7. Если не работает админка:
   - проверить `ADMIN_PASSWORD`
   - проверить `ADMIN_TOKEN`
   - проверить `CORS_ORIGIN`

### Где что лежит в коде

- Главный PHP API router:
  - `/Users/kainarbaev_daniar/Downloads/последний эталон/lamp-api/public/api/index.php`
- PHP-слой работы с БД и сущностями:
  - `/Users/kainarbaev_daniar/Downloads/последний эталон/lamp-api/app`
- Главный фронтовый JS:
  - `/Users/kainarbaev_daniar/Downloads/последний эталон/js/site.js`
- JS админки:
  - `/Users/kainarbaev_daniar/Downloads/последний эталон/js/admin.js`
- HTML админки:
  - `/Users/kainarbaev_daniar/Downloads/последний эталон/admin-almaz.html`
- Конфиг фронта:
  - `/Users/kainarbaev_daniar/Downloads/последний эталон/js/config.js`
- Dockerfile нового PHP runtime:
  - `/Users/kainarbaev_daniar/Downloads/последний эталон/Dockerfile`
- Архив старого кода и миграционных инструментов:
  - `/Users/kainarbaev_daniar/Downloads/последний эталон/archive`

### Что уже подтверждено руками

- `api/health` отвечает:
  - `{"ok":true,"runtime":"php","database":"mysql"}`
- `api/tournaments` отдает прошлые сезоны
- Страницы сайта открываются
- Новый Railway service стартует без старой Apache MPM ошибки
- Новый volume подключен
- Новый MySQL создан и подцеплен в новом Railway-проекте

### Важная оговорка по текущему runtime

- Сейчас API уже работает на `PHP + MySQL`.
- Но финальная цель для обычного LAMP-хостинга все еще требует доведения окружения до полностью классической схемы Apache/PHP/MySQL без Railway-специфичных допущений.
- Если работа продолжится в новом чате, это нужно держать как основной технический контекст.

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

### Подробная история LAMP / PHP / MySQL-переноса

- Исходная схема проекта:
  - статический фронт + старый Node backend + PostgreSQL
- Цель переноса:
  - уйти от Node/Express и PostgreSQL
  - подготовить проект под классический `LAMP`
  - перевести API и админку на `PHP + MySQL`
  - сделать проект переносимым на обычный shared/VPS LAMP-хостинг

#### Этап 1. Подготовка и изоляция legacy-кода

- Старые Node-инструменты и миграционные скрипты были вынесены в `archive/`.
- Старый Railway Node backend тоже был заархивирован, чтобы не мешал новому стеку.
- Ключевые коммиты этого этапа:
  - `5d03da5` — `Archive legacy Node Railway backend`
  - `4ff5afe` — `Archive legacy Node migration tools`

#### Этап 2. Появление нового PHP-контейнера

- В проект добавили новый Docker-контейнер под PHP.
- Базовая цель была такой:
  - фронт остается статическим
  - `/api/*` начинает обслуживать PHP
  - админка работает через PHP-ручки
- Ключевой коммит:
  - `40c241d` — `Add Railway PHP Docker container`

#### Этап 3. Переход на MySQL

- До этого проект уже логически мигрировали с PostgreSQL на MySQL.
- После этого PHP-слой начал работать через `pdo_mysql`.
- На этапе Railway был создан отдельный MySQL-сервис и позже еще один MySQL в новом проекте `BurCup`.
- Важный принцип:
  - в журнале не храним пароли или полные connection string
  - храним только схему, названия переменных и публичные точки проверки

#### Этап 4. Попытка поднять классический Apache/PHP runtime

- На одном из этапов контейнер пытались привести к более “настоящему” LAMP-варианту через Apache.
- Для Apache отдельно:
  - включали `rewrite`, `headers`
  - пробовали форсировать `prefork`
  - отключать лишние MPM-модули
- Ключевые коммиты:
  - `483b3e9` — `Force Apache prefork MPM`
  - `35b028a` — `Remove extra Apache MPM modules`

#### Этап 5. Проблема с Apache MPM

- Один из главных сбоев миграции:
  - Railway сервис падал с ошибкой:
    - `AH00534: apache2: Configuration error: More than one MPM loaded.`
- Это была важная поворотная точка:
  - стало понятно, что текущую Apache-конфигурацию в Railway надо упрощать
  - и что для быстрого запуска лучше временно уйти на PHP router/dev-server
- Этот блок особенно важно помнить, если кто-то потом снова попытается резко вернуть Apache-конфиг без аккуратной проверки модулей.

#### Этап 6. Временная стабилизация через PHP CLI router

- После проблем с Apache контейнер перевели на более стабильный временный runtime:
  - PHP CLI/router
- Это позволило быстро оживить API и сайт:
  - health начал отвечать
  - `/api/*` снова заработал
  - фронт снова увидел данные
- Ключевой коммит:
  - `4913551` — `Switch Railway container to PHP CLI router`

#### Этап 7. Uploads и volume

- Для загрузок был подключен отдельный Railway volume.
- Mount path:
  - `/var/www/html/lamp-api/public/uploads`
- Отдельно чинили права и поведение директории при старте контейнера.
- Ключевой коммит:
  - `ea6362f` — `Chown Railway uploads volume at startup`

#### Этап 8. Новый Railway-проект `BurCup`

- Позже был создан уже отдельный новый Railway project:
  - `BurCup`
- Цель:
  - перестать зависеть от старого проекта
  - держать новый PHP/MySQL-стек отдельно
- В новом проекте были подняты:
  - `burcup`
  - `MySQL`
  - `burcup-volume`

#### Этап 9. Подключение новой MySQL в новом проекте

- В новом Railway project пользователь создал новый MySQL.
- После этого сервис `burcup` был перенастроен на новую базу.
- Подтверждение корректного подключения:
  - `https://burcup-production.up.railway.app/api/health`
  - возвращает:
    - `{"ok":true,"runtime":"php","database":"mysql"}`
- Также отдельно было подтверждено, что:
  - `api/tournaments` снова показывает прошлые сезоны

#### Этап 10. Текущее состояние

- Сейчас проект уже работает на:
  - фронт сайта
  - PHP API
  - MySQL
  - volume для uploads
- То есть практический переход уже сделан.
- Но с точки зрения “идеального LAMP-финиша” еще остается:
  - довести runtime до действительно классического Apache/PHP режима под обычный LAMP-хостинг
  - финально убрать зависимость от Railway-специфичных допущений

### Ключевые контрольные коммиты по истории переноса

- `5d03da5` — архивировали legacy Railway Node backend
- `4ff5afe` — архивировали legacy Node migration tools
- `40c241d` — добавили новый Railway PHP Docker container
- `ea6362f` — починили права volume uploads
- `483b3e9` — пробовали форсировать Apache prefork MPM
- `35b028a` — убирали лишние Apache MPM modules
- `4913551` — переключили Railway container на PHP CLI router
- `b459781` — добили прошлые турниры в PHP API fallback
- `a2e2ac0` — создали журнал проекта
- `a107eca` — расширили карту подключений и рабочий контекст
- `06da80a` — зафиксировали статус PHP-переноса и LAMP TODO
- `973b49c` — сделали журнал самодостаточной recovery-точкой

### Важные выводы из истории переноса

- Главная техническая победа уже достигнута:
  - сайт отвечает через PHP API
  - база уже MySQL
- Самая болезненная часть миграции была связана именно с Apache runtime и MPM-модулями, а не с самим PHP-кодом.
- Самый надежный текущий ориентир:
  - если `api/health` отвечает `php/mysql`, значит основа уже жива.
- Если в новом чате нужно будет продолжать перенос, не надо снова спорить, нужен ли PHP:
  - решение уже принято
  - проект целенаправленно идет в сторону LAMP-совместимости

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

### Как продолжать работу в новом чате

1. Открыть и прочитать `WORKLOG.md`.
2. Проверить `api/health`.
3. Проверить `api/tournaments`.
4. Если оба ответа корректные, продолжать следующую задачу без восстановления полного чата.
5. Если ответы не совпадают, сперва сверять:
   - Railway Variables у `burcup`
   - Railway Variables у `MySQL`
   - mount path volume
   - публичные API-URL, к которым подключен фронт

---

## 2026-04-20 02:05

### Что сделали

- Расширили `WORKLOG.md` до формата полноценной recovery-точки.
- Добавили текущее состояние нового Railway-проекта, новой MySQL и volume.
- Добавили пошаговый чек-лист быстрой диагностики и восстановления.
- Зафиксировали безопасную схему подключения к новой MySQL без записи секрета в репозиторий.
- Добавили карту ключевых файлов, публичных URL и текущих подтвержденных проверок.

### Что проверили

- Новый production health отвечает через PHP + MySQL.
- Новый Railway service `burcup` работает в новом проекте.
- Новый MySQL создан и подключен на уровне переменных окружения.
- `api/tournaments` отдает прошлые сезоны.

### Что осталось

- После каждого следующего шага дополнять журнал новой записью сверху.
- Если будут изменения по деплою, базе, volume или runtime, сразу отражать их в этом файле.

### Файлы

- [WORKLOG.md](/Users/kainarbaev_daniar/Downloads/последний эталон/WORKLOG.md)

### Коммиты

- Будет отдельный коммит после обновления журнала.

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
