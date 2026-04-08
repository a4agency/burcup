const TEAM_LOGOS = [
  { name: 'Зенит', path: 'images/team-zenit.webp' },
  { name: 'Динамо-Минск', path: 'images/team-dinamo-minsk.webp' },
  { name: 'Црвена Звезда', path: 'images/team-crvena-zvezda.webp' },
  { name: 'Фенербахче', path: 'images/team-fenerbahce.webp' },
  { name: 'Кайрат', path: 'images/team-kairat.webp' },
  { name: 'Палмейрас', path: 'images/team-palmeiras.webp' },
  { name: 'Сан-Лоренсо', path: 'images/team-san-lorenzo.webp' },
  { name: 'Алмаз-Антей', path: 'images/team-almaz-antey.webp' },
];

const DEFAULT_PARTNERS = [
  ['b-sight', 'Система спортивной аналитики B-SIGHT', 'general', 1],
  ['rossiyskaya-promyshlennaya-kollegiya', 'АО «Российская промышленная коллегия»', 'general', 2],
  ['baz', 'БАЗ', 'general', 3],
  ['medialiga', 'Медиалига', 'general', 4],
  ['vtb-strana', 'БФ «ВТБ Страна»', 'general', 5],
  ['bank-vtb', 'Банк ВТБ', 'general', 6],
  ['izhora-stal-invest', 'Ижора Сталь Инвест', 'general', 7],
  ['spring-center', 'ООО Фирма «Спринг-Центр»', 'general', 8],
  ['novye-tekhnologii-materialy', 'ООО «Новые технологии и материалы»', 'general', 9],
  ['saturn', 'ПАО Сатурн', 'general', 10],
  ['bank-psb', 'Банк ПСБ', 'general', 11],
  ['tekhprom', 'ТехПром', 'general', 12],
  ['tass', 'ТАСС', 'media', 1],
  ['sport-express', 'Спорт-Экспресс', 'media', 2],
  ['rfs', 'РФС', 'media', 3],
  ['fontanka', 'Фонтанка.ру', 'media', 4],
  ['sport-den-za-dnem', 'Спорт День за Днем', 'media', 5],
  ['komsomolskaya-pravda', 'Комсомольская правда', 'media', 6],
  ['radio-zenit', 'Радио «Зенит»', 'media', 7],
  ['football-peterburga', 'Футбол Петербурга', 'media', 8],
  ['spb-vedomosti', 'Санкт-Петербургские ведомости', 'media', 9],
  ['tv-spb', 'Телеканал «Санкт-Петербург»', 'media', 10],
].map(([slug, name, category, sortOrder]) => ({
  slug,
  name,
  category,
  tournament_slug: 'burchalkin-cup-2026',
  website_url: '',
  logo_url: '',
  alt_text: name,
  sort_order: sortOrder,
  is_visible: true,
  note: '',
}));

const DEFAULT_MEDIA_ALBUMS = [
  {
    slug: 'opening-day-2026',
    title: 'Открытие турнира',
    tournament_slug: 'burchalkin-cup-2026',
    published_on: '2026-05-15',
    badge: 'Фотоальбом',
    cover_image_url: 'images/news-1.webp',
    cover_alt_text: 'Открытие Кубка Бурчалкина 2026',
    card_excerpt: 'Церемония открытия, первые эмоции игроков и стартовые кадры турнира.',
    description: 'Комментарий к альбому. Здесь можно описать, что вошло в фотоотчёт и какой момент турнира он показывает.',
    sort_order: 1,
    is_visible: true,
    photos: []
  },
  {
    slug: 'matchday-one-2026',
    title: 'Первый игровой день',
    tournament_slug: 'burchalkin-cup-2026',
    published_on: '2026-05-15',
    badge: 'Фотоальбом',
    cover_image_url: 'images/news-2.webp',
    cover_alt_text: 'Первый игровой день Кубка Бурчалкина 2026',
    card_excerpt: 'Ключевые кадры матчей, болельщиков и атмосферы первого дня турнира.',
    description: 'Комментарий к альбому. Здесь можно описать, какие матчи и какие события попали в этот фотоальбом.',
    sort_order: 2,
    is_visible: true,
    photos: []
  },
  {
    slug: 'closing-ceremony-2026',
    title: 'Награждение и закрытие',
    tournament_slug: 'burchalkin-cup-2026',
    published_on: '2026-05-17',
    badge: 'Фотоальбом',
    cover_image_url: 'images/news-3.webp',
    cover_alt_text: 'Награждение и закрытие Кубка Бурчалкина 2026',
    card_excerpt: 'Кубок, медали, победители и финальные кадры церемонии закрытия.',
    description: 'Комментарий к альбому. Здесь можно описать церемонию награждения, победителей и завершающие моменты турнира.',
    sort_order: 3,
    is_visible: true,
    photos: []
  }
];

const DEFAULT_PLAYOFF_ROWS = [
  {
    tournament_slug: 'burchalkin-cup-2026',
    tournament_name: 'Кубок Бурчалкина 2026',
    bracket_group: 'top',
    round_group: 'semifinal',
    match_key: 'top_sf1',
    sort_order: 1,
    label: 'Полуфинал 1–4 №1',
    home_team: 'Команда 1',
    home_team_slug: '',
    home_logo: 'images/logo-burchalkin.webp',
    away_team: 'Команда 2',
    away_team_slug: '',
    away_logo: 'images/logo-burchalkin.webp',
    home_score: 0,
    away_score: 0,
  },
  {
    tournament_slug: 'burchalkin-cup-2026',
    tournament_name: 'Кубок Бурчалкина 2026',
    bracket_group: 'top',
    round_group: 'semifinal',
    match_key: 'top_sf2',
    sort_order: 2,
    label: 'Полуфинал 1–4 №2',
    home_team: 'Команда 3',
    home_team_slug: '',
    home_logo: 'images/logo-burchalkin.webp',
    away_team: 'Команда 4',
    away_team_slug: '',
    away_logo: 'images/logo-burchalkin.webp',
    home_score: 0,
    away_score: 0,
  },
  {
    tournament_slug: 'burchalkin-cup-2026',
    tournament_name: 'Кубок Бурчалкина 2026',
    bracket_group: 'top',
    round_group: 'final',
    match_key: 'top_final',
    sort_order: 1,
    label: 'Матч за 1 место',
    home_team: 'Победитель 1–4 №1',
    home_team_slug: '',
    home_logo: '',
    away_team: 'Победитель 1–4 №2',
    away_team_slug: '',
    away_logo: '',
    home_score: 0,
    away_score: 0,
  },
  {
    tournament_slug: 'burchalkin-cup-2026',
    tournament_name: 'Кубок Бурчалкина 2026',
    bracket_group: 'top',
    round_group: 'final',
    match_key: 'top_third',
    sort_order: 2,
    label: 'Матч за 3 место',
    home_team: 'Проигравший 1–4 №1',
    home_team_slug: '',
    home_logo: '',
    away_team: 'Проигравший 1–4 №2',
    away_team_slug: '',
    away_logo: '',
    home_score: 0,
    away_score: 0,
  },
  {
    tournament_slug: 'burchalkin-cup-2026',
    tournament_name: 'Кубок Бурчалкина 2026',
    bracket_group: 'placement',
    round_group: 'semifinal',
    match_key: 'placement_sf1',
    sort_order: 1,
    label: 'Полуфинал 5–8 №1',
    home_team: 'Команда 5',
    home_team_slug: '',
    home_logo: 'images/logo-burchalkin.webp',
    away_team: 'Команда 6',
    away_team_slug: '',
    away_logo: 'images/logo-burchalkin.webp',
    home_score: 0,
    away_score: 0,
  },
  {
    tournament_slug: 'burchalkin-cup-2026',
    tournament_name: 'Кубок Бурчалкина 2026',
    bracket_group: 'placement',
    round_group: 'semifinal',
    match_key: 'placement_sf2',
    sort_order: 2,
    label: 'Полуфинал 5–8 №2',
    home_team: 'Команда 7',
    home_team_slug: '',
    home_logo: 'images/logo-burchalkin.webp',
    away_team: 'Команда 8',
    away_team_slug: '',
    away_logo: 'images/logo-burchalkin.webp',
    home_score: 0,
    away_score: 0,
  },
  {
    tournament_slug: 'burchalkin-cup-2026',
    tournament_name: 'Кубок Бурчалкина 2026',
    bracket_group: 'placement',
    round_group: 'final',
    match_key: 'placement_fifth',
    sort_order: 1,
    label: 'Матч за 5 место',
    home_team: 'Победитель 5–8 №1',
    home_team_slug: '',
    home_logo: '',
    away_team: 'Победитель 5–8 №2',
    away_team_slug: '',
    away_logo: '',
    home_score: 0,
    away_score: 0,
  },
  {
    tournament_slug: 'burchalkin-cup-2026',
    tournament_name: 'Кубок Бурчалкина 2026',
    bracket_group: 'placement',
    round_group: 'final',
    match_key: 'placement_seventh',
    sort_order: 2,
    label: 'Матч за 7 место',
    home_team: 'Проигравший 5–8 №1',
    home_team_slug: '',
    home_logo: '',
    away_team: 'Проигравший 5–8 №2',
    away_team_slug: '',
    away_logo: '',
    home_score: 0,
    away_score: 0,
  }
];

const ADMIN_TOKEN_KEY = 'bcup_admin_session_token';

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }[char]));
}

function joinNonEmpty(parts, separator = ' • ') {
  return parts.map(item => String(item || '').trim()).filter(Boolean).join(separator);
}

