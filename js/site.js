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


document.addEventListener('DOMContentLoaded', function(){
  const year = document.getElementById('year');
  if(year) year.textContent = new Date().getFullYear();
  initActiveHeaderLink();
  initHeaderMenu();
  upgradeStaticImagesForCloudinary();
});


async function renderStandings(selector) {
  const target = document.querySelector(selector);
  if (!target) return;
  try {
    const data = await fetchJson('data/standings.json');
    const rows = data.map((item, index) => `
      <tr>
        <td class="num">${index + 1}</td>
        <td>
          <div class="standings-team">
            ${renderImageMarkup({ src: item.logo, alt: item.team, width: 96 })}
            <span>${item.team}</span>
          </div>
        </td>
        <td class="num">${item.played}</td>
        <td class="num">${item.goals}</td>
        <td class="points">${item.points}</td>
      </tr>
    `).join('');

    target.innerHTML = `
      <div class="standings-card">
        <table class="standings-table">
          <colgroup>
            <col class="col-rank">
            <col class="col-team">
            <col class="col-played">
            <col class="col-goals">
            <col class="col-points">
          </colgroup>
          <thead>
            <tr>
              <th>№</th>
              <th>Команда</th>
              <th>Игры</th>
              <th>Мячи</th>
              <th>Очки</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    `;
  } catch (error) {
    target.innerHTML = '<div class="standings-card"><div style="padding:18px">Не удалось загрузить таблицу.</div></div>';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  initResultsUpcomingSlider();
  initHomeUpcomingSlider();
  initHeroCarousel();
  renderStandings('#home-standings');
  renderStandings('#results-standings');
});


function escapeHtml(str) {
  return String(str ?? '').replace(/[&<>"]/g, s => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[s]));
}

const TRANSPARENT_IMAGE_PLACEHOLDER = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==';

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
  return Boolean(getCloudinaryCloudName()) && !isLocalPreviewPage();
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
  const optimizedSrc = getOptimizedImageUrl(src, { width, height, crop, gravity });
  const attrs = [`src="${escapeHtml(optimizedSrc || TRANSPARENT_IMAGE_PLACEHOLDER)}"`];

  if (className) attrs.push(`class="${escapeHtml(className)}"`);
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
        width: 960,
        height: 540,
        crop: 'fill',
        gravity: 'auto'
      })}
    </div>
  `;
}

function hydrateDeferredImage(image) {
  if (!image || image.dataset.hydrated === 'true') return;
  const { src, srcset, sizes } = image.dataset;
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
  if (image.classList.contains('news-preview-cover-img')) return { width: 960, height: 540, crop: 'fill', gravity: 'auto' };
  if (image.closest('.thumb')) return { width: 720, height: 480, crop: 'fill', gravity: 'auto' };
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

    if (profile.srcsetWidths?.length) {
      image.setAttribute('src', getOptimizedImageUrl(originalSrc, { ...profile, width: Math.max(...profile.srcsetWidths) }));
      image.setAttribute('srcset', profile.srcsetWidths.map(width => `${getOptimizedImageUrl(originalSrc, { ...profile, width })} ${width}w`).join(', '));
      if (profile.sizes) image.setAttribute('sizes', profile.sizes);
      return;
    }

    image.setAttribute('src', getOptimizedImageUrl(originalSrc, profile));
  });
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
        return JSON.parse(local);
      } catch (e) {}
    }
  }
  const apiBaseUrl = getApiBaseUrl();
  const endpoint = API_ENDPOINTS[path];
  if (apiBaseUrl && endpoint) {
    try {
      const remoteData = await fetchApi(endpoint);
      if (remoteData) return remoteData;
    } catch (error) {
      console.warn(`Remote API ${endpoint} is unavailable, falling back to static file.`, error);
    }
  }
  const response = await fetch(path);
  if (!response.ok) throw new Error(`Failed to load ${path}`);
  return response.json();
}

function renderClubCard(item) {
  const matchesCount = Number(item.matches_count || 0);
  return `
    <a class="team-logo-card club-card-link" href="club.html?slug=${encodeURIComponent(item.slug)}">
      <div class="team-logo-wrap">${renderImageMarkup({ src: item.logo, alt: item.name, className: 'team-logo-img', width: 240 })}</div>
      <h3>${escapeHtml(item.name)}</h3>
      <div class="muted team-country">${escapeHtml(item.city || item.country || '')}</div>
      <div class="club-card-meta">${escapeHtml(formatCountLabel(matchesCount, ['матч', 'матча', 'матчей']))} в истории</div>
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
  if (!tournaments) return;
  target.innerHTML = tournaments.map(item => `
    <article class="tournament-card">
      <div class="tournament-card-top">
        <div class="tournament-card-year">${escapeHtml(item.season_year || '')}</div>
        <div class="tournament-card-status ${escapeHtml(item.status)}">${escapeHtml(formatTournamentStatus(item.status))}</div>
      </div>
      <h3>${escapeHtml(item.name)}</h3>
      <p>${escapeHtml(item.description || '')}</p>
      <div class="tournament-card-meta">
        <span>${escapeHtml(formatCountLabel(item.clubs_count, ['клуб', 'клуба', 'клубов']))}</span>
        <span>${escapeHtml(formatCountLabel(item.matches_count, ['матч', 'матча', 'матчей']))}</span>
      </div>
      <div class="tournament-card-dates">${escapeHtml(item.start_date || '')}${item.end_date ? ` - ${escapeHtml(item.end_date)}` : ''}</div>
    </article>
  `).join('');
}

