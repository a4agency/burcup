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

const ADMIN_SOURCES = {
  tournaments: {
    key: 'bcup_admin_tournaments',
    exportName: 'tournaments.json',
    title: 'Турниры',
    help: 'Сезоны и карточки турниров по годам. Здесь можно готовить архив и текущий турнир.',
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
        description: 'Основной турнир сезона 2026 года.',
      },
      {
        slug: 'burchalkin-cup-2025',
        name: 'Burchalkin Cup 2025',
        season_year: 2025,
        short_label: 'BCUP 2025',
        status: 'completed',
        location: 'Санкт-Петербург',
        start_date: '2025-05-16',
        end_date: '2025-05-20',
        logo: 'images/logo-burchalkin.png',
        description: 'Архивный турнир для истории сайта.',
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
      description: '',
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
      ['description', 'Описание', 'textarea'],
    ],
  },
  clubs: {
    key: 'bcup_admin_clubs',
    exportName: 'clubs.json',
    title: 'Клубы',
    help: 'Постоянный каталог клубов. Эти данные лягут в отдельные страницы клубов и историю матчей.',
    defaultData: [
      {
        slug: 'almaz-antey',
        name: 'Алмаз-Антей',
        short_name: 'Алмаз-Антей',
        country: 'Россия',
        city: 'Санкт-Петербург',
        founded_year: 2000,
        logo: 'images/team-almaz-antey.png',
        description: 'Футбольный клуб, регулярно участвующий в турнирах Burchalkin Cup.',
      },
      {
        slug: 'zenit',
        name: 'Зенит',
        short_name: 'Зенит',
        country: 'Россия',
        city: 'Санкт-Петербург',
        founded_year: 1925,
        logo: 'images/team-zenit.png',
        description: 'Клуб для сквозной турнирной истории по всем сезонам.',
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
      description: '',
    }),
    fields: [
      ['slug', 'Slug', 'text'],
      ['name', 'Название', 'text'],
      ['short_name', 'Короткое имя', 'text'],
      ['country', 'Страна', 'text'],
      ['city', 'Город', 'text'],
      ['founded_year', 'Год основания', 'number'],
      ['logo', 'Логотип', 'logo'],
      ['description', 'Описание', 'textarea'],
    ],
  },
  matches: {
    key: 'bcup_matches',
    exportName: 'matches.json',
    title: 'Матчи',
    help: 'Матчи теперь живут в логике турнира и клубов. Пока локально сохраняем JSON-формат, совместимый с сайтом.',
    defaultData: [
      {
        id: 1,
        tournament_slug: 'burchalkin-cup-2026',
        date: '',
        time: '10:00',
        status: 'done',
        status_label: 'Завершен',
        home_team: 'Алмаз-Антей',
        home_team_slug: 'almaz-antey',
        home_logo: 'images/team-almaz-antey.png',
        away_team: 'Црвена Звезда',
        away_team_slug: 'crvena-zvezda',
        away_logo: 'images/team-crvena-zvezda.png',
        score: '10:3',
        group: 'Группа A',
        venue: 'Стадион «Алмаз-Антей»',
        video: 'https://vkvideo.ru/video_ext.php?oid=-120721420&id=456239434&hash=a4ca6ca1e82ce6c4&hd=4',
        summary: 'Открывающий матч игрового дня.',
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
      venue: '',
      video: '',
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
      ['venue', 'Стадион', 'text'],
      ['video', 'Видео', 'text'],
      ['summary', 'Описание', 'textarea'],
    ],
  },
  news: {
    key: 'bcup_news',
    exportName: 'news.json',
    title: 'Новости',
    help: 'Новости теперь можно привязывать к турниру. Локально это остаётся быстрым редактором контента.',
    defaultData: [
      {
        id: 1,
        tournament_slug: 'burchalkin-cup-2026',
        date: '',
        title: 'Стартовал приём заявок на Burchalkin Cup',
        excerpt: 'Турнир соберёт международный состав команд и продолжит традицию детско-юношеского футбольного фестиваля.',
        link: 'news.html',
        image: '',
      }
    ],
    empty: () => ({
      id: Date.now(),
      tournament_slug: 'burchalkin-cup-2026',
      date: '',
      title: '',
      excerpt: '',
      link: 'news.html',
      image: '',
    }),
    fields: [
      ['id', 'ID', 'number'],
      ['tournament_slug', 'Турнир', 'text'],
      ['date', 'Дата', 'date'],
      ['title', 'Заголовок', 'text'],
      ['excerpt', 'Краткое описание', 'textarea'],
      ['link', 'Ссылка', 'text'],
      ['image', 'Картинка', 'image'],
    ],
  },
  partners: {
    key: 'bcup_admin_partners',
    exportName: 'partners.json',
    title: 'Партнёры',
    help: 'Каталог партнёров, категорий и логотипов. Эти данные будут основой для блока футера и будущей истории логотипов.',
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
        note: 'Здесь позже появится история логотипов через API.',
      },
      {
        slug: 'tass',
        name: 'ТАСС',
        category: 'media',
        tournament_slug: 'burchalkin-cup-2026',
        website_url: '',
        logo_url: '',
        alt_text: 'ТАСС',
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
      ['website_url', 'Сайт', 'text'],
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
let currentMode = 'form';

function cloneDefaultData(sourceName) {
  return structuredClone(ADMIN_SOURCES[sourceName].defaultData || []);
}

async function adminLoadDefault(sourceName) {
  if (defaultsCache[sourceName]) return structuredClone(defaultsCache[sourceName]);
  defaultsCache[sourceName] = cloneDefaultData(sourceName);
  return structuredClone(defaultsCache[sourceName]);
}

function getSourceData(sourceName) {
  const source = ADMIN_SOURCES[sourceName];
  const local = localStorage.getItem(source.key);
  if (local) {
    try { return JSON.parse(local); } catch (e) {}
  }
  return null;
}

function setSourceData(sourceName, data) {
  localStorage.setItem(ADMIN_SOURCES[sourceName].key, JSON.stringify(data));
}

function setStatus(text) {
  document.getElementById('admin-status').textContent = text;
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
  const items = [];
  const cards = document.querySelectorAll('.admin-item-card');
  cards.forEach((card, index) => {
    const item = {};
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
      if (type === 'number') value = value === '' ? 0 : Number(value);
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
      adminShowSource(sourceName);
      setStatus('Запись удалена.');
    });
  });

  const addBtn = document.getElementById('admin-add-item');
  if (addBtn) {
    addBtn.addEventListener('click', () => {
      const next = readFormData(sourceName);
      next.push(source.empty());
      setSourceData(sourceName, next);
      adminShowSource(sourceName);
      setStatus('Новая запись добавлена.');
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
      setStatus('Логотип выбран. Нажми «Сохранить».');
    });
  });

  wrap.querySelectorAll('[data-upload-image]').forEach(input => {
    input.addEventListener('change', (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        const key = e.target.dataset.uploadImage;
        const index = e.target.dataset.index;
        const textInput = wrap.querySelector(`[data-key="${key}"][data-index="${index}"]`);
        if (textInput) {
          textInput.value = reader.result;
          const previewBox = textInput.parentElement.querySelector('.admin-preview-box');
          if (previewBox) previewBox.innerHTML = `<img src="${reader.result}" alt="preview">`;
          setStatus('Картинка загружена в форму. Нажми «Сохранить».');
        }
      };
      reader.readAsDataURL(file);
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
}

async function adminShowSource(sourceName) {
  currentSource = sourceName;
  const source = ADMIN_SOURCES[sourceName];

  document.querySelectorAll('.admin-nav button').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.source === sourceName);
  });

  let data = getSourceData(sourceName);
  if (!data) data = await adminLoadDefault(sourceName);

  document.getElementById('admin-title').textContent = source.title;
  document.getElementById('admin-help').textContent = source.help;
  document.getElementById('admin-textarea').value = JSON.stringify(data, null, 2);
  renderForm(sourceName, data);
  switchMode(currentMode);
  setStatus('Раздел загружен.');
}