const ADMIN_SOURCES = {
  tournaments: {
    key: 'bcup_admin_tournaments',
    exportName: 'tournaments.json',
    title: 'Турниры',
    help: 'Карточки турниров на главной и в архиве. Все изменения отсюда попадают на сайт.',
    defaultData: [
      {
        slug: 'burchalkin-cup-2026',
        name: 'Burchalkin Cup 2026',
        season_year: 2026,
        short_label: 'BCUP 2026',
        status: 'upcoming',
        location: 'Санкт-Петербург',
        start_date: '2026-05-15',
        end_date: '2026-05-17',
        logo: 'images/logo-burchalkin.webp',
        hero_image: '',
        description: 'Основной турнир сезона 2026 года.',
        is_featured: true,
        countdown_enabled: true,
        standings_mode: 'auto',
        playoff_mode: 'auto',
      }
    ],
    empty: () => ({
      slug: '',
      name: '',
      season_year: new Date().getFullYear(),
      short_label: '',
      status: 'draft',
      location: '',
      start_date: '',
      end_date: '',
      logo: 'images/logo-burchalkin.webp',
      hero_image: '',
      description: '',
      is_featured: false,
      countdown_enabled: true,
      standings_mode: 'auto',
      playoff_mode: 'auto',
    }),
    fields: [
      ['slug', 'Slug', 'text'],
      ['name', 'Название', 'text'],
      ['season_year', 'Год', 'number'],
      ['short_label', 'Короткая подпись', 'text'],
      ['status', 'Статус', 'select', ['draft', 'upcoming', 'active', 'completed', 'archived']],
      ['location', 'Локация', 'text'],
      ['start_date', 'Дата старта', 'date'],
      ['end_date', 'Дата окончания', 'date'],
      ['logo', 'Логотип', 'image'],
      ['hero_image', 'Hero image', 'image'],
      ['is_featured', 'Текущий турнир', 'checkbox'],
      ['countdown_enabled', 'Показывать таймер на главной', 'checkbox'],
      ['standings_mode', 'Режим таблицы', 'select', ['auto', 'manual']],
      ['playoff_mode', 'Режим плей-офф', 'select', ['auto', 'manual']],
      ['description', 'Описание', 'textarea'],
    ],
  },
  archive_tournaments: {
    key: 'bcup_admin_archive_tournaments',
    exportName: 'archive-tournaments.json',
    title: 'Архив турниров',
    help: 'Архивные карточки турниров и страницы прошлых розыгрышей.',
    filterArchived: true,
    defaultData: [
      {
        slug: 'burchalkin-cup-2025',
        name: 'Burchalkin Cup 2025',
        season_year: 2025,
        short_label: 'BCUP 2025',
        status: 'completed',
        location: 'Санкт-Петербург',
        start_date: '2025-05-15',
        end_date: '2025-05-17',
        logo: 'images/logo-burchalkin.webp',
        hero_image: '',
        description: 'Архивный розыгрыш турнира 2025 года.',
        is_featured: false,
        countdown_enabled: false,
      },
      {
        slug: 'burchalkin-cup-2024',
        name: 'Burchalkin Cup 2024',
        season_year: 2024,
        short_label: 'BCUP 2024',
        status: 'archived',
        location: 'Санкт-Петербург',
        start_date: '2024-05-15',
        end_date: '2024-05-17',
        logo: 'images/logo-burchalkin.webp',
        hero_image: '',
        description: 'Архивный розыгрыш турнира 2024 года.',
        is_featured: false,
        countdown_enabled: false,
      },
      {
        slug: 'burchalkin-cup-2023',
        name: 'Burchalkin Cup 2023',
        season_year: 2023,
        short_label: 'BCUP 2023',
        status: 'archived',
        location: 'Санкт-Петербург',
        start_date: '2023-05-15',
        end_date: '2023-05-17',
        logo: 'images/logo-burchalkin.webp',
        hero_image: '',
        description: 'Архивный розыгрыш турнира 2023 года.',
        is_featured: false,
        countdown_enabled: false,
      },
      {
        slug: 'burchalkin-cup-2019',
        name: 'Burchalkin Cup 2019',
        season_year: 2019,
        short_label: 'BCUP 2019',
        status: 'archived',
        location: 'Санкт-Петербург',
        start_date: '2019-05-15',
        end_date: '2019-05-17',
        logo: 'images/logo-burchalkin.webp',
        hero_image: '',
        description: 'Архивный розыгрыш турнира 2019 года.',
        is_featured: false,
        countdown_enabled: false,
      },
      {
        slug: 'burchalkin-cup-2018',
        name: 'Burchalkin Cup 2018',
        season_year: 2018,
        short_label: 'BCUP 2018',
        status: 'archived',
        location: 'Санкт-Петербург',
        start_date: '2018-05-15',
        end_date: '2018-05-17',
        logo: 'images/logo-burchalkin.webp',
        hero_image: '',
        description: 'Архивный розыгрыш турнира 2018 года.',
        is_featured: false,
        countdown_enabled: false,
      }
    ],
    empty: () => ({
      slug: '',
      name: '',
      season_year: '',
      short_label: '',
      status: 'archived',
      location: '',
      start_date: '',
      end_date: '',
      logo: 'images/logo-burchalkin.webp',
      hero_image: '',
      description: '',
      is_featured: false,
      countdown_enabled: false,
    }),
    fields: [
      ['slug', 'Slug', 'text'],
      ['name', 'Название', 'text'],
      ['season_year', 'Год', 'number'],
      ['short_label', 'Короткая подпись', 'text'],
      ['status', 'Статус', 'select', ['draft', 'upcoming', 'active', 'completed', 'archived']],
      ['location', 'Локация', 'text'],
      ['start_date', 'Дата старта', 'date'],
      ['end_date', 'Дата окончания', 'date'],
      ['logo', 'Логотип', 'image'],
      ['hero_image', 'Hero image', 'image'],
      ['is_featured', 'Текущий турнир', 'checkbox'],
      ['countdown_enabled', 'Показывать таймер на главной', 'checkbox'],
      ['description', 'Описание', 'textarea'],
    ],
  },
  clubs: {
    key: 'bcup_admin_clubs',
    exportName: 'clubs.json',
    title: 'Клубы',
    help: 'Постоянный каталог клубов. Эти данные идут в карточки команд и их сквозную историю матчей.',
    defaultData: [
      {
        slug: 'almaz-antey',
        name: 'Алмаз-Антей',
        short_name: 'Алмаз-Антей',
        country: 'Россия',
        city: 'Санкт-Петербург',
        founded_year: 2000,
        logo: 'images/team-almaz-antey.webp',
        website_url: '',
        hero_image: '',
        description: 'Футбольный клуб, регулярно участвующий в турнирах Burchalkin Cup.',
        is_active: true,
      }
    ],
    empty: () => ({
      slug: '',
      name: '',
      short_name: '',
      country: '',
      city: '',
      founded_year: '',
      logo: '',
      website_url: '',
      hero_image: '',
      description: '',
      is_active: true,
    }),
    fields: [
      ['slug', 'Slug', 'text'],
      ['name', 'Название', 'text'],
      ['short_name', 'Короткое имя', 'text'],
      ['country', 'Страна', 'text'],
      ['city', 'Город', 'text'],
      ['founded_year', 'Год основания', 'number'],
      ['logo', 'Логотип', 'logo'],
      ['website_url', 'Сайт', 'text'],
      ['hero_image', 'Hero image', 'image'],
      ['is_active', 'Активен', 'checkbox'],
      ['description', 'Описание', 'textarea'],
    ],
  },
  matches: {
    key: 'bcup_matches',
    exportName: 'matches.json',
    title: 'Матчи',
    help: 'Матчи сохраняются прямо в PostgreSQL и сразу попадают в расписание, результаты и историю клубов.',
    defaultData: [
      {
        id: Date.now(),
        tournament_slug: 'burchalkin-cup-2026',
        date: '2026-05-15',
        time: '10:00',
        status: 'soon',
        status_label: 'Скоро',
        home_team: '',
        home_team_slug: '',
        home_logo: '',
        away_team: '',
        away_team_slug: '',
        away_logo: '',
        score: '0:0',
        group: '',
        round: '',
        matchday: '',
        venue: 'Стадион "Алмаз-Антей"',
        video: '',
        review_video: '',
        interview_video: '',
        is_featured_media: false,
        summary: '',
      }
    ],
    empty: () => ({
      id: Date.now(),
      tournament_slug: 'burchalkin-cup-2026',
      date: '2026-05-15',
      time: '10:00',
      status: 'soon',
      status_label: 'Скоро',
      home_team: '',
      home_team_slug: '',
      home_logo: '',
      away_team: '',
      away_team_slug: '',
      away_logo: '',
      score: '0:0',
      group: '',
      round: '',
      matchday: '',
      venue: 'Стадион "Алмаз-Антей"',
      video: '',
      review_video: '',
      interview_video: '',
      is_featured_media: false,
      summary: '',
    }),
    fields: [
      ['id', 'ID', 'number'],
      ['tournament_slug', 'Турнир', 'text'],
      ['date', 'Дата', 'date'],
      ['time', 'Время', 'time'],
      ['status', 'Статус', 'select', ['soon', 'live', 'done', 'postponed', 'cancelled']],
      ['status_label', 'Подпись статуса', 'text'],
      ['home_team', 'Хозяева', 'text'],
      ['home_team_slug', 'Slug хозяев', 'text'],
      ['home_logo', 'Логотип хозяев', 'logo'],
      ['away_team', 'Гости', 'text'],
      ['away_team_slug', 'Slug гостей', 'text'],
      ['away_logo', 'Логотип гостей', 'logo'],
      ['score', 'Счёт', 'score'],
      ['group', 'Группа / стадия', 'text'],
      ['round', 'Раунд', 'text'],
      ['matchday', 'Игровой день', 'text'],
      ['venue', 'Стадион', 'text'],
      ['video', 'Ссылка на трансляцию', 'url'],
      ['review_video', 'Ссылка на обзор', 'url'],
      ['interview_video', 'Ссылка на интервью', 'url'],
      ['summary', 'Описание', 'textarea'],
    ],
  },
  standings: {
    key: 'bcup_standings_current',
    exportName: 'standings-current.json',
    title: 'Турнирная таблица',
    help: 'Текущая турнирная таблица. Эти строки используются на сайте, если у текущего турнира включён ручной режим таблицы.',
    defaultData: [
      {
        tournament_slug: 'burchalkin-cup-2026',
        tournament_name: 'Кубок Бурчалкина 2026',
        season_year: 2026,
        group_name: 'Группа A',
        position: 1,
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        goals_for: 0,
        goals_against: 0,
        points: 0,
        team_slug: '',
        team: '',
        logo: '',
      }
    ],
    empty: () => ({
      tournament_slug: 'burchalkin-cup-2026',
      tournament_name: 'Кубок Бурчалкина 2026',
      season_year: 2026,
      group_name: 'Группа A',
      position: 1,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      goals_for: 0,
      goals_against: 0,
      points: 0,
      team_slug: '',
      team: '',
      logo: '',
    }),
    fields: [
      ['tournament_slug', 'Турнир', 'text'],
      ['group_name', 'Группа', 'text'],
      ['position', 'Место', 'number'],
      ['team', 'Команда', 'text'],
      ['team_slug', 'Slug команды', 'text'],
      ['logo', 'Логотип', 'logo'],
      ['played', 'Игр', 'number'],
      ['won', 'Побед', 'number'],
      ['drawn', 'Ничьих', 'number'],
      ['lost', 'Поражений', 'number'],
      ['goals_for', 'Забито', 'number'],
      ['goals_against', 'Пропущено', 'number'],
      ['points', 'Очки', 'number'],
    ],
  },
  playoff: {
    key: 'bcup_playoff_current',
    exportName: 'playoff-current.json',
    title: 'Сетка плей-офф',
    help: 'Текущая сетка плей-офф. Эти матчи показываются на сайте, если у текущего турнира включён ручной режим плей-офф.',
    defaultData: DEFAULT_PLAYOFF_ROWS,
    empty: () => ({
      tournament_slug: 'burchalkin-cup-2026',
      tournament_name: 'Кубок Бурчалкина 2026',
      bracket_group: 'top',
      round_group: 'semifinal',
      match_key: `playoff_${Date.now()}`,
      sort_order: 1,
      label: '',
      home_team: '',
      home_team_slug: '',
      home_logo: '',
      away_team: '',
      away_team_slug: '',
      away_logo: '',
      home_score: 0,
      away_score: 0,
    }),
    fields: [
      ['tournament_slug', 'Турнир', 'text'],
      ['bracket_group', 'Блок', 'select', ['top', 'placement']],
      ['round_group', 'Раунд', 'select', ['semifinal', 'final']],
      ['match_key', 'Ключ матча', 'text'],
      ['sort_order', 'Порядок', 'number'],
      ['label', 'Заголовок', 'text'],
      ['home_team', 'Хозяева', 'text'],
      ['home_team_slug', 'Slug хозяев', 'text'],
      ['home_logo', 'Логотип хозяев', 'logo'],
      ['home_score', 'Счёт хозяев', 'number'],
      ['away_team', 'Гости', 'text'],
      ['away_team_slug', 'Slug гостей', 'text'],
      ['away_logo', 'Логотип гостей', 'logo'],
      ['away_score', 'Счёт гостей', 'number'],
    ],
  },
  media: {
    key: 'bcup_admin_media',
    exportName: 'media.json',
    title: 'Медиа',
    help: 'Выбор матча для главного блока на странице «Медиа».',
    defaultData: [
      {
        featured_match_id: ''
      }
    ],
    empty: () => ({
      featured_match_id: ''
    }),
    fields: [
      ['featured_match_id', 'Главный матч', 'text'],
    ],
  },
  albums: {
    key: 'bcup_media_albums',
    exportName: 'media-albums.json',
    title: 'Фотоальбомы',
    help: 'Карточки фотоальбомов на странице «Медиа» и сами альбомы с фотографиями. Обложки и фотографии лучше загружать во внешний storage, а в базе хранить только URL.',
    defaultData: DEFAULT_MEDIA_ALBUMS,
    empty: () => ({
      slug: '',
      title: '',
      tournament_slug: 'burchalkin-cup-2026',
      published_on: '',
      badge: 'Фотоальбом',
      cover_image_url: '',
      cover_alt_text: '',
      card_excerpt: '',
      description: '',
      sort_order: 0,
      is_visible: true,
      photos: []
    }),
    fields: [
      ['slug', 'Slug', 'text'],
      ['title', 'Название альбома', 'text'],
      ['tournament_slug', 'Турнир', 'text'],
      ['published_on', 'Дата публикации', 'date'],
      ['badge', 'Бейдж карточки', 'text'],
      ['sort_order', 'Порядок', 'number'],
      ['is_visible', 'Показывать на сайте', 'checkbox'],
      ['cover_image_url', 'Обложка карточки', 'image'],
      ['cover_alt_text', 'Alt обложки', 'text'],
      ['card_excerpt', 'Подпись на карточке', 'textarea'],
      ['description', 'Комментарий к альбому', 'textarea'],
    ],
  },
  archive_matches: {
    key: 'bcup_archive_matches',
    exportName: 'archive-matches.json',
    title: 'Архивные матчи',
    filterArchiveMatches: true,
    defaultData: [
      {
        id: Date.now(),
        tournament_slug: 'burchalkin-cup-2025',
        date: '2025-05-15',
        time: '10:00',
        status: 'done',
        status_label: 'Завершен',
        home_team: '',
        home_team_slug: '',
        home_logo: '',
        away_team: '',
        away_team_slug: '',
        away_logo: '',
        score: '0:0',
        group: '',
        round: '',
        matchday: '',
        venue: 'Стадион "Алмаз-Антей"',
        video: '',
        review_video: '',
        interview_video: '',
        is_featured_media: false,
        summary: '',
      }
    ],
    empty: () => ({
      id: Date.now(),
      tournament_slug: 'burchalkin-cup-2025',
      date: '2025-05-15',
      time: '10:00',
      status: 'done',
      status_label: 'Завершен',
      home_team: '',
      home_team_slug: '',
      home_logo: '',
      away_team: '',
      away_team_slug: '',
      away_logo: '',
      score: '0:0',
      group: '',
      round: '',
      matchday: '',
      venue: 'Стадион "Алмаз-Антей"',
      video: '',
      review_video: '',
      interview_video: '',
      is_featured_media: false,
      summary: '',
    }),
    fields: [
      ['id', 'ID', 'number'],
      ['tournament_slug', 'Турнир', 'text'],
      ['date', 'Дата', 'date'],
      ['time', 'Время', 'time'],
      ['status', 'Статус', 'select', ['soon', 'live', 'done', 'postponed', 'cancelled']],
      ['status_label', 'Подпись статуса', 'text'],
      ['home_team', 'Хозяева', 'text'],
      ['home_team_slug', 'Slug хозяев', 'text'],
      ['home_logo', 'Логотип хозяев', 'logo'],
      ['away_team', 'Гости', 'text'],
      ['away_team_slug', 'Slug гостей', 'text'],
      ['away_logo', 'Логотип гостей', 'logo'],
      ['score', 'Счёт', 'score'],
      ['group', 'Группа / стадия', 'text'],
      ['round', 'Раунд', 'text'],
      ['matchday', 'Игровой день', 'text'],
      ['venue', 'Стадион', 'text'],
      ['video', 'Ссылка на трансляцию', 'url'],
      ['review_video', 'Ссылка на обзор', 'url'],
      ['interview_video', 'Ссылка на интервью', 'url'],
      ['summary', 'Описание', 'textarea'],
    ],
  },
  archive_standings: {
    key: 'bcup_archive_standings',
    exportName: 'archive-standings.json',
    title: 'Архивные таблицы',
    help: 'Турнирные таблицы прошлых розыгрышей. Эти данные попадают на архивные страницы сезонов.',
    filterArchiveStandings: true,
    defaultData: [
      {
        tournament_slug: 'burchalkin-cup-2025',
        tournament_name: 'Кубок Бурчалкина 2025',
        season_year: 2025,
        group_name: '',
        position: 1,
        played: 3,
        won: 2,
        drawn: 1,
        lost: 0,
        goals_for: 7,
        goals_against: 4,
        points: 7,
        team_slug: 'almaz-antey',
        team: 'Алмаз-Антей',
        logo: 'images/team-almaz-antey.webp',
      },
      {
        tournament_slug: 'burchalkin-cup-2025',
        tournament_name: 'Кубок Бурчалкина 2025',
        season_year: 2025,
        group_name: '',
        position: 2,
        played: 3,
        won: 2,
        drawn: 0,
        lost: 1,
        goals_for: 5,
        goals_against: 3,
        points: 6,
        team_slug: 'dinamo-minsk',
        team: 'Динамо-Минск',
        logo: 'images/team-dinamo-minsk.webp',
      },
      {
        tournament_slug: 'burchalkin-cup-2025',
        tournament_name: 'Кубок Бурчалкина 2025',
        season_year: 2025,
        group_name: '',
        position: 3,
        played: 3,
        won: 1,
        drawn: 1,
        lost: 1,
        goals_for: 4,
        goals_against: 4,
        points: 4,
        team_slug: 'zenit',
        team: 'Зенит',
        logo: 'images/team-zenit.webp',
      },
      {
        tournament_slug: 'burchalkin-cup-2025',
        tournament_name: 'Кубок Бурчалкина 2025',
        season_year: 2025,
        group_name: '',
        position: 4,
        played: 3,
        won: 1,
        drawn: 0,
        lost: 2,
        goals_for: 4,
        goals_against: 6,
        points: 3,
        team_slug: 'kairat',
        team: 'Кайрат',
        logo: 'images/team-kairat.webp',
      },
      {
        tournament_slug: 'burchalkin-cup-2025',
        tournament_name: 'Кубок Бурчалкина 2025',
        season_year: 2025,
        group_name: '',
        position: 5,
        played: 3,
        won: 0,
        drawn: 2,
        lost: 1,
        goals_for: 3,
        goals_against: 5,
        points: 2,
        team_slug: 'palmeiras',
        team: 'Палмейрас',
        logo: 'images/team-palmeiras.webp',
      },
      {
        tournament_slug: 'burchalkin-cup-2025',
        tournament_name: 'Кубок Бурчалкина 2025',
        season_year: 2025,
        group_name: '',
        position: 6,
        played: 3,
        won: 0,
        drawn: 1,
        lost: 2,
        goals_for: 2,
        goals_against: 7,
        points: 1,
        team_slug: 'san-lorenzo',
        team: 'Сан-Лоренцо',
        logo: 'images/team-san-lorenzo.webp',
      }
    ],
    empty: () => ({
      tournament_slug: 'burchalkin-cup-2025',
      tournament_name: '',
      season_year: 2025,
      group_name: '',
      position: 1,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      goals_for: 0,
      goals_against: 0,
      points: 0,
      team_slug: '',
      team: '',
      logo: '',
    }),
    fields: [
      ['tournament_slug', 'Турнир', 'text'],
      ['group_name', 'Группа', 'text'],
      ['position', 'Место', 'number'],
      ['team', 'Команда', 'text'],
      ['team_slug', 'Slug команды', 'text'],
      ['logo', 'Логотип', 'logo'],
      ['played', 'Игр', 'number'],
      ['won', 'Побед', 'number'],
      ['drawn', 'Ничьих', 'number'],
      ['lost', 'Поражений', 'number'],
      ['goals_for', 'Забито', 'number'],
      ['goals_against', 'Пропущено', 'number'],
      ['points', 'Очки', 'number'],
    ],
  },
  news: {
    key: 'bcup_news',
    exportName: 'news.json',
    title: 'Новости',
    help: 'Новости можно редактировать через API и сразу публиковать на сайте.',
    defaultData: [
      {
        id: Date.now(),
        tournament_slug: 'burchalkin-cup-2026',
        slug: 'new-article',
        date: '',
        title: '',
        excerpt: '',
        body: '',
        link: 'news.html',
        image: '',
        is_published: true,
      }
    ],
    empty: () => ({
      id: Date.now(),
      tournament_slug: 'burchalkin-cup-2026',
      slug: '',
      date: '',
      title: '',
      excerpt: '',
      body: '',
      link: 'news.html',
      image: '',
      is_published: true,
    }),
    fields: [
      ['id', 'ID', 'number'],
      ['tournament_slug', 'Турнир', 'text'],
      ['slug', 'Slug', 'text'],
      ['date', 'Дата', 'date'],
      ['title', 'Заголовок', 'text'],
      ['excerpt', 'Краткое описание', 'textarea'],
      ['body', 'Текст новости', 'textarea'],
      ['link', 'Ссылка', 'text'],
      ['image', 'Картинка', 'image'],
      ['is_published', 'Опубликовано', 'checkbox'],
    ],
  },
  partners: {
    key: 'bcup_admin_partners',
    exportName: 'partners.json',
    title: 'Партнёры',
    filterCategory: 'general',
    help: 'Каталог партнёров, категорий, логотипов и ссылок. Если ссылка не указана, карточка партнёра ведёт на главную страницу сайта.',
    defaultData: DEFAULT_PARTNERS,
    empty: () => ({
      slug: '',
      name: '',
      category: 'general',
      tournament_slug: 'burchalkin-cup-2026',
      website_url: '',
      logo_url: '',
      alt_text: '',
      sort_order: 1,
      is_visible: true,
      note: '',
    }),
    fields: [
      ['slug', 'Slug', 'text'],
      ['name', 'Название', 'text'],
      ['category', 'Категория', 'select', ['general', 'media', 'title', 'official']],
      ['tournament_slug', 'Турнир', 'text'],
      ['website_url', 'Ссылка партнёра', 'url'],
      ['logo_url', 'Логотип', 'image'],
      ['alt_text', 'Alt', 'text'],
      ['sort_order', 'Порядок', 'number'],
      ['is_visible', 'Показывать', 'checkbox'],
      ['note', 'Примечание', 'textarea'],
    ],
  },
  partners_media: {
    key: 'bcup_admin_partners_media',
    exportName: 'partners-media.json',
    title: 'Информационные партнёры',
    filterCategory: 'media',
    help: 'Информационные партнёры турнира. Сохраняются в тот же общий каталог партнёров.',
    defaultData: DEFAULT_PARTNERS,
    empty: () => ({
      slug: '',
      name: '',
      category: 'media',
      tournament_slug: 'burchalkin-cup-2026',
      website_url: '',
      logo_url: '',
      alt_text: '',
      sort_order: 1,
      is_visible: true,
      note: '',
    }),
    fields: [
      ['slug', 'Slug', 'text'],
      ['name', 'Название', 'text'],
      ['category', 'Категория', 'select', ['general', 'media', 'title', 'official']],
      ['tournament_slug', 'Турнир', 'text'],
      ['website_url', 'Ссылка партнёра', 'url'],
      ['logo_url', 'Логотип', 'image'],
      ['alt_text', 'Alt', 'text'],
      ['sort_order', 'Порядок', 'number'],
      ['is_visible', 'Показывать', 'checkbox'],
      ['note', 'Примечание', 'textarea'],
    ],
  },
};

