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

## 2026-04-26 01:20

### Что сделали

- Добавили clean URLs без `.html` через Apache rewrite rules.
- Обновили клиентскую логику определения текущей страницы, чтобы активное меню
  и компактный заголовок работали и на адресах вроде `/about-lev-burchalkin`.

### Что проверили

- Логика `getCurrentPageFile()` в `js/site.js` теперь нормализует extensionless
  пути обратно в виртуальные имена страниц.

### Что осталось

- Проверить редиректы и навигацию на Timeweb и Railway после замены
  `.htaccess` и `js/site.js`.

### Файлы

- [/.htaccess](/Users/kainarbaev_daniar/Downloads/последнии%E2%80%8B%20эталон/.htaccess)
- [js/site.js](/Users/kainarbaev_daniar/Downloads/последнии%E2%80%8B%20эталон/js/site.js)
- [WORKLOG.md](/Users/kainarbaev_daniar/Downloads/последнии%E2%80%8B%20этالон/WORKLOG.md)

### Коммиты

- Будет добавлен после финальной проверки.

---

## 2026-04-26 01:05

### Что сделали

- Перепроверили страницу `about-lev-burchalkin.html` на английском режиме и
  подчистили несколько слишком буквальных переводов.
- Уточнили заголовки и подписи для биографических блоков, фактов и
  вступительного описания.
- Добавили недостающий перевод заголовка `Начало большого футбола` и сделали
  несколько подписей к статам более естественными для английской версии.

### Что проверили

- Синтаксис `js/i18n.js` без ошибок.
- Логика перевода на странице о Льве Бурчалкине осталась на словаре `exactMap`,
  без вмешательства в авто-перевод и без влияния на другие страницы.

### Что осталось

- Проверить английскую версию страницы после замены `js/i18n.js` на Timeweb и
  Railway.

### Файлы

- [js/i18n.js](/Users/kainarbaev_daniar/Downloads/последнии%E2%80%8B%20эталон/js/i18n.js)
- [WORKLOG.md](/Users/kainarbaev_daniar/Downloads/последнии%E2%80%8B%20эталон/WORKLOG.md)

### Коммиты

- Будет добавлен после финальной проверки.

## 2026-04-26 00:55

### Что сделали

- Уточнили англоязычные формулировки для страницы о Льве Бурчалкине.
- Исправили перевод заголовка `Легенда ленинградского футбола` на более
  естественный вариант `The Legend of Leningrad Football`.
- Исправили перевод `Фотографии Льва Бурчалкина` на `Photos of Lev Burchalkin`.

### Что проверили

- Правки затронули только `exactMap` в `js/i18n.js`.
- Остальной перевод не менялся.

### Что осталось

- Проверить обновление на английской версии страницы после замены `js/i18n.js`
  на Timeweb и Railway.

### Файлы

- [js/i18n.js](/Users/kainarbaev_daniar/Downloads/последнии%E2%80%8B%20эталон/js/i18n.js)
- [WORKLOG.md](/Users/kainarbaev_daniar/Downloads/последнии%E2%80%8B%20эталон/WORKLOG.md)

### Коммиты

- Будет добавлен после финальной проверки.

### Что сделали

- Дополнили перевод страницы о Льве Бурчалкине ещё двумя заголовками:
  - `Форвард «Зенита» и сборной` → `Zenit and USSR national team forward`
  - `Тренерский путь` → `Coaching Career`

### Что проверили

- Перевод по-прежнему идёт через `exactMap` в `js/i18n.js`.
- Изменения не затрагивают другие страницы и API.

### Что осталось

- Проверить страницу `about-lev-burchalkin.html` в английском режиме после
  обновления `js/i18n.js`.

### Файлы

- [js/i18n.js](/Users/kainarbaev_daniar/Downloads/последнии%E2%80%8B%20эталон/js/i18n.js)
- [WORKLOG.md](/Users/kainarbaev_daniar/Downloads/последнии%E2%80%8B%20эталон/WORKLOG.md)

### Коммиты

- Будет добавлен после финальной проверки.

## 2026-04-26 00:40

### Что сделали

- Ускорили английский автоперевод страниц: теперь `js/i18n.js` отправляет
  несколько пачек текста параллельно, а не ждёт по одной.
- Подняли число одновременных пачек перевода, чтобы длинные страницы успевали
  набрать кэш заметно быстрее при первом открытии.
- Оставили защиту от сбоев сервера перевода: если какая-то пачка падает, она
  возвращается в очередь, а не ломает весь проход.

### Что проверили

- Синтаксис `js/i18n.js` без ошибок.
- Локальная логика перевода теперь должна заметно быстрее наполнять кэш на
  длинных страницах, где раньше ждали несколько минут.
- Новые англоязычные страницы должны проходить первый автоперевод быстрее,
  потому что кэш наполняется более агрессивно.

### Что осталось

- Проверить скорость на Timeweb после обновления `js/i18n.js`.
- Если на странице остались старые частичные переводы, сбросить
  `bc_lang_auto_cache_v1` и `bc_lang` в `localStorage`.

### Файлы

- [js/i18n.js](/Users/kainarbaev_daniar/Downloads/последнии%E2%80%8B%20эталон/js/i18n.js)
- [WORKLOG.md](/Users/kainarbaev_daniar/Downloads/последнии%E2%80%8B%20этالон/WORKLOG.md)

### Коммиты

- Будет добавлен после финальной проверки.

## 2026-04-25 00:10

### Что сделали

- Уточнили правило для новостных изображений: из `body_html` теперь удаляется
  только картинка-обложка, а остальные inline-фото остаются на странице.
- Сохранили отдельный featured-cover сверху и оставили галерею/inline-контент
  без лишнего агрессивного вырезания.

### Что проверили

- Новость с несколькими иллюстрациями больше не теряет дополнительные body
  изображения.
- При этом обложка и её дубликат по-прежнему схлопываются в один экземпляр.

### Что осталось

- Протестировать это на Timeweb после обновления `js/site.js`.

### Файлы

- [js/site.js](/Users/kainarbaev_daniar/Downloads/последнии%E2%80%8B%20эталон/js/site.js)
- [WORKLOG.md](/Users/kainarbaev_daniar/Downloads/последнии%E2%80%8B%20эталон/WORKLOG.md)

### Коммиты

- Будет отдельный коммит после финальной проверки.

### Что сделали

- Сменили сравнение новостных картинок на более умное: теперь дубликаты
  вычисляются не только по точному URL, но и по нормализованному ключу файла.
- Оставили в тексте только те картинки, которые не совпадают с cover/gallery
  по ключу, чтобы уникальные изображения не пропадали.

### Что проверили

- `schedule`-новость со схожими путями к одному и тому же файлу схлопывается в
  одно изображение.
- У новостей с body-картинками, имеющими другой ключ, изображения остаются в
  тексте.

### Что осталось

- Проверить новую логику на Timeweb после обновления `js/site.js`.

### Файлы

- [js/site.js](/Users/kainarbaev_daniar/Downloads/последнии%E2%80%8B%20эталон/js/site.js)
- [WORKLOG.md](/Users/kainarbaev_daniar/Downloads/последнии%E2%80%8B%20эталон/WORKLOG.md)

### Коммиты

- Будет отдельный коммит после финальной проверки.

## 2026-04-25 00:20

### Что сделали

- Перевели галерею новостей в одноколоночный full-width формат, чтобы
  дополнительные фото выглядели как полноценные иллюстрации, а не как
  маленькие плитки.
- Сохранили крупную featured-обложку сверху и очистку `body_html` от
  повторяющихся встроенных картинок.

### Что проверили

- У статьи теперь остаётся крупная обложка и отдельные фото ниже, без
  двухколоночной “миниатюрной” раскладки.

### Что осталось

- Проверить страницу новости после обновления файлов на Timeweb и Railway.

### Файлы

- [js/site.js](/Users/kainarbaev_daniar/Downloads/последнии%E2%80%8B%20эталон/js/site.js)
- [css/style.css](/Users/kainarbaev_daniar/Downloads/последнии%E2%80%8B%20эталон/css/style.css)
- [WORKLOG.md](/Users/kainarbaev_daniar/Downloads/последнии%E2%80%8B%20эталон/WORKLOG.md)

### Коммиты

- Будет отдельный коммит после финальной проверки.

## 2026-04-24 03:25

### Что сделали

- Вернули крупный featured-формат для фото новости на странице статьи.
- Оставили очистку body от встроенных изображений, чтобы не было тройных
  дублей.
- Для единственного фото в галерее сделали full-width отображение, чтобы оно
  больше не выглядело как маленькая плитка.

### Что проверили

- Логика рендера статьи теперь снова показывает cover, если он не продублирован
  в body.
- Галерея для одного фото больше не сжимается в две колонки.

### Что осталось

- Проверить обновлённую версию на Railway и Timeweb после выкладки `main`.

### Файлы

- [js/site.js](/Users/kainarbaev_daniar/Downloads/последнии%E2%80%8B%20эталон/js/site.js)
- [css/style.css](/Users/kainarbaev_daniar/Downloads/последнии%E2%80%8B%20эталон/css/style.css)
- [WORKLOG.md](/Users/kainarbaev_daniar/Downloads/последнии%E2%80%8B%20эталон/WORKLOG.md)

### Коммиты

- Будет отдельный коммит после финальной проверки.

## 2026-04-24 02:00

### Что сделали

- Добавили глобальный флаг `photo_reports_enabled` для текущего турнира, чтобы
  скрывать и снова показывать раздел «Фоторепортажи» на главной странице и на
  странице «Медиа».
- Перевели админский раздел `media` на отдельный ресурс `api/admin/media`, где
  теперь редактируются и главный матч, и видимость фоторепортажей.
- Обновили фронтенд так, чтобы скрытый раздел не рендерился вообще, а не
  просто показывал пустые карточки.
- Синхронизировали MySQL-схему, резервные дампы и инструкцию для Timeweb.
- Добавили runtime-fallback: если в старой базе ещё нет колонки
  `photo_reports_enabled`, API попытается добавить её сам при сохранении
  медианастроек, а чтение будет работать с безопасным значением по умолчанию.

### Что проверили

- `php -l` прошёл для:
  - `lamp-api/app/Controllers/AdminController.php`
  - `lamp-api/app/Repositories/AdminMutationsRepository.php`
  - `lamp-api/app/Repositories/TournamentsRepository.php`
  - `lamp-api/app/Support.php`
- `node --check` прошёл для:
  - `js/admin.js`
  - `js/site.js`

### Что осталось

- На текущем Timeweb-аккаунте SQL-миграция для `photo_reports_enabled` уже была
  применена вручную через phpMyAdmin.
- Локальный файл
  [`database/mysql-add-media-photo-reports-flag.sql`](/Users/kainarbaev_daniar/Downloads/последнии%E2%80%8B%20эталон/database/mysql-add-media-photo-reports-flag.sql)
  теперь приведён к рабочему варианту без `IF NOT EXISTS` в `ALTER TABLE`.
- После синхронизации файлов стоит проверить админку и скрытие блока на главной
  и на странице «Медиа».

### Файлы

- [js/admin.js](/Users/kainarbaev_daniar/Downloads/последнии%E2%80%8B%20эталон/js/admin.js)
- [js/site.js](/Users/kainarbaev_daniar/Downloads/последнии%E2%80%8B%20эталон/js/site.js)
- [lamp-api/app/Controllers/AdminController.php](/Users/kainarbaev_daniar/Downloads/последнии%E2%80%8B%20эталон/lamp-api/app/Controllers/AdminController.php)
- [lamp-api/app/Repositories/AdminMutationsRepository.php](/Users/kainarbaev_daniar/Downloads/последнии%E2%80%8B%20эталон/lamp-api/app/Repositories/AdminMutationsRepository.php)
- [lamp-api/app/Repositories/TournamentsRepository.php](/Users/kainarbaev_daniar/Downloads/последнии%E2%80%8B%20эталон/lamp-api/app/Repositories/TournamentsRepository.php)
- [lamp-api/app/Support.php](/Users/kainarbaev_daniar/Downloads/последнии%E2%80%8B%20эталон/lamp-api/app/Support.php)
- [database/mysql-schema.sql](/Users/kainarbaev_daniar/Downloads/последнии%E2%80%8B%20эталон/database/mysql-schema.sql)
- [database/mysql-add-media-photo-reports-flag.sql](/Users/kainarbaev_daniar/Downloads/последнии%E2%80%8B%20эталон/database/mysql-add-media-photo-reports-flag.sql)
- [database/README.md](/Users/kainarbaev_daniar/Downloads/последнии%E2%80%8B%20эталон/database/README.md)
- [TIMEWEB-TRANSFER.md](/Users/kainarbaev_daniar/Downloads/последнии%E2%80%8B%20эталон/TIMEWEB-TRANSFER.md)
- [burcup_dump.sql](/Users/kainarbaev_daniar/Downloads/последнии%E2%80%8B%20эталон/burcup_dump.sql)
- [burcup_dump_timeweb.sql](/Users/kainarbaev_daniar/Downloads/последнии%E2%80%8B%20эталон/burcup_dump_timeweb.sql)
- [WORKLOG.md](/Users/kainarbaev_daniar/Downloads/последнии%E2%80%8B%20эталон/WORKLOG.md)

### Коммиты

- Будет отдельный коммит после финальной проверки и прогонки на сайте.

---

## 2026-04-24 02:40

### Что сделали

- Добавили постраничный показ новостей на странице `news.html`: теперь блок
  показывает по 9 карточек и даёт листать страницы назад и вперёд.
- Перевели фронтенд новостей на запросы с `limit` и `page/per_page`, чтобы не
  тянуть весь список новостей, когда это не нужно.
- Добавили постраничный просмотр новостей и в админке, при этом черновик
  сохраняет весь список новостей, чтобы кнопка «Сохранить» не теряла записи за
  пределами текущей страницы.

### Что проверили

- `php -l` прошёл для:
  - `lamp-api/app/Repositories/NewsRepository.php`
  - `lamp-api/public/api/index.php`
- `node --check` прошёл для:
  - `js/site.js`
  - `js/admin.js`

### Файлы

- [js/admin.js](/Users/kainarbaev_daniar/Downloads/последнии%E2%80%8B%20эталон/js/admin.js)
- [js/site.js](/Users/kainarbaev_daniar/Downloads/последнии%E2%80%8B%20эталон/js/site.js)
- [lamp-api/app/Repositories/NewsRepository.php](/Users/kainarbaev_daniar/Downloads/последнии%E2%80%8B%20эталон/lamp-api/app/Repositories/NewsRepository.php)
- [lamp-api/public/api/index.php](/Users/kainarbaev_daniar/Downloads/последнии%E2%80%8B%20эталон/lamp-api/public/api/index.php)
- [css/style.css](/Users/kainarbaev_daniar/Downloads/последнии%E2%80%8B%20эталон/css/style.css)
- [news.html](/Users/kainarbaev_daniar/Downloads/последнии%E2%80%8B%20эталон/news.html)