function renderPartnerItem(item) {
  if (item.logo_url) {
    return `
      <a class="sponsor-item sponsor-item-logo" href="${escapeHtml(item.website_url || '#')}" ${item.website_url ? 'target="_blank" rel="noreferrer"' : ''}>
        ${renderImageMarkup({ src: item.logo_url, alt: item.logo_alt || item.name, width: 320 })}
        <span>${escapeHtml(item.name)}</span>
      </a>
    `;
  }
  return `
    <a class="sponsor-item" href="${escapeHtml(item.website_url || '#')}" ${item.website_url ? 'target="_blank" rel="noreferrer"' : ''}>
      ${escapeHtml(item.name)}
    </a>
  `;
}

async function renderPartnersForFeaturedTournament() {
  const generalTarget = document.querySelector('#partners-general');
  const mediaTarget = document.querySelector('#partners-media');
  if (!generalTarget && !mediaTarget) return;
  const tournaments = await fetchApi('/api/tournaments');
  if (!tournaments || !tournaments.length) return;
  const featured = tournaments.find(item => item.is_featured) || tournaments[0];
  if (!featured) return;
  const partnerGroups = await fetchApi(`/api/tournaments/${featured.slug}`);
  if (!partnerGroups || !Array.isArray(partnerGroups.partners)) return;
  const general = partnerGroups.partners.find(item => item.slug === 'general');
  const media = partnerGroups.partners.find(item => item.slug === 'media');
  if (generalTarget && general) generalTarget.innerHTML = general.items.map(renderPartnerItem).join('');
  if (mediaTarget && media) mediaTarget.innerHTML = media.items.map(renderPartnerItem).join('');
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
  if (!club) {
    target.innerHTML = '<section class="section"><div class="container card"><h2>Клуб недоступен</h2><p class="muted">API ещё не подключён или клуб не найден.</p></div></section>';
    return;
  }
  const matchesMarkup = club.matches.map(item => {
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
        <div class="club-head-logo">${renderImageMarkup({ src: club.logo, alt: club.name, width: 320, loading: 'eager' })}</div>
        <div>
          <h1>${escapeHtml(club.name)}</h1>
          <p>${escapeHtml(club.description || '')}</p>
          <div class="club-head-meta">
            <span>${escapeHtml(club.city || '')}</span>
            <span>${escapeHtml(club.country || '')}</span>
            ${club.founded_year ? `<span>${escapeHtml(String(club.founded_year))}</span>` : ''}
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
            <div class="upcoming-time">• ${escapeHtml(item.time || '')} ${escapeHtml(item.status_label || '')}</div>
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
    target.innerHTML = items.map(item => `
      <a class="news-preview-card" href="${escapeHtml(item.link)}">
        ${renderNewsCoverImage(item.image, item.title)}
        <div class="news-preview-content">
          <div class="news-preview-date">${escapeHtml(item.date)}</div>
          <h3>${escapeHtml(item.title)}</h3>
          <p>${escapeHtml(item.excerpt)}</p>
        </div>
      </a>
    `).join('');
    runAutoFit();
  } catch (e) {
    target.innerHTML = '<div class="card">Не удалось загрузить новости.</div>';
  }
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
            <div class="upcoming-time">• ${escapeHtml(item.time || '')} ${escapeHtml(item.status_label || '')}</div>
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
    target.innerHTML = items.map(item => `
      <a class="news-card" href="${escapeHtml(item.link)}">
        <div class="thumb">${item.image ? renderImageMarkup({ src: item.image, alt: item.title, width: 720, height: 480, crop: 'fill', gravity: 'auto' }) : `<div class="news-preview-cover" style="height:100%"></div>`}</div>
        <div class="meta-top"><span>${escapeHtml(item.date)}</span></div>
        <h3>${escapeHtml(item.title)}</h3>
        <p>${escapeHtml(item.excerpt)}</p>
      </a>
    `).join('');
    runAutoFit();
  } catch (e) {
    target.innerHTML = '<div class="card">Не удалось загрузить новости.</div>';
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
            <div class="upcoming-time">• ${escapeHtml(item.time || '')} ${escapeHtml(item.status_label || '')}</div>
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
    const id = Number(new URLSearchParams(window.location.search).get('id') || '1');
    const item = items.find(x => x.id === id) || items[0];
    const parts = String(item.score || '0:0').split(':');
    const homeScore = item.score ? escapeHtml(parts[0] || '0') : '0';
    const awayScore = item.score ? escapeHtml(parts[1] || '0') : '0';
    const matchMeta = joinNonEmpty([item.date, item.time, item.status_label || ''], ' • ');
    target.innerHTML = `
      <div class="container article-wrap">
        <div class="breadcrumbs"><span>${escapeHtml(item.stage || item.group || 'Матч')}</span><span>•</span><span>Кубок Бурчалкина</span></div>
        <h1 class="article-title">${escapeHtml(item.home_team)} — ${escapeHtml(item.away_team)}</h1>
        <div class="author-row">
          <div class="author-left">
            <div><div style="font-weight:700">Редакция Burchalkin Cup</div><div class="card-meta">${escapeHtml(matchMeta)}</div></div>
          </div>
        </div>
        <div class="card" style="margin-bottom:18px">
          <div class="match-stack">
            <div class="match-row">
              <div class="match-team">
                ${renderImageMarkup({ src: item.home_logo, alt: item.home_team, className: 'match-team-logo', width: 180 })}
                <div class="match-team-name">${escapeHtml(item.home_team)}</div>
              </div>
              <div class="match-team-score">${homeScore}</div>
            </div>
            <div class="match-row">
              <div class="match-team">
                ${renderImageMarkup({ src: item.away_logo, alt: item.away_team, className: 'match-team-logo', width: 180 })}
                <div class="match-team-name">${escapeHtml(item.away_team)}</div>
              </div>
              <div class="match-team-score">${awayScore}</div>
            </div>
          </div>
        </div>
        <iframe class="match-page-video" src="${escapeHtml(item.video)}" allowfullscreen></iframe>
        <p class="lead">${escapeHtml(item.summary || '')}</p>
      </div>
    `;
    runAutoFit();
  } catch (e) {
    target.innerHTML = '<div class="container"><div class="card">Не удалось загрузить матч.</div></div>';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  renderUpcomingMatches();
  renderHomeNews();
  renderMatchesPage();
  renderNewsPage();
  renderResultsList();
  renderResultsMatches();
  renderMatchPageFromJson();
  renderTournamentsGrid();
  renderClubsGrid('#clubs-grid-home', 8);
  renderClubsGrid('#clubs-grid-page');
  renderPartnersForFeaturedTournament();
  renderClubPage();
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