let currentSource = 'tournaments';
let defaultsCache = {};
let renderedDataCache = {};

function getApiBaseUrl() {
  return String(window.BCUP_CONFIG?.apiBaseUrl || '').replace(/\/+$/, '');
}

function getAdminToken() {
  return sessionStorage.getItem(ADMIN_TOKEN_KEY) || '';
}

function setAdminToken(token) {
  const value = String(token || '').trim();
  if (value) {
    sessionStorage.setItem(ADMIN_TOKEN_KEY, value);
  } else {
    sessionStorage.removeItem(ADMIN_TOKEN_KEY);
  }
}

function setLoginStatus(text, isError = false) {
  const node = document.getElementById('admin-login-status');
  if (!node) return;
  node.textContent = text;
  node.dataset.state = isError ? 'error' : 'default';
}

function setAdminAuthenticated(isAuthenticated) {
  const authSection = document.getElementById('admin-auth-section');
  const app = document.getElementById('admin-app');
  if (authSection) authSection.hidden = isAuthenticated;
  if (app) app.hidden = !isAuthenticated;
}

function resetAdminSession(message = 'Войди в админ-панель, чтобы продолжить.') {
  setAdminToken('');
  setAdminAuthenticated(false);
  setLoginStatus(message, true);
  setStatus(message);
}

async function createAdminSession(password) {
  const apiBaseUrl = getApiBaseUrl();
  if (!apiBaseUrl) {
    throw new Error('В js/config.js не указан apiBaseUrl');
  }

  const response = await fetch(`${apiBaseUrl}/api/admin/session`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      password: String(password || '').trim()
    })
  });

  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(body.error || `Ошибка входа (${response.status})`);
  }

  return body;
}

function cloneDefaultData(sourceName) {
  return normalizeSourceData(sourceName, structuredClone(ADMIN_SOURCES[sourceName].defaultData || []));
}

function getAdminSourceMeta(sourceName) {
  return ADMIN_SOURCES[sourceName] || null;
}

function getAdminApiSourceName(sourceName) {
  if (sourceName === 'partners_media') return 'partners';
  if (sourceName === 'archive_tournaments') return 'tournaments';
  if (sourceName === 'archive_matches') return 'matches';
  if (sourceName === 'archive_standings') return 'standings';
  if (sourceName === 'media') return 'matches';
  return sourceName;
}

function normalizeTournamentAdminItem(item) {
  return {
    ...item,
    countdown_enabled: item?.countdown_enabled !== false,
    standings_mode: String(item?.standings_mode || 'auto').trim() || 'auto',
    playoff_mode: String(item?.playoff_mode || 'auto').trim() || 'auto',
  };
}

function getAdminMatchStatusLabel(status, fallback = '') {
  const normalized = String(status || '').trim().toLowerCase();
  const labels = {
    soon: 'Скоро',
    live: 'В эфире',
    done: 'Завершен',
    postponed: 'Перенесен',
    cancelled: 'Отменен',
  };

  return labels[normalized] || String(fallback || '').trim();
}

function normalizeMatchAdminItem(item) {
  return {
    ...item,
    status_label: getAdminMatchStatusLabel(item?.status, item?.status_label),
  };
}

function normalizeStandingAdminItem(item, index = 0) {
  return {
    ...item,
    tournament_slug: String(item?.tournament_slug || 'burchalkin-cup-2026').trim() || 'burchalkin-cup-2026',
    tournament_name: String(item?.tournament_name || '').trim(),
    season_year: Number(item?.season_year || 2026) || 2026,
    group_name: String(item?.group_name || '').trim(),
    position: Number(item?.position || index + 1) || index + 1,
    played: Number(item?.played || 0) || 0,
    won: Number(item?.won || 0) || 0,
    drawn: Number(item?.drawn || 0) || 0,
    lost: Number(item?.lost || 0) || 0,
    goals_for: Number(item?.goals_for || 0) || 0,
    goals_against: Number(item?.goals_against || 0) || 0,
    points: Number(item?.points || 0) || 0,
    team_slug: String(item?.team_slug || '').trim(),
    team: String(item?.team || '').trim(),
    logo: String(item?.logo || '').trim(),
  };
}

function normalizePlayoffAdminItem(item, index = 0) {
  return {
    ...item,
    tournament_slug: String(item?.tournament_slug || 'burchalkin-cup-2026').trim() || 'burchalkin-cup-2026',
    tournament_name: String(item?.tournament_name || '').trim(),
    bracket_group: String(item?.bracket_group || 'top').trim() || 'top',
    round_group: String(item?.round_group || 'semifinal').trim() || 'semifinal',
    match_key: String(item?.match_key || `playoff_${index + 1}`).trim() || `playoff_${index + 1}`,
    sort_order: Number(item?.sort_order || index + 1) || index + 1,
    label: String(item?.label || '').trim(),
    home_team: String(item?.home_team || '').trim(),
    home_team_slug: String(item?.home_team_slug || '').trim(),
    home_logo: String(item?.home_logo || '').trim(),
    away_team: String(item?.away_team || '').trim(),
    away_team_slug: String(item?.away_team_slug || '').trim(),
    away_logo: String(item?.away_logo || '').trim(),
    home_score: Number(item?.home_score || 0) || 0,
    away_score: Number(item?.away_score || 0) || 0,
  };
}