### Коммиты

- Будет отдельный коммит после финальной проверки на странице новостей и в
  админке.

---

## 2026-04-24 03:10

### Что сделали

- Перевели сортировку новостей на `created_at DESC`, чтобы новые публикации
  появлялись в начале списка на сайте и в админке.
- Сделали добавление новой новости в админке через `unshift`, чтобы свежая
  запись сразу вставала первой в черновике, а не терялась в конце страницы.
- Усилили это поведение: публичная страница теперь сама сортирует полный список
  новостей по дате публикации перед пагинацией, а админка применяет тот же
  порядок при загрузке и сохранении. `created_at` оставили только как
  запасной источник, если у старой записи пустая дата.
- Привели превью новостей в админке к общему image-helper, чтобы локальные
  upload-URL и fallback-изображения отображались стабильнее сразу после загрузки.

### Что проверили

- `php -l` для новостей и API-роута уже был пройден ранее и изменений в
  синтаксисе после этого не появилось.
- `node --check` для `js/admin.js` и `js/site.js` остаётся чистым после
  правок.

### Файлы

- [js/admin.js](/Users/kainarbaev_daniar/Downloads/последнии%E2%80%8B%20эталон/js/admin.js)
- [lamp-api/app/Repositories/NewsRepository.php](/Users/kainarbaev_daniar/Downloads/последнии%E2%80%8B%20эталон/lamp-api/app/Repositories/NewsRepository.php)

### Коммиты

- Будет отдельный коммит после финальной проверки сортировки на сайте и в
  админке.

---

## 2026-04-24 01:30

### Что сделали

- Переписали `TIMEWEB-TRANSFER.md` под более простой сценарий:
  - не создавать новые файлы вручную
  - открыть уже существующие файлы в проекте
  - править только значения внутри них
- Особо подчеркнули, что `config.local.php` уже должен лежать в проекте и его
  нужно просто редактировать.

### Что проверили

- Инструкция теперь говорит простыми действиями:
  - загрузить сайт
  - открыть существующий `config.local.php`
  - изменить данные
  - проверить три URL
- `.htaccess` и папка `uploads` описаны как уже существующие элементы,
  которые нужно сохранять на месте.

### Что осталось

- Если файл `config.local.php` когда-нибудь потеряется, его можно будет
  восстановить из `config.local.example.php`.

### Файлы

- [TIMEWEB-TRANSFER.md](/Users/kainarbaev_daniar/Downloads/последнии%E2%80%8B%20эталон/TIMEWEB-TRANSFER.md)
- [WORKLOG.md](/Users/kainarbaev_daniar/Downloads/последнии%E2%80%8B%20эталон/WORKLOG.md)

### Коммиты

- Будет отдельный коммит после следующей проверки.

---

## 2026-04-24 01:20

### Что сделали

- Обновили `TIMEWEB-TRANSFER.md` под неразработчика:
  - добавили короткую версию “как включить сайт”
  - выписали, какие значения нужно взять из Timeweb
  - отдельно пояснили, что передавать новому владельцу аккаунта
- Убрали из инструкции реальный пароль базы и заменили его на безопасное
  пояснение, чтобы в документации не светить секреты.
- Документ теперь можно использовать как пошаговую инструкцию без знания
  кода.

### Что проверили

- Инструкция начинается с простых действий:
  - загрузить файлы
  - создать БД
  - заполнить `config.local.php`
  - проверить три URL
- Явно перечислены данные, которые нужны для активации сайта:
  - DB host/name/user/password
  - домен

### Что осталось

- Если понадобится, можно ещё сделать совсем короткую чек-лист-версию на одну
  страницу для человека, который вообще не хочет читать технические детали.

### Файлы

- [TIMEWEB-TRANSFER.md](/Users/kainarbaev_daniar/Downloads/последнии%E2%80%8B%20эталон/TIMEWEB-TRANSFER.md)
- [WORKLOG.md](/Users/kainarbaev_daniar/Downloads/последнии%E2%80%8B%20эталон/WORKLOG.md)

### Коммиты

- Будет отдельный коммит после следующей проверки.

---

## 2026-04-24 01:10

### Что сделали

- Написали отдельную инструкцию для Timeweb-переноса:
  - `TIMEWEB-TRANSFER.md`
- В ней зафиксировали:
  - первый запуск сайта на Timeweb
  - перенос сайта в другой Timeweb-аккаунт
  - какие значения меняются в `config.local.php`
  - какие файлы и пути остаются одинаковыми
- Связали новую инструкцию с общим двуххостовым playbook:
  - `DEPLOYMENT.md`

### Что проверили

- Инструкция покрывает оба сценария:
  - новый Timeweb-аккаунт
  - повторный перенос на другой аккаунт
- Описаны именно те данные, которые реально меняются:
  - DB host/name/user/password
  - `CORS_ORIGIN`
  - admin secrets при необходимости

### Что осталось

- При следующем переносе достаточно будет обновить:
  - `public_html/lamp-api/config.local.php`
  - `public_html/lamp-api/public/uploads/`
  - домен в панели Timeweb

### Файлы

- [TIMEWEB-TRANSFER.md](/Users/kainarbaev_daniar/Downloads/последнии%E2%80%8B%20эталон/TIMEWEB-TRANSFER.md)
- [DEPLOYMENT.md](/Users/kainarbaev_daniar/Downloads/последнии%E2%80%8B%20эталон/DEPLOYMENT.md)
- [WORKLOG.md](/Users/kainarbaev_daniar/Downloads/последнии%E2%80%8B%20эталон/WORKLOG.md)

### Коммиты

- Будет отдельный коммит после проверки новых инструкций.

---

## 2026-04-24 01:00

### Что сделали

- Зафиксировали рабочую схему для двух живых таргетов:
  - Railway остаётся Docker-целевым деплоем
  - Timeweb остаётся shared-hosting-целевым деплоем
- Добавили единый playbook:
  - `DEPLOYMENT.md`
- Связали этот playbook с текущими инструкциями:
  - `LAMP-HOSTING.md`
  - `lamp-api/README.md`

### Что проверили

- Схема остаётся совместимой с текущими файлами проекта.
- Для следующего backend-изменения теперь есть понятный порядок:
  - обновить локальные файлы
  - записать шаг в `WORKLOG.md`
  - прогнать синтаксис
  - отразить изменения на Railway и Timeweb

### Что осталось

- Для новых задач продолжать держать Railway и Timeweb в одной логической ветке
  и не терять два отдельных сценария публикации.

### Файлы

- [DEPLOYMENT.md](/Users/kainarbaev_daniar/Downloads/последнии%E2%80%8B%20эталон/DEPLOYMENT.md)
- [LAMP-HOSTING.md](/Users/kainarbaev_daniar/Downloads/последнии%E2%80%8B%20эталон/LAMP-HOSTING.md)
- [lamp-api/README.md](/Users/kainarbaev_daniar/Downloads/последнии%E2%80%8B%20эталон/lamp-api/README.md)
- [WORKLOG.md](/Users/kainarbaev_daniar/Downloads/последнии%E2%80%8B%20эталон/WORKLOG.md)

### Коммиты

- Будет отдельный коммит после проверки новых документов.

---

## 2026-04-24 00:50

### Что сделали

- Довели Timeweb LAMP-подключение до полностью рабочего состояния:
  - `lamp-api/diag.php` подтвердил, что `config.local.php` читается
  - `lamp-api/app/bootstrap.php` теперь корректно подставляет значения из
    локального конфига даже при пустых env-переменных
  - `https://cu927919.tw1.ru/api/health` начал отвечать JSON-данными
- Подтвердили, что новая Timeweb MySQL доступна:
  - `DB_HOST=localhost`
  - `DB_NAME=cu927919_123`
  - `DB_USER=cu927919_123`
  - `PDO: connected`
- Проверили состав данных:
  - `tournaments_count = 6`
  - preview включает `burchalkin-cup-2026`, `2025`, `2024`, `2023`, `2019`, `2018`

### Что проверили

- Корневой `diag.php` работает на Timeweb.
- `lamp-api/diag.php` показывает заполненные DB-переменные и успешный PDO.
- `/api/health` возвращает валидный JSON, а не пустой 500.

### Что осталось

- После финальной проверки можно удалить временные диагностические файлы с
  продакшена:
  - `public_html/diag.php`
  - `public_html/lamp-api/diag.php`
- При желании можно также убрать `api_build`-логику или оставить её как
  постоянный health-маркер.

### Файлы

- [WORKLOG.md](/Users/kainarbaev_daniar/Downloads/последнии%E2%80%8B%20эталон/WORKLOG.md)
- [lamp-api/app/bootstrap.php](/Users/kainarbaev_daniar/Downloads/последнии%E2%80%8B%20эталон/lamp-api/app/bootstrap.php)
- [lamp-api/diag.php](/Users/kainarbaev_daniar/Downloads/последнии%E2%80%8B%20эталон/lamp-api/diag.php)
- [lamp-api/public/api/index.php](/Users/kainarbaev_daniar/Downloads/последнии%E2%80%8B%20эталон/lamp-api/public/api/index.php)

### Коммиты

- Будет отдельный коммит после финальной уборки диагностических файлов.

---

## 2026-04-24 00:40

### Что сделали

- Исправили логику `lamp-api/app/bootstrap.php`:
  - локальный `config.local.php` теперь подставляется даже если на хостинге
    уже присутствуют пустые env-значения
  - реальные непустые env-переменные по-прежнему сохраняют приоритет

### Что проверили

- На Timeweb `lamp-api/diag.php` показывает, что `config.local.php` существует
  и читается как массив.
- При этом `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER` оставались пустыми, что
  и подсказало проблему: fallback не должен был пропускать пустые значения.

### Что осталось

- Перезалить обновлённый [lamp-api/app/bootstrap.php](/Users/kainarbaev_daniar/Downloads/последнии%E2%80%8B%20эталон/lamp-api/app/bootstrap.php) на Timeweb.
- Снова открыть `lamp-api/diag.php` и проверить, появились ли DB-значения.

### Файлы

- [lamp-api/app/bootstrap.php](/Users/kainarbaev_daniar/Downloads/последнии%E2%80%8B%20эталон/lamp-api/app/bootstrap.php)
- [WORKLOG.md](/Users/kainarbaev_daniar/Downloads/последнии%E2%80%8B%20эталон/WORKLOG.md)

### Коммиты

- Будет отдельный коммит после следующей проверки.

---

## 2026-04-24 00:30

### Что сделали

- Усилили локальную диагностику Timeweb:
  - `lamp-api/diag.php` теперь проверяет наличие и читаемость
    `lamp-api/config.local.php`
  - диагностический файл показывает, что именно возвращает local config
- Это поможет отделить проблему пути/прав/содержимого `config.local.php` от
  проблемы MySQL-подключения.

### Что проверили

- Корневой `diag.php` подтверждает, что PHP исполняется.
- `lamp-api/diag.php` на сервере пока показывает пустые DB-переменные, значит
  local config либо не читается, либо не отдаёт значения в текущем виде.

### Что осталось

- Прогнать обновлённый `lamp-api/diag.php` на Timeweb и посмотреть:
  - существует ли `config.local.php`
  - читается ли он
  - что он возвращает
- После этого уже можно будет точно сказать, что править дальше.

### Файлы

- [lamp-api/diag.php](/Users/kainarbaev_daniar/Downloads/последний%20эталон/lamp-api/diag.php)
- [WORKLOG.md](/Users/kainarbaev_daniar/Downloads/последний%20эталон/WORKLOG.md)

### Коммиты

- Будет отдельный коммит после следующей проверки.

---

## 2026-04-24 00:20

### Что сделали

- Зафиксировали рабочее правило для дальнейшей синхронной работы:
  - все новые изменения сразу вносим в локальные файлы проекта
  - каждый заметный шаг сразу записываем в `WORKLOG.md`
  - диагностические файлы и временные проверки тоже держим в проекте как
    актуальные резервные копии
- Подготовили локальные диагностические копии для Timeweb:
  - `diag.php`
  - `lamp-api/diag.php`
- Продолжаем отладку Timeweb-подключения уже с сохранением всех шагов в логах.

### Что проверили

- Корневой `diag.php` на Timeweb подтверждает, что PHP исполняется.
- Нужен отдельный `lamp-api/diag.php`, чтобы увидеть `config.local.php` и
  точную DB-ошибку без участия API-роутинга.

### Что осталось

- Довести `lamp-api/diag.php` на сервере до успешного ответа.
- После подтверждения подключения убрать временные диагностические файлы с
  продакшена.

### Файлы

- [WORKLOG.md](/Users/kainarbaev_daniar/Downloads/последний%20эталон/WORKLOG.md)
- [diag.php](/Users/kainarbaev_daniar/Downloads/последний%20эталон/diag.php)
- [lamp-api/diag.php](/Users/kainarbaev_daniar/Downloads/последний%20эталон/lamp-api/diag.php)

### Коммиты

- Будет отдельный коммит после следующего этапа проверки.

---

## 2026-04-24 00:00

### Что сделали

- Добавили fallback для классического shared hosting в PHP-слой:
  - теперь `lamp-api/app/bootstrap.php` автоматически подхватывает
    `lamp-api/config.local.php`, если файл есть
  - локальный конфиг можно хранить отдельно от репозитория и не зависеть от
    постоянных env-переменных на хостинге
- Подготовили шаблон локальной конфигурации:
  - `lamp-api/config.local.example.php`
- Обновили инструкции для LAMP/Apache и README PHP-слоя:
  - описали копирование шаблона в `config.local.php`
  - уточнили, что это работает как удобный fallback для shared hosting
- Добавили `lamp-api/config.local.php` в `.gitignore`, чтобы рабочие секреты не
  попадали в репозиторий.

### Что проверили

- Логика загрузки локального конфига осталась совместимой с текущими env-значениями:
  - реальные переменные окружения не перезаписываются
  - если локального файла нет, поведение не меняется

### Что осталось

- После этого шага стоит прогнать синтаксическую проверку PHP-файлов и затем
  уже можно паковать изменения в коммит.

### Файлы

