(function configureBcupApi() {
  const hostname = window.location.hostname;
  const isLocalPreview = hostname === 'localhost' || hostname === '127.0.0.1';
  const cloudinaryOverride = (localStorage.getItem('bcup_cloudinary_cloud_name') || '').trim();

  window.BCUP_CONFIG = Object.assign({
    apiBaseUrl: isLocalPreview
      ? 'http://127.0.0.1:3000'
      : 'https://burcup-production.up.railway.app',
    cloudinaryCloudName: cloudinaryOverride || 'dcqvo4aoj',
    cloudinaryFetchEnabled: false,
    autoTranslateEnabled: true,
    cloudinaryAssetMap: {}
  }, window.BCUP_CONFIG || {});
})();