function normalizeAlbumAdminItem(item, index = 0) {
  return {
    ...item,
    slug: String(item?.slug || '').trim(),
    title: String(item?.title || '').trim(),
    tournament_slug: String(item?.tournament_slug || '').trim(),
    published_on: String(item?.published_on || '').trim(),
    badge: String(item?.badge || 'Фотоальбом').trim() || 'Фотоальбом',
    cover_image_url: String(item?.cover_image_url || '').trim(),
    cover_alt_text: String(item?.cover_alt_text || item?.title || '').trim(),
    card_excerpt: String(item?.card_excerpt || '').trim(),
    description: String(item?.description || '').trim(),
    sort_order: Number(item?.sort_order || index + 1) || index + 1,
    is_visible: item?.is_visible !== false,
    photos: Array.isArray(item?.photos)
      ? item.photos.map((photo, photoIndex) => ({
        image_url: String(photo?.image_url || '').trim(),
        alt_text: String(photo?.alt_text || '').trim(),
        sort_order: Number(photo?.sort_order || photoIndex + 1) || photoIndex + 1
      }))
      : []
  };
}

function normalizeSourceData(sourceName, data) {
  const sourceMeta = getAdminSourceMeta(sourceName);
  const items = Array.isArray(data) ? data : [];
  if (sourceName === 'tournaments' || sourceName === 'archive_tournaments') {
    const normalizedItems = items.map(normalizeTournamentAdminItem);
    if (sourceMeta?.filterArchived) {
      return normalizedItems.filter(item => !item?.is_featured && Number(item?.season_year || 0) < 2026);
    }
    return normalizedItems.filter(item => item?.is_featured || Number(item?.season_year || 0) >= 2026);
  }
  if (sourceName === 'matches' || sourceName === 'archive_matches') {
    const normalizedItems = items.map(normalizeMatchAdminItem);
    if (sourceMeta?.filterArchiveMatches) {
      return normalizedItems.filter(item => {
        const tournamentSlug = String(item?.tournament_slug || '').trim();
        return tournamentSlug && tournamentSlug !== 'burchalkin-cup-2026';
      });
    }
    return normalizedItems.filter(item => {
      const tournamentSlug = String(item?.tournament_slug || '').trim();
      return !tournamentSlug || tournamentSlug === 'burchalkin-cup-2026';
    });
  }
  if (sourceName === 'media') {
    const looksLikeMatchPayload = items.some(item => Object.prototype.hasOwnProperty.call(item || {}, 'home_team') || Object.prototype.hasOwnProperty.call(item || {}, 'video'));
    if (looksLikeMatchPayload) {
      const currentMatches = normalizeSourceData('matches', items);
      const featuredMatch = currentMatches.find(item => item?.is_featured_media === true)
        || currentMatches.find(item => String(item?.video || '').trim())
        || currentMatches[0]
        || null;
      return [{
        featured_match_id: featuredMatch ? String(featuredMatch.id || '') : ''
      }];
    }
    return [{
      featured_match_id: String(items[0]?.featured_match_id || '').trim()
    }];
  }
  if (sourceName === 'standings') {
    return items
      .map((item, index) => normalizeStandingAdminItem(item, index))
      .filter(item => String(item?.tournament_slug || '').trim() === 'burchalkin-cup-2026')
      .sort((left, right) => {
        const groupCompare = String(left.group_name || '').localeCompare(String(right.group_name || ''), 'ru');
        if (groupCompare !== 0) return groupCompare;
        return Number(left.position || 0) - Number(right.position || 0);
      });
  }
  if (sourceName === 'archive_standings') {
    return items
      .map((item, index) => normalizeStandingAdminItem(item, index))
      .filter(item => {
        const tournamentSlug = String(item?.tournament_slug || '').trim();
        return tournamentSlug && tournamentSlug !== 'burchalkin-cup-2026';
      })
      .sort((left, right) => {
        const tournamentCompare = String(left.tournament_slug || '').localeCompare(String(right.tournament_slug || ''), 'ru');
        if (tournamentCompare !== 0) return tournamentCompare;
        const groupCompare = String(left.group_name || '').localeCompare(String(right.group_name || ''), 'ru');
        if (groupCompare !== 0) return groupCompare;
        return Number(left.position || 0) - Number(right.position || 0);
      });
  }
  if (sourceName === 'playoff') {
    return items
      .map((item, index) => normalizePlayoffAdminItem(item, index))
      .sort((left, right) => {
        const leftBracketWeight = left.bracket_group === 'top' ? 0 : 1;
        const rightBracketWeight = right.bracket_group === 'top' ? 0 : 1;
        if (leftBracketWeight !== rightBracketWeight) return leftBracketWeight - rightBracketWeight;

        const leftRoundWeight = left.round_group === 'semifinal' ? 0 : 1;
        const rightRoundWeight = right.round_group === 'semifinal' ? 0 : 1;
        if (leftRoundWeight !== rightRoundWeight) return leftRoundWeight - rightRoundWeight;

        return Number(left.sort_order || 0) - Number(right.sort_order || 0);
      });
  }
  if (sourceName === 'albums') {
    return items.map((item, index) => normalizeAlbumAdminItem(item, index));
  }
  if (sourceMeta?.filterCategory) {
    return items.filter(item => String(item?.category || 'general') === sourceMeta.filterCategory);
  }
  return items;
}

