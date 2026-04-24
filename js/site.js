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

function initHeaderCompactState() {
  const header = document.querySelector('.header');
  if (!header) return;

  const currentFile = window.location.pathname.split('/').pop() || 'index.html';
  const isHomePage = document.body.classList.contains('page-home') || currentFile === 'index.html';

  if (!isHomePage) {
    header.classList.add('is-compact');
    return;
  }

  header.classList.remove('is-compact');
}

const CONTACT_MAP_DEFAULTS = {
  google: {
    embed: 'https://www.google.com/maps?q=%D0%A4%D1%83%D1%82%D0%B1%D0%BE%D0%BB%D1%8C%D0%BD%D1%8B%D0%B9%20%D0%BA%D0%BB%D1%83%D0%B1%20%D0%90%D0%BB%D0%BC%D0%B0%D0%B7-%D0%90%D0%BD%D1%82%D0%B5%D0%B9%2059.8498608,30.4842724&z=17&output=embed',
    link: 'https://www.google.com/maps/place/%D0%A4%D1%83%D1%82%D0%B1%D0%BE%D0%BB%D1%8C%D0%BD%D1%8B%D0%B9+%D0%BA%D0%BB%D1%83%D0%B1+%D0%90%D0%BB%D0%BC%D0%B0%D0%B7-%D0%90%D0%BD%D1%82%D0%B5%D0%B9/@59.8498608,30.4842724,17z/data=!3m1!4b1!4m6!3m5!1s0x46962f4223fbcf0f:0x8e7f2c1e2b3db33d!8m2!3d59.8498608!4d30.4842724!16s%2Fg%2F11c7sb8jhn',
    label: 'в Google Maps',
    button: 'Google Maps'
  },
  yandex: {
    embed: 'https://yandex.ru/map-widget/v1/?oid=66772896642&ol=biz&ll=30.484223%2C59.849398&z=16.14',
    link: 'https://yandex.com/maps/-/CPrPVS5A',
    label: 'в Яндекс.Картах',
    button: 'Яндекс.Карты'
  }
};

function ensureContactsMapCard(card) {
  if (!card) return null;
  const frame = card.querySelector('.contact-map-frame iframe');
  if (!frame) return null;

  Object.entries(CONTACT_MAP_DEFAULTS).forEach(([provider, config]) => {
    frame.setAttribute(`data-map-${provider}-embed`, config.embed);
    frame.setAttribute(`data-map-${provider}-link`, config.link);
    frame.setAttribute(`data-map-${provider}-label`, config.label);
  });

  let toggle = card.querySelector('.contact-map-toggle');
  if (!toggle) {
    toggle = document.createElement('div');
    toggle.className = 'contact-map-toggle';
    toggle.setAttribute('role', 'tablist');
    toggle.setAttribute('aria-label', 'Переключение карты');
    toggle.innerHTML = `
      <button type="button" class="contact-map-toggle-btn is-active" data-map-provider="yandex" aria-pressed="true">${CONTACT_MAP_DEFAULTS.yandex.button}</button>
      <button type="button" class="contact-map-toggle-btn" data-map-provider="google" aria-pressed="false">${CONTACT_MAP_DEFAULTS.google.button}</button>
    `;
    const frameWrap = card.querySelector('.contact-map-frame');
    if (frameWrap) {
      card.insertBefore(toggle, frameWrap);
    }
  }

  let note = card.querySelector('.contact-map-note');
  if (!note) {
    note = document.createElement('p');
    note.className = 'contact-map-note';
    note.innerHTML = `Если карта не загрузилась, откройте адрес напрямую: <a href="${CONTACT_MAP_DEFAULTS.yandex.link}" target="_blank" rel="noopener noreferrer">${CONTACT_MAP_DEFAULTS.yandex.label}</a>.`;
    card.appendChild(note);
  }

  return card;
}

function initContactsMapToggle(scope = document) {
  const card = ensureContactsMapCard(scope.querySelector('.contact-map-card'));
  if (!card) return;
  const buttons = Array.from(card.querySelectorAll('.contact-map-toggle-btn'));
  const frame = card.querySelector('.contact-map-frame iframe');
  const noteLink = card.querySelector('.contact-map-note a');
  if (!buttons.length || !frame) return;
  if (card.dataset.mapToggleBound === 'true') return;
  card.dataset.mapToggleBound = 'true';

  function applyProvider(provider) {
    if (!provider) return;
    const embed = frame.getAttribute(`data-map-${provider}-embed`);
    if (embed) {
      frame.setAttribute('src', embed);
    }
    const link = frame.getAttribute(`data-map-${provider}-link`);
    const label = frame.getAttribute(`data-map-${provider}-label`);
    if (noteLink && link) {
      noteLink.setAttribute('href', link);
      if (label) noteLink.textContent = label;
    }
    buttons.forEach((btn) => {
      const isActive = btn.getAttribute('data-map-provider') === provider;
      btn.classList.toggle('is-active', isActive);
      btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });
  }

  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      applyProvider(btn.getAttribute('data-map-provider'));
    });
  });

  applyProvider('yandex');
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

let featuredTournamentSettingsPromise = null;

async function loadFeaturedTournamentSettings() {
  if (!featuredTournamentSettingsPromise) {
    featuredTournamentSettingsPromise = fetchApi('/api/tournaments')
      .then((tournaments) => {
        if (!Array.isArray(tournaments) || !tournaments.length) return null;
        return tournaments.find(item => item && item.is_featured) || tournaments[0] || null;
      })
      .catch(() => null);
  }

  return featuredTournamentSettingsPromise;
}

function isTruthyFlag(value, fallback = false) {
  if (value === true || value === 1) return true;
  if (value === false || value === 0) return false;
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (['true', '1', 'yes', 'on'].includes(normalized)) return true;
    if (['false', '0', 'no', 'off'].includes(normalized)) return false;
  }
  return fallback;
}

async function initTournamentCountdown() {
  const root = document.querySelector('[data-countdown-target]');
  if (!root) return;
  const section = root.closest('.countdown-section');
  const featuredTournament = await loadFeaturedTournamentSettings();

  if (featuredTournament && isTruthyFlag(featuredTournament.countdown_enabled, true) === false) {
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
  initHeaderCompactState();
  initContactsMapToggle();
  initTournamentCountdown();
  upgradeStaticImagesForCloudinary();
});

document.addEventListener('error', handleCloudinaryImageFallback, true);


