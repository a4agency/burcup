const TEAM_LOGOS = [
  { name: 'Зенит', path: 'images/team-zenit.png' },
  { name: 'Динамо-Минск', path: 'images/team-dinamo-minsk.png' },
  { name: 'Црвена Звезда', path: 'images/team-crvena-zvezda.png' },
  { name: 'Фенербахче', path: 'images/team-fenerbahce.png' },
  { name: 'Кайрат', path: 'images/team-kairat.png' },
  { name: 'Палмейрас', path: 'images/team-palmeiras.png' },
  { name: 'Сан-Лоренсо', path: 'images/team-san-lorenzo.png' },
  { name: 'Алмаз-Антей', path: 'images/team-almaz-antey.png' },
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
    help: 'Сезоны и карточки турниров по годам. Сохранение теперь уходит в Railway API и базу PostgreSQL.',
    defaultData: [
      {
        slug: 'burchalkin-cup-2026',
        name: 'Burchalkin Cup 2026',
        season_year: 2026,
        short_label: 'BCUP 2026',
        status: 'active',
        location: 'Санкт-Петербург',
        start_date: '2026-03-15',
        end_date: '2026-03-20',
        logo: 'images/logo-burchalkin.png',
        hero_image: '',
        description: 'Основной турнир сезона 2026 года.',
        is_featured: true,
        countdown_enabled: true,
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
      logo: 'images/logo-burchalkin.png',
      hero_image: '',
      description: '',
      is_featured: false,
      countdown_enabled: true,
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
        logo: 'images/team-almaz-antey.png',
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
        date: '',
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
        summary: '',
      }
    ],
    empty: () => ({
      id: Date.now(),
      tournament_slug: 'burchalkin-cup-2026',
      date: '',
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
    help: 'Каталог партнёров, категорий, логотипов и ссылок. Если ссылка не указана, карточка партнёра ведёт на главную страницу сайта.',
    defaultData: [
      {
        slug: 'b-sight',
        name: 'Система спортивной аналитики B-SIGHT',
        category: 'general',
        tournament_slug: 'burchalkin-cup-2026',
        website_url: '',
        logo_url: '',
        alt_text: 'B-SIGHT',
        sort_order: 1,
        is_visible: true,
        note: '',
      }
    ],
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

function normalizeTournamentAdminItem(item) {
  return {
    ...item,
    countdown_enabled: item?.countdown_enabled !== false,
  };
}

function normalizeSourceData(sourceName, data) {
  const items = Array.isArray(data) ? data : [];
  if (sourceName === 'tournaments') {
    return items.map(normalizeTournamentAdminItem);
  }
  return items;
}

async function fetchAdminSource(sourceName) {
  const apiBaseUrl = getApiBaseUrl();
  const token = getAdminToken();

  if (!apiBaseUrl) {
    throw new Error('В js/config.js не указан apiBaseUrl');
  }
  if (!token) {
    throw new Error('Сначала войди в админ-панель.');
  }

  const response = await fetch(`${apiBaseUrl}/api/admin/${sourceName}`, {
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

  const data = await response.json();
  return normalizeSourceData(sourceName, data);
}

async function pushAdminSource(sourceName, data) {
  const apiBaseUrl = getApiBaseUrl();
  const token = getAdminToken();

  if (!apiBaseUrl) {
    throw new Error('В js/config.js не указан apiBaseUrl');
  }
  if (!token) {
    throw new Error('Сначала войди в админ-панель.');
  }

  const response = await fetch(`${apiBaseUrl}/api/admin/${sourceName}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'x-admin-token': token
    },
    body: JSON.stringify(data)
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

function refreshAdminMatchPreviews(wrap) {
  if (!wrap) return;
  const items = readFormData('matches');
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
  cards.forEach((card, index) => {
    const item = structuredClone(baseItems[index] || {});
    source.fields.forEach(([key, , type]) => {
      if (type === 'score') {
        const leftEl = card.querySelector(`[data-key="${key}"][data-score-part="left"][data-index="${index}"]`);
        const rightEl = card.querySelector(`[data-key="${key}"][data-score-part="right"][data-index="${index}"]`);
        item[key] = `${leftEl ? leftEl.value || '0' : '0'}:${rightEl ? rightEl.value || '0' : '0'}`;
        return;
      }
      const el = card.querySelector(`[data-key="${key}"][data-index="${index}"]`);
      if (!el) return;
      let value = el.value;
      if (type === 'number') value = value === '' ? '' : Number(value);
      if (type === 'checkbox') value = value === 'true';
      item[key] = value;
    });
    items.push(item);
  });
  return items;
}

function renderForm(sourceName, data) {
  const source = ADMIN_SOURCES[sourceName];
  const wrap = document.getElementById('admin-form-wrap');
  setRenderedData(sourceName, data);
  wrap.innerHTML = `
    <div class="admin-form-list">
      ${data.map((item, index) => `
        <div class="admin-item-card">
          <div class="admin-item-head">
            <strong>${source.title} #${index + 1}</strong>
            <button type="button" class="admin-item-remove" data-remove="${index}">Удалить</button>
          </div>
          <div class="admin-form-grid">
            ${source.fields.map(field => makeField(field, item[field[0]], index)).join('')}
          </div>
          ${sourceName === 'matches' ? makeMatchHeadToHeadPreview(item, index, data) : ''}
        </div>
      `).join('')}
    </div>
    <div class="admin-toolbar">
      <button type="button" class="admin-add" id="admin-add-item">+ Добавить запись</button>
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

  const addBtn = document.getElementById('admin-add-item');
  if (addBtn) {
    addBtn.addEventListener('click', () => {
      const next = readFormData(sourceName);
      next.push(source.empty());
      setSourceData(sourceName, next);
      adminShowSource(sourceName, { preferLocal: true });
      setStatus('Новая запись добавлена в черновик. Нажми «Сохранить», чтобы отправить в API.');
    });
  }

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
      const textInput = wrap.querySelector(`[data-key="${key}"][data-index="${index}"]`);
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
          setStatus('Изображение загружено в storage. Нажми «Сохранить», чтобы записать URL в базу.');
        })
        .catch(async error => {
          const reader = new FileReader();
          reader.onload = () => {
            if (textInput) {
              textInput.value = reader.result;
            }
            if (previewBox) {
              previewBox.innerHTML = `<img src="${reader.result}" alt="preview">`;
            }
            if (sourceName === 'partners' && key === 'logo_url') {
              updateRenderedItem(sourceName, Number(index), item => {
                item.logo_url = String(reader.result || '');
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
            setStatus(`Storage недоступен: ${error.message}. В форму подставлен base64 как временный fallback.`);
          };
          reader.readAsDataURL(file);
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

  if (sourceName === 'matches') {
    refreshAdminMatchPreviews(wrap);
    if (wrap.dataset.matchPreviewBound !== 'true') {
      const syncPreviews = () => {
        if (currentSource === 'matches') refreshAdminMatchPreviews(wrap);
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
    const synced = result.data || parsed;
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
