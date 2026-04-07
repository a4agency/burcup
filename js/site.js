document.documentElement.classList.add('has-js');

function autoFitTeamNames(selector = '.team-name', maxSize = 22, minSize = 12) {
  document.querySelectorAll(selector).forEach(el => {
    const mobile = window.innerWidth <= 640;
    const tablet = window.innerWidth <= 900;
    let size = mobile ? 16 : (tablet ? 18 : maxSize);
    el.style.fontSize = size + 'px';
    el.style.whiteSpace = 'nowrap';
    while ((el.scrollWidth > el.clientWidth) && size > minSize) {
      size -= 0.5;
      el.style.fontSize = size + 'px';
    }
  });
}

function initHeaderMenu() {
  const header = document.querySelector('.header');
  const toggle = document.querySelector('.header-toggle');
  const menu = document.querySelector('.header-menu');
  const mobileBreakpoint = 900;

  if (!header || !toggle || !menu) return;

  let backdrop = document.querySelector('.header-backdrop');
  if (!backdrop) {
    backdrop = document.createElement('button');
    backdrop.type = 'button';
    backdrop.className = 'header-backdrop';
    backdrop.setAttribute('aria-label', 'Закрыть меню');
    backdrop.setAttribute('aria-hidden', 'true');
    document.body.appendChild(backdrop);
  }

  function syncMenu(isOpen) {
    const shouldOpen = isOpen && window.innerWidth <= mobileBreakpoint;

    header.classList.toggle('is-menu-open', shouldOpen);
    menu.classList.toggle('is-open', shouldOpen);
    toggle.setAttribute('aria-expanded', shouldOpen ? 'true' : 'false');
    toggle.setAttribute('aria-label', shouldOpen ? 'Закрыть меню' : 'Открыть меню');
    menu.setAttribute('aria-hidden', shouldOpen ? 'false' : 'true');
    backdrop.classList.toggle('is-visible', shouldOpen);
    backdrop.setAttribute('aria-hidden', shouldOpen ? 'false' : 'true');
    document.body.classList.toggle('menu-open', shouldOpen);
  }

  function closeMenu() {
    syncMenu(false);
  }

  syncMenu(false);

  toggle.addEventListener('click', () => {
    syncMenu(!menu.classList.contains('is-open'));
  });

  backdrop.addEventListener('click', closeMenu);

  menu.addEventListener('click', (event) => {
    if (window.innerWidth > mobileBreakpoint) return;
    if (event.target.closest('a, .lang-btn')) closeMenu();
  });

  document.addEventListener('click', (event) => {
    if (window.innerWidth > mobileBreakpoint) return;
    if (!menu.classList.contains('is-open')) return;
    if (!header.contains(event.target)) closeMenu();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeMenu();
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > mobileBreakpoint) closeMenu();
  });
}

function initActiveHeaderLink() {
  const links = Array.from(document.querySelectorAll('.header-menu a[href]'));
  if (!links.length) return;

  const currentFile = window.location.pathname.split('/').pop() || 'index.html';

  links.forEach((link) => {
    const linkFile = (link.getAttribute('href') || '').split('/').pop();
    const isActive = linkFile === currentFile;
    link.classList.toggle('is-active', isActive);
    if (isActive) {
      link.setAttribute('aria-current', 'page');
    } else {
      link.removeAttribute('aria-current');
    }
  });
}

async function initTournamentCountdown() {
  const root = document.querySelector('[data-countdown-target]');
  if (!root) return;
  const section = root.closest('.countdown-section');
  const tournaments = await fetchApi('/api/tournaments');
  const featuredTournament = Array.isArray(tournaments)
    ? tournaments.find(item => item && item.is_featured) || null
    : null;

  if (featuredTournament && featuredTournament.countdown_enabled === false) {
    if (section) section.hidden = true;
    return;
  }

  if (section) section.hidden = false;

  const targetTimestamp = Date.parse(root.getAttribute('data-countdown-target') || '');
  if (!Number.isFinite(targetTimestamp)) return;

  const daysNode = root.querySelector('[data-countdown-unit="days"]');
  const hoursNode = root.querySelector('[data-countdown-unit="hours"]');
  const minutesNode = root.querySelector('[data-countdown-unit="minutes"]');
  const secondsNode = root.querySelector('[data-countdown-unit="seconds"]');
  const formatter = new Intl.NumberFormat('ru-RU', {
    minimumIntegerDigits: 2,
    useGrouping: false
  });
  let timerId = null;
  const segmentMap = {
    '0': ['a', 'b', 'c', 'd', 'e', 'f'],
    '1': ['b', 'c'],
    '2': ['a', 'b', 'd', 'e', 'g'],
    '3': ['a', 'b', 'c', 'd', 'g'],
    '4': ['b', 'c', 'f', 'g'],
    '5': ['a', 'c', 'd', 'f', 'g'],
    '6': ['a', 'c', 'd', 'e', 'f', 'g'],
    '7': ['a', 'b', 'c'],
    '8': ['a', 'b', 'c', 'd', 'e', 'f', 'g'],
    '9': ['a', 'b', 'c', 'd', 'f', 'g']
  };
  const segments = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];

  function renderSegmentDigit(char) {
    const activeSegments = new Set(segmentMap[char] || []);
    return `
      <span class="segment-digit" aria-hidden="true">
        ${segments.map(segment => `
          <span class="segment segment-${segment}${activeSegments.has(segment) ? ' is-on' : ''}"></span>
        `).join('')}
      </span>
    `;
  }

  function setValue(node, value) {
    if (!node) return;
    const displayValue = value > 99 ? String(value) : formatter.format(value);
    node.setAttribute('aria-label', displayValue);
    node.innerHTML = displayValue.split('').map(renderSegmentDigit).join('');
  }

  function renderCountdown() {
    const diffMs = Math.max(0, targetTimestamp - Date.now());
    const totalSeconds = Math.floor(diffMs / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    setValue(daysNode, days);
    setValue(hoursNode, hours);
    setValue(minutesNode, minutes);
    setValue(secondsNode, seconds);

    if (diffMs <= 0) {
      clearInterval(timerId);
    }
  }

  renderCountdown();
  timerId = window.setInterval(renderCountdown, 1000);
}


document.addEventListener('DOMContentLoaded', function(){
  initActiveHeaderLink();
  initHeaderMenu();
  initTournamentCountdown();
  upgradeStaticImagesForCloudinary();
});

document.addEventListener('error', handleCloudinaryImageFallback, true);


async function renderStandings(selector) {
  const target = document.querySelector(selector);
  if (!target) return;
  try {
    const data = await fetchJson('data/standings.json');
    target.innerHTML = renderStandingsTable(data);
  } catch (error) {
    target.innerHTML = '<div class="standings-card"><div style="padding:18px">Не удалось загрузить таблицу.</div></div>';
  }
}

function renderStandingsTable(data = []) {
  const rows = (Array.isArray(data) ? data : []).map((item, index) => {
    const clubUrl = getClubPageUrl(item);
    const teamMarkup = clubUrl
      ? `<a class="standings-team standings-team-link" href="${escapeHtml(clubUrl)}">
          ${renderImageMarkup({ src: item.logo, alt: item.team, width: 96 })}
          <span>${item.team}</span>
        </a>`
      : `<div class="standings-team">
          ${renderImageMarkup({ src: item.logo, alt: item.team, width: 96 })}
          <span>${item.team}</span>
        </div>`;

    return `
      <tr>
        <td class="num">${item.position || index + 1}</td>
        <td>${teamMarkup}</td>
        <td class="num">${item.played}</td>
        <td class="num">${formatStandingStat(item.won)}</td>
        <td class="num">${formatStandingStat(item.drawn)}</td>
        <td class="num">${formatStandingStat(item.lost)}</td>
        <td class="num">${escapeHtml(formatStandingGoals(item))}</td>
        <td class="points">${item.points}</td>
      </tr>
    `;
  }).join('');

  return `
    <div class="standings-card">
      <table class="standings-table">
        <colgroup>
          <col class="col-rank">
          <col class="col-team">
          <col class="col-games">
          <col class="col-wins">
          <col class="col-draws">
          <col class="col-losses">
          <col class="col-goals">
          <col class="col-points">
        </colgroup>
        <thead>
          <tr>
            <th>№</th>
            <th>Команда</th>
            <th>Игр</th>
            <th>Побед</th>
            <th>Ничьих</th>
            <th>Поражений</th>
            <th>Мячей забито - пропущено</th>
            <th>Очки</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  `;
}

document.addEventListener('DOMContentLoaded', () => {
  initResultsUpcomingSlider();
  initHomeUpcomingSlider();
  initHomeTournamentsSlider();
  initHeroCarousel();
  renderStandings('#home-standings');
  renderStandings('#results-standings');
});