async function fetchAdminCollection(apiSourceName) {
  const apiBaseUrl = getApiBaseUrl();
  const token = getAdminToken();

  if (!apiBaseUrl) {
    throw new Error('В js/config.js не указан apiBaseUrl');
  }
  if (!token) {
    throw new Error('Сначала войди в админ-панель.');
  }

  const response = await fetch(`${apiBaseUrl}/api/admin/${apiSourceName}`, {
    headers: {
      'x-admin-token': token
    }
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    if (response.status === 401) {
      resetAdminSession('Сессия админ-панели завершилась. Войди ещё раз.');
      throw new Error('Сессия админ-панели завершилась. Войди ещё раз.');
    }
    throw new Error(body.error || `Ошибка API (${response.status})`);
  }

  return response.json();
}

async function fetchAdminSource(sourceName) {
  const data = await fetchAdminCollection(getAdminApiSourceName(sourceName));
  return normalizeSourceData(sourceName, data);
}

async function pushAdminSource(sourceName, data) {
  const sourceMeta = getAdminSourceMeta(sourceName);
  const apiSourceName = getAdminApiSourceName(sourceName);
  const apiBaseUrl = getApiBaseUrl();
  const token = getAdminToken();

  if (!apiBaseUrl) {
    throw new Error('В js/config.js не указан apiBaseUrl');
  }
  if (!token) {
    throw new Error('Сначала войди в админ-панель.');
  }

  let payload = data;
  if (sourceMeta?.filterCategory) {
    const allPartners = await fetchAdminCollection(apiSourceName);
    payload = [
      ...allPartners.filter(item => String(item?.category || 'general') !== sourceMeta.filterCategory),
      ...normalizeSourceData(sourceName, data),
    ];
  } else if (sourceName === 'archive_tournaments') {
    const allTournaments = await fetchAdminCollection(apiSourceName);
    payload = [
      ...normalizeSourceData('tournaments', allTournaments),
      ...normalizeSourceData(sourceName, data),
    ];
  } else if (sourceName === 'archive_matches') {
    const allMatches = await fetchAdminCollection(apiSourceName);
    payload = [
      ...normalizeSourceData('matches', allMatches),
      ...normalizeSourceData(sourceName, data),
    ];
  } else if (sourceName === 'archive_standings') {
    const allStandings = await fetchAdminCollection(apiSourceName);
    payload = [
      ...allStandings.filter(item => {
        const tournamentSlug = String(item?.tournament_slug || '').trim();
        return !tournamentSlug || tournamentSlug === 'burchalkin-cup-2026';
      }),
      ...normalizeSourceData(sourceName, data),
    ];
  } else if (sourceName === 'standings') {
    const allStandings = await fetchAdminCollection(apiSourceName);
    payload = [
      ...allStandings.filter(item => {
        const tournamentSlug = String(item?.tournament_slug || '').trim();
        return tournamentSlug && tournamentSlug !== 'burchalkin-cup-2026';
      }),
      ...normalizeSourceData(sourceName, data),
    ];
  } else if (sourceName === 'media') {
    const allMatches = await fetchAdminCollection(apiSourceName);
    const selectedId = String(normalizeSourceData(sourceName, data)[0]?.featured_match_id || '').trim();
    payload = allMatches.map(item => ({
      ...item,
      is_featured_media: selectedId ? String(item?.id || '') === selectedId : false,
    }));
  }

  const response = await fetch(`${apiBaseUrl}/api/admin/${apiSourceName}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'x-admin-token': token
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    if (response.status === 401) {
      resetAdminSession('Сессия админ-панели завершилась. Войди ещё раз.');
      throw new Error('Сессия админ-панели завершилась. Войди ещё раз.');
    }
    throw new Error(body.error || `Ошибка API (${response.status})`);
  }

  return response.json();
}

async function uploadAdminImage({ file, sourceName, key }) {
  const apiBaseUrl = getApiBaseUrl();
  const token = getAdminToken();

  if (!apiBaseUrl) {
    throw new Error('В js/config.js не указан apiBaseUrl');
  }
  if (!token) {
    throw new Error('Сначала войди в админ-панель.');
  }

  const dataUrl = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('Не удалось прочитать файл'));
    reader.readAsDataURL(file);
  });

  const response = await fetch(`${apiBaseUrl}/api/admin/uploads/image`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-admin-token': token
    },
    body: JSON.stringify({
      file: dataUrl,
      folder: `burcup/${sourceName}/${key}`,
      filename: file.name.replace(/\.[^.]+$/, '').toLowerCase().replace(/[^a-z0-9_-]+/g, '-'),
      original_filename: file.name
    })
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    if (response.status === 401) {
      resetAdminSession('Сессия админ-панели завершилась. Войди ещё раз.');
      throw new Error('Сессия админ-панели завершилась. Войди ещё раз.');
    }
    throw new Error(body.error || `Ошибка upload API (${response.status})`);
  }

  return response.json();
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('Не удалось прочитать файл'));
    reader.readAsDataURL(file);
  });
}

async function adminLoadDefault(sourceName) {
  if (defaultsCache[sourceName]) return structuredClone(defaultsCache[sourceName]);

  try {
    const data = await fetchAdminSource(sourceName);
    defaultsCache[sourceName] = structuredClone(data);
    setSourceData(sourceName, data);
    return structuredClone(data);
  } catch (error) {
    defaultsCache[sourceName] = cloneDefaultData(sourceName);
    return structuredClone(defaultsCache[sourceName]);
  }
}

function getSourceData(sourceName) {
  const source = ADMIN_SOURCES[sourceName];
  const local = localStorage.getItem(source.key);
  if (local) {
    try {
      return normalizeSourceData(sourceName, JSON.parse(local));
    } catch (e) {}
  }
  return null;
}

function setSourceData(sourceName, data) {
  localStorage.setItem(ADMIN_SOURCES[sourceName].key, JSON.stringify(normalizeSourceData(sourceName, data)));
}

function setRenderedData(sourceName, data) {
  renderedDataCache[sourceName] = normalizeSourceData(sourceName, structuredClone(data));
}

function syncTextareaWithRenderedData(sourceName) {
  const data = renderedDataCache[sourceName];
  if (!data) return;
  document.getElementById('admin-textarea').value = JSON.stringify(data, null, 2);
  setSourceData(sourceName, data);
}

function updateRenderedItem(sourceName, index, updater) {
  const current = renderedDataCache[sourceName] || [];
  if (!current[index]) return;
  const next = structuredClone(current);
  updater(next[index]);
  setRenderedData(sourceName, next);
  syncTextareaWithRenderedData(sourceName);
}

function setStatus(text) {
  document.getElementById('admin-status').textContent = text;
}

let adminToastTimer = null;

function showAdminToast(message, type = 'success') {
  const toast = document.getElementById('admin-toast');
  if (!toast) return;

  toast.textContent = message;
  toast.hidden = false;
  toast.classList.remove('is-success', 'is-error', 'is-visible');
  toast.classList.add(type === 'error' ? 'is-error' : 'is-success');

  requestAnimationFrame(() => {
    toast.classList.add('is-visible');
  });

  if (adminToastTimer) {
    window.clearTimeout(adminToastTimer);
  }

  adminToastTimer = window.setTimeout(() => {
    toast.classList.remove('is-visible');
    window.setTimeout(() => {
      toast.hidden = true;
    }, 220);
  }, 2600);
}

function getAdminMatchClubKey(item, side) {
  const slugValue = side === 'home' ? item?.home_team_slug : item?.away_team_slug;
  const slug = String(slugValue || '').trim().toLowerCase();
  if (slug) return slug;

  const nameValue = side === 'home' ? item?.home_team : item?.away_team;
  return String(nameValue || '').trim().toLowerCase();
}

function getAdminMatchSortValue(item) {
  const date = String(item?.date || '').trim();
  const time = String(item?.time || '').trim();
  if (date) {
    const parsed = Date.parse(`${date}T${time || '00:00'}:00`);
    if (Number.isFinite(parsed)) return parsed;
  }

  const numericId = Number(item?.id);
  return Number.isFinite(numericId) ? numericId : 0;
}

function getAdminHeadToHeadMatches(items, currentIndex) {
  const current = items[currentIndex] || null;
  if (!current) return [];

  const homeKey = getAdminMatchClubKey(current, 'home');
  const awayKey = getAdminMatchClubKey(current, 'away');
  if (!homeKey || !awayKey) return [];

  return items
    .filter((item, index) => {
      if (!item || index === currentIndex) return false;
      if (String(item.status || '').trim().toLowerCase() !== 'done') return false;

      const itemHomeKey = getAdminMatchClubKey(item, 'home');
      const itemAwayKey = getAdminMatchClubKey(item, 'away');

      return (
        (itemHomeKey === homeKey && itemAwayKey === awayKey) ||
        (itemHomeKey === awayKey && itemAwayKey === homeKey)
      );
    })
    .sort((left, right) => getAdminMatchSortValue(right) - getAdminMatchSortValue(left));
}

function buildAdminHeadToHeadPreview(item, itemIndex, items) {
  const homeKey = getAdminMatchClubKey(item, 'home');
  const awayKey = getAdminMatchClubKey(item, 'away');

  if (!homeKey || !awayKey) {
    return '<div class="admin-match-preview-empty">Укажи хозяев и гостей, чтобы увидеть личные встречи этой пары.</div>';
  }

  const headToHeadMatches = getAdminHeadToHeadMatches(items, itemIndex);
  if (!headToHeadMatches.length) {
    return '<div class="admin-match-preview-empty">Команды не встречались ранее.</div>';
  }

  return `
    <div class="admin-match-preview-list">
      ${headToHeadMatches.map(match => {
        const score = String(match.score || '0:0');
        const dateTime = joinNonEmpty([String(match.date || '').trim(), String(match.time || '').trim()], ' ');
        const meta = joinNonEmpty([
          String(match.group || '').trim(),
          String(match.round || '').trim(),
          String(match.status_label || '').trim()
        ], ' • ');

        return `
          <a class="admin-match-preview-row" href="match.html?id=${encodeURIComponent(match.id)}" target="_blank" rel="noreferrer">
            <div class="admin-match-preview-main">
              <strong>${escapeHtml(String(match.home_team || '').trim())} — ${escapeHtml(String(match.away_team || '').trim())}</strong>
              <span>${escapeHtml(joinNonEmpty([dateTime, meta], ' • '))}</span>
            </div>
            <div class="admin-match-preview-score">${escapeHtml(score)}</div>
          </a>
        `;
      }).join('')}
    </div>
  `;
}

function makeMatchHeadToHeadPreview(item, itemIndex, allItems) {
  return `
    <div class="admin-match-preview" data-admin-match-preview="${itemIndex}">
      <div class="admin-match-preview-head">
        <strong>Личные встречи</strong>
        <span>Завершённые очные матчи автоматически появятся на странице матча.</span>
      </div>
      <div class="admin-match-preview-body" data-admin-match-preview-body="${itemIndex}">
        ${buildAdminHeadToHeadPreview(item, itemIndex, allItems)}
      </div>
    </div>
  `;
}

function refreshAdminMatchPreviews(wrap, sourceName = 'matches') {
  if (!wrap) return;
  const items = readFormData(sourceName);
  wrap.querySelectorAll('[data-admin-match-preview-body]').forEach(node => {
    const index = Number(node.dataset.adminMatchPreviewBody);
    node.innerHTML = buildAdminHeadToHeadPreview(items[index] || {}, index, items);
  });
}

function makeLogoPicker(value, key, index) {
  return `
    <div class="admin-field">
      <label>Логотип</label>
      <input type="text" value="${value || ''}" data-key="${key}" data-index="${index}" class="admin-logo-input">
      <div class="admin-logo-picker">
        ${TEAM_LOGOS.map(team => `
          <button type="button" class="admin-logo-option ${value === team.path ? 'active' : ''}" data-pick-logo="${key}" data-index="${index}" data-value="${team.path}">
            <img src="${team.path}" alt="${team.name}">
            <span>${team.name}</span>
          </button>
        `).join('')}
      </div>
    </div>
  `;
}

function makeImageField(value, key, index) {
  const safeValue = value || '';
  return `
    <div class="admin-field">
      <label>Картинка</label>
      <input type="text" value="${safeValue}" data-key="${key}" data-index="${index}" class="admin-image-input">
      <div class="admin-inline-actions">
        <label class="admin-small-btn">
          Загрузить файл
          <input type="file" accept="image/*" data-upload-image="${key}" data-index="${index}" style="display:none">
        </label>
      </div>
      <div class="admin-preview-box">
        ${safeValue ? `<img src="${safeValue}" alt="preview">` : '<div>Превью появится здесь</div>'}
      </div>
    </div>
  `;
}

function getAdminClubsCatalog() {
  const localClubs = getSourceData('clubs');
  const base = localClubs || defaultsCache.clubs || ADMIN_SOURCES.clubs.defaultData || [];
  return normalizeSourceData('clubs', structuredClone(base))
    .filter(club => club && String(club.name || '').trim())
    .sort((left, right) => String(left.name || '').localeCompare(String(right.name || ''), 'ru'));
}

function findAdminClubByMatchSide(item, side) {
  const clubs = getAdminClubsCatalog();
  const slug = String(side === 'home' ? item?.home_team_slug : item?.away_team_slug || '').trim().toLowerCase();
  const name = String(side === 'home' ? item?.home_team : item?.away_team || '').trim().toLowerCase();

  return clubs.find(club => {
    const clubSlug = String(club.slug || '').trim().toLowerCase();
    const clubName = String(club.name || '').trim().toLowerCase();
    return (slug && clubSlug === slug) || (name && clubName === name);
  }) || null;
}

function makeMatchClubSelect(item, side, itemIndex) {
  const selectedClub = findAdminClubByMatchSide(item, side);
  const clubs = getAdminClubsCatalog();
  const sideLabel = side === 'home' ? 'Хозяева' : 'Гости';
  const selectedSlug = String(selectedClub?.slug || '').trim();

  return `
    <div class="admin-field admin-match-club-select">
      <label>${sideLabel}: выбрать клуб</label>
      <select data-club-select="${side}" data-index="${itemIndex}">
        <option value="">Выбери команду</option>
        ${clubs.map(club => `
          <option value="${escapeHtml(String(club.slug || ''))}" ${selectedSlug === String(club.slug || '') ? 'selected' : ''}>
            ${escapeHtml(String(club.name || ''))}
          </option>
        `).join('')}
      </select>
    </div>
  `;
}

function findAdminClubByStanding(item) {
  const clubs = getAdminClubsCatalog();
  const slug = String(item?.team_slug || '').trim().toLowerCase();
  const name = String(item?.team || '').trim().toLowerCase();

  return clubs.find(club => {
    const clubSlug = String(club.slug || '').trim().toLowerCase();
    const clubName = String(club.name || '').trim().toLowerCase();
    return (slug && clubSlug === slug) || (name && clubName === name);
  }) || null;
}

function makeStandingClubSelect(item, itemIndex) {
  const selectedClub = findAdminClubByStanding(item);
  const clubs = getAdminClubsCatalog();
  const selectedSlug = String(selectedClub?.slug || '').trim();

  return `
    <div class="admin-field admin-match-club-select">
      <label>Команда: выбрать клуб</label>
      <select data-standing-club-select="team" data-index="${itemIndex}">
        <option value="">Выбери команду</option>
        ${clubs.map(club => `
          <option value="${escapeHtml(String(club.slug || ''))}" ${selectedSlug === String(club.slug || '') ? 'selected' : ''}>
            ${escapeHtml(String(club.name || ''))}
          </option>
        `).join('')}
      </select>
    </div>
  `;
}

function getAdminSourceField(sourceName, key) {
  return (ADMIN_SOURCES[sourceName]?.fields || []).find(field => field[0] === key) || null;
}

function makeFieldByKey(sourceName, key, item, itemIndex) {
  const field = getAdminSourceField(sourceName, key);
  if (!field) return '';
  return makeField(field, item[key], itemIndex);
}

function makeFieldsByKeys(sourceName, keys, item, itemIndex) {
  return keys.map(key => makeFieldByKey(sourceName, key, item, itemIndex)).join('');
}

function renderSectionedAdminCard(title, index, sections) {
  return `
    <div class="admin-item-card admin-record-card" data-item-index="${index}">
      <div class="admin-item-head">
        <strong>${title} #${index + 1}</strong>
        <button type="button" class="admin-item-remove" data-remove="${index}">Удалить</button>
      </div>

      <div class="admin-record-layout">
        ${sections.map(section => `
          <div class="admin-record-section">
            <div class="admin-record-section-head">${section.title}</div>
            <div class="admin-form-grid ${section.gridClass || ''}">
              ${section.content}
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function renderMatchAdminCard(item, index, allItems) {
  return `
    <div class="admin-item-card admin-match-card" data-item-index="${index}">
      <div class="admin-item-head">
        <strong>Матч #${index + 1}</strong>
        <button type="button" class="admin-item-remove" data-remove="${index}">Удалить</button>
      </div>

      <div class="admin-match-layout">
        <div class="admin-match-section">
          <div class="admin-match-section-head">Основная информация</div>
          <div class="admin-form-grid admin-match-top-grid">
            ${makeFieldsByKeys('matches', ['id', 'tournament_slug', 'date', 'time', 'status', 'status_label', 'score', 'group', 'round', 'matchday', 'venue'], item, index)}
          </div>
        </div>

        <div class="admin-match-section">
          <div class="admin-match-section-head">Команды</div>
          <div class="admin-match-teams-grid">
            <div class="admin-match-team-card">
              <div class="admin-match-team-title">Хозяева</div>
              <div class="admin-form-grid admin-match-team-grid">
                ${makeMatchClubSelect(item, 'home', index)}
                ${makeFieldsByKeys('matches', ['home_team', 'home_team_slug', 'home_logo'], item, index)}
              </div>
            </div>

            <div class="admin-match-team-card">
              <div class="admin-match-team-title">Гости</div>
              <div class="admin-form-grid admin-match-team-grid">
                ${makeMatchClubSelect(item, 'away', index)}
                ${makeFieldsByKeys('matches', ['away_team', 'away_team_slug', 'away_logo'], item, index)}
              </div>
            </div>
          </div>
        </div>

        <div class="admin-match-section">
          <div class="admin-match-section-head">Медиа и описание</div>
          <div class="admin-form-grid admin-match-extra-grid">
            ${makeFieldsByKeys('matches', ['video', 'review_video', 'interview_video', 'summary'], item, index)}
          </div>
        </div>

        ${makeMatchHeadToHeadPreview(item, index, allItems)}
      </div>
    </div>
  `;
}

function getCurrentAdminMatchesCatalog() {
  const localMatches = renderedDataCache.matches || getSourceData('matches');
  const base = localMatches || defaultsCache.matches || ADMIN_SOURCES.matches.defaultData || [];
  return normalizeSourceData('matches', structuredClone(base))
    .sort((left, right) => {
      const leftDateTime = `${String(left?.date || '')} ${String(left?.time || '')}`.trim();
      const rightDateTime = `${String(right?.date || '')} ${String(right?.time || '')}`.trim();
      return leftDateTime.localeCompare(rightDateTime);
    });
}

function formatAdminFeaturedMatchLabel(item) {
  return joinNonEmpty([
    item?.date,
    item?.time,
    joinNonEmpty([item?.home_team, item?.away_team], ' — ')
  ], ' • ');
}

function renderMediaAdminCard(item) {
  const selectedId = String(item?.featured_match_id || '').trim();
  const matches = getCurrentAdminMatchesCatalog();
  const selectedMatch = matches.find(match => String(match?.id || '') === selectedId) || null;

  return `
    <div class="admin-item-card admin-record-card admin-media-card" data-item-index="0">
      <div class="admin-item-head">
        <strong>Главный эфир</strong>
      </div>

      <div class="admin-record-layout">
        <div class="admin-record-section">
          <div class="admin-record-section-head">Выбор матча</div>
          <div class="admin-form-grid admin-record-grid-1">
            <div class="admin-record-note">Выбери матч текущего турнира. После сохранения именно он станет главным блоком страницы «Медиа».</div>
            <div class="admin-field" style="grid-column:1/-1">
              <label>Главный матч</label>
              <select data-key="featured_match_id" data-index="0">
                <option value="">Не выбран</option>
                ${matches.map(match => `
                  <option value="${escapeHtml(String(match.id || ''))}" ${String(match.id || '') === selectedId ? 'selected' : ''}>
                    ${escapeHtml(formatAdminFeaturedMatchLabel(match))}
                  </option>
                `).join('')}
              </select>
            </div>
          </div>
        </div>

        <div class="admin-record-section">
          <div class="admin-record-section-head">Превью блока</div>
          <div class="admin-form-grid admin-record-grid-1">
            ${selectedMatch ? `
              <div class="admin-media-preview">
                <div class="admin-media-preview-top">
                  <span class="archive-stat-chip">Главный эфир</span>
                  <span class="upcoming-status ${escapeHtml(String(selectedMatch.status || 'soon'))}">${escapeHtml(selectedMatch.status_label || 'Скоро')}</span>
                </div>
                <div class="admin-media-preview-title">${escapeHtml(joinNonEmpty([selectedMatch.home_team, selectedMatch.away_team], ' — '))}</div>
                <div class="admin-media-preview-meta">${escapeHtml(joinNonEmpty([selectedMatch.date, selectedMatch.time, selectedMatch.group], ' • '))}</div>
                ${selectedMatch.summary ? `<div class="admin-media-preview-summary">${escapeHtml(selectedMatch.summary)}</div>` : ''}
              </div>
            ` : `
              <div class="admin-match-preview-empty">Выбери матч, и здесь появится превью главного блока страницы «Медиа».</div>
            `}
          </div>
        </div>
      </div>
    </div>
  `;
}

function makeAlbumPhotoImageField(photo, itemIndex, photoIndex) {
  const safeValue = String(photo?.image_url || '').trim();
  return `
    <div class="admin-field admin-field-photo" style="grid-column:1/-1">
      <label>Фотография</label>
      <input
        type="text"
        value="${safeValue}"
        data-photo-key="image_url"
        data-index="${itemIndex}"
        data-photo-index="${photoIndex}"
        class="admin-image-input admin-album-photo-input"
      >
      <div class="admin-inline-actions">
        <label class="admin-small-btn">
          Загрузить файл
          <input
            type="file"
            accept="image/*"
            data-upload-image="image_url"
            data-index="${itemIndex}"
            data-photo-index="${photoIndex}"
            style="display:none"
          >
        </label>
      </div>
      <div class="admin-preview-box admin-album-photo-preview">
        ${safeValue ? `<img src="${safeValue}" alt="preview">` : '<div>Превью появится здесь</div>'}
      </div>
    </div>
  `;
}

function renderAlbumPhotoEditor(photo, itemIndex, photoIndex) {
  return `
    <div class="admin-album-photo-row" data-index="${itemIndex}" data-photo-row="${photoIndex}">
      <div class="admin-album-photo-head">
        <strong>Фото #${photoIndex + 1}</strong>
        <button type="button" class="admin-item-remove admin-album-photo-remove" data-remove-album-photo="${photoIndex}" data-index="${itemIndex}">Удалить фото</button>
      </div>
      <div class="admin-form-grid admin-record-grid-2 admin-album-photo-grid">
        ${makeAlbumPhotoImageField(photo, itemIndex, photoIndex)}
        <div class="admin-field">
          <label>Alt текст</label>
          <input type="text" value="${escapeHtml(photo?.alt_text || '')}" data-photo-key="alt_text" data-index="${itemIndex}" data-photo-index="${photoIndex}">
        </div>
        <div class="admin-field">
          <label>Порядок</label>
          <input type="number" min="1" step="1" value="${Number(photo?.sort_order || photoIndex + 1) || photoIndex + 1}" data-photo-key="sort_order" data-index="${itemIndex}" data-photo-index="${photoIndex}">
        </div>
      </div>
    </div>
  `;
}

function renderAlbumAdminCard(item, index) {
  const photos = Array.isArray(item?.photos) ? item.photos : [];
  return `
    <div class="admin-item-card admin-record-card admin-album-card" data-item-index="${index}">
      <div class="admin-item-head">
        <strong>Фотоальбом #${index + 1}</strong>
        <button type="button" class="admin-item-remove" data-remove="${index}">Удалить</button>
      </div>

      <div class="admin-record-layout">
        <div class="admin-record-section">
          <div class="admin-record-section-head">Основная информация</div>
          <div class="admin-form-grid admin-record-grid-3">
            ${makeFieldsByKeys('albums', ['slug', 'title', 'tournament_slug', 'published_on', 'badge', 'sort_order', 'is_visible'], item, index)}
          </div>
        </div>

        <div class="admin-record-section">
          <div class="admin-record-section-head">Карточка альбома</div>
          <div class="admin-form-grid admin-record-grid-2">
            ${makeFieldsByKeys('albums', ['cover_image_url', 'cover_alt_text'], item, index)}
            <div class="admin-field" style="grid-column:1/-1">
              <label>Подпись на карточке</label>
              <textarea data-key="card_excerpt" data-index="${index}">${escapeHtml(item?.card_excerpt || '')}</textarea>
            </div>
          </div>
        </div>

        <div class="admin-record-section">
          <div class="admin-record-section-head">Комментарий к альбому</div>
          <div class="admin-form-grid admin-record-grid-1">
            <div class="admin-field" style="grid-column:1/-1">
              <label>Комментарий</label>
              <textarea data-key="description" data-index="${index}">${escapeHtml(item?.description || '')}</textarea>
            </div>
          </div>
        </div>

        <div class="admin-record-section">
          <div class="admin-record-section-head">Фотографии альбома</div>
          <div class="admin-record-note">Загружай фотографии через кнопку «Загрузить файл». Файлы уйдут во внешний storage, а на сайт и в базу сохранится только их URL.</div>
          <div class="admin-album-photos">
            <div class="admin-inline-actions admin-album-bulk-actions">
              <label class="admin-small-btn">
                Загрузить много фото
                <input type="file" accept="image/*" multiple data-upload-album-batch="${index}" style="display:none">
              </label>
              <button type="button" class="admin-add admin-album-photo-add" data-add-album-photo="${index}">+ Добавить фото</button>
            </div>
            ${photos.length
              ? photos.map((photo, photoIndex) => renderAlbumPhotoEditor(photo, index, photoIndex)).join('')
              : '<div class="admin-match-preview-empty">Пока в альбоме нет фотографий. Добавь фото ниже.</div>'
            }
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderTournamentAdminCard(item, index, sourceName = 'tournaments') {
  const seasonYear = Number(item?.season_year || 0);
  const isFeatured = item?.is_featured === true;
  const tournamentSlug = String(item?.slug || '').trim();
  const isCurrentTournamentCard = sourceName === 'tournaments'
    && (isFeatured || tournamentSlug === 'burchalkin-cup-2026' || seasonYear >= 2026);
  const panelNote = isFeatured
    ? 'Эта запись управляет карточкой текущего турнира на главной странице.'
    : seasonYear && seasonYear < 2026
      ? 'Эта запись управляет архивной карточкой турнира.'
      : 'Эта запись управляет карточкой турнира на сайте.';

  return renderSectionedAdminCard('Турнир', index, [
    {
      title: 'Основная информация',
      gridClass: 'admin-record-grid-3',
      content: `
        <div class="admin-record-note">${escapeHtml(panelNote)}</div>
        ${makeFieldsByKeys(sourceName, ['slug', 'name', 'season_year', 'short_label', 'status', 'location', 'start_date', 'end_date'], item, index)}
      `
    },
    {
      title: 'Визуал и настройки',
      gridClass: 'admin-record-grid-2',
      content: makeFieldsByKeys(sourceName, ['logo', 'hero_image', 'is_featured', 'countdown_enabled'], item, index)
    },
    ...(isCurrentTournamentCard ? [{
      title: 'Режимы данных',
      gridClass: 'admin-record-grid-2',
      content: `
        <div class="admin-record-note">` +
          'Режим <strong>auto</strong> считает данные по матчам автоматически. ' +
          'Режим <strong>manual</strong> берёт ручные данные из разделов «Турнирная таблица» и «Сетка плей-офф». '
          + 'Для сайта используется режим текущего турнира.'
        + `</div>
        ${makeFieldsByKeys(sourceName, ['standings_mode', 'playoff_mode'], item, index)}
      `
    }] : []),
    {
      title: 'Описание',
      gridClass: 'admin-record-grid-1',
      content: makeFieldsByKeys(sourceName, ['description'], item, index)
    },
  ]);
}

function renderStandingAdminCard(item, index, sourceName = 'archive_standings') {
  return renderSectionedAdminCard('Турнирная строка', index, [
    {
      title: 'Привязка',
      gridClass: 'admin-record-grid-3',
      content: `
        ${makeStandingClubSelect(item, index)}
        ${makeFieldsByKeys(sourceName, ['tournament_slug', 'group_name', 'position', 'team', 'team_slug', 'logo'], item, index)}
      `
    },
    {
      title: 'Статистика',
      gridClass: 'admin-record-grid-3',
      content: makeFieldsByKeys(sourceName, ['played', 'won', 'drawn', 'lost', 'goals_for', 'goals_against', 'points'], item, index)
    }
  ]);
}

function renderPlayoffAdminCard(item, index) {
  return renderSectionedAdminCard('Матч плей-офф', index, [
    {
      title: 'Параметры матча',
      gridClass: 'admin-record-grid-3',
      content: makeFieldsByKeys('playoff', ['tournament_slug', 'bracket_group', 'round_group', 'match_key', 'sort_order', 'label'], item, index)
    },
    {
      title: 'Команды',
      gridClass: 'admin-record-grid-1',
      content: `
        <div class="admin-match-teams-grid">
          <div class="admin-match-team-card">
            <div class="admin-match-team-title">Хозяева</div>
            <div class="admin-form-grid admin-match-team-grid">
              ${makeMatchClubSelect(item, 'home', index)}
              ${makeFieldsByKeys('playoff', ['home_team', 'home_team_slug', 'home_logo', 'home_score'], item, index)}
            </div>
          </div>
          <div class="admin-match-team-card">
            <div class="admin-match-team-title">Гости</div>
            <div class="admin-form-grid admin-match-team-grid">
              ${makeMatchClubSelect(item, 'away', index)}
              ${makeFieldsByKeys('playoff', ['away_team', 'away_team_slug', 'away_logo', 'away_score'], item, index)}
            </div>
          </div>
        </div>
      `
    }
  ]);
}

function renderClubAdminCard(item, index) {
  return renderSectionedAdminCard('Клуб', index, [
    {
      title: 'Основная информация',
      gridClass: 'admin-record-grid-3',
      content: makeFieldsByKeys('clubs', ['slug', 'name', 'short_name', 'country', 'city', 'founded_year', 'is_active'], item, index)
    },
    {
      title: 'Визуал и ссылки',
      gridClass: 'admin-record-grid-2',
      content: makeFieldsByKeys('clubs', ['logo', 'hero_image', 'website_url'], item, index)
    },
    {
      title: 'Описание',
      gridClass: 'admin-record-grid-1',
      content: makeFieldsByKeys('clubs', ['description'], item, index)
    }
  ]);
}

function renderNewsAdminCard(item, index) {
  return renderSectionedAdminCard('Новость', index, [
    {
      title: 'Публикация',
      gridClass: 'admin-record-grid-3',
      content: makeFieldsByKeys('news', ['id', 'tournament_slug', 'slug', 'date', 'link', 'is_published'], item, index)
    },
    {
      title: 'Контент',
      gridClass: 'admin-record-grid-1',
      content: makeFieldsByKeys('news', ['title', 'excerpt', 'body'], item, index)
    },
    {
      title: 'Обложка',
      gridClass: 'admin-record-grid-1',
      content: makeFieldsByKeys('news', ['image'], item, index)
    }
  ]);
}

function renderPartnerAdminCard(item, index) {
  return renderSectionedAdminCard('Партнёр', index, [
    {
      title: 'Основная информация',
      gridClass: 'admin-record-grid-3',
      content: makeFieldsByKeys('partners', ['slug', 'name', 'category', 'tournament_slug', 'sort_order', 'is_visible'], item, index)
    },
    {
      title: 'Логотип и ссылка',
      gridClass: 'admin-record-grid-2',
      content: makeFieldsByKeys('partners', ['logo_url', 'website_url', 'alt_text'], item, index)
    },
    {
      title: 'Примечание',
      gridClass: 'admin-record-grid-1',
      content: makeFieldsByKeys('partners', ['note'], item, index)
    }
  ]);
}

function getPartnerCategoryTitle(category) {
  if (category === 'media') return 'Информационные партнёры';
  if (category === 'title') return 'Титульные партнёры';
  if (category === 'official') return 'Официальные партнёры';
  return 'Партнёры';
}

function renderPartnerSourceCards(sourceName, data) {
  const sourceMeta = getAdminSourceMeta(sourceName);
  const groups = sourceMeta?.filterCategory ? [sourceMeta.filterCategory] : ['general', 'media', 'title', 'official'];
  const chunks = [];

  groups.forEach(category => {
    const items = data
      .map((item, index) => ({ item, index }))
      .filter(entry => String(entry.item.category || 'general') === category);

    if (!items.length) return;

    chunks.push(`
      <div class="admin-source-group">
        <div class="admin-source-group-title">${getPartnerCategoryTitle(category)}</div>
        <div class="admin-form-list">
          ${items.map(({ item, index }) => renderPartnerAdminCard(item, index)).join('')}
        </div>
      </div>
    `);
  });

  return chunks.join('');
}

function renderAdminCardBySource(sourceName, item, index, allItems) {
  if (sourceName === 'media') return renderMediaAdminCard(item);
  if (sourceName === 'albums') return renderAlbumAdminCard(item, index);
  if (sourceName === 'matches' || sourceName === 'archive_matches') return renderMatchAdminCard(item, index, allItems);
  if (sourceName === 'tournaments' || sourceName === 'archive_tournaments') return renderTournamentAdminCard(item, index, sourceName);
  if (sourceName === 'standings') return renderStandingAdminCard(item, index, 'standings');
  if (sourceName === 'archive_standings') return renderStandingAdminCard(item, index, 'archive_standings');
  if (sourceName === 'playoff') return renderPlayoffAdminCard(item, index);
  if (sourceName === 'clubs') return renderClubAdminCard(item, index);
  if (sourceName === 'news') return renderNewsAdminCard(item, index);
  if (sourceName === 'partners' || sourceName === 'partners_media') return renderPartnerAdminCard(item, index);

  const source = ADMIN_SOURCES[sourceName];
  return `
    <div class="admin-item-card">
      <div class="admin-item-head">
        <strong>${source.title} #${index + 1}</strong>
        <button type="button" class="admin-item-remove" data-remove="${index}">Удалить</button>
      </div>
      <div class="admin-form-grid">
        ${source.fields.map(field => makeField(field, item[field[0]], index)).join('')}
      </div>
    </div>
  `;
}

function makeField(field, value, itemIndex) {
  const [key, label, type, options] = field;
  if (type === 'textarea') {
    return `
      <div class="admin-field" style="grid-column:1/-1">
        <label>${label}</label>
        <textarea data-key="${key}" data-index="${itemIndex}">${value ?? ''}</textarea>
      </div>`;
  }
  if (type === 'select') {
    return `
      <div class="admin-field">
        <label>${label}</label>
        <select data-key="${key}" data-index="${itemIndex}">
          ${(options || []).map(opt => `<option value="${opt}" ${String(value) === String(opt) ? 'selected' : ''}>${opt}</option>`).join('')}
        </select>
      </div>`;
  }
  if (type === 'checkbox') {
    return `
      <div class="admin-field">
        <label>${label}</label>
        <select data-key="${key}" data-index="${itemIndex}">
          <option value="true" ${value === true || value === 'true' ? 'selected' : ''}>Да</option>
          <option value="false" ${value === false || value === 'false' ? 'selected' : ''}>Нет</option>
        </select>
      </div>`;
  }
  if (type === 'logo') return makeLogoPicker(value, key, itemIndex);
  if (type === 'image') return makeImageField(value, key, itemIndex);
  if (type === 'score') {
    const safe = (value || '0:0').split(':');
    const left = safe[0] ?? '0';
    const right = safe[1] ?? '0';
    return `
      <div class="admin-field">
        <label>${label}</label>
        <div class="admin-score-wrap">
          <input type="number" min="0" step="1" value="${left}" data-key="${key}" data-score-part="left" data-index="${itemIndex}">
          <span class="admin-score-sep">:</span>
          <input type="number" min="0" step="1" value="${right}" data-key="${key}" data-score-part="right" data-index="${itemIndex}">
        </div>
      </div>`;
  }
  const inputType = type === 'number' ? 'number' : type;
  return `
    <div class="admin-field">
      <label>${label}</label>
      <input type="${inputType}" value="${value ?? ''}" data-key="${key}" data-index="${itemIndex}">
    </div>`;
}

function readFormData(sourceName) {
  const source = ADMIN_SOURCES[sourceName];
  const baseItems = renderedDataCache[sourceName] || [];
  const items = [];
  const cards = document.querySelectorAll('.admin-item-card');
  cards.forEach((card, visualIndex) => {
    const sourceIndex = Number(card.dataset.itemIndex ?? visualIndex);
    const item = structuredClone(baseItems[sourceIndex] || {});
    source.fields.forEach(([key, , type]) => {
      if (type === 'score') {
        const leftEl = card.querySelector(`[data-key="${key}"][data-score-part="left"][data-index="${sourceIndex}"]`);
        const rightEl = card.querySelector(`[data-key="${key}"][data-score-part="right"][data-index="${sourceIndex}"]`);
        item[key] = `${leftEl ? leftEl.value || '0' : '0'}:${rightEl ? rightEl.value || '0' : '0'}`;
        return;
      }
      const el = card.querySelector(`[data-key="${key}"][data-index="${sourceIndex}"]`);
      if (!el) return;
      let value = el.value;
      if (type === 'number') value = value === '' ? '' : Number(value);
      if (type === 'checkbox') value = value === 'true';
      item[key] = value;
    });

    if (sourceName === 'albums') {
      const photoIndexes = Array.from(new Set(
        Array.from(card.querySelectorAll('[data-photo-index]'))
          .map(node => Number(node.dataset.photoIndex))
          .filter(index => Number.isFinite(index))
      )).sort((left, right) => left - right);

      item.photos = photoIndexes.map(photoIndex => {
        const photoBase = structuredClone((Array.isArray(item.photos) ? item.photos[photoIndex] : null) || {});
        ['image_url', 'alt_text', 'sort_order'].forEach((key) => {
          const field = card.querySelector(`[data-photo-key="${key}"][data-index="${sourceIndex}"][data-photo-index="${photoIndex}"]`);
          if (!field) return;
          let value = field.value;
          if (key === 'sort_order') value = value === '' ? photoIndex + 1 : Number(value);
          photoBase[key] = value;
        });
        return photoBase;
      }).filter(photo => String(photo.image_url || '').trim());
    }

    items[sourceIndex] = item;
  });
  return items.filter(Boolean);
}

function renderForm(sourceName, data) {
  const source = ADMIN_SOURCES[sourceName];
  const wrap = document.getElementById('admin-form-wrap');
  setRenderedData(sourceName, data);
  wrap.innerHTML = `
    ${sourceName === 'media'
      ? `<div class="admin-form-list">${renderMediaAdminCard(data[0] || source.empty())}</div>`
      : sourceName === 'partners' || sourceName === 'partners_media'
      ? renderPartnerSourceCards(sourceName, data)
      : `<div class="admin-form-list">${data.map((item, index) => renderAdminCardBySource(sourceName, item, index, data)).join('')}</div>`
    }
    <div class="admin-toolbar"${sourceName === 'media' ? ' hidden' : ''}>
      ${(sourceName === 'partners' || sourceName === 'partners_media')
        ? (
          sourceName === 'partners'
            ? `<button type="button" class="admin-add" id="admin-add-general-partner">+ Добавить партнёра</button>`
            : `<button type="button" class="admin-add" id="admin-add-media-partner">+ Добавить информационного партнёра</button>`
        )
        : `<button type="button" class="admin-add" id="admin-add-item">+ Добавить запись</button>`
      }
    </div>
  `;

  wrap.querySelectorAll('[data-remove]').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = Number(btn.dataset.remove);
      const next = readFormData(sourceName);
      next.splice(idx, 1);
      setSourceData(sourceName, next);
      adminShowSource(sourceName, { preferLocal: true });
      setStatus('Запись удалена из черновика. Нажми «Сохранить», чтобы отправить в API.');
    });
  });

  const addDraftItem = (overrides = {}, message = 'Новая запись добавлена в черновик. Нажми «Сохранить», чтобы отправить в API.') => {
    const next = readFormData(sourceName);
    next.push({
      ...source.empty(),
      ...overrides
    });
    setSourceData(sourceName, next);
    adminShowSource(sourceName, { preferLocal: true });
    setStatus(message);
  };

  const addBtn = document.getElementById('admin-add-item');
  if (addBtn) {
    addBtn.addEventListener('click', () => {
      if (sourceName === 'albums') {
        addDraftItem(
          { sort_order: readFormData(sourceName).length + 1 },
          'Новый фотоальбом добавлен в черновик. Нажми «Сохранить», чтобы отправить его в API.'
        );
        return;
      }
      addDraftItem();
    });
  }

  const addGeneralPartnerBtn = document.getElementById('admin-add-general-partner');
  if (addGeneralPartnerBtn) {
    addGeneralPartnerBtn.addEventListener('click', () => {
      addDraftItem(
        { category: 'general', sort_order: readFormData(sourceName).filter(item => String(item.category || 'general') === 'general').length + 1 },
        'Новый партнёр добавлен в блок «Партнёры». Нажми «Сохранить», чтобы отправить в API.'
      );
    });
  }

  const addMediaPartnerBtn = document.getElementById('admin-add-media-partner');
  if (addMediaPartnerBtn) {
    addMediaPartnerBtn.addEventListener('click', () => {
      addDraftItem(
        { category: 'media', sort_order: readFormData(sourceName).filter(item => String(item.category || 'general') === 'media').length + 1 },
        'Новый партнёр добавлен в блок «Информационные партнёры». Нажми «Сохранить», чтобы отправить в API.'
      );
    });
  }

  wrap.querySelectorAll('[data-add-album-photo]').forEach(btn => {
    btn.addEventListener('click', () => {
      const index = Number(btn.dataset.addAlbumPhoto);
      const next = readFormData(sourceName);
      if (!next[index]) return;
      const currentPhotos = Array.isArray(next[index].photos) ? next[index].photos : [];
      next[index].photos = [
        ...currentPhotos,
        {
          image_url: '',
          alt_text: '',
          sort_order: currentPhotos.length + 1
        }
      ];
      setSourceData(sourceName, next);
      renderForm(sourceName, next);
      setStatus('Фото добавлено в черновик альбома. Нажми «Сохранить», чтобы отправить изменения в API.');
    });
  });

  wrap.querySelectorAll('[data-upload-album-batch]').forEach(input => {
    input.addEventListener('change', async event => {
      const files = Array.from(event.target.files || []);
      if (!files.length) return;

      const index = Number(event.target.dataset.uploadAlbumBatch);
      const next = readFormData(sourceName);
      const album = next[index];
      if (!album) {
        event.target.value = '';
        return;
      }

      const currentPhotos = Array.isArray(album.photos) ? album.photos : [];
      const appendedPhotos = [];

      setStatus(`Загружаю ${files.length} фото в альбом...`);

      for (let fileIndex = 0; fileIndex < files.length; fileIndex += 1) {
        const file = files[fileIndex];
        let url = '';

        try {
          const result = await uploadAdminImage({ file, sourceName, key: 'album-photo' });
          url = String(result?.url || '').trim();
        } catch (error) {
          try {
            url = await readFileAsDataUrl(file);
            setStatus(`Storage недоступен для части файлов. Использую fallback base64 (${fileIndex + 1}/${files.length})...`);
          } catch (readError) {
            continue;
          }
        }

        if (!url) continue;

        appendedPhotos.push({
          image_url: url,
          alt_text: String(file.name || '').replace(/\.[^.]+$/, '').trim(),
          sort_order: currentPhotos.length + appendedPhotos.length + 1
        });
      }

      if (!appendedPhotos.length) {
        setStatus('Не удалось добавить фотографии в альбом.');
        showAdminToast('Не удалось загрузить фотографии.', 'error');
        event.target.value = '';
        return;
      }

      album.photos = [...currentPhotos, ...appendedPhotos];
      setSourceData(sourceName, next);
      renderForm(sourceName, next);
      setStatus(`Добавлено фото: ${appendedPhotos.length}. Нажми «Сохранить», чтобы отправить изменения в API.`);
      showAdminToast(`В альбом добавлено ${appendedPhotos.length} фото.`, 'success');
      event.target.value = '';
    });
  });

  wrap.querySelectorAll('[data-remove-album-photo]').forEach(btn => {
    btn.addEventListener('click', () => {
      const index = Number(btn.dataset.index);
      const photoIndex = Number(btn.dataset.removeAlbumPhoto);
      const next = readFormData(sourceName);
      if (!next[index]) return;
      const currentPhotos = Array.isArray(next[index].photos) ? next[index].photos : [];
      next[index].photos = currentPhotos
        .filter((_, currentIndex) => currentIndex !== photoIndex)
        .map((photo, currentIndex) => ({
          ...photo,
          sort_order: currentIndex + 1
        }));
      setSourceData(sourceName, next);
      renderForm(sourceName, next);
      setStatus('Фото удалено из черновика альбома. Нажми «Сохранить», чтобы отправить изменения в API.');
    });
  });

  wrap.querySelectorAll('[data-pick-logo]').forEach(btn => {
    btn.addEventListener('click', () => {
      const key = btn.dataset.pickLogo;
      const index = btn.dataset.index;
      const value = btn.dataset.value;
      const input = wrap.querySelector(`[data-key="${key}"][data-index="${index}"]`);
      if (input) input.value = value;
      wrap.querySelectorAll(`[data-pick-logo="${key}"][data-index="${index}"]`).forEach(x => x.classList.remove('active'));
      btn.classList.add('active');
      setStatus('Логотип выбран. Нажми «Сохранить», чтобы отправить изменения в API.');
    });
  });

  wrap.querySelectorAll('[data-upload-image]').forEach(input => {
    input.addEventListener('change', e => {
      const file = e.target.files?.[0];
      if (!file) return;
      const key = e.target.dataset.uploadImage;
      const index = e.target.dataset.index;
      const photoIndex = e.target.dataset.photoIndex;
      const isPhotoField = photoIndex !== undefined && photoIndex !== '';
      const textInput = isPhotoField
        ? wrap.querySelector(`[data-photo-key="${key}"][data-index="${index}"][data-photo-index="${photoIndex}"]`)
        : wrap.querySelector(`[data-key="${key}"][data-index="${index}"]`);
      const previewBox = textInput?.parentElement.querySelector('.admin-preview-box');

      setStatus('Загружаю изображение в storage...');

      uploadAdminImage({ file, sourceName, key })
        .then(result => {
          if (textInput) {
            textInput.value = result.url;
          }
          if (previewBox) {
            previewBox.innerHTML = `<img src="${result.url}" alt="preview">`;
          }
          if (sourceName === 'partners' && key === 'logo_url') {
            updateRenderedItem(sourceName, Number(index), item => {
              item.logo_url = result.url;
              item.logo_storage_provider = result.storage_provider || '';
              item.logo_public_id = result.public_id || '';
              item.logo_file_name = result.file_name || '';
              item.logo_mime_type = result.mime_type || '';
              item.logo_format = result.format || '';
              item.logo_width = result.width ?? null;
              item.logo_height = result.height ?? null;
              item.logo_bytes = result.bytes ?? null;
            });
          }
          if (sourceName === 'albums' && isPhotoField) {
            const next = readFormData(sourceName);
            const album = next[Number(index)];
            const photo = album?.photos?.[Number(photoIndex)];
            if (photo) {
              photo.image_url = result.url;
              if (!photo.alt_text) photo.alt_text = file.name || album.title || '';
            }
            setSourceData(sourceName, next);
          }
          setStatus('Изображение загружено в storage. Нажми «Сохранить», чтобы записать URL в базу.');
        })
        .catch(async error => {
          readFileAsDataUrl(file)
            .then(result => {
            if (textInput) {
              textInput.value = result;
            }
            if (previewBox) {
              previewBox.innerHTML = `<img src="${result}" alt="preview">`;
            }
            if (sourceName === 'partners' && key === 'logo_url') {
              updateRenderedItem(sourceName, Number(index), item => {
                item.logo_url = String(result || '');
                item.logo_storage_provider = 'inline';
                item.logo_public_id = '';
                item.logo_file_name = file.name || '';
                item.logo_mime_type = file.type || '';
                item.logo_format = '';
                item.logo_width = null;
                item.logo_height = null;
                item.logo_bytes = file.size || null;
              });
            }
            if (sourceName === 'albums' && isPhotoField) {
              const next = readFormData(sourceName);
              const album = next[Number(index)];
              const photo = album?.photos?.[Number(photoIndex)];
              if (photo) {
                photo.image_url = String(result || '');
                if (!photo.alt_text) photo.alt_text = file.name || album.title || '';
              }
              setSourceData(sourceName, next);
            }
            setStatus(`Storage недоступен: ${error.message}. В форму подставлен base64 как временный fallback.`);
          })
            .catch(() => {
              setStatus(`Не удалось загрузить изображение: ${error.message}`);
              showAdminToast('Не удалось прочитать изображение.', 'error');
            });
        })
        .finally(() => {
          e.target.value = '';
        });
    });
  });

  wrap.querySelectorAll('.admin-image-input').forEach(input => {
    input.addEventListener('input', () => {
      const preview = input.parentElement.querySelector('.admin-preview-box');
      if (!preview) return;
      const value = input.value.trim();
      preview.innerHTML = value ? `<img src="${value}" alt="preview">` : '<div>Превью появится здесь</div>';
    });
  });

  wrap.querySelectorAll('[data-club-select]').forEach(select => {
    select.addEventListener('change', () => {
      const side = String(select.dataset.clubSelect || '').trim();
      const index = Number(select.dataset.index);
      const selectedSlug = String(select.value || '').trim();
      const club = getAdminClubsCatalog().find(item => String(item.slug || '') === selectedSlug) || null;
      const next = readFormData(sourceName);
      const target = next[index];
      if (!target || !side) return;

      const prefix = side === 'home' ? 'home' : 'away';
      target[`${prefix}_team`] = club?.name || '';
      target[`${prefix}_team_slug`] = club?.slug || '';
      target[`${prefix}_logo`] = club?.logo || '';

      setSourceData(sourceName, next);
      renderForm(sourceName, next);
      setStatus(club
        ? `Команда «${club.name}» подставлена. Нажми «Сохранить», чтобы записать изменения в API.`
        : 'Выбор команды очищен. Нажми «Сохранить», чтобы записать изменения в API.'
      );
    });
  });

  wrap.querySelectorAll('[data-standing-club-select]').forEach(select => {
    select.addEventListener('change', () => {
      const index = Number(select.dataset.index);
      const selectedSlug = String(select.value || '').trim();
      const club = getAdminClubsCatalog().find(item => String(item.slug || '') === selectedSlug) || null;
      const next = readFormData(sourceName);
      const target = next[index];
      if (!target) return;

      target.team = club?.name || '';
      target.team_slug = club?.slug || '';
      target.logo = club?.logo || '';

      setSourceData(sourceName, next);
      renderForm(sourceName, next);
      setStatus(club
        ? `Команда «${club.name}» подставлена в турнирную таблицу. Нажми «Сохранить», чтобы записать изменения в API.`
        : 'Выбор команды очищен. Нажми «Сохранить», чтобы записать изменения в API.'
      );
    });
  });

  if (sourceName === 'matches' || sourceName === 'archive_matches') {
    wrap.querySelectorAll('[data-key="status"]').forEach(select => {
      select.addEventListener('change', () => {
        const index = Number(select.dataset.index);
        const statusLabelInput = wrap.querySelector(`[data-key="status_label"][data-index="${index}"]`);
        const nextLabel = getAdminMatchStatusLabel(select.value);
        if (statusLabelInput) {
          statusLabelInput.value = nextLabel;
        }

        const next = normalizeSourceData(sourceName, readFormData(sourceName));
        setSourceData(sourceName, next);
        if (sourceName === currentSource) {
          setRenderedData(sourceName, next);
        }

        setStatus(`Статус матча обновлён на «${nextLabel || 'без подписи'}». Нажми «Сохранить», чтобы отправить изменения в API.`);
      });
    });
  }

  if (sourceName === 'media') {
    wrap.querySelectorAll('[data-key="featured_match_id"]').forEach(select => {
      select.addEventListener('change', () => {
        const next = normalizeSourceData(sourceName, readFormData(sourceName));
        setSourceData(sourceName, next);
        renderForm(sourceName, next);
        setStatus('Главный эфир обновлён в черновике. Нажми «Сохранить», чтобы отправить изменения в API.');
      });
    });
  }

  if (sourceName === 'matches' || sourceName === 'archive_matches') {
    refreshAdminMatchPreviews(wrap, sourceName);
    if (wrap.dataset.matchPreviewBound !== 'true') {
      const syncPreviews = () => {
        if (currentSource === 'matches' || currentSource === 'archive_matches') refreshAdminMatchPreviews(wrap, currentSource);
      };
      wrap.addEventListener('input', syncPreviews);
      wrap.addEventListener('change', syncPreviews);
      wrap.dataset.matchPreviewBound = 'true';
    }
  }
}

async function loadSourceData(sourceName, options = {}) {
  const { preferLocal = false, forceRemote = false } = options;
  if (!forceRemote && preferLocal) {
    const local = getSourceData(sourceName);
    if (local) return local;
  }

  if (!forceRemote) {
    try {
      const remote = await fetchAdminSource(sourceName);
      if (sourceName === 'albums' && Array.isArray(remote) && !remote.length) {
        const fallback = cloneDefaultData(sourceName);
        defaultsCache[sourceName] = structuredClone(fallback);
        setSourceData(sourceName, fallback);
        return fallback;
      }
      defaultsCache[sourceName] = structuredClone(remote);
      setSourceData(sourceName, remote);
      return remote;
    } catch (error) {
      const local = getSourceData(sourceName);
      if (local) return local;
      const fallback = await adminLoadDefault(sourceName);
      return fallback;
    }
  }

  const remote = await fetchAdminSource(sourceName);
  if (sourceName === 'albums' && Array.isArray(remote) && !remote.length) {
    const fallback = cloneDefaultData(sourceName);
    defaultsCache[sourceName] = structuredClone(fallback);
    setSourceData(sourceName, fallback);
    return fallback;
  }
  defaultsCache[sourceName] = structuredClone(remote);
  setSourceData(sourceName, remote);
  return remote;
}

async function adminShowSource(sourceName, options = {}) {
  currentSource = sourceName;
  const source = ADMIN_SOURCES[sourceName];

  document.querySelectorAll('.admin-nav button').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.source === sourceName);
  });

  if ((sourceName === 'matches' || sourceName === 'archive_matches' || sourceName === 'standings' || sourceName === 'archive_standings' || sourceName === 'playoff' || sourceName === 'media') && !defaultsCache.clubs) {
    try {
      const clubs = await loadSourceData('clubs');
      defaultsCache.clubs = structuredClone(clubs);
    } catch (error) {
      defaultsCache.clubs = cloneDefaultData('clubs');
    }
  }

  if (sourceName === 'media' && !defaultsCache.matches) {
    try {
      const matches = await loadSourceData('matches');
      defaultsCache.matches = structuredClone(matches);
    } catch (error) {
      defaultsCache.matches = cloneDefaultData('matches');
    }
  }

  const data = normalizeSourceData(sourceName, await loadSourceData(sourceName, options));

  document.getElementById('admin-title').textContent = source.title;
  const textarea = document.getElementById('admin-textarea');
  if (textarea) textarea.value = JSON.stringify(data, null, 2);
  renderForm(sourceName, data);
  setStatus(options.forceRemote ? 'Данные обновлены.' : 'Раздел загружен.');
}

