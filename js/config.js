(function configureBcupApi() {
  const hostname = window.location.hostname;
  const isLocalPreview = hostname === 'localhost' || hostname === '127.0.0.1';

  window.BCUP_CONFIG = Object.assign({
    apiBaseUrl: isLocalPreview
      ? 'http://127.0.0.1:3000'
      : 'https://burcup-production.up.railway.app',
    cloudinaryCloudName: '',
    cloudinaryAssetMap: {}
  }, window.BCUP_CONFIG || {});
})();