async function renderStandings(selector) {
  const target = document.querySelector(selector);
  if (!target) return;
  target.setAttribute('aria-busy', 'true');
  target.innerHTML = renderStandingsLoadingCard();
  const [standingsData, matchesData, playoffData] = await Promise.all([
    fetchApi('/api/standings'),
    fetchApi('/api/matches'),
    fetchApi('/api/playoff')
  ]);

  try {
    const groupedStandings = buildGroupedStandings(matchesData, standingsData);
    target.innerHTML = renderStandingsSection({
      groupedStandings,
      standings: Array.isArray(standingsData) ? standingsData : [],
      matches: Array.isArray(matchesData) ? matchesData : [],
      playoff: playoffData
    });
    initStandingsViewSwitch(target);
    if (window.BCI18N?.translateTextTree) {
      window.BCI18N.translateTextTree(target);
    }
    if (typeof runAutoFit === 'function') {
      runAutoFit();
    }
    target.setAttribute('aria-busy', 'false');
  } catch (error) {
    console.error('Failed to render standings block.', error);
    target.innerHTML = '<div class="standings-card"><div style="padding:18px">Не удалось загрузить таблицу.</div></div>';
    target.setAttribute('aria-busy', 'false');
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
      <div class="standings-scroll">
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
    </div>
  `;
}

function normalizeStandingsGroupKey(value) {
  const raw = String(value || '').trim().toLowerCase();
  if (!raw) return '';

  const compact = raw.replace(/\s+/g, '');
  const lastChar = compact.slice(-1);
  if (lastChar === 'a' || lastChar === 'а') return 'A';
  if (lastChar === 'b' || lastChar === 'в') return 'B';

  return '';
}

function getStandingsGroupLabel(groupKey) {
  return groupKey ? `Группа ${groupKey}` : '';
}

function inferTeamSlug(item = {}) {
  const explicitSlug = String(item.slug || item.team_slug || '').trim();
  if (explicitSlug) return explicitSlug;

  const logoPath = String(item.logo || item.home_logo || item.away_logo || '').trim();
  const logoSlugMatch = logoPath.match(/team-([a-z0-9-]+)\.(?:png|jpe?g|webp|svg)$/i);
  return logoSlugMatch?.[1] ? logoSlugMatch[1].toLowerCase() : '';
}

function parseMatchScore(match = {}) {
  const explicitHome = Number(match.home_score);
  const explicitAway = Number(match.away_score);
  if (Number.isFinite(explicitHome) && Number.isFinite(explicitAway)) {
    return { home: explicitHome, away: explicitAway };
  }

  const scoreLabel = String(match.score || '').trim();
  const scoreMatch = scoreLabel.match(/(\d+)\s*[:\-]\s*(\d+)/);
  if (!scoreMatch) return null;

  return {
    home: Number(scoreMatch[1]),
    away: Number(scoreMatch[2])
  };
}

function compareStandingsRows(a, b) {
  const pointsDiff = Number(b.points || 0) - Number(a.points || 0);
  if (pointsDiff !== 0) return pointsDiff;

  const goalDiffA = Number(a.goals_for || 0) - Number(a.goals_against || 0);
  const goalDiffB = Number(b.goals_for || 0) - Number(b.goals_against || 0);
  if (goalDiffB !== goalDiffA) return goalDiffB - goalDiffA;

  const goalsForDiff = Number(b.goals_for || 0) - Number(a.goals_for || 0);
  if (goalsForDiff !== 0) return goalsForDiff;

  return String(a.team || '').localeCompare(String(b.team || ''), 'ru');
}

function createStandingsTeamSeed(team = {}, fallback = {}) {
  return {
    slug: inferTeamSlug(team) || inferTeamSlug(fallback),
    team: String(team.team || team.name || fallback.team || fallback.name || '').trim(),
    logo: String(team.logo || fallback.logo || '').trim(),
    city: String(team.city || fallback.city || '').trim(),
    country: String(team.country || fallback.country || '').trim(),
    played: 0,
    won: 0,
    drawn: 0,
    lost: 0,
    goals_for: 0,
    goals_against: 0,
    points: 0
  };
}

function upsertGroupedStandingsTeam(bucket, groupKey, clubSeed = {}) {
  const key = String(inferTeamSlug(clubSeed) || clubSeed.team || clubSeed.name || '').trim().toLowerCase();
  if (!key) return null;

  if (!bucket.has(key)) {
    bucket.set(key, createStandingsTeamSeed(clubSeed));
  } else {
    const current = bucket.get(key);
    current.slug = current.slug || inferTeamSlug(clubSeed);
    current.logo = current.logo || String(clubSeed.logo || '').trim();
    current.city = current.city || String(clubSeed.city || '').trim();
    current.country = current.country || String(clubSeed.country || '').trim();
    current.team = current.team || String(clubSeed.team || clubSeed.name || '').trim();
  }

  const record = bucket.get(key);
  record.group = getStandingsGroupLabel(groupKey);
  return record;
}

function buildGroupedStandingsFromRows(rows = []) {
  const groups = new Map();

  (Array.isArray(rows) ? rows : []).forEach(item => {
    const groupKey = normalizeStandingsGroupKey(item.group);
    if (!groupKey) return;

    if (!groups.has(groupKey)) groups.set(groupKey, []);
    groups.get(groupKey).push({
      ...item,
      slug: inferTeamSlug(item),
      team: item.team || item.name || '',
      logo: item.logo || '',
      city: item.city || '',
      country: item.country || '',
      group: getStandingsGroupLabel(groupKey),
      goals_for: Number(String(item.goals || '').split('-')[0]) || Number(item.goals_for || 0),
      goals_against: Number(String(item.goals || '').split('-')[1]) || Number(item.goals_against || 0)
    });
  });

  return Array.from(groups.entries())
    .sort((a, b) => String(a[0]).localeCompare(String(b[0])))
    .map(([groupKey, groupRows]) => ({
      key: groupKey,
      label: getStandingsGroupLabel(groupKey),
      rows: groupRows
        .sort(compareStandingsRows)
        .map((row, index) => ({
          ...row,
          position: index + 1,
          goals: formatStandingGoals(row)
        }))
    }));
}

function buildGroupedStandingsFromMatches(matches = [], fallbackStandings = []) {
  const buckets = new Map([
    ['A', new Map()],
    ['B', new Map()]
  ]);
  let hasGroupMatches = false;

  (Array.isArray(matches) ? matches : []).forEach(match => {
    const groupKey = normalizeStandingsGroupKey(match.group || match.stage || match.round);
    if (!groupKey || !buckets.has(groupKey)) return;

    hasGroupMatches = true;
    const fallbackHome = (Array.isArray(fallbackStandings) ? fallbackStandings : []).find(item =>
      inferTeamSlug(item) === inferTeamSlug({ slug: match.home_team_slug, logo: match.home_logo })
    ) || {};
    const fallbackAway = (Array.isArray(fallbackStandings) ? fallbackStandings : []).find(item =>
      inferTeamSlug(item) === inferTeamSlug({ slug: match.away_team_slug, logo: match.away_logo })
    ) || {};

    const groupBucket = buckets.get(groupKey);
    const home = upsertGroupedStandingsTeam(groupBucket, groupKey, {
      ...fallbackHome,
      slug: match.home_team_slug || fallbackHome.slug,
      team: match.home_team || fallbackHome.team || fallbackHome.name,
      logo: match.home_logo || fallbackHome.logo,
      city: match.home_city || fallbackHome.city,
      country: match.home_country || fallbackHome.country
    });
    const away = upsertGroupedStandingsTeam(groupBucket, groupKey, {
      ...fallbackAway,
      slug: match.away_team_slug || fallbackAway.slug,
      team: match.away_team || fallbackAway.team || fallbackAway.name,
      logo: match.away_logo || fallbackAway.logo,
      city: match.away_city || fallbackAway.city,
      country: match.away_country || fallbackAway.country
    });

    if (!home || !away) return;
    if (String(match.status || '').trim().toLowerCase() !== 'done') return;

    const parsedScore = parseMatchScore(match);
    if (!parsedScore) return;

    home.played += 1;
    away.played += 1;
    home.goals_for += parsedScore.home;
    home.goals_against += parsedScore.away;
    away.goals_for += parsedScore.away;
    away.goals_against += parsedScore.home;

    if (parsedScore.home > parsedScore.away) {
      home.won += 1;
      away.lost += 1;
      home.points += 3;
    } else if (parsedScore.home < parsedScore.away) {
      away.won += 1;
      home.lost += 1;
      away.points += 3;
    } else {
      home.drawn += 1;
      away.drawn += 1;
      home.points += 1;
      away.points += 1;
    }
  });

  if (!hasGroupMatches) {
    return buildGroupedStandingsFromRows(fallbackStandings);
  }

  return Array.from(buckets.entries())
    .map(([groupKey, bucket]) => ({
      key: groupKey,
      label: getStandingsGroupLabel(groupKey),
      rows: Array.from(bucket.values())
        .sort(compareStandingsRows)
        .map((row, index) => ({
          ...row,
          position: index + 1,
          goals: `${row.goals_for}-${row.goals_against}`
        }))
    }))
    .filter(group => group.rows.length);
}

function buildGroupedStandings(matches = [], fallbackStandings = []) {
  const groupedFromMatches = buildGroupedStandingsFromMatches(matches, fallbackStandings);
  if (groupedFromMatches.length) return groupedFromMatches;
  return buildGroupedStandingsFromRows(fallbackStandings);
}

function renderGroupedStandings(groups = []) {
  return `
    <div class="group-standings-stack">
      ${groups.map(group => `
        <section class="group-standings-block">
          <div class="group-standings-head">
            <h3 class="group-standings-title">${escapeHtml(group.label)}</h3>
          </div>
          ${renderStandingsTable(group.rows)}
        </section>
      `).join('')}
    </div>
  `;
}

function buildPlayoffSeed(groups = [], groupKey, position) {
  const group = groups.find(item => item.key === groupKey);
  const team = Array.isArray(group?.rows) ? group.rows[position - 1] : null;

  if (team) {
    return {
      type: 'team',
      seed: `${groupKey}${position}`,
      label: team.team,
      logo: team.logo,
      slug: team.slug || team.team_slug || ''
    };
  }

  return {
    type: 'placeholder',
    seed: `${groupKey}${position}`,
    label: `${position} место группы ${groupKey}`
  };
}

function buildPlayoffProgressSeed(seed, label) {
  return {
    type: 'placeholder',
    seed,
    label
  };
}

function buildPlayoffGenericSeed(index) {
  return {
    type: 'placeholder',
    seed: `T${index}`,
    label: `Команда ${index}`,
    logo: 'images/logo-burchalkin.webp'
  };
}

function buildDefaultPlayoffRowsClient() {
  return [
    {
      bracket_group: 'top',
      round_group: 'semifinal',
      match_key: 'top_sf1',
      sort_order: 1,
      label: 'Полуфинал 1–4 №1',
      home_team: 'Команда 1',
      home_team_slug: 'placeholder-team-1',
      home_logo: 'images/logo-burchalkin.webp',
      away_team: 'Команда 2',
      away_team_slug: 'placeholder-team-2',
      away_logo: 'images/logo-burchalkin.webp',
      home_score: 0,
      away_score: 0,
    },
    {
      bracket_group: 'top',
      round_group: 'semifinal',
      match_key: 'top_sf2',
      sort_order: 2,
      label: 'Полуфинал 1–4 №2',
      home_team: 'Команда 3',
      home_team_slug: 'placeholder-team-3',
      home_logo: 'images/logo-burchalkin.webp',
      away_team: 'Команда 4',
      away_team_slug: 'placeholder-team-4',
      away_logo: 'images/logo-burchalkin.webp',
      home_score: 0,
      away_score: 0,
    },
    {
      bracket_group: 'top',
      round_group: 'final',
      match_key: 'top_final',
      sort_order: 1,
      label: 'Матч за 1 место',
      home_team: 'Победитель 1–4 №1',
      away_team: 'Победитель 1–4 №2',
      home_score: 0,
      away_score: 0,
    },
    {
      bracket_group: 'top',
      round_group: 'final',
      match_key: 'top_third',
      sort_order: 2,
      label: 'Матч за 3 место',
      home_team: 'Проигравший 1–4 №1',
      away_team: 'Проигравший 1–4 №2',
      home_score: 0,
      away_score: 0,
    },
    {
      bracket_group: 'placement',
      round_group: 'semifinal',
      match_key: 'placement_sf1',
      sort_order: 1,
      label: 'Полуфинал 5–8 №1',
      home_team: 'Команда 5',
      home_team_slug: 'placeholder-team-5',
      home_logo: 'images/logo-burchalkin.webp',
      away_team: 'Команда 6',
      away_team_slug: 'placeholder-team-6',
      away_logo: 'images/logo-burchalkin.webp',
      home_score: 0,
      away_score: 0,
    },
    {
      bracket_group: 'placement',
      round_group: 'semifinal',
      match_key: 'placement_sf2',
      sort_order: 2,
      label: 'Полуфинал 5–8 №2',
      home_team: 'Команда 7',
      home_team_slug: 'placeholder-team-7',
      home_logo: 'images/logo-burchalkin.webp',
      away_team: 'Команда 8',
      away_team_slug: 'placeholder-team-8',
      away_logo: 'images/logo-burchalkin.webp',
      home_score: 0,
      away_score: 0,
    },
    {
      bracket_group: 'placement',
      round_group: 'final',
      match_key: 'placement_fifth',
      sort_order: 1,
      label: 'Матч за 5 место',
      home_team: 'Победитель 5–8 №1',
      away_team: 'Победитель 5–8 №2',
      home_score: 0,
      away_score: 0,
    },
    {
      bracket_group: 'placement',
      round_group: 'final',
      match_key: 'placement_seventh',
      sort_order: 2,
      label: 'Матч за 7 место',
      home_team: 'Проигравший 5–8 №1',
      away_team: 'Проигравший 5–8 №2',
      home_score: 0,
      away_score: 0,
    }
  ];
}

function sortPlayoffRows(rows = []) {
  return [...rows].sort((left, right) => {
    const leftBracketWeight = String(left?.bracket_group || '') === 'top' ? 0 : 1;
    const rightBracketWeight = String(right?.bracket_group || '') === 'top' ? 0 : 1;
    if (leftBracketWeight !== rightBracketWeight) return leftBracketWeight - rightBracketWeight;

    const leftRoundWeight = String(left?.round_group || '') === 'semifinal' ? 0 : 1;
    const rightRoundWeight = String(right?.round_group || '') === 'semifinal' ? 0 : 1;
    if (leftRoundWeight !== rightRoundWeight) return leftRoundWeight - rightRoundWeight;

    return Number(left?.sort_order || 0) - Number(right?.sort_order || 0);
  });
}

function createPlayoffSeedFromRow(row = {}, side = 'home') {
  const isHome = side === 'home';
  const label = String(isHome ? row.home_team : row.away_team || '').trim();
  const logo = String(isHome ? row.home_logo : row.away_logo || '').trim();
  const slug = String(isHome ? row.home_team_slug : row.away_team_slug || '').trim();
  const isPlaceholderTeam = /^placeholder-team-\d+$/i.test(slug);

  return {
    type: slug && !isPlaceholderTeam ? 'team' : 'placeholder',
    label,
    logo,
    slug
  };
}

function createPlayoffMatchFromRow(row = {}, fallbackLabel = '') {
  return {
    label: String(row?.label || fallbackLabel || '').trim(),
    home: createPlayoffSeedFromRow(row, 'home'),
    away: createPlayoffSeedFromRow(row, 'away'),
    homeScore: row?.home_score ?? 0,
    awayScore: row?.away_score ?? 0,
  };
}

function renderPlayoffSeed(seed = {}, score = '0') {
  const clubUrl = getClubPageUrl({ slug: seed.slug, logo: seed.logo });
  const seedClasses = [
    'upcoming-team-row',
    'playoff-seed-row',
    clubUrl && seed.type === 'team' ? 'playoff-seed-row-link' : '',
    seed.type === 'placeholder' ? 'is-placeholder' : '',
    seed.logo ? 'has-logo' : 'no-logo'
  ].filter(Boolean).join(' ');
  const body = `
    <div class="team-left">
      ${seed.logo
        ? renderImageMarkup({ src: seed.logo, alt: seed.label || '', width: 72, className: 'team-logo' })
        : '<span class="playoff-seed-logo-fallback"></span>'}
      <span class="team-name playoff-team-name">${escapeHtml(seed.label || '—')}</span>
    </div>
    <div class="team-score playoff-team-score">${escapeHtml(score)}</div>
  `;

  if (clubUrl && seed.type === 'team') {
    return `<a class="${seedClasses}" href="${escapeHtml(clubUrl)}">${body}</a>`;
  }

  return `<div class="${seedClasses}">${body}</div>`;
}

function renderPlayoffMatch(match = {}) {
  const normalizeScore = (value) => (value === undefined || value === null || value === '' ? '0' : String(value));
  const homeScore = normalizeScore(match.homeScore);
  const awayScore = normalizeScore(match.awayScore);

  return `
    <article class="playoff-match-card upcoming-card playoff-upcoming-card">
      <div class="upcoming-header playoff-card-header">
        <div>
          <div class="playoff-match-label">${escapeHtml(match.label || '')}</div>
        </div>
      </div>
      <div class="upcoming-teams playoff-upcoming-teams">
        ${renderPlayoffSeed(match.home, homeScore)}
        ${renderPlayoffSeed(match.away, awayScore)}
      </div>
    </article>
  `;
}

function renderPlayoffBandGrid(config = {}) {
  const roundOne = Array.isArray(config.roundOne) ? config.roundOne : [];
  const roundTwo = Array.isArray(config.roundTwo) ? config.roundTwo : [];

  return `
    <section class="playoff-band-grid">
      <div class="playoff-band-grid-label">${escapeHtml(config.title || '')}</div>
      <div class="playoff-band-grid-stage playoff-band-grid-stage-semis">
        ${roundOne.map((match, index) => `
          <div class="playoff-band-grid-slot playoff-band-grid-slot-semi-${index + 1}">
            ${renderPlayoffMatch(match)}
          </div>
        `).join('')}
      </div>
      <div class="playoff-band-grid-connector" aria-hidden="true"></div>
      <div class="playoff-band-grid-stage playoff-band-grid-stage-finals">
        ${roundTwo.map((match, index) => `
          <div class="playoff-band-grid-slot playoff-band-grid-slot-final-${index + 1}">
            ${renderPlayoffMatch(match)}
          </div>
        `).join('')}
      </div>
    </section>
  `;
}

function renderPlayoffBracket(playoffRows = []) {
  const rows = sortPlayoffRows(Array.isArray(playoffRows) && playoffRows.length ? playoffRows : buildDefaultPlayoffRowsClient());
  const getRow = (bracketGroup, roundGroup, sortOrder) =>
    rows.find(row =>
      String(row?.bracket_group || '') === bracketGroup
      && String(row?.round_group || '') === roundGroup
      && Number(row?.sort_order || 0) === sortOrder
    ) || null;

  const topBracket = {
    title: 'Плей-офф за 1–4 места',
    roundOneTitle: 'Полуфиналы',
    roundTwoTitle: 'Финалы',
    roundOne: [
      createPlayoffMatchFromRow(getRow('top', 'semifinal', 1), 'Полуфинал 1–4 №1'),
      createPlayoffMatchFromRow(getRow('top', 'semifinal', 2), 'Полуфинал 1–4 №2')
    ],
    roundTwo: [
      createPlayoffMatchFromRow(getRow('top', 'final', 1), 'Матч за 1 место'),
      createPlayoffMatchFromRow(getRow('top', 'final', 2), 'Матч за 3 место')
    ]
  };

  const placementBracket = {
    title: 'Плей-офф за 5–8 места',
    roundOneTitle: 'Полуфиналы',
    roundTwoTitle: 'Финалы',
    roundOne: [
      createPlayoffMatchFromRow(getRow('placement', 'semifinal', 1), 'Полуфинал 5–8 №1'),
      createPlayoffMatchFromRow(getRow('placement', 'semifinal', 2), 'Полуфинал 5–8 №2')
    ],
    roundTwo: [
      createPlayoffMatchFromRow(getRow('placement', 'final', 1), 'Матч за 5 место'),
      createPlayoffMatchFromRow(getRow('placement', 'final', 2), 'Матч за 7 место')
    ]
  };

  return `
    <div class="playoff-board">
      <div class="playoff-board-head">
        <h3 class="playoff-board-title">Сетка плей-офф</h3>
      </div>
      <div class="playoff-board-shell">
        <div class="playoff-board-shell-inner">
          <div class="playoff-board-grid-head">
            <div class="playoff-board-grid-col-title playoff-board-grid-col-title-semis">${escapeHtml(topBracket.roundOneTitle || '')}</div>
            <div class="playoff-board-grid-head-spacer" aria-hidden="true"></div>
            <div class="playoff-board-grid-col-title">${escapeHtml(topBracket.roundTwoTitle || '')}</div>
          </div>
          <div class="playoff-board-grid">
            ${renderPlayoffBandGrid(topBracket)}
            ${renderPlayoffBandGrid(placementBracket)}
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderStandingsSection({ groupedStandings = [], standings = [], matches = [], playoff = [] } = {}) {
  const hasGroupedStandings = Array.isArray(groupedStandings) && groupedStandings.length > 0;
  const hasOverallStandings = Array.isArray(standings) && standings.length > 0;
  const hasMatches = Array.isArray(matches) && matches.length > 0;
  if (!hasGroupedStandings && !hasOverallStandings && !hasMatches) {
    return '<div class="standings-card"><div style="padding:18px">Не удалось загрузить таблицу.</div></div>';
  }
  const tableMarkup = hasGroupedStandings
    ? renderGroupedStandings(groupedStandings)
    : renderStandingsTable(standings);
  const playoffMarkup = renderPlayoffBracket(playoff);

  return `
    <div class="standings-panel">
      <div class="standings-switch" role="tablist" aria-label="Выбор формата турнира">
        <button class="standings-switch-btn is-active" type="button" data-standings-switch="table" aria-selected="true">Турнирная таблица</button>
        <button class="standings-switch-btn" type="button" data-standings-switch="playoff" aria-selected="false">Сетка плей-офф</button>
      </div>
      <div class="standings-view is-active" data-standings-view="table">
        ${tableMarkup}
      </div>
      <div class="standings-view" data-standings-view="playoff" hidden>
        ${playoffMarkup}
      </div>
    </div>
  `;
}

function initStandingsViewSwitch(root) {
  const buttons = Array.from(root.querySelectorAll('[data-standings-switch]'));
  const views = Array.from(root.querySelectorAll('[data-standings-view]'));
  if (!buttons.length || !views.length) return;
  if (root.dataset.standingsSwitchBound === 'true') {
    const activeButton = buttons.find(button => button.classList.contains('is-active'));
    const initialView = activeButton?.dataset.standingsSwitch || 'table';
    views.forEach(view => {
      const isActive = view.dataset.standingsView === initialView;
      view.classList.toggle('is-active', isActive);
      view.hidden = !isActive;
    });
    return;
  }
  root.dataset.standingsSwitchBound = 'true';

  const setActiveView = (nextView) => {
    buttons.forEach(button => {
      const isActive = button.dataset.standingsSwitch === nextView;
      button.classList.toggle('is-active', isActive);
      button.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });

    views.forEach(view => {
      const isActive = view.dataset.standingsView === nextView;
      view.classList.toggle('is-active', isActive);
      view.hidden = !isActive;
    });
  };

  buttons.forEach(button => {
    button.addEventListener('click', () => {
      setActiveView(button.dataset.standingsSwitch || 'table');
    });
  });

  setActiveView('table');
}

document.addEventListener('DOMContentLoaded', () => {
  initResultsUpcomingSlider();
  initHomeUpcomingSlider();
  initHomeNewsSlider();
  initHomeTournamentsSlider();
  initHeroCarousel();
  renderStandings('#home-standings');
  renderStandings('#results-standings');
});


function escapeHtml(str) {
  return String(str ?? '').replace(/[&<>"]/g, s => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[s]));
}

function translateRuntimeText(value) {
  const text = String(value ?? '');
  const translate = window.BCI18N?.translateString;
  return typeof translate === 'function' ? translate(text) : text;
}

const TRANSPARENT_IMAGE_PLACEHOLDER = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==';
const APP_CACHE_VERSION = '2026-04-21-cache-sync-v1';
const NEWS_IMAGE_FALLBACKS = [
  { id: 1, slug: 'applications-open', src: 'images/news-1.webp' },
  { id: 2, slug: 'first-day-schedule-published', src: 'images/news-2.webp' },
  { id: 3, slug: 'playoff-bracket-coming-soon', src: 'images/news-3.webp' }
];
const NEWS_ARTICLE_ENRICHMENTS = {
  'promo-rolik-viii-kubka-burchalkina': {
    video_url: 'https://res.cloudinary.com/dcqvo4aoj/video/upload/v1776365062/burcup/news/promo-rolik-viii-kubka-burchalkina/videos/burchalkin-cup-2026-teaser-1920x1080-2-1776365003533.mp4'
  }
};
const CLUB_LOCATION_OVERRIDES = {
  palmeiras: {
    city: 'Сан-Паулу',
    country: 'Бразилия'
  }
};
const CURRENT_CLUB_SLUGS = new Set([
  'almaz-antey',
  'zenit',
  'palmeiras',
  'crvena-zvezda',
  'fenerbahce',
  'dinamo-minsk',
  'san-lorenzo',
  'cruz-azul'
]);
const CLUB_PROFILE_OVERRIDES = {
  'almaz-antey': {
    participationYears: [2016, 2017, 2018, 2019, 2023, 2024, 2025, 2026],
    summary: 'Клуб из Санкт‑Петербурга и один из главных символов Кубка Бурчалкина. Команда регулярно участвует в турнире и хорошо знакома домашней публике.'
  },
  zenit: {
    participationYears: [2016, 2017, 2018, 2019, 2023, 2024, 2025, 2026],
    summary: 'Представитель Санкт‑Петербурга и один из самых узнаваемых участников международного состава турнира. Команда часто входит в число претендентов на высокие места.'
  },
  'dinamo-moscow': {
    participationYears: [2016],
    summary: 'Московский клуб, вошедший в число участников одного из первых международных розыгрышей Кубка Бурчалкина.'
  },
  hjk: {
    participationYears: [2016],
    summary: 'Клуб из Хельсинки, представлявший Финляндию в международной истории турнира.'
  },
  villarreal: {
    participationYears: [2016, 2017, 2018, 2019],
    summary: 'Испанский клуб из Вильярреала, входивший в международный состав ранних розыгрышей турнира.'
  },
  victoria: {
    participationYears: [2016],
    summary: 'Португальский клуб из Гимарайнша, участвовавший в одном из первых международных розыгрышей турнира.'
  },
  lokomotiv: {
    participationYears: [2016, 2017],
    summary: 'Клуб из Москвы, принимавший участие в ранних сезонах Кубка Бурчалкина.'
  },
  cska: {
    participationYears: [2016, 2017, 2018, 2019, 2023],
    summary: 'Московский клуб, неоднократно входивший в состав участников Кубка Бурчалкина в разные годы.'
  },
  brodarac: {
    participationYears: [2016],
    summary: 'Сербский клуб из Белграда, участвовавший в раннем международном составе Кубка Бурчалкина.'
  },
  mtk: {
    participationYears: [2017, 2018, 2019],
    summary: 'Клуб из Будапешта, представлявший Венгрию на Кубке Бурчалкина в нескольких сезонах.'
  },
  partizan: {
    participationYears: [2017],
    summary: 'Клуб из Белграда, пополнивший сербское представительство в истории турнира.'
  },
  'boca-juniors': {
    participationYears: [2018, 2019],
    summary: 'Аргентинский клуб из Буэнос‑Айреса, участвовавший в международных розыгрышах турнира в конце 2010-х.'
  },
  krasnodar: {
    participationYears: [2018, 2019, 2023],
    summary: 'Клуб из Краснодара, не раз появлявшийся в составе участников турнира и его истории прошлых розыгрышей.'
  },
  roma: {
    participationYears: [2018],
    summary: 'Клуб из Рима, представивший Италию в истории международных розыгрышей Кубка Бурчалкина.'
  },
  atalanta: {
    participationYears: [2019],
    summary: 'Итальянский клуб из Бергамо, оставивший след в истории одного из европейских розыгрышей турнира.'
  },
  palmeiras: {
    participationYears: [2023, 2024, 2025, 2026],
    summary: 'Бразильский клуб из Сан‑Паулу, который добавляет турниру южноамериканский стиль и темп. Постоянный участник последних розыгрышей.'
  },
  santos: {
    participationYears: [2023],
    summary: 'Бразильский клуб из Сантуса, вошедший в число участников турнира в одном из последних сезонов.'
  },
  sepahan: {
    participationYears: [2023, 2024],
    summary: 'Иранский клуб из Исфахана, участвовавший в турнире в середине современной серии розыгрышей.'
  },
  'crvena-zvezda': {
    participationYears: [2023, 2024, 2025, 2026],
    summary: 'Сербский клуб из Белграда, стабильно представленный в международной географии турнира последних лет.'
  },
  fenerbahce: {
    participationYears: [2024, 2025, 2026],
    summary: 'Клуб из Стамбула, расширивший международную карту Кубка Бурчалкина в новых розыгрышах.'
  },
  'dinamo-minsk': {
    participationYears: [2024, 2025, 2026],
    summary: 'Белорусский клуб из Минска, регулярно участвующий в турнире последних сезонов и хорошо знакомый зрителям по матчам группового этапа.'
  },
  kairat: {
    participationYears: [2024, 2025],
    summary: 'Клуб из Алматы, выступавший в международном составе турнира до перехода в раздел участников прошлых розыгрышей.'
  },
  'san-lorenzo': {
    participationYears: [2025, 2026],
    summary: 'Аргентинский клуб из Буэнос‑Айреса, ставший частью международного состава Кубка Бурчалкина в последних сезонах.'
  },
  'cruz-azul': {
    participationYears: [2026],
    summary: 'Клуб из Мехико, представляющий Мексику в составе участников нового цикла турнира.'
  }
};
const CLUB_SEASON_RESULTS = {
  'almaz-antey': {
    2016: '7 место',
    2017: '3 место',
    2018: '5 место',
    2019: '4 место',
    2023: '5 место',
    2024: '3 место',
    2025: '1 место',
    2026: 'Сезон идёт'
  },
  zenit: {
    2016: '2 место',
    2017: '7 место',
    2018: '3 место',
    2019: '2 место',
    2023: '1 место',
    2024: '2 место',
    2025: '2 место',
    2026: 'Сезон идёт'
  },
  'dinamo-moscow': {
    2016: '4 место'
  },
  hjk: {
    2016: '5 место'
  },
  villarreal: {
    2016: '1 место',
    2017: '1 место',
    2018: '1 место',
    2019: '1 место'
  },
  victoria: {
    2017: '4 место'
  },
  lokomotiv: {
    2016: '6 место',
    2017: '6 место'
  },
  cska: {
    2016: '3 место',
    2017: '5 место',
    2018: '8 место',
    2019: '5 место',
    2023: '7 место'
  },
  brodarac: {
    2016: '8 место'
  },
  mtk: {
    2017: '8 место',
    2018: '7 место',
    2019: '7 место'
  },
  partizan: {
    2017: '2 место'
  },
  'boca-juniors': {
    2018: '2 место',
    2019: '3 место'
  },
  roma: {
    2018: '4 место'
  },
  krasnodar: {
    2018: '6 место',
    2019: '8 место',
    2023: '4 место'
  },
  atalanta: {
    2019: '6 место'
  },
  palmeiras: {
    2023: '2 место',
    2024: '1 место',
    2025: '3 место',
    2026: 'Сезон идёт'
  },
  santos: {
    2023: '6 место'
  },
  sepahan: {
    2023: '8 место',
    2024: '8 место'
  },
  'crvena-zvezda': {
    2023: '3 место',
    2024: '4 место',
    2025: '4 место',
    2026: 'Сезон идёт'
  },
  fenerbahce: {
    2024: '6 место',
    2025: '6 место',
    2026: 'Сезон идёт'
  },
  'dinamo-minsk': {
    2024: '7 место',
    2025: '7 место',
    2026: 'Сезон идёт'
  },
  kairat: {
    2024: '5 место',
    2025: '8 место'
  },
  'san-lorenzo': {
    2025: '5 место',
    2026: 'Сезон идёт'
  },
  'cruz-azul': {
    2026: 'Сезон идёт'
  }
};
const HISTORICAL_CLUB_FALLBACKS = {
  kairat: {
    slug: 'kairat',
    name: 'Кайрат',
    logo: 'images/team-kairat.webp',
    country: 'Казахстан',
    city: 'Алматы',
    description: 'Участник 2024 - 2025. Страница клуба в истории турнира.',
    matches: []
  },
  villarreal: {
    slug: 'villarreal',
    name: 'Вильярреал',
    logo: 'images/history-villarreal.png',
    country: 'Испания',
    city: 'Вильярреал',
    description: 'Участник 2016 - 2019. Страница клуба в истории турнира.',
    matches: []
  },
  mtk: {
    slug: 'mtk',
    name: 'МТК',
    logo: 'images/history-mtk.webp',
    country: 'Венгрия',
    city: 'Будапешт',
    description: 'Участник 2017 - 2019. Страница клуба в истории турнира.',
    matches: []
  },
  'cruz-azul': {
    slug: 'cruz-azul',
    name: 'Крус Асуль',
    logo: 'images/team-cruz-azul.webp',
    country: 'Мексика',
    city: 'Мехико',
    description: 'Участник 2026. Страница клуба в истории турнира.',
    matches: []
  },
  victoria: {
    slug: 'victoria',
    name: 'Виктория',
    logo: 'images/history-victoria.webp',
    country: 'Португалия',
    city: 'Гимарайнш',
    description: 'Участник 2016. Страница клуба в истории турнира.',
    matches: []
  },
  santos: {
    slug: 'santos',
    name: 'Сантос',
    logo: 'images/history-santos.webp',
    country: 'Бразилия',
    city: 'Сантус',
    description: 'Участник 2023. Страница клуба в истории турнира.',
    matches: []
  },
  atalanta: {
    slug: 'atalanta',
    name: 'Аталанта',
    logo: 'images/history-atalanta.webp',
    country: 'Италия',
    city: 'Бергамо',
    description: 'Участник 2019. Страница клуба в истории турнира.',
    matches: []
  },
  roma: {
    slug: 'roma',
    name: 'Рома',
    logo: 'images/history-roma.webp',
    country: 'Италия',
    city: 'Рим',
    description: 'Участник 2018. Страница клуба в истории турнира.',
    matches: []
  },
  sepahan: {
    slug: 'sepahan',
    name: 'Сепахан',
    logo: 'images/history-sepahan.webp',
    country: 'Иран',
    city: 'Исфахан',
    description: 'Участник 2023 - 2024. Страница клуба в истории турнира.',
    matches: []
  },
  cska: {
    slug: 'cska',
    name: 'ЦСКА',
    logo: 'images/history-cska.png',
    country: 'Россия',
    city: 'Москва',
    description: 'Участник 2016 - 2019, 2023. Страница клуба в истории турнира.',
    matches: []
  },
  lokomotiv: {
    slug: 'lokomotiv',
    name: 'Локомотив',
    logo: 'images/history-lokomotiv.png',
    country: 'Россия',
    city: 'Москва',
    description: 'Участник 2016 - 2017. Страница клуба в истории турнира.',
    matches: []
  },
  'dinamo-moscow': {
    slug: 'dinamo-moscow',
    name: 'Динамо Москва',
    logo: 'images/history-dinamo-moscow.png',
    country: 'Россия',
    city: 'Москва',
    description: 'Участник 2016. Страница клуба в истории турнира.',
    matches: []
  },
  hjk: {
    slug: 'hjk',
    name: 'ХИК',
    logo: 'images/history-hjk.png',
    country: 'Финляндия',
    city: 'Хельсинки',
    description: 'Участник 2016. Страница клуба в истории турнира.',
    matches: []
  },
  brodarac: {
    slug: 'brodarac',
    name: 'Бродарац',
    logo: 'images/history-brodarac.png',
    country: 'Сербия',
    city: 'Белград',
    description: 'Участник 2016. Страница клуба в истории турнира.',
    matches: []
  },
  partizan: {
    slug: 'partizan',
    name: 'Партизан',
    logo: 'images/history-partizan.png',
    country: 'Сербия',
    city: 'Белград',
    description: 'Участник 2017. Страница клуба в истории турнира.',
    matches: []
  },
  'boca-juniors': {
    slug: 'boca-juniors',
    name: 'Бока Хуниорс',
    logo: 'images/history-boca-juniors.png',
    country: 'Аргентина',
    city: 'Буэнос-Айрес',
    description: 'Участник 2018 - 2019. Страница клуба в истории турнира.',
    matches: []
  },
  krasnodar: {
    slug: 'krasnodar',
    name: 'Краснодар',
    logo: 'images/history-krasnodar.png',
    country: 'Россия',
    city: 'Краснодар',
    description: 'Участник 2018 - 2019, 2023. Страница клуба в истории турнира.',
    matches: []
  }
};
const CURRENT_CLUB_FALLBACKS = {
  'almaz-antey': {
    slug: 'almaz-antey',
    name: 'Алмаз-Антей',
    logo: 'images/team-almaz-antey.webp',
    country: 'Россия',
    city: 'Санкт-Петербург',
    description: 'Участник сезона 2026. Страница клуба в текущем розыгрыше.',
    matches: []
  },
  zenit: {
    slug: 'zenit',
    name: 'Зенит',
    logo: 'images/team-zenit.webp',
    country: 'Россия',
    city: 'Санкт-Петербург',
    description: 'Участник сезона 2026. Страница клуба в текущем розыгрыше.',
    matches: []
  },
  palmeiras: {
    slug: 'palmeiras',
    name: 'Палмейрас',
    logo: 'images/team-palmeiras.webp',
    country: 'Бразилия',
    city: 'Сан-Паулу',
    description: 'Участник сезона 2026. Страница клуба в текущем розыгрыше.',
    matches: []
  },
  'crvena-zvezda': {
    slug: 'crvena-zvezda',
    name: 'Црвена Звезда',
    logo: 'images/team-crvena-zvezda.webp',
    country: 'Сербия',
    city: 'Белград',
    description: 'Участник сезона 2026. Страница клуба в текущем розыгрыше.',
    matches: []
  },
  fenerbahce: {
    slug: 'fenerbahce',
    name: 'Фенербахче',
    logo: 'images/team-fenerbahce.webp',
    country: 'Турция',
    city: 'Стамбул',
    description: 'Участник сезона 2026. Страница клуба в текущем розыгрыше.',
    matches: []
  },
  'dinamo-minsk': {
    slug: 'dinamo-minsk',
    name: 'Динамо-Минск',
    logo: 'images/team-dinamo-minsk.webp',
    country: 'Беларусь',
    city: 'Минск',
    description: 'Участник сезона 2026. Страница клуба в текущем розыгрыше.',
    matches: []
  },
  'san-lorenzo': {
    slug: 'san-lorenzo',
    name: 'Сан-Лоренсо',
    logo: 'images/team-san-lorenzo.webp',
    country: 'Аргентина',
    city: 'Буэнос-Айрес',
    description: 'Участник сезона 2026. Страница клуба в текущем розыгрыше.',
    matches: []
  },
  'cruz-azul': {
    slug: 'cruz-azul',
    name: 'Крус Асуль',
    logo: 'images/team-cruz-azul.webp',
    country: 'Мексика',
    city: 'Мехико',
    description: 'Участник сезона 2026. Страница клуба в текущем розыгрыше.',
    matches: []
  }
};
const ARCHIVE_TOURNAMENTS = {
  '2025': {
    title: 'Кубок Бурчалкина 2025',
    season: 'Розыгрыш 15 - 17 мая 2025',
    description: 'Позже здесь появятся команды турнира, результаты матчей, сетка, фотографии и материалы розыгрыша 2025 года.',
    status: 'Страница прошлого розыгрыша уже готова как точка входа. Материалы можно будет постепенно добавить позже.',
    detail: {
      clubs_count: 8,
      matches_count: 20,
      clubs: [
        { position: 1, name: 'Алмаз-Антей', slug: 'almaz-antey', logo: 'images/team-almaz-antey.webp', city: 'Санкт-Петербург', country: 'Россия' },
        { position: 2, name: 'Зенит', slug: 'zenit', logo: 'images/team-zenit.webp', city: 'Санкт-Петербург', country: 'Россия' },
        { position: 3, name: 'Палмейрас', slug: 'palmeiras', logo: 'images/team-palmeiras.webp', city: 'Сан-Паулу', country: 'Бразилия' },
        { position: 4, name: 'Црвена Звезда', slug: 'crvena-zvezda', logo: 'images/team-crvena-zvezda.webp', city: 'Белград', country: 'Сербия' },
        { position: 5, name: 'Сан-Лоренсо', slug: 'san-lorenzo', logo: 'images/team-san-lorenzo.webp', city: 'Буэнос-Айрес', country: 'Аргентина' },
        { position: 6, name: 'Фенербахче', slug: 'fenerbahce', logo: 'images/team-fenerbahce.webp', city: 'Стамбул', country: 'Турция' },
        { position: 7, name: 'Динамо-Минск', slug: 'dinamo-minsk', logo: 'images/team-dinamo-minsk.webp', city: 'Минск', country: 'Беларусь' },
        { position: 8, name: 'Кайрат', slug: 'kairat', logo: 'images/team-kairat.webp', city: 'Алматы', country: 'Казахстан' }
      ],
      standings: [
        { position: 1, group: 'Группа A', team: 'Алмаз-Антей', slug: 'almaz-antey', logo: 'images/team-almaz-antey.webp', city: 'Санкт-Петербург', country: 'Россия', played: 3, won: 2, drawn: 1, lost: 0, goals_for: 7, goals_against: 3, points: 7 },
        { position: 2, group: 'Группа B', team: 'Зенит', slug: 'zenit', logo: 'images/team-zenit.webp', city: 'Санкт-Петербург', country: 'Россия', played: 3, won: 2, drawn: 1, lost: 0, goals_for: 7, goals_against: 3, points: 7 },
        { position: 3, group: 'Группа B', team: 'Палмейрас', slug: 'palmeiras', logo: 'images/team-palmeiras.webp', city: 'Сан-Паулу', country: 'Бразилия', played: 3, won: 2, drawn: 0, lost: 1, goals_for: 7, goals_against: 3, points: 6 },
        { position: 4, group: 'Группа A', team: 'Црвена Звезда', slug: 'crvena-zvezda', logo: 'images/team-crvena-zvezda.webp', city: 'Белград', country: 'Сербия', played: 3, won: 2, drawn: 0, lost: 1, goals_for: 4, goals_against: 4, points: 6 },
        { position: 5, group: 'Группа A', team: 'Фенербахче', slug: 'fenerbahce', logo: 'images/team-fenerbahce.webp', city: 'Стамбул', country: 'Турция', played: 3, won: 1, drawn: 1, lost: 1, goals_for: 5, goals_against: 3, points: 4 },
        { position: 6, group: 'Группа B', team: 'Сан-Лоренсо', slug: 'san-lorenzo', logo: 'images/team-san-lorenzo.webp', city: 'Буэнос-Айрес', country: 'Аргентина', played: 3, won: 1, drawn: 1, lost: 1, goals_for: 3, goals_against: 4, points: 4 },
        { position: 7, group: 'Группа A', team: 'Динамо-Минск', slug: 'dinamo-minsk', logo: 'images/team-dinamo-minsk.webp', city: 'Минск', country: 'Беларусь', played: 3, won: 0, drawn: 0, lost: 3, goals_for: 1, goals_against: 7, points: 0 },
        { position: 8, group: 'Группа B', team: 'Кайрат', slug: 'kairat', logo: 'images/team-kairat.webp', city: 'Алматы', country: 'Казахстан', played: 3, won: 0, drawn: 0, lost: 3, goals_for: 2, goals_against: 9, points: 0 }
      ],
      grouped_standings: [
        {
          key: 'A',
          label: 'Группа A',
          rows: [
            { position: 1, group: 'Группа A', team: 'Алмаз-Антей', slug: 'almaz-antey', logo: 'images/team-almaz-antey.webp', city: 'Санкт-Петербург', country: 'Россия', played: 3, won: 2, drawn: 1, lost: 0, goals_for: 7, goals_against: 3, points: 7 },
            { position: 2, group: 'Группа A', team: 'Црвена Звезда', slug: 'crvena-zvezda', logo: 'images/team-crvena-zvezda.webp', city: 'Белград', country: 'Сербия', played: 3, won: 2, drawn: 0, lost: 1, goals_for: 4, goals_against: 4, points: 6 },
            { position: 3, group: 'Группа A', team: 'Фенербахче', slug: 'fenerbahce', logo: 'images/team-fenerbahce.webp', city: 'Стамбул', country: 'Турция', played: 3, won: 1, drawn: 1, lost: 1, goals_for: 5, goals_against: 3, points: 4 },
            { position: 4, group: 'Группа A', team: 'Динамо-Минск', slug: 'dinamo-minsk', logo: 'images/team-dinamo-minsk.webp', city: 'Минск', country: 'Беларусь', played: 3, won: 0, drawn: 0, lost: 3, goals_for: 1, goals_against: 7, points: 0 }
          ]
        },
        {
          key: 'B',
          label: 'Группа B',
          rows: [
            { position: 1, group: 'Группа B', team: 'Зенит', slug: 'zenit', logo: 'images/team-zenit.webp', city: 'Санкт-Петербург', country: 'Россия', played: 3, won: 2, drawn: 1, lost: 0, goals_for: 7, goals_against: 3, points: 7 },
            { position: 2, group: 'Группа B', team: 'Палмейрас', slug: 'palmeiras', logo: 'images/team-palmeiras.webp', city: 'Сан-Паулу', country: 'Бразилия', played: 3, won: 2, drawn: 0, lost: 1, goals_for: 7, goals_against: 3, points: 6 },
            { position: 3, group: 'Группа B', team: 'Сан-Лоренсо', slug: 'san-lorenzo', logo: 'images/team-san-lorenzo.webp', city: 'Буэнос-Айрес', country: 'Аргентина', played: 3, won: 1, drawn: 1, lost: 1, goals_for: 3, goals_against: 4, points: 4 },
            { position: 4, group: 'Группа B', team: 'Кайрат', slug: 'kairat', logo: 'images/team-kairat.webp', city: 'Алматы', country: 'Казахстан', played: 3, won: 0, drawn: 0, lost: 3, goals_for: 2, goals_against: 9, points: 0 }
          ]
        }
      ],
      playoff: [
        {
          bracket_group: 'top',
          round_group: 'semifinal',
          match_key: 'archive_2025_top_sf1',
          sort_order: 1,
          label: 'Полуфинал 1–4 №1',
          home_team: 'Алмаз-Антей',
          home_team_slug: 'almaz-antey',
          home_logo: 'images/team-almaz-antey.webp',
          away_team: 'Палмейрас',
          away_team_slug: 'palmeiras',
          away_logo: 'images/team-palmeiras.webp',
          home_score: 2,
          away_score: 0
        },
        {
          bracket_group: 'top',
          round_group: 'semifinal',
          match_key: 'archive_2025_top_sf2',
          sort_order: 2,
          label: 'Полуфинал 1–4 №2',
          home_team: 'Зенит',
          home_team_slug: 'zenit',
          home_logo: 'images/team-zenit.webp',
          away_team: 'Црвена Звезда',
          away_team_slug: 'crvena-zvezda',
          away_logo: 'images/team-crvena-zvezda.webp',
          home_score: 2,
          away_score: 1
        },
        {
          bracket_group: 'top',
          round_group: 'final',
          match_key: 'archive_2025_top_final',
          sort_order: 1,
          label: 'Матч за 1 место',
          home_team: 'Алмаз-Антей',
          home_team_slug: 'almaz-antey',
          home_logo: 'images/team-almaz-antey.webp',
          away_team: 'Зенит',
          away_team_slug: 'zenit',
          away_logo: 'images/team-zenit.webp',
          home_score: 1,
          away_score: 0
        },
        {
          bracket_group: 'top',
          round_group: 'final',
          match_key: 'archive_2025_top_third',
          sort_order: 2,
          label: 'Матч за 3 место',
          home_team: 'Палмейрас',
          home_team_slug: 'palmeiras',
          home_logo: 'images/team-palmeiras.webp',
          away_team: 'Црвена Звезда',
          away_team_slug: 'crvena-zvezda',
          away_logo: 'images/team-crvena-zvezda.webp',
          home_score: 4,
          away_score: 2
        },
        {
          bracket_group: 'placement',
          round_group: 'semifinal',
          match_key: 'archive_2025_place_sf1',
          sort_order: 1,
          label: 'Полуфинал 5–8 №1',
          home_team: 'Сан-Лоренсо',
          home_team_slug: 'san-lorenzo',
          home_logo: 'images/team-san-lorenzo.webp',
          away_team: 'Динамо-Минск',
          away_team_slug: 'dinamo-minsk',
          away_logo: 'images/team-dinamo-minsk.webp',
          home_score: 1,
          away_score: 1
        },
        {
          bracket_group: 'placement',
          round_group: 'semifinal',
          match_key: 'archive_2025_place_sf2',
          sort_order: 2,
          label: 'Полуфинал 5–8 №2',
          home_team: 'Фенербахче',
          home_team_slug: 'fenerbahce',
          home_logo: 'images/team-fenerbahce.webp',
          away_team: 'Кайрат',
          away_team_slug: 'kairat',
          away_logo: 'images/team-kairat.webp',
          home_score: 1,
          away_score: 1
        },
        {
          bracket_group: 'placement',
          round_group: 'final',
          match_key: 'archive_2025_place_fifth',
          sort_order: 1,
          label: 'Матч за 5 место',
          home_team: 'Сан-Лоренсо',
          home_team_slug: 'san-lorenzo',
          home_logo: 'images/team-san-lorenzo.webp',
          away_team: 'Фенербахче',
          away_team_slug: 'fenerbahce',
          away_logo: 'images/team-fenerbahce.webp',
          home_score: 3,
          away_score: 1
        },
        {
          bracket_group: 'placement',
          round_group: 'final',
          match_key: 'archive_2025_place_seventh',
          sort_order: 2,
          label: 'Матч за 7 место',
          home_team: 'Динамо-Минск',
          home_team_slug: 'dinamo-minsk',
          home_logo: 'images/team-dinamo-minsk.webp',
          away_team: 'Кайрат',
          away_team_slug: 'kairat',
          away_logo: 'images/team-kairat.webp',
          home_score: 2,
          away_score: 1
        }
      ],
      matches: [
        {
          id: 'archive-2025-1',
          date: '2025-05-16',
          time: '10:45',
          status_label: 'Завершён',
          score: '3:1',
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
          date: '2025-05-16',
          time: '12:00',
          status_label: 'Завершён',
          score: '4:1',
          group: 'Группа B',
          home_team: 'Зенит',
          home_team_slug: 'zenit',
          home_logo: 'images/team-zenit.webp',
          away_team: 'Кайрат',
          away_team_slug: 'kairat',
          away_logo: 'images/team-kairat.webp'
        },
        {
          id: 'archive-2025-3',
          date: '2025-05-16',
          time: '13:15',
          status_label: 'Завершён',
          score: '2:1',
          group: 'Группа A',
          home_team: 'Црвена Звезда',
          home_team_slug: 'crvena-zvezda',
          home_logo: 'images/team-crvena-zvezda.webp',
          away_team: 'Фенербахче',
          away_team_slug: 'fenerbahce',
          away_logo: 'images/team-fenerbahce.webp'
        },
        {
          id: 'archive-2025-4',
          date: '2025-05-16',
          time: '14:30',
          status_label: 'Завершён',
          score: '3:0',
          group: 'Группа B',
          home_team: 'Палмейрас',
          home_team_slug: 'palmeiras',
          home_logo: 'images/team-palmeiras.webp',
          away_team: 'Сан-Лоренсо',
          away_team_slug: 'san-lorenzo',
          away_logo: 'images/team-san-lorenzo.webp'
        },
        {
          id: 'archive-2025-5',
          date: '2025-05-16',
          time: '15:45',
          status_label: 'Завершён',
          score: '3:1',
          group: 'Группа A',
          home_team: 'Алмаз-Антей',
          home_team_slug: 'almaz-antey',
          home_logo: 'images/team-almaz-antey.webp',
          away_team: 'Црвена Звезда',
          away_team_slug: 'crvena-zvezda',
          away_logo: 'images/team-crvena-zvezda.webp'
        },
        {
          id: 'archive-2025-6',
          date: '2025-05-16',
          time: '17:00',
          status_label: 'Завершён',
          score: '2:1',
          group: 'Группа B',
          home_team: 'Зенит',
          home_team_slug: 'zenit',
          home_logo: 'images/team-zenit.webp',
          away_team: 'Палмейрас',
          away_team_slug: 'palmeiras',
          away_logo: 'images/team-palmeiras.webp'
        },
        {
          id: 'archive-2025-7',
          date: '2025-05-16',
          time: '18:15',
          status_label: 'Завершён',
          score: '0:3',
          group: 'Группа A',
          home_team: 'Динамо-Минск',
          home_team_slug: 'dinamo-minsk',
          home_logo: 'images/team-dinamo-minsk.webp',
          away_team: 'Фенербахче',
          away_team_slug: 'fenerbahce',
          away_logo: 'images/team-fenerbahce.webp'
        },
        {
          id: 'archive-2025-8',
          date: '2025-05-16',
          time: '20:30',
          status_label: 'Завершён',
          score: '0:2',
          group: 'Группа B',
          home_team: 'Кайрат',
          home_team_slug: 'kairat',
          home_logo: 'images/team-kairat.webp',
          away_team: 'Сан-Лоренсо',
          away_team_slug: 'san-lorenzo',
          away_logo: 'images/team-san-lorenzo.webp'
        },
        {
          id: 'archive-2025-9',
          date: '2025-05-17',
          time: '10:00',
          status_label: 'Завершён',
          score: '1:1',
          group: 'Группа A',
          home_team: 'Алмаз-Антей',
          home_team_slug: 'almaz-antey',
          home_logo: 'images/team-almaz-antey.webp',
          away_team: 'Фенербахче',
          away_team_slug: 'fenerbahce',
          away_logo: 'images/team-fenerbahce.webp'
        },
        {
          id: 'archive-2025-10',
          date: '2025-05-17',
          time: '11:15',
          status_label: 'Завершён',
          score: '1:1',
          group: 'Группа B',
          home_team: 'Зенит',
          home_team_slug: 'zenit',
          home_logo: 'images/team-zenit.webp',
          away_team: 'Сан-Лоренсо',
          away_team_slug: 'san-lorenzo',
          away_logo: 'images/team-san-lorenzo.webp'
        },
        {
          id: 'archive-2025-11',
          date: '2025-05-17',
          time: '12:30',
          status_label: 'Завершён',
          score: '0:1',
          group: 'Группа A',
          home_team: 'Динамо-Минск',
          home_team_slug: 'dinamo-minsk',
          home_logo: 'images/team-dinamo-minsk.webp',
          away_team: 'Црвена Звезда',
          away_team_slug: 'crvena-zvezda',
          away_logo: 'images/team-crvena-zvezda.webp'
        },
        {
          id: 'archive-2025-12',
          date: '2025-05-17',
          time: '13:45',
          status_label: 'Завершён',
          score: '1:3',
          group: 'Группа B',
          home_team: 'Кайрат',
          home_team_slug: 'kairat',
          home_logo: 'images/team-kairat.webp',
          away_team: 'Палмейрас',
          away_team_slug: 'palmeiras',
          away_logo: 'images/team-palmeiras.webp'
        },
        {
          id: 'archive-2025-13',
          date: '2025-05-17',
          time: '15:45',
          status_label: 'Завершён',
          score: '1:1',
          round: 'Полуфинал 5–8 №1',
          home_team: 'Сан-Лоренсо',
          home_team_slug: 'san-lorenzo',
          home_logo: 'images/team-san-lorenzo.webp',
          away_team: 'Динамо-Минск',
          away_team_slug: 'dinamo-minsk',
          away_logo: 'images/team-dinamo-minsk.webp'
        },
        {
          id: 'archive-2025-14',
          date: '2025-05-17',
          time: '17:00',
          status_label: 'Завершён',
          score: '1:1',
          round: 'Полуфинал 5–8 №2',
          home_team: 'Фенербахче',
          home_team_slug: 'fenerbahce',
          home_logo: 'images/team-fenerbahce.webp',
          away_team: 'Кайрат',
          away_team_slug: 'kairat',
          away_logo: 'images/team-kairat.webp'
        },
        {
          id: 'archive-2025-15',
          date: '2025-05-17',
          time: '18:15',
          status_label: 'Завершён',
          score: '2:0',
          round: 'Полуфинал 1–4 №1',
          home_team: 'Алмаз-Антей',
          home_team_slug: 'almaz-antey',
          home_logo: 'images/team-almaz-antey.webp',
          away_team: 'Палмейрас',
          away_team_slug: 'palmeiras',
          away_logo: 'images/team-palmeiras.webp'
        },
        {
          id: 'archive-2025-16',
          date: '2025-05-17',
          time: '19:30',
          status_label: 'Завершён',
          score: '2:1',
          round: 'Полуфинал 1–4 №2',
          home_team: 'Зенит',
          home_team_slug: 'zenit',
          home_logo: 'images/team-zenit.webp',
          away_team: 'Црвена Звезда',
          away_team_slug: 'crvena-zvezda',
          away_logo: 'images/team-crvena-zvezda.webp'
        },
        {
          id: 'archive-2025-17',
          date: '2025-05-18',
          time: '10:00',
          status_label: 'Завершён',
          score: '2:1',
          round: 'Матч за 7 место',
          home_team: 'Динамо-Минск',
          home_team_slug: 'dinamo-minsk',
          home_logo: 'images/team-dinamo-minsk.webp',
          away_team: 'Кайрат',
          away_team_slug: 'kairat',
          away_logo: 'images/team-kairat.webp'
        },
        {
          id: 'archive-2025-18',
          date: '2025-05-18',
          time: '11:15',
          status_label: 'Завершён',
          score: '3:1',
          round: 'Матч за 5 место',
          home_team: 'Сан-Лоренсо',
          home_team_slug: 'san-lorenzo',
          home_logo: 'images/team-san-lorenzo.webp',
          away_team: 'Фенербахче',
          away_team_slug: 'fenerbahce',
          away_logo: 'images/team-fenerbahce.webp'
        },
        {
          id: 'archive-2025-19',
          date: '2025-05-18',
          time: '12:30',
          status_label: 'Завершён',
          score: '4:2',
          round: 'Матч за 3 место',
          home_team: 'Палмейрас',
          home_team_slug: 'palmeiras',
          home_logo: 'images/team-palmeiras.webp',
          away_team: 'Црвена Звезда',
          away_team_slug: 'crvena-zvezda',
          away_logo: 'images/team-crvena-zvezda.webp'
        },
        {
          id: 'archive-2025-20',
          date: '2025-05-18',
          time: '13:45',
          status_label: 'Завершён',
          score: '1:0',
          round: 'Финал',
          home_team: 'Алмаз-Антей',
          home_team_slug: 'almaz-antey',
          home_logo: 'images/team-almaz-antey.webp',
          away_team: 'Зенит',
          away_team_slug: 'zenit',
          away_logo: 'images/team-zenit.webp'
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
    season: 'Розыгрыш 17 - 19 мая 2024',
    description: 'Матчи, турнирная таблица и сетка плей-офф розыгрыша 2024 года.',
    status: 'Страница прошлого розыгрыша заполнена участниками, результатами и итоговой сеткой турнира.',
    detail: {
      clubs_count: 8,
      matches_count: 20,
      clubs: [
        { position: 1, name: 'Палмейрас', slug: 'palmeiras', logo: 'images/team-palmeiras.webp', city: 'Сан-Паулу', country: 'Бразилия' },
        { position: 2, name: 'Зенит', slug: 'zenit', logo: 'images/team-zenit.webp', city: 'Санкт-Петербург', country: 'Россия' },
        { position: 3, name: 'Алмаз-Антей', slug: 'almaz-antey', logo: 'images/team-almaz-antey.webp', city: 'Санкт-Петербург', country: 'Россия' },
        { position: 4, name: 'Црвена Звезда', slug: 'crvena-zvezda', logo: 'images/team-crvena-zvezda.webp', city: 'Белград', country: 'Сербия' },
        { position: 5, name: 'Кайрат', slug: 'kairat', logo: 'images/team-kairat.webp', city: 'Алматы', country: 'Казахстан' },
        { position: 6, name: 'Фенербахче', slug: 'fenerbahce', logo: 'images/team-fenerbahce.webp', city: 'Стамбул', country: 'Турция' },
        { position: 7, name: 'Динамо-Минск', slug: 'dinamo-minsk', logo: 'images/team-dinamo-minsk.webp', city: 'Минск', country: 'Беларусь' },
        { position: 8, name: 'Сепахан', slug: 'sepahan', logo: 'images/history-sepahan.webp', city: 'Исфахан', country: 'Иран' }
      ],
      standings: [
        { position: 1, group: 'Группа A', team: 'Палмейрас', slug: 'palmeiras', logo: 'images/team-palmeiras.webp', city: 'Сан-Паулу', country: 'Бразилия', played: 3, won: 3, drawn: 0, lost: 0, goals_for: 8, goals_against: 2, points: 9 },
        { position: 2, group: 'Группа B', team: 'Зенит', slug: 'zenit', logo: 'images/team-zenit.webp', city: 'Санкт-Петербург', country: 'Россия', played: 3, won: 3, drawn: 0, lost: 0, goals_for: 6, goals_against: 1, points: 9 },
        { position: 3, group: 'Группа A', team: 'Алмаз-Антей', slug: 'almaz-antey', logo: 'images/team-almaz-antey.webp', city: 'Санкт-Петербург', country: 'Россия', played: 3, won: 2, drawn: 0, lost: 1, goals_for: 5, goals_against: 6, points: 6 },
        { position: 4, group: 'Группа B', team: 'Црвена Звезда', slug: 'crvena-zvezda', logo: 'images/team-crvena-zvezda.webp', city: 'Белград', country: 'Сербия', played: 3, won: 2, drawn: 0, lost: 1, goals_for: 5, goals_against: 2, points: 6 },
        { position: 5, group: 'Группа A', team: 'Кайрат', slug: 'kairat', logo: 'images/team-kairat.webp', city: 'Алматы', country: 'Казахстан', played: 3, won: 0, drawn: 1, lost: 2, goals_for: 1, goals_against: 4, points: 1 },
        { position: 6, group: 'Группа B', team: 'Сепахан', slug: 'sepahan', logo: 'images/history-sepahan.webp', city: 'Исфахан', country: 'Иран', played: 3, won: 1, drawn: 0, lost: 2, goals_for: 3, goals_against: 6, points: 3 },
        { position: 7, group: 'Группа A', team: 'Фенербахче', slug: 'fenerbahce', logo: 'images/team-fenerbahce.webp', city: 'Стамбул', country: 'Турция', played: 3, won: 0, drawn: 1, lost: 2, goals_for: 2, goals_against: 4, points: 1 },
        { position: 8, group: 'Группа B', team: 'Динамо-Минск', slug: 'dinamo-minsk', logo: 'images/team-dinamo-minsk.webp', city: 'Минск', country: 'Беларусь', played: 3, won: 0, drawn: 0, lost: 3, goals_for: 2, goals_against: 7, points: 0 }
      ],
      grouped_standings: [
        {
          key: 'A',
          label: 'Группа A',
          rows: [
            { position: 1, group: 'Группа A', team: 'Палмейрас', slug: 'palmeiras', logo: 'images/team-palmeiras.webp', city: 'Сан-Паулу', country: 'Бразилия', played: 3, won: 3, drawn: 0, lost: 0, goals_for: 8, goals_against: 2, points: 9 },
            { position: 2, group: 'Группа A', team: 'Алмаз-Антей', slug: 'almaz-antey', logo: 'images/team-almaz-antey.webp', city: 'Санкт-Петербург', country: 'Россия', played: 3, won: 2, drawn: 0, lost: 1, goals_for: 5, goals_against: 6, points: 6 },
            { position: 3, group: 'Группа A', team: 'Кайрат', slug: 'kairat', logo: 'images/team-kairat.webp', city: 'Алматы', country: 'Казахстан', played: 3, won: 0, drawn: 1, lost: 2, goals_for: 1, goals_against: 4, points: 1 },
            { position: 4, group: 'Группа A', team: 'Фенербахче', slug: 'fenerbahce', logo: 'images/team-fenerbahce.webp', city: 'Стамбул', country: 'Турция', played: 3, won: 0, drawn: 1, lost: 2, goals_for: 2, goals_against: 4, points: 1 }
          ]
        },
        {
          key: 'B',
          label: 'Группа B',
          rows: [
            { position: 1, group: 'Группа B', team: 'Зенит', slug: 'zenit', logo: 'images/team-zenit.webp', city: 'Санкт-Петербург', country: 'Россия', played: 3, won: 3, drawn: 0, lost: 0, goals_for: 6, goals_against: 1, points: 9 },
            { position: 2, group: 'Группа B', team: 'Црвена Звезда', slug: 'crvena-zvezda', logo: 'images/team-crvena-zvezda.webp', city: 'Белград', country: 'Сербия', played: 3, won: 2, drawn: 0, lost: 1, goals_for: 5, goals_against: 2, points: 6 },
            { position: 3, group: 'Группа B', team: 'Сепахан', slug: 'sepahan', logo: 'images/history-sepahan.webp', city: 'Исфахан', country: 'Иран', played: 3, won: 1, drawn: 0, lost: 2, goals_for: 3, goals_against: 6, points: 3 },
            { position: 4, group: 'Группа B', team: 'Динамо-Минск', slug: 'dinamo-minsk', logo: 'images/team-dinamo-minsk.webp', city: 'Минск', country: 'Беларусь', played: 3, won: 0, drawn: 0, lost: 3, goals_for: 2, goals_against: 7, points: 0 }
          ]
        }
      ],
      playoff: [
        { bracket_group: 'top', round_group: 'semifinal', match_key: 'archive_2024_top_sf1', sort_order: 1, label: 'Полуфинал 1–4 №1', home_team: 'Палмейрас', home_team_slug: 'palmeiras', home_logo: 'images/team-palmeiras.webp', away_team: 'Црвена Звезда', away_team_slug: 'crvena-zvezda', away_logo: 'images/team-crvena-zvezda.webp', home_score: 1, away_score: 0 },
        { bracket_group: 'top', round_group: 'semifinal', match_key: 'archive_2024_top_sf2', sort_order: 2, label: 'Полуфинал 1–4 №2', home_team: 'Зенит', home_team_slug: 'zenit', home_logo: 'images/team-zenit.webp', away_team: 'Алмаз-Антей', away_team_slug: 'almaz-antey', away_logo: 'images/team-almaz-antey.webp', home_score: 2, away_score: 1 },
        { bracket_group: 'top', round_group: 'final', match_key: 'archive_2024_top_final', sort_order: 1, label: 'Матч за 1 место', home_team: 'Палмейрас', home_team_slug: 'palmeiras', home_logo: 'images/team-palmeiras.webp', away_team: 'Зенит', away_team_slug: 'zenit', away_logo: 'images/team-zenit.webp', home_score: 3, away_score: 0 },
        { bracket_group: 'top', round_group: 'final', match_key: 'archive_2024_top_third', sort_order: 2, label: 'Матч за 3 место', home_team: 'Црвена Звезда', home_team_slug: 'crvena-zvezda', home_logo: 'images/team-crvena-zvezda.webp', away_team: 'Алмаз-Антей', away_team_slug: 'almaz-antey', away_logo: 'images/team-almaz-antey.webp', home_score: 0, away_score: 1 },
        { bracket_group: 'placement', round_group: 'semifinal', match_key: 'archive_2024_place_sf1', sort_order: 1, label: 'Полуфинал 5–8 №1', home_team: 'Кайрат', home_team_slug: 'kairat', home_logo: 'images/team-kairat.webp', away_team: 'Динамо-Минск', away_team_slug: 'dinamo-minsk', away_logo: 'images/team-dinamo-minsk.webp', home_score: 0, away_score: 0 },
        { bracket_group: 'placement', round_group: 'semifinal', match_key: 'archive_2024_place_sf2', sort_order: 2, label: 'Полуфинал 5–8 №2', home_team: 'Сепахан', home_team_slug: 'sepahan', home_logo: 'images/history-sepahan.webp', away_team: 'Фенербахче', away_team_slug: 'fenerbahce', away_logo: 'images/team-fenerbahce.webp', home_score: 1, away_score: 1 },
        { bracket_group: 'placement', round_group: 'final', match_key: 'archive_2024_place_fifth', sort_order: 1, label: 'Матч за 5 место', home_team: 'Кайрат', home_team_slug: 'kairat', home_logo: 'images/team-kairat.webp', away_team: 'Фенербахче', away_team_slug: 'fenerbahce', away_logo: 'images/team-fenerbahce.webp', home_score: 0, away_score: 0 },
        { bracket_group: 'placement', round_group: 'final', match_key: 'archive_2024_place_seventh', sort_order: 2, label: 'Матч за 7 место', home_team: 'Динамо-Минск', home_team_slug: 'dinamo-minsk', home_logo: 'images/team-dinamo-minsk.webp', away_team: 'Сепахан', away_team_slug: 'sepahan', away_logo: 'images/history-sepahan.webp', home_score: 0, away_score: 0 }
      ],
      matches: [
        { id: 'archive-2024-1', date: '2024-05-17', time: '10:45', status_label: 'Завершён', score: '2:1', group: 'Группа A', home_team: 'Алмаз-Антей', home_team_slug: 'almaz-antey', home_logo: 'images/team-almaz-antey.webp', away_team: 'Фенербахче', away_team_slug: 'fenerbahce', away_logo: 'images/team-fenerbahce.webp' },
        { id: 'archive-2024-2', date: '2024-05-17', time: '12:00', status_label: 'Завершён', score: '2:0', group: 'Группа B', home_team: 'Зенит', home_team_slug: 'zenit', home_logo: 'images/team-zenit.webp', away_team: 'Динамо-Минск', away_team_slug: 'dinamo-minsk', away_logo: 'images/team-dinamo-minsk.webp' },
        { id: 'archive-2024-3', date: '2024-05-17', time: '13:15', status_label: 'Завершён', score: '0:2', group: 'Группа A', home_team: 'Кайрат', home_team_slug: 'kairat', home_logo: 'images/team-kairat.webp', away_team: 'Палмейрас', away_team_slug: 'palmeiras', away_logo: 'images/team-palmeiras.webp' },
        { id: 'archive-2024-4', date: '2024-05-17', time: '14:30', status_label: 'Завершён', score: '2:0', group: 'Группа B', home_team: 'Црвена Звезда', home_team_slug: 'crvena-zvezda', home_logo: 'images/team-crvena-zvezda.webp', away_team: 'Сепахан', away_team_slug: 'sepahan', away_logo: 'images/history-sepahan.webp' },
        { id: 'archive-2024-5', date: '2024-05-17', time: '15:45', status_label: 'Завершён', score: '2:1', group: 'Группа A', home_team: 'Алмаз-Антей', home_team_slug: 'almaz-antey', home_logo: 'images/team-almaz-antey.webp', away_team: 'Кайрат', away_team_slug: 'kairat', away_logo: 'images/team-kairat.webp' },
        { id: 'archive-2024-6', date: '2024-05-17', time: '17:00', status_label: 'Завершён', score: '2:1', group: 'Группа B', home_team: 'Зенит', home_team_slug: 'zenit', home_logo: 'images/team-zenit.webp', away_team: 'Црвена Звезда', away_team_slug: 'crvena-zvezda', away_logo: 'images/team-crvena-zvezda.webp' },
        { id: 'archive-2024-7', date: '2024-05-17', time: '18:15', status_label: 'Завершён', score: '1:2', group: 'Группа A', home_team: 'Фенербахче', home_team_slug: 'fenerbahce', home_logo: 'images/team-fenerbahce.webp', away_team: 'Палмейрас', away_team_slug: 'palmeiras', away_logo: 'images/team-palmeiras.webp' },
        { id: 'archive-2024-8', date: '2024-05-17', time: '19:30', status_label: 'Завершён', score: '2:3', group: 'Группа B', home_team: 'Динамо-Минск', home_team_slug: 'dinamo-minsk', home_logo: 'images/team-dinamo-minsk.webp', away_team: 'Сепахан', away_team_slug: 'sepahan', away_logo: 'images/history-sepahan.webp' },
        { id: 'archive-2024-9', date: '2024-05-18', time: '10:00', status_label: 'Завершён', score: '1:4', group: 'Группа A', home_team: 'Алмаз-Антей', home_team_slug: 'almaz-antey', home_logo: 'images/team-almaz-antey.webp', away_team: 'Палмейрас', away_team_slug: 'palmeiras', away_logo: 'images/team-palmeiras.webp' },
        { id: 'archive-2024-10', date: '2024-05-18', time: '11:15', status_label: 'Завершён', score: '2:0', group: 'Группа B', home_team: 'Зенит', home_team_slug: 'zenit', home_logo: 'images/team-zenit.webp', away_team: 'Сепахан', away_team_slug: 'sepahan', away_logo: 'images/history-sepahan.webp' },
        { id: 'archive-2024-11', date: '2024-05-18', time: '12:30', status_label: 'Завершён', score: '0:0', group: 'Группа A', home_team: 'Фенербахче', home_team_slug: 'fenerbahce', home_logo: 'images/team-fenerbahce.webp', away_team: 'Кайрат', away_team_slug: 'kairat', away_logo: 'images/team-kairat.webp' },
        { id: 'archive-2024-12', date: '2024-05-18', time: '13:45', status_label: 'Завершён', score: '0:2', group: 'Группа B', home_team: 'Динамо-Минск', home_team_slug: 'dinamo-minsk', home_logo: 'images/team-dinamo-minsk.webp', away_team: 'Црвена Звезда', away_team_slug: 'crvena-zvezda', away_logo: 'images/team-crvena-zvezda.webp' },
        { id: 'archive-2024-13', date: '2024-05-18', time: '15:00', status_label: 'Завершён', score: '2:1', round: 'Полуфинал 1–4 №2', home_team: 'Зенит', home_team_slug: 'zenit', home_logo: 'images/team-zenit.webp', away_team: 'Алмаз-Антей', away_team_slug: 'almaz-antey', away_logo: 'images/team-almaz-antey.webp' },
        { id: 'archive-2024-14', date: '2024-05-18', time: '16:15', status_label: 'Завершён', score: '1:0', round: 'Полуфинал 1–4 №1', home_team: 'Палмейрас', home_team_slug: 'palmeiras', home_logo: 'images/team-palmeiras.webp', away_team: 'Црвена Звезда', away_team_slug: 'crvena-zvezda', away_logo: 'images/team-crvena-zvezda.webp' },
        { id: 'archive-2024-15', date: '2024-05-18', time: '17:30', status_label: 'Завершён', score: '0:0', round: 'Полуфинал 5–8 №1', home_team: 'Кайрат', home_team_slug: 'kairat', home_logo: 'images/team-kairat.webp', away_team: 'Динамо-Минск', away_team_slug: 'dinamo-minsk', away_logo: 'images/team-dinamo-minsk.webp' },
        { id: 'archive-2024-16', date: '2024-05-18', time: '18:45', status_label: 'Завершён', score: '1:1', round: 'Полуфинал 5–8 №2', home_team: 'Сепахан', home_team_slug: 'sepahan', home_logo: 'images/history-sepahan.webp', away_team: 'Фенербахче', away_team_slug: 'fenerbahce', away_logo: 'images/team-fenerbahce.webp' },
        { id: 'archive-2024-17', date: '2024-05-19', time: '10:00', status_label: 'Завершён', score: '0:0', round: 'Матч за 7 место', home_team: 'Динамо-Минск', home_team_slug: 'dinamo-minsk', home_logo: 'images/team-dinamo-minsk.webp', away_team: 'Сепахан', away_team_slug: 'sepahan', away_logo: 'images/history-sepahan.webp' },
        { id: 'archive-2024-18', date: '2024-05-19', time: '11:15', status_label: 'Завершён', score: '0:0', round: 'Матч за 5 место', home_team: 'Кайрат', home_team_slug: 'kairat', home_logo: 'images/team-kairat.webp', away_team: 'Фенербахче', away_team_slug: 'fenerbahce', away_logo: 'images/team-fenerbahce.webp' },
        { id: 'archive-2024-19', date: '2024-05-19', time: '12:30', status_label: 'Завершён', score: '0:1', round: 'Матч за 3 место', home_team: 'Црвена Звезда', home_team_slug: 'crvena-zvezda', home_logo: 'images/team-crvena-zvezda.webp', away_team: 'Алмаз-Антей', away_team_slug: 'almaz-antey', away_logo: 'images/team-almaz-antey.webp' },
        { id: 'archive-2024-20', date: '2024-05-19', time: '13:45', status_label: 'Завершён', score: '3:0', round: 'Финал', home_team: 'Палмейрас', home_team_slug: 'palmeiras', home_logo: 'images/team-palmeiras.webp', away_team: 'Зенит', away_team_slug: 'zenit', away_logo: 'images/team-zenit.webp' }
      ]
    }
  },
  '2023': {
    title: 'Кубок Бурчалкина 2023',
    season: 'Розыгрыш 19 - 21 мая 2023',
    description: 'Матчи и турнирная таблица розыгрыша 2023 года.',
    status: 'Страница прошлого розыгрыша заполнена основными результатами турнира.',
    detail: {
      clubs_count: 8,
      matches_count: 12,
      clubs: [
        { position: 1, name: 'Зенит', slug: 'zenit', logo: 'images/team-zenit.webp', city: 'Санкт-Петербург', country: 'Россия' },
        { position: 2, name: 'Палмейрас', slug: 'palmeiras', logo: 'images/team-palmeiras.webp', city: 'Сан-Паулу', country: 'Бразилия' },
        { position: 3, name: 'Црвена Звезда', slug: 'crvena-zvezda', logo: 'images/team-crvena-zvezda.webp', city: 'Белград', country: 'Сербия' },
        { position: 4, name: 'Краснодар', slug: 'krasnodar', logo: 'images/history-krasnodar.png', city: 'Краснодар', country: 'Россия' },
        { position: 5, name: 'Алмаз-Антей', slug: 'almaz-antey', logo: 'images/team-almaz-antey.webp', city: 'Санкт-Петербург', country: 'Россия' },
        { position: 6, name: 'Сантос', slug: 'santos', logo: 'images/history-santos.webp', city: 'Сантус', country: 'Бразилия' },
        { position: 7, name: 'ЦСКА', slug: 'cska', logo: 'images/history-cska.png', city: 'Москва', country: 'Россия' },
        { position: 8, name: 'Сепахан', slug: 'sepahan', logo: 'images/history-sepahan.webp', city: 'Исфахан', country: 'Иран' }
      ],
      standings: [
        { position: 1, team: 'Зенит', slug: 'zenit', logo: 'images/team-zenit.webp', city: 'Санкт-Петербург', country: 'Россия', played: 3, won: 3, drawn: 0, lost: 0, goals_for: 6, goals_against: 2, points: 9 },
        { position: 2, team: 'Палмейрас', slug: 'palmeiras', logo: 'images/team-palmeiras.webp', city: 'Сан-Паулу', country: 'Бразилия', played: 3, won: 2, drawn: 0, lost: 1, goals_for: 8, goals_against: 4, points: 6 },
        { position: 3, team: 'Црвена Звезда', slug: 'crvena-zvezda', logo: 'images/team-crvena-zvezda.webp', city: 'Белград', country: 'Сербия', played: 3, won: 2, drawn: 0, lost: 1, goals_for: 5, goals_against: 2, points: 6 },
        { position: 4, team: 'Краснодар', slug: 'krasnodar', logo: 'images/history-krasnodar.png', city: 'Краснодар', country: 'Россия', played: 3, won: 2, drawn: 0, lost: 1, goals_for: 2, goals_against: 4, points: 6 },
        { position: 5, team: 'Алмаз-Антей', slug: 'almaz-antey', logo: 'images/team-almaz-antey.webp', city: 'Санкт-Петербург', country: 'Россия', played: 3, won: 1, drawn: 0, lost: 2, goals_for: 6, goals_against: 3, points: 3 },
        { position: 6, team: 'Сантос', slug: 'santos', logo: 'images/history-santos.webp', city: 'Сантус', country: 'Бразилия', played: 3, won: 1, drawn: 0, lost: 2, goals_for: 4, goals_against: 5, points: 3 },
        { position: 7, team: 'ЦСКА', slug: 'cska', logo: 'images/history-cska.png', city: 'Москва', country: 'Россия', played: 3, won: 0, drawn: 1, lost: 2, goals_for: 3, goals_against: 6, points: 1 },
        { position: 8, team: 'Сепахан', slug: 'sepahan', logo: 'images/history-sepahan.webp', city: 'Исфахан', country: 'Иран', played: 3, won: 0, drawn: 1, lost: 2, goals_for: 1, goals_against: 9, points: 1 }
      ],
      matches: [
        { id: 'archive-2023-1', date: '2023-05-19', time: '12:30', status_label: 'Завершён', score: '5:0', round: 'Круговой этап', home_team: 'Алмаз-Антей', home_team_slug: 'almaz-antey', home_logo: 'images/team-almaz-antey.webp', away_team: 'Сепахан', away_team_slug: 'sepahan', away_logo: 'images/history-sepahan.webp' },
        { id: 'archive-2023-2', date: '2023-05-19', time: '14:00', status_label: 'Завершён', score: '1:0', round: 'Круговой этап', home_team: 'Краснодар', home_team_slug: 'krasnodar', home_logo: 'images/history-krasnodar.png', away_team: 'Црвена Звезда', away_team_slug: 'crvena-zvezda', away_logo: 'images/team-crvena-zvezda.webp' },
        { id: 'archive-2023-3', date: '2023-05-19', time: '15:30', status_label: 'Завершён', score: '2:0', round: 'Круговой этап', home_team: 'Зенит', home_team_slug: 'zenit', home_logo: 'images/team-zenit.webp', away_team: 'Сантос', away_team_slug: 'santos', away_logo: 'images/history-santos.webp' },
        { id: 'archive-2023-4', date: '2023-05-19', time: '17:00', status_label: 'Завершён', score: '2:3', round: 'Круговой этап', home_team: 'ЦСКА', home_team_slug: 'cska', home_logo: 'images/history-cska.png', away_team: 'Палмейрас', away_team_slug: 'palmeiras', away_logo: 'images/team-palmeiras.webp' },
        { id: 'archive-2023-5', date: '2023-05-20', time: '10:00', status_label: 'Завершён', score: '1:4', round: 'Круговой этап', home_team: 'Сепахан', home_team_slug: 'sepahan', home_logo: 'images/history-sepahan.webp', away_team: 'Сантос', away_team_slug: 'santos', away_logo: 'images/history-santos.webp' },
        { id: 'archive-2023-6', date: '2023-05-20', time: '11:30', status_label: 'Завершён', score: '3:1', round: 'Круговой этап', home_team: 'Црвена Звезда', home_team_slug: 'crvena-zvezda', home_logo: 'images/team-crvena-zvezda.webp', away_team: 'ЦСКА', away_team_slug: 'cska', away_logo: 'images/history-cska.png' },
        { id: 'archive-2023-7', date: '2023-05-20', time: '13:00', status_label: 'Завершён', score: '1:2', round: 'Круговой этап', home_team: 'Алмаз-Антей', home_team_slug: 'almaz-antey', home_logo: 'images/team-almaz-antey.webp', away_team: 'Зенит', away_team_slug: 'zenit', away_logo: 'images/team-zenit.webp' },
        { id: 'archive-2023-8', date: '2023-05-20', time: '14:30', status_label: 'Завершён', score: '0:4', round: 'Круговой этап', home_team: 'Краснодар', home_team_slug: 'krasnodar', home_logo: 'images/history-krasnodar.png', away_team: 'Палмейрас', away_team_slug: 'palmeiras', away_logo: 'images/team-palmeiras.webp' },
        { id: 'archive-2023-9', date: '2023-05-21', time: '10:00', status_label: 'Завершён', score: '0:0', round: 'Круговой этап', home_team: 'Сепахан', home_team_slug: 'sepahan', home_logo: 'images/history-sepahan.webp', away_team: 'ЦСКА', away_team_slug: 'cska', away_logo: 'images/history-cska.png' },
        { id: 'archive-2023-10', date: '2023-05-21', time: '11:30', status_label: 'Завершён', score: '0:2', round: 'Круговой этап', home_team: 'Сантос', home_team_slug: 'santos', home_logo: 'images/history-santos.webp', away_team: 'Црвена Звезда', away_team_slug: 'crvena-zvezda', away_logo: 'images/team-crvena-zvezda.webp' },
        { id: 'archive-2023-11', date: '2023-05-21', time: '13:00', status_label: 'Завершён', score: '0:1', round: 'Круговой этап', home_team: 'Алмаз-Антей', home_team_slug: 'almaz-antey', home_logo: 'images/team-almaz-antey.webp', away_team: 'Краснодар', away_team_slug: 'krasnodar', away_logo: 'images/history-krasnodar.png' },
        { id: 'archive-2023-12', date: '2023-05-21', time: '14:30', status_label: 'Завершён', score: '2:1', round: 'Круговой этап', home_team: 'Зенит', home_team_slug: 'zenit', home_logo: 'images/team-zenit.webp', away_team: 'Палмейрас', away_team_slug: 'palmeiras', away_logo: 'images/team-palmeiras.webp' }
      ]
    }
  },
  '2019': {
    title: 'Кубок Бурчалкина 2019',
    season: 'Розыгрыш 17 - 19 мая 2019',
    description: 'Матчи, итоги и сетка плей-офф розыгрыша 2019 года.',
    status: 'Страница прошлого розыгрыша заполнена результатами и сеткой турнира.',
    detail: {
      clubs_count: 8,
      matches_count: 12,
      clubs: [
        { position: 1, name: 'Вильярреал', slug: 'villarreal', logo: 'images/history-villarreal.png', city: 'Вильярреал', country: 'Испания' },
        { position: 2, name: 'Зенит', slug: 'zenit', logo: 'images/team-zenit.webp', city: 'Санкт-Петербург', country: 'Россия' },
        { position: 3, name: 'Бока Хуниорс', slug: 'boca-juniors', logo: 'images/history-boca-juniors.png', city: 'Буэнос-Айрес', country: 'Аргентина' },
        { position: 4, name: 'Алмаз-Антей', slug: 'almaz-antey', logo: 'images/team-almaz-antey.webp', city: 'Санкт-Петербург', country: 'Россия' },
        { position: 5, name: 'ЦСКА', slug: 'cska', logo: 'images/history-cska.png', city: 'Москва', country: 'Россия' },
        { position: 6, name: 'Аталанта', slug: 'atalanta', logo: 'images/history-atalanta.png', city: 'Бергамо', country: 'Италия' },
        { position: 7, name: 'МТК', slug: 'mtk', logo: 'images/history-mtk.png', city: 'Будапешт', country: 'Венгрия' },
        { position: 8, name: 'Краснодар', slug: 'krasnodar', logo: 'images/history-krasnodar.png', city: 'Краснодар', country: 'Россия' }
      ],
      standings: [
        { position: 1, team: 'Вильярреал', slug: 'villarreal', logo: 'images/history-villarreal.png', city: 'Вильярреал', country: 'Испания', played: 3, won: 3, drawn: 0, lost: 0, goals_for: 7, goals_against: 0, points: 9 },
        { position: 2, team: 'Бока Хуниорс', slug: 'boca-juniors', logo: 'images/history-boca-juniors.png', city: 'Буэнос-Айрес', country: 'Аргентина', played: 3, won: 2, drawn: 0, lost: 1, goals_for: 7, goals_against: 3, points: 6 },
        { position: 3, team: 'ЦСКА', slug: 'cska', logo: 'images/history-cska.png', city: 'Москва', country: 'Россия', played: 3, won: 2, drawn: 0, lost: 1, goals_for: 6, goals_against: 2, points: 6 },
        { position: 4, team: 'Зенит', slug: 'zenit', logo: 'images/team-zenit.webp', city: 'Санкт-Петербург', country: 'Россия', played: 3, won: 2, drawn: 0, lost: 1, goals_for: 5, goals_against: 4, points: 6 },
        { position: 5, team: 'Алмаз-Антей', slug: 'almaz-antey', logo: 'images/team-almaz-antey.webp', city: 'Санкт-Петербург', country: 'Россия', played: 3, won: 1, drawn: 0, lost: 2, goals_for: 6, goals_against: 7, points: 3 },
        { position: 6, team: 'МТК', slug: 'mtk', logo: 'images/history-mtk.png', city: 'Будапешт', country: 'Венгрия', played: 3, won: 1, drawn: 0, lost: 2, goals_for: 2, goals_against: 6, points: 3 },
        { position: 7, team: 'Аталанта', slug: 'atalanta', logo: 'images/history-atalanta.png', city: 'Бергамо', country: 'Италия', played: 3, won: 1, drawn: 0, lost: 2, goals_for: 2, goals_against: 11, points: 3 },
        { position: 8, team: 'Краснодар', slug: 'krasnodar', logo: 'images/history-krasnodar.png', city: 'Краснодар', country: 'Россия', played: 3, won: 0, drawn: 0, lost: 3, goals_for: 1, goals_against: 3, points: 0 }
      ],
      playoff: [
        { bracket_group: 'top', round_group: 'semifinal', match_key: 'archive_2019_top_sf1', sort_order: 1, label: 'Полуфинал 1–4 №1', home_team: 'Вильярреал', home_team_slug: 'villarreal', home_logo: 'images/history-villarreal.png', away_team: 'Бока Хуниорс', away_team_slug: 'boca-juniors', away_logo: 'images/history-boca-juniors.png', home_score: 3, away_score: 0 },
        { bracket_group: 'top', round_group: 'semifinal', match_key: 'archive_2019_top_sf2', sort_order: 2, label: 'Полуфинал 1–4 №2', home_team: 'Алмаз-Антей', home_team_slug: 'almaz-antey', home_logo: 'images/team-almaz-antey.webp', away_team: 'Зенит', away_team_slug: 'zenit', away_logo: 'images/team-zenit.webp', home_score: 0, away_score: 1 },
        { bracket_group: 'top', round_group: 'final', match_key: 'archive_2019_top_final', sort_order: 1, label: 'Матч за 1 место', home_team: 'Зенит', home_team_slug: 'zenit', home_logo: 'images/team-zenit.webp', away_team: 'Вильярреал', away_team_slug: 'villarreal', away_logo: 'images/history-villarreal.png', home_score: 0, away_score: 3 },
        { bracket_group: 'top', round_group: 'final', match_key: 'archive_2019_top_third', sort_order: 2, label: 'Матч за 3 место', home_team: 'Алмаз-Антей', home_team_slug: 'almaz-antey', home_logo: 'images/team-almaz-antey.webp', away_team: 'Бока Хуниорс', away_team_slug: 'boca-juniors', away_logo: 'images/history-boca-juniors.png', home_score: 0, away_score: 6 },
        { bracket_group: 'placement', round_group: 'semifinal', match_key: 'archive_2019_place_sf1', sort_order: 1, label: 'Полуфинал 5–8 №1', home_team: 'Аталанта', home_team_slug: 'atalanta', home_logo: 'images/history-atalanta.png', away_team: 'МТК', away_team_slug: 'mtk', away_logo: 'images/history-mtk.png', home_score: 2, away_score: 0 },
        { bracket_group: 'placement', round_group: 'semifinal', match_key: 'archive_2019_place_sf2', sort_order: 2, label: 'Полуфинал 5–8 №2', home_team: 'Краснодар', home_team_slug: 'krasnodar', home_logo: 'images/history-krasnodar.png', away_team: 'ЦСКА', away_team_slug: 'cska', away_logo: 'images/history-cska.png', home_score: 1, away_score: 1 },
        { bracket_group: 'placement', round_group: 'final', match_key: 'archive_2019_place_fifth', sort_order: 1, label: 'Матч за 5 место', home_team: 'Аталанта', home_team_slug: 'atalanta', home_logo: 'images/history-atalanta.png', away_team: 'ЦСКА', away_team_slug: 'cska', away_logo: 'images/history-cska.png', home_score: 0, away_score: 5 },
        { bracket_group: 'placement', round_group: 'final', match_key: 'archive_2019_place_seventh', sort_order: 2, label: 'Матч за 7 место', home_team: 'МТК', home_team_slug: 'mtk', home_logo: 'images/history-mtk.png', away_team: 'Краснодар', away_team_slug: 'krasnodar', away_logo: 'images/history-krasnodar.png', home_score: 1, away_score: 0 }
      ],
      matches: [
        { id: 'archive-2019-1', date: '2019-05-17', time: '12:30', status_label: 'Завершён', score: '6:0', round: '1/4 финала', home_team: 'Алмаз-Антей', home_team_slug: 'almaz-antey', home_logo: 'images/team-almaz-antey.webp', away_team: 'Аталанта', away_team_slug: 'atalanta', away_logo: 'images/history-atalanta.png' },
        { id: 'archive-2019-2', date: '2019-05-17', time: '14:00', status_label: 'Завершён', score: '4:1', round: '1/4 финала', home_team: 'Зенит', home_team_slug: 'zenit', home_logo: 'images/team-zenit.webp', away_team: 'МТК', away_team_slug: 'mtk', away_logo: 'images/history-mtk.png' },
        { id: 'archive-2019-3', date: '2019-05-17', time: '15:30', status_label: 'Завершён', score: '0:1', round: '1/4 финала', home_team: 'Краснодар', home_team_slug: 'krasnodar', home_logo: 'images/history-krasnodar.png', away_team: 'Вильярреал', away_team_slug: 'villarreal', away_logo: 'images/history-villarreal.png' },
        { id: 'archive-2019-4', date: '2019-05-17', time: '17:00', status_label: 'Завершён', score: '0:1', round: '1/4 финала', home_team: 'ЦСКА', home_team_slug: 'cska', home_logo: 'images/history-cska.png', away_team: 'Бока Хуниорс', away_team_slug: 'boca-juniors', away_logo: 'images/history-boca-juniors.png' },
        { id: 'archive-2019-5', date: '2019-05-18', time: '10:00', status_label: 'Завершён', score: '2:0', round: 'Полуфинал 5–8 №1', home_team: 'Аталанта', home_team_slug: 'atalanta', home_logo: 'images/history-atalanta.png', away_team: 'МТК', away_team_slug: 'mtk', away_logo: 'images/history-mtk.png' },
        { id: 'archive-2019-6', date: '2019-05-18', time: '11:30', status_label: 'Завершён', score: '1:1', round: 'Полуфинал 5–8 №2', home_team: 'Краснодар', home_team_slug: 'krasnodar', home_logo: 'images/history-krasnodar.png', away_team: 'ЦСКА', away_team_slug: 'cska', away_logo: 'images/history-cska.png' },
        { id: 'archive-2019-7', date: '2019-05-18', time: '13:00', status_label: 'Завершён', score: '0:1', round: 'Полуфинал 1–4 №2', home_team: 'Алмаз-Антей', home_team_slug: 'almaz-antey', home_logo: 'images/team-almaz-antey.webp', away_team: 'Зенит', away_team_slug: 'zenit', away_logo: 'images/team-zenit.webp' },
        { id: 'archive-2019-8', date: '2019-05-18', time: '14:30', status_label: 'Завершён', score: '3:0', round: 'Полуфинал 1–4 №1', home_team: 'Вильярреал', home_team_slug: 'villarreal', home_logo: 'images/history-villarreal.png', away_team: 'Бока Хуниорс', away_team_slug: 'boca-juniors', away_logo: 'images/history-boca-juniors.png' },
        { id: 'archive-2019-9', date: '2019-05-19', time: '10:00', status_label: 'Завершён', score: '1:0', round: 'Матч за 7 место', home_team: 'МТК', home_team_slug: 'mtk', home_logo: 'images/history-mtk.png', away_team: 'Краснодар', away_team_slug: 'krasnodar', away_logo: 'images/history-krasnodar.png' },
        { id: 'archive-2019-10', date: '2019-05-19', time: '11:30', status_label: 'Завершён', score: '0:5', round: 'Матч за 5 место', home_team: 'Аталанта', home_team_slug: 'atalanta', home_logo: 'images/history-atalanta.png', away_team: 'ЦСКА', away_team_slug: 'cska', away_logo: 'images/history-cska.png' },
        { id: 'archive-2019-11', date: '2019-05-19', time: '13:00', status_label: 'Завершён', score: '0:6', round: 'Матч за 3 место', home_team: 'Алмаз-Антей', home_team_slug: 'almaz-antey', home_logo: 'images/team-almaz-antey.webp', away_team: 'Бока Хуниорс', away_team_slug: 'boca-juniors', away_logo: 'images/history-boca-juniors.png' },
        { id: 'archive-2019-12', date: '2019-05-19', time: '14:30', status_label: 'Завершён', score: '0:3', round: 'Финал', home_team: 'Зенит', home_team_slug: 'zenit', home_logo: 'images/team-zenit.webp', away_team: 'Вильярреал', away_team_slug: 'villarreal', away_logo: 'images/history-villarreal.png' }
      ]
    }
  },
  '2018': {
    title: 'Кубок Бурчалкина 2018',
    season: 'Розыгрыш 11 - 13 мая 2018',
    description: 'Матчи, турнирная таблица и сетка плей-офф розыгрыша 2018 года.',
    status: 'Страница прошлого розыгрыша заполнена участниками, результатами и итогами турнира.',
    detail: {
      clubs_count: 8,
      matches_count: 12,
      clubs: [
        { position: 1, name: 'Вильярреал', slug: 'villarreal', logo: 'images/history-villarreal.png', city: 'Вильярреал', country: 'Испания' },
        { position: 2, name: 'Бока Хуниорс', slug: 'boca-juniors', logo: 'images/history-boca-juniors.png', city: 'Буэнос-Айрес', country: 'Аргентина' },
        { position: 3, name: 'Зенит', slug: 'zenit', logo: 'images/team-zenit.webp', city: 'Санкт-Петербург', country: 'Россия' },
        { position: 4, name: 'Рома', slug: 'roma', logo: 'images/history-roma.png', city: 'Рим', country: 'Италия' },
        { position: 5, name: 'Алмаз-Антей', slug: 'almaz-antey', logo: 'images/team-almaz-antey.webp', city: 'Санкт-Петербург', country: 'Россия' },
        { position: 6, name: 'Краснодар', slug: 'krasnodar', logo: 'images/history-krasnodar.png', city: 'Краснодар', country: 'Россия' },
        { position: 7, name: 'МТК', slug: 'mtk', logo: 'images/history-mtk.png', city: 'Будапешт', country: 'Венгрия' },
        { position: 8, name: 'ЦСКА', slug: 'cska', logo: 'images/history-cska.png', city: 'Москва', country: 'Россия' }
      ],
      standings: [
        { position: 1, team: 'Вильярреал', slug: 'villarreal', logo: 'images/history-villarreal.png', city: 'Вильярреал', country: 'Испания', played: 3, won: 3, drawn: 0, lost: 0, goals_for: 8, goals_against: 3, points: 9 },
        { position: 2, team: 'Зенит', slug: 'zenit', logo: 'images/team-zenit.webp', city: 'Санкт-Петербург', country: 'Россия', played: 3, won: 2, drawn: 0, lost: 1, goals_for: 8, goals_against: 4, points: 6 },
        { position: 3, team: 'Бока Хуниорс', slug: 'boca-juniors', logo: 'images/history-boca-juniors.png', city: 'Буэнос-Айрес', country: 'Аргентина', played: 3, won: 2, drawn: 0, lost: 1, goals_for: 6, goals_against: 2, points: 6 },
        { position: 4, team: 'Алмаз-Антей', slug: 'almaz-antey', logo: 'images/team-almaz-antey.webp', city: 'Санкт-Петербург', country: 'Россия', played: 3, won: 2, drawn: 0, lost: 1, goals_for: 1, goals_against: 5, points: 6 },
        { position: 5, team: 'Краснодар', slug: 'krasnodar', logo: 'images/history-krasnodar.png', city: 'Краснодар', country: 'Россия', played: 3, won: 1, drawn: 0, lost: 2, goals_for: 8, goals_against: 3, points: 3 },
        { position: 6, team: 'Рома', slug: 'roma', logo: 'images/history-roma.png', city: 'Рим', country: 'Италия', played: 3, won: 1, drawn: 0, lost: 2, goals_for: 3, goals_against: 8, points: 3 },
        { position: 7, team: 'МТК', slug: 'mtk', logo: 'images/history-mtk.png', city: 'Будапешт', country: 'Венгрия', played: 3, won: 1, drawn: 0, lost: 2, goals_for: 2, goals_against: 10, points: 3 },
        { position: 8, team: 'ЦСКА', slug: 'cska', logo: 'images/history-cska.png', city: 'Москва', country: 'Россия', played: 3, won: 0, drawn: 0, lost: 3, goals_for: 2, goals_against: 3, points: 0 }
      ],
      playoff: [
        { bracket_group: 'top', round_group: 'semifinal', match_key: 'archive_2018_top_sf1', sort_order: 1, label: 'Полуфинал 1–4 №1', home_team: 'Вильярреал', home_team_slug: 'villarreal', home_logo: 'images/history-villarreal.png', away_team: 'Рома', away_team_slug: 'roma', away_logo: 'images/history-roma.png', home_score: 4, away_score: 1 },
        { bracket_group: 'top', round_group: 'semifinal', match_key: 'archive_2018_top_sf2', sort_order: 2, label: 'Полуфинал 1–4 №2', home_team: 'Зенит', home_team_slug: 'zenit', home_logo: 'images/team-zenit.webp', away_team: 'Бока Хуниорс', away_team_slug: 'boca-juniors', away_logo: 'images/history-boca-juniors.png', home_score: 1, away_score: 2 },
        { bracket_group: 'top', round_group: 'final', match_key: 'archive_2018_top_final', sort_order: 1, label: 'Матч за 1 место', home_team: 'Бока Хуниорс', home_team_slug: 'boca-juniors', home_logo: 'images/history-boca-juniors.png', away_team: 'Вильярреал', away_team_slug: 'villarreal', away_logo: 'images/history-villarreal.png', home_score: 0, away_score: 1 },
        { bracket_group: 'top', round_group: 'final', match_key: 'archive_2018_top_third', sort_order: 2, label: 'Матч за 3 место', home_team: 'Зенит', home_team_slug: 'zenit', home_logo: 'images/team-zenit.webp', away_team: 'Рома', away_team_slug: 'roma', away_logo: 'images/history-roma.png', home_score: 4, away_score: 2 },
        { bracket_group: 'placement', round_group: 'semifinal', match_key: 'archive_2018_place_sf1', sort_order: 1, label: 'Полуфинал 5–8 №1', home_team: 'МТК', home_team_slug: 'mtk', home_logo: 'images/history-mtk.png', away_team: 'Краснодар', away_team_slug: 'krasnodar', away_logo: 'images/history-krasnodar.png', home_score: 0, away_score: 6 },
        { bracket_group: 'placement', round_group: 'semifinal', match_key: 'archive_2018_place_sf2', sort_order: 2, label: 'Полуфинал 5–8 №2', home_team: 'ЦСКА', home_team_slug: 'cska', home_logo: 'images/history-cska.png', away_team: 'Алмаз-Антей', away_team_slug: 'almaz-antey', away_logo: 'images/team-almaz-antey.webp', home_score: 1, away_score: 1 },
        { bracket_group: 'placement', round_group: 'final', match_key: 'archive_2018_place_fifth', sort_order: 1, label: 'Матч за 5 место', home_team: 'Алмаз-Антей', home_team_slug: 'almaz-antey', home_logo: 'images/team-almaz-antey.webp', away_team: 'Краснодар', away_team_slug: 'krasnodar', away_logo: 'images/history-krasnodar.png', home_score: 0, away_score: 0 },
        { bracket_group: 'placement', round_group: 'final', match_key: 'archive_2018_place_seventh', sort_order: 2, label: 'Матч за 7 место', home_team: 'МТК', home_team_slug: 'mtk', home_logo: 'images/history-mtk.png', away_team: 'ЦСКА', away_team_slug: 'cska', away_logo: 'images/history-cska.png', home_score: 2, away_score: 1 }
      ],
      matches: [
        { id: 'archive-2018-1', date: '2018-05-11', time: '12:30', status_label: 'Завершён', score: '0:4', round: '1/4 финала', home_team: 'Алмаз-Антей', home_team_slug: 'almaz-antey', home_logo: 'images/team-almaz-antey.webp', away_team: 'Бока Хуниорс', away_team_slug: 'boca-juniors', away_logo: 'images/history-boca-juniors.png' },
        { id: 'archive-2018-2', date: '2018-05-11', time: '14:00', status_label: 'Завершён', score: '0:0', round: '1/4 финала', home_team: 'ЦСКА', home_team_slug: 'cska', home_logo: 'images/history-cska.png', away_team: 'Рома', away_team_slug: 'roma', away_logo: 'images/history-roma.png' },
        { id: 'archive-2018-3', date: '2018-05-11', time: '15:30', status_label: 'Завершён', score: '2:3', round: '1/4 финала', home_team: 'Краснодар', home_team_slug: 'krasnodar', home_logo: 'images/history-krasnodar.png', away_team: 'Вильярреал', away_team_slug: 'villarreal', away_logo: 'images/history-villarreal.png' },
        { id: 'archive-2018-4', date: '2018-05-11', time: '17:00', status_label: 'Завершён', score: '3:0', round: '1/4 финала', home_team: 'Зенит', home_team_slug: 'zenit', home_logo: 'images/team-zenit.webp', away_team: 'МТК', away_team_slug: 'mtk', away_logo: 'images/history-mtk.png' },
        { id: 'archive-2018-5', date: '2018-05-12', time: '10:00', status_label: 'Завершён', score: '1:1', round: 'Полуфинал 5–8 №2', home_team: 'ЦСКА', home_team_slug: 'cska', home_logo: 'images/history-cska.png', away_team: 'Алмаз-Антей', away_team_slug: 'almaz-antey', away_logo: 'images/team-almaz-antey.webp' },
        { id: 'archive-2018-6', date: '2018-05-12', time: '11:30', status_label: 'Завершён', score: '0:6', round: 'Полуфинал 5–8 №1', home_team: 'МТК', home_team_slug: 'mtk', home_logo: 'images/history-mtk.png', away_team: 'Краснодар', away_team_slug: 'krasnodar', away_logo: 'images/history-krasnodar.png' },
        { id: 'archive-2018-7', date: '2018-05-12', time: '13:00', status_label: 'Завершён', score: '1:2', round: 'Полуфинал 1–4 №2', home_team: 'Зенит', home_team_slug: 'zenit', home_logo: 'images/team-zenit.webp', away_team: 'Бока Хуниорс', away_team_slug: 'boca-juniors', away_logo: 'images/history-boca-juniors.png' },
        { id: 'archive-2018-8', date: '2018-05-12', time: '14:30', status_label: 'Завершён', score: '4:1', round: 'Полуфинал 1–4 №1', home_team: 'Вильярреал', home_team_slug: 'villarreal', home_logo: 'images/history-villarreal.png', away_team: 'Рома', away_team_slug: 'roma', away_logo: 'images/history-roma.png' },
        { id: 'archive-2018-9', date: '2018-05-13', time: '10:00', status_label: 'Завершён', score: '2:1', round: 'Матч за 7 место', home_team: 'МТК', home_team_slug: 'mtk', home_logo: 'images/history-mtk.png', away_team: 'ЦСКА', away_team_slug: 'cska', away_logo: 'images/history-cska.png' },
        { id: 'archive-2018-10', date: '2018-05-13', time: '11:30', status_label: 'Завершён', score: '0:0', round: 'Матч за 5 место', home_team: 'Алмаз-Антей', home_team_slug: 'almaz-antey', home_logo: 'images/team-almaz-antey.webp', away_team: 'Краснодар', away_team_slug: 'krasnodar', away_logo: 'images/history-krasnodar.png' },
        { id: 'archive-2018-11', date: '2018-05-13', time: '13:00', status_label: 'Завершён', score: '4:2', round: 'Матч за 3 место', home_team: 'Зенит', home_team_slug: 'zenit', home_logo: 'images/team-zenit.webp', away_team: 'Рома', away_team_slug: 'roma', away_logo: 'images/history-roma.png' },
        { id: 'archive-2018-12', date: '2018-05-13', time: '14:30', status_label: 'Завершён', score: '0:1', round: 'Финал', home_team: 'Бока Хуниорс', home_team_slug: 'boca-juniors', home_logo: 'images/history-boca-juniors.png', away_team: 'Вильярреал', away_team_slug: 'villarreal', away_logo: 'images/history-villarreal.png' }
      ]
    }
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
    archived: 'Прошлый розыгрыш',
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

function getCurrentClubFallback(slug) {
  return CURRENT_CLUB_FALLBACKS[String(slug || '').trim()] || null;
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

function normalizeParticipationYears(years = []) {
  if (!Array.isArray(years)) return [];

  return Array.from(new Set(
    years
      .map(value => Number(value))
      .filter(value => Number.isFinite(value))
  )).sort((left, right) => left - right);
}

function formatParticipationYears(years = []) {
  const normalized = normalizeParticipationYears(years);
  if (!normalized.length) return '';

  const ranges = [];
  let rangeStart = normalized[0];
  let previous = normalized[0];

  for (let index = 1; index <= normalized.length; index += 1) {
    const current = normalized[index];
    if (current === previous + 1) {
      previous = current;
      continue;
    }

    ranges.push(rangeStart === previous ? String(rangeStart) : `${rangeStart} - ${previous}`);
    rangeStart = current;
    previous = current;
  }

  return ranges.join(', ');
}

function normalizeTournamentDisplayName(value = '') {
  const raw = String(value || '').trim();
  if (!raw) return '';

  const match = raw.match(/^Burchalkin Cup(?:\s+(\d{4}))?$/i);
  if (match) {
    return match[1] ? `Кубок Бурчалкина ${match[1]}` : 'Кубок Бурчалкина';
  }

  return raw;
}

function extractParticipationLabel(description = '') {
  const match = String(description || '').match(/(?:Исторический\s+)?Участник\s+(.+?)(?:\.|$)/i);
  return match ? String(match[1] || '').trim() : '';
}

function buildFallbackClubSummary(item = {}, participationLabel = '') {
  const name = String(item?.name || '').trim();
  const locationLabel = formatClubLocation(item);
  const isCurrentClub = CURRENT_CLUB_SLUGS.has(String(item?.slug || '').trim());

  if (isCurrentClub && locationLabel) {
    return `${name} — участник текущего розыгрыша Кубка Бурчалкина из ${locationLabel}. Команда входит в международный состав турнира сезона 2026.`;
  }

  if (participationLabel && locationLabel) {
    return `${name} — клуб из ${locationLabel}, входящий в историю Кубка Бурчалкина. Команда участвовала в турнире в ${participationLabel}.`;
  }

  if (locationLabel) {
    return `${name} — клуб из ${locationLabel}, связанный с международной историей Кубка Бурчалкина.`;
  }

  return `${name} — участник Кубка Бурчалкина разных лет.`;
}

function getClubParticipationEntries(slug, years = []) {
  const normalizedSlug = String(slug || '').trim();
  const seasonResults = CLUB_SEASON_RESULTS[normalizedSlug] || {};
  const seasonYears = Object.keys(seasonResults)
    .map(value => Number(value))
    .filter(value => Number.isFinite(value));
  const finalYears = normalizeParticipationYears([...years, ...seasonYears]);

  return finalYears.map(year => ({
    year,
    result: String(seasonResults[year] || 'Участник турнира').trim()
  }));
}

function getParticipationChipTone(result = '') {
  const normalizedResult = String(result || '').trim().toLowerCase();
  const placeMatch = normalizedResult.match(/^(\d+)\s*место(?:\s|$)/);

  if (!placeMatch) {
    return '';
  }

  const place = Number(placeMatch[1]);

  if (place === 1) {
    return 'gold';
  }

  if (place === 2) {
    return 'silver';
  }

  if (place === 3) {
    return 'bronze';
  }

  return '';
}

function getClubProfile(item = {}) {
  const slug = String(item?.slug || '').trim();
  const fallback = getHistoricalClubFallback(slug) || {};
  const override = CLUB_PROFILE_OVERRIDES[slug] || {};
  const normalizedYears = normalizeParticipationYears(override.participationYears || []);
  const participationEntries = getClubParticipationEntries(slug, normalizedYears);
  const participationLabel = formatParticipationYears(normalizedYears)
    || extractParticipationLabel(item?.description || fallback.description || '');
  const sourceDescription = String(item?.description || '').trim();
  const isGenericDescription = /^(?:Исторический\s+)?Участник\b/i.test(sourceDescription)
    || /страница клуба.*истории турнира/i.test(sourceDescription);
  const summary = String(
    override.summary
    || (!isGenericDescription ? sourceDescription : '')
    || buildFallbackClubSummary({ ...fallback, ...item }, participationLabel)
  ).trim();

  return {
    summary,
    participationYears: normalizedYears,
    participationEntries,
    participationLabel,
    badge: CURRENT_CLUB_SLUGS.has(slug) ? 'Участник сезона 2026' : 'История турнира'
  };
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
    title: normalizedYear ? `Кубок Бурчалкина ${normalizedYear}` : 'Прошлые розыгрыши Кубка Бурчалкина',
    season: normalizedYear ? `Розыгрыш сезона ${normalizedYear}` : 'Розыгрыш турнира',
    description: 'На этой странице позже появятся команды, результаты, фотографии и материалы прошлого розыгрыша.',
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
  const clubs = Array.isArray(detail.clubs) ? detail.clubs : [];
  if (clubs.length) {
    return clubs
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

function getNormalizedMatchId(item) {
  return String(item?.id || '').trim();
}

function getMatchStatusState(item = {}) {
  const normalizedStatus = String(item?.status || '').trim().toLowerCase();
  if (normalizedStatus === 'live' || normalizedStatus === 'soon' || normalizedStatus === 'done') {
    return normalizedStatus;
  }

  const normalizedLabel = String(item?.status_label || '').trim().toLowerCase();
  if (normalizedLabel.includes('эфир') || normalizedLabel.includes('live')) return 'live';
  if (normalizedLabel.includes('заверш')) return 'done';
  return 'soon';
}

function isCompletedMatch(item = {}) {
  return getMatchStatusState(item) === 'done';
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

  return joinNonEmpty([dateLabel, time], ' • ') || 'Матч прошлых розыгрышей';
}

function getArchiveFallbackMatches() {
  return Object.entries(ARCHIVE_TOURNAMENTS).flatMap(([year, archive]) => {
    const tournamentName = String(archive?.title || `Кубок Бурчалкина ${year}`).trim();
    const matches = Array.isArray(archive?.detail?.matches) ? archive.detail.matches : [];

    return matches.map(match => ({
      ...match,
      tournament_name: String(match?.tournament_name || tournamentName).trim(),
      archive_year: String(year).trim()
    }));
  });
}

function getAllKnownMatches(currentMatches = []) {
  const seen = new Set();
  return [...(Array.isArray(currentMatches) ? currentMatches : []), ...getArchiveFallbackMatches()]
    .filter(match => {
      const key = getNormalizedMatchId(match);
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

function findMatchById(matches = [], requestedId = '') {
  const normalizedId = String(requestedId || '').trim();
  if (!normalizedId) return matches[0] || null;

  const exactMatch = matches.find(match => getNormalizedMatchId(match) === normalizedId);
  if (exactMatch) return exactMatch;

  const numericId = Number(normalizedId);
  if (Number.isFinite(numericId)) {
    return matches.find(match => Number(match?.id) === numericId) || null;
  }

  return null;
}

function getMatchPageUrl(item = {}) {
  const id = getNormalizedMatchId(item);
  return id ? `match.html?id=${encodeURIComponent(id)}` : 'match.html';
}

function getHeadToHeadMatches(allMatches, currentMatch) {
  const homeKey = getMatchClubKey(currentMatch, 'home');
  const awayKey = getMatchClubKey(currentMatch, 'away');
  const currentMatchId = getNormalizedMatchId(currentMatch);
  if (!homeKey || !awayKey) return [];

  return (Array.isArray(allMatches) ? allMatches : [])
    .filter(match => {
      if (!match || getNormalizedMatchId(match) === currentMatchId) return false;
      if (!isCompletedMatch(match)) return false;

      const matchHomeKey = getMatchClubKey(match, 'home');
      const matchAwayKey = getMatchClubKey(match, 'away');

      return (
        (matchHomeKey === homeKey && matchAwayKey === awayKey) ||
        (matchHomeKey === awayKey && matchAwayKey === homeKey)
      );
    })
    .sort((left, right) => getMatchSortValue(right) - getMatchSortValue(left));
}

function getMatchesForClub(allMatches = [], club = {}) {
  const slugKey = String(club?.slug || '').trim().toLowerCase();
  const nameKey = String(club?.name || '').trim().toLowerCase();

  if (!slugKey && !nameKey) return [];

  return (Array.isArray(allMatches) ? allMatches : [])
    .filter(match => {
      const homeKey = getMatchClubKey(match, 'home');
      const awayKey = getMatchClubKey(match, 'away');
      return homeKey === slugKey || awayKey === slugKey || homeKey === nameKey || awayKey === nameKey;
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

function buildNewsArticlePhotos(item, coverImage = '') {
  const photos = [];
  const seen = new Set();

  const pushPhoto = (src, alt = '') => {
    const imageUrl = String(src || '').trim();
    if (!imageUrl) return;
    const normalizedKey = normalizeNewsImageUrl(imageUrl) || imageUrl;
    if (seen.has(normalizedKey)) return;
    seen.add(normalizedKey);
    photos.push({
      image_url: imageUrl,
      alt_text: String(alt || '').trim(),
    });
  };

  pushPhoto(coverImage, String(item?.title || '').trim());

  if (Array.isArray(item?.photos)) {
    item.photos.forEach(photo => {
      pushPhoto(photo?.image_url, photo?.alt_text || item?.title || '');
    });
  }

  return photos;
}

function normalizeNewsImageUrl(value = '') {
  return String(value || '').trim().split('#')[0].split('?')[0];
}

function collectNewsBodyImageUrls(bodyHtml = '') {
  const urls = new Set();
  const html = String(bodyHtml || '').trim();
  if (!html) return urls;

  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    doc.querySelectorAll('img[src]').forEach((img) => {
      const src = normalizeNewsImageUrl(img.getAttribute('src') || '');
      if (src) urls.add(src);
    });
  } catch (error) {
    const pattern = /<img\b[^>]*\bsrc=["']([^"']+)["']/gi;
    let match;
    while ((match = pattern.exec(html)) !== null) {
      const src = normalizeNewsImageUrl(match[1] || '');
      if (src) urls.add(src);
    }
  }

  return urls;
}

function getNewsArticleParagraphs(item) {
  if (Array.isArray(item?.content)) {
    return item.content.map(paragraph => String(paragraph || '').trim()).filter(Boolean);
  }

  return String(item?.body || '')
    .split(/\n\s*\n+/)
    .map(paragraph => String(paragraph || '').trim())
    .filter(Boolean);
}

function getNewsArticleBodyHtml(item = {}) {
  return String(item?.body_html || '').trim();
}

function stripNewsArticleImagesFromBodyHtml(bodyHtml = '') {
  const html = String(bodyHtml || '').trim();
  if (!html) return '';

  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(`<div id="news-body-root">${html}</div>`, 'text/html');
    const root = doc.getElementById('news-body-root');
    if (!root) return html;

    root.querySelectorAll('img, picture, figure').forEach((node) => node.remove());
    root.querySelectorAll('p').forEach((paragraph) => {
      if (stripHtmlToPlainText(paragraph.innerHTML) === '') {
        paragraph.remove();
      }
    });

    const sanitized = root.innerHTML.trim();
    return sanitized;
  } catch (error) {
    return html
      .replace(/<picture[\s\S]*?<\/picture>/gi, ' ')
      .replace(/<figure[\s\S]*?<\/figure>/gi, ' ')
      .replace(/<img\b[^>]*>/gi, ' ')
      .replace(/<p>(?:\s|&nbsp;|<br\s*\/?>)*<\/p>/gi, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }
}

function decodeHtmlEntities(value = '') {
  return String(value || '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&#8212;|&mdash;/gi, '—')
    .replace(/&#171;|&laquo;/gi, '«')
    .replace(/&#187;|&raquo;/gi, '»')
    .replace(/&#8211;|&ndash;/gi, '–')
    .replace(/&#8230;|&hellip;/gi, '...')
    .replace(/&#(\d+);/g, (_, code) => {
      const value = Number.parseInt(code, 10);
      return Number.isFinite(value) ? String.fromCharCode(value) : '';
    })
    .replace(/&quot;/gi, '"')
    .replace(/&amp;/gi, '&');
}

function stripHtmlToPlainText(value = '') {
  return decodeHtmlEntities(
    String(value || '')
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<br\s*\/?>/gi, ' ')
      .replace(/<\/p>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
  )
    .replace(/\s+/g, ' ')
    .trim();
}

function shouldHideLowInfoVideoArticleBody(bodyHtml = '', fallbackText = '', videoUrl = '') {
  if (!videoUrl) return false;

  const plainBody = stripHtmlToPlainText(bodyHtml);
  const plainFallback = stripHtmlToPlainText(fallbackText);
  const combined = [plainBody, plainFallback].filter(Boolean).join(' ').trim();
  if (!combined) return true;

  if (/^https?:\/\//i.test(combined)) return true;
  if (/^Видео\s*:?\s*/i.test(combined) && combined.length <= 180) return true;
  if (combined.length <= 90) return true;

  return false;
}

function getNewsArticleEnrichment(item = {}) {
  const slug = String(item?.slug || '').trim();
  return NEWS_ARTICLE_ENRICHMENTS[slug] || null;
}

function getNewsArticleVideoUrl(item = {}) {
  const directUrl = String(item?.video_url || item?.video || '').trim();
  if (directUrl) return directUrl;
  return String(getNewsArticleEnrichment(item)?.video_url || '').trim();
}

function formatNewsDisplayDate(value) {
  return formatTournamentDisplayDate(value) || String(value || '').trim();
}

function splitLinkSuffix(value) {
  let core = String(value || '');
  let suffix = '';
  while (/[),.;!?]$/.test(core)) {
    suffix = core.slice(-1) + suffix;
    core = core.slice(0, -1);
  }
  return { core, suffix };
}

function renderLinkedText(value) {
  const text = String(value || '');
  if (!text) return '';

  const pattern = /(https?:\/\/[^\s<>"']+|[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,})/giu;
  let result = '';
  let lastIndex = 0;
  let match;

  while ((match = pattern.exec(text)) !== null) {
    const start = match.index;
    const rawToken = match[0];
    const { core, suffix } = splitLinkSuffix(rawToken);
    const end = start + rawToken.length;

    result += escapeHtml(text.slice(lastIndex, start));

    if (core) {
      const isEmail = !core.startsWith('http://') && !core.startsWith('https://');
      const href = isEmail ? `mailto:${core}` : core;
      result += `<a href="${escapeHtml(href)}" target="_blank" rel="noreferrer">${escapeHtml(core)}</a>`;
    }

    if (suffix) {
      result += escapeHtml(suffix);
    }

    lastIndex = end;
  }

  result += escapeHtml(text.slice(lastIndex));
  return result;
}

function normalizeNewsInlineImageKey(value = '') {
  const source = String(value || '').trim();
  if (!source) return '';
  const fileName = source.split('?')[0].split('/').pop() || '';
  return fileName
    .replace(/\.[a-z0-9]+$/i, '')
    .replace(/-\d+x\d+$/i, '')
    .replace(/-\d{10,}$/i, '')
    .replace(/[_\s-]+/g, '')
    .toLowerCase();
}

function enhanceNewsArticleBody(root, photos = []) {
  if (!root) return;

  const photoIndexMap = new Map();
  photos.forEach((photo, index) => {
    const key = normalizeNewsInlineImageKey(photo?.image_url);
    if (key && !photoIndexMap.has(key)) {
      photoIndexMap.set(key, index);
    }
  });

  root.querySelectorAll('a[href]').forEach((link) => {
    const href = String(link.getAttribute('href') || '').trim();
    if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return;
    link.setAttribute('target', '_blank');
    link.setAttribute('rel', 'noreferrer noopener');
  });

  root.querySelectorAll('img').forEach((image) => {
    image.classList.add('news-article-inline-image');
    image.removeAttribute('width');
    image.removeAttribute('height');
    image.removeAttribute('srcset');
    image.removeAttribute('sizes');

    const photoIndex = photoIndexMap.get(normalizeNewsInlineImageKey(image.getAttribute('src') || ''));
    if (photoIndex == null) return;

    image.dataset.albumPhotoIndex = String(photoIndex);
    image.setAttribute('role', 'button');
    image.setAttribute('tabindex', '0');
    image.setAttribute('aria-label', `Открыть фотографию ${photoIndex + 1}`);

    const openPhoto = (event) => {
      event.preventDefault();
      const trigger = document.querySelector(`.news-article-card [data-album-photo-index="${photoIndex}"]`);
      if (trigger && typeof trigger.click === 'function') {
        trigger.click();
      }
    };

    image.addEventListener('click', openPhoto);
    image.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        openPhoto(event);
      }
    });
  });
}

function isDirectVideoFile(url) {
  return /\.(mp4|webm|ogg|mov)(?:$|\?)/i.test(String(url || '').trim());
}

function renderNewsArticleMedia(item, imageSrc = '') {
  const videoUrl = getNewsArticleVideoUrl(item);
  if (!videoUrl) {
    const articlePhotos = buildNewsArticlePhotos(item, imageSrc);
    return articlePhotos[0]
      ? renderNewsArticlePhotoButton(articlePhotos[0], 0, 'news-article-cover')
      : renderNewsCoverImage('', item?.title, 'news-article-cover');
  }

  const poster = imageSrc ? getOptimizedImageUrl(imageSrc, { width: 960 }) : '';
  if (isDirectVideoFile(videoUrl)) {
    return `
      <div class="news-article-video-wrap">
        <video class="news-article-video" controls preload="metadata" playsinline${poster ? ` poster="${escapeHtml(poster)}"` : ''}>
          <source src="${escapeHtml(videoUrl)}" type="video/mp4">
        </video>
      </div>
    `;
  }

  return `
    <div class="news-article-video-wrap">
      <iframe class="news-article-video-frame" src="${escapeHtml(videoUrl)}" allowfullscreen></iframe>
    </div>
  `;
}

function renderNewsArticlePhotoButton(photo, index, className = 'news-article-gallery-item') {
  const imageUrl = String(photo?.image_url || '').trim();
  const altText = String(photo?.alt_text || '').trim();
  if (!imageUrl) return '';

  return `
    <button
      class="${escapeHtml(className)}"
      type="button"
      data-album-photo-index="${index}"
      aria-label="Открыть фотографию ${index + 1}"
    >
      ${renderImageMarkup({
        src: imageUrl,
        alt: altText,
        className: `${className}-img`,
        width: 960
      })}
    </button>
  `;
}

function resolveNewsImage(item) {
  const primaryImage = String(item?.image || '').trim();
  if (primaryImage) return primaryImage;

  const firstGalleryImage = Array.isArray(item?.photos)
    ? String(item.photos.find(photo => String(photo?.image_url || '').trim())?.image_url || '').trim()
    : '';
  if (firstGalleryImage) return firstGalleryImage;

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
  const apiBaseCandidates = getApiBaseCandidates();
  if (!apiBaseCandidates.length) return null;

  let lastError = null;
  for (const apiBaseUrl of apiBaseCandidates) {
    try {
      const url = new URL(path, `${apiBaseUrl}/`);
      url.searchParams.set('_ts', String(Date.now()));
      const response = await fetch(url.toString(), {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          Pragma: 'no-cache'
        }
      });
      if (!response.ok) {
        lastError = new Error(`Failed to load ${path} from ${apiBaseUrl} (${response.status})`);
        continue;
      }
      return response.json();
    } catch (error) {
      lastError = error;
    }
  }

  console.warn(`Remote API ${path} is unavailable.`, lastError);
  return null;
}

async function fetchJson(path) {
  const cacheVersionKey = 'bcup_cache_version';
  const isLocalDev = /^(localhost|127\.0\.0\.1)$/i.test(window.location.hostname);
  try {
    const currentVersion = localStorage.getItem(cacheVersionKey);
    if (currentVersion !== APP_CACHE_VERSION) {
      Object.keys(localStorage)
        .filter(key => key.startsWith('bcup_') && key !== cacheVersionKey)
        .forEach(key => localStorage.removeItem(key));
      localStorage.setItem(cacheVersionKey, APP_CACHE_VERSION);
    }
  } catch (e) {}

  const allowStaticFallback = isLocalDev;
  const storageKeyMap = {
    'data/standings.json': 'bcup_standings',
    'data/matches.json': 'bcup_matches',
    'data/news.json': 'bcup_news',
    'data/results.json': 'bcup_results',
  };
  const storageKey = storageKeyMap[path];
  const apiBaseUrl = getApiBaseUrl();
  const endpoint = API_ENDPOINTS[path];
  if (apiBaseUrl && endpoint) {
    try {
      const remoteData = await fetchApi(endpoint);
      if (remoteData && (path !== 'data/standings.json' || hasExpandedStandingsFields(remoteData))) {
        if (allowStaticFallback && storageKey) {
          try {
            localStorage.setItem(storageKey, JSON.stringify(remoteData));
          } catch (e) {}
        }
        return remoteData;
      }
    } catch (error) {
      console.warn(`Remote API ${endpoint} is unavailable.`, error);
      if (!allowStaticFallback) {
        return null;
      }
    }
  }
  if (allowStaticFallback && storageKey) {
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
  if (!allowStaticFallback && endpoint) {
    return null;
  }
  const response = await fetch(path);
  if (!response.ok) throw new Error(`Failed to load ${path}`);
  return response.json();
}

async function renderEditableStaticPage() {
  const page = document.querySelector('[data-editable-page]');
  if (!page) return;

  const slug = String(page.dataset.editablePage || '').trim();
  const titleNode = page.querySelector('[data-page-title]');
  const subtitleNode = page.querySelector('[data-page-subtitle]');
  const bodyNode = page.querySelector('[data-page-body]');
  if (!slug || !titleNode || !subtitleNode || !bodyNode) return;

  const data = await fetchApi(`/api/pages/${encodeURIComponent(slug)}`);
  if (!data || typeof data !== 'object') return;

  const title = String(data.title || '').trim();
  const subtitle = String(data.subtitle || '').trim();
  const bodyHtml = String(data.body_html || '').trim();
  if (!title && !subtitle && !bodyHtml) return;

  if (title) titleNode.textContent = title;
  if (subtitle) subtitleNode.textContent = subtitle;
  if (bodyHtml) bodyNode.innerHTML = bodyHtml;
  initContactsMapToggle(page);

  document.title = `Burchalkin Cup — ${title || titleNode.textContent.trim() || ''}`.trim();
  document.documentElement.dataset.bcOriginalTitle = document.title;
  upgradeStaticImagesForCloudinary();
  if (window.BCI18N?.translateTextTree) {
    window.BCI18N.translateTextTree(page);
  }
  if (typeof runAutoFit === 'function') {
    runAutoFit();
  }
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

function isPlaceholderClub(item = {}) {
  return /^placeholder-team-\d+$/i.test(String(item.slug || '').trim());
}

function renderClubCardSkeleton(index = 0) {
  return `
    <div class="team-logo-card team-logo-card-skeleton" aria-hidden="true">
      <div class="team-logo-wrap team-logo-wrap-skeleton"></div>
      <div class="team-logo-title-skeleton" style="width:${68 + (index % 3) * 8}%"></div>
      <div class="team-logo-meta-skeleton" style="width:${54 + (index % 4) * 6}%"></div>
    </div>
  `;
}

function renderLoadingLine(width = '100%', className = '') {
  const normalizedWidth = typeof width === 'number' ? `${width}%` : width;
  return `<div class="loading-skeleton-block loading-skeleton-line ${className}" style="width:${escapeHtml(normalizedWidth)}"></div>`;
}

function renderLoadingStateCard(message = 'Загружаем данные...') {
  return `
    <div class="card media-loading-card site-loading-state-card">
      <div class="site-loading-copy">
        <div class="site-loading-label">${escapeHtml(message)}</div>
        <div class="site-loading-stack">
          ${renderLoadingLine('72%')}
          ${renderLoadingLine('54%')}
        </div>
      </div>
    </div>
  `;
}

function renderUpcomingCardLoading(index = 0) {
  return `
    <div class="upcoming-card site-loading-card" aria-hidden="true">
      <div class="upcoming-header">
        <div class="site-loading-stack">
          ${renderLoadingLine(`${38 + (index % 3) * 8}%`, 'loading-skeleton-line--sm')}
          ${renderLoadingLine(`${56 + (index % 4) * 8}%`)}
        </div>
        <div class="loading-skeleton-block loading-skeleton-pill"></div>
      </div>
      <div class="upcoming-teams">
        ${[0, 1].map((rowIndex) => `
          <div class="upcoming-team-row site-loading-match-row">
            <div class="loading-skeleton-block loading-skeleton-logo"></div>
            ${renderLoadingLine(`${58 + ((index + rowIndex) % 3) * 10}%`, 'loading-skeleton-line--md')}
            <div class="loading-skeleton-block loading-skeleton-score"></div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function renderNewsCardLoading(index = 0) {
  return `
    <div class="news-preview-card site-loading-card" aria-hidden="true">
      <div class="news-preview-cover loading-skeleton-block"></div>
      <div class="news-preview-content">
        ${renderLoadingLine(`${28 + (index % 3) * 8}%`, 'loading-skeleton-line--sm')}
        <div class="site-loading-stack">
          ${renderLoadingLine(`${74 - (index % 2) * 10}%`, 'loading-skeleton-line--lg')}
          ${renderLoadingLine(`${62 + (index % 3) * 8}%`, 'loading-skeleton-line--lg')}
        </div>
        <div class="site-loading-stack">
          ${renderLoadingLine('92%')}
          ${renderLoadingLine(`${78 - (index % 3) * 8}%`)}
        </div>
      </div>
    </div>
  `;
}

function renderTournamentCardLoading(index = 0) {
  return `
    <div class="tournament-card site-loading-card" aria-hidden="true">
      <div class="tournament-card-top">
        <div class="loading-skeleton-block loading-skeleton-pill" style="width:74px"></div>
        <div class="loading-skeleton-block loading-skeleton-pill" style="width:${88 + (index % 2) * 20}px"></div>
      </div>
      <div class="site-loading-copy">
        ${renderLoadingLine(`${62 + (index % 3) * 8}%`, 'loading-skeleton-line--lg')}
        ${renderLoadingLine('86%')}
        ${renderLoadingLine(`${68 + (index % 3) * 8}%`)}
      </div>
      <div class="site-loading-stack">
        ${renderLoadingLine('44%')}
        ${renderLoadingLine('38%')}
      </div>
      ${renderLoadingLine(`${42 + (index % 2) * 18}%`)}
      <div class="loading-skeleton-block loading-skeleton-button"></div>
    </div>
  `;
}

function renderMediaFeatureLoading() {
  return `
    <section class="card media-feature-card site-loading-card" aria-hidden="true">
      <div class="media-feature-shell">
        <div class="site-loading-copy">
          <div class="site-loading-stack">
            ${renderLoadingLine('28%', 'loading-skeleton-line--sm')}
            ${renderLoadingLine('62%', 'loading-skeleton-line--xl')}
            ${renderLoadingLine('48%')}
          </div>
          <div class="site-loading-stack">
            ${renderLoadingLine('96%')}
            ${renderLoadingLine('92%')}
            ${renderLoadingLine('78%')}
          </div>
          <div class="loading-skeleton-block loading-skeleton-button"></div>
        </div>
        <div class="loading-skeleton-block site-loading-media-frame"></div>
      </div>
    </section>
  `;
}

function renderDetailPageLoading(message = 'Загружаем страницу...') {
  return `
    <section class="section">
      <div class="container">
        <div class="card site-loading-card site-loading-detail-card" aria-hidden="true">
          <div class="site-loading-copy">
            ${renderLoadingLine('24%', 'loading-skeleton-line--sm')}
            ${renderLoadingLine('56%', 'loading-skeleton-line--xl')}
            ${renderLoadingLine('38%')}
          </div>
          <div class="loading-skeleton-block site-loading-detail-media"></div>
          <div class="site-loading-stack">
            ${renderLoadingLine('94%')}
            ${renderLoadingLine('88%')}
            ${renderLoadingLine('74%')}
          </div>
          <div class="site-loading-note">${escapeHtml(message)}</div>
        </div>
      </div>
    </section>
  `;
}

function renderStandingsLoadingCard() {
  return `
    <div class="standings-card site-loading-card" aria-hidden="true">
      <div class="standings-scroll">
        <div class="site-loading-detail-card">
          <div class="site-loading-stack">
            ${renderLoadingLine('26%', 'loading-skeleton-line--sm')}
            ${renderLoadingLine('42%', 'loading-skeleton-line--lg')}
          </div>
          <div class="site-loading-stack">
            ${renderLoadingLine('100%')}
            ${renderLoadingLine('96%')}
            ${renderLoadingLine('92%')}
            ${renderLoadingLine('88%')}
          </div>
        </div>
      </div>
    </div>
  `;
}

async function renderClubsGrid(selector, limit = null) {
  const target = document.querySelector(selector);
  if (!target) return;
  const skeletonCount = limit || 8;
  target.setAttribute('aria-busy', 'true');
  target.innerHTML = Array.from({ length: skeletonCount }, (_, index) => renderClubCardSkeleton(index)).join('');
  const clubs = await fetchApi('/api/clubs');
  if (!clubs) {
    target.innerHTML = renderLoadingStateCard('Не удалось загрузить команды.');
    target.setAttribute('aria-busy', 'false');
    return;
  }
  const publicClubs = clubs.filter(club => !isPlaceholderClub(club));
  const items = limit ? publicClubs.slice(0, limit) : publicClubs;
  target.innerHTML = items.map(renderClubCard).join('');
  target.setAttribute('aria-busy', 'false');
  runAutoFit();
}

async function renderTournamentsGrid() {
  const target = document.querySelector('#home-tournaments');
  if (!target) return;
  target.setAttribute('aria-busy', 'true');
  target.innerHTML = Array.from({ length: 2 }, (_, index) => renderTournamentCardLoading(index)).join('');
  const tournaments = await fetchApi('/api/tournaments');
  const liveTournaments = Array.isArray(tournaments) ? tournaments : [];
  const archiveEntries = buildArchiveTournamentEntries().filter(archiveItem => {
    return !liveTournaments.some(item => Number(item?.season_year || 0) === Number(archiveItem.season_year || 0));
  });
  const allTournaments = [...liveTournaments, ...archiveEntries];
  if (!allTournaments.length) {
    target.innerHTML = renderLoadingStateCard('Турниры появятся позже.');
    target.setAttribute('aria-busy', 'false');
    return;
  }

  target.innerHTML = allTournaments.map(item => {
    const isArchive = Boolean(item.is_archive) || ['completed', 'archived'].includes(String(item.status || '').trim().toLowerCase()) && Number(item.season_year || 0) < 2026;
    const actionHref = isArchive
      ? `archive-tournament.html?year=${encodeURIComponent(String(item.season_year || ''))}${item.slug ? `&slug=${encodeURIComponent(item.slug)}` : ''}`
      : `results.html?tournament=${encodeURIComponent(item.slug || '')}`;
    const actionLabel = isArchive ? 'Открыть розыгрыш' : 'Открыть турнир';
    const datesLabel = translateRuntimeText(formatTournamentDateRange(item.start_date, item.end_date) || String(item.start_date || '').trim());
    const displayName = Number(item.season_year || 0) === 2026
      ? 'Кубок Бурчалкина 2026'
      : String(item.name || '').trim();

    return `
    <article class="tournament-card">
      <div class="tournament-card-top">
        <div class="tournament-card-year">${escapeHtml(item.season_year || '')}</div>
        <div class="tournament-card-status ${escapeHtml(item.status)}">${escapeHtml(formatTournamentStatus(item.status))}</div>
      </div>
      <h3>${escapeHtml(translateRuntimeText(displayName))}</h3>
      <p>${escapeHtml(translateRuntimeText(item.description || ''))}</p>
      <div class="tournament-card-meta">
        <span>${escapeHtml(translateRuntimeText(formatCountLabel(item.clubs_count, ['клуб', 'клуба', 'клубов'])))}</span>
        <span>${escapeHtml(translateRuntimeText(formatCountLabel(item.matches_count, ['матч', 'матча', 'матчей'])))}</span>
      </div>
      <div class="tournament-card-dates">${escapeHtml(datesLabel)}</div>
      <div class="tournament-card-actions">
        <a class="tournament-card-button" href="${escapeHtml(actionHref)}">${escapeHtml(translateRuntimeText(actionLabel))}</a>
      </div>
    </article>
  `;
  }).join('');
  target.setAttribute('aria-busy', 'false');
}

const PARTNER_PLACEHOLDER_LOGO = 'images/logo-burchalkin.webp';
const PARTNER_FALLBACK_HREF = 'index.html';
const PARTNER_FALLBACKS = new Map([
  ['Система спортивной аналитики B-SIGHT', { website_url: 'https://bsight.pro', logo_url: 'images/partners/b-sight.png', logo_alt: 'Система спортивной аналитики B-SIGHT' }],
  ['АО «Российская промышленная коллегия»', { website_url: 'https://www.rosprom.ru', logo_url: 'images/partners/rossiyskaya-promyshlennaya-kollegiya.png', logo_alt: 'АО «Российская промышленная коллегия»' }],
  ['БАЗ', { website_url: 'https://baz.ru', logo_url: 'images/partners/baz.png', logo_alt: 'БАЗ' }],
  ['Медиалига', { website_url: 'https://mfl.life', logo_url: 'images/partners/medialiga.png', logo_alt: 'Медиалига' }],
  ['БФ «ВТБ Страна»', { website_url: 'https://vtbstrana.ru', logo_url: 'images/partners/vtb-strana.png', logo_alt: 'БФ «ВТБ Страна»' }],
  ['Банк ВТБ', { website_url: 'https://www.vtb.ru', logo_url: 'images/partners/bank-vtb.png', logo_alt: 'Банк ВТБ' }],
  ['Ижора Сталь Инвест', { website_url: 'https://izhorastalinvest.ru', logo_url: 'images/partners/izhora-stal-invest.png', logo_alt: 'Ижора Сталь Инвест' }],
  ['ООО Фирма «Спринг-Центр»', { website_url: 'https://www.spring-centr.ru', logo_url: 'images/partners/spring-center.png', logo_alt: 'ООО Фирма «Спринг-Центр»' }],
  ['ООО «Новые технологии и материалы»', { website_url: 'https://ntmsp.ru', logo_url: 'images/partners/novye-tekhnologii-materialy.png', logo_alt: 'ООО «Новые технологии и материалы»' }],
  ['ПАО Сатурн', { website_url: 'https://saturn-omsk.ru', logo_url: 'images/partners/saturn.png', logo_alt: 'ПАО Сатурн' }],
  ['Банк ПСБ', { website_url: 'https://www.psbank.ru', logo_url: 'images/partners/bank-psb.png', logo_alt: 'Банк ПСБ' }],
  ['ТехПром', { website_url: '', logo_url: 'images/partners/tekhprom.png', logo_alt: 'ТехПром' }],
  ['ТАСС', { website_url: 'https://tass.ru', logo_url: 'images/partners/tass.png', logo_alt: 'ТАСС' }],
  ['Спорт-Экспресс', { website_url: 'https://www.sport-express.ru', logo_url: 'images/partners/sport-express.png', logo_alt: 'Спорт-Экспресс' }],
  ['РФС', { website_url: 'https://rfs.ru', logo_url: 'images/partners/rfs.png', logo_alt: 'РФС' }],
  ['Фонтанка.ру', { website_url: 'https://www.fontanka.ru', logo_url: 'images/partners/fontanka.png', logo_alt: 'Фонтанка.ру' }],
  ['Спорт День за Днем', { website_url: 'https://www.sportsdaily.ru', logo_url: 'images/partners/sport-den-za-dnem.png', logo_alt: 'Спорт День за Днем' }],
  ['Комсомольская правда', { website_url: 'https://www.spb.kp.ru', logo_url: 'images/partners/komsomolskaya-pravda.png', logo_alt: 'Комсомольская правда' }],
  ['Радио «Зенит»', { website_url: 'https://www.radiozenit.ru', logo_url: 'images/partners/radio-zenit.png', logo_alt: 'Радио «Зенит»' }],
  ['Футбол Петербурга', { website_url: 'https://stat.ffspb.org', logo_url: 'images/partners/football-peterburga.png', logo_alt: 'Футбол Петербурга' }],
  ['Санкт-Петербургские ведомости', { website_url: 'https://spbvedomosti.ru', logo_url: 'images/partners/spb-vedomosti.png', logo_alt: 'Санкт-Петербургские ведомости' }],
  ['Телеканал «Санкт-Петербург»', { website_url: 'https://tvspb.ru', logo_url: 'images/partners/tv-spb.png', logo_alt: 'Телеканал «Санкт-Петербург»' }],
]);

function normalizePartnerLookupKey(value) {
  return String(value || '').trim().toLowerCase().replace(/\s+/g, ' ');
}

function getPartnerDisplayNameMeta(value) {
  const name = String(value || '').trim();
  if (!name) {
    return {
      text: '',
      lines: [],
      multiline: false,
    };
  }

  if (name === 'ООО Фирма «Спринг-Центр»') {
    return {
      text: 'ООО Фирма «Спринг-Центр»',
      lines: ['ООО Фирма', '«Спринг-Центр»'],
      multiline: true,
    };
  }

  if (name === 'Телеканал «Санкт-Петербург»') {
    return {
      text: 'Телеканал «Санкт-Петербург»',
      lines: ['Телеканал', '«Санкт-Петербург»'],
      multiline: true,
    };
  }

  return {
    text: name,
    lines: [name],
    multiline: false,
  };
}

const PARTNER_MULTILINE_RENDER_VERSION = '20260417-partner-lines-3';

function renderPartnerDisplayName(meta) {
  if (!meta?.multiline) {
    return escapeHtml(meta?.text || '');
  }

  const lines = Array.isArray(meta.lines) ? meta.lines : [meta.text || ''];
  return lines
    .map(line => `<span class="partner-name-line">${escapeHtml(line)}</span>`)
    .join('');
}

function enforcePartnerLabelBreaks(root = document) {
  root.querySelectorAll('.sponsor-item-logo').forEach((item) => {
    const labelNode = item.querySelector('.partner-name') || item.lastElementChild;
    if (!labelNode) return;
    const text = String(labelNode.textContent || '').trim().replace(/\s+/g, ' ');

    if (text === 'ООО Фирма «Спринг-Центр»') {
      labelNode.className = 'partner-name partner-name-multiline';
      labelNode.innerHTML = '<span class="partner-name-line">ООО Фирма</span><span class="partner-name-line">«Спринг-Центр»</span>';
      return;
    }

    if (text === 'Телеканал «Санкт-Петербург»') {
      labelNode.className = 'partner-name partner-name-multiline';
      labelNode.innerHTML = '<span class="partner-name-line">Телеканал</span><span class="partner-name-line">«Санкт-Петербург»</span>';
    }
  });
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
    const storedName = node.getAttribute('data-partner-name');
    const labelNode = node.querySelector('span');
    const name = (storedName || (labelNode ? labelNode.textContent : node.textContent) || '').trim();
    if (!name) return;
    const partner = partnerLookup.get(normalizePartnerLookupKey(name)) || PARTNER_FALLBACKS.get(name) || null;
    const href = normalizePartnerHref(partner?.website_url || '');
    const logoSrc = String(partner?.logo_url || '').trim() || PARTNER_PLACEHOLDER_LOGO;
    const logoAlt = partner?.logo_alt || name;
    const labelMeta = getPartnerDisplayNameMeta(name);

    let element = node;
    if (node.tagName !== 'A') {
      element = document.createElement('a');
      element.className = node.className;
      node.replaceWith(element);
    }

    element.classList.add('sponsor-item-logo');
    element.setAttribute('data-partner-name', labelMeta.text || name);
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
      <span class="${labelMeta.multiline ? 'partner-name partner-name-multiline' : 'partner-name'}">${renderPartnerDisplayName(labelMeta)}</span>
    `;
  });

  enforcePartnerLabelBreaks(root);
  upgradeStaticImagesForCloudinary();
}

function renderPartnerItem(item) {
  const fallback = PARTNER_FALLBACKS.get(String(item.name || '').trim()) || {};
  const partner = {
    ...fallback,
    ...item,
    website_url: String(item.website_url || fallback.website_url || ''),
    logo_url: String(item.logo_url || fallback.logo_url || ''),
    logo_alt: String(item.logo_alt || fallback.logo_alt || item.name || fallback.logo_alt || ''),
  };
  const logoSrc = String(partner.logo_url || '').trim() || PARTNER_PLACEHOLDER_LOGO;
  const href = normalizePartnerHref(partner.website_url || '');
  const externalAttrs = isExternalPartnerHref(href) ? 'target="_blank" rel="noreferrer"' : '';
  const labelMeta = getPartnerDisplayNameMeta(partner.name);
  return `
    <a class="sponsor-item sponsor-item-logo" href="${escapeHtml(href)}" data-partner-name="${escapeHtml(partner.name)}" ${externalAttrs}>
      ${renderPartnerLogoMarkup(partner.name, logoSrc, partner.logo_alt || partner.name)}
      <span class="${labelMeta.multiline ? 'partner-name partner-name-multiline' : 'partner-name'}">${renderPartnerDisplayName(labelMeta)}</span>
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
  requestAnimationFrame(() => enforcePartnerLabelBreaks(document));
}

async function renderClubPage() {
  const target = document.querySelector('#club-page-root');
  if (!target) return;
  target.setAttribute('aria-busy', 'true');
  target.innerHTML = renderDetailPageLoading('Загружаем страницу клуба...');
  const slug = new URLSearchParams(window.location.search).get('slug');
  if (!slug) {
    target.innerHTML = '<section class="section"><div class="container card"><h2>Клуб не найден</h2><p class="muted">В ссылке не указан slug клуба.</p></div></section>';
    target.setAttribute('aria-busy', 'false');
    return;
  }
  const [club, currentSeasonMatches] = await Promise.all([
    fetchApi(`/api/clubs/${encodeURIComponent(slug)}`),
    fetchApi(`/api/clubs/${encodeURIComponent(slug)}/matches`)
  ]);
  const clubData = club || getHistoricalClubFallback(slug) || getCurrentClubFallback(slug);
  if (!clubData) {
    target.innerHTML = '<section class="section"><div class="container card"><h2>Клуб недоступен</h2><p class="muted">API ещё не подключён или клуб не найден.</p></div></section>';
    target.setAttribute('aria-busy', 'false');
    return;
  }
  const clubProfile = getClubProfile(clubData);
  const locationLabel = formatClubLocation(clubData);
  const matches = getMatchesForClub(
    getAllKnownMatches([
      ...(Array.isArray(currentSeasonMatches) ? currentSeasonMatches : []),
      ...(Array.isArray(clubData.matches) ? clubData.matches : [])
    ]),
    clubData
  );
  const participationYearsMarkup = clubProfile.participationEntries.map(item => {
    const tone = getParticipationChipTone(item.result);
    return `
    <div class="club-participation-row">
      <span class="club-year-chip${tone ? ` club-year-chip-${tone}` : ''}">${escapeHtml(String(item.year))}</span>
      <span class="club-participation-result">${escapeHtml(translateRuntimeText(item.result))}</span>
    </div>
  `;
  }).join('');
  const matchesMarkup = matches.map(item => {
    const parts = String(item.score || '0:0').split(':');
    const dateTime = joinNonEmpty([formatMatchDisplayDate(item.date), item.time], ' • ');
    const tournamentLabel = translateRuntimeText(normalizeTournamentDisplayName(item.tournament_name || 'Кубок Бурчалкина'));
    return `
      <a class="club-history-row match-headtohead-row" href="${escapeHtml(getMatchPageUrl(item))}">
        <div class="club-history-datebox">
          <div class="match-headtohead-date club-history-date">${escapeHtml(dateTime)}</div>
          <div class="club-history-date-meta">${escapeHtml(tournamentLabel)}</div>
        </div>
        <div class="match-headtohead-main">
          <div class="match-headtohead-team match-headtohead-team-home">
            <span class="match-headtohead-name">${escapeHtml(item.home_team)}</span>
            ${renderImageMarkup({ src: item.home_logo, alt: item.home_team, className: 'match-headtohead-logo', width: 96 })}
          </div>
          <div class="match-headtohead-score">${escapeHtml(parts[0] || '0')} - ${escapeHtml(parts[1] || '0')}</div>
          <div class="match-headtohead-team match-headtohead-team-away">
            ${renderImageMarkup({ src: item.away_logo, alt: item.away_team, className: 'match-headtohead-logo', width: 96 })}
            <span class="match-headtohead-name">${escapeHtml(item.away_team)}</span>
          </div>
        </div>
      </a>
    `;
  }).join('');
  document.title = `Burchalkin Cup — ${clubData.name}`;
  document.documentElement.dataset.bcOriginalTitle = document.title;
  target.innerHTML = `
    <section class="page-head club-head">
      <div class="container club-head-grid">
        <div class="club-head-logo">${renderImageMarkup({ src: clubData.logo, alt: clubData.name, width: 320, loading: 'eager' })}</div>
        <div class="club-head-panel">
          <div class="club-head-kicker">${escapeHtml(translateRuntimeText(clubProfile.badge))}</div>
          <h1>${escapeHtml(clubData.name)}</h1>
          <p class="club-head-description">${escapeHtml(translateRuntimeText(clubProfile.summary))}</p>
          <div class="club-head-meta">
            ${locationLabel ? `<span class="club-meta-chip">${escapeHtml(locationLabel)}</span>` : ''}
            ${clubData.founded_year ? `<span class="club-meta-chip">${escapeHtml(String(clubData.founded_year))}</span>` : ''}
          </div>
        </div>
      </div>
    </section>
    <section class="section">
      <div class="container">
        <div class="club-overview-grid">
          <article class="club-info-card">
            <div class="club-info-eyebrow">${escapeHtml(translateRuntimeText('О клубе'))}</div>
            <h2>${escapeHtml(translateRuntimeText('Краткое описание'))}</h2>
            <p>${escapeHtml(translateRuntimeText(clubProfile.summary))}</p>
          </article>
          <article class="club-info-card">
            <div class="club-info-eyebrow">${escapeHtml(translateRuntimeText('История участия'))}</div>
            <h2>${escapeHtml(translateRuntimeText('Кубок Бурчалкина'))}</h2>
            ${participationYearsMarkup ? `<div class="club-years">${participationYearsMarkup}</div>` : ''}
            ${!participationYearsMarkup ? `<p class="club-participation-note">${escapeHtml(translateRuntimeText('История участия будет дополняться.'))}</p>` : ''}
          </article>
        </div>
        <div class="home-block-head">
          <div>
            <h2 class="section-title home-block-title">${escapeHtml(translateRuntimeText('История матчей'))}</h2>
            <p class="home-block-subtitle">${escapeHtml(translateRuntimeText('Прошедшие и будущие матчи клуба во всех турнирах сайта.'))}</p>
          </div>
          <a class="home-block-link" href="teams.html">${escapeHtml(translateRuntimeText('Все клубы →'))}</a>
        </div>
        <div class="club-history-list match-headtohead-list">${matchesMarkup || `<div class="club-empty-state">${escapeHtml(translateRuntimeText('У клуба пока нет матчей в базе.'))}</div>`}</div>
      </div>
    </section>
  `;
  target.setAttribute('aria-busy', 'false');
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
  target.setAttribute('aria-busy', 'true');
  target.innerHTML = Array.from({ length: 3 }, (_, index) => renderUpcomingCardLoading(index)).join('');
  try {
    const items = await fetchApi('/api/matches');
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
    target.setAttribute('aria-busy', 'false');
    autoFitTeamNames('.team-name');
  } catch (e) {
    target.innerHTML = renderLoadingStateCard('Не удалось загрузить матчи.');
    target.setAttribute('aria-busy', 'false');
  }
}

async function renderHomeNews() {
  const target = document.querySelector('#home-latest-news');
  if (!target) return;
  target.setAttribute('aria-busy', 'true');
  target.innerHTML = Array.from({ length: 3 }, (_, index) => renderNewsCardLoading(index)).join('');
  try {
    const items = sortNewsNewestFirst(await fetchApi('/api/news')).slice(0, 3);
    target.innerHTML = items.map(renderNewsPreviewCard).join('');
    target.setAttribute('aria-busy', 'false');
    runAutoFit();
  } catch (e) {
    target.innerHTML = renderLoadingStateCard('Не удалось загрузить новости.');
    target.setAttribute('aria-busy', 'false');
  }
}

function renderNewsPreviewCard(item) {
  const imageSrc = resolveNewsImage(item);
  const articleHref = item.slug
    ? `news-article.html?slug=${encodeURIComponent(String(item.slug))}`
    : `news-article.html?id=${encodeURIComponent(String(item.id || ''))}`;
  const displayDate = formatNewsDisplayDate(item.date);
  return `
    <a class="news-preview-card" href="${escapeHtml(articleHref)}">
      ${renderNewsCoverImage(imageSrc, item.title)}
      <div class="news-preview-content">
        <div class="news-preview-date">${escapeHtml(displayDate)}</div>
        <h3>${escapeHtml(item.title)}</h3>
        <p>${escapeHtml(item.excerpt)}</p>
      </div>
    </a>
  `;
}

async function renderMatchesPage() {
  const target = document.querySelector('#matches-list');
  if (!target) return;
  target.setAttribute('aria-busy', 'true');
  target.innerHTML = Array.from({ length: 4 }, (_, index) => renderUpcomingCardLoading(index)).join('');
  try {
    const items = await fetchApi('/api/matches');
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
    target.setAttribute('aria-busy', 'false');
    autoFitTeamNames('#matches-list .team-name');
  } catch (e) {
    target.innerHTML = renderLoadingStateCard('Не удалось загрузить список матчей.');
    target.setAttribute('aria-busy', 'false');
  }
}

async function renderNewsPage() {
  const target = document.querySelector('#news-list');
  const pager = document.querySelector('#news-pagination');
  if (!target) return;
  const currentPage = Math.max(1, Number(new URLSearchParams(window.location.search).get('page') || 1) || 1);
  target.setAttribute('aria-busy', 'true');
  target.innerHTML = Array.from({ length: 6 }, (_, index) => renderNewsCardLoading(index)).join('');
  try {
    const allItems = sortNewsNewestFirst(await fetchApi('/api/news'));
    const totalItems = allItems.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / NEWS_PAGE_SIZE));
    const page = Math.min(Math.max(1, currentPage), totalPages);
    const start = (page - 1) * NEWS_PAGE_SIZE;
    const items = allItems.slice(start, start + NEWS_PAGE_SIZE);
    const pagination = {
      page,
      per_page: NEWS_PAGE_SIZE,
      total_items: totalItems,
      total_pages: totalPages,
      has_prev: page > 1,
      has_next: page < totalPages,
    };

    target.innerHTML = items.map(renderNewsPreviewCard).join('');
    if (pagination.page && pagination.page !== currentPage) {
      const url = new URL(window.location.href);
      if (pagination.page === 1) {
        url.searchParams.delete('page');
      } else {
        url.searchParams.set('page', String(pagination.page));
      }
      history.replaceState({}, '', url);
    }
    if (pager) {
      pager.innerHTML = renderNewsPaginationControls(pagination);
      bindNewsPaginationControls(pager);
    }
    target.setAttribute('aria-busy', 'false');
    runAutoFit();
  } catch (e) {
    target.innerHTML = renderLoadingStateCard('Не удалось загрузить новости.');
    if (pager) pager.innerHTML = '';
    target.setAttribute('aria-busy', 'false');
  }
}

const NEWS_PAGE_SIZE = 9;

function getNewsSortTimestamp(item = {}) {
  const publishedOn = Date.parse(String(item?.date || item?.published_on || '').trim());
  if (Number.isFinite(publishedOn)) return publishedOn;

  const createdAt = Date.parse(String(item?.created_at || '').trim());
  if (Number.isFinite(createdAt)) return createdAt;

  const numericId = Number(item?.id);
  return Number.isFinite(numericId) ? numericId : 0;
}

function sortNewsNewestFirst(items = []) {
  return [...(Array.isArray(items) ? items : [])].sort((left, right) => {
    const timestampDiff = getNewsSortTimestamp(right) - getNewsSortTimestamp(left);
    if (timestampDiff !== 0) return timestampDiff;
    return Number(right?.id || 0) - Number(left?.id || 0);
  });
}

function renderNewsPaginationControls(pagination = {}) {
  const page = Math.max(1, Number(pagination.page || 1) || 1);
  const totalPages = Math.max(1, Number(pagination.total_pages || 1) || 1);
  const totalItems = Math.max(0, Number(pagination.total_items || 0) || 0);
  const hasPrev = page > 1;
  const hasNext = page < totalPages;

  return `
    <div class="news-pagination-shell">
      <button type="button" class="news-pagination-btn" data-news-page-direction="prev" ${hasPrev ? '' : 'disabled'}>← Предыдущая</button>
      <div class="news-pagination-info">Страница ${page} из ${totalPages}${totalItems ? ` · ${totalItems} новостей` : ''}</div>
      <button type="button" class="news-pagination-btn" data-news-page-direction="next" ${hasNext ? '' : 'disabled'}>Следующая →</button>
    </div>
  `;
}

function bindNewsPaginationControls(root = document) {
  if (!root || root.dataset.newsPaginationBound === 'true') return;
  root.dataset.newsPaginationBound = 'true';
  root.addEventListener('click', (event) => {
    const button = event.target.closest('[data-news-page-direction]');
    if (!button || !root.contains(button)) return;
    const direction = String(button.dataset.newsPageDirection || '');
    const currentPage = Math.max(1, Number(new URLSearchParams(window.location.search).get('page') || 1) || 1);
    const nextPage = direction === 'prev' ? currentPage - 1 : currentPage + 1;
    if (nextPage < 1) return;
    const url = new URL(window.location.href);
    if (nextPage === 1) {
      url.searchParams.delete('page');
    } else {
      url.searchParams.set('page', String(nextPage));
    }
    history.pushState({}, '', url);
    renderNewsPage();
  });
}

let newsPopstateBound = false;

function initNewsPaginationNavigation() {
  if (newsPopstateBound) return;
  newsPopstateBound = true;
  window.addEventListener('popstate', () => {
    if (document.querySelector('#news-list')) {
      renderNewsPage();
    }
  });
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

function sortMatchesChronologically(matches = []) {
  return [...matches].sort((left, right) => getMatchTimestamp(left) - getMatchTimestamp(right));
}

function pickFeaturedMediaMatch(matches = []) {
  const explicitFeatured = matches.find(item => item?.is_featured_media === true);
  if (explicitFeatured) return explicitFeatured;
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

const MEDIA_ALBUM_FALLBACKS = [
  {
    slug: 'opening-day-2026',
    title: 'Открытие турнира',
    tournament_slug: 'burchalkin-cup-2026',
    published_on: '2026-05-15',
    badge: 'Фотоальбом',
    cover_image_url: 'images/news-1.webp',
    cover_alt_text: 'Открытие Кубка Бурчалкина 2026',
    card_excerpt: 'Церемония открытия, первые эмоции игроков, болельщики и стартовые кадры турнира.',
    description: 'В этом альбоме позже появятся фотографии церемонии открытия, первых матчей и атмосферы стартового дня турнира.',
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
    card_excerpt: 'Подборка лучших кадров матчей, скамейки, болельщиков и деталей первого дня турнира.',
    description: 'Здесь будет собрана визуальная история первого игрового дня: матчи, голы, эмоции и работа всей турнирной команды.',
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
    card_excerpt: 'Кубок, медали, победители, эмоции команд и финальные кадры церемонии закрытия.',
    description: 'Этот альбом предназначен для фотографий награждения, вручения кубка и всех финальных моментов турнира.',
    sort_order: 3,
    is_visible: true,
    photos: []
  }
];

function getDefaultMediaAlbums() {
  return MEDIA_ALBUM_FALLBACKS.map(item => ({
    ...item,
    photos: Array.isArray(item.photos) ? item.photos.map(photo => ({ ...photo })) : []
  }));
}

function normalizeMediaAlbum(item = {}, index = 0) {
  return {
    slug: String(item.slug || '').trim(),
    title: String(item.title || '').trim(),
    tournament_slug: String(item.tournament_slug || '').trim(),
    published_on: String(item.published_on || '').trim(),
    badge: String(item.badge || 'Фотоальбом').trim() || 'Фотоальбом',
    cover_image_url: String(item.cover_image_url || '').trim(),
    cover_alt_text: String(item.cover_alt_text || item.title || '').trim(),
    card_excerpt: String(item.card_excerpt || '').trim(),
    description: String(item.description || '').trim(),
    sort_order: Number(item.sort_order || index + 1) || index + 1,
    is_visible: item.is_visible !== false,
    photos: Array.isArray(item.photos)
      ? item.photos
        .map((photo, photoIndex) => ({
          image_url: String(photo?.image_url || '').trim(),
          alt_text: String(photo?.alt_text || '').trim(),
          sort_order: Number(photo?.sort_order || photoIndex + 1) || photoIndex + 1
        }))
        .filter(photo => photo.image_url)
        .sort((left, right) => left.sort_order - right.sort_order)
      : []
  };
}

function formatMediaAlbumPublishedOn(value) {
  return formatTournamentDisplayDate(value) || 'Фотографии будут добавлены позднее';
}

function getMediaAlbumHref(item = {}) {
  const slug = String(item.slug || '').trim();
  return slug ? `media-album.html?slug=${encodeURIComponent(slug)}` : 'multimedia.html';
}

function renderMediaAlbumCard(item) {
  const album = normalizeMediaAlbum(item);
  const coverMarkup = album.cover_image_url
    ? renderImageMarkup({
      src: album.cover_image_url,
      alt: album.cover_alt_text || album.title,
      className: 'media-album-cover-img',
      width: 960
    })
    : '<div class="media-album-icon">Фотоальбом</div>';

  return `
    <a class="news-preview-card media-album-card" href="${escapeHtml(getMediaAlbumHref(album))}">
      <div class="news-preview-cover media-album-cover">
        ${coverMarkup}
        <span class="archive-stat-chip media-album-badge">${escapeHtml(album.badge || 'Фотоальбом')}</span>
      </div>
      <div class="news-preview-content media-album-content">
        <div class="news-preview-date">${escapeHtml(formatMediaAlbumPublishedOn(album.published_on))}</div>
        <h3>${escapeHtml(album.title || '')}</h3>
        <p>${escapeHtml(album.card_excerpt || album.description || 'Фотографии турнира появятся здесь позже.')}</p>
      </div>
    </a>
  `;
}

function renderMediaAlbumPlaceholderTile(index) {
  return `
    <div class="media-album-photo-card is-placeholder" aria-hidden="true">
      <div class="media-album-photo-frame">
        <span>Фото ${index + 1}</span>
      </div>
    </div>
  `;
}

function renderMediaAlbumPhotoCard(photo = {}, index = 0) {
  const imageUrl = String(photo.image_url || '').trim();
  const alt = String(photo.alt_text || 'Фотоальбом').trim();

  return `
    <button class="media-album-photo-card" type="button" data-album-photo-index="${index}" aria-label="Открыть фото ${index + 1}">
      <div class="media-album-photo-frame">
        ${renderImageMarkup({
          src: imageUrl,
          alt,
          className: 'media-album-photo-image',
          width: 640
        })}
      </div>
    </button>
  `;
}

function buildMediaAlbumPhotoPages(photos = [], pageSize = 16, padLastPage = true) {
  if (!Array.isArray(photos) || !photos.length) {
    return [
      Array.from({ length: pageSize }, (_, index) => renderMediaAlbumPlaceholderTile(index))
    ];
  }

  const pages = [];
  for (let index = 0; index < photos.length; index += pageSize) {
    const slice = photos.slice(index, index + pageSize);
    const placeholdersCount = padLastPage ? Math.max(0, pageSize - slice.length) : 0;
    pages.push([
      ...slice.map((photo, offset) => renderMediaAlbumPhotoCard(photo, index + offset)),
      ...Array.from({ length: placeholdersCount }, (_, placeholderIndex) =>
        renderMediaAlbumPlaceholderTile(index + slice.length + placeholderIndex)
      )
    ]);
  }

  return pages;
}

function findMediaAlbumBySlug(albums = [], slug = '') {
  const normalizedSlug = String(slug || '').trim();
  return albums.find(item => String(item?.slug || '').trim() === normalizedSlug) || null;
}

async function loadRenderableMediaAlbums() {
  const albumsRaw = await fetchApi('/api/media/albums');
  return Array.isArray(albumsRaw) && albumsRaw.length
    ? albumsRaw.map((item, index) => normalizeMediaAlbum(item, index)).filter(item => item.is_visible !== false)
    : getDefaultMediaAlbums().map((item, index) => normalizeMediaAlbum(item, index));
}

function setMediaStoriesSectionVisibility(target, visible) {
  if (!target) return;
  const section = target.closest('section');
  if (section) {
    section.hidden = !visible;
  }
  target.setAttribute('aria-busy', visible ? 'true' : 'false');
  if (!visible) {
    target.innerHTML = '';
  }
}

async function renderMediaAlbumCollection(targetSelector = '#media-stories') {
  const target = document.querySelector(targetSelector);
  if (!target) return;
  const featuredTournament = await loadFeaturedTournamentSettings();
  if (featuredTournament && isTruthyFlag(featuredTournament.photo_reports_enabled, true) === false) {
    setMediaStoriesSectionVisibility(target, false);
    return;
  }

  setMediaStoriesSectionVisibility(target, true);
  target.innerHTML = Array.from({ length: 3 }, (_, index) => renderNewsCardLoading(index)).join('');

  try {
    const albums = await loadRenderableMediaAlbums();
    target.innerHTML = albums.length
      ? albums.map(renderMediaAlbumCard).join('')
      : renderLoadingStateCard('Фотоальбомы появятся здесь после публикации первых фотоматериалов.');
    target.setAttribute('aria-busy', 'false');
    runAutoFit();
  } catch (error) {
    target.innerHTML = getDefaultMediaAlbums().map(renderMediaAlbumCard).join('');
    target.setAttribute('aria-busy', 'false');
  }
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
  const featuredTournament = await loadFeaturedTournamentSettings();
  const storiesEnabled = !featuredTournament || isTruthyFlag(featuredTournament.photo_reports_enabled, true);
  featuredTarget.setAttribute('aria-busy', 'true');
  libraryTarget.setAttribute('aria-busy', 'true');
  setMediaStoriesSectionVisibility(storiesTarget, storiesEnabled);
  featuredTarget.innerHTML = renderMediaFeatureLoading();
  libraryTarget.innerHTML = Array.from({ length: 2 }, (_, index) => renderUpcomingCardLoading(index)).join('');

  try {
    const matchesRaw = await fetchApi('/api/matches');
    const allMatches = sortMediaMatches(Array.isArray(matchesRaw) ? matchesRaw : []);
    const featuredMatch = pickFeaturedMediaMatch(allMatches);
    const matches = sortMatchesChronologically(allMatches.filter(hasAnyMatchMedia));

    featuredTarget.innerHTML = featuredMatch
      ? renderMediaFeatureCard(featuredMatch)
      : '<div class="card media-empty-card">Медиаматериалы появятся здесь после публикации первых трансляций.</div>';

    libraryTarget.innerHTML = matches.length
      ? matches.map(renderMediaMatchCard).join('')
      : '<div class="card media-empty-card">Материалы матчей появятся после публикации первых эфиров.</div>';

    if (storiesEnabled) {
      const albums = await loadRenderableMediaAlbums();
      storiesTarget.innerHTML = albums.length
        ? albums.map(renderMediaAlbumCard).join('')
        : '<div class="card media-empty-card">Фотоальбомы появятся здесь после публикации первых фотоматериалов.</div>';
      storiesTarget.setAttribute('aria-busy', 'false');
    }
    featuredTarget.setAttribute('aria-busy', 'false');
    libraryTarget.setAttribute('aria-busy', 'false');

    if (featuredMatch) initMatchMediaTabs(featuredTarget);
    initMediaLibrarySlider();
    runAutoFit();
  } catch (error) {
    featuredTarget.innerHTML = '<div class="card media-empty-card">Не удалось загрузить главный эфир.</div>';
    libraryTarget.innerHTML = '<div class="card media-empty-card">Не удалось загрузить материалы матчей.</div>';
    featuredTarget.setAttribute('aria-busy', 'false');
    libraryTarget.setAttribute('aria-busy', 'false');
    if (storiesEnabled) {
      storiesTarget.innerHTML = getDefaultMediaAlbums().map(renderMediaAlbumCard).join('');
      storiesTarget.setAttribute('aria-busy', 'false');
    }
  }
}

async function renderMediaAlbumPage() {
  const root = document.querySelector('#media-album-page-root');
  if (!root) return;
  root.setAttribute('aria-busy', 'true');
  root.innerHTML = renderDetailPageLoading('Загружаем фотоальбом...');

  const params = new URLSearchParams(window.location.search);
  const requestedSlug = String(params.get('slug') || '').trim();
  const fallbackAlbums = getDefaultMediaAlbums().map((item, index) => normalizeMediaAlbum(item, index));

  try {
    const albumsRaw = await fetchApi('/api/media/albums');
    const albums = Array.isArray(albumsRaw) && albumsRaw.length
      ? albumsRaw.map((item, index) => normalizeMediaAlbum(item, index))
      : fallbackAlbums;

    let album = null;
    if (requestedSlug) {
      const remoteAlbum = await fetchApi(`/api/media/albums/${encodeURIComponent(requestedSlug)}`);
      album = remoteAlbum ? normalizeMediaAlbum(remoteAlbum) : findMediaAlbumBySlug(albums, requestedSlug);
    }

    if (!album) {
      album = findMediaAlbumBySlug(albums, requestedSlug) || albums[0] || fallbackAlbums[0] || null;
    }

    if (!album) {
      root.innerHTML = '<div class="card">Фотоальбом пока недоступен.</div>';
      root.setAttribute('aria-busy', 'false');
      return;
    }

    document.title = `Burchalkin Cup — ${album.title || 'Фотоальбом'}`;
    document.documentElement.dataset.bcOriginalTitle = document.title;
    const photos = Array.isArray(album.photos) ? album.photos : [];
    const isMobileAlbum = window.innerWidth <= 640;
    const photoPagesMarkup = buildMediaAlbumPhotoPages(photos, isMobileAlbum ? 1 : 16, !isMobileAlbum)
      .map(pageItems => `<div class="media-album-page-slide">${pageItems.join('')}</div>`)
      .join('');

    root.innerHTML = `
      <article class="media-album-page-card">
        <a class="news-article-back" href="multimedia.html">← Все фотоальбомы</a>
        <div class="media-album-page-topline">
          <span class="archive-stat-chip">${escapeHtml(album.badge || 'Фотоальбом')}</span>
          <span class="media-album-page-date">${escapeHtml(formatMediaAlbumPublishedOn(album.published_on))}</span>
        </div>
        <h1 class="media-album-page-title">${escapeHtml(album.title || '')}</h1>
        ${album.card_excerpt ? `<p class="media-album-page-lead">${escapeHtml(album.card_excerpt)}</p>` : ''}
        ${album.description ? `<p class="media-album-page-description">${escapeHtml(album.description)}</p>` : ''}
        <div class="home-block-head media-album-grid-head">
          <h2 class="section-title home-block-title">Фотографии альбома</h2>
          <div class="home-block-link">${photos.length ? `${photos.length} фото` : 'Скоро здесь появится сетка фотографий'}</div>
        </div>
        <div class="home-upcoming-slider media-album-slider">
          <button class="home-upcoming-arrow home-upcoming-prev" id="media-album-prev" type="button" aria-label="Предыдущие фотографии">‹</button>
          <div class="home-upcoming-viewport">
            <div id="media-album-track" class="media-album-track">${photoPagesMarkup}</div>
          </div>
          <button class="home-upcoming-arrow home-upcoming-next" id="media-album-next" type="button" aria-label="Следующие фотографии">›</button>
        </div>
        ${photos.length ? '<div class="media-album-mobile-counter" id="media-album-mobile-counter" aria-live="polite"></div>' : ''}
      </article>
      <div class="media-album-lightbox" id="media-album-lightbox" hidden>
        <div class="media-album-lightbox-backdrop"></div>
        <div class="media-album-lightbox-dialog" role="dialog" aria-modal="true" aria-label="Просмотр фотографии">
          <button class="media-album-lightbox-close" id="media-album-lightbox-close" type="button" aria-label="Закрыть просмотр">×</button>
          <button class="media-album-lightbox-arrow media-album-lightbox-prev" id="media-album-lightbox-prev" type="button" aria-label="Предыдущее фото">‹</button>
          <div class="media-album-lightbox-stage">
            <img id="media-album-lightbox-image" class="media-album-lightbox-image" src="" alt="">
          </div>
          <button class="media-album-lightbox-arrow media-album-lightbox-next" id="media-album-lightbox-next" type="button" aria-label="Следующее фото">›</button>
          <div class="media-album-lightbox-counter" id="media-album-lightbox-counter"></div>
        </div>
      </div>
    `;
    root.setAttribute('aria-busy', 'false');
    initMediaAlbumSlider();
    initMediaAlbumLightbox(photos);
    runAutoFit();
  } catch (error) {
    const album = findMediaAlbumBySlug(fallbackAlbums, requestedSlug) || fallbackAlbums[0] || null;
    if (!album) {
      root.innerHTML = '<div class="card">Не удалось загрузить фотоальбом.</div>';
      root.setAttribute('aria-busy', 'false');
      return;
    }

    const photos = Array.isArray(album.photos) ? album.photos : [];
    const isMobileAlbum = window.innerWidth <= 640;
    const photoPagesMarkup = buildMediaAlbumPhotoPages(photos, isMobileAlbum ? 1 : 16, !isMobileAlbum)
      .map(pageItems => `<div class="media-album-page-slide">${pageItems.join('')}</div>`)
      .join('');

    root.innerHTML = `
      <article class="media-album-page-card">
        <a class="news-article-back" href="multimedia.html">← Все фотоальбомы</a>
        <div class="media-album-page-topline">
          <span class="archive-stat-chip">${escapeHtml(album.badge || 'Фотоальбом')}</span>
          <span class="media-album-page-date">${escapeHtml(formatMediaAlbumPublishedOn(album.published_on))}</span>
        </div>
        <h1 class="media-album-page-title">${escapeHtml(album.title || '')}</h1>
        ${album.card_excerpt ? `<p class="media-album-page-lead">${escapeHtml(album.card_excerpt)}</p>` : ''}
        ${album.description ? `<p class="media-album-page-description">${escapeHtml(album.description)}</p>` : ''}
        <div class="home-block-head media-album-grid-head">
          <h2 class="section-title home-block-title">Фотографии альбома</h2>
          <div class="home-block-link">${photos.length ? `${photos.length} фото` : 'Скоро здесь появится сетка фотографий'}</div>
        </div>
        <div class="home-upcoming-slider media-album-slider">
          <button class="home-upcoming-arrow home-upcoming-prev" id="media-album-prev" type="button" aria-label="Предыдущие фотографии">‹</button>
          <div class="home-upcoming-viewport">
            <div id="media-album-track" class="media-album-track">${photoPagesMarkup}</div>
          </div>
          <button class="home-upcoming-arrow home-upcoming-next" id="media-album-next" type="button" aria-label="Следующие фотографии">›</button>
        </div>
        ${photos.length ? '<div class="media-album-mobile-counter" id="media-album-mobile-counter" aria-live="polite"></div>' : ''}
      </article>
      <div class="media-album-lightbox" id="media-album-lightbox" hidden>
        <div class="media-album-lightbox-backdrop"></div>
        <div class="media-album-lightbox-dialog" role="dialog" aria-modal="true" aria-label="Просмотр фотографии">
          <button class="media-album-lightbox-close" id="media-album-lightbox-close" type="button" aria-label="Закрыть просмотр">×</button>
          <button class="media-album-lightbox-arrow media-album-lightbox-prev" id="media-album-lightbox-prev" type="button" aria-label="Предыдущее фото">‹</button>
          <div class="media-album-lightbox-stage">
            <img id="media-album-lightbox-image" class="media-album-lightbox-image" src="" alt="">
          </div>
          <button class="media-album-lightbox-arrow media-album-lightbox-next" id="media-album-lightbox-next" type="button" aria-label="Следующее фото">›</button>
          <div class="media-album-lightbox-counter" id="media-album-lightbox-counter"></div>
        </div>
      </div>
    `;
    root.setAttribute('aria-busy', 'false');
    initMediaAlbumSlider();
    initMediaAlbumLightbox(photos);
    runAutoFit();
  }
}

async function renderNewsArticlePage() {
  const root = document.querySelector('#news-article-page');
  if (!root) return;
  root.setAttribute('aria-busy', 'true');
  root.innerHTML = renderDetailPageLoading('Загружаем новость...');

  try {
    const params = new URLSearchParams(window.location.search);
    const slug = String(params.get('slug') || '').trim();
    const id = String(params.get('id') || '').trim();
    const lookupKey = slug || id;
    const item = lookupKey ? await fetchApi(`/api/news/${encodeURIComponent(lookupKey)}`) : null;

    if (!item) {
      root.innerHTML = '<div class="card">Не удалось найти новость.</div>';
      root.setAttribute('aria-busy', 'false');
      return;
    }

    document.title = `Burchalkin Cup — ${item.title || 'Новость'}`;
    document.documentElement.dataset.bcOriginalTitle = document.title;
    const imageSrc = resolveNewsImage(item);
    const content = getNewsArticleParagraphs(item);
    const bodyHtml = getNewsArticleBodyHtml(item);
    const videoUrl = getNewsArticleVideoUrl(item);
    const bodyImageUrls = collectNewsBodyImageUrls(bodyHtml);
    const fallbackMarkup = `
      ${item.excerpt ? `<p class="news-article-lead">${renderLinkedText(item.excerpt)}</p>` : ''}
      ${content.map(paragraph => `<p>${renderLinkedText(paragraph)}</p>`).join('')}
    `.trim();
    const hideBodyForVideo = shouldHideLowInfoVideoArticleBody(bodyHtml, `${item.excerpt || ''}\n${content.join('\n')}`, videoUrl);
    const articlePhotos = videoUrl
      ? buildNewsArticlePhotos(item, '')
      : buildNewsArticlePhotos(item, imageSrc);
    const bodyMarkupSource = articlePhotos.length ? stripNewsArticleImagesFromBodyHtml(bodyHtml) : bodyHtml;
    const articleBodyMarkup = hideBodyForVideo
      ? ''
      : (bodyMarkupSource || fallbackMarkup);
    const coverUrl = normalizeNewsImageUrl(imageSrc);
    const bodyHasCoverImage = coverUrl ? bodyImageUrls.has(coverUrl) : false;
    const mediaMarkup = videoUrl
      ? renderNewsArticleMedia(item, imageSrc)
      : (articlePhotos.length <= 1 && !bodyHasCoverImage ? renderNewsArticleMedia(item, imageSrc) : '');
    const galleryPhotos = videoUrl
      ? []
      : articlePhotos
        .slice(imageSrc ? 1 : 0)
        .filter(photo => !bodyImageUrls.has(normalizeNewsImageUrl(photo?.image_url || '')));
    const displayDate = formatNewsDisplayDate(item.date);

    root.innerHTML = `
      <article class="news-article-card">
        <a class="news-article-back" href="news.html">← Все новости</a>
        <h1 class="news-article-title">${escapeHtml(item.title || '')}</h1>
        ${mediaMarkup}
        ${articleBodyMarkup ? `
          <div class="news-article-body">
            ${articleBodyMarkup}
          </div>
        ` : ''}
        ${galleryPhotos.length ? `
          <div class="news-article-gallery">
            ${galleryPhotos.map((photo, index) => renderNewsArticlePhotoButton(photo, index + 1)).join('')}
          </div>
        ` : ''}
        <div class="news-article-footer">
          <div class="news-article-date">Добавлено: ${escapeHtml(displayDate)}</div>
        </div>
        ${bodyHtml && articlePhotos.length ? `
          <div class="news-article-lightbox-triggers" hidden>
            ${articlePhotos.map((photo, index) => renderNewsArticlePhotoButton(photo, index, 'news-article-lightbox-trigger')).join('')}
          </div>
        ` : ''}
      </article>
      ${articlePhotos.length ? `
        <div class="media-album-lightbox" id="media-album-lightbox" hidden>
          <div class="media-album-lightbox-backdrop"></div>
          <div class="media-album-lightbox-dialog" role="dialog" aria-modal="true" aria-label="Просмотр фотографии">
            <button class="media-album-lightbox-close" id="media-album-lightbox-close" type="button" aria-label="Закрыть просмотр">×</button>
            <button class="media-album-lightbox-arrow media-album-lightbox-prev" id="media-album-lightbox-prev" type="button" aria-label="Предыдущее фото">‹</button>
            <div class="media-album-lightbox-stage">
              <img id="media-album-lightbox-image" class="media-album-lightbox-image" src="" alt="">
            </div>
            <button class="media-album-lightbox-arrow media-album-lightbox-next" id="media-album-lightbox-next" type="button" aria-label="Следующее фото">›</button>
            <div class="media-album-lightbox-counter" id="media-album-lightbox-counter"></div>
          </div>
        </div>
      ` : ''}
    `;
    root.setAttribute('aria-busy', 'false');
    enhanceNewsArticleBody(root.querySelector('.news-article-body'), articlePhotos);
    if (articlePhotos.length) {
      initMediaAlbumLightbox(articlePhotos);
    }
  } catch (e) {
    root.innerHTML = '<div class="card">Не удалось загрузить новость.</div>';
    root.setAttribute('aria-busy', 'false');
  }
}

async function renderResultsList() {
  const target = document.querySelector('#results-list');
  if (!target) return;
  target.setAttribute('aria-busy', 'true');
  target.innerHTML = Array.from({ length: 3 }, () => renderLoadingStateCard('Загружаем результаты...')).join('');
  try {
    const items = await fetchApi('/api/results');
    target.innerHTML = items.map(item => `
      <div class="result-card">
        <div class="result-stage">${escapeHtml(item.stage)}</div>
        <div class="result-match">${escapeHtml(item.match)}</div>
        <div class="result-score">${escapeHtml(item.score)}</div>
      </div>
    `).join('');
    target.setAttribute('aria-busy', 'false');
  } catch (e) {
    target.innerHTML = renderLoadingStateCard('Не удалось загрузить результаты.');
    target.setAttribute('aria-busy', 'false');
  }
}


async function renderResultsMatches() {
  const target = document.querySelector('#results-matches');
  if (!target) return;
  target.setAttribute('aria-busy', 'true');
  target.innerHTML = Array.from({ length: 3 }, (_, index) => renderUpcomingCardLoading(index)).join('');
  try {
    const items = await fetchApi('/api/matches');
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
    target.setAttribute('aria-busy', 'false');
    autoFitTeamNames('#results-matches .team-name');
  } catch (e) {
    target.innerHTML = renderLoadingStateCard('Не удалось загрузить матчи.');
    target.setAttribute('aria-busy', 'false');
  }
}

async function renderMatchPageFromJson() {
  const target = document.querySelector('#match-page-json');
  if (!target) return;
  target.setAttribute('aria-busy', 'true');
  target.innerHTML = renderDetailPageLoading('Загружаем страницу матча...');
  try {
    const items = await fetchApi('/api/matches');
    const params = new URLSearchParams(window.location.search);
    const requestedId = String(params.get('id') || '').trim();
    const requestedMediaTab = String(params.get('media') || '').trim().toLowerCase();
    const allKnownMatches = getAllKnownMatches(items);
    const item = findMatchById(allKnownMatches, requestedId) || items[0] || allKnownMatches[0];
    if (!item) {
      throw new Error('Match not found');
    }

    const headToHeadMatches = getHeadToHeadMatches(allKnownMatches, item);
    const parts = String(item.score || '0:0').split(':');
    const homeScore = item.score ? escapeHtml(parts[0] || '0') : '0';
    const awayScore = item.score ? escapeHtml(parts[1] || '0') : '0';
    const matchTitle = joinNonEmpty([String(item.home_team || '').trim(), String(item.away_team || '').trim()], ' - ') || 'Матч';
    const matchMeta = joinNonEmpty([formatMatchDisplayDate(item.date), String(item.time || '').trim(), formatMatchVenue(item)], ' • ');
    const matchStatus = getMatchStatusState(item);
    const statusClass = matchStatus === 'live' ? 'live' : (matchStatus === 'done' ? 'done' : 'soon');
    const stageLabel = item.stage || item.group || item.round || 'Матч';
    const matchdayLabel = item.matchday || ((item.stage || item.group) ? item.round : '') || '';
    const tournamentLabel = translateRuntimeText(normalizeTournamentDisplayName(item.tournament_name || 'Кубок Бурчалкина'));
    document.title = matchTitle;
    document.documentElement.dataset.bcOriginalTitle = matchTitle;
    const renderMatchPageTeamCard = ({ sideClass = '', badge = '', teamName = '', teamLogo = '', teamSlug = '' } = {}) => {
      const href = getClubPageUrl({ slug: teamSlug, logo: teamLogo });
      const tag = href ? 'a' : 'div';

      return `
        <${tag} class="match-page-team ${escapeHtml(sideClass)}${href ? ' match-page-team-link' : ''}" ${href ? `href="${escapeHtml(href)}"` : ''}>
          <div class="match-page-team-badge">${escapeHtml(badge)}</div>
          <div class="match-page-team-brand">
            ${renderImageMarkup({ src: teamLogo, alt: teamName, className: 'match-page-team-logo', width: 220 })}
            <div class="match-page-team-name">${escapeHtml(teamName)}</div>
          </div>
        </${tag}>
      `;
    };
    const headToHeadMarkup = headToHeadMatches.length
      ? headToHeadMatches.map(match => {
          const scoreParts = String(match.score || '0:0').split(':');
          const dateTime = joinNonEmpty([formatMatchDisplayDate(match.date), match.time], ' • ');
          const tournamentLabel = translateRuntimeText(normalizeTournamentDisplayName(match.tournament_name || 'Кубок Бурчалкина'));
          return `
            <a class="match-headtohead-row" href="${escapeHtml(getMatchPageUrl(match))}">
              <div class="club-history-datebox">
                <div class="match-headtohead-date club-history-date">${escapeHtml(dateTime || 'Матч прошлых розыгрышей')}</div>
                <div class="club-history-date-meta">${escapeHtml(tournamentLabel)}</div>
              </div>
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
              <span class="match-page-tag match-page-tag-soft">${escapeHtml(tournamentLabel)}</span>
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
            ${renderMatchPageTeamCard({
              sideClass: 'match-page-team-home',
              badge: 'Хозяева',
              teamName: item.home_team,
              teamLogo: item.home_logo,
              teamSlug: item.home_team_slug
            })}
            <div class="match-page-scorebox" aria-label="Счёт матча">
              <div class="match-page-scoreline">
                <span class="match-page-score-digit">${homeScore}</span>
                <span class="match-page-score-separator">:</span>
                <span class="match-page-score-digit">${awayScore}</span>
              </div>
            </div>
            ${renderMatchPageTeamCard({
              sideClass: 'match-page-team-away',
              badge: 'Гости',
              teamName: item.away_team,
              teamLogo: item.away_logo,
              teamSlug: item.away_team_slug
            })}
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
    target.setAttribute('aria-busy', 'false');
    initMatchMediaTabs(target);
    runAutoFit();
  } catch (e) {
    target.innerHTML = '<div class="container"><div class="card">Не удалось загрузить матч.</div></div>';
    target.setAttribute('aria-busy', 'false');
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
  const statsNode = page.querySelector('[data-archive-stats]');
  const competitionNode = page.querySelector('[data-archive-competition]');
  const teamsNode = page.querySelector('[data-archive-teams]');
  const standingsNode = page.querySelector('[data-archive-standings]');
  const playoffNode = page.querySelector('[data-archive-playoff]');
  const matchesNode = page.querySelector('[data-archive-matches]');
  const mergeArchiveDetail = (detail = null) => {
    const fallbackDetail = archiveFallback.detail || {};
    const source = detail || {};
    return {
      ...fallbackDetail,
      ...source,
      standings: Array.isArray(source.standings) && source.standings.length ? source.standings : (Array.isArray(fallbackDetail.standings) ? fallbackDetail.standings : []),
      grouped_standings: Array.isArray(source.grouped_standings) && source.grouped_standings.length ? source.grouped_standings : (Array.isArray(fallbackDetail.grouped_standings) ? fallbackDetail.grouped_standings : []),
      playoff: Array.isArray(source.playoff) && source.playoff.length ? source.playoff : (Array.isArray(fallbackDetail.playoff) ? fallbackDetail.playoff : []),
      matches: Array.isArray(source.matches) && source.matches.length ? source.matches : (Array.isArray(fallbackDetail.matches) ? fallbackDetail.matches : [])
    };
  };

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
    const href = getMatchPageUrl(item);
    const meta = joinNonEmpty([
      formatMatchDisplayDate(item.date),
      String(item.time || '').trim(),
      String(item.group || item.round || '').trim()
    ], ' • ');
    return `
      <a class="archive-match-card" href="${escapeHtml(href)}">
        <div class="archive-match-card-top">
          <span>${escapeHtml(meta || 'Матч прошлых розыгрышей')}</span>
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
    const resolvedDetail = mergeArchiveDetail(detail);
    if (titleNode) titleNode.textContent = translateRuntimeText(archive.title);
    if (seasonNode) seasonNode.textContent = translateRuntimeText(archive.season);
    document.title = `Burchalkin Cup — ${archive.title}`;
    document.documentElement.dataset.bcOriginalTitle = document.title;

    if (statsNode) {
      const stats = [];
      const clubsCount = Number(resolvedDetail?.clubs_count || getArchiveTournamentClubs(resolvedDetail || {}).length || 0);
      const matchesCount = Number(resolvedDetail?.matches_count || (Array.isArray(resolvedDetail?.matches) ? resolvedDetail.matches.length : 0) || 0);
      if (clubsCount) stats.push(`<div class="archive-stat-chip">${escapeHtml(translateRuntimeText(formatCountLabel(clubsCount, ['клуб', 'клуба', 'клубов'])))}</div>`);
      if (matchesCount) stats.push(`<div class="archive-stat-chip">${escapeHtml(translateRuntimeText(formatCountLabel(matchesCount, ['матч', 'матча', 'матчей'])))}</div>`);
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
      const groupedStandings = Array.isArray(resolvedDetail?.grouped_standings) && resolvedDetail.grouped_standings.length
        ? resolvedDetail.grouped_standings
        : buildGroupedStandingsFromRows(standings);
      standingsNode.innerHTML = groupedStandings.length
        ? renderGroupedStandings(groupedStandings)
        : standings.length
          ? renderStandingsTable(standings)
        : '<div class="archive-empty-state">Турнирная таблица появится позднее.</div>';
    }

    if (playoffNode) {
      const playoff = Array.isArray(resolvedDetail?.playoff) ? resolvedDetail.playoff : [];
      playoffNode.innerHTML = playoff.length
        ? renderPlayoffBracket(playoff)
        : '<div class="archive-empty-state">Сетка плей-офф появится позднее.</div>';

      if (competitionNode) {
        const playoffSwitchButton = competitionNode.querySelector('[data-standings-switch="playoff"]');
        if (playoffSwitchButton) {
          playoffSwitchButton.hidden = !playoff.length;
        }
      }
    }

    if (competitionNode) {
      initStandingsViewSwitch(competitionNode);
    }

    if (matchesNode) {
      const matches = Array.isArray(resolvedDetail?.matches)
        ? [...resolvedDetail.matches].sort((left, right) => getMatchTimestamp(right) - getMatchTimestamp(left))
        : [];
      matchesNode.innerHTML = matches.length
        ? matches.map(renderArchiveMatchCard).join('')
        : '<div class="archive-empty-state">Матчи розыгрыша будут опубликованы позднее.</div>';
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
        status: 'Страница прошлого розыгрыша подключена к данным турнира и готова к наполнению.'
      };
      applyArchiveData(archive, detail);
    })
    .catch(() => {
      applyArchiveData(archiveFallback, null);
    });
}

document.addEventListener('DOMContentLoaded', () => {
  initNewsPaginationNavigation();
  renderUpcomingMatches();
  renderHomeNews();
  renderMediaAlbumCollection('#home-media-stories');
  renderMultimediaPage();
  renderMediaAlbumPage();
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
  renderEditableStaticPage();
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
  if (!slides.length) return;
  let dots = [];

  function hydrateSlide(indexToLoad) {
    const slide = slides[indexToLoad];
    if (!slide) return;
    hydrateDeferredImage(slide.querySelector('img'));
  }

  function buildDots() {
    dotsWrap.innerHTML = '';
    dots = slides.map((_, i) => {
      const dot = document.createElement('button');
      dot.className = `hero-carousel-dot${i === 0 ? ' active' : ''}`;
      dot.type = 'button';
      dot.setAttribute('aria-label', `Слайд ${i + 1}`);
      dot.addEventListener('click', () => {
        show(i);
        start();
      });
      dotsWrap.appendChild(dot);
      return dot;
    });
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

  buildDots();

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

function initHomeNewsSlider() {
  const track = document.getElementById('home-latest-news');
  const prevBtn = document.getElementById('home-news-prev');
  const nextBtn = document.getElementById('home-news-next');
  if (!track || !prevBtn || !nextBtn) return;

  function getStep() {
    const firstCard = track.querySelector('.news-preview-card');
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

function initMediaLibrarySlider() {
  const track = document.getElementById('media-library');
  const prevBtn = document.getElementById('media-library-prev');
  const nextBtn = document.getElementById('media-library-next');
  if (!track || !prevBtn || !nextBtn) return;

  function getStep() {
    const firstCard = track.querySelector('.media-match-card');
    if (!firstCard) return Math.max(track.clientWidth * 0.9, 360);
    const style = window.getComputedStyle(track);
    const gap = parseFloat(style.columnGap || style.gap || '18') || 18;
    return firstCard.getBoundingClientRect().width + gap;
  }

  function updateButtons() {
    const maxScroll = Math.max(0, track.scrollWidth - track.clientWidth - 2);
    prevBtn.disabled = track.scrollLeft <= 2;
    nextBtn.disabled = track.scrollLeft >= maxScroll;
  }

  prevBtn.onclick = () => {
    track.scrollBy({ left: -getStep(), behavior: 'smooth' });
  };

  nextBtn.onclick = () => {
    track.scrollBy({ left: getStep(), behavior: 'smooth' });
  };

  track.addEventListener('scroll', updateButtons, { passive: true });
  window.addEventListener('resize', updateButtons);

  const observer = new MutationObserver(updateButtons);
  observer.observe(track, { childList: true, subtree: true });

  setTimeout(updateButtons, 80);
}

function initMediaAlbumSlider() {
  const track = document.getElementById('media-album-track');
  const prevBtn = document.getElementById('media-album-prev');
  const nextBtn = document.getElementById('media-album-next');
  const counter = document.getElementById('media-album-mobile-counter');
  if (!track || !prevBtn || !nextBtn) return;

  function getStep() {
    const firstPage = track.querySelector('.media-album-page-slide');
    if (!firstPage) return Math.max(track.clientWidth * 0.98, 720);
    const style = window.getComputedStyle(track);
    const gap = parseFloat(style.columnGap || style.gap || '18') || 18;
    return firstPage.getBoundingClientRect().width + gap;
  }

  function updateButtons() {
    const maxScroll = Math.max(0, track.scrollWidth - track.clientWidth - 2);
    prevBtn.disabled = track.scrollLeft <= 2;
    nextBtn.disabled = track.scrollLeft >= maxScroll;

    if (counter) {
      const slides = Array.from(track.querySelectorAll('.media-album-page-slide'));
      const total = slides.length;
      if (!total) {
        counter.textContent = '';
      } else {
        const step = getStep();
        const current = Math.min(total, Math.max(1, Math.round(track.scrollLeft / step) + 1));
        counter.textContent = `${current} / ${total}`;
      }
    }
  }

  function goPrev() {
    track.scrollBy({ left: -getStep(), behavior: 'smooth' });
  }

  function goNext() {
    track.scrollBy({ left: getStep(), behavior: 'smooth' });
  }

  prevBtn.onclick = goPrev;
  nextBtn.onclick = goNext;

  let touchStartX = 0;
  let touchStartY = 0;
  let hasTouchStart = false;

  track.addEventListener('touchstart', (event) => {
    if (window.innerWidth > 640) return;
    const touch = event.changedTouches[0];
    if (!touch) return;
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
    hasTouchStart = true;
  }, { passive: true });

  track.addEventListener('touchend', (event) => {
    if (!hasTouchStart || window.innerWidth > 640) return;
    hasTouchStart = false;
    const touch = event.changedTouches[0];
    if (!touch) return;

    const deltaX = touch.clientX - touchStartX;
    const deltaY = touch.clientY - touchStartY;

    if (Math.abs(deltaX) < 42 || Math.abs(deltaX) <= Math.abs(deltaY)) return;

    track.dataset.suppressClicksUntil = String(Date.now() + 320);

    if (deltaX > 0) {
      goPrev();
    } else {
      goNext();
    }
  }, { passive: true });

  track.addEventListener('touchcancel', () => {
    hasTouchStart = false;
  }, { passive: true });

  track.addEventListener('scroll', updateButtons, { passive: true });
  window.addEventListener('resize', updateButtons);

  const observer = new MutationObserver(updateButtons);
  observer.observe(track, { childList: true, subtree: true });

  setTimeout(updateButtons, 80);
}

function initMediaAlbumLightbox(photos = []) {
  const items = Array.isArray(photos) ? photos.filter((photo) => String(photo?.image_url || '').trim()) : [];
  const track = document.getElementById('media-album-track');
  const modal = document.getElementById('media-album-lightbox');
  const image = document.getElementById('media-album-lightbox-image');
  const counter = document.getElementById('media-album-lightbox-counter');
  const closeBtn = document.getElementById('media-album-lightbox-close');
  const prevBtn = document.getElementById('media-album-lightbox-prev');
  const nextBtn = document.getElementById('media-album-lightbox-next');
  const stage = modal?.querySelector('.media-album-lightbox-stage');
  if (!items.length || !modal || !image || !counter || !closeBtn || !prevBtn || !nextBtn || !stage) return;

  let currentIndex = 0;
  let previousOverflow = '';
  let touchStartX = 0;
  let touchStartY = 0;
  let hasTouchStart = false;

  const updateSlide = () => {
    const current = items[currentIndex];
    if (!current) return;
    image.src = String(current.image_url || '').trim();
    image.alt = String(current.alt_text || `Фото ${currentIndex + 1}`).trim();
    counter.textContent = `${currentIndex + 1} / ${items.length}`;
    const disableNav = items.length <= 1;
    prevBtn.disabled = disableNav;
    nextBtn.disabled = disableNav;
  };

  const showSlide = (index) => {
    if (!items.length) return;
    const total = items.length;
    currentIndex = ((index % total) + total) % total;
    updateSlide();
  };

  const openLightbox = (index) => {
    previousOverflow = document.body.style.overflow || '';
    document.body.style.overflow = 'hidden';
    showSlide(index);
    modal.hidden = false;
    requestAnimationFrame(() => {
      modal.classList.add('is-open');
      closeBtn.focus();
    });
  };

  const closeLightbox = () => {
    modal.classList.remove('is-open');
    modal.hidden = true;
    document.body.style.overflow = previousOverflow;
  };

  document.querySelectorAll('[data-album-photo-index]').forEach((button) => {
    button.addEventListener('click', () => {
      const suppressClicksUntil = Number(track?.dataset.suppressClicksUntil || 0);
      if (suppressClicksUntil && Date.now() < suppressClicksUntil) return;
      const index = Number(button.dataset.albumPhotoIndex);
      if (!Number.isFinite(index)) return;
      openLightbox(index);
    });
  });

  closeBtn.addEventListener('click', closeLightbox);
  prevBtn.addEventListener('click', () => showSlide(currentIndex - 1));
  nextBtn.addEventListener('click', () => showSlide(currentIndex + 1));

  stage.addEventListener('touchstart', (event) => {
    if (items.length <= 1) return;
    const touch = event.changedTouches[0];
    if (!touch) return;
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
    hasTouchStart = true;
  }, { passive: true });

  stage.addEventListener('touchend', (event) => {
    if (!hasTouchStart || items.length <= 1) return;
    hasTouchStart = false;
    const touch = event.changedTouches[0];
    if (!touch) return;

    const deltaX = touch.clientX - touchStartX;
    const deltaY = touch.clientY - touchStartY;

    if (Math.abs(deltaX) < 42 || Math.abs(deltaX) <= Math.abs(deltaY)) return;

    if (deltaX > 0) {
      showSlide(currentIndex - 1);
    } else {
      showSlide(currentIndex + 1);
    }
  }, { passive: true });

  stage.addEventListener('touchcancel', () => {
    hasTouchStart = false;
  }, { passive: true });

  modal.addEventListener('click', (event) => {
    if (event.target === modal || event.target.classList.contains('media-album-lightbox-backdrop')) {
      closeLightbox();
    }
  });

  document.addEventListener('keydown', (event) => {
    if (modal.hidden) return;
    if (event.key === 'Escape') {
      closeLightbox();
    } else if (event.key === 'ArrowLeft') {
      showSlide(currentIndex - 1);
    } else if (event.key === 'ArrowRight') {
      showSlide(currentIndex + 1);
    }
  });
}