async function adminSave() {
  try {
    const parsed = normalizeSourceData(currentSource, readFormData(currentSource));
    const textarea = document.getElementById('admin-textarea');
    if (textarea) textarea.value = JSON.stringify(parsed, null, 2);

    setSourceData(currentSource, parsed);
    setStatus('Сохраняю изменения...');

    const result = await pushAdminSource(currentSource, parsed);
    const synced = normalizeSourceData(currentSource, result.data || parsed);
    defaultsCache[currentSource] = structuredClone(synced);
    setSourceData(currentSource, synced);
    if (textarea) textarea.value = JSON.stringify(synced, null, 2);
    renderForm(currentSource, synced);
    setStatus(`Изменения сохранены. Записей: ${result.count ?? synced.length}.`);
    showAdminToast('Изменения успешно сохранены.', 'success');
  } catch (error) {
    setStatus('Ошибка сохранения: ' + error.message);
    showAdminToast('Не удалось сохранить изменения.', 'error');
  }
}

async function adminReset() {
  localStorage.removeItem(ADMIN_SOURCES[currentSource].key);
  try {
    const data = await loadSourceData(currentSource, { forceRemote: true });
    const textarea = document.getElementById('admin-textarea');
    if (textarea) textarea.value = JSON.stringify(data, null, 2);
    renderForm(currentSource, data);
    setStatus('Черновик очищен. Данные загружены заново.');
  } catch (error) {
    const fallback = cloneDefaultData(currentSource);
    const textarea = document.getElementById('admin-textarea');
    if (textarea) textarea.value = JSON.stringify(fallback, null, 2);
    renderForm(currentSource, fallback);
    setStatus('Не получилось загрузить данные. Показаны стартовые значения: ' + error.message);
  }
}

