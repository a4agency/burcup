(function configureBcupApi() {
  const hostname = window.location.hostname;
  const origin = window.location.origin;
  const isLocalPreview = hostname === 'localhost' || hostname === '127.0.0.1';
  const cloudinaryOverride = (localStorage.getItem('bcup_cloudinary_cloud_name') || '').trim();
  const apiOverride = (localStorage.getItem('bcup_api_base_url') || '').trim();
  const allowApiOverride = isLocalPreview;
  const runtimeConfig = window.BCUP_CONFIG || {};

  function normalizeApiBaseUrl(value) {
    return String(value || '').trim().replace(/\/+$/, '');
  }

  function appendCandidate(target, seen, value) {
    const normalized = normalizeApiBaseUrl(value);
    if (!normalized || seen.has(normalized)) return;
    seen.add(normalized);
    target.push(normalized);
  }

  const apiBaseCandidates = [];
  const seenApiBaseCandidates = new Set();
  const configuredFallbacks = Array.isArray(runtimeConfig.apiFallbackBaseUrls)
    ? runtimeConfig.apiFallbackBaseUrls
    : [];
  const configuredCandidates = Array.isArray(runtimeConfig.apiBaseCandidates)
    ? runtimeConfig.apiBaseCandidates
    : [];
  const inferredPrimaryApiBase = isLocalPreview
    ? 'http://127.0.0.1:3000'
    : origin;

  if (!allowApiOverride && apiOverride) {
    localStorage.removeItem('bcup_api_base_url');
  }

  appendCandidate(apiBaseCandidates, seenApiBaseCandidates, allowApiOverride ? apiOverride : '');
  appendCandidate(apiBaseCandidates, seenApiBaseCandidates, runtimeConfig.apiBaseUrl);
  configuredCandidates.forEach(value => appendCandidate(apiBaseCandidates, seenApiBaseCandidates, value));
  appendCandidate(apiBaseCandidates, seenApiBaseCandidates, inferredPrimaryApiBase);
  configuredFallbacks.forEach(value => appendCandidate(apiBaseCandidates, seenApiBaseCandidates, value));

  window.BCUP_CONFIG = Object.assign({
    cloudinaryCloudName: cloudinaryOverride || 'dcqvo4aoj',
    cloudinaryFetchEnabled: false,
    autoTranslateEnabled: true,
    cloudinaryAssetMap: {}
  }, runtimeConfig);

  window.BCUP_CONFIG.apiBaseUrl = apiBaseCandidates[0] || '';
  window.BCUP_CONFIG.apiBaseCandidates = apiBaseCandidates;
  window.BCUP_CONFIG.apiFallbackBaseUrls = apiBaseCandidates.slice(1);
})();