- [lamp-api/app/bootstrap.php](/Users/kainarbaev_daniar/Downloads/последний%20эталон/lamp-api/app/bootstrap.php)
- [lamp-api/config.local.example.php](/Users/kainarbaev_daniar/Downloads/последний%20эталон/lamp-api/config.local.example.php)
- [.gitignore](/Users/kainarbaev_daniar/Downloads/последний%20эталон/.gitignore)
- [LAMP-HOSTING.md](/Users/kainarbaev_daniar/Downloads/последний%20эталон/LAMP-HOSTING.md)
- [lamp-api/README.md](/Users/kainarbaev_daniar/Downloads/последний%20эталон/lamp-api/README.md)
- [WORKLOG.md](/Users/kainarbaev_daniar/Downloads/последний%20эталон/WORKLOG.md)

### Коммиты

- Будет отдельный коммит после проверки.

---

## 2026-04-23 12:40

### Что сделали

- Продолжили перевод проекта на полностью независимую новую Railway MySQL внутри нового проекта BurCup.
- Поверх новой базы повторно прогнали идемпотентный архивный импорт:
  - [archive/legacy-tools/scripts/import-archive-details.mjs](/Users/kainarbaev_daniar/Downloads/последний%20эталон/archive/legacy-tools/scripts/import-archive-details.mjs)
- Импорт повторно обновил архивные розыгрыши:
  - 2025
  - 2024
  - 2023
  - 2019
  - 2018
- Подтвердили, что архивные данные теперь лежат в новой MySQL нового проекта, а не только в старой связке.

### Что проверили

- Прямой запрос к новой MySQL нового проекта показал итоговые счетчики:
  - `tournaments: 6`
  - `clubs: 26`
  - `tournament_clubs: 48`
  - `tournament_standings: 48`
  - `tournament_playoff_matches: 40`
  - `matches: 84`
  - `news_articles: 250`
  - `media_albums: 3`
  - `partners: 22`
  - `site_pages: 1`
- Проверили наполнение по сезонам:
  - `2026`: clubs `8`, standings `8`, playoff `8`, matches `8`
  - `2025`: clubs `8`, standings `8`, playoff `8`, matches `20`
  - `2024`: clubs `8`, standings `8`, playoff `8`, matches `20`
  - `2023`: clubs `8`, standings `8`, playoff `0`, matches `12`
  - `2019`: clubs `8`, standings `8`, playoff `8`, matches `12`
  - `2018`: clubs `8`, standings `8`, playoff `8`, matches `12`
- Пользовательский `health` на production уже показывает PHP + MySQL и шесть турниров в preview.
- Важно: локальный `curl` до `https://burcup-production.up.railway.app/api/...` из текущей среды по-прежнему иногда возвращает Railway `Application not found`, поэтому опираемся на browser-проверку пользователя и прямую проверку новой MySQL.

### Что осталось

- Добить оставшиеся рабочие сценарии LAMP-переноса уже поверх новой независимой MySQL:
  - проверить сохранение из админки в новом проекте
  - проверить загрузку файлов в новый volume
  - проверить страницы клубов, новости, альбомы и партнеров именно через новый PHP-слой
- После этого можно будет чистить старые Railway-зависимости и окончательно отрезать проект от старого окружения.

### Файлы

- [WORKLOG.md](/Users/kainarbaev_daniar/Downloads/последний%20эталон/WORKLOG.md)
- [archive/legacy-tools/scripts/import-archive-details.mjs](/Users/kainarbaev_daniar/Downloads/последний%20эталон/archive/legacy-tools/scripts/import-archive-details.mjs)

### Коммиты

- Будет отдельный коммит после обновления журнала.

---

## 2026-04-21 19:05

### Что сделали

- Запустили реальный production-перенос legacy `uploads` в новый Railway PHP-проект через:
  - [scripts/migrate-legacy-uploads-to-production.mjs](/Users/kainarbaev_daniar/Downloads/последний%20эталон/scripts/migrate-legacy-uploads-to-production.mjs)
- Скрипт авторизовался через новый PHP admin endpoint и загрузил живые старые файлы в новый production volume.
- Полный отчет сохранили локально во временный файл:
  - `/tmp/migrate-legacy-uploads-report.json`

### Что проверили

- Всего в manifest было `45` legacy refs.
- Обработано: `45`
- Успешно загружено в новый production volume: `40`
- Уже существующих файлов до запуска не было: `0`
- Реально отсутствовали на старом сайте: `5`
- Полностью пустых технических падений при миграции не было: `0`

- Подтвердились как реально битые исходники на старом сайте:
  - `/uploads/2017/03/туцы.png`
  - `/uploads/2017/05/RedPhoto_0156.jpg`
  - `/uploads/2018/06/Бока-Хуниорс.mp4`
  - `/uploads/burcup/news/image/2026-04-20-19-43-39.jpg`
  - `/uploads/burcup/news/image_url/2026-04-20-19-43-39.jpg`

- Дополнительно нашли `8` кейсов, где upload API изменил итоговый путь или не вернул legacy URL в ожидаемом виде:
  - три изображения 2022 года с точками во времени в имени (`0.19.15`, `11.59.55`, `12.00.28`) были загружены, но PHP upload endpoint нормализовал имя файла и заменил точки на дефисы
  - два mp4 из 2023 года (`1_1692446.mp4`, `rpreplay_final1681578695.mp4`) были приняты upload endpoint, но endpoint не вернул ожидаемый URL и итоговая проверка legacy пути дала `404`
  - один mp4 из 2023 года (`13_szht-burchalov_hd720.mp4`) тоже попал в список mismatched URLs
  - два файла `afisha.pngitogi-*` были сведены endpoint к `/uploads/2023/05/afisha.png`

### Что осталось

- Нужно отдельно добить 8 mismatched кейсов, чтобы legacy URL либо:
  - начали открываться по старому пути
  - либо были перепривязаны в данных на новый фактический путь
- После этого стоит точечно проверить страницы:
  - новости с legacy медиа
  - фотоальбомы
  - встроенные видео/материалы старых розыгрышей
- Если потребуется абсолютная совместимость со старыми путями, возможно придется доработать PHP upload flow или положить часть файлов в volume вручную без slug-нормализации.

### Файлы

- [scripts/migrate-legacy-uploads-to-production.mjs](/Users/kainarbaev_daniar/Downloads/последний%20эталон/scripts/migrate-legacy-uploads-to-production.mjs)
- [WORKLOG.md](/Users/kainarbaev_daniar/Downloads/последний%20эталон/WORKLOG.md)
- `/tmp/migrate-legacy-uploads-report.json`

### Коммиты

- Будет отдельный коммит после обновления журнала.

---

## 2026-04-21 18:35

### Что сделали

- Продолжили практический перенос legacy `uploads` в новый production PHP-проект.
- Проверили, как именно устроены текущие PHP endpoints:
  - [lamp-api/app/Controllers/AdminController.php](/Users/kainarbaev_daniar/Downloads/последний%20эталон/lamp-api/app/Controllers/AdminController.php)
  - [lamp-api/app/Controllers/UploadController.php](/Users/kainarbaev_daniar/Downloads/последний%20эталон/lamp-api/app/Controllers/UploadController.php)
- Подтвердили, что:
  - логин через `/api/admin/session` возвращает `ADMIN_TOKEN`
  - upload endpoints `/api/admin/uploads/*` уже умеют писать в новый `lamp-api/public/uploads`
- Добавили новый production-миграционный скрипт:
  - [scripts/migrate-legacy-uploads-to-production.mjs](/Users/kainarbaev_daniar/Downloads/последний%20эталон/scripts/migrate-legacy-uploads-to-production.mjs)
- Этот скрипт умеет:
  - брать manifest старых файлов
  - логиниться в новый продовый PHP API
  - проверять, существует ли целевой файл уже на новом сайте
  - скачивать живой файл со старого сайта
  - загружать его в новый production через `/api/admin/uploads/raw`
  - сверять, совпал ли итоговый URL с ожидаемым legacy путём
  - сохранять подробный JSON-отчет по миграции

### Что проверили

- Для 45 найденных legacy upload refs только 2 проблемных по регистру/кириллице:
  - `/uploads/2017/05/RedPhoto_0156.jpg`
  - `/uploads/2018/06/Бока-Хуниорс.mp4`
- Оба этих файла уже ранее подтвердились как отсутствующие на старом сайте, то есть массовому восстановлению живых файлов они не мешают.
- Это означает, что большую часть живых legacy uploads можно переносить штатно через текущий PHP upload API без риска массового несовпадения путей.

### Что осталось

- Следующий шаг — запустить новый production migration script по-настоящему и переложить живые legacy uploads в новый volume.
- После этого нужно:
  - проверить отчёт по неуспешным файлам
  - убедиться, что страницы новостей и альбомов перестали отдавать 404 по старым медиа
  - отдельно решить судьбу реально битых исходников, которых уже нет на старом сайте

### Файлы

- [scripts/migrate-legacy-uploads-to-production.mjs](/Users/kainarbaev_daniar/Downloads/последний%20эталон/scripts/migrate-legacy-uploads-to-production.mjs)
- [lamp-api/app/Controllers/AdminController.php](/Users/kainarbaev_daniar/Downloads/последний%20эталон/lamp-api/app/Controllers/AdminController.php)
- [lamp-api/app/Controllers/UploadController.php](/Users/kainarbaev_daniar/Downloads/последний%20эталон/lamp-api/app/Controllers/UploadController.php)
- [WORKLOG.md](/Users/kainarbaev_daniar/Downloads/последний%20эталон/WORKLOG.md)

### Коммиты

- Будет отдельный коммит после обновления журнала.

---

## 2026-04-21 18:10

### Что сделали

- Продолжили хвост LAMP-переноса, связанный со старыми медиа в `uploads`.
- Подтвердили, что в новом проекте каталог загрузок пока практически пустой:
  - [lamp-api/public/uploads/.gitkeep](/Users/kainarbaev_daniar/Downloads/последний%20эталон/lamp-api/public/uploads/.gitkeep)
  - [lamp-api/public/uploads/.htaccess](/Users/kainarbaev_daniar/Downloads/последний%20эталон/lamp-api/public/uploads/.htaccess)
- Собрали точную инвентаризацию старых ссылок на `uploads` из уже выгруженных production JSON:
  - `/tmp/burcup-audit-news.json`
  - `/tmp/burcup-audit-albums.json`
- Добавили новый recovery-скрипт:
  - [scripts/recover-legacy-uploads.mjs](/Users/kainarbaev_daniar/Downloads/последний%20эталон/scripts/recover-legacy-uploads.mjs)
- Скрипт умеет:
  - собирать старые `/uploads/...` ссылки из JSON
  - нормализовать “грязные” хвосты из старого контента
  - строить manifest с `sourceUrl` и `targetPath`
  - опционально делать `HEAD`-проверку старого сайта
  - опционально скачивать найденные файлы в новый `lamp-api/public/uploads`

### Что проверили

- Локальный запуск recovery-скрипта без скачивания успешно отработал:
  - результат сохранен во временный manifest `/tmp/legacy-uploads-manifest.json`
- Точное число найденных legacy upload refs:
  - `45`
- Среди них есть:
  - старые фото 2024–2026
  - фото и документы 2023
  - старые JPG 2022
  - медиа 2017–2018
  - отдельные кастомные пути вида `/uploads/burcup/news/...`
- В manifest видно, что скрипт уже автоматически почистил битые хвосты вроде лишних `'` в mp4-ссылках.

### Что осталось

- Следующий практический шаг — прогнать этот скрипт уже в режиме реального восстановления:
  - сначала `--check`, чтобы увидеть, какие файлы на старом сайте еще живы
  - затем `--download`, чтобы переложить живые файлы в новый `uploads`
- После скачивания нужно будет:
  - проверить реальные страницы новостей и альбомов
  - убедиться, что 404 по старым медиа исчезли
  - отдельно обработать ссылки, которые окажутся реально битымі на старом сайте

### Файлы

- [scripts/recover-legacy-uploads.mjs](/Users/kainarbaev_daniar/Downloads/последний%20эталон/scripts/recover-legacy-uploads.mjs)
- [WORKLOG.md](/Users/kainarbaev_daniar/Downloads/последний%20эталон/WORKLOG.md)

### Коммиты

- Будет отдельный коммит после обновления журнала.

---

## 2026-04-21 01:35

### Что сделали

- Выполнили полную миграцию данных из текущего production API в новую MySQL нового Railway-проекта через архивный импортер:
  - [archive/legacy-tools/scripts/migrate-to-mysql.mjs](/Users/kainarbaev_daniar/Downloads/последний%20эталон/archive/legacy-tools/scripts/migrate-to-mysql.mjs)
- Запустили импорт с `APPLY_SCHEMA=1`, чтобы новая база сама получила актуальную схему перед заливкой данных.
- Перенесли в новую MySQL основные рабочие сущности проекта:
  - турниры
  - клубы
  - связи клубов с турнирами
  - турнирную таблицу
  - матчи
  - события матчей
  - новости
  - фотоальбомы
  - партнеров
  - сетку плей-офф
  - редактируемые страницы
- После импорта проверили уже не сам скрипт, а новый production PHP API нового проекта, чтобы убедиться, что сервис реально читает новую базу.

### Что проверили

- Импорт завершился успешно без падения скрипта.
- Получили итоговые счетчики переноса:
  - `tournaments: 6`
  - `clubs: 17`
  - `derived_tournament_clubs: 8`
  - `standings: 8`
  - `matches: 8`
  - `news: 250`
  - `albums: 3`
  - `partners: 22`
  - `playoff: 8`
  - `pages: 1`