function adminExport() {
  try {
    const text = JSON.stringify(readFormData(currentSource), null, 2);
    const textarea = document.getElementById('admin-textarea');
    if (textarea) textarea.value = text;
    const source = ADMIN_SOURCES[currentSource];
    const blob = new Blob([text], { type: 'application/json;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = source.exportName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setStatus('JSON экспортирован.');
  } catch (error) {
    setStatus('Сначала исправь данные перед экспортом.');
  }
}

async function adminReloadFromApi() {
  try {
    setStatus('Обновляю данные...');
    await adminShowSource(currentSource, { forceRemote: true });
  } catch (error) {
    setStatus('Ошибка загрузки из API: ' + error.message);
  }
}

let adminNavInitialized = false;

function initAdminNav() {
  const nav = document.getElementById('admin-nav');
  if (!nav || adminNavInitialized) return;

  Object.entries(ADMIN_SOURCES).forEach(([name, meta]) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.dataset.source = name;
    btn.textContent = meta.title;
    btn.addEventListener('click', () => adminShowSource(name));
    nav.appendChild(btn);
  });

  adminNavInitialized = true;
}

async function openAdminWorkspace(options = {}) {
  initAdminNav();
  setAdminAuthenticated(true);
  await adminShowSource(currentSource || 'tournaments', options);
}

async function handleAdminLogin(event) {
  event.preventDefault();
  const input = document.getElementById('admin-password');
  const password = String(input?.value || '').trim();

  if (!password) {
    setLoginStatus('Введи пароль.', true);
    return;
  }

  try {
    setLoginStatus('Проверяю пароль...');
    const session = await createAdminSession(password);
    setAdminToken(session.token || '');
    setLoginStatus('');
    if (input) input.value = '';
    await openAdminWorkspace({ forceRemote: true });
  } catch (error) {
    setLoginStatus('Неверный пароль или сервер недоступен.', true);
    setStatus('Ошибка входа: ' + error.message);
  }
}

function handleAdminLogout() {
  setAdminToken('');
  setAdminAuthenticated(false);
  setLoginStatus('Сессия закрыта.');
  setStatus('Вход в админ-панель закрыт.');
}

document.addEventListener('DOMContentLoaded', () => {
  const app = document.getElementById('admin-app');
  if (!app) return;

  document.querySelectorAll('[data-admin-save]').forEach(button => {
    button.addEventListener('click', adminSave);
  });
  document.querySelectorAll('[data-admin-reset]').forEach(button => {
    button.addEventListener('click', adminReset);
  });
  document.getElementById('admin-logout').addEventListener('click', handleAdminLogout);
  document.getElementById('admin-login-form').addEventListener('submit', handleAdminLogin);

  if (getAdminToken()) {
    openAdminWorkspace({ forceRemote: true }).catch((error) => {
      resetAdminSession('Сессия админ-панели завершилась. Войди ещё раз.');
      setStatus('Ошибка загрузки данных: ' + error.message);
    });
  } else {
    setAdminAuthenticated(false);
    setLoginStatus('Введи пароль, чтобы открыть панель.');
    setStatus('Войди в админ-панель, чтобы редактировать данные.');
  }
});