function escapeHtml(str) {
  return String(str ?? '').replace(/[&<>"]/g, s => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[s]));
}

const TRANSPARENT_IMAGE_PLACEHOLDER = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==';
const NEWS_IMAGE_FALLBACKS = [
  { id: 1, slug: 'applications-open', src: 'images/news-1.webp' },
  { id: 2, slug: 'first-day-schedule-published', src: 'images/news-2.webp' },
  { id: 3, slug: 'playoff-bracket-coming-soon', src: 'images/news-3.webp' }
];
const CLUB_LOCATION_OVERRIDES = {
  palmeiras: {
    city: 'Сан-Паулу',
    country: 'Бразилия'
  }
};
const HISTORICAL_CLUB_FALLBACKS = {
  villarreal: {
    slug: 'villarreal',
    name: 'Вильярреал',
    logo: 'images/history-villarreal.webp',
    country: 'Испания',
    city: 'Вильярреал',
    description: 'Исторический участник прошлых розыгрышей Кубка Бурчалкина. Архивная страница клуба в рамках истории турнира.',
    matches: []
  },
  mtk: {
    slug: 'mtk',
    name: 'МТК',
    logo: 'images/history-mtk.webp',
    country: 'Венгрия',
    city: 'Будапешт',
    description: 'Исторический участник прошлых розыгрышей Кубка Бурчалкина. Архивная страница клуба в рамках истории турнира.',
    matches: []
  },
  'cruz-azul': {
    slug: 'cruz-azul',
    name: 'Крус Асуль',
    logo: 'images/history-cruz-azul.webp',
    country: 'Мексика',
    city: 'Мехико',
    description: 'Исторический участник прошлых розыгрышей Кубка Бурчалкина. Архивная страница клуба в рамках истории турнира.',
    matches: []
  },
  victoria: {
    slug: 'victoria',
    name: 'Виктория',
    logo: 'images/history-victoria.webp',
    country: 'Португалия',
    city: 'Гимарайнш',
    description: 'Исторический участник прошлых розыгрышей Кубка Бурчалкина. Архивная страница клуба в рамках истории турнира.',
    matches: []
  },
  santos: {
    slug: 'santos',
    name: 'Сантос',
    logo: 'images/history-santos.webp',
    country: 'Бразилия',
    city: 'Сантус',
    description: 'Исторический участник прошлых розыгрышей Кубка Бурчалкина. Архивная страница клуба в рамках истории турнира.',
    matches: []
  },
  atalanta: {
    slug: 'atalanta',
    name: 'Аталанта',
    logo: 'images/history-atalanta.webp',
    country: 'Италия',
    city: 'Бергамо',
    description: 'Исторический участник прошлых розыгрышей Кубка Бурчалкина. Архивная страница клуба в рамках истории турнира.',
    matches: []
  },
  roma: {
    slug: 'roma',
    name: 'Рома',
    logo: 'images/history-roma.webp',
    country: 'Италия',
    city: 'Рим',
    description: 'Исторический участник прошлых розыгрышей Кубка Бурчалкина. Архивная страница клуба в рамках истории турнира.',
    matches: []
  },
  sepahan: {
    slug: 'sepahan',
    name: 'Сепахан',
    logo: 'images/history-sepahan.webp',
    country: 'Иран',
    city: 'Исфахан',
    description: 'Исторический участник прошлых розыгрышей Кубка Бурчалкина. Архивная страница клуба в рамках истории турнира.',
    matches: []
  }
};
const ARCHIVE_TOURNAMENTS = {
  '2025': {
    title: 'Кубок Бурчалкина 2025',
    season: 'Архивный розыгрыш 15 - 17 мая 2025',
    description: 'Позже здесь появятся команды турнира, результаты матчей, сетка, фотографии и архивные материалы розыгрыша 2025 года.',
    status: 'Страница уже готова как архивная точка входа. Материалы можно будет постепенно добавить позже.',
    detail: {
      clubs_count: 6,
      matches_count: 3,
      standings: [
        { position: 1, team: 'Зенит', slug: 'zenit', logo: 'images/team-zenit.webp', city: 'Санкт-Петербург', country: 'Россия', played: 1, won: 1, drawn: 0, lost: 0, goals_for: 3, goals_against: 1, points: 3 },
        { position: 2, team: 'Алмаз-Антей', slug: 'almaz-antey', logo: 'images/team-almaz-antey.webp', city: 'Санкт-Петербург', country: 'Россия', played: 1, won: 1, drawn: 0, lost: 0, goals_for: 2, goals_against: 1, points: 3 },
        { position: 3, team: 'Палмейрас', slug: 'palmeiras', logo: 'images/team-palmeiras.webp', city: 'Сан-Паулу', country: 'Бразилия', played: 1, won: 0, drawn: 1, lost: 0, goals_for: 1, goals_against: 1, points: 1 },
        { position: 4, team: 'Сан-Лоренсо', slug: 'san-lorenzo', logo: 'images/team-san-lorenzo.webp', city: 'Буэнос-Айрес', country: 'Аргентина', played: 1, won: 0, drawn: 1, lost: 0, goals_for: 1, goals_against: 1, points: 1 },
        { position: 5, team: 'Динамо-Минск', slug: 'dinamo-minsk', logo: 'images/team-dinamo-minsk.webp', city: 'Минск', country: 'Беларусь', played: 1, won: 0, drawn: 0, lost: 1, goals_for: 1, goals_against: 2, points: 0 },
        { position: 6, team: 'Кайрат', slug: 'kairat', logo: 'images/team-kairat.webp', city: 'Алматы', country: 'Казахстан', played: 1, won: 0, drawn: 0, lost: 1, goals_for: 1, goals_against: 3, points: 0 }
      ],
      matches: [
        {
          id: 'archive-2025-1',
          date: '2025-05-15',
          time: '10:00',
          status_label: 'Завершён',
          score: '2:1',
          group: 'Группа A',
          home_team: 'Алмаз-Антей',
          home_team_slug: 'almaz-antey',
          home_logo: 'images/team-almaz-antey.webp',
          away_team: 'Динамо-Минск',
          away_team_slug: 'dinamo-minsk',
          away_logo: 'images/team-dinamo-minsk.webp'
        },
        {
          id: 'archive-2025-2',
          date: '2025-05-15',
          time: '12:00',
          status_label: 'Завершён',
          score: '3:1',
          group: 'Группа A',
          home_team: 'Зенит',
          home_team_slug: 'zenit',
          home_logo: 'images/team-zenit.webp',
          away_team: 'Кайрат',
          away_team_slug: 'kairat',
          away_logo: 'images/team-kairat.webp'
        },
        {
          id: 'archive-2025-3',
          date: '2025-05-15',
          time: '14:00',
          status_label: 'Завершён',
          score: '1:1',
          group: 'Группа B',
          home_team: 'Палмейрас',
          home_team_slug: 'palmeiras',
          home_logo: 'images/team-palmeiras.webp',
          away_team: 'Сан-Лоренсо',
          away_team_slug: 'san-lorenzo',
          away_logo: 'images/team-san-lorenzo.webp'
        }
      ],
      partners: [
        {
          slug: 'general',
          items: [
            { name: 'Система спортивной аналитики B-SIGHT', logo_url: 'images/logo-burchalkin.webp', website_url: '' },
            { name: 'Банк ВТБ', logo_url: 'images/logo-burchalkin.webp', website_url: '' }
          ]
        }
      ]
    }
  },
  '2024': {
    title: 'Кубок Бурчалкина 2024',
    season: 'Архивный розыгрыш сезона 2024',
    description: 'Это страница-заглушка под архив 2024 года. Позже здесь можно будет собрать участников, расписание, итоги и медиаматериалы.',
    status: 'Архив ещё не заполнен, но страница уже подключена и доступна по ссылке.'
  },
  '2023': {
    title: 'Кубок Бурчалкина 2023',
    season: 'Архивный розыгрыш сезона 2023',
    description: 'На этой странице позже появится информация о розыгрыше 2023 года: команды, результаты, фотографии и памятные материалы.',
    status: 'Пока это заглушка для будущего наполнения через админ-панель.'
  },
  '2019': {
    title: 'Кубок Бурчалкина 2019',
    season: 'Архивный розыгрыш сезона 2019',
    description: 'Страница подготовлена как архив для одного из ранних розыгрышей турнира. Здесь можно будет собрать историю турнира по годам.',
    status: 'Страница архива уже работает, содержимое добавим позже.'
  },
  '2018': {
    title: 'Кубок Бурчалкина 2018',
    season: 'Архивный розыгрыш сезона 2018',
    description: 'Заглушка для архивной страницы 2018 года. Позже здесь появятся команды, результаты и исторические материалы турнира.',
    status: 'Архив 2018 года пока находится в подготовке.'
  }
};
const ARCHIVE_TOURNAMENT_SLUG_BY_YEAR = {
  '2025': 'burchalkin-cup-2025',
  '2024': 'burchalkin-cup-2024',
  '2023': 'burchalkin-cup-2023',
  '2019': 'burchalkin-cup-2019',
  '2018': 'burchalkin-cup-2018'
};

function pluralizeRu(count, forms) {
  const value = Math.abs(Number(count) || 0);
  const mod10 = value % 10;
  const mod100 = value % 100;

  if (mod100 >= 11 && mod100 <= 19) return forms[2];
  if (mod10 === 1) return forms[0];
  if (mod10 >= 2 && mod10 <= 4) return forms[1];
  return forms[2];
}

function formatCountLabel(count, forms) {
  const value = Number(count) || 0;
  return `${value} ${pluralizeRu(value, forms)}`;
}

function joinNonEmpty(parts, separator = ' • ') {
  return parts.map(item => String(item || '').trim()).filter(Boolean).join(separator);
}

function formatTournamentStatus(status) {
  const normalized = String(status || '').trim().toLowerCase();
  const labels = {
    draft: 'Черновик',
    upcoming: 'Скоро',
    active: 'Идёт',
    completed: 'Завершён',
    archived: 'Архив',
  };

  return labels[normalized] || status || '';
}

const API_ENDPOINTS = {
  'data/standings.json': '/api/standings',
  'data/matches.json': '/api/matches',
  'data/news.json': '/api/news',
  'data/results.json': '/api/results',
};

function getApiBaseUrl() {
  const runtimeValue = window.BCUP_CONFIG?.apiBaseUrl;
  const localValue = localStorage.getItem('bcup_api_base_url');
  const baseUrl = (runtimeValue || localValue || '').trim();
  return baseUrl.replace(/\/+$/, '');
}

function getCloudinaryAssetMap() {
  return window.BCUP_CONFIG?.cloudinaryAssetMap || {};
}

function getClubPageUrl(item) {
  const explicitSlug = String(item?.slug || item?.team_slug || '').trim();
  if (explicitSlug) {
    return `club.html?slug=${encodeURIComponent(explicitSlug)}`;
  }

  const logoPath = String(item?.logo || '').trim();
  const logoSlugMatch = logoPath.match(/team-([a-z0-9-]+)\.(?:png|jpe?g|webp|svg)$/i);
  if (logoSlugMatch?.[1]) {
    return `club.html?slug=${encodeURIComponent(logoSlugMatch[1].toLowerCase())}`;
  }

  return '';
}

function getHistoricalClubFallback(slug) {
  return HISTORICAL_CLUB_FALLBACKS[String(slug || '').trim()] || null;
}

function hasExpandedStandingsFields(data) {
  return Array.isArray(data) && data.every(item =>
    item
    && Object.prototype.hasOwnProperty.call(item, 'won')
    && Object.prototype.hasOwnProperty.call(item, 'drawn')
    && Object.prototype.hasOwnProperty.call(item, 'lost')
  );
}

function formatStandingStat(value) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? String(numeric) : '—';
}

function formatStandingGoals(item = {}) {
  const goalsLabel = String(item.goals || '').trim();
  if (goalsLabel) return goalsLabel;

  const goalsFor = Number(item.goals_for);
  const goalsAgainst = Number(item.goals_against);
  if (Number.isFinite(goalsFor) && Number.isFinite(goalsAgainst)) {
    return `${goalsFor}-${goalsAgainst}`;
  }

  return '—';
}

function getClubLocationParts(item = {}) {
  const slug = String(item?.slug || item?.team_slug || '').trim();
  const override = CLUB_LOCATION_OVERRIDES[slug] || getHistoricalClubFallback(slug) || {};
  return {
    city: String(item?.city || override.city || '').trim(),
    country: String(item?.country || override.country || '').trim()
  };
}

function formatClubLocation(item = {}) {
  const { city, country } = getClubLocationParts(item);
  return joinNonEmpty([city, country], ', ');
}

function formatMatchVenue(item = {}) {
  return 'Стадион "Алмаз-Антей"';
}

function formatMatchDisplayDate(value) {
  const raw = String(value || '').trim();
  if (!raw) return '';

  const parsed = new Date(`${raw}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return raw;

  return new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'long'
  }).format(parsed);
}

function formatTournamentDisplayDate(value) {
  const raw = String(value || '').trim();
  if (!raw) return '';

  const parsed = new Date(`${raw}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return raw;

  return new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(parsed);
}

function formatTournamentDateRange(startDate, endDate) {
  const startLabel = formatTournamentDisplayDate(startDate);
  const endLabel = formatTournamentDisplayDate(endDate);
  return joinNonEmpty([startLabel, endLabel], ' - ');
}

function formatMatchCardDateTime(item = {}) {
  return joinNonEmpty([formatMatchDisplayDate(item.date), String(item.time || '').trim()], ' • ');
}

function getArchiveTournamentData(year) {
  const normalizedYear = String(year || '').trim();
  return ARCHIVE_TOURNAMENTS[normalizedYear] || {
    title: `Кубок Бурчалкина ${normalizedYear || 'Архив'}`,
    season: normalizedYear ? `Архивный розыгрыш сезона ${normalizedYear}` : 'Архивный розыгрыш турнира',
    description: 'На этой странице позже появятся команды, результаты, фотографии и материалы архивного розыгрыша.',
    status: 'Страница-заглушка уже создана и готова для будущего наполнения.'
  };
}

function getArchiveTournamentSlug(year) {
  return ARCHIVE_TOURNAMENT_SLUG_BY_YEAR[String(year || '').trim()] || '';
}

function buildArchiveTournamentEntries() {
  return Object.entries(ARCHIVE_TOURNAMENTS)
    .sort((left, right) => Number(right[0]) - Number(left[0]))
    .map(([year, item]) => {
      const matchDates = (Array.isArray(item.detail?.matches) ? item.detail.matches : [])
        .map(match => String(match?.date || '').trim())
        .filter(Boolean)
        .sort();
      const derivedStartDate = matchDates[0] || '';
      const derivedEndDate = matchDates[matchDates.length - 1] || '';

      return {
        slug: getArchiveTournamentSlug(year),
        season_year: Number(year),
        status: year === '2025' ? 'completed' : 'archived',
        name: item.title,
        description: item.description,
        start_date: derivedStartDate,
        end_date: derivedEndDate,
        clubs_count: Number(item.detail?.clubs_count || 0),
        matches_count: Number(item.detail?.matches_count || 0),
        is_archive: true
      };
    });
}

function getArchiveTournamentClubs(detail = {}) {
  const standings = Array.isArray(detail.standings) ? detail.standings : [];
  if (standings.length) {
    return standings
      .map(item => ({
        slug: item.slug || item.team_slug || '',
        name: item.team || item.name || '',
        logo: item.logo || '',
        city: item.city || '',
        country: item.country || '',
        position: Number(item.position || 0) || ''
      }))
      .filter(item => item.name);
  }

  const matches = Array.isArray(detail.matches) ? detail.matches : [];
  const seen = new Map();
  matches.forEach(match => {
    [
      {
        slug: match.home_team_slug || '',
        name: match.home_team || '',
        logo: match.home_logo || ''
      },
      {
        slug: match.away_team_slug || '',
        name: match.away_team || '',
        logo: match.away_logo || ''
      }
    ].forEach(club => {
      const key = String(club.slug || club.name || '').trim().toLowerCase();
      if (!key || seen.has(key)) return;
      seen.set(key, club);
    });
  });
  return Array.from(seen.values());
}

function getMatchClubKey(item, side) {
  const slugKey = side === 'home'
    ? String(item?.home_team_slug || '').trim().toLowerCase()
    : String(item?.away_team_slug || '').trim().toLowerCase();
  if (slugKey) return slugKey;

  const nameKey = side === 'home'
    ? String(item?.home_team || '').trim().toLowerCase()
    : String(item?.away_team || '').trim().toLowerCase();
  return nameKey;
}

function getMatchSortValue(item) {
  const date = String(item?.date || '').trim();
  const time = String(item?.time || '').trim();
  if (date) {
    const parsed = Date.parse(`${date}T${time || '00:00'}:00`);
    if (Number.isFinite(parsed)) return parsed;
  }

  const numericId = Number(item?.id);
  return Number.isFinite(numericId) ? numericId : 0;
}

function formatHeadToHeadDateLabel(item) {
  const date = String(item?.date || '').trim();
  const time = String(item?.time || '').trim();
  let dateLabel = '';

  if (date) {
    const parsed = new Date(`${date}T${time || '00:00'}:00`);
    if (!Number.isNaN(parsed.getTime())) {
      dateLabel = new Intl.DateTimeFormat('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      }).format(parsed).replace(' г.', ' г.');
    } else {
      dateLabel = date;
    }
  }

  return joinNonEmpty([dateLabel, time], ' • ') || 'Архив матча';
}

function getHeadToHeadMatches(allMatches, currentMatch) {
  const homeKey = getMatchClubKey(currentMatch, 'home');
  const awayKey = getMatchClubKey(currentMatch, 'away');
  if (!homeKey || !awayKey) return [];

  return (Array.isArray(allMatches) ? allMatches : [])
    .filter(match => {
      if (!match || Number(match.id) === Number(currentMatch.id)) return false;
      if (String(match.status || '').trim().toLowerCase() !== 'done') return false;

      const matchHomeKey = getMatchClubKey(match, 'home');
      const matchAwayKey = getMatchClubKey(match, 'away');

      return (
        (matchHomeKey === homeKey && matchAwayKey === awayKey) ||
        (matchHomeKey === awayKey && matchAwayKey === homeKey)
      );
    })
    .sort((left, right) => getMatchSortValue(right) - getMatchSortValue(left));
}

function getCloudinaryCloudName() {
  return (window.BCUP_CONFIG?.cloudinaryCloudName || '').trim();
}

function isLocalPreviewPage() {
  const hostname = window.location.hostname;
  return hostname === 'localhost' || hostname === '127.0.0.1';
}

function isCloudinaryUrl(value) {
  return /https?:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\//i.test(String(value || ''));
}

function normalizeCloudinaryAsset(asset) {
  if (!asset) return null;
  if (typeof asset === 'string') return { publicId: asset };
  if (typeof asset === 'object' && typeof asset.publicId === 'string' && asset.publicId.trim()) {
    return asset;
  }
  return null;
}

function buildCloudinaryTransformSegment(options = {}) {
  const transforms = [];
  const width = Number(options.width);
  const height = Number(options.height);
  const crop = options.crop || (height ? 'fill' : 'limit');
  const gravity = options.gravity || '';
  const quality = options.quality === false ? '' : (options.quality || 'auto');
  const format = options.format === false ? '' : (options.format || 'auto');
  const dpr = options.dpr === false ? '' : (options.dpr || 'auto');

  if (crop) transforms.push(`c_${crop}`);
  if (Number.isFinite(width) && width > 0) transforms.push(`w_${Math.round(width)}`);
  if (Number.isFinite(height) && height > 0) transforms.push(`h_${Math.round(height)}`);
  if (gravity) transforms.push(`g_${gravity}`);
  if (quality) transforms.push(`q_${quality}`);
  if (format) transforms.push(`f_${format}`);
  if (dpr) transforms.push(`dpr_${dpr}`);

  return transforms.join(',');
}

function injectCloudinaryTransform(url, options = {}) {
  if (!isCloudinaryUrl(url)) return url;
  const transform = buildCloudinaryTransformSegment(options);
  if (!transform) return url;

  const marker = '/image/upload/';
  const [prefix, suffix] = String(url).split(marker);
  if (!suffix) return url;
  if (!/^v\d+\//.test(suffix)) return url;
  return `${prefix}${marker}${transform}/${suffix}`;
}

function buildCloudinaryAssetUrl(asset, options = {}) {
  const cloudName = getCloudinaryCloudName();
  if (!cloudName) return '';

  const normalized = normalizeCloudinaryAsset(asset);
  if (!normalized) return '';

  const transform = buildCloudinaryTransformSegment({
    crop: normalized.crop,
    gravity: normalized.gravity,
    width: normalized.width,
    height: normalized.height,
    quality: normalized.quality,
    format: normalized.format,
    dpr: normalized.dpr,
    ...options
  });
  const version = normalized.version ? `v${normalized.version}/` : '';
  return `https://res.cloudinary.com/${cloudName}/image/upload/${transform ? `${transform}/` : ''}${version}${normalized.publicId}`;
}

function canUseCloudinaryFetch() {
  return Boolean(getCloudinaryCloudName()) && Boolean(window.BCUP_CONFIG?.cloudinaryFetchEnabled) && !isLocalPreviewPage();
}

function buildCloudinaryFetchUrl(source, options = {}) {
  if (!canUseCloudinaryFetch()) return '';
  const cloudName = getCloudinaryCloudName();
  let absoluteUrl = '';

  try {
    absoluteUrl = new URL(String(source || ''), document.baseURI).href;
  } catch (error) {
    return '';
  }

  if (!/^https?:\/\//i.test(absoluteUrl)) return '';

  const transform = buildCloudinaryTransformSegment(options);
  return `https://res.cloudinary.com/${cloudName}/image/fetch/${transform ? `${transform}/` : ''}${encodeURIComponent(absoluteUrl)}`;
}

function optimizeSrcset(srcsetValue, options = {}) {
  return String(srcsetValue || '')
    .split(',')
    .map(item => item.trim())
    .filter(Boolean)
    .map(item => {
      const [url, descriptor = ''] = item.split(/\s+/, 2);
      const widthMatch = descriptor.match(/^(\d+)w$/);
      const optimizedUrl = getOptimizedImageUrl(url, {
        ...options,
        width: widthMatch ? Number(widthMatch[1]) : options.width
      });
      return descriptor ? `${optimizedUrl} ${descriptor}` : optimizedUrl;
    })
    .join(', ');
}

function getOptimizedImageUrl(source, options = {}) {
  const value = String(source || '').trim();
  if (!value || value.startsWith('data:image/')) return value;
  if (isCloudinaryUrl(value)) return injectCloudinaryTransform(value, options);

  const mappedAsset = normalizeCloudinaryAsset(getCloudinaryAssetMap()[value]);
  if (mappedAsset) {
    const cloudinaryUrl = buildCloudinaryAssetUrl(mappedAsset, options);
    if (cloudinaryUrl) return cloudinaryUrl;
  }

  const fetchUrl = buildCloudinaryFetchUrl(value, options);
  if (fetchUrl) return fetchUrl;

  return value;
}

function renderImageMarkup({
  src,
  alt,
  className = '',
  width = null,
  height = null,
  crop = null,
  gravity = '',
  loading = 'lazy',
  decoding = 'async',
  fetchpriority = '',
  keepEmptyAlt = false
} = {}) {
  const rawSrc = String(src || '').trim();
  const optimizedSrc = getOptimizedImageUrl(src, { width, height, crop, gravity });
  const attrs = [`src="${escapeHtml(optimizedSrc || TRANSPARENT_IMAGE_PLACEHOLDER)}"`];

  if (className) attrs.push(`class="${escapeHtml(className)}"`);
  if (rawSrc && !rawSrc.startsWith('data:image/') && !isCloudinaryUrl(rawSrc)) {
    attrs.push(`data-original-src="${escapeHtml(rawSrc)}"`);
    if (/^images\/(?:logo-burchalkin|team-[a-z0-9-]+|history-[a-z0-9-]+)\.webp$/i.test(rawSrc)) {
      attrs.push(`data-png-fallback-src="${escapeHtml(rawSrc.replace(/\.webp$/i, '.png'))}"`);
    }
  }
  if (keepEmptyAlt || alt) attrs.push(`alt="${escapeHtml(alt || '')}"`);
  if (loading) attrs.push(`loading="${escapeHtml(loading)}"`);
  if (decoding) attrs.push(`decoding="${escapeHtml(decoding)}"`);
  if (fetchpriority) attrs.push(`fetchpriority="${escapeHtml(fetchpriority)}"`);

  return `<img ${attrs.join(' ')}>`;
}

function renderNewsCoverImage(src, alt, className = 'news-preview-cover') {
  if (!src) {
    return `<div class="${escapeHtml(className)}"></div>`;
  }

  return `
    <div class="${escapeHtml(className)}">
      ${renderImageMarkup({
        src,
        alt,
        className: `${className}-img`,
        width: 960
      })}
    </div>
  `;
}

function resolveNewsImage(item) {
  const primaryImage = String(item?.image || '').trim();
  if (primaryImage) return primaryImage;

  const itemId = Number(item?.id);
  const itemSlug = String(item?.slug || '').trim();
  const fallback = NEWS_IMAGE_FALLBACKS.find(entry =>
    (Number.isFinite(itemId) && entry.id === itemId) ||
    (itemSlug && entry.slug === itemSlug)
  );

  return fallback?.src || '';
}

function hydrateDeferredImage(image) {
  if (!image || image.dataset.hydrated === 'true') return;
  const { src, srcset, sizes } = image.dataset;
  if (src && !image.dataset.originalSrc) image.dataset.originalSrc = src;
  if (srcset && !image.dataset.originalSrcset) image.dataset.originalSrcset = srcset;
  if (sizes && !image.dataset.originalSizes) image.dataset.originalSizes = sizes;
  if (srcset) image.setAttribute('srcset', optimizeSrcset(srcset));
  if (sizes) image.setAttribute('sizes', sizes);
  if (src) image.setAttribute('src', getOptimizedImageUrl(src));
  image.dataset.hydrated = 'true';
}

function getStaticImageProfile(image) {
  if (!image) return null;
  if (image.classList.contains('lang-flag-img')) return { skip: true };
  if (image.closest('.header-brand-mark')) return { width: 256 };
  if (image.closest('.hero-carousel-slide')) {
    return {
      width: 1600,
      srcsetWidths: [960, 1600],
      sizes: '(max-width: 900px) 100vw, 72vw'
    };
  }
  if (image.classList.contains('hero-carousel-side-img')) return { width: 960, height: 540, crop: 'fill', gravity: 'auto' };
  if (image.closest('.sponsor-item-logo')) return { width: 320 };
  if (image.classList.contains('match-team-logo')) return { width: 180 };
  if (image.classList.contains('team-logo-img')) return { width: 240 };
  if (image.classList.contains('team-logo')) return { width: 96 };
  if (image.classList.contains('news-preview-cover-img')) return { width: 960 };
  if (image.closest('.thumb')) return { width: 720 };
  return null;
}

function upgradeStaticImagesForCloudinary() {
  if (!canUseCloudinaryFetch()) return;

  document.querySelectorAll('img').forEach(image => {
    const profile = getStaticImageProfile(image);
    if (!profile || profile.skip) return;
    if (image.closest('.hero-carousel-slide') && image.dataset.src) return;

    const originalSrc = image.dataset.src || image.getAttribute('src') || '';
    if (!originalSrc || originalSrc.startsWith('data:image/')) return;
    if (!image.dataset.originalSrc && !isCloudinaryUrl(originalSrc)) {
      image.dataset.originalSrc = originalSrc;
    }

    if (profile.srcsetWidths?.length) {
      const existingSrcset = image.getAttribute('srcset') || '';
      if (existingSrcset && !image.dataset.originalSrcset) image.dataset.originalSrcset = existingSrcset;
      if (profile.sizes && !image.dataset.originalSizes) image.dataset.originalSizes = profile.sizes;
      image.setAttribute('src', getOptimizedImageUrl(originalSrc, { ...profile, width: Math.max(...profile.srcsetWidths) }));
      image.setAttribute('srcset', profile.srcsetWidths.map(width => `${getOptimizedImageUrl(originalSrc, { ...profile, width })} ${width}w`).join(', '));
      if (profile.sizes) image.setAttribute('sizes', profile.sizes);
      return;
    }

    image.setAttribute('src', getOptimizedImageUrl(originalSrc, profile));
  });
}

function handleCloudinaryImageFallback(event) {
  const image = event.target;
  if (!(image instanceof HTMLImageElement)) return;
  const currentSrc = image.currentSrc || image.getAttribute('src') || '';
  const originalSrc = image.dataset.originalSrc || '';

  if (originalSrc && isCloudinaryUrl(currentSrc) && image.dataset.cloudinaryFallbackApplied !== 'true') {
    image.dataset.cloudinaryFallbackApplied = 'true';
    image.removeAttribute('srcset');
    image.removeAttribute('sizes');
    if (image.dataset.originalSrcset) image.setAttribute('srcset', image.dataset.originalSrcset);
    if (image.dataset.originalSizes) image.setAttribute('sizes', image.dataset.originalSizes);
    image.setAttribute('src', originalSrc);
    return;
  }

  const pngFallbackSrc = image.dataset.pngFallbackSrc
    || (/(?:^|\/)images\/(?:logo-burchalkin|team-[a-z0-9-]+|history-[a-z0-9-]+)\.webp(?:$|\?)/i.test(currentSrc)
      ? currentSrc.replace(/\.webp(\?|$)/i, '.png$1')
      : '');

  if (!pngFallbackSrc || image.dataset.pngFallbackApplied === 'true') return;

  image.dataset.pngFallbackApplied = 'true';
  image.removeAttribute('srcset');
  image.removeAttribute('sizes');
  image.setAttribute('src', pngFallbackSrc);
}

async function fetchApi(path) {
  const apiBaseUrl = getApiBaseUrl();
  if (!apiBaseUrl) return null;
  try {
    const response = await fetch(`${apiBaseUrl}${path}`);
    if (!response.ok) throw new Error(`Failed to load ${path}`);
    return response.json();
  } catch (error) {
    console.warn(`Remote API ${path} is unavailable.`, error);
    return null;
  }
}

async function fetchJson(path) {
  const storageKeyMap = {
    'data/standings.json': 'bcup_standings',
    'data/matches.json': 'bcup_matches',
    'data/news.json': 'bcup_news',
    'data/results.json': 'bcup_results',
  };
  const storageKey = storageKeyMap[path];
  if (storageKey) {
    const local = localStorage.getItem(storageKey);
    if (local) {
      try {
        const parsed = JSON.parse(local);
        if (path !== 'data/standings.json' || hasExpandedStandingsFields(parsed)) {
          return parsed;
        }
      } catch (e) {}
    }
  }
  const apiBaseUrl = getApiBaseUrl();
  const endpoint = API_ENDPOINTS[path];
  if (apiBaseUrl && endpoint) {
    try {
      const remoteData = await fetchApi(endpoint);
      if (remoteData && (path !== 'data/standings.json' || hasExpandedStandingsFields(remoteData))) {
        return remoteData;
      }
    } catch (error) {
      console.warn(`Remote API ${endpoint} is unavailable, falling back to static file.`, error);
    }
  }
  const response = await fetch(path);
  if (!response.ok) throw new Error(`Failed to load ${path}`);
  return response.json();
}

function renderClubCard(item) {
  return `
    <a class="team-logo-card club-card-link" href="club.html?slug=${encodeURIComponent(item.slug)}">
      <div class="team-logo-wrap">${renderImageMarkup({ src: item.logo, alt: item.name, className: 'team-logo-img', width: 240 })}</div>
      <h3>${escapeHtml(item.name)}</h3>
      <div class="muted team-country">${escapeHtml(formatClubLocation(item))}</div>
    </a>
  `;
}

async function renderClubsGrid(selector, limit = null) {
  const target = document.querySelector(selector);
  if (!target) return;
  const clubs = await fetchApi('/api/clubs');
  if (!clubs) return;
  const items = limit ? clubs.slice(0, limit) : clubs;
  target.innerHTML = items.map(renderClubCard).join('');
  runAutoFit();
}

async function renderTournamentsGrid() {
  const target = document.querySelector('#home-tournaments');
  if (!target) return;
  const tournaments = await fetchApi('/api/tournaments');
  const liveTournaments = Array.isArray(tournaments) ? tournaments : [];
  const archiveEntries = buildArchiveTournamentEntries().filter(archiveItem => {
    return !liveTournaments.some(item => Number(item?.season_year || 0) === Number(archiveItem.season_year || 0));
  });
  const allTournaments = [...liveTournaments, ...archiveEntries];
  if (!allTournaments.length) return;

  target.innerHTML = allTournaments.map(item => {
    const isArchive = Boolean(item.is_archive) || ['completed', 'archived'].includes(String(item.status || '').trim().toLowerCase()) && Number(item.season_year || 0) < 2026;
    const actionHref = isArchive
      ? `archive-tournament.html?year=${encodeURIComponent(String(item.season_year || ''))}${item.slug ? `&slug=${encodeURIComponent(item.slug)}` : ''}`
      : `results.html?tournament=${encodeURIComponent(item.slug || '')}`;
    const actionLabel = isArchive ? 'Открыть архив' : 'Открыть турнир';
    const datesLabel = formatTournamentDateRange(item.start_date, item.end_date) || escapeHtml(String(item.start_date || '').trim());
    const displayName = Number(item.season_year || 0) === 2026
      ? 'Кубок Бурчалкина 2026'
      : String(item.name || '').trim();

    return `
    <article class="tournament-card">
      <div class="tournament-card-top">
        <div class="tournament-card-year">${escapeHtml(item.season_year || '')}</div>
        <div class="tournament-card-status ${escapeHtml(item.status)}">${escapeHtml(formatTournamentStatus(item.status))}</div>
      </div>
      <h3>${escapeHtml(displayName)}</h3>
      <p>${escapeHtml(item.description || '')}</p>
      <div class="tournament-card-meta">
        <span>${escapeHtml(formatCountLabel(item.clubs_count, ['клуб', 'клуба', 'клубов']))}</span>
        <span>${escapeHtml(formatCountLabel(item.matches_count, ['матч', 'матча', 'матчей']))}</span>
      </div>
      <div class="tournament-card-dates">${datesLabel}</div>
      <div class="tournament-card-actions">
        <a class="tournament-card-button" href="${escapeHtml(actionHref)}">${actionLabel}</a>
      </div>
    </article>
  `;
  }).join('');
}

const PARTNER_PLACEHOLDER_LOGO = 'images/logo-burchalkin.webp';
const PARTNER_FALLBACK_HREF = 'index.html';

function normalizePartnerLookupKey(value) {
  return String(value || '').trim().toLowerCase().replace(/\s+/g, ' ');
}

function normalizePartnerHref(value) {
  const href = String(value || '').trim();
  if (!href) return PARTNER_FALLBACK_HREF;
  if (/^(https?:)?\/\//i.test(href)) return href;
  if (/^(mailto:|tel:|#|\/|\.\/|\.\.\/)/i.test(href)) return href;
  return `https://${href}`;
}

function isExternalPartnerHref(href) {
  return /^(https?:)?\/\//i.test(String(href || ''));
}

function renderPartnerLogoMarkup(name, src = PARTNER_PLACEHOLDER_LOGO, alt = '') {
  return renderImageMarkup({
    src,
    alt: alt || name || 'Burchalkin Cup',
    width: 320
  });
}

function decorateStaticPartnerItems(root = document, partnerLookup = new Map()) {
  root.querySelectorAll('.sponsor-grid .sponsor-item').forEach((node) => {
    const labelNode = node.querySelector('span');
    const name = (labelNode ? labelNode.textContent : node.textContent).trim();
    if (!name) return;
    const partner = partnerLookup.get(normalizePartnerLookupKey(name)) || null;
    const href = normalizePartnerHref(partner?.website_url || '');
    const logoSrc = String(partner?.logo_url || '').trim() || PARTNER_PLACEHOLDER_LOGO;
    const logoAlt = partner?.logo_alt || name;

    let element = node;
    if (node.tagName !== 'A') {
      element = document.createElement('a');
      element.className = node.className;
      node.replaceWith(element);
    }

    element.classList.add('sponsor-item-logo');
    element.setAttribute('href', href);
    if (isExternalPartnerHref(href)) {
      element.setAttribute('target', '_blank');
      element.setAttribute('rel', 'noreferrer');
    } else {
      element.removeAttribute('target');
      element.removeAttribute('rel');
    }
    element.innerHTML = `
      ${renderPartnerLogoMarkup(name, logoSrc, logoAlt)}
      <span>${escapeHtml(name)}</span>
    `;
  });

  upgradeStaticImagesForCloudinary();
}

function renderPartnerItem(item) {
  const logoSrc = String(item.logo_url || '').trim() || PARTNER_PLACEHOLDER_LOGO;
  const href = normalizePartnerHref(item.website_url || '');
  const externalAttrs = isExternalPartnerHref(href) ? 'target="_blank" rel="noreferrer"' : '';
  return `
    <a class="sponsor-item sponsor-item-logo" href="${escapeHtml(href)}" ${externalAttrs}>
      ${renderPartnerLogoMarkup(item.name, logoSrc, item.logo_alt || item.name)}
      <span>${escapeHtml(item.name)}</span>
    </a>
  `;
}

async function renderPartnersForFeaturedTournament() {
  const generalTarget = document.querySelector('#partners-general');
  const mediaTarget = document.querySelector('#partners-media');
  decorateStaticPartnerItems();
  const tournaments = await fetchApi('/api/tournaments');
  if (!tournaments || !tournaments.length) return;
  const featured = tournaments.find(item => item.is_featured) || tournaments[0];
  if (!featured) return;
  const partnerGroups = await fetchApi(`/api/tournaments/${featured.slug}`);
  if (!partnerGroups || !Array.isArray(partnerGroups.partners)) return;

  const partnerLookup = new Map();
  partnerGroups.partners.forEach((group) => {
    (group.items || []).forEach((item) => {
      partnerLookup.set(normalizePartnerLookupKey(item.name), item);
      if (item.slug) partnerLookup.set(normalizePartnerLookupKey(item.slug), item);
    });
  });

  const general = partnerGroups.partners.find(item => item.slug === 'general');
  const media = partnerGroups.partners.find(item => item.slug === 'media');
  if (generalTarget && general) generalTarget.innerHTML = general.items.map(renderPartnerItem).join('');
  if (mediaTarget && media) mediaTarget.innerHTML = media.items.map(renderPartnerItem).join('');
  decorateStaticPartnerItems(document, partnerLookup);
}

async function renderClubPage() {
  const target = document.querySelector('#club-page-root');
  if (!target) return;
  const slug = new URLSearchParams(window.location.search).get('slug');
  if (!slug) {
    target.innerHTML = '<section class="section"><div class="container card"><h2>Клуб не найден</h2><p class="muted">В ссылке не указан slug клуба.</p></div></section>';
    return;
  }
  const club = await fetchApi(`/api/clubs/${encodeURIComponent(slug)}`);
  const clubData = club || getHistoricalClubFallback(slug);
  if (!clubData) {
    target.innerHTML = '<section class="section"><div class="container card"><h2>Клуб недоступен</h2><p class="muted">API ещё не подключён или клуб не найден.</p></div></section>';
    return;
  }
  const locationLabel = formatClubLocation(clubData);
  const matches = Array.isArray(clubData.matches) ? clubData.matches : [];
  const matchesMarkup = matches.map(item => {
    const parts = String(item.score || '0:0').split(':');
    const dateTime = joinNonEmpty([item.date, item.time], ' ');
    return `
      <a class="club-history-card" href="match.html?id=${item.id}">
        <div class="club-history-top">
          <span>${escapeHtml(item.tournament_name || '')}</span>
          <span>${escapeHtml(dateTime)}</span>
        </div>
        <div class="club-history-match">${escapeHtml(item.home_team)} — ${escapeHtml(item.away_team)}</div>
        <div class="club-history-meta">
          <span>${escapeHtml(item.stage || '')}</span>
          <strong>${escapeHtml(parts[0] || '0')}:${escapeHtml(parts[1] || '0')}</strong>
          <span>${escapeHtml(item.status_label || '')}</span>
        </div>
      </a>
    `;
  }).join('');
  target.innerHTML = `
    <section class="page-head club-head">
      <div class="container club-head-grid">
        <div class="club-head-logo">${renderImageMarkup({ src: clubData.logo, alt: clubData.name, width: 320, loading: 'eager' })}</div>
        <div>
          <h1>${escapeHtml(clubData.name)}</h1>
          <p>${escapeHtml(clubData.description || '')}</p>
          <div class="club-head-meta">
            ${locationLabel ? `<span>${escapeHtml(locationLabel)}</span>` : ''}
            ${clubData.founded_year ? `<span>${escapeHtml(String(clubData.founded_year))}</span>` : ''}
          </div>
        </div>
      </div>
    </section>
    <section class="section">
      <div class="container">
        <div class="home-block-head">
          <div>
            <h2 class="section-title home-block-title">История матчей</h2>
            <p class="home-block-subtitle">Прошедшие и будущие матчи клуба во всех турнирах сайта.</p>
          </div>
          <a class="home-block-link" href="teams.html">Все клубы →</a>
        </div>
        <div class="club-history-grid">${matchesMarkup || '<div class="card">У клуба пока нет матчей в базе.</div>'}</div>
      </div>
    </section>
  `;
}


function fitTextElements(selector, minSize = 11, maxSize = 18) {
  document.querySelectorAll(selector).forEach(el => {
    el.style.whiteSpace = 'nowrap';
    let size = maxSize;
    el.style.fontSize = size + 'px';
    while ((el.scrollWidth > el.clientWidth || el.scrollHeight > el.clientHeight) && size > minSize) {
      size -= 0.5;
      el.style.fontSize = size + 'px';
    }
  });
}

function runAutoFit() {
  fitTextElements('.team-logo-card h3', 11, 20);
  fitTextElements('.upcoming-name', 11, 16);
  fitTextElements('.standings-team span', 11, 16);
  fitTextElements('.team-inline span', 11, 16);
}

async function renderUpcomingMatches() {
  const target = document.querySelector('#home-upcoming-matches');
  if (!target) return;
  try {
    const items = await fetchJson('data/matches.json');
    target.innerHTML = items.map(item => {
      const parts = String(item.score || '0:0').split(':');
      const homeScore = item.score ? escapeHtml(parts[0] || '0') : '0';
      const awayScore = item.score ? escapeHtml(parts[1] || '0') : '0';
      const statusClass = item.status === 'live' ? 'live' : (item.status === 'done' ? 'done' : 'soon');
      return `
      <a class="upcoming-card" href="match.html?id=${item.id}">
        <div class="upcoming-header">
          <div>
            <div class="upcoming-tour">${escapeHtml(item.stage || item.group || '1 тур')}</div>
            <div class="upcoming-time">${escapeHtml(formatMatchCardDateTime(item))}</div>
          </div>
          <div class="upcoming-status ${statusClass}">${escapeHtml(item.status_label || 'Скоро')}</div>
        </div>
        <div class="upcoming-teams">
          <div class="upcoming-team-row">
            <div class="team-left">
              ${renderImageMarkup({ src: item.home_logo, alt: item.home_team, className: 'team-logo', width: 96 })}
              <div class="team-name">${escapeHtml(item.home_team)}</div>
            </div>
            <div class="team-score">${homeScore}</div>
          </div>
          <div class="upcoming-team-row">
            <div class="team-left">
              ${renderImageMarkup({ src: item.away_logo, alt: item.away_team, className: 'team-logo', width: 96 })}
              <div class="team-name">${escapeHtml(item.away_team)}</div>
            </div>
            <div class="team-score">${awayScore}</div>
          </div>
        </div>
      </a>`;
    }).join('');
    autoFitTeamNames('.team-name');
  } catch (e) {
    target.innerHTML = '<div class="card">Не удалось загрузить матчи.</div>';
  }
}

async function renderHomeNews() {
  const target = document.querySelector('#home-latest-news');
  if (!target) return;
  try {
    const items = await fetchJson('data/news.json');
    target.innerHTML = items.map(renderNewsPreviewCard).join('');
    runAutoFit();
  } catch (e) {
    target.innerHTML = '<div class="card">Не удалось загрузить новости.</div>';
  }
}

function renderNewsPreviewCard(item) {
  const imageSrc = resolveNewsImage(item);
  const articleHref = item.slug
    ? `news-article.html?slug=${encodeURIComponent(String(item.slug))}`
    : `news-article.html?id=${encodeURIComponent(String(item.id || ''))}`;
  return `
    <a class="news-preview-card" href="${escapeHtml(articleHref)}">
      ${renderNewsCoverImage(imageSrc, item.title)}
      <div class="news-preview-content">
        <div class="news-preview-date">${escapeHtml(item.date)}</div>
        <h3>${escapeHtml(item.title)}</h3>
        <p>${escapeHtml(item.excerpt)}</p>
      </div>
    </a>
  `;
}

async function renderMatchesPage() {
  const target = document.querySelector('#matches-list');
  if (!target) return;
  try {
    const items = await fetchJson('data/matches.json');
    target.innerHTML = items.map(item => {
      const parts = String(item.score || '0:0').split(':');
      const homeScore = item.score ? escapeHtml(parts[0] || '0') : '0';
      const awayScore = item.score ? escapeHtml(parts[1] || '0') : '0';
      const statusClass = item.status === 'live' ? 'live' : (item.status === 'done' ? 'done' : 'soon');
      return `
      <a class="upcoming-card" href="match.html?id=${item.id}">
        <div class="upcoming-header">
          <div>
            <div class="upcoming-tour">${escapeHtml(item.stage || item.group || '1 тур')}</div>
            <div class="upcoming-time">${escapeHtml(formatMatchCardDateTime(item))}</div>
          </div>
          <div class="upcoming-status ${statusClass}">${escapeHtml(item.status_label || 'Скоро')}</div>
        </div>
        <div class="upcoming-teams">
          <div class="upcoming-team-row">
            <div class="team-left">
              ${renderImageMarkup({ src: item.home_logo, alt: item.home_team, className: 'team-logo', width: 96 })}
              <div class="team-name">${escapeHtml(item.home_team)}</div>
            </div>
            <div class="team-score">${homeScore}</div>
          </div>
          <div class="upcoming-team-row">
            <div class="team-left">
              ${renderImageMarkup({ src: item.away_logo, alt: item.away_team, className: 'team-logo', width: 96 })}
              <div class="team-name">${escapeHtml(item.away_team)}</div>
            </div>
            <div class="team-score">${awayScore}</div>
          </div>
        </div>
      </a>`;
    }).join('');
    autoFitTeamNames('#matches-list .team-name');
  } catch (e) {
    target.innerHTML = '<div class="card">Не удалось загрузить список матчей.</div>';
  }
}

async function renderNewsPage() {
  const target = document.querySelector('#news-list');
  if (!target) return;
  try {
    const items = await fetchJson('data/news.json');
    target.innerHTML = items.map(renderNewsPreviewCard).join('');
    runAutoFit();
  } catch (e) {
    target.innerHTML = '<div class="card">Не удалось загрузить новости.</div>';
  }
}

function getMatchStatusClass(status) {
  return status === 'live' ? 'live' : (status === 'done' ? 'done' : 'soon');
}

function getMatchTimestamp(item = {}) {
  const date = String(item.date || '').trim();
  const time = String(item.time || '').trim() || '00:00';
  const parsed = Date.parse(`${date}T${time}`);
  return Number.isFinite(parsed) ? parsed : 0;
}

function getMatchMediaLinks(item = {}) {
  return [
    { key: 'stream', label: 'Трансляция', url: String(item.video || '').trim() },
    { key: 'review', label: 'Обзор', url: String(item.review_video || '').trim() },
    { key: 'interview', label: 'Интервью', url: String(item.interview_video || '').trim() }
  ];
}

function hasAnyMatchMedia(item = {}) {
  return getMatchMediaLinks(item).some(link => Boolean(link.url));
}

function sortMediaMatches(matches = []) {
  const priorityMap = { live: 0, soon: 1, done: 2 };
  return [...matches].sort((left, right) => {
    const leftPriority = priorityMap[left.status] ?? 9;
    const rightPriority = priorityMap[right.status] ?? 9;
    if (leftPriority !== rightPriority) return leftPriority - rightPriority;

    const leftTime = getMatchTimestamp(left);
    const rightTime = getMatchTimestamp(right);
    if (left.status === 'done' && right.status === 'done') {
      return rightTime - leftTime;
    }
    return leftTime - rightTime;
  });
}

function pickFeaturedMediaMatch(matches = []) {
  const withStream = matches.find(item => String(item.video || '').trim());
  return withStream || matches[0] || null;
}

function renderMediaActionButton(link, options = {}) {
  const label = escapeHtml(link.label || '');
  const matchId = String(options.matchId || '').trim();
  if (matchId) {
    const href = `match.html?id=${encodeURIComponent(matchId)}&media=${encodeURIComponent(link.key || 'stream')}`;
    return `<a class="media-action-button${options.primary ? ' is-primary' : ''}" href="${escapeHtml(href)}">${label}</a>`;
  }

  if (!link.url) {
    return `<span class="media-action-button is-disabled">${label}</span>`;
  }

  const target = options.external === false ? '' : ' target="_blank" rel="noreferrer"';
  return `<a class="media-action-button${options.primary ? ' is-primary' : ''}" href="${escapeHtml(link.url)}"${target}>${label}</a>`;
}

function renderMediaFeatureCard(item) {
  const statusClass = getMatchStatusClass(item.status);
  const meta = joinNonEmpty([
    formatMatchCardDateTime(item),
    String(item.group || item.stage || '').trim()
  ], ' • ');
  const summary = String(item.summary || '').trim() || 'На странице матча можно смотреть трансляцию, а позже переключаться между обзором и интервью.';
  const title = `${item.home_team} — ${item.away_team}`;
  const links = getMatchMediaLinks(item);

  return `
    <section class="card media-feature-card">
      <div class="media-feature-shell">
        <div class="media-feature-copy">
          <div class="media-feature-topline">
            <span class="archive-stat-chip">Главный эфир</span>
            <span class="upcoming-status media-feature-status ${statusClass}">${escapeHtml(item.status_label || 'Скоро')}</span>
          </div>
          <h2 class="media-feature-title">${escapeHtml(title)}</h2>
          ${meta ? `<div class="media-feature-meta">${escapeHtml(meta)}</div>` : ''}
          <p class="media-feature-summary">${escapeHtml(summary)}</p>
          <div class="media-feature-links">
            <a class="tournament-card-button" href="match.html?id=${encodeURIComponent(item.id)}">Страница матча</a>
          </div>
        </div>
        <div class="match-page-media media-feature-player" data-match-media>
          <div class="match-page-actions" role="tablist" aria-label="Материалы матча">
            ${links.map((link, index) => `
              <button class="match-page-action${index === 0 ? ' is-active' : ''}" type="button" role="tab" aria-selected="${index === 0 ? 'true' : 'false'}" data-match-media-tab="${escapeHtml(link.key)}">${escapeHtml(link.label)}</button>
            `).join('')}
          </div>
          <div class="match-page-media-stage">
            ${renderMatchMediaPanel('stream', 'Трансляция', item.video, {
              title: 'Трансляция появится позднее'
            })}
            ${renderMatchMediaPanel('review', 'Обзор', item.review_video, {
              title: 'Обзор появится позднее'
            })}
            ${renderMatchMediaPanel('interview', 'Интервью', item.interview_video, {
              title: 'Интервью появится позднее'
            })}
          </div>
        </div>
      </div>
    </section>
  `;
}

const MEDIA_ALBUM_PLACEHOLDERS = [
  {
    title: 'Фотоальбом открытия',
    excerpt: 'Фотографии церемонии открытия и первых эмоций турнира.',
    badge: 'Скоро'
  },
  {
    title: 'Лучшие кадры игрового дня',
    excerpt: 'Подборка игровых моментов, болельщиков и атмосферы матчей.',
    badge: 'Скоро'
  },
  {
    title: 'Награждение и закрытие',
    excerpt: 'Отдельный альбом с награждением, кубком и финальными кадрами.',
    badge: 'Скоро'
  }
];

function renderMediaAlbumPlaceholderCard(item) {
  return `
    <article class="news-preview-card media-album-card">
      <div class="news-preview-cover media-album-cover">
        <span class="archive-stat-chip media-album-badge">${escapeHtml(item.badge || 'Скоро')}</span>
        <div class="media-album-icon">Фотоальбом</div>
      </div>
      <div class="news-preview-content media-album-content">
        <div class="news-preview-date">Будущий материал</div>
        <h3>${escapeHtml(item.title || '')}</h3>
        <p>${escapeHtml(item.excerpt || '')}</p>
      </div>
    </article>
  `;
}

function renderMediaOverviewCards(matches = [], storiesCount = 0) {
  const streamsCount = matches.filter(item => String(item.video || '').trim()).length;
  const reviewsCount = matches.filter(item => String(item.review_video || '').trim()).length;
  const interviewsCount = matches.filter(item => String(item.interview_video || '').trim()).length;

  return `
    <section class="card media-overview-card">
      <h3>В медиаразделе</h3>
      <div class="media-kpi-grid">
        <div class="media-kpi">
          <strong>${streamsCount}</strong>
          <span>трансляций</span>
        </div>
        <div class="media-kpi">
          <strong>${reviewsCount}</strong>
          <span>обзоров</span>
        </div>
        <div class="media-kpi">
          <strong>${interviewsCount}</strong>
          <span>интервью</span>
        </div>
        <div class="media-kpi">
          <strong>${storiesCount}</strong>
          <span>фоторепортажей</span>
        </div>
      </div>
    </section>
  `;
}

function renderMediaMatchCard(item) {
  const statusClass = getMatchStatusClass(item.status);
  const links = getMatchMediaLinks(item);
  const scoreParts = String(item.score || '0:0').split(':');
  const score = item.status === 'soon'
    ? '—'
    : `${escapeHtml(scoreParts[0] || '0')}:${escapeHtml(scoreParts[1] || '0')}`;

  return `
    <article class="card media-match-card">
      <div class="media-match-top">
        <div>
          <div class="media-match-stage">${escapeHtml(item.group || item.stage || 'Матч')}</div>
          <div class="media-match-date">${escapeHtml(formatMatchCardDateTime(item))}</div>
        </div>
        <div class="upcoming-status media-match-status ${statusClass}">${escapeHtml(item.status_label || 'Скоро')}</div>
      </div>
      <a class="media-match-main" href="match.html?id=${encodeURIComponent(item.id)}">
        <div class="media-match-team">
          ${renderImageMarkup({ src: item.home_logo, alt: item.home_team, className: 'media-match-logo', width: 120 })}
          <span>${escapeHtml(item.home_team)}</span>
        </div>
        <div class="media-match-score">${score}</div>
        <div class="media-match-team media-match-team-away">
          ${renderImageMarkup({ src: item.away_logo, alt: item.away_team, className: 'media-match-logo', width: 120 })}
          <span>${escapeHtml(item.away_team)}</span>
        </div>
      </a>
      <div class="media-match-actions">
        <a class="media-action-button is-primary" href="match.html?id=${encodeURIComponent(item.id)}">Страница матча</a>
        ${links.map(link => renderMediaActionButton(link, { matchId: item.id })).join('')}
      </div>
    </article>
  `;
}

async function renderMultimediaPage() {
  const featuredTarget = document.querySelector('#media-featured');
  const libraryTarget = document.querySelector('#media-library');
  const storiesTarget = document.querySelector('#media-stories');
  if (!featuredTarget || !libraryTarget || !storiesTarget) return;

  try {
    const matchesRaw = await fetchJson('data/matches.json');

    const matches = sortMediaMatches((Array.isArray(matchesRaw) ? matchesRaw : []).filter(hasAnyMatchMedia));
    const featuredMatch = pickFeaturedMediaMatch(matches);

    featuredTarget.innerHTML = featuredMatch
      ? renderMediaFeatureCard(featuredMatch)
      : '<div class="card media-empty-card">Медиаматериалы появятся здесь после публикации первых трансляций.</div>';

    libraryTarget.innerHTML = matches.length
      ? matches.map(renderMediaMatchCard).join('')
      : '<div class="card media-empty-card">Материалы матчей появятся после публикации первых эфиров.</div>';

    storiesTarget.innerHTML = MEDIA_ALBUM_PLACEHOLDERS.map(renderMediaAlbumPlaceholderCard).join('');

    if (featuredMatch) initMatchMediaTabs(featuredTarget);
    runAutoFit();
  } catch (error) {
    featuredTarget.innerHTML = '<div class="card media-empty-card">Не удалось загрузить главный эфир.</div>';
    libraryTarget.innerHTML = '<div class="card media-empty-card">Не удалось загрузить материалы матчей.</div>';
    storiesTarget.innerHTML = '<div class="card media-empty-card">Не удалось загрузить фоторепортажи.</div>';
  }
}

async function renderNewsArticlePage() {
  const root = document.querySelector('#news-article-page');
  if (!root) return;

  try {
    const items = await fetchJson('data/news.json');
    const params = new URLSearchParams(window.location.search);
    const slug = String(params.get('slug') || '').trim();
    const id = String(params.get('id') || '').trim();

    const item = (Array.isArray(items) ? items : []).find(entry => {
      if (slug && String(entry?.slug || '').trim() === slug) return true;
      if (id && String(entry?.id || '').trim() === id) return true;
      return false;
    }) || (Array.isArray(items) ? items[0] : null);

    if (!item) {
      root.innerHTML = '<div class="card">Не удалось найти новость.</div>';
      return;
    }

    document.title = `Burchalkin Cup — ${item.title || 'Новость'}`;
    const imageSrc = resolveNewsImage(item);
    const content = Array.isArray(item.content) ? item.content : [];

    root.innerHTML = `
      <article class="news-article-card">
        <a class="news-article-back" href="news.html">← Все новости</a>
        <h1 class="news-article-title">${escapeHtml(item.title || '')}</h1>
        ${renderNewsCoverImage(imageSrc, item.title, 'news-article-cover')}
        <div class="news-article-body">
          ${item.excerpt ? `<p class="news-article-lead">${escapeHtml(item.excerpt)}</p>` : ''}
          ${content.map(paragraph => `<p>${escapeHtml(paragraph)}</p>`).join('')}
        </div>
        <div class="news-article-footer">
          <div class="news-article-date">Добавлено: ${escapeHtml(item.date || '')}</div>
        </div>
      </article>
    `;
  } catch (e) {
    root.innerHTML = '<div class="card">Не удалось загрузить новость.</div>';
  }
}

async function renderResultsList() {
  const target = document.querySelector('#results-list');
  if (!target) return;
  try {
    const items = await fetchJson('data/results.json');
    target.innerHTML = items.map(item => `
      <div class="result-card">
        <div class="result-stage">${escapeHtml(item.stage)}</div>
        <div class="result-match">${escapeHtml(item.match)}</div>
        <div class="result-score">${escapeHtml(item.score)}</div>
      </div>
    `).join('');
  } catch (e) {
    target.innerHTML = '<div class="card">Не удалось загрузить результаты.</div>';
  }
}


async function renderResultsMatches() {
  const target = document.querySelector('#results-matches');
  if (!target) return;
  try {
    const items = await fetchJson('data/matches.json');
    target.innerHTML = items.map(item => {
      const parts = String(item.score || '0:0').split(':');
      const homeScore = item.score ? escapeHtml(parts[0] || '0') : '0';
      const awayScore = item.score ? escapeHtml(parts[1] || '0') : '0';
      const statusClass = item.status === 'live' ? 'live' : (item.status === 'done' ? 'done' : 'soon');
      return `
      <a class="upcoming-card" href="match.html?id=${item.id}">
        <div class="upcoming-header">
          <div>
            <div class="upcoming-tour">${escapeHtml(item.stage || item.group || '1 тур')}</div>
            <div class="upcoming-time">${escapeHtml(formatMatchCardDateTime(item))}</div>
          </div>
          <div class="upcoming-status ${statusClass}">${escapeHtml(item.status_label || 'Скоро')}</div>
        </div>
        <div class="upcoming-teams">
          <div class="upcoming-team-row">
            <div class="team-left">
              ${renderImageMarkup({ src: item.home_logo, alt: item.home_team, className: 'team-logo', width: 96 })}
              <div class="team-name">${escapeHtml(item.home_team)}</div>
            </div>
            <div class="team-score">${homeScore}</div>
          </div>
          <div class="upcoming-team-row">
            <div class="team-left">
              ${renderImageMarkup({ src: item.away_logo, alt: item.away_team, className: 'team-logo', width: 96 })}
              <div class="team-name">${escapeHtml(item.away_team)}</div>
            </div>
            <div class="team-score">${awayScore}</div>
          </div>
        </div>
      </a>`;
    }).join('');
    autoFitTeamNames('#results-matches .team-name');
  } catch (e) {
    target.innerHTML = '<div class="card">Не удалось загрузить матчи.</div>';
  }
}

async function renderMatchPageFromJson() {
  const target = document.querySelector('#match-page-json');
  if (!target) return;
  try {
    const items = await fetchJson('data/matches.json');
    const params = new URLSearchParams(window.location.search);
    const id = Number(params.get('id') || '1');
    const requestedMediaTab = String(params.get('media') || '').trim().toLowerCase();
    const item = items.find(x => x.id === id) || items[0];
    const headToHeadMatches = getHeadToHeadMatches(items, item);
    const parts = String(item.score || '0:0').split(':');
    const homeScore = item.score ? escapeHtml(parts[0] || '0') : '0';
    const awayScore = item.score ? escapeHtml(parts[1] || '0') : '0';
    const matchMeta = joinNonEmpty([formatMatchDisplayDate(item.date), String(item.time || '').trim(), formatMatchVenue(item)], ' • ');
    const statusClass = item.status === 'live' ? 'live' : (item.status === 'done' ? 'done' : 'soon');
    const stageLabel = item.stage || item.group || 'Матч';
    const matchdayLabel = item.matchday || item.round || '';
    const headToHeadMarkup = headToHeadMatches.length
      ? headToHeadMatches.map(match => {
          const scoreParts = String(match.score || '0:0').split(':');
          return `
            <a class="match-headtohead-row" href="match.html?id=${encodeURIComponent(match.id)}">
              <div class="match-headtohead-date">${escapeHtml(formatHeadToHeadDateLabel(match))}</div>
              <div class="match-headtohead-main">
                <div class="match-headtohead-team match-headtohead-team-home">
                  <span class="match-headtohead-name">${escapeHtml(match.home_team)}</span>
                  ${renderImageMarkup({ src: match.home_logo, alt: match.home_team, className: 'match-headtohead-logo', width: 96 })}
                </div>
                <div class="match-headtohead-score">${escapeHtml(scoreParts[0] || '0')} - ${escapeHtml(scoreParts[1] || '0')}</div>
                <div class="match-headtohead-team match-headtohead-team-away">
                  ${renderImageMarkup({ src: match.away_logo, alt: match.away_team, className: 'match-headtohead-logo', width: 96 })}
                  <span class="match-headtohead-name">${escapeHtml(match.away_team)}</span>
                </div>
              </div>
            </a>
          `;
        }).join('')
      : '<div class="card">Команды не встречались ранее.</div>';
    target.innerHTML = `
      <div class="container match-page-shell">
        <section class="match-page-hero">
          <div class="match-page-topline">
            <div class="match-page-tags">
              <span class="match-page-tag">${escapeHtml(stageLabel)}</span>
              <span class="match-page-tag match-page-tag-soft">Кубок Бурчалкина</span>
              ${matchdayLabel ? `<span class="match-page-tag match-page-tag-soft">${escapeHtml(matchdayLabel)}</span>` : ''}
            </div>
            <div class="upcoming-status match-page-status ${statusClass}">${escapeHtml(item.status_label || 'Скоро')}</div>
          </div>
          <div class="match-page-head">
            <div class="match-page-copy">
              ${matchMeta ? `<div class="match-page-meta">${escapeHtml(matchMeta)}</div>` : ''}
            </div>
          </div>
          <div class="match-page-scorecard">
            <div class="match-page-team match-page-team-home">
              <div class="match-page-team-badge">Хозяева</div>
              <div class="match-page-team-brand">
                ${renderImageMarkup({ src: item.home_logo, alt: item.home_team, className: 'match-page-team-logo', width: 220 })}
                <div class="match-page-team-name">${escapeHtml(item.home_team)}</div>
              </div>
            </div>
            <div class="match-page-scorebox" aria-label="Счёт матча">
              <div class="match-page-scoreline">
                <span class="match-page-score-digit">${homeScore}</span>
                <span class="match-page-score-separator">:</span>
                <span class="match-page-score-digit">${awayScore}</span>
              </div>
            </div>
            <div class="match-page-team match-page-team-away">
              <div class="match-page-team-badge">Гости</div>
              <div class="match-page-team-brand">
                ${renderImageMarkup({ src: item.away_logo, alt: item.away_team, className: 'match-page-team-logo', width: 220 })}
                <div class="match-page-team-name">${escapeHtml(item.away_team)}</div>
              </div>
            </div>
          </div>
        </section>
        <div class="match-page-media" data-match-media data-match-media-default-tab="${escapeHtml(requestedMediaTab)}">
          <div class="match-page-actions" role="tablist" aria-label="Материалы матча">
            <button class="match-page-action is-active" type="button" role="tab" aria-selected="true" data-match-media-tab="stream">Трансляция</button>
            <button class="match-page-action" type="button" role="tab" aria-selected="false" data-match-media-tab="review">Обзор</button>
            <button class="match-page-action" type="button" role="tab" aria-selected="false" data-match-media-tab="interview">Интервью</button>
          </div>
          <div class="match-page-media-stage">
            ${renderMatchMediaPanel('stream', 'Трансляция', item.video)}
            ${renderMatchMediaPanel('review', 'Обзор', item.review_video, {
              title: 'Обзор появится позднее'
            })}
            ${renderMatchMediaPanel('interview', 'Интервью', item.interview_video, {
              title: 'Интервью появится позднее'
            })}
          </div>
        </div>
        <section class="match-headtohead">
          <div class="home-block-head">
            <div>
              <h2 class="section-title home-block-title">Личные встречи</h2>
            </div>
          </div>
          <div class="match-headtohead-list">${headToHeadMarkup}</div>
        </section>
      </div>
    `;
    initMatchMediaTabs(target);
    runAutoFit();
  } catch (e) {
    target.innerHTML = '<div class="container"><div class="card">Не удалось загрузить матч.</div></div>';
  }
}

function renderMatchMediaPanel(key, label, url, emptyState = null) {
  const safeLabel = escapeHtml(label);
  const normalizedUrl = String(url || '').trim();

  return `
    <section class="match-page-media-panel${key === 'stream' ? ' is-active' : ''}" data-match-media-panel="${escapeHtml(key)}" role="tabpanel" aria-label="${safeLabel}" ${key === 'stream' ? '' : 'hidden'}>
      ${normalizedUrl
        ? `<iframe class="match-page-video" src="${escapeHtml(normalizedUrl)}" allowfullscreen></iframe>`
        : emptyState
          ? `<div class="match-page-media-placeholder">
              <div class="match-page-media-placeholder-title">${escapeHtml(emptyState.title || '')}</div>
              ${emptyState.description ? `<p>${escapeHtml(emptyState.description || '')}</p>` : ''}
            </div>`
          : `<div class="match-page-media-empty" aria-hidden="true"></div>`}
    </section>
  `;
}

function initMatchMediaTabs(scope = document) {
  scope.querySelectorAll('[data-match-media]').forEach(block => {
    if (block.dataset.mediaTabsBound === 'true') return;
    block.dataset.mediaTabsBound = 'true';

    const buttons = Array.from(block.querySelectorAll('[data-match-media-tab]'));
    const panels = Array.from(block.querySelectorAll('[data-match-media-panel]'));
    if (!buttons.length || !panels.length) return;
    const requestedTab = String(block.dataset.matchMediaDefaultTab || '').trim();

    function activate(tabKey) {
      buttons.forEach(button => {
        const isActive = button.dataset.matchMediaTab === tabKey;
        button.classList.toggle('is-active', isActive);
        button.setAttribute('aria-selected', isActive ? 'true' : 'false');
      });

      panels.forEach(panel => {
        const isActive = panel.dataset.matchMediaPanel === tabKey;
        panel.classList.toggle('is-active', isActive);
        panel.hidden = !isActive;
      });
    }

    buttons.forEach(button => {
      button.addEventListener('click', () => activate(button.dataset.matchMediaTab));
    });

    const fallbackTab = buttons[0]?.dataset.matchMediaTab || 'stream';
    const initialTab = buttons.some(button => button.dataset.matchMediaTab === requestedTab)
      ? requestedTab
      : fallbackTab;
    activate(initialTab);
  });
}

function renderArchiveTournamentPage() {
  const page = document.querySelector('#archive-tournament-page');
  if (!page) return;

  const params = new URLSearchParams(window.location.search);
  const year = params.get('year') || '2025';
  const archiveFallback = getArchiveTournamentData(year);
  const slug = params.get('slug') || getArchiveTournamentSlug(year);
  const titleNode = page.querySelector('[data-archive-title]');
  const seasonNode = page.querySelector('[data-archive-season]');
  const descriptionNode = page.querySelector('[data-archive-description]');
  const statusNode = page.querySelector('[data-archive-status]');
  const statsNode = page.querySelector('[data-archive-stats]');
  const teamsNode = page.querySelector('[data-archive-teams]');
  const standingsNode = page.querySelector('[data-archive-standings]');
  const matchesNode = page.querySelector('[data-archive-matches]');

  function renderArchiveClubCardContent(item, rank, options = {}) {
    const showLogo = options.showLogo !== false;
    const placeLabel = rank ? `${rank} место` : '';
    const location = formatClubLocation(item);

    return `
      ${showLogo ? `
        <div class="team-logo-wrap archive-team-logo-wrap">
          ${renderImageMarkup({ src: item.logo || 'images/logo-burchalkin.webp', alt: item.name || 'Клуб', className: 'team-logo-img archive-team-logo', width: 240 })}
        </div>
      ` : ''}
      <h3>${escapeHtml(item.name || 'Клуб')}</h3>
      ${location ? `<div class="muted team-country">${escapeHtml(location)}</div>` : ''}
      ${placeLabel ? `<div class="archive-team-place">${escapeHtml(placeLabel)}</div>` : ''}
    `;
  }

  function renderArchiveClubCard(item, rank) {
    const href = item.slug ? `club.html?slug=${encodeURIComponent(item.slug)}` : '';
    const tag = href ? 'a' : 'div';

    return `
      <${tag} class="team-logo-card archive-team-card" ${href ? `href="${escapeHtml(href)}"` : ''}>
        ${renderArchiveClubCardContent(item, rank)}
      </${tag}>
    `;
  }

  function renderArchivePodiumCard(item, rank) {
    const href = item.slug ? `club.html?slug=${encodeURIComponent(item.slug)}` : '';
    const tag = href ? 'a' : 'div';
    const toneClass = rank === 1 ? 'archive-podium-item-gold' : rank === 2 ? 'archive-podium-item-silver' : 'archive-podium-item-bronze';

    return `
      <${tag} class="archive-podium-item ${toneClass}" ${href ? `href="${escapeHtml(href)}"` : ''}>
        <div class="archive-podium-logo-wrap">
          ${renderImageMarkup({ src: item.logo || 'images/logo-burchalkin.webp', alt: item.name || 'Клуб', className: 'archive-podium-logo-img', width: 240 })}
        </div>
        <div class="team-logo-card archive-team-card archive-podium-card ${toneClass}">
          ${renderArchiveClubCardContent(item, rank, { showLogo: false })}
        </div>
      </${tag}>
    `;
  }

  function renderArchiveMatchCard(item) {
    const href = item.id ? `match.html?id=${encodeURIComponent(item.id)}` : '#';
    const meta = joinNonEmpty([
      formatMatchDisplayDate(item.date),
      String(item.time || '').trim(),
      String(item.group || item.round || '').trim()
    ], ' • ');
    return `
      <a class="archive-match-card" href="${escapeHtml(href)}">
        <div class="archive-match-card-top">
          <span>${escapeHtml(meta || 'Архив матча')}</span>
          <span class="archive-match-card-status">${escapeHtml(item.status_label || '')}</span>
        </div>
        <div class="archive-match-card-main">
          <div class="archive-match-card-team">
            ${renderImageMarkup({ src: item.home_logo || 'images/logo-burchalkin.webp', alt: item.home_team || '', className: 'archive-match-card-logo', width: 112 })}
            <span>${escapeHtml(item.home_team || '')}</span>
          </div>
          <div class="archive-match-card-score">${escapeHtml(item.score || '0:0')}</div>
          <div class="archive-match-card-team archive-match-card-team-away">
            ${renderImageMarkup({ src: item.away_logo || 'images/logo-burchalkin.webp', alt: item.away_team || '', className: 'archive-match-card-logo', width: 112 })}
            <span>${escapeHtml(item.away_team || '')}</span>
          </div>
        </div>
      </a>
    `;
  }

  function applyArchiveData(archive, detail = null) {
    const resolvedDetail = detail || archiveFallback.detail || null;
    if (titleNode) titleNode.textContent = archive.title;
    if (seasonNode) seasonNode.textContent = archive.season;
    if (descriptionNode) descriptionNode.textContent = archive.description;
    if (statusNode) statusNode.textContent = archive.status;
    document.title = `${archive.title} - Burchalkin Cup`;

    if (statsNode) {
      const stats = [];
      const clubsCount = Number(resolvedDetail?.clubs_count || getArchiveTournamentClubs(resolvedDetail || {}).length || 0);
      const matchesCount = Number(resolvedDetail?.matches_count || (Array.isArray(resolvedDetail?.matches) ? resolvedDetail.matches.length : 0) || 0);
      if (clubsCount) stats.push(`<div class="archive-stat-chip">${escapeHtml(formatCountLabel(clubsCount, ['клуб', 'клуба', 'клубов']))}</div>`);
      if (matchesCount) stats.push(`<div class="archive-stat-chip">${escapeHtml(formatCountLabel(matchesCount, ['матч', 'матча', 'матчей']))}</div>`);
      stats.push(`<div class="archive-stat-chip">${escapeHtml(archive.season)}</div>`);
      statsNode.innerHTML = stats.join('');
    }

    if (teamsNode) {
      const clubs = getArchiveTournamentClubs(resolvedDetail || {});
      if (!clubs.length) {
        teamsNode.innerHTML = '<div class="archive-empty-state">Состав участников появится позднее.</div>';
      } else {
        const rankedClubs = clubs.map((club, index) => ({
          ...club,
          rank: Number(club.position || index + 1)
        })).sort((left, right) => (left.rank || 999) - (right.rank || 999));
        const podiumCandidates = rankedClubs.filter(club => club.rank >= 1 && club.rank <= 3);
        const podiumOrder = [2, 1, 3]
          .map(rank => podiumCandidates.find(club => club.rank === rank))
          .filter(Boolean);
        const otherClubs = rankedClubs.filter(club => club.rank > 3);

        if (podiumOrder.length === 3) {
          teamsNode.innerHTML = `
            <div class="archive-podium">
              ${podiumOrder.map(club => renderArchivePodiumCard(club, club.rank)).join('')}
            </div>
            ${otherClubs.length ? `
              <div class="archive-team-grid team-logo-grid archive-team-grid-rest">
                ${otherClubs.map(club => renderArchiveClubCard(club, club.rank)).join('')}
              </div>
            ` : ''}
          `;
        } else {
          teamsNode.innerHTML = `
            <div class="archive-team-grid team-logo-grid archive-team-grid-rest">
              ${rankedClubs.map(club => renderArchiveClubCard(club, club.rank)).join('')}
            </div>
          `;
        }
      }
    }

    if (standingsNode) {
      const standings = Array.isArray(resolvedDetail?.standings) ? resolvedDetail.standings : [];
      standingsNode.innerHTML = standings.length
        ? renderStandingsTable(standings)
        : '<div class="archive-empty-state">Турнирная таблица появится позднее.</div>';
    }

    if (matchesNode) {
      const matches = Array.isArray(resolvedDetail?.matches) ? resolvedDetail.matches : [];
      matchesNode.innerHTML = matches.length
        ? matches.map(renderArchiveMatchCard).join('')
        : '<div class="archive-empty-state">Архивные матчи будут опубликованы позднее.</div>';
    }
  }

  applyArchiveData(archiveFallback, null);
  if (!slug) return;

  fetchApi(`/api/tournaments/${encodeURIComponent(slug)}`)
    .then(detail => {
      if (!detail) return;
      const archive = {
        title: detail.name || archiveFallback.title,
        season: joinNonEmpty([
          formatMatchDisplayDate(detail.start_date),
          detail.end_date ? formatMatchDisplayDate(detail.end_date) : ''
        ], ' - ') || archiveFallback.season,
        description: detail.description || archiveFallback.description,
        status: 'Страница архива подключена к данным турнира и готова к наполнению.'
      };
      applyArchiveData(archive, detail);
    })
    .catch(() => {
      applyArchiveData(archiveFallback, null);
    });
}

document.addEventListener('DOMContentLoaded', () => {
  renderUpcomingMatches();
  renderHomeNews();
  renderMultimediaPage();
  renderMatchesPage();
  renderNewsPage();
  renderNewsArticlePage();
  renderResultsList();
  renderResultsMatches();
  renderMatchPageFromJson();
  renderTournamentsGrid();
  renderClubsGrid('#clubs-grid-home', 8);
  renderClubsGrid('#clubs-grid-page');
  renderPartnersForFeaturedTournament();
  renderClubPage();
  renderArchiveTournamentPage();
  runAutoFit();
});


window.addEventListener('resize', () => {
  autoFitTeamNames('.team-name');
});


function initHeroCarousel() {
  const root = document.getElementById('hero-carousel');
  const dotsWrap = document.getElementById('hero-carousel-dots');
  const prevBtn = document.getElementById('hero-carousel-prev');
  const nextBtn = document.getElementById('hero-carousel-next');
  const sideLeft = document.getElementById('hero-carousel-side-left');
  const sideRight = document.getElementById('hero-carousel-side-right');
  const sideLeftImg = document.getElementById('hero-carousel-side-left-img');
  const sideRightImg = document.getElementById('hero-carousel-side-right-img');
  if (!root || !dotsWrap) return;

  const slides = Array.from(root.querySelectorAll('.hero-carousel-slide'));
  const dots = Array.from(dotsWrap.querySelectorAll('.hero-carousel-dot'));
  if (!slides.length) return;

  function hydrateSlide(indexToLoad) {
    const slide = slides[indexToLoad];
    if (!slide) return;
    hydrateDeferredImage(slide.querySelector('img'));
  }

  let index = 0;
  let timer = null;
  let touchStartX = 0;
  let touchDeltaX = 0;
  let isSwiping = false;
  let mouseDownX = 0;
  let mouseDeltaX = 0;
  let isMouseDragging = false;

  function isMobile() {
    return window.innerWidth <= 640;
  }

  function updateSides() {
    const prevIndex = (index - 1 + slides.length) % slides.length;
    const nextIndex = (index + 1) % slides.length;
    const prevImg = slides[prevIndex]?.dataset.bg || '';
    const nextImg = slides[nextIndex]?.dataset.bg || '';
    if (sideLeftImg && prevImg) sideLeftImg.src = getOptimizedImageUrl(prevImg, { width: 960, height: 540, crop: 'fill', gravity: 'auto' });
    if (sideRightImg && nextImg) sideRightImg.src = getOptimizedImageUrl(nextImg, { width: 960, height: 540, crop: 'fill', gravity: 'auto' });
  }

  function show(nextIndex) {
    index = (nextIndex + slides.length) % slides.length;
    hydrateSlide(index);
    hydrateSlide((index + 1) % slides.length);
    slides.forEach((slide, i) => slide.classList.toggle('active', i === index));
    dots.forEach((dot, i) => dot.classList.toggle('active', i === index));
    updateSides();
  }

  function stop() {
    if (timer) clearInterval(timer);
    timer = null;
  }

  function start() {
    stop();
    if (isMobile()) return;
    timer = setInterval(() => show(index + 1), 30000);
  }

  function goPrev() { show(index - 1); start(); }
  function goNext() { show(index + 1); start(); }

  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => { show(i); start(); });
  });

  if (prevBtn) prevBtn.addEventListener('click', goPrev);
  if (nextBtn) nextBtn.addEventListener('click', goNext);

  root.addEventListener('mouseenter', stop);
  root.addEventListener('mouseleave', start);

  root.addEventListener('touchstart', (e) => {
    if (!e.touches || !e.touches.length) return;
    touchStartX = e.touches[0].clientX;
    touchDeltaX = 0;
    isSwiping = true;
    stop();
  }, { passive: true });

  root.addEventListener('touchmove', (e) => {
    if (!isSwiping || !e.touches || !e.touches.length) return;
    touchDeltaX = e.touches[0].clientX - touchStartX;
  }, { passive: true });

  root.addEventListener('touchend', () => {
    if (!isSwiping) return;
    if (touchDeltaX <= -50) goNext();
    else if (touchDeltaX >= 50) goPrev();
    isSwiping = false;
    touchDeltaX = 0;
    start();
  });

  root.addEventListener('touchcancel', () => {
    isSwiping = false;
    touchDeltaX = 0;
    start();
  });

  root.addEventListener('mousedown', (e) => {
    if (e.button !== 0) return;
    isMouseDragging = true;
    mouseDownX = e.clientX;
    mouseDeltaX = 0;
    root.classList.add('is-dragging');
    stop();
  });

  window.addEventListener('mousemove', (e) => {
    if (!isMouseDragging) return;
    mouseDeltaX = e.clientX - mouseDownX;
  });

  window.addEventListener('mouseup', () => {
    if (!isMouseDragging) return;
    root.classList.remove('is-dragging');
    if (mouseDeltaX <= -50) goNext();
    else if (mouseDeltaX >= 50) goPrev();
    else start();
    isMouseDragging = false;
    mouseDeltaX = 0;
  });

  root.addEventListener('dragstart', (e) => e.preventDefault());
  root.setAttribute('tabindex', '0');
  root.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') { e.preventDefault(); goPrev(); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); goNext(); }
  });

  window.addEventListener('resize', start);

  hydrateSlide(index);
  hydrateSlide((index + 1) % slides.length);
  show(0);
  start();
}



function initHomeUpcomingSlider() {
  const track = document.getElementById('home-upcoming-matches');
  const prevBtn = document.getElementById('home-upcoming-prev');
  const nextBtn = document.getElementById('home-upcoming-next');
  if (!track || !prevBtn || !nextBtn) return;

  function getStep() {
    const firstCard = track.querySelector('.upcoming-card');
    if (!firstCard) return Math.max(track.clientWidth * 0.9, 280);
    const style = window.getComputedStyle(track);
    const gap = parseFloat(style.columnGap || style.gap || '18') || 18;
    return firstCard.getBoundingClientRect().width + gap;
  }

  function updateButtons() {
    const maxScroll = Math.max(0, track.scrollWidth - track.clientWidth - 2);
    prevBtn.disabled = track.scrollLeft <= 2;
    nextBtn.disabled = track.scrollLeft >= maxScroll;
  }

  prevBtn.addEventListener('click', () => {
    track.scrollBy({ left: -getStep(), behavior: 'smooth' });
  });

  nextBtn.addEventListener('click', () => {
    track.scrollBy({ left: getStep(), behavior: 'smooth' });
  });

  track.addEventListener('scroll', updateButtons, { passive: true });
  window.addEventListener('resize', updateButtons);

  const observer = new MutationObserver(updateButtons);
  observer.observe(track, { childList: true, subtree: true });

  setTimeout(updateButtons, 80);
}




function initResultsUpcomingSlider() {
  const track = document.getElementById('results-matches');
  const prevBtn = document.getElementById('results-upcoming-prev');
  const nextBtn = document.getElementById('results-upcoming-next');
  if (!track || !prevBtn || !nextBtn) return;

  function getStep() {
    const firstCard = track.querySelector('.upcoming-card');
    if (!firstCard) return Math.max(track.clientWidth * 0.9, 280);
    const style = window.getComputedStyle(track);
    const gap = parseFloat(style.columnGap || style.gap || '18') || 18;
    return firstCard.getBoundingClientRect().width + gap;
  }

  function updateButtons() {
    const maxScroll = Math.max(0, track.scrollWidth - track.clientWidth - 2);
    prevBtn.disabled = track.scrollLeft <= 2;
    nextBtn.disabled = track.scrollLeft >= maxScroll;
  }

  prevBtn.addEventListener('click', () => {
    track.scrollBy({ left: -getStep(), behavior: 'smooth' });
  });

  nextBtn.addEventListener('click', () => {
    track.scrollBy({ left: getStep(), behavior: 'smooth' });
  });

  track.addEventListener('scroll', updateButtons, { passive: true });
  window.addEventListener('resize', updateButtons);

  const observer = new MutationObserver(updateButtons);
  observer.observe(track, { childList: true, subtree: true });

  setTimeout(updateButtons, 80);
}

function initHomeTournamentsSlider() {
  const track = document.getElementById('home-tournaments');
  const prevBtn = document.getElementById('home-tournaments-prev');
  const nextBtn = document.getElementById('home-tournaments-next');
  if (!track || !prevBtn || !nextBtn) return;

  function getStep() {
    const firstCard = track.querySelector('.tournament-card');
    if (!firstCard) return Math.max(track.clientWidth * 0.9, 320);
    const style = window.getComputedStyle(track);
    const gap = parseFloat(style.columnGap || style.gap || '18') || 18;
    return firstCard.getBoundingClientRect().width + gap;
  }

  function updateButtons() {
    const maxScroll = Math.max(0, track.scrollWidth - track.clientWidth - 2);
    prevBtn.disabled = track.scrollLeft <= 2;
    nextBtn.disabled = track.scrollLeft >= maxScroll;
  }

  prevBtn.addEventListener('click', () => {
    track.scrollBy({ left: -getStep(), behavior: 'smooth' });
  });

  nextBtn.addEventListener('click', () => {
    track.scrollBy({ left: getStep(), behavior: 'smooth' });
  });

  track.addEventListener('scroll', updateButtons, { passive: true });
  window.addEventListener('resize', updateButtons);

  const observer = new MutationObserver(updateButtons);
  observer.observe(track, { childList: true, subtree: true });

  setTimeout(updateButtons, 80);
}
