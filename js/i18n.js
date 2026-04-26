
(function() {
  const STORAGE_KEY = 'bc_lang';
  const DEFAULT_LANG = 'ru';
  const AUTO_TRANSLATION_CACHE_KEY = 'bc_lang_auto_cache_v1';
  const AUTO_TRANSLATION_BATCH_SIZE = 25;
  const AUTO_TRANSLATION_PARALLEL_REQUESTS = 3;
  const AUTO_TRANSLATION_MAX_CHARS = 6000;
  const AUTO_TRANSLATION_RETRY_DELAY = 60000;
  const exactMap = {
  "Главная": "Home",
  "Новости": "News",
  "Команды": "Teams",
  "Расписание": "Schedule",
  "Результаты": "Results",
  "Трансляции": "Broadcasts",
  "Медиа": "Media",
  "О турнире": "About the Tournament",
  "О Льве Бурчалкине": "About Lev Burchalkin",
  "Контакты": "Contacts",
  "Русский": "Russian",
  "Открыть меню": "Open menu",
  "Закрыть меню": "Close menu",
  "Предыдущий слайд": "Previous slide",
  "Следующий слайд": "Next slide",
  "Слайд 1": "Slide 1",
  "Слайд 2": "Slide 2",
  "Слайд 3": "Slide 3",
  "Расписание турнира": "Tournament schedule",
  "Правила турнира": "Tournament rules",
  "Обратный отсчёт до старта турнира": "Countdown to the tournament start",
  "Дней": "Days",
  "Часов": "Hours",
  "Минут": "Minutes",
  "Секунд": "Seconds",
    "Предыдущие матчи": "Previous matches",
    "Следующие матчи": "Next matches",
    "Предыдущие турниры": "Previous tournaments",
    "Следующие турниры": "Next tournaments",
    "Карта ФК Алмаз-Антей": "Almaz-Antey FC Map",
    "Карта": "Map",
  "Партнёры": "Partners",
  "Основные партнёры": "Main partners",
  "Информационные партнёры": "Media Partners",
  "Ближайшие матчи": "Upcoming Matches",
  "Последние новости": "Latest News",
  "Турнирная таблица": "Standings",
  "Сетка плей-офф": "Playoff bracket",
  "Полуфиналы": "Semifinals",
  "Финалы": "Finals",
  "Плей-офф за 1–4 места": "Playoffs for 1st–4th places",
  "Плей-офф за 5–8 места": "Playoffs for 5th–8th places",
  "1/2 финала": "Semifinals",
  "Финальный день": "Final day",
  "Полуфинал 1–4 №1": "1–4 semifinal #1",
  "Полуфинал 1–4 №2": "1–4 semifinal #2",
  "Полуфинал 1": "Semifinal 1",
  "Полуфинал 2": "Semifinal 2",
  "Полуфинал 5–8 №1": "5th–8th semifinal #1",
  "Полуфинал 5–8 №2": "5th–8th semifinal #2",
  "Матч за 1 место": "Match for 1st place",
  "Матч за 3 место": "Match for 3rd place",
  "Матч за 5 место": "Match for 5th place",
  "Матч за 7 место": "Match for 7th place",
  "Победитель 1–4 №1": "Winner 1–4 #1",
  "Победитель 1–4 №2": "Winner 1–4 #2",
  "Проигравший 1–4 №1": "Loser 1–4 #1",
  "Проигравший 1–4 №2": "Loser 1–4 #2",
  "Победитель полуфинала 1": "Winner of semifinal 1",
  "Победитель полуфинала 2": "Winner of semifinal 2",
  "Проигравший полуфинала 1": "Loser of semifinal 1",
  "Проигравший полуфинала 2": "Loser of semifinal 2",
  "Победитель 5–8 №1": "Winner of 5th–8th semifinal #1",
  "Победитель 5–8 №2": "Winner of 5th–8th semifinal #2",
  "Проигравший 5–8 №1": "Loser of 5th–8th semifinal #1",
  "Проигравший 5–8 №2": "Loser of 5th–8th semifinal #2",
  "Сетка плей-офф появится здесь.": "The playoff bracket will appear here.",
  "Как только в обеих группах будет по четыре команды, сайт автоматически покажет пары за 1–4 и 5–8 места.": "As soon as both groups have four teams, the site will automatically show the pairings for 1st–4th and 5th–8th places.",
  "Все матчи →": "All matches →",
  "Все новости →": "All news →",
  "Все результаты →": "All results →",
  "Участники турнира": "Tournament participants",
  "Участник турнира прошлых лет.": "Participant of previous editions of the tournament.",
  "Команды Кубка Бурчалкина 2026": "Burchalkin Cup 2026 Teams",
  "Кубок Бурчалкина 2026": "Burchalkin Cup 2026",
  "Кубок Бурчалкина 2025": "Burchalkin Cup 2025",
  "Кубок Бурчалкина 2024": "Burchalkin Cup 2024",
  "Кубок Бурчалкина 2023": "Burchalkin Cup 2023",
  "Кубок Бурчалкина 2019": "Burchalkin Cup 2019",
  "Кубок Бурчалкина 2018": "Burchalkin Cup 2018",
  "Кубок Бурчалкина": "Burchalkin Cup",
  "Открыть турнир": "Open tournament",
  "Открыть розыгрыш": "Open edition",
  "Матчи": "Matches",
  "Последние результаты": "Latest Results",
  "Прошлые розыгрыши": "Previous Editions",
  "Видео дня": "Video of the Day",
  "Галерея": "Gallery",
  "Фото с матчей и церемоний": "Photos from matches and ceremonies",
  "Лучшие моменты игрового дня": "Best moments of the day",
  "Команды и болельщики": "Teams and fans",
  "Оргкомитет": "Organizing Committee",
  "Телефон:": "Phone:",
  "Адрес:": "Address:",
  "Что ещё можно добавить": "What else can be added",
  "Реальные логотипы клубов в PNG/SVG": "Real club logos in PNG/SVG",
  "Полная сетка результатов 2025": "Full 2025 results bracket",
  "Русская и английская версии": "Russian and English versions",
  "Новостные карточки с изображениями": "News cards with images",
  "Начало пути": "The Beginning",
  "Форвард «Зенита»": "Zenit Forward",
  "Тренерская карьера и память": "Coaching Career and Legacy",
  "Итоги": "Results",
  "Когда и где": "When and Where",
  "Поддержка": "Support",
  "Участники VIII турнира": "Participants of the VIII Tournament",
  "Возрастная категория": "Age Category",
  "Кубок Бурчалкина 2025": "Burchalkin Cup 2025",
  "Разделы": "Sections",
  "Форма": "Form",
  "Сохранить": "Save",
  "Сбросить": "Reset",
  "Экспорт JSON": "Export JSON",
  "Загрузка…": "Loading…",
  "Удалить": "Delete",
  "+ Добавить запись": "+ Add item",
  "Логотип": "Logo",
  "Картинка": "Image",
  "Загрузить файл": "Upload file",
  "Превью появится здесь": "Preview will appear here",
  "Команда": "Team",
  "Команда 1": "Team 1",
  "Команда 2": "Team 2",
  "Команда 3": "Team 3",
  "Команда 4": "Team 4",
  "Команда 5": "Team 5",
  "Команда 6": "Team 6",
  "Команда 7": "Team 7",
  "Команда 8": "Team 8",
  "Игр": "Played",
  "Побед": "Wins",
  "Ничьих": "Draws",
  "Поражений": "Losses",
  "Мячей забито - пропущено": "Goals for - against",
  "Игры": "Played",
  "Мячи": "Goals",
  "Очки": "Points",
  "ID": "ID",
  "Дата": "Date",
  "Время": "Time",
  "Статус": "Status",
  "Подпись статуса": "Status label",
  "Домашняя команда": "Home team",
  "Логотип домашней": "Home logo",
  "Гостевая команда": "Away team",
  "Логотип гостевой": "Away logo",
  "Счёт": "Score",
  "Группа / стадия": "Group / stage",
  "Видео (embed URL)": "Video (embed URL)",
  "Описание": "Description",
  "Заголовок": "Title",
  "Краткое описание": "Short description",
  "Ссылка": "Link",
  "Стадия": "Stage",
  "Ошибка JSON:": "JSON error:",
  "Скоро": "Soon",
  "Завершен": "Finished",
  "Завершён": "Finished",
  "В эфире": "Live",
  "Группа A": "Group A",
  "Группа B": "Group B",
  "Группа А": "Group A",
  "Группа Б": "Group B",
  "Трансляция": "Broadcast",
  "Обзор": "Highlights",
  "Интервью": "Interview",
  "Главный эфир": "Featured Match",
  "Страница матча": "Match page",
  "Материалы матчей": "Match materials",
  "Фотоальбом": "Photo album",
  "Фоторепортажи": "Photo Reports",
  "Все альбомы →": "All albums →",
  "Открытие Кубка Бурчалкина 2026": "Opening of Burchalkin Cup 2026",
  "Первый игровой день Кубка Бурчалкина 2026": "First matchday of Burchalkin Cup 2026",
  "Награждение и закрытие Кубка Бурчалкина 2026": "Awards and closing of Burchalkin Cup 2026",
  "Выбор формата турнира": "Choose tournament view",
  "Матч идёт в прямом эфире": "The match is live",
  "Обзор появится позднее": "Highlights will be available later",
  "Интервью появится позднее": "Interview will be available later",
  "Участник сезона 2026": "2026 season participant",
  "История турнира": "Tournament history",
  "О клубе": "About the club",
  "История участия": "Participation history",
  "История участия будет дополняться.": "Participation history will be updated.",
  "Сезон идёт": "Season in progress",
  "Участник турнира": "Tournament participant",
  "Хозяева": "Home",
  "Гости": "Away",
  "Стадион": "Stadium",
  "Личные встречи": "Head-to-head",
  "Команды не встречались ранее.": "The teams have not met before.",
  "История матчей": "Match history",
  "Прошедшие и будущие матчи клуба во всех турнирах сайта.": "Past and upcoming matches of the club across all tournaments on the site.",
  "Все клубы →": "All clubs →",
  "У клуба пока нет матчей в базе.": "The club has no matches in the database yet.",
  "Клубы турнира и их сквозная история матчей по сезонам.": "Tournament clubs and their match history across seasons.",
  "Актуальные и ближайшие матчи турнира.": "Current and upcoming tournament matches.",
  "Турниры": "Tournaments",
  "Текущий сезон и прошлые розыгрыши турнира по годам.": "Current season and past tournament editions by year.",
  "Прошлые розыгрыши →": "Past editions →",
  "Прошлый розыгрыш": "Past edition",
  "Открыть все розыгрыши →": "Open all editions →",
  "Все прошлые розыгрыши турнира в одном разделе.": "All past tournament editions in one section.",
  "Открыть розыгрыш 2025 →": "Open 2025 edition →",
  "Розыгрыш 2024": "2024 edition",
  "Розыгрыш 2023": "2023 edition",
  "Розыгрыш 2019": "2019 edition",
  "Розыгрыш 2018": "2018 edition",
  "Матчи, результаты и материалы розыгрыша.": "Matches, results, and materials of the edition.",
  "Позже здесь появятся команды турнира, результаты матчей, сетка, фотографии и материалы розыгрыша 2025 года.": "Teams, match results, the bracket, photos, and materials of the 2025 edition will appear here later.",
  "Страница розыгрыша сезона с командами, сеткой и фото.": "Season edition page with teams, bracket, and photos.",
  "Материалы прошлогоднего турнира будут добавлены позднее.": "Materials from last year's tournament will be added later.",
  "Страница розыгрыша для будущего наполнения историей турнира.": "Edition page for future tournament history content.",
  "Отдельная страница розыгрыша уже готова для будущих материалов.": "A dedicated edition page is already ready for future materials.",
  "Это страница-заглушка под розыгрыш 2024 года. Позже здесь можно будет собрать участников, расписание, итоги и медиаматериалы.": "This is a placeholder page for the 2024 edition. Later, participants, schedule, results, and media materials can be added here.",
  "На этой странице позже появится информация о розыгрыше 2023 года: команды, результаты, фотографии и памятные материалы.": "Information about the 2023 edition will appear here later: teams, results, photos, and archive materials.",
  "Страница подготовлена для одного из ранних розыгрышей турнира. Здесь можно будет собрать историю турнира по годам.": "This page is prepared for one of the early editions of the tournament. The tournament history can be collected here over time.",
  "Заглушка для страницы розыгрыша 2018 года. Позже здесь появятся команды, результаты и материалы турнира.": "A placeholder for the 2018 edition page. Teams, results, and materials will appear here later.",
  "Прошлый розыгрыш турнира": "Past tournament edition",
  "Прошлый розыгрыш турнира - Burchalkin Cup": "Past tournament edition - Burchalkin Cup",
  "← Назад к результатам": "← Back to results",
  "Прошлый розыгрыш 15 - 17 мая 2025": "Past edition 15 - 17 May 2025",
  "Что входит в прошлые розыгрыши": "What's included in past editions",
  "Состав участников и группы": "Participants and groups",
  "Результаты матчей и турнирная таблица": "Match results and standings",
  "Фотографии и видео розыгрыша": "Photos and videos of the edition",
  "Статус страницы": "Page status",
  "Страница прошлого розыгрыша уже готова как точка входа. Материалы можно будет постепенно добавить позже.": "The page for the past edition is already ready as an entry point. Materials can be added gradually later.",
  "Розыгрыш 2024 года ещё не заполнен, но страница уже подключена и доступна по ссылке.": "The 2024 edition is not filled yet, but the page is already connected and available by link.",
  "Страница розыгрыша уже работает, содержимое добавим позже.": "The edition page is already working; we will add the content later.",
  "Розыгрыш 2018 года пока находится в подготовке.": "The 2018 edition is still being prepared.",
  "Матч прошлых розыгрышей": "Past edition match",
  "Открыть розыгрыш": "Open edition",
  "Матчи розыгрыша будут опубликованы позднее.": "Edition matches will be published later.",
  "Страница прошлого розыгрыша подключена к данным турнира и готова к наполнению.": "The page of the past edition is connected to the tournament data and ready for content.",
  "Команды розыгрыша": "Teams of the edition",
  "Матчи розыгрыша": "Matches of the edition",
  "1 место": "1st place",
  "2 место": "2nd place",
  "3 место": "3rd place",
  "4 место": "4th place",
  "5 место": "5th place",
  "6 место": "6th place",
  "7 место": "7th place",
  "8 место": "8th place",
  "← Все новости": "← All news",
  "Добавлено:": "Added:",
  "← Все фотоальбомы": "← All photo albums",
  "Фотографии альбома": "Album photos",
  "Скоро здесь появится сетка фотографий": "A photo grid will appear here soon",
  "Фото 1": "Photo 1",
  "Фото 2": "Photo 2",
  "Фото 3": "Photo 3",
  "Фото 4": "Photo 4",
  "Открытие турнира": "Tournament opening",
  "Церемония открытия, первые эмоции игроков, болельщики и стартовые кадры турнира.": "Opening ceremony, first emotions of the players, fans, and the opening moments of the tournament.",
  "Первый игровой день": "First matchday",
  "Подборка лучших кадров матчей, скамейки, болельщиков и деталей первого дня турнира.": "A selection of the best moments from the matches, benches, fans, and details from the first day of the tournament.",
  "Награждение и закрытие": "Awards and closing ceremony",
  "Кубок, медали, победители, эмоции команд и финальные кадры церемонии закрытия.": "The cup, medals, winners, team emotions, and the final moments of the closing ceremony.",
  "В этом альбоме позже появятся фотографии церемонии открытия, первых матчей и атмосферы стартового дня турнира.": "Photos from the opening ceremony, the first matches, and the atmosphere of the opening day will appear in this album later.",
  "Материалы матчей появятся после публикации первых эфиров.": "Match materials will appear after the first broadcasts are published.",
  "Фотоальбомы появятся здесь после публикации первых фотоматериалов.": "Photo albums will appear here after the first photo materials are published.",
  "Фотоальбом пока недоступен.": "The photo album is not available yet.",
  "Просмотр фотографии": "View photo",
  "Закрыть просмотр": "Close viewer",
  "Предыдущее фото": "Previous photo",
  "Следующее фото": "Next photo",
  "Предыдущие фотографии": "Previous photos",
  "Следующие фотографии": "Next photos",
  "Предыдущие материалы матчей": "Previous match materials",
  "Следующие материалы матчей": "Next match materials",
  "Не удалось загрузить команды.": "Failed to load teams.",
  "Международный участник текущего розыгрыша Кубка Бурчалкина.": "International participant of the current Burchalkin Cup edition.",
  "Система спортивной аналитики B-SIGHT": "B-SIGHT Sports Analytics System",
  "АО «Российская промышленная коллегия»": "Russian Industrial Collegium JSC",
  "Акционерное общество «Российская промышленная коллегия»": "Russian Industrial Collegium JSC",
  "БАЗ": "BAZ",
  "Медиалига": "Media League",
  "БФ «ВТБ Страна»": "VTB Strana Foundation",
  "Банк ВТБ": "VTB Bank",
  "Ижора Сталь Инвест": "Izhora Steel Invest",
  "ООО Фирма «Спринг-Центр»": "Spring-Center LLC",
  "ООО «Новые технологии и материалы»": "New Technologies and Materials LLC",
  "ПАО Сатурн": "Saturn PJSC",
  "Банк ПСБ": "PSB Bank",
  "ТехПром": "TechProm",
  "ТАСС": "TASS",
  "Спорт-Экспресс": "Sport-Express",
  "РФС": "RFU",
  "Фонтанка.ру": "Fontanka.ru",
  "Спорт День за Днем": "Sport Day by Day",
  "Комсомольская правда": "Komsomolskaya Pravda",
  "Радио «Зенит»": "Radio Zenit",
  "де Альмагро": "de Almagro",
  "Футбол Петербурга": "Football of Petersburg",
  "Санкт-Петербургские ведомости": "Saint Petersburg Vedomosti",
  "Телеканал «Санкт-Петербург»": "Saint Petersburg TV Channel",
  "©АО \"Обуховский завод\" 2015-2026": "© JSC \"Obukhov Plant\" 2015-2026",
  "Беларусь": "Belarus",
  "Мехико": "Mexico City",
  "Буэнос-Айрес": "Buenos Aires",
  "Алматы": "Almaty",
  "Будапешт": "Budapest",
  "Гимарайнш": "Guimaraes",
  "Сантус": "Santos",
  "Бергамо": "Bergamo",
  "Рим": "Rome",
  "Исфахан": "Isfahan",
  "Сан-Паулу": "Sao Paulo",
  "Белград": "Belgrade",
  "Стамбул": "Istanbul",
  "Минск": "Minsk",
  "ЦСКА (Москва)": "CSKA (Moscow)",
  "«Динамо» (Москва)": "Dynamo (Moscow)",
  "«Локомотив» (Москва)": "Lokomotiv (Moscow)",
  "Редакция Burchalkin Cup": "Burchalkin Cup Editorial Team",
  "Счёт матча": "Match score",
  "Материалы матча": "Match media",
  "Легендарный ленинградский футболист, в честь которого назван турнир.": "The legendary Leningrad footballer after whom the tournament is named.",
  "Контактные данные для локальной версии сайта.": "Contact details for the local version of the site.",
  "Санкт-Петербург, локальная тестовая версия": "Saint Petersburg, local test version",
  "Если карта не загрузилась, откройте адрес напрямую:": "If the map does not load, open the address directly:",
  "в Google Maps": "in Google Maps",
  "Отдельная страница с партнёрами турнира.": "A dedicated page with the tournament partners.",
  "Фотографии, видеозаписи и лучшие моменты турнира.": "Photos, video recordings, and the best moments of the tournament.",
  "Раздел оформлен в логике официального сайта — с сезонами и итогами прошлых лет.": "This section follows the logic of the official website — with seasons and results of previous years.",
  "Участники турнира Burchalkin Cup.": "Participants of the Burchalkin Cup tournament.",
  "Все матчи турнира с переходом на отдельные страницы.": "All tournament matches with links to dedicated match pages.",
  "Раздел для анонсов турнира, участников и итогов игрового дня.": "A section for tournament announcements, participant updates, and matchday summaries.",
  "Следите за ближайшими играми турнира и переходите в раздел матчей за полным расписанием.": "Follow the upcoming tournament games and visit the matches section for the full schedule.",
  "Раздел для анонсов, итогов игрового дня и новостей турнира.": "A section for announcements, daily recaps, and tournament news.",
  "Актуальное положение команд после стартовых матчей турнира.": "Current standings after the opening tournament matches.",
  "История и смысл Кубка Льва Бурчалкина.": "The history and meaning of the Lev Burchalkin Cup.",
  "Открывающий матч игрового дня. На этой странице можно показывать прямой эфир или запись игры.": "Opening match of the day. This page can show a live stream or a replay of the game.",
  "Матч группового этапа. Перед началом можно показывать анонс, а после — запись встречи.": "Group stage match. Before kickoff, this page can show a preview, and after the match — a replay.",
  "Матч идёт в прямом эфире. Счёт и статус можно менять прямо в JSON.": "The match is live. The score and status can be changed directly in JSON.",
  "Не удалось загрузить таблицу.": "Failed to load the standings.",
  "Не удалось загрузить матчи.": "Failed to load matches.",
  "Не удалось загрузить список матчей.": "Failed to load the match list.",
  "Не удалось загрузить новости.": "Failed to load news.",
  "Не удалось загрузить результаты.": "Failed to load results.",
  "Не удалось загрузить матч.": "Failed to load the match.",
  "Эта версия работает локально в браузере. Изменения сохраняются в localStorage и сразу подхватываются сайтом в этом же браузере.": "This version works locally in the browser. Changes are stored in localStorage and are immediately applied by the site in the same browser.",
  "Визуальный редактор турнирной таблицы.": "Visual editor for the standings table.",
  "Редактор матчей с выбором логотипов и YouTube embed.": "Match editor with logo picker and YouTube embed support.",
  "Редактор новостей с изображением и ссылкой.": "News editor with image and link.",
  "Редактор результатов матчей.": "Match results editor.",
  "Данные загружены.": "Data loaded.",
  "Запись удалена.": "Item deleted.",
  "Новая запись добавлена.": "New item added.",
  "Логотип выбран. Нажми «Сохранить».": "Logo selected. Click “Save”.",
  "Картинка загружена в форму. Нажми «Сохранить».": "Image loaded into the form. Click “Save”.",
  "Сброшено к данным из файла.": "Reset to file data.",
  "JSON экспортирован.": "JSON exported.",
  "Сначала исправь данные перед экспортом.": "Please fix the data before exporting.",
  "Сохранено в браузере. Обнови страницы сайта, чтобы увидеть изменения.": "Saved in the browser. Refresh the site pages to see the changes.",
  "Burchalkin Cup — локальная HTML-версия сайта": "Burchalkin Cup — local HTML site version",
  "Burchalkin Cup. Дизайн адаптирован под локальный HTML-сайт.": "Burchalkin Cup. Design adapted for a local HTML website.",
  "№": "#",
  "И": "P",
  "М": "G",
  "О": "Pts"
};
  const partialMap = {
  "Burchalkin Cup — Главная": "Burchalkin Cup — Home",
  "Burchalkin Cup — Новости": "Burchalkin Cup — News",
  "Burchalkin Cup — Команды": "Burchalkin Cup — Teams",
  "Burchalkin Cup — Расписание": "Burchalkin Cup — Schedule",
  "Burchalkin Cup — Результаты": "Burchalkin Cup — Results",
  "Burchalkin Cup — Трансляции": "Burchalkin Cup — Broadcasts",
  "Burchalkin Cup — О турнире": "Burchalkin Cup — About the Tournament",
  "Burchalkin Cup — О Льве Бурчалкине": "Burchalkin Cup — About Lev Burchalkin",
  "Burchalkin Cup — Контакты": "Burchalkin Cup — Contacts",
  "Burchalkin Cup — Матч": "Burchalkin Cup — Match",
  "Первый Кубок Бурчалкина": "The First Burchalkin Cup",
  "На том же месте, в тот же час": "Back at the Same Place, at the Same Time",
  "Счастливое число три!": "Lucky Number Three!",
  "Кубок Бурчалкина-2019": "Burchalkin Cup 2019",
  "Вновь пришло время футбола!": "Football Time Returned!",
  "Реванш «Палмейраса»": "Palmeiras Take Their Revenge",
  "Кубок остаётся дома": "The Cup Stays at Home",
  "Место и время проведения": "Venue and Dates",
  "розыгрыш турнира": "edition of the tournament",
  "даты проведения": "dates",
  "место проведения": "venue",
  "возрастная категория": "age category",
  "В 2026 году Кубок Льва Бурчалкина будет проводиться в восьмой раз в память о легендарном форварде футбольного клуба «Зенит», который начал свою футбольную карьеру в команде СК «Большевик» (ныне ФК «Алмаз-Антей»). Цель турнира – поддержка детско-юношеского футбола и укрепление дружественных связей.": "In 2026, the Lev Burchalkin Cup will be held for the eighth time in memory of the legendary FC Zenit forward who began his football career with SK Bolshevik (now FC Almaz-Antey). The goal of the tournament is to support youth football and strengthen friendly ties.",
  "Победителем первого турнира в 2016 году стал испанский «Вильярреал». Тогда в наших соревнованиях приняло участие восемь команд из ведущих футбольных школ России и Европы.": "The winner of the first tournament in 2016 was Spain’s Villarreal. That year, eight teams from leading football academies in Russia and Europe took part in the competition.",
  "Через год Кубок Бурчалкина вновь собрал восемь команд-участниц. Среди них коллективы из Испании, Сербии, России, Венгрии и Португалии. Дебютантами этого розыгрыша стали «Витория» (Португалия), «МТК» (Венгрия) и «Партизан» (Сербия). Главный трофей завоевал «Вилярреал», став двукратным обладателем кубка. Порадовали домашнюю публику и юные футболисты «Алмаз-Антея». Единственный гол на первой же минуте решил исход матча за бронзовые медали.": "A year later, the Burchalkin Cup again brought together eight teams. The participants came from Spain, Serbia, Russia, Hungary, and Portugal. The debutants of that edition were Vitoria (Portugal), MTK (Hungary), and Partizan (Serbia). Villarreal won the main trophy, becoming a two-time cup holder. The young players of Almaz-Antey also delighted the home crowd: the only goal in the opening minute decided the bronze-medal match.",
  "В 2018 году в Санкт-Петербург впервые приехали футболисты из итальянской «Ромы» и аргентинского клуба «Бока Хуниорс». Не обошлось без дебютантов и в составе российских участников состязаний. Конкуренцию ЦСКА, «Зениту» и «Алмаз-Антею» составил «Краснодар». Воспитанники одной из лучших академий России заняли по итогам турнира 6 место.": "In 2018, players from Italy’s Roma and Argentina’s Boca Juniors came to Saint Petersburg for the first time. There were also debutants among the Russian participants: Krasnodar joined CSKA, Zenit, and Almaz-Antey. The academy from one of Russia’s strongest football schools finished sixth overall.",
  "Главный же трофей соревнований снова отправился в Испанию. Однако в финале аргентинцы смогли навязять достойную борьбу «Вильярреалу». Поединок двух испаноговорящих команд завершился со счетом 1:0.": "The main trophy once again went to Spain. In the final, however, the Argentinians put up a worthy fight against Villarreal. The match between the two Spanish-speaking teams ended 1–0.",
  "Впервые в Санкт-Петербург приехала итальянская «Аталанта». Дебют получился не совсем удачным, команда заняла 6-е место, добыв победу только над МТК. Как и в самом первом розыгрыше Кубка, в финале встретились представители испанского и петербургского футбола: «Вильярреал» и «Зенит». Уже в первом тайме в воротах сине-бело-голубых побывали два мяча, а во втором трехкратные чемпионы нашего турнира увеличили свое преимущество — 3:0.": "Italian side Atalanta came to Saint Petersburg for the first time. Their debut was not especially successful: the team finished sixth, defeating only MTK. As in the very first edition of the Cup, the final featured representatives of Spanish and Saint Petersburg football — Villarreal and Zenit. Two goals were scored against the blue-white-sky blues in the first half, and in the second half the three-time champions of our tournament extended their lead to 3–0.",
  "В период с 2020 по 2022 гг. турнир в городе на Неве не проводился. Ковидные ограничения, которые действовали в Санкт-Петербурге, не позволяли организаторам устроить большой футбольный праздник. Однако сложные времена остались позади, и в 2023 году Кубок Бурчалкина отметил свой первый юбилей!": "From 2020 to 2022, the tournament was not held in the city on the Neva. Covid restrictions in Saint Petersburg prevented the organizers from staging a major football celebration. But the difficult period passed, and in 2023 the Burchalkin Cup celebrated its first anniversary.",
  "Участниками V розыгрыша стали «Сантос» (Бразилия), «Палмейрас» (Бразилия), «Црвена Звезда» (Сербия), «Сепахан» (Иран), «ЦСКА» (г. Москва), «Краснодар» (г. Краснодар), «Зенит» (г. Санкт-Петербург) и «Алмаз-Антей» (г. Санкт-Петербург). Впервые победителем Кубка Бурчалкина стала команда «Зенит», обыгравшая «Палмейрас» в финальном матче со счетом 2:1.": "The participants of the fifth edition were Santos (Brazil), Palmeiras (Brazil), Crvena Zvezda (Serbia), Sepahan (Iran), CSKA (Moscow), Krasnodar (Krasnodar), Zenit (Saint Petersburg), and Almaz-Antey (Saint Petersburg). For the first time, Zenit won the Burchalkin Cup, defeating Palmeiras 2–1 in the final.",
  "В 2024 году «Палмейрас» приехал в Петербург, чтобы взять реванш у «Зенита». Ведь именно им бразильцы проиграли в финальном матче годом ранее. Так и случилось! Эта победа позволила футболистам «Палмейраса» впервые стать обладателями Кубка Бурчалкина. Дебютантами турнира стали турецкий «Фенербахче», казахстанский «Кайрат» и «Динамо-Минск» из Белоруссии.": "In 2024, Palmeiras came to Saint Petersburg seeking revenge against Zenit — the team that had beaten the Brazilians in the final a year earlier. And that is exactly what happened. This victory allowed Palmeiras to become Burchalkin Cup winners for the first time. The debutants of the tournament were Turkey’s Fenerbahçe, Kazakhstan’s Kairat, and Dinamo Minsk from Belarus.",
  "Особенным для хозяев турнира стал VII розыгрыш, который состоялся в 2025 году. «Алмаз-Антей» впервые забрал главный трофей Кубка Бурчалкина. В финале турнира на поле сошлись две петербургские команды. Единственный и победный гол в ворота «Зенита» забил Максим Золотых. Наши бразильские друзья вновь не остались без медалей, в матче за бронзу они смогли обыграть сверстников из Сербии. Впервые участие в нашем турнире приняли футболисты аргентинского клуба «Сан Лоренсо де Альмагро».": "The seventh edition, held in 2025, became special for the host club. Almaz-Antey lifted the main Burchalkin Cup trophy for the first time. The final featured two Saint Petersburg teams. The only and winning goal against Zenit was scored by Maksim Zolotykh. Our Brazilian friends once again did not leave without medals: in the bronze match they defeated their peers from Serbia. For the first time, players from Argentina’s San Lorenzo de Almagro took part in our tournament.",
  "Восьмой турнир пройдет в Санкт-Петербурге на базе ФК «Алмаз-Антей» (Проспект Обуховской Обороны, д. 130) с 15 по 17 мая 2026 года.": "The eighth tournament will be held in Saint Petersburg at FC Almaz-Antey (130 Prospekt Obukhovskoy Oborony) from May 15 to May 17, 2026.",
  "Турнир проводится при поддержке Концерна ВКО «Алмаз-Антей» и Федерации футбола Санкт-Петербурга.": "The tournament is held with the support of the Almaz-Antey Air and Space Defence Corporation and the Saint Petersburg Football Federation.",
  "Турнир проводится среди футболистов не старше 13 лет (2013 г.р.).": "The tournament is held for players under the age of 13 (born in 2013).",
  "* подтверждённые на данный момент участники, список будет обновляться": "* participants confirmed so far, the list will be updated",
  "Лев Дмитриевич Бурчалкин родился 9 января 1939 года в Ленинграде. В 13 лет его зачислили в детскую команду СК «Большевик». На старте он играл в обороне, так как был самым рослым среди сверстников, но именно там началась его большая футбольная история.": "Lev Dmitrievich Burchalkin was born on January 9, 1939, in Leningrad. At the age of 13, he joined the youth team of SK Bolshevik. At first he played in defense because he was the tallest among his peers, but that is where his great football story began.",
  "На просмотре «Зенита» в 1957 году он оказался среди самых перспективных молодых футболистов Ленинграда. Вскоре Бурчалкина перевели в линию атаки, где он быстро проявил свои бомбардирские качества.": "At a Zenit trial in 1957, he was considered one of the most promising young footballers in Leningrad. Soon Burchalkin was moved into attack, where he quickly revealed his scoring qualities.",
  "15 сентября 1957 года Бурчалкин дебютировал за основной состав «Зенита» уже как нападающий. Болельщики полюбили его за решающие голы, самоотдачу и яркий стиль игры. В Ленинграде его знали просто как «Лёву», а журналисты называли «Бурчалкин-Выручалкин».": "On September 15, 1957, Burchalkin made his debut for Zenit’s senior team as a forward. Fans loved him for decisive goals, commitment, and a bright playing style. In Leningrad, he was simply known as “Lyova”, while journalists called him “Burchalkin the Rescuer”.",
  "В 1962 и 1963 годах он был одним из лидеров «Зенита», а в 1964 году сыграл два матча за олимпийскую сборную СССР.": "In 1962 and 1963, he was one of Zenit’s leaders, and in 1964 he played two matches for the USSR Olympic team.",
  "После игровой карьеры Бурчалкин работал тренером и руководителем в футболе. Он тренировал владивостокский «Луч», позже работал с командами Ленинграда, а также проходил период работы на Мальдивских островах.": "After his playing career, Burchalkin worked as a coach and football executive. He coached Luch Vladivostok, later worked with teams in Leningrad, and also spent a period working in the Maldives.",
  "Лев Бурчалкин скончался 7 сентября 2004 года в Санкт-Петербурге после продолжительной болезни. В 2006 году на его могиле на Серафимовском кладбище был открыт памятник, установленный футбольным клубом «Зенит».": "Lev Burchalkin passed away on September 7, 2004, in Saint Petersburg after a long illness. In 2006, a monument installed by FC Zenit was unveiled at his grave in Serafimovskoe Cemetery.",
  "Турнир на Кубок Льва Бурчалкина сохраняет память о футболисте и связывает его имя с развитием детского футбола.": "The Lev Burchalkin Cup preserves the memory of the footballer and links his name to the development of youth football.",
  "Алмаз-Антей": "Almaz-Antey",
  "Зенит": "Zenit",
  "Динамо-Минск": "Dinamo Minsk",
  "Црвена Звезда": "Crvena Zvezda",
  "Фенербахче": "Fenerbahçe",
  "Кайрат": "Kairat",
  "Палмейрас": "Palmeiras",
  "Сан-Лоренсо": "San Lorenzo",
  "Сан Лоренсо": "San Lorenzo",
  "Сепахан": "Sepahan",
  "Вильярреал": "Villarreal",
  "МТК": "MTK",
  "Крус Асуль": "Cruz Azul",
  "Виктория": "Vitoria",
  "Сантос": "Santos",
  "Аталанта": "Atalanta",
  "Рома": "Roma",
  "Партизан": "Partizan",
  "Витория": "Vitoria",
  "Бока Хуниорс": "Boca Juniors",
  "Краснодар": "Krasnodar",
  "Бродаратц": "Brodarac",
  "ХИК": "HJK",
  "Испания": "Spain",
  "Россия": "Russia",
  "Белоруссия": "Belarus",
  "Сербия": "Serbia",
  "Турция": "Turkey",
  "Казахстан": "Kazakhstan",
  "Бразилия": "Brazil",
  "Аргентина": "Argentina",
  "Иран": "Iran",
  "Венгрия": "Hungary",
  "Мексика": "Mexico",
  "Португалия": "Portugal",
  "Италия": "Italy",
  "Финляндия": "Finland",
  "Санкт-Петербург": "Saint Petersburg",
  "Москва": "Moscow",
  "15–17 мая 2026": "15–17 May 2026",
  "Стартовал приём заявок на Burchalkin Cup": "Applications for the Burchalkin Cup are now open",
  "Турнир соберёт международный состав команд и продолжит традицию детско-юношеского футбольного фестиваля.": "The tournament will bring together an international lineup of teams and continue the tradition of the youth football festival.",
  "Оргкомитет открыл приём заявок на Кубок Бурчалкина 2026. В ближайшие недели подтвердится финальный список участников и будет сформировано полное расписание турнира.": "The organizing committee has opened applications for Burchalkin Cup 2026. In the coming weeks, the final list of participants will be confirmed and the full tournament schedule will be formed.",
  "На сайте уже доступны основные разделы будущего розыгрыша: команды, матчи, результаты, медиа и раздел прошлых розыгрышей. По мере подготовки турнира здесь будут появляться новые материалы и обновления.": "The main sections of the upcoming edition are already available on the website: teams, matches, results, media, and the section of past editions. New materials and updates will appear here as the tournament preparation continues.",
  "Опубликовано расписание первого игрового дня": "The first matchday schedule has been published",
  "На сайте уже доступны первые пары, время матчей и блок трансляций для зрителей и родителей.": "The opening fixtures, match times, and the broadcast block for viewers and parents are already available on the website.",
  "На странице матчей опубликовано предварительное расписание первого игрового дня. Болельщики уже могут посмотреть пары, время начала встреч и структуру групп.": "The preliminary schedule for the first matchday has been published on the matches page. Fans can already see the pairings, kickoff times, and the group structure.",
  "В день турнира на сайте также будут доступны трансляции, обзоры и интервью, которые появятся на отдельных страницах матчей сразу после публикации материалов.": "On the tournament day, broadcasts, highlights, and interviews will also be available on the website and will appear on the dedicated match pages as soon as the materials are published.",
  "Финальная сетка будет доступна после группового этапа": "The final bracket will be available after the group stage",
  "В плей-офф выйдут лучшие команды турнира, а сетка появится на сайте сразу после завершения группы.": "The best teams of the tournament will advance to the playoffs, and the bracket will appear on the website immediately after the group stage is completed.",
  "После завершения группового этапа на сайте автоматически появится обновлённая сетка решающих матчей. Пользователи смогут следить за продвижением команд в плей-офф в отдельном блоке результатов.": "After the group stage is completed, the website will automatically display the updated bracket of the decisive matches. Users will be able to track the teams' progress in the playoffs in a dedicated results block.",
  "Раздел прошлых розыгрышей и новые страницы турниров уже подготовлены так, чтобы впоследствии можно было хранить полную историю каждого сезона.": "The section of past editions and the new tournament pages are already prepared so that the complete history of each season can be stored later."
};
  const months = {
  "января": "January",
  "февраля": "February",
  "марта": "March",
  "апреля": "April",
  "мая": "May",
  "июня": "June",
  "июля": "July",
  "августа": "August",
  "сентября": "September",
  "октября": "October",
  "ноября": "November",
  "декабря": "December"
};

  const partialEntries = Object.entries(partialMap).sort((a, b) => b[0].length - a[0].length);
  const replacementEntries = Array.from(
    new Map([...Object.entries(exactMap), ...Object.entries(partialMap)]).entries()
  )
    .filter(([ru]) => ru.length > 1 && /[А-Яа-яЁё]/.test(ru))
    .sort((a, b) => b[0].length - a[0].length);
  const autoTranslationCache = loadAutoTranslationCache();
  const pendingAutoTranslations = new Set();
  let autoTranslationTimer = null;
  let autoTranslationInFlight = false;
  let autoTranslationBlockedUntil = 0;
  let observer = null;
  let translationRerunTimer = null;

  function getLang() {
    return localStorage.getItem(STORAGE_KEY) || DEFAULT_LANG;
  }

  function setLang(lang) {
    localStorage.setItem(STORAGE_KEY, lang);
    location.reload();
  }

  function replaceMonths(text) {
    let out = String(text || '');
    for (const [ru, en] of Object.entries(months)) {
      out = out.split(ru).join(en);
    }
    out = out.replace(/\s+г\./g, '');
    out = out.replace(/\s+г\b/g, '');
    return out;
  }

  function replaceCountLabels(text) {
    return String(text || '')
      .replace(/(\d+)\s+клуб(?:ов|а)?(?=$|[\s.,!?:;])/g, (match, count) => `${count} ${Number(count) === 1 ? 'club' : 'clubs'}`)
      .replace(/(\d+)\s+матч(?:ей|а)?(?=$|[\s.,!?:;])/g, (match, count) => `${count} ${Number(count) === 1 ? 'match' : 'matches'}`);
  }

  function normalizeTranslationText(text) {
    return String(text || '').replace(/\s+/g, ' ').trim();
  }

  function containsCyrillic(text) {
    return /[А-Яа-яЁё]/.test(String(text || ''));
  }

  function getApiBaseUrl() {
    return getApiBaseCandidates()[0] || '';
  }

  function getApiBaseCandidates() {
    const values = Array.isArray(window.BCUP_CONFIG?.apiBaseCandidates)
      ? window.BCUP_CONFIG.apiBaseCandidates
      : [window.BCUP_CONFIG?.apiBaseUrl, ...(window.BCUP_CONFIG?.apiFallbackBaseUrls || [])];

    return Array.from(new Set(
      values
        .map(value => String(value || '').trim().replace(/\/+$/, ''))
        .filter(Boolean)
    ));
  }

  function canUseAutoTranslation() {
    return getLang() === 'en'
      && window.BCUP_CONFIG?.autoTranslateEnabled !== false
      && Boolean(getApiBaseUrl());
  }

  function loadAutoTranslationCache() {
    try {
      const raw = localStorage.getItem(AUTO_TRANSLATION_CACHE_KEY);
      const parsed = raw ? JSON.parse(raw) : {};
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch (error) {
      return {};
    }
  }

  function persistAutoTranslationCache() {
    try {
      localStorage.setItem(AUTO_TRANSLATION_CACHE_KEY, JSON.stringify(autoTranslationCache));
    } catch (error) {
      // Ignore quota/storage issues and keep translation working in-memory.
    }
  }

  function applyOuterWhitespace(original, translated) {
    const leading = original.match(/^\s*/)?.[0] || '';
    const trailing = original.match(/\s*$/)?.[0] || '';
    return `${leading}${translated}${trailing}`;
  }

  function getCachedAutoTranslation(text) {
    const normalized = normalizeTranslationText(text);
    const translated = autoTranslationCache[normalized];
    return translated ? applyOuterWhitespace(text, translated) : '';
  }

  function queueAutoTranslation(text) {
    if (!canUseAutoTranslation()) return;
    if (Date.now() < autoTranslationBlockedUntil) return;

    const normalized = normalizeTranslationText(text);
    if (!normalized || autoTranslationCache[normalized] || pendingAutoTranslations.has(normalized)) return;
    if (!containsCyrillic(normalized)) return;

    pendingAutoTranslations.add(normalized);
    scheduleAutoTranslationFlush();
  }

  function scheduleAutoTranslationFlush() {
    if (autoTranslationTimer || autoTranslationInFlight || !pendingAutoTranslations.size) return;
    autoTranslationTimer = window.setTimeout(() => {
      autoTranslationTimer = null;
      flushAutoTranslations();
    }, 150);
  }

  function collectAutoTranslationBatches() {
    const batches = [];
    let currentBatch = [];
    let currentChars = 0;

    for (const text of pendingAutoTranslations) {
      const nextChars = currentChars + text.length;
      const batchOverflow = currentBatch.length >= AUTO_TRANSLATION_BATCH_SIZE || nextChars > AUTO_TRANSLATION_MAX_CHARS;

      if (batchOverflow) {
        if (currentBatch.length) batches.push(currentBatch);
        if (batches.length >= AUTO_TRANSLATION_PARALLEL_REQUESTS) break;
        currentBatch = [];
        currentChars = 0;
      }

      if (batches.length >= AUTO_TRANSLATION_PARALLEL_REQUESTS) break;

      currentBatch.push(text);
      currentChars += text.length;
    }

    if (currentBatch.length && batches.length < AUTO_TRANSLATION_PARALLEL_REQUESTS) {
      batches.push(currentBatch);
    }

    return batches;
  }

  async function requestAutoTranslationBatch(batch) {
    const apiBaseCandidates = getApiBaseCandidates();
    let response = null;
    let lastError = null;

    for (const apiBaseUrl of apiBaseCandidates) {
      try {
        const attempt = await fetch(new URL('/api/translate', `${apiBaseUrl}/`).toString(), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            source_lang: 'ru',
            target_lang: 'en',
            texts: batch
          })
        });

        if (!attempt.ok) {
          lastError = new Error(`Translation request failed with status ${attempt.status}`);
          continue;
        }

        response = attempt;
        break;
      } catch (error) {
        lastError = error;
      }
    }

    if (!response) {
      throw lastError || new Error('Translation request failed');
    }

    return response.json().catch(() => ({}));
  }

  function rerunTranslationPass() {
    if (getLang() !== 'en') return;
    if (translationRerunTimer) return;
    translationRerunTimer = window.setTimeout(() => {
      translationRerunTimer = null;
      if (observer) observer.disconnect();
      translateTextTree(document.body);
      startObserver();
    }, 120);
  }

  async function flushAutoTranslations() {
    if (autoTranslationInFlight || !canUseAutoTranslation()) return;
    if (Date.now() < autoTranslationBlockedUntil || !pendingAutoTranslations.size) return;

    const batches = collectAutoTranslationBatches();
    if (!batches.length) return;

    batches.forEach(batch => {
      batch.forEach(text => pendingAutoTranslations.delete(text));
    });

    autoTranslationInFlight = true;

    try {
      let hasNewTranslations = false;
      const results = await Promise.allSettled(
        batches.map(batch => requestAutoTranslationBatch(batch))
      );

      results.forEach((result, index) => {
        if (result.status === 'rejected') {
          batches[index].forEach(text => pendingAutoTranslations.add(text));
          return;
        }

        const payload = result.value || {};
        const translations = payload?.translations && typeof payload.translations === 'object'
          ? payload.translations
          : {};

        Object.entries(translations).forEach(([source, translated]) => {
          const normalizedSource = normalizeTranslationText(source);
          const normalizedTranslation = normalizeTranslationText(translated);
          if (!normalizedSource || !normalizedTranslation) return;
          if (autoTranslationCache[normalizedSource] === normalizedTranslation) return;
          autoTranslationCache[normalizedSource] = normalizedTranslation;
          hasNewTranslations = true;
        });
      });

      if (hasNewTranslations) {
        persistAutoTranslationCache();
        rerunTranslationPass();
      }
    } catch (error) {
      autoTranslationBlockedUntil = Date.now() + AUTO_TRANSLATION_RETRY_DELAY;
      batches.forEach(batch => batch.forEach(text => pendingAutoTranslations.add(text)));
      console.warn('Automatic translation is temporarily unavailable.', error);
    } finally {
      autoTranslationInFlight = false;
      if (pendingAutoTranslations.size) scheduleAutoTranslationFlush();
    }
  }

  function translateString(text) {
    if (!text || getLang() !== 'en') return text;
    const trimmed = text.trim();

    if (Object.prototype.hasOwnProperty.call(exactMap, trimmed)) {
      return applyOuterWhitespace(text, exactMap[trimmed]);
    }

    let out = text;
    for (const [ru, en] of replacementEntries) {
      if (out.includes(ru)) out = out.split(ru).join(en);
    }
    for (const [ru, en] of partialEntries) {
      if (out.includes(ru)) out = out.split(ru).join(en);
    }
    out = replaceMonths(out);
    out = replaceCountLabels(out);

    if (!containsCyrillic(out)) return out;

    const cachedTranslation = getCachedAutoTranslation(text);
    if (cachedTranslation) return cachedTranslation;

    queueAutoTranslation(text);
    return out;
  }

  function translateAttributes(root=document.body) {
    root.querySelectorAll('[title],[aria-label],[alt],[placeholder]').forEach(el => {
      ['title','aria-label','alt','placeholder'].forEach(attr => {
        if (!el.hasAttribute(attr)) return;
        const originalAttrName = `data-bc-original-${attr.replace(/[^a-z0-9]+/gi, '-')}`;
        if (!el.hasAttribute(originalAttrName)) {
          el.setAttribute(originalAttrName, el.getAttribute(attr) || '');
        }
        const sourceValue = el.getAttribute(originalAttrName) || '';
        const tr = translateString(sourceValue);
        if (tr !== el.getAttribute(attr)) el.setAttribute(attr, tr);
      });
    });
  }

  function translateTextTree(root=document.body) {
    if (getLang() !== 'en') return;

    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        if (!node.nodeValue || !node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
        const parent = node.parentElement;
        if (!parent || ['SCRIPT','STYLE','TEXTAREA'].includes(parent.tagName)) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });

    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);

    nodes.forEach(node => {
      const sourceValue = node.__bcOriginalText || node.nodeValue;
      if (!node.__bcOriginalText) node.__bcOriginalText = sourceValue;
      const tr = translateString(sourceValue);
      if (tr !== node.nodeValue) node.nodeValue = tr;
    });

    translateAttributes(root);
    if (!document.documentElement.dataset.bcOriginalTitle) {
      document.documentElement.dataset.bcOriginalTitle = document.title;
    }
    document.title = translateString(document.documentElement.dataset.bcOriginalTitle);
    document.documentElement.lang = 'en';
  }

  function updateButtons() {
    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.lang === getLang());
    });
  }

  function startObserver() {
    if (getLang() !== 'en') return;
    if (observer) observer.disconnect();
    observer = new MutationObserver(() => {
      if (!observer) return;
      rerunTranslationPass();
    });
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.addEventListener('click', () => setLang(btn.dataset.lang || DEFAULT_LANG));
    });

    updateButtons();

    if (getLang() === 'en') {
      translateTextTree(document.body);
      startObserver();
    } else {
      document.documentElement.lang = 'ru';
    }
  });

  window.BCI18N = {
    getLang,
    setLang,
    translateString,
    translateTextTree
  };
})();