function switchMode(mode) {
  currentMode = mode;
  document.getElementById('mode-form').classList.toggle('active', mode === 'form');
  document.getElementById('mode-json').classList.toggle('active', mode === 'json');
  document.getElementById('admin-form-wrap').classList.toggle('active', mode === 'form');
  document.getElementById('admin-json-wrap').classList.toggle('active', mode === 'json');
  document.getElementById('admin-form-wrap').style.display = mode === 'form' ? 'block' : 'none';
  document.getElementById('admin-json-wrap').style.display = mode === 'json' ? 'block' : 'none';
}

function adminSave() {
  const source = ADMIN_SOURCES[currentSource];
  try {
    let parsed;
    if (currentMode === 'form') {
      parsed = readFormData(currentSource);
      document.getElementById('admin-textarea').value = JSON.stringify(parsed, null, 2);
    } else {
      parsed = JSON.parse(document.getElementById('admin-textarea').value);
      renderForm(currentSource, parsed);
    }
    setSourceData(currentSource, parsed);
    setStatus('Сохранено локально в браузере. Следующий шаг — связать этот раздел с Railway API.');
  } catch (e) {
    setStatus('Ошибка JSON: ' + e.message);
  }
}

async function adminReset() {
  const source = ADMIN_SOURCES[currentSource];
  localStorage.removeItem(source.key);
  const data = await adminLoadDefault(currentSource);
  document.getElementById('admin-textarea').value = JSON.stringify(data, null, 2);
  renderForm(currentSource, data);
  setStatus('Сброшено к стартовым данным раздела.');
}

function adminExport() {
  try {
    let text = document.getElementById('admin-textarea').value;
    if (currentMode === 'form') {
      text = JSON.stringify(readFormData(currentSource), null, 2);
      document.getElementById('admin-textarea').value = text;
    } else {
      JSON.parse(text);
    }
    const source = ADMIN_SOURCES[currentSource];
    const blob = new Blob([text], {type:'application/json;charset=utf-8'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = source.exportName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setStatus('JSON экспортирован.');
  } catch (e) {
    setStatus('Сначала исправь данные перед экспортом.');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const nav = document.getElementById('admin-nav');
  if (!nav) return;

  Object.entries(ADMIN_SOURCES).forEach(([name, meta]) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.dataset.source = name;
    btn.textContent = meta.title;
    btn.addEventListener('click', () => adminShowSource(name));
    nav.appendChild(btn);
  });

  document.getElementById('admin-save').addEventListener('click', adminSave);
  document.getElementById('admin-reset').addEventListener('click', adminReset);
  document.getElementById('admin-export').addEventListener('click', adminExport);
  document.getElementById('mode-form').addEventListener('click', () => switchMode('form'));
  document.getElementById('mode-json').addEventListener('click', () => switchMode('json'));

  adminShowSource('tournaments');
});
