window.AGROSHARE_CONFIG = {
  apiBase:
    window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
      ? 'http://127.0.0.1:8000/api'
      // Replace this if you choose different Render service names.
      : 'https://agroshare-api-g7ze.onrender.com/api',
  allowedOrigins: [window.location.origin],
};