- Новый production endpoint [api/health](https://burcup-production.up.railway.app/api/health) отвечает:
  - `{"ok":true,"runtime":"php","database":"mysql"}`
- Новый production endpoint [api/tournaments](https://burcup-production.up.railway.app/api/tournaments) уже отдает не только сезон 2026, но и прошлые розыгрыши:
  - 2025
  - 2024
  - 2023
  - 2019
  - 2018
- Новый production endpoint [api/news](https://burcup-production.up.railway.app/api/news) уже отдает полный набор новостей, включая старые записи, а не только тестовый короткий набор.
- Новый production endpoint [api/matches](https://burcup-production.up.railway.app/api/matches) отдает актуальные матчи из нового PHP слоя.
- Это подтверждает, что новый Railway-проект теперь не просто подключен к MySQL формально, а реально читает боевые данные уже из новой базы.

### Что осталось

- Вне этого импорта пока остается `content_translations`: архивный мигратор сам помечает, что этот блок еще не перенесен.
- Нужно отдельно проверить браузерные пользовательские сценарии на новом проекте:
  - публичные страницы
  - админку
  - сохранение через UI
  - загрузку файлов
- После этого можно будет переходить к следующему этапу LAMP-переноса уже с новой независимой MySQL в новом проекте.

### Файлы

- [archive/legacy-tools/scripts/migrate-to-mysql.mjs](/Users/kainarbaev_daniar/Downloads/последний%20эталон/archive/legacy-tools/scripts/migrate-to-mysql.mjs)
- [WORKLOG.md](/Users/kainarbaev_daniar/Downloads/последний%20эталон/WORKLOG.md)

### Коммиты

- Будет отдельный коммит после обновления журнала.

---

## 2026-04-21 01:10

### Что сделали

- Перешли к следующему практическому этапу LAMP-переноса: начали готовить проект уже не только под Railway PHP runtime, а под обычный Apache/PHP/MySQL-хостинг.
- Разобрали текущий runtime и зафиксировали, что сейчас production еще использует CLI-роутер:
  - корневой `Dockerfile` поднимает `php -S ... router.php`
- Подготовили отдельный Apache-совместимый контейнер:
  - добавили [Dockerfile.apache](/Users/kainarbaev_daniar/Downloads/последний%20эталон/Dockerfile.apache)
- Добавили шаблон переменных окружения для обычного PHP/LAMP-хостинга:
  - [lamp-api/.env.example](/Users/kainarbaev_daniar/Downloads/последний%20эталон/lamp-api/.env.example)
- Добавили отдельную практическую инструкцию по обычному LAMP-хостингу:
  - [LAMP-HOSTING.md](/Users/kainarbaev_daniar/Downloads/последний%20эталон/LAMP-HOSTING.md)
- Обновили [lamp-api/README.md](/Users/kainarbaev_daniar/Downloads/последний%20эталон/lamp-api/README.md), чтобы там явно были разделены:
  - текущий Railway-режим
  - классический Apache/LAMP-режим

### Что проверили

- Подтвердили по коду, что для классического Apache-hosting уже есть базовая основа:
  - корневой [/.htaccess](/Users/kainarbaev_daniar/Downloads/последний%20эталон/.htaccess) маршрутизирует `/api/*` в PHP API
  - [lamp-api/public/.htaccess](/Users/kainarbaev_daniar/Downloads/последний%20эталон/lamp-api/public/.htaccess) поддерживает Apache rewrite внутри публичной части API
  - [js/config.js](/Users/kainarbaev_daniar/Downloads/последний%20эталон/js/config.js) уже работает в same-origin режиме, без старого Node API
- Подтвердили, что оставшаяся основная Railway-зависимость сейчас именно в runtime-способе запуска, а не в самих API-ручках.

### Что осталось

- Следующий шаг: прогнать проект уже в Apache-совместимом режиме и проверить публичные страницы, админку и загрузки.
- После этого отдельно добить сценарии:
  - admin save под Apache
  - upload flow под Apache
  - доступность `/uploads/*` без Railway-специфичных предположений
- Затем можно будет говорить, что структура реально готова к типичному LAMP-хостингу.

### Файлы

- [Dockerfile.apache](/Users/kainarbaev_daniar/Downloads/последний%20эталон/Dockerfile.apache)
- [LAMP-HOSTING.md](/Users/kainarbaev_daniar/Downloads/последний%20эталон/LAMP-HOSTING.md)
- [lamp-api/.env.example](/Users/kainarbaev_daniar/Downloads/последний%20эталон/lamp-api/.env.example)
- [lamp-api/README.md](/Users/kainarbaev_daniar/Downloads/последний%20эталон/lamp-api/README.md)
- [WORKLOG.md](/Users/kainarbaev_daniar/Downloads/последний%20эталон/WORKLOG.md)

### Коммиты

- Будет отдельный коммит после обновления журнала.

---

## 2026-04-21 00:35

### Что сделали

- Провели живую проверку нового production-проекта Railway на `PHP + MySQL` не только через health-check, но и через реальные admin write/read операции.
- Проверили ресурс `partners` через продовый PHP endpoint `/api/admin/partners`.
- Проверили ресурс `matches` через продовый PHP endpoint `/api/admin/matches`.
- Проверили ресурс `news` через продовый PHP endpoint `/api/admin/news`.
- Для каждого ресурса выполнили безопасный короткий цикл:
  - прочитали текущее состояние,
  - внесли небольшое временное изменение,
  - перечитали данные обратно через API,
  - убедились, что запись сохранилась,
  - сразу вернули исходные данные.
- Зафиксировали правило: все важные шаги по инфраструктуре, миграции, продовой проверке, Railway, БД, API и деплою дальше записываем в `WORKLOG.md` сразу, без отдельного подтверждения пользователя.

### Что проверили

- Production health продолжает отвечать корректно:
  - `/api/health` -> `{"ok":true,"runtime":"php","database":"mysql"}`
- `partners`:
  - чтение работает,
  - временная запись в `bank-vtb.note` сохранилась,
  - повторное чтение вернуло новое значение,
  - откат вернул исходное состояние.
- `matches`:
  - чтение работает,
  - временная запись в `match id=8 -> summary` сохранилась,
  - повторное чтение вернуло новое значение,
  - откат вернул исходное состояние.
- `news`:
  - чтение работает,
  - временная запись в `news id=1776703388074 -> excerpt` сохранилась,
  - повторное чтение вернуло новое значение,
  - откат вернул исходное состояние.
- Это подтверждает, что новый Railway-проект уже реально выполняет операции чтения и записи через production PHP API в новой MySQL.
- Визуальная стрелка Railway между сервисом и MySQL теперь не критична: рабочая запись подтверждена боевой проверкой.

### Что осталось

- Отдельно проверить через браузерный сценарий, что сохранение из самой админки проходит без расхождений между интерфейсом и PHP API.
- Дальше продолжать LAMP-перенос уже с пониманием, что production PHP слой и новая MySQL связаны корректно.
- После каждого следующего значимого шага по продовой инфраструктуре, базе, Railway, PHP API и миграции сразу дополнять этот журнал новой верхней записью.

### Файлы

- [WORKLOG.md](/Users/kainarbaev_daniar/Downloads/последний эталон/WORKLOG.md)

### Коммиты

- Будет отдельный коммит после обновления журнала.

---

## Сводка проекта

### Быстрый старт для нового чата

Если работа продолжается в новом чате, начинать нужно в таком порядке:

1. Открыть этот файл:
   - `/Users/kainarbaev_daniar/Downloads/последний эталон/WORKLOG.md`
2. Проверить production health:
   - `https://burcup-production.up.railway.app/api/health`
3. Проверить список турниров:
   - `https://burcup-production.up.railway.app/api/tournaments`
4. Если оба ответа корректные:
   - можно продолжать текущую задачу без восстановления всей истории переписки
5. Если что-то не совпадает:
   - проверить Railway service `burcup`
   - проверить Railway service `MySQL`
   - проверить Variables у `burcup`
   - проверить mount path volume
   - проверить, не смотрит ли фронт на старый endpoint

### Что делать в первые 5 минут, если сайт снова “ведет себя странно”

- Проверить, отвечает ли:
  - `/api/health`
- Проверить, совпадают ли данные в:
  - `/api/tournaments`
  - `/api/news`
  - `/api/matches`
  - `/api/clubs`
- Проверить, не отдает ли браузер старый кэш.
- Проверить, не сломались ли Variables у текущего Railway-сервиса.
- Проверить, что uploads volume не отвалился.
- Проверить, не был ли случайно задеплоен старый/не тот коммит.

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

### Где что искать в Railway

- App service:
  - `burcup`
- DB service:
  - `MySQL`
- Volume:
  - `burcup-volume`
- В `burcup -> Variables` лежат:
  - admin credentials
  - app-side MySQL variables
  - translation settings
  - cloudinary settings
- В `MySQL -> Variables` лежат:
  - database-generated MySQL variables
  - internal/public connection data
- В `burcup-volume -> Settings` лежит:
  - mount path
  - размер volume

### Где что искать вне Railway

- Репозиторий:
  - `a4agency/burcup`
- Рабочая ветка:
  - `main`
- Рабочая папка локально:
  - `/Users/kainarbaev_daniar/Downloads/последний эталон`
- Основной код PHP API:
  - `/Users/kainarbaev_daniar/Downloads/последний эталон/lamp-api`
- Фронтовый код:
  - `/Users/kainarbaev_daniar/Downloads/последний эталон/js`
- Админка:
  - `/Users/kainarbaev_daniar/Downloads/последний эталон/admin-almaz.html`

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

### Где искать доступы и служебные данные

- Пароль админки:
  - только в Railway Variables сервиса `burcup`
- Admin token:
  - только в Railway Variables сервиса `burcup`
- Данные Cloudinary:
  - только в Railway Variables сервиса `burcup`
- Пароли и URL базы:
  - только в Railway Variables сервиса `MySQL` и/или продового `burcup`
- Mount path uploads:
  - в этом журнале и в настройках volume
- Production endpoints:
  - можно хранить в журнале, они публичные

### Что нельзя трогать без проверки

- Нельзя коммитить реальные секреты в репозиторий.
- Нельзя массово удалять старые файлы, пока не проверено, что они не нужны фронту или админке.
- Нельзя бездумно возвращать Apache-конфиг, не проверив проблему с `More than one MPM loaded`.
- Нельзя менять `MYSQL*` переменные в Railway “на глаз”, не понимая, к какой базе они поведут сервис.
- Нельзя случайно включать в коммит весь грязный worktree.
- Нельзя удалять `archive/`, пока не подтверждено, что оттуда уже ничего не нужно для ручного восстановления.
- Нельзя трогать uploads volume, не понимая, где лежат живые файлы.

### Что желательно проверять перед любым крупным изменением

- отвечает ли `api/health`
- совпадает ли `api/tournaments`
- открывается ли админка
- сохраняются ли изменения из админки
- открываются ли клубы, новости, архивы, альбомы
- есть ли доступ к volume и загруженным файлам
- нет ли лишних dirty/untracked файлов перед коммитом

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

### История продуктовых доработок, которые уже были сделаны

Ниже — не только инфраструктурная, но и продуктовая часть истории, чтобы в новом чате было понятно, какой объем сайта уже реально собран и настроен.

#### 1. Главная страница и ключевые визуальные блоки

- Убирали лишние подложки, тени, резкие градиенты и резкие обрывы фона.
- Приводили карточки матчей к единому стилю:
  - уменьшали размер
  - убирали лишние подписи
  - переносили дату и время в нужный формат
  - делали hover-анимации и легкие тени
- Дорабатывали карточки новостей:
  - единый стиль
  - правильное отображение превью
  - более аккуратные скругления
  - одинаковое поведение на главной и на странице новостей
- Делали карусели:
  - ближайшие матчи
  - турниры
  - новости
  - фотоальбомы
  - медиа-материалы

#### 2. Шапка и навигация

- Дорабатывали большую и короткую шапку.
- В итоге приняли правило:
  - большая шапка остается только на главной
  - на остальных страницах используется короткая
- Чинили лаги и мерцание при скролле.
- Делали мобильный бургер:
  - возвращали ширину кнопок
  - выравнивали пункты меню

#### 3. Матчи и страница матча

- Полностью перестраивали страницу матча:
  - порядок блоков
  - счёт
  - статус
  - расположение хозяев/гостей
  - время/стадион
- Добавляли блоки:
  - трансляция
  - обзор
  - интервью
  - личные встречи
- Настраивали поведение:
  - если видео нет, показывается заглушка
  - если ссылка появилась, показывается встроенный плеер/материал
- Добавляли переходы:
  - из страницы матча на страницу клуба
  - из личных встреч на страницу конкретного матча
- Приводили подписи турнира и даты к единому формату.

#### 4. Турнирная таблица и сетка плей-офф

- Турнирная таблица была серьезно переработана:
  - автообновление при завершении матчей
  - подсчет очков
  - сортировка по очкам и разнице мячей
- Добавляли и перестраивали сетку плей-офф:
  - переключение между таблицей и сеткой
  - десктопный вид
  - мобильный вид со скроллом
  - ручной и автоматический режим
- Под сетку плей-офф добавляли заглушечные команды:
  - `Команда 1`, `Команда 2` и т.д.
- Позже эти команды-заглушки использовались только технически и скрывались из публичной страницы клубов.

#### 5. Клубы и страницы клубов

- Сначала были добавлены сами страницы клубов.
- Затем в клубах дорабатывали:
  - описание клуба
  - историю участия
  - историю матчей
  - переходы со страницы матча на клуб
- Историю участия переделывали в вертикальный формат с годами.
- Для призовых мест окрашивали овалы годов:
  - золото
  - серебро
  - бронза
- Также убирали лишние тексты вроде “исторический участник”, чтобы все было единообразно.

#### 6. Архивы турниров и прошлые розыгрыши

- Делали отдельные страницы архивных розыгрышей.
- Наполняли архив 2025 года:
  - команды
  - матчи
  - таблица
  - сетка
  - пьедестал
- Дорабатывали блок “Прошлые розыгрыши”.
- Добавляли отдельную страницу со всеми прошлыми турнирами.
- Копировали стиль архива 2025 года на остальные сезоны.
- Начали переносить старые матчи и результаты со старого сайта.

#### 7. Пьедестал и архивные команды

- Несколько раз переделывали блок пьедестала.
- В итоге пришли к схеме:
  - 1 место выше
  - 2 место ниже
  - 3 место еще ниже
  - логотип над карточкой
  - цветовые карточки для топ-3
- Отдельно масштабировали логотипы и высоты карточек.
- Меняли местами клубы в призовых местах, когда пользователь просил откорректировать реальные позиции.

#### 8. Новости

- Переносили новости со старого сайта.
- Делали отдельную страницу новости.
- Дорабатывали:
  - формат даты
  - формат контента
  - жирные выделения
  - встроенные видео
  - правильное место изображений внутри статьи
- Чинили баги:
  - лишнее превью внизу видео-новости
  - фото, наваленные в конец статьи
  - несоответствие старому оригиналу
- Принцип:
  - новая новость на сайте должна выглядеть как полноценная статья, а не просто набор текста и картинок.

#### 9. Фотоальбомы и медиа

- Страница “Медиа” была полностью переработана.
- Убрали лишние блоки.
- Добавили:
  - главный матч
  - кнопки материалов
  - фоторепортажи
- Фотоальбомы получили:
  - отдельные карточки
  - отдельную страницу альбома
  - сетку 4x4
  - карусель
  - lightbox
  - свайпы на мобильной версии
- Для фотоальбомов и новостей внедряли загрузку фото через storage/URL-схему, а не как тяжелые локальные файлы в коде.

#### 10. Партнеры и информационные партнеры

- Несколько раз переделывался дизайн карточек партнеров.
- Вводили:
  - монохромный режим
  - hover в фирменный цвет
  - кликабельность по ссылке
  - fallback на главную страницу, если ссылка пустая
- Затем добавляли реальные логотипы и ссылки.
- Исправляли поломки:
  - пропавшие логотипы
  - неправильные размеры
  - кривые переносы текста
  - несинхронность между одним браузером и другим
- Позже добавили отдельный блок “Информационные партнеры” и вынесли его в админке отдельно.

#### 11. Страницы “О турнире”, “О Льве Бурчалкине”, “Контакты”

- Страница “О Льве Бурчалкине” была наполнена:
  - текстом
  - историческими фотографиями
  - выверенной типографикой
- Страница “Контакты” была обновлена реальными данными.
- Для карты на странице контактов сделали переключение:
  - Яндекс Карты
  - Google Maps
- Затем закрепили Яндекс.Карты как базовый вариант.

#### 12. Админка

- Админка сильно менялась по ходу работы.
- Было сделано:
  - пароль на вход
  - переименование в `admin-almaz`
  - фиксация токена/API без ручного ввода
  - уведомления о сохранении
  - нижние и верхние кнопки сохранения
  - селекты команд
  - разделение на разделы
  - отдельные разделы для информационных партнеров и архивов
- Через админку уже настраивались:
  - турниры
  - матчи
  - клубы
  - партнеры
  - новости
  - альбомы
  - архивные данные
  - медиа-блоки

#### 13. Перевод на английский

- Был внедрен автоматический перевод через API.
- Потом отдельно ловили и исправляли ошибки перевода:
  - турнирная таблица
  - архивные страницы
  - разные несинхронные блоки
- Логика перевода уже не ручная, а системная.

#### 14. Браузерные и кэш-проблемы

- На ряде этапов наблюдалась ситуация, когда:
  - в одном браузере новые данные есть
  - в другом браузере старые данные
- Из-за этого отдельно:
  - стабилизировали выбор API источника
  - убирали старые fallback-логики
  - чинили фронтовую конфигурацию
  - боролись с кэшем и несинхронностью данных

### Ключевые продуктовые коммиты, которые стоит помнить

- `678eea5` — `Expand PHP LAMP API for core resources`
- `598e659` — `Add PHP upload endpoints for LAMP API`
- `fb90200` — `Align PHP API with frontend expectations`
- `4793dab` — `Restore partner logos and links`
- `a4cd34b` — `Fix club match count query for MySQL`
- `f03f93f` — `Add MySQL URL fallbacks for admin API`
- `c387581` — `Support Railway MySQL env variants`
- `36b542b` — `Fix admin match saving and ordering`
- `415842c` — `Prefer Railway MySQL env vars`
- `61bb8f9` — `Add PHP translation endpoint for LAMP API`
- `92748ba` — `Remove browser-side static news fallback`
- `2506f9b` — `Align frontend with PHP API`
- `f183daf` — `Stabilize API source selection and browser cache`
- `562f35c` — `Remove Railway API fallback from frontend config`
- `896ed2c` — `Make frontend use same-origin API only`

### Что важно помнить не только про инфраструктуру, но и про сам продукт

- Сайт уже не “болванка”: в нем очень много ручных продуктовых решений, накопленных по ходу работы.
- Многие визуальные детали подгонялись вручную вместе с пользователем:
  - карточки
  - архивы
  - пьедестал
  - клубы
  - новости
  - медиа
- Поэтому при будущих крупных переделках нужно смотреть не только на код, но и на уже согласованный визуальный результат.

### Расширенная история продуктовых решений по блокам

Ниже зафиксирована более подробная история того, как именно принимались решения по визуалу, контенту и логике. Этот блок нужен, чтобы в будущем не повторять уже пройденные круги обсуждений.

#### Блок “Ближайшие матчи”

- Изначально карточки матчей несколько раз упрощались визуально:
  - убирали лишний фон
  - убирали резкие градиенты
  - убирали лишние тени
  - убирали точку перед временем
  - убирали лишний текст после времени
- Время матча делали заметнее.
- Карточки специально уменьшали так, чтобы на экране помещалось ровно 3 карточки.
- Потом добавляли hover-анимацию, аналогичную карточкам партнеров.
- Позже карточки делали более компактными, но с сохранением всей внутренней композиции.
- Формат даты в карточках приводили к виду:
  - `15 мая • 10:00`
- Стадион из маленьких карточек в итоге убрали, а на странице матча оставили формат:
  - `дата • время • стадион`

#### Блок таймера турнира

- Над “Ближайшими матчами” был добавлен отдельный блок countdown.
- В нем согласованы:
  - заголовок `Кубок Бурчалкина 2026`
  - подзаголовок `15 - 17 мая`
  - отсчет до `15 мая 10:00 GMT+3`
- Выравнивание всего блока приводили к центру.
- Меняли шрифт:
  - сначала был курсивный/неподходящий
  - потом убирали курсив
  - затем подбирали шрифт цифр под стиль электронных часов
  - отдельно делали цифры белыми
- Позже добавили возможность полностью скрывать блок через админку после старта турнира.

#### Карточки команд / участники турнира

- Сначала у карточек была лишняя подпись про количество матчей в истории, её удалили.
- Потом исторические карточки многократно дорабатывались:
  - убирали лишние тексты
  - меняли заголовки блока
  - меняли описание лет участия
  - позже убирали слово “исторический”
- В итоге приняли публичное название:
  - `Участники турнира`
- Для каждого клуба потом добавили годы участия:
  - в формате перечисления
  - затем в диапазонах, если года идут подряд
  - например: `2016 - 2019, 2023 - 2026`
- На страницах клубов историю участия потом переделали в вертикальный список годов с местами.

#### Партнерские блоки

- Блок партнеров проходил через много итераций:
  - сначала добавляли логотипы как заглушки
  - потом выравнивали логотип слева, текст по центру
  - затем оставили логотип в левом углу, а текст центрировали
- Дизайн карточек партнеров потом делали монохромным в состоянии без hover.
- На hover карточка должна была становиться цветной, а текст — фирменно-синим.
- Текст в спокойном состоянии приводили к цвету, как у описаний карточек команд.
- Отдельно просили не делать текст жирнее на hover.
- Позже добавляли:
  - кликабельность по сайту партнера
  - редактирование ссылки через админку
  - fallback на главную, если ссылки нет
- Отдельно был создан блок “Информационные партнеры”.

#### Новости

- Сначала новости на главной и на странице новостей приводились к одному карточному стилю.
- Превью новостей несколько раз дорабатывались:
  - сначала картинки обрезались некрасиво
  - потом их переводили в режим отображения “показывать весь контент”
  - потом убирали лишние подложки по краям
  - затем убирали фон у контейнера изображения совсем
- Углы превью специально делали с легким, но не агрессивным скруглением.
- Для самих страниц новости:
  - уменьшали заголовок
  - уменьшали фото
  - переносили основной текст под изображение
  - делали дату добавления внизу справа
- Позже начался большой перенос новостей со старого сайта.
- В процессе выяснилось:
  - форматирование текста часто нужно восстанавливать вручную
  - видео-новости не должны дублировать превью внизу
  - если в новости несколько фото, они должны быть встроены в правильных местах статьи, а не просто навалены внизу

#### Фотоальбомы

- Для фотоальбомов сначала сделали раздел “Фоторепортажи”.
- Потом добавили:
  - отдельные карточки альбомов
  - страницы альбомов
  - сетку фото
  - пагинацию/карусель
- Затем пересобирали отображение фото:
  - убирали лишние пустые поля вокруг изображений
  - подгоняли контейнер так, чтобы было видно именно фото, а не белые полосы сверху/снизу
- Далее реализовали lightbox:
  - увеличение фото на месте
  - крестик закрытия
  - стрелки
  - плавное размытие фона
- Затем добавили свайпы на мобильной версии:
  - на странице альбома
  - в открытом просмотре фото
- Также на мобильной версии добавляли нумерацию текущего фото.

#### Мобильная адаптация

- Мобильную версию много раз правили точечно:
  - страницу матча
  - турнирную таблицу
  - сетку плей-офф
  - карточки новостей
  - карточки прошлых розыгрышей
  - фотоальбомы
  - бургер-меню
- Для мобильной страницы матча:
  - статус поднимали в одну линию с турниром/группой
  - счет переносили между командами
  - приводили стадион к единому виду
- Для мобильной таблицы и плей-офф приняли решение:
  - показывать их как десктопную версию, но со скроллом
- Для мобильного бургера:
  - возвращали ширину кнопок на всю строку
  - исправляли уменьшенные пункты

#### Сетка плей-офф

- Сначала была идея делать сетку двумя блоками, но от нее отказались.
- Пользователь несколько раз уточнял, что хочет именно вытянутую горизонтальную схему, как в референсах.
- После этого сетку переделывали:
  - уменьшали ширину карточек
  - меняли расположение правой части
  - возвращали линии
  - добавляли счет прямо внутрь карточек
  - приводили карточки к стилю “как ближайшие матчи, но без группы”
- В карточках без команд:
  - сначала был обрезанный текст
  - потом это исправляли
  - позже туда временно поставили `Команда 1`, `Команда 2` и т.д. с логотипом турнира
- Отдельно выравнивали заголовки “Полуфиналы”, “Финалы”, “Плей-офф за 1-4 места”.

#### Архив 2025 и прошлые розыгрыши

- Архив `2025` стал опорным эталоном для остальных архивных страниц.
- Сначала на архивной странице был лишний вводный текст и вспомогательные карточки, их постепенно убрали.
- Затем под архив собирали:
  - команды розыгрыша
  - турнирную таблицу
  - сетку
  - матчи
  - фотографии
  - пьедестал
- Позже именно стиль `2025` решили копировать на остальные сезоны.
- Отдельно переносили архивные матчи со старого сайта:
  - результаты
  - порядок матчей
  - логику прошлых встреч
- Важный момент:
  - для архивных турниров не просто создавались заглушки, а постепенно вносились реальные данные со старого сайта
  - это особенно важно для клубных страниц и блока прошлых встреч

#### Страницы клубов и эволюция их структуры

- Страница клуба появилась не сразу, а как следующий шаг после страницы матча.
- Идея была такой:
  - из матча можно перейти в клуб
  - у клуба есть собственная маленькая “карточка профиля”
  - у клуба есть история участия и история матчей
- Дальше блоки страницы клуба несколько раз перекраивались:
  - сначала там были лишние подписи и исторические формулировки
  - потом стали убирать слово “исторический”
  - потом годы участия выводили строкой
  - затем годы превратили в вертикальный список с местами
- На одном из этапов для годов участия ввели цветовые овалы по месту:
  - золото за 1 место
  - серебро за 2 место
  - бронза за 3 место
- Потом отдельно усиливали серебряный цвет, потому что он выглядел слишком бледно.
- Для мест ниже 3-го убирали контур, а затем возвращали контур только призовым местам.
- В истории матчей клуба:
  - сначала показывались группа и статус
  - потом это убрали
  - формат блока привели к стилю личных встреч со страницы матча
- На клубных страницах был отдельный баг:
  - страница сначала на секунду показывала команды в другом порядке, а потом перестраивалась
  - это отдельно проверялось как проблема несинхронных данных / фронтового состояния

#### Перевод сайта и англоязычная версия

- Изначально пользователь хотел не ручной перевод, а автоматическую систему:
  - весь контент добавляется на русском
  - английский строится автоматически
- После внедрения перевода отдельно находили ошибки:
  - архивные страницы не переводились
  - турнирная таблица имела кривые заголовки в английском
  - некоторые блоки на фронте брали старые или локальные fallback-данные
- Это привело к важному техническому выводу:
  - фронт должен брать данные централизованно из API
  - нельзя держать “тихие” старые статические fallback-ветки, потому что они дают разные данные в разных браузерах

#### Админка: путь от простой формы к рабочей CMS

- Админка изначально была гораздо проще и содержала лишние техполя.
- Затем пользователь последовательно просил:
  - пароль на вход
  - убрать лишнее слово из адреса
  - спрятать токен
  - сделать админку проще для обычного пользователя
- После этого админка эволюционировала в несколько этапов:
  1. вход по паролю
  2. переименование `admin.html` -> `admin-almaz.html`
  3. автоподхват API без ручного ввода
  4. дублирование кнопок сохранения сверху и снизу
  5. уведомления об успехе/ошибке сохранения
  6. выравнивание всех секций и селекторов
  7. разбивка архивных сущностей в отдельные разделы
- Очень важная бизнес-цель пользователя:
  - человек должен зайти, выбрать нужную сущность, изменить данные и нажать “Сохранить”
  - без JSON-режимов, без ручной возни с API и токенами
- Отдельно в админке много раз дорабатывались:
  - селекты команд
  - селекты главного матча для медиа
  - редактирование партнеров и инфопартнеров
  - фотоальбомы
  - архивные таблицы
  - ручной и автоматический режим для таблицы/сетки
- На поздних этапах появился важный класс багов:
  - изменения реально сохранялись, но UI писал, что была ошибка
  - или сервис таймаутил и сообщал `connect ETIMEDOUT`
  - это привело к серии фиксов сохранения, порядка матчей и поддержки Railway/MySQL env variants

#### Контент со старого сайта: что уже было перенесено

- Большая часть работ шла в режиме “не просто придумать заново, а аккуратно перенести старый сайт в новый”.
- Переносили:
  - новости
  - архивные результаты
  - команды прошлых лет
  - страницы о турнире
  - страницу о Льве Бурчалкине
  - контакты
  - логотипы исторических участников
  - логотипы партнеров
  - фотографии с главной карусели
- При этом часто было недостаточно просто скачать данные:
  - приходилось вручную чинить форматирование
  - восстанавливать порядок фотографий
  - разбивать длинные описания
  - выверять подписи, годы и ссылки

#### Партнеры: отдельная история багов и визуальных правок

- С блоком партнеров было особенно много итераций.
- Ключевые эпизоды:
  - сначала логотипы были заглушками турнира
  - потом реальными логотипами
  - потом часть логотипов пропала
  - потом ссылки отвалились
  - потом в одном браузере было одно, а в другом другое
  - потом ломались переносы длинных названий
- Важный вывод из этих правок:
  - этот блок чувствителен и к данным, и к CSS, и к кэшу
  - если он “на секунду выглядит правильно, а потом ломается”, это почти всегда признак второго источника данных или старого фронтового fallback
- Конкретно для длинных названий было несколько требований:
  - не одна длинная строка
  - не огромный межстрочный интервал
  - не потерять лого и ссылку
  - сделать перенос красиво и контролируемо

#### Карты на странице контактов

- На странице контактов сначала использовалась только Google Maps.
- Затем пользователь попросил выбор между Google и Яндекс.
- Потом базовый вариант поменяли на Яндекс.
- Дальше шла серия точечных правок:
  - кнопки переключения карт в фирменном стиле
  - правильная метка именно на футбольный стадион
  - корректная ссылка на Яндекс-карту
  - корректная ссылка на Google Maps
- Важный UX-вывод:
  - пользователь хотел не “просто карту”, а именно надежную навигацию к нужному спортивному объекту

#### Главный слайдер / карусель на главной

- Слайдер на главной не просто рисовали заново — позже туда переносили реальные фотографии со старого сайта.
- Сначала на новом сайте были заглушки.
- Затем:
  - перенесли первые фото
  - потом добавляли все остальные
  - при этом на экране должно было одновременно показываться только 3
- Отдельно ловили эффект медленной загрузки затемненных карточек:
  - сначала был серый фон
  - потом фото появлялось через несколько секунд
- Это привело к дополнительным оптимизациям загрузки изображений и предзагрузки.

#### Архивирование старого кода и журнал как часть стратегии восстановления

- По ходу проекта стало ясно, что один чат уже не удерживает весь исторический контекст.
- Поэтому был введен отдельный `WORKLOG.md`.
- Потом его несколько раз расширяли:
  - сначала как простой список последних действий
  - потом как recovery-file
  - затем как playbook
  - затем как почти полноценную техдокументацию проекта
- Сейчас этот файл должен выполнять три роли одновременно:
  1. журнал изменений
  2. карта инфраструктуры
  3. инструкция по продолжению работы после потери чата

### Известные чувствительные места, которые уже ломались раньше

- Кэш браузера:
  - в одном браузере новые данные
  - в другом — старые
- Несинхронный источник данных:
  - часть фронта шла в API
  - часть случайно читала fallback/статические данные
- Партнеры:
  - логотипы и переносы текста ломались чаще остальных блоков
- Архивные пьедесталы:
  - очень чувствительны к CSS размеров и layout
- Фотоальбомы:
  - чувствительны к способу crop/object-fit и lightbox
- Админка:
  - чувствительна к таймаутам API и к environment variables
- Railway runtime:
  - главный инфра-баг был вокруг Apache MPM
- Uploads:
  - требуют volume и правильного mount path

### Как мы обычно принимали решения по сложным изменениям

- Пользователь почти всегда показывал желаемый визуальный референс.
- Затем делалась первая итерация.
- После этого следовал короткий цикл:
  - поправить
  - еще поправить
  - упростить
  - убрать лишнее
  - привести к единому стилю
- Общий вкус, который сформировался по проекту:
  - аккуратные белые карточки
  - темно-синие заголовки
  - мягкие, неагрессивные тени
  - минимум лишних подложек и фонов
  - очень осторожное отношение к градиентам
  - hover-эффекты должны быть легкими, а не кричащими

### Дополнительная хронология последних инфраструктурных шагов

- Был старый Railway-проект с прежним стеком.
- Затем был создан новый Railway project `BurCup`.
- В новом проекте сначала поднялся только сервис приложения.
- Потом:
  - подключили volume
  - завели новый MySQL
  - переключили app-service на новый MySQL
- После этого:
  - `api/health` подтвердил `php/mysql`
  - `api/tournaments` начал отдавать и прошлые сезоны
- Затем отдельно обсуждали:
  - нужно ли видеть “стрелку” в Railway graph
  - почему иногда она есть, а иногда нет
- Практический вывод:
  - главным источником правды является не стрелка на схеме, а ответ `api/health` и реальные данные API

### Что еще стоит дозаписывать в журнал дальше

- любые новые изменения Railway Variables
- любые смены домена или базового URL
- любые переносы базы или volume
- любые ручные правки данных в проде
- любые критичные фиксы админки
- любые случаи, когда сайт в разных браузерах показывает разные данные
- любые точные шаги, которые понадобились для восстановления production

## Текущее состояние production

### Что сейчас считается нормальным состоянием

- Главный сайт открывается по адресу:
  - `https://burcup-production.up.railway.app/`
- API отвечает по same-origin маршрутам:
  - `https://burcup-production.up.railway.app/api/*`
- Проверка состояния API:
  - `https://burcup-production.up.railway.app/api/health`
- Нормальный ответ health:
  - `{"ok":true,"runtime":"php","database":"mysql"}`
- Значит сейчас рабочая связка такая:
  - фронт сайта
  - PHP API
  - MySQL
  - volume для uploads

### Что должно работать в production руками

- главная страница
- расписание
- результаты
- страница матча
- страница клуба
- новости
- страница одной новости
- медиа / альбомы
- архивные турниры
- контакты
- админка `admin-almaz.html`

### Что сейчас является источником правды

- API и база данных важнее браузерного отображения.
- Если браузер и API показывают разное:
  - сначала верим API
  - потом ищем проблему в кэше, старом JS, fallback-логике или статических данных

### Минимальный production smoke-test

1. Открыть главную страницу.
2. Открыть:
   - `/api/health`
3. Открыть:
   - `/api/tournaments`
4. Проверить:
   - `/api/news`
   - `/api/matches`
   - `/api/clubs`
5. Открыть:
   - страницу одного клуба
   - страницу одной новости
   - одну архивную страницу
6. Проверить вход в админку.

## Что уже переведено на PHP

### База и инфраструктура

- PHP runtime для продового API уже работает.
- MySQL подключен и отвечает.
- uploads обслуживаются через volume.
- health endpoint подтверждает `php/mysql`.

### API-ручки, которые уже должны идти через PHP

- `/api/health`
- `/api/tournaments`
- `/api/news`
- `/api/news/:slug` или логика одиночной новости через PHP-источник
- `/api/matches`
- `/api/clubs`
- `/api/media/albums`
- переводческий endpoint PHP
- админские ручки сохранения, которые уже были переведены в ходе миграции

### Что уже отвязано от старой схемы

- фронт больше не должен ориентироваться на старый Railway Node backend
- основная рабочая база уже MySQL
- PostgreSQL больше не должен быть рабочей базой production
- legacy Node-код уже архивирован в `archive/`

## Что еще осталось добить по LAMP-переносу

### Технические хвосты

- Финально убедиться, что вообще не осталось скрытых зависимостей от старого Node API.
- Финально убедиться, что нигде не осталось скрытых зависимостей от старой PostgreSQL-схемы.
- Проверить, все ли admin-save сценарии действительно ходят только в PHP API.
- Проверить, что загрузка файлов и URL uploaded media полностью совместимы с будущим обычным LAMP-хостингом.

### По окружению

- Проверить финальный набор env-переменных для обычного хостинга:
  - что обязательно нужно
  - что Railway-специфично
  - что можно упростить
- Подготовить компактную схему env для будущего LAMP-хостинга:
  - DB host
  - DB port
  - DB name
  - DB user
  - DB password
  - admin password/token
  - cloudinary keys

### По коду

- Проверить, остались ли в репозитории старые вспомогательные Node-скрипты, которые еще нужны или уже нет.
- Проверить, нет ли во фронте участков, которые ждут Railway-специфичное поведение.
- По возможности довести API до максимально “обычной” LAMP-структуры:
  - чтобы его можно было перенести без Docker-зависимости

### По деплою

- Подготовить отдельный checklist переноса на типичный LAMP-хостинг.
- Проверить, какие пути для uploads и rewrite понадобятся вне Railway.
- Подготовить список файлов и папок, которые точно должны быть перенесены на новый хостинг.

## Чек-лист перед переносом на обычный LAMP-хостинг

### Код

- Убедиться, что актуальная рабочая ветка — `main`.
- Убедиться, что все последние важные изменения закоммичены.
- Убедиться, что `WORKLOG.md` актуален.
- Убедиться, что `archive/` сохранен и при необходимости доступен для ручного восстановления.

### Данные

- Убедиться, что вся актуальная база находится в MySQL.
- Убедиться, что архивные турниры реально есть в новой MySQL.
- Убедиться, что новости, клубы, матчи, партнеры и медиа отдаются из текущей базы.
- Убедиться, что uploads хранятся в volume и доступны.

### API

- Проверить:
  - `/api/health`
  - `/api/tournaments`
  - `/api/news`
  - `/api/matches`
  - `/api/clubs`
  - `/api/media/albums`
- Убедиться, что в ответах нет старых fallback-данных и несинхронных сущностей.

### Фронт

- Открыть:
  - главную
  - расписание
  - результаты
  - страницу матча
  - страницу клуба
  - страницу новостей
  - одну новость
  - медиа
  - один альбом
  - прошлые розыгрыши
  - архив 2025
  - контакты
- Проверить, что все эти страницы используют одни и те же данные во всех браузерах.

### Админка

- Проверить вход по паролю.
- Проверить хотя бы одно сохранение:
  - матча
  - партнера
  - новости
  - альбома
- Проверить, что показывается корректное уведомление об успешном сохранении.

### Медиа и assets

- Проверить логотипы клубов.
- Проверить логотипы партнеров.
- Проверить фото в каруселях.
- Проверить световые окна фотоальбомов.
- Проверить превью новостей.

## Чек-лист после деплоя на новый хостинг

### Первые 5 минут

- Открыть `/api/health`.
- Убедиться, что база определяется как `mysql`.
- Открыть главную страницу.
- Убедиться, что нет белого экрана, 500 или пустых блоков.

### Первые 15 минут

- Проверить `/api/tournaments`, `/api/news`, `/api/matches`, `/api/clubs`.
- Проверить страницу клуба.
- Проверить одну новость с фото.
- Проверить одну новость с видео.
- Проверить один архивный турнир.
- Проверить альбом и открытие фото в lightbox.

### После базовой проверки

- Войти в админку.
- Сохранить тестовое изменение и убедиться, что:
  - данных не теряются
  - ошибка сохранения не появляется
  - изменения реально видны на сайте

### Если после деплоя что-то не совпадает

- Проверить env-переменные.
- Проверить rewrite / маршрутизацию.
- Проверить права на uploads.
- Проверить соединение с MySQL.
- Проверить, не включился ли старый кэш браузера/CDN.
- Проверить, не смотрит ли фронт на другой базовый URL.

## Краткая памятка по продолжению работы в новом чате

Если этот файл открывают в новом чате без старого контекста, лучше действовать так:

1. Прочитать разделы:
   - `Текущее состояние production`
   - `Что уже переведено на PHP`
   - `Что еще осталось добить по LAMP-переносу`
2. Проверить:
   - `/api/health`
   - `/api/tournaments`
3. Сверить Railway:
   - service `burcup`
   - service `MySQL`
   - volume `burcup-volume`
4. Только после этого брать следующую продуктовую или инфраструктурную задачу.

- Архив 2025 года стал эталонным архивным разделом.
- В нем добавляли:
  - команды розыгрыша
  - турнирные таблицы
  - сетку
  - архивные матчи
  - пьедестал
- Пользователь несколько раз просил воспроизводить именно визуальный стиль 2025 года и переносить его на другие архивы.
- Позже был отдельный запрос:
  - убрать слово “архив” во многих местах
  - заменить его на “прошлые розыгрыши”
- Также меняли CTA:
  - вместо “Открыть розыгрыш 2025” сделать “Открыть все розыгрыши”

#### Пьедестал архивных команд

- Это один из самых долго шлифуемых блоков.
- Было несколько неудачных попыток:
  - карточки становились слишком узкими
  - логотипы наезжали друг на друга
  - места и города переносились некрасиво
- В финале приняли концепцию:
  - 1 место — по центру и выше
  - 2 место — слева и чуть ниже
  - 3 место — справа и еще ниже
  - логотипы больше, как у обычных карточек
  - вытягиваются только сами карточки по высоте
  - нижняя линия визуально должна ощущаться общей
- Отдельно позже меняли реальное распределение мест между Алмазом и Зенитом.

#### Перевод сайта

- Был большой этап, когда обсуждали, чтобы весь новый контент переводился автоматически, а не вручную.
- После внедрения перевода отдельно ловили зоны, где он не работал:
  - архивные страницы
  - таблицы
  - отдельные интерфейсные надписи
- Из этого важно помнить:
  - перевод — это уже часть системной логики проекта, а не разовые ручные правки.

#### Логотипы и изображения

- Отдельно много раз чинили логотипы:
  - турнира
  - клубов
  - партнеров
- Частые типы проблем:
  - не грузится
  - вытянут/сжат
  - слишком темный
  - слишком маленький
  - не та версия изображения
- Для Вильярреала, например, отдельно переустанавливали логотип из нового файла.
- Пользователь много раз подчеркивал, что размер и форма логотипа важны визуально.

#### Контент со старого сайта

- Со старого сайта переносились:
  - новости
  - архивные матчи
  - фото карусели на главной
  - описания команд и участников
  - логотипы исторических участников
- При переносе всегда важно помнить:
  - не все можно “тупо спарсить”
  - многие вещи затем вручную доводились под новый стиль
  - особенно это касается новостей, архивов и фото

#### Что уже обсуждалось очень много раз и считается согласованным

- большая шапка только на главной
- короткая шапка на остальных страницах
- карточки матчей — компактные, чистые, без лишнего мусора
- партнеры — спокойные в обычном состоянии и цветные на hover
- новости — аккуратные статьи, а не dump контента
- архив 2025 — референс для архивных розыгрышей
- сетка плей-офф — вытянутая горизонтальная схема, а не квадратная
- мобильная версия — максимально близка к десктопу, где это важно, через скролл

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

### Что удобно попросить в новом чате сразу

- “Прочитай `WORKLOG.md` и продолжи с последнего состояния”
- “Сначала проверь `api/health` и `api/tournaments`, потом продолжай”
- “Сверь текущее состояние Railway с журналом”
- “Не трогай секреты, работай только по журналу и коду”

### Что уже точно важно помнить

- Проект уже живет на `PHP + MySQL`.
- Новый Railway-проект называется `BurCup`.
- Продовый сервис называется `burcup`.
- База данных в новом проекте — отдельный `MySQL`.
- Uploads вынесены в `burcup-volume`.
- Главный публичный индикатор, что все живо:
  - `https://burcup-production.up.railway.app/api/health`
- Главный индикатор, что подтянулись реальные данные:
  - `https://burcup-production.up.railway.app/api/tournaments`

---

## 2026-04-20 02:20

### Что сделали

- Превратили журнал не только в историю изменений, но и в практическую памятку для восстановления работы.
- Добавили разделы:
  - быстрый старт для нового чата
  - что делать в первые 5 минут при сбое
  - где искать данные в Railway
  - где искать доступы
  - что нельзя трогать без проверки
  - что проверять перед крупными изменениями
- Сделали журнал более самодостаточным для продолжения работы без старой истории чата.

### Что проверили

- Все новые разделы не содержат секретов.
- Журнал по-прежнему хранит только безопасный для репозитория контекст.
- Структура файла остается пригодной и как история, и как recovery-doc.

### Что осталось

- По мере следующих задач продолжать логировать не только изменения кода, но и изменения инфраструктуры.
- Если будут новые production-сервисы, домены или хранилища, сразу дописать их сюда.

### Файлы

- [WORKLOG.md](/Users/kainarbaev_daniar/Downloads/последний эталон/WORKLOG.md)

### Коммиты

- Будет отдельный коммит после обновления журнала.

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

## 2026-04-21 00:20

### Что сделали

- На новом Railway PHP-проекте выполнили живую проверку admin write/read цикла против новой MySQL.
- Авторизовались через `POST /api/admin/session` с текущим паролем админки.
- Считали продовые данные партнеров через `GET /api/admin/partners`.
- Временно записали тестовую пометку в партнера `bank-vtb` через `PUT /api/admin/partners`.
- Сразу перечитали API и подтвердили, что новое значение вернулось из базы.
- После проверки вернули исходный JSON партнеров без тестовой пометки.
- Отдельно нашли PHP-runtime хвост по `uploads`: загруженные файлы по URL `/uploads/...` на новом проекте отдавали `404`.
- Исправили [router.php](/Users/kainarbaev_daniar/Downloads/последний эталон/router.php), чтобы в PHP built-in runtime он явно раздавал файлы из `lamp-api/public/uploads`.
- Зафиксировали новое правило работы: важные шаги, проверки и миграционные действия записываем в журнал сразу, без отдельного запроса у пользователя.

### Что проверили

- `POST /api/admin/session` на новом продовом проекте успешно возвращает токен.
- `GET /api/admin/partners` и `GET /api/admin/matches` читают реальные продовые данные из PHP API.
- Запись партнеров через `PUT /api/admin/partners` проходит успешно.
- Перечитывание после записи подтверждает, что новый Railway-проект реально пишет в новую MySQL.
- Откат после теста тоже проходит нормально.
- Тестовая загрузка через `POST /api/admin/uploads/image` проходит успешно.
- Новый тестовый файл по адресу `/uploads/burcup/test/router-check.png` открывается с `HTTP 200`.
- Старый адрес вида `/uploads/burcup/news/image/...` после правки роутера все еще может отдавать `404`, если самого файла нет в новом volume.

### Что осталось

- Перенести в новый volume старые загруженные медиа, которые еще ссылаются на прежний storage набора `uploads/...`.
- После этого перейти к следующему сценарию LAMP-переноса: браузерная проверка админки и файловых загрузок уже на новой PHP-связке.

### Файлы

- [router.php](/Users/kainarbaev_daniar/Downloads/последний эталон/router.php)
- [WORKLOG.md](/Users/kainarbaev_daniar/Downloads/последний эталон/WORKLOG.md)

### Коммиты

- `0d9d42f` — Verify PHP admin writes and serve uploads via router

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

## 2026-04-21 17:20

### Что сделали

- Проверили новый Railway-проект после переключения на собственную MySQL.
- Подтвердили, что PHP API нового проекта отвечает с `runtime=php` и `database=mysql`.
- Подтвердили, что `api/tournaments` уже возвращает не только основной сезон `2026`, но и прошлые розыгрыши `2025`, `2024`, `2023`, `2019`, `2018`.
- Подтвердили, что новый проект фактически работает уже на своей новой MySQL, а не только формально поднят на PHP.

### Что проверили

- [https://burcup-production.up.railway.app/api/health](https://burcup-production.up.railway.app/api/health)
  - ответ: `{"ok":true,"runtime":"php","database":"mysql"}`
- [https://burcup-production.up.railway.app/api/tournaments](https://burcup-production.up.railway.app/api/tournaments)
  - в ответе присутствуют:
    - `burchalkin-cup-2026`
    - `burchalkin-cup-2025`
    - `burchalkin-cup-2024`
    - `burchalkin-cup-2023`
    - `burchalkin-cup-2019`
    - `burchalkin-cup-2018`
- В Railway-графе у нового проекта появилась визуальная связь сервиса с новой MySQL после корректной замены переменных окружения.

### Вывод

- Новый Railway-проект уже вышел на рабочую стадию как отдельный PHP + MySQL инстанс.
- База данных для нового проекта подключена правильно.
- Архивные турниры присутствуют в новой MySQL и реально отдаются через production PHP API.

### Что осталось

- Проверить сохранения через браузерную админку уже на новом проекте в обычном пользовательском сценарии.
- Проверить целостность медиа и старых `uploads`, если какие-то старые материалы еще не перенесены в новый volume.
- Продолжить добивать последние хвосты перед полноценным переносом на обычный LAMP-хостинг.

### Файлы

- [WORKLOG.md](/Users/kainarbaev_daniar/Downloads/последний эталон/WORKLOG.md)

---

## 2026-04-21 17:45

### Что сделали

- Проверили, есть ли в production API ссылки на старые файлы из `/uploads`.
- Подтвердили, что такие ссылки все еще встречаются в данных, в первую очередь в новостях.
- Проверили несколько реальных URL на новом Railway-проекте.
- Добавили локальный служебный скрипт для аудита ссылок на `/uploads`, чтобы дальше не искать их вручную.

### Что проверили

- В `api/news` присутствуют ссылки вида:
  - `/uploads/2025/05/img_4304-scaled.jpg`
  - `/uploads/2024/05/240517_1020-scaled.jpg`
  - `/uploads/2023/05/230521_0235-scaled.jpg`
  - `/uploads/2026/04/...jpg`
- Проверка этих URL на новом проекте дала `HTTP 404`.
- Это означает, что новая PHP/MySQL инфраструктура уже работает, но старые файлы в новый volume еще не перенесены.
- Локально в репозитории старых медиа не найдено; в новом `lamp-api/public/uploads` сейчас только:
  - `.gitkeep`
  - `.htaccess`

### Вывод

- Следующий отдельный технический хвост по переносу — это не API и не база, а именно старые `uploads`.
- Пока их не перенесем или не перепривяжем контент на внешние URL, часть старых новостей и медиа будет продолжать вести на `404`.

### Что осталось

- Либо массово перенести старые файлы из прежнего источника в новый volume.
- Либо переписать старые записи новостей/альбомов на уже существующие внешние URL, где это возможно.
- После этого отдельно перепроверить старые новости и мультимедиа-страницы на битые изображения и видео.

### Файлы

- [scripts/audit-upload-refs.mjs](/Users/kainarbaev_daniar/Downloads/последний эталон/scripts/audit-upload-refs.mjs)
- [WORKLOG.md](/Users/kainarbaev_daniar/Downloads/последний эталон/WORKLOG.md)

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

---

## 2026-04-21

### Что проверили

- Перепроверили новый production Railway-проект через живые PHP-ручки:
  - `/api/health`
  - `/api/tournaments`
  - `/api/clubs`
  - `/api/news`
- Подтвердили, что новый проект уже читает богатые данные из новой MySQL:
  - есть архивные турниры `2018, 2019, 2023, 2024, 2025, 2026`
  - есть реальные клубы, исторические клубы и технические placeholder-команды
  - есть большой список новостей, а не только старые тестовые записи

### Что нашли

- На одном браузере и в другом браузере пользователь видел разные данные на публичных страницах.
- Код фронта показал, что production больше не должен использовать локальные `data/*.json` fallback'и:
  - в `js/config.js` localStorage override разрешен только для localhost
  - в `js/site.js` static fallback разрешен только в local dev
- Самая вероятная причина расхождения: старые закэшированные версии фронтенд-ассетов (`style.css`, `config.js`, `site.js`, `admin.js`) в разных браузерах.

### Что сделали

- Подняли cache-bust версии на основных HTML-страницах:
  - `css/style.css?v=20260421-cache-sync-1`
  - `js/config.js?v=20260421-cache-sync-1`
  - `js/site.js?v=20260421-cache-sync-1`
  - `js/admin.js?v=20260421-cache-sync-1`
- Обновили внутреннюю версию клиентского кэша в `js/site.js`:
  - `APP_CACHE_VERSION = '2026-04-21-cache-sync-v1'`

### Зачем это сделали

- Чтобы все браузеры принудительно запросили свежие JS/CSS-файлы и перестали показывать разные наборы данных из-за старого кэша.
- Это особенно важно после перехода фронта на same-origin PHP API и после миграции данных на новый Railway/MySQL проект.

### Файлы

- [js/site.js](/Users/kainarbaev_daniar/Downloads/последний эталон/js/site.js)
- [index.html](/Users/kainarbaev_daniar/Downloads/последний эталон/index.html)
- [admin-almaz.html](/Users/kainarbaev_daniar/Downloads/последний эталон/admin-almaz.html)
- и остальные публичные HTML-страницы, где подключаются `style.css`, `config.js`, `site.js`

---

## 2026-04-21

### Дополнительная production-диагностика PHP API

- Чтобы быстро понять, почему новый production `/api/tournaments` видит только сезон `2026`, хотя новая MySQL уже содержит архивы `2025, 2024, 2023, 2019, 2018`, в PHP API добавлена безопасная диагностика в `/api/health`.
- Теперь `/api/health` временно отдает:
  - `db_connection.source` — откуда PHP собрал подключение (`url` или `legacy_vars`)
  - `db_connection.host`
  - `db_connection.port`
  - `db_connection.database`
  - `tournaments_count`
  - `tournaments_preview` — первые строки из таблицы `tournaments`
- Параллельно в `Database.php` вынесен общий метод `resolvedConfig()`, чтобы `health` и основное подключение использовали одну и ту же логику определения источника БД.
- Это временный debug-слой для новой Railway production-связки `PHP + MySQL`, чтобы без догадок увидеть, на какую именно базу смотрит runtime и сколько турниров он реально читает.

### Что сделали

- Досеяли архивные турниры `2018, 2019, 2023, 2024, 2025` в новую Railway MySQL нового проекта.
- Подтвердили прямым запросом к новой MySQL, что архивные турниры уже существуют как реальные записи в таблице `tournaments`:
  - `2026 -> id=1`
  - `2025 -> id=2`
  - `2024 -> id=3`
  - `2023 -> id=4`
  - `2019 -> id=5`
  - `2018 -> id=6`
- После этого подготовили production-код к окончательному отказу от hardcoded fallback архивных турниров в PHP-репозитории турниров.

### Что это значит

- Новый проект больше не должен зависеть от старого fallback-массива архивных турниров.
- Источник списка турниров теперь должен быть только один: новая MySQL в новом Railway-проекте.
- Это закрывает еще один важный хвост миграции "все на новое, ничего на старом".

### Что еще нашли и поправили

- После удаления fallback-а production `/api/tournaments` показал только `2026`, хотя в новой MySQL уже были реальные записи архивов `2025..2018`.
- Причина оказалась в приоритете переменных окружения в PHP:
  - раньше `MYSQLHOST/MYSQLDATABASE/...` имели более высокий приоритет, чем явный `MYSQL_URL`
  - это делало Railway-конфигурацию хрупкой: при оставшихся старых host-based переменных сервис мог смотреть не в ту базу
- Исправили `lamp-api/app/Database.php`, чтобы сначала использовались явные URL-переменные:
  - `MYSQL_URL`
  - `MYSQL_PUBLIC_URL`
  - `DATABASE_URL`
  - `DATABASE_PUBLIC_URL`
  - `DB_URL`
- Только если URL-переменные не заданы, PHP теперь собирает DSN из `MYSQLHOST/MYSQLDATABASE/...`

### Зачем это сделали

- Чтобы можно было жестко и прозрачно привязать новый Railway/PHP проект к новой MySQL одной переменной `MYSQL_URL`.
- Чтобы новый проект больше не зависел от скрытых/старых host-based переменных из старой схемы подключения.
- Это важный шаг именно для цели "все на новое, ничего на старом".

### Файлы

- [lamp-api/app/Repositories/TournamentsRepository.php](/Users/kainarbaev_daniar/Downloads/последний эталон/lamp-api/app/Repositories/TournamentsRepository.php)
- [lamp-api/app/Database.php](/Users/kainarbaev_daniar/Downloads/последний эталон/lamp-api/app/Database.php)
- [archive/legacy-tools/scripts/import-archive-tournaments.mjs](/Users/kainarbaev_daniar/Downloads/последний эталон/archive/legacy-tools/scripts/import-archive-tournaments.mjs)

### Прямое дозаполнение архивных турниров в живую production-базу

- После дополнительной диагностики стало ясно, что production PHP runtime действительно смотрит в живую MySQL нового проекта (`db_connection.source = url`, `host = mysql.railway.internal`, `database = railway`), но в этой базе был только один турнир `2026`.
- Прямой импорт архивных турниров через внешний proxy URL не повлиял на live API, поэтому архивы были записаны напрямую в текущую production-базу через действующий PHP admin endpoint:
  - вход в `/api/admin/session` по паролю админки
  - чтение `/api/admin/tournaments`
  - сохранение полного объединенного списка через `PUT /api/admin/tournaments`
- В процессе нашли точную причину первого `500` при сохранении:
  - в MySQL поле `tournaments.status` использует enum со значением `archived`
  - сначала по ошибке было отправлено `archive`
  - после исправления значения на `archived` сохранение прошло успешно

### Результат

- Production `PUT /api/admin/tournaments` вернул `200 OK`
- В живой production-базе появились архивные турниры:
  - `2025`
  - `2024`
  - `2023`
  - `2019`
  - `2018`
- Повторная проверка подтвердила итог:
  - `/api/health` теперь показывает `tournaments_count = 6`
  - `/api/tournaments` отдает все турниры, а не только `2026`
- Это означает, что текущий production Railway проект теперь действительно читает архивные турниры из своей живой MySQL, а не зависит от старой базы или fallback-данных.

### Дополнительная фиксация

- 22 апреля 2026 отдельно перепроверили новый Railway-проект `BurCup` уже после перевода на `MYSQL_URL`.
- `GET /api/health` вернул:
  - `source = "url"`
  - `host = "mysql.railway.internal"`
  - `database = "railway"`
  - `tournaments_count = 6`
- `GET /api/tournaments` вернул полный набор турниров с реальными id:
  - `2026` (`id = 1`)
  - `2025` (`id = 5`)
  - `2024` (`id = 6`)
  - `2023` (`id = 7`)
  - `2019` (`id = 8`)
  - `2018` (`id = 9`)
- Это финально подтвердило, что новый production-проект уже смотрит в свою новую MySQL и отдает архивные турниры не из fallback и не из старого проекта.

### Что это закрывает

- Закрыт главный блокер по турнирам в новом проекте.
- Новый production проект теперь хранит список текущего и прошлых розыгрышей в собственной живой MySQL.
- Дальше можно переходить к следующему слою миграции: архивные матчи, таблицы, клубы и остальные archive-данные, уже без зависимости от старого проекта.

### Уточнение по фактическому способу успешного заполнения архивов

- 22 апреля 2026 дополнительно перепроверили путь заполнения архивных турниров уже после перевода production на `MYSQL_URL`.
- Локальный `php` в среде разработки отсутствовал, поэтому PHP-сидер напрямую запустить не удалось.
- Вместо этого использовали уже существующий Node-импортер:
  - [archive/legacy-tools/scripts/import-archive-tournaments.mjs](/Users/kainarbaev_daniar/Downloads/последний эталон/archive/legacy-tools/scripts/import-archive-tournaments.mjs)
- Импорт был выполнен напрямую в новую Railway MySQL по рабочему DSN нового проекта.
- После выполнения импортера production сразу начал видеть архивные турниры:
  - `GET /api/health` показал `tournaments_count = 6`
  - `GET /api/tournaments` начал отдавать `2026, 2025, 2024, 2023, 2019, 2018`
- Это подтвердило, что проблема была не в PHP-репозитории чтения и не в API-роутинге, а именно в том, что новая база до этого еще не была заполнена архивными турнирами.

### Финальная публичная проверка архивных турниров

- После завершения импорта отдельно перепроверили уже именно публичную production-ручку, а не только диагностику и админские endpoint'ы.
- `GET https://burcup-production.up.railway.app/api/tournaments` вернул полный набор турниров:
  - `2026`
  - `2025`
  - `2024`
  - `2023`
  - `2019`
  - `2018`
- Это окончательно закрыло сомнение, что архивы видны только в админке или только через `health`: теперь они подтверждены и на публичном API, который использует фронт сайта.
- На этом этап по миграции списка турниров в новый Railway/LAMP-контур можно считать завершенным.

### Дополнительная диагностика подключения новой Railway MySQL

- После перехода на новый Railway-проект и отдельную новую MySQL обнаружили промежуточный симптом:
  - `GET /api/health` показывал `source = "url"`, но при этом `host = "mysql.railway.internal"` и в `tournaments_count` снова был только `1`
  - `GET /api/tournaments` отдавал только `2026`
- Чтобы не гадать по косвенным признакам, в production PHP API добавили расширенную диагностику в `health`:
  - `db_env_source.kind`
  - `db_env_source.key`
  - `db_env_source.value`
- Эта диагностика нужна, чтобы явно видеть:
  - какая именно env-переменная победила (`MYSQL_URL`, `MYSQL_PUBLIC_URL`, `DATABASE_URL`, `MYSQLHOST/...`)
  - какой DSN в маскированном виде реально используется в рантайме
- По итогам проверки стало понятно:
  - PHP действительно выбирает URL-подключение
  - но сам рантайм Railway подставляет внутрь контейнера internal-host (`mysql.railway.internal`) как фактическую точку подключения к новой MySQL
  - это само по себе нормально и не означает возврата на старый проект
- Главный критерий истины здесь не имя host, а фактическое содержимое базы:
  - если `health` показывает только `1` турнир, значит именно в этой новой Railway MySQL еще не было архивов
  - если после импорта `health` и `api/tournaments` видят все годы, значит сервис уже смотрит в правильную новую базу

### Конфликт Railway env-переменных MySQL

- Позже выявили еще один пограничный сценарий: даже после ручной установки `MYSQL_URL` с public proxy URL новая production-диагностика могла показывать:
  - `db_connection.source = "url"`
  - `db_connection.host = "mysql.railway.internal"`
  - `tournaments_count = 1`
- Это выглядело так, будто PHP использует URL-подключение, но по факту попадает не в ту базу, где уже лежат все архивные данные.
- Чтобы убрать конфликт с автоматически именуемыми Railway-переменными (`MYSQL_URL`, `MYSQL_PUBLIC_URL`, `MYSQLHOST` и т.д.), в PHP-слое ввели отдельный явный приоритетный ключ:
  - `BURCUP_MYSQL_URL`
- После этого стратегия такая:
  - для production `burcup` используем именно `BURCUP_MYSQL_URL`
  - стандартные `MYSQL_URL` / `MYSQL_PUBLIC_URL` больше не считаем надежным единственным источником правды для этого проекта
- Это дает два преимущества:
  - мы жестко контролируем, какой DSN читает PHP
  - Railway больше не может “магически” подменить нам ожидаемое подключение одноименным служебным ключом

### Production build-marker для проверки актуальности кода

- После того как production начал показывать `tournaments_count = 6`, но в JSON `health` все еще не было части ожидаемой диагностики, добавили в `GET /api/health` еще один явный build-marker:
  - `api_build = "lamp-health-v4-2026-04-23"`
- Это нужно для быстрой проверки, что Railway реально крутит актуальный код из репозитория, а не старый успешный deploy.
- Если в `health` виден этот маркер, значит:
  - текущая версия PHP API точно уже свежая
  - можно дальше разбирать уже не вопрос деплоя, а реальное содержимое новой MySQL

### Health diagnostics v5 для финальной проверки env в Railway

- После проверки user прислал production `health`, где:
  - `api_build = "lamp-health-v4-2026-04-23"`
  - `tournaments_count = 6`
  - `db_connection.host = "mysql.railway.internal"`
  - `db_env_source.kind = "legacy_vars"`
- Это уже подтвердило, что новая база данных содержит все турниры, но осталось непонятно, почему PHP рантайм все еще не показывает в ответе расширенный блок `db_env_presence`.
- Для снятия этой неопределенности подняли build-marker еще раз:
  - `api_build = "lamp-health-v5-2026-04-23"`
- Цель v5:
  - убедиться, что прод действительно задеплоил версию с `db_env_presence`
  - после этого уже окончательно решить, какие legacy-переменные Railway можно безопасно удалить у сервиса `burcup`

### Подготовка дампа MySQL для импорта в Timeweb через phpMyAdmin

- Для переноса сайта на LAMP-хостинг `timeweb.ru` подготовили локальный SQL-дамп текущей MySQL Railway:
  - `/Users/kainarbaev_daniar/Downloads/последний эталон/burcup_dump.sql`
- При первом импорте через phpMyAdmin пользователь получил ошибку:
  - `#1046 — База данных не выбрана`
- Причина:
  - импорт был запущен на уровне сервера MySQL, а не внутри конкретной выбранной базы данных
- Зафиксирован правильный порядок:
  - сначала выбрать нужную БД слева в phpMyAdmin
  - потом открыть вкладку `Импорт`
  - только после этого загружать SQL-файл

- На следующем шаге проявилась MySQL-ошибка совместимости:
  - `#3105 - The value specified for generated column 'goal_diff' in table 'tournament_standings' is not allowed.`
- Разбор показал:
  - в дампе колонка `tournament_standings.goal_diff` объявлена как generated/stored:
    - `GENERATED ALWAYS AS ((goals_for - goals_against)) STORED`
  - но старый дамп все равно пытался вставлять в нее явные значения в `INSERT INTO tournament_standings (...)`
- Для Timeweb подготовлен отдельный совместимый дамп:
  - `/Users/kainarbaev_daniar/Downloads/последний эталон/burcup_dump_timeweb.sql`
- Что изменено в совместимом дампе:
  - из `INSERT INTO tournament_standings (...)` удалена колонка `goal_diff`
  - из соответствующих `VALUES (...)` удалены ее явные значения
  - сама схема таблицы сохранена, поэтому `goal_diff` будет вычисляться MySQL автоматически
- Технический итог подготовки:
  - обработано `48` вставок `tournament_standings`
  - размер нового дампа около `2.1 MB`

- Для импорта в Timeweb нужно использовать именно:
  - `/Users/kainarbaev_daniar/Downloads/последний эталон/burcup_dump_timeweb.sql`
- Если до этого старый импорт успел частично создать таблицы, безопаснее:
  - либо удалить и заново создать пустую БД
  - либо очистить все уже импортированные таблицы
  - и только потом импортировать `burcup_dump_timeweb.sql`

### Timeweb image serving fix for uploaded news photos

- Fixed a deployment mismatch between the stored upload URLs and the Timeweb document root.
- The upload controller now writes new files to the site-root `uploads/` directory and mirrors them to the legacy `lamp-api/public/uploads/` path for compatibility.
- Uploaded URLs still resolve as `/uploads/...`, which now maps to a real folder on Timeweb and Railway.

### News article gallery rendering fix

- The news article page was hiding the photo gallery whenever `body_html` existed.
- Removed that condition so attached news photos render below the article text as well.

### News photo dedupe fix

- The news article photo builder was deduping only by exact URL string.
- Switched dedupe to a URL stripped of query/hash fragments so the same file does not appear twice when the source URL has tracking noise.

### News article image rendering balance

- Restored article-side photo rendering for news items that have attached images but also use `body_html`.
- Gallery images are now filtered against images already present inside the article body, while the cover/media block stays visible unless that exact image is already embedded in the body.

### News article body image cleanup

- When a news article already has attached photos, strip inline `<img>`, `<picture>`, and `<figure>` elements from the rendered body so the page does not show the same story image three times.

### News article cover suppression

- If a news article has attached photos, hide the separate cover media block on the article page so the same story does not appear both as a cover and as a gallery image.

### News article gallery reset

- When a news article has attached photos, render the article body as text-only and show the attached photos in the gallery block instead.
- This keeps the article readable and preserves all attached photos without relying on inline `<img>` tags inside `body_html`.

### News article inline photos restored

- Restored inline article photos inside `body_html` so news posts can display their images in the original story flow again.
- The gallery is now only used when a news post has attached photos but no inline body images.

### News article baseline rollback

- Rolled news article photo rendering back to the last stable baseline where cover media and the attached photo gallery both render again.
- This gives us a clean starting point to rework the duplicate-photo handling without losing article images.

### News article inline photo mode

- If a news article already contains inline images in `body_html`, do not render a separate bottom gallery.
- This keeps photos in the article flow again and reserves the gallery for posts that only have attached photos without inline body images.

### News article no-bottom-gallery reset

- Simplified the news article renderer so `body_html` keeps its inline photos in place and the page does not add a separate photo strip underneath it.
- Posts without inline images can still fall back to the attached photo gallery.

### News article image paragraphs preserved

- Do not delete paragraphs that only contain `<img>`, `picture`, or `figure` nodes when sanitizing `body_html`.
- This prevents inline article photos from disappearing when the paragraph has no text around it.

### News article image quality bump

- Increased the optimized width for article cover/lightbox images so wide news layouts do not stretch a 960px rendition.
- This keeps the news cover sharper on desktop while leaving the rest of the site unchanged.

### News photo quality tuning

- Increased the render width and quality for news article photos so large featured images do not look soft on desktop.
- Kept the inline body-photo handling intact so text-in-body images still render where they were originally authored.

### WordPress thumbnail expansion

- Expanded `wp-content/uploads/...-300x200.jpg` style thumbnails to their original full-size source when rendering news body images.
- This fixes the blurry inline photos that were saved from WordPress as tiny previews instead of originals.

### Public clubs endpoint narrowed to current tournament

- Changed the public `/api/clubs` endpoint to return only the clubs linked to the featured tournament.
- Kept the admin clubs catalog on the full `clubs` table so editorial workflows still see the complete registry.
- Sorted the public club list by `tournament_clubs.group_name` and `seeded_order` so the 2026 groups render in the intended order.

### Club locations backfill

- Filled missing `country` and `city` values for the 2026 tournament clubs in the seed and dump data.
- Added a one-time MySQL backfill script for existing Railway and Timeweb databases so the public club cards show locations consistently.

### Partner link fallback

- Public partner cards now stay non-clickable when `website_url` is empty.
- The change applies to both API-rendered partner cards and the static fallback partner blocks.

### Partner visibility toggle in admin

- Added a quick hide/show action to partner and media-partner cards in the admin UI.
- Hidden partners remain in the editor, but their public cards stay off the site until re-enabled.

### Hidden partners no longer reappear from static fallbacks

- The public partner renderer no longer restores hidden cards from the static
  fallback list when a partner is absent from the visible API payload.
- The featured-tournament partner render now only decorates cards after the API
  data has loaded, so fully hidden partner sets stay hidden on the site.

### Komsomolskaya Pravda logo swap

- Replaced the shared `images/partners/komsomolskaya-pravda.png` asset with the
  new provided logo file so every page and partner reference picks up the same
  image automatically.

### Timeweb load and translation smoothing

- Deferred the heaviest page renderers until after the first paint so the home
  page and inner pages can become interactive sooner on Timeweb.
- Moved Cloudinary image upgrading off the critical path so the first render
  does less synchronous image processing.
- Debounced the English-language DOM observer and stopped it from reacting to
  every text-node mutation, which reduces repeated full-page translation passes.
- Trimmed a couple of hero-image preload/fetch-priority hints to lower initial
  bandwidth pressure on reload.

### Partner lookup across translated pages

- Static sponsor grids now resolve partners by either the original Russian
  label or the translated label, so the English version of `contacts.html` and
  other pages keeps the same partner set as the Russian version.

### Translation provider fallback

- The server-side translation repository now falls back to `google-gtx` even
  if the config still says `openai`, which keeps long-form page translation from
  degrading into partial word-by-word fallback on some pages.


## 2026-04-26 16:20
- Timeweb/nginx does not honor the previous .htaccess clean-URL redirect for static .html pages.
- Added folder-based page copies (/<slug>/index.html) with <base href="/"> so clean URLs can work without server rewrites.
- Kept client-side canonicalization in js/site.js to normalize /page.html -> /page/ and rewrite internal links after load.

## 2026-04-26 16:35
- Added a click interceptor in js/site.js so stale internal .html links are rewritten to clean folder URLs at navigation time.
- This should protect transitions from folder pages even if some old links remain in cached markup or uploaded copies.

### 2026-04-26 17:10
- Added an editable homepage hero carousel to the admin UI.
- The admin now exposes a `hero_carousel` source with desktop and mobile image URLs, alt text, and manual ordering.
- Public hero slides are served from `/api/hero-carousel`, with a database-backed `homepage_hero_slides` table and a fallback to the existing static slides if the API is unavailable.

### 2026-04-27
- Added a guard so the homepage hero carousel does not re-apply identical API data after first paint, which prevents double image reloads on refresh.
- Rendered hero carousel image labels in the admin from their configured field labels, so desktop and mobile images are easier to distinguish.

### 2026-04-27 mobile match cards
- Tightened the mobile layout for head-to-head match blocks, archive match cards, and media match cards so they read like compact cards instead of stretched tables.
- Reduced logo sizes and spacing on small screens to keep team rows and scores aligned in one vertical stack.

### 2026-04-27 mobile match card polish
- Made the mobile head-to-head, archive match, and media match cards closer to the homepage upcoming cards by stacking the content more cleanly and reducing the visual weight of logos and scores.
- Tightened spacing and action-button width on small screens so the match blocks read like cards instead of nested tables.
