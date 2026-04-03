
(function() {
  const STORAGE_KEY = 'bc_lang';
  const DEFAULT_LANG = 'ru';
  const exactMap = {
  "Главная": "Home",
  "Новости": "News",
  "Команды": "Teams",
  "Расписание": "Schedule",
  "Результаты": "Results",
  "Трансляции": "Broadcasts",
  "О турнире": "About the Tournament",
  "О Льве Бурчалкине": "About Lev Burchalkin",
  "Контакты": "Contacts",
    "Предыдущие матчи": "Previous matches",
    "Следующие матчи": "Next matches",
    "Карта ФК Алмаз-Антей": "Almaz-Antey FC Map",
    "Карта": "Map",
  "Партнёры": "Partners",
  "Информационные партнёры": "Media Partners",
  "Ближайшие матчи": "Upcoming Matches",
  "Последние новости": "Latest News",
  "Турнирная таблица": "Standings",
  "Все матчи →": "All matches →",
  "Все новости →": "All news →",
  "Все результаты →": "All results →",
  "История участников": "Participants History",
  "Исторический участник турнира прошлых лет.": "Historic participant of previous editions of the tournament.",
  "Команды Кубка Бурчалкина 2025": "Burchalkin Cup 2025 Teams",
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
  "Группа A": "Group A",
  "Группа B": "Group B",
  "Редакция Burchalkin Cup": "Burchalkin Cup Editorial Team",
  "Легендарный ленинградский футболист, в честь которого назван турнир.": "The legendary Leningrad footballer after whom the tournament is named.",
  "Контактные данные для локальной версии сайта.": "Contact details for the local version of the site.",
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
  "Историческим для хозяев турнира стал VII розыгрыш, который состоялся в 2025 году. «Алмаз-Антей» впервые забрал главный трофей Кубка Бурчалкина. В финале турнира на поле сошлись две петербургские команды. Единственный и победный гол в ворота «Зенита» забил Максим Золотых. Наши бразильские друзья вновь не остались без медалей, в матче за бронзу они смогли обыграть сверстников из Сербии. Впервые участие в нашем турнире приняли футболисты аргентинского клуба «Сан Лоренсо де Альмагро».": "The seventh edition, held in 2025, became historic for the host club. Almaz-Antey lifted the main Burchalkin Cup trophy for the first time. The final featured two Saint Petersburg teams. The only and winning goal against Zenit was scored by Maksim Zolotykh. Our Brazilian friends once again did not leave without medals: in the bronze match they defeated their peers from Serbia. For the first time, players from Argentina’s San Lorenzo de Almagro took part in our tournament.",
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
  "Опубликовано расписание первого игрового дня": "The first matchday schedule has been published",
  "На сайте уже доступны первые пары, время матчей и блок трансляций для зрителей и родителей.": "The opening fixtures, match times, and the broadcast block for viewers and parents are already available on the website.",
  "Финальная сетка будет доступна после группового этапа": "The final bracket will be available after the group stage",
  "В плей-офф выйдут лучшие команды турнира, а сетка появится на сайте сразу после завершения группы.": "The best teams of the tournament will advance to the playoffs, and the bracket will appear on the website immediately after the group stage is completed."
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

  function getLang() {
    return localStorage.getItem(STORAGE_KEY) || DEFAULT_LANG;
  }

  function setLang(lang) {
    localStorage.setItem(STORAGE_KEY, lang);
    location.reload();
  }

  function replaceMonths(text) {
    let out = text;
    for (const [ru, en] of Object.entries(months)) {
      out = out.replace(new RegExp('\\b' + ru + '\\b', 'g'), en);
    }
    return out;
  }

  function translateString(text) {
    if (!text || getLang() !== 'en') return text;
    const trimmed = text.trim();

    if (Object.prototype.hasOwnProperty.call(exactMap, trimmed)) {
      const leading = text.match(/^\s*/)?.[0] || '';
      const trailing = text.match(/\s*$/)?.[0] || '';
      return leading + exactMap[trimmed] + trailing;
    }

    let out = text;
    for (const [ru, en] of partialEntries) {
      if (out.includes(ru)) out = out.split(ru).join(en);
    }
    out = replaceMonths(out);
    return out;
  }

  function translateAttributes(root=document.body) {
    root.querySelectorAll('[title],[aria-label],[alt],[placeholder]').forEach(el => {
      ['title','aria-label','alt','placeholder'].forEach(attr => {
        if (!el.hasAttribute(attr)) return;
        const value = el.getAttribute(attr);
        const tr = translateString(value);
        if (tr !== value) el.setAttribute(attr, tr);
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
      const tr = translateString(node.nodeValue);
      if (tr !== node.nodeValue) node.nodeValue = tr;
    });

    translateAttributes(root);
    document.title = translateString(document.title);
    document.documentElement.lang = 'en';
  }

  function updateButtons() {
    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.lang === getLang());
    });
  }

  let observer = null;
  function startObserver() {
    if (getLang() !== 'en') return;
    observer = new MutationObserver(() => {
      if (!observer) return;
      observer.disconnect();
      translateTextTree(document.body);
      startObserver();
    });
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true
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
