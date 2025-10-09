// API Configuration for CourseCraft AI
const API_CONFIG = {
  // Local Development Backend URL
  BACKEND_URL: 'http://localhost:3000',

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
