
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
  standings: {
    key: 'bcup_standings',
    path: 'data/standings.json',
    title: 'Турнирная таблица',
    help: 'Визуальный редактор турнирной таблицы.',
    empty: () => ({ team: '', logo: '', played: 0, goals: '', points: 0 }),
    fields: [
      ['team', 'Команда', 'text'],
      ['logo', 'Логотип', 'logo'],
      ['played', 'Игры', 'number'],
      ['goals', 'Мячи', 'text'],
      ['points', 'Очки', 'number'],
    ],
  },
  matches: {
    key: 'bcup_matches',
    path: 'data/matches.json',
    title: 'Матчи',
    help: 'Редактор матчей с выбором логотипов и YouTube embed.',
    empty: () => ({
      id: Date.now(),
      date: '2026-03-15',
      time: '10:00',
      status: 'soon',
      status_label: 'Скоро',
      home_team: '',
      home_logo: '',
      away_team: '',
      away_logo: '',
      score: '0:0',
      group: '',
      video: '',
      summary: '',
    }),
    fields: [
      ['id', 'ID', 'number'],
      ['date', 'Дата', 'date'],
      ['time', 'Время', 'time'],
      ['status', 'Статус', 'select', ['soon', 'live', 'done']],
      ['status_label', 'Подпись статуса', 'text'],
      ['home_team', 'Домашняя команда', 'text'],
      ['home_logo', 'Логотип домашней', 'logo'],
      ['away_team', 'Гостевая команда', 'text'],
      ['away_logo', 'Логотип гостевой', 'logo'],
      ['score', 'Счёт', 'score'],
      ['group', 'Группа / стадия', 'text'],
      ['video', 'Видео (embed URL)', 'text'],
      ['summary', 'Описание', 'textarea'],
    ],
  },
  news: {
    key: 'bcup_news',
    path: 'data/news.json',
    title: 'Новости',
    help: 'Редактор новостей с изображением и ссылкой.',
    empty: () => ({
      id: Date.now(),
      date: '',
      title: '',
      excerpt: '',
      link: 'news.html',
      image: '',
    }),
    fields: [
      ['id', 'ID', 'number'],
      ['date', 'Дата', 'date'],
      ['title', 'Заголовок', 'text'],
      ['excerpt', 'Краткое описание', 'textarea'],
      ['link', 'Ссылка', 'text'],
      ['image', 'Картинка (URL или data:image)', 'image'],
    ],
  },
  results: {
    key: 'bcup_results',
    path: 'data/results.json',
    title: 'Результаты',
    help: 'Редактор результатов матчей.',
    empty: () => ({ stage: '', match: '', score: '' }),
    fields: [
      ['stage', 'Стадия', 'text'],
      ['match', 'Матч', 'text'],
      ['score', 'Счёт', 'score'],
    ],
  },
};

let currentSource = 'standings';
let defaultsCache = {};
let currentMode = 'form';

async function adminLoadDefault(sourceName) {
  const source = ADMIN_SOURCES[sourceName];
  if (defaultsCache[sourceName]) return structuredClone(defaultsCache[sourceName]);
  const response = await fetch(source.path);
  const data = await response.json();
  defaultsCache[sourceName] = data;
  return structuredClone(data);
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
  const extraClass = key === 'away_team' ? 'guest-team-field' : '';
  return `
    <div class="admin-field ${extraClass}">
      <label>${label}</label>
      <input type="${type}" value="${value ?? ''}" data-key="${key}" data-index="${itemIndex}">
    </div>`;
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
    input.addEventListener('change', async (e) => {
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
        const left = leftEl ? leftEl.value || '0' : '0';
        const right = rightEl ? rightEl.value || '0' : '0';
        item[key] = `${left}:${right}`;
        return;
      }
      const el = card.querySelector(`[data-key="${key}"][data-index="${index}"]`);
      if (!el) return;
      let value = el.value;
      if (type === 'number') value = value === '' ? 0 : Number(value);
      item[key] = value;
    });
    items.push(item);
  });
  return items;
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
  const fw = document.getElementById('admin-form-wrap'); if (fw && currentMode === 'form') fw.style.display = 'block';
  const jw = document.getElementById('admin-json-wrap'); if (jw && currentMode === 'form') jw.style.display = 'none';
  setStatus('Данные загружены.');
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
    localStorage.setItem(source.key, JSON.stringify(parsed));
    setStatus('Сохранено в браузере. Обнови страницы сайта, чтобы увидеть изменения.');
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
  setStatus('Сброшено к данным из файла.');
}

function adminExport() {
  try {
    let text = document.getElementById('admin-textarea').value;
    if (currentMode === 'form') {
      const parsed = readFormData(currentSource);
      text = JSON.stringify(parsed, null, 2);
      document.getElementById('admin-textarea').value = text;
    } else {
      JSON.parse(text);
    }
    const source = ADMIN_SOURCES[currentSource];
    const blob = new Blob([text], {type:'application/json;charset=utf-8'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = source.path.split('/').pop();
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

  adminShowSource('standings');
});


document.addEventListener('DOMContentLoaded', () => {
  const wrap = document.getElementById('admin-form-wrap');
  const jsonWrap = document.getElementById('admin-json-wrap');
  const modeForm = document.getElementById('mode-form');
  if (wrap && !wrap.classList.contains('active')) wrap.classList.add('active');
  if (jsonWrap && jsonWrap.classList.contains('active') && modeForm && modeForm.classList.contains('active')) {
    jsonWrap.classList.remove('active');
  }
});
