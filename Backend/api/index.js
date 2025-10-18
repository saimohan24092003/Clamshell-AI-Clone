export default function handler(req, res) {
  res.status(200).json({
    message: 'CourseCraft AI Backend API',
    status: 'running',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      upload: '/api/upload',
      analyze: '/api/analyze',
      strategy: '/api/strategy',
      'learning-map': '/api/learning-map',
      'generate-strategies': '/api/generate-strategies',
      'generate-learning-map-ai': '/api/generate-learning-map-ai',
      'store-pre-sme-responses': '/api/store-pre-sme-responses',
      'store-recommendation-approval': '/api/store-recommendation-approval',
      'upload-recommendation-docs': '/api/upload-recommendation-docs',
      'enhance-recommendation-content': '/api/enhance-recommendation-content',
      'generate-final-report': '/api/generate-final-report'
    },
    documentation: 'https://github.com/Mohammed-Asraf/Clamshell_AI'
  });
}
