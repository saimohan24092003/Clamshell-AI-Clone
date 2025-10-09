// API Configuration for CourseCraft AI
const API_CONFIG = {
  // Backend URL - automatically detects environment
  BACKEND_URL: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'https://clamshell-backend-pyblchd15-mohammed-asrafs-projects.vercel.app'
    : 'https://clamshell-backend-pyblchd15-mohammed-asrafs-projects.vercel.app',

  // API Endpoints
  ENDPOINTS: {
    HEALTH: '/api/health',
    AUTH: '/api/auth',
    CHAT: '/api/chat',
    STRATEGY: '/api/strategy',
    UPLOAD: '/api/upload',
    ANALYSIS: '/api/analysis'
  },

  // Helper function to get full API URL
  getApiUrl: function(endpoint) {
    return this.BACKEND_URL + (endpoint || '');
  }
};

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = API_CONFIG;
}
