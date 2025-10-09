import express from 'express';
import { dataService } from '../services/dataService.js';

const router = express.Router();

// Get analytics data
router.get('/', async (req, res) => {
  try {
    const analytics = await dataService.getAnalytics();

    res.json({
      success: true,
      message: 'Analytics data retrieved successfully',
      data: {
        ...analytics,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('❌ Analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve analytics data',
      error: error.message
    });
  }
});

// Search sessions
router.get('/search', async (req, res) => {
  try {
    const { query, limit } = req.query;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const results = await dataService.searchSessions(query, parseInt(limit) || 20);

    res.json({
      success: true,
      message: 'Search results retrieved successfully',
      data: {
        query,
        resultsCount: results.length,
        results: results.map(session => ({
          sessionId: session.sessionId,
          uploadedAt: session.uploadedAt,
          status: session.status,
          filesCount: session.files?.length || 0,
          domain: session.analysisResults?.domainClassified,
          complexity: session.analysisResults?.complexityLevel,
          qualityScore: session.analysisResults?.qualityScore
        }))
      }
    });
  } catch (error) {
    console.error('❌ Search error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search sessions',
      error: error.message
    });
  }
});

// Get recent sessions
router.get('/recent', async (req, res) => {
  try {
    const { limit = 10, skip = 0 } = req.query;

    const recentSessions = await dataService.getAllUploadSessions(parseInt(limit), parseInt(skip));

    res.json({
      success: true,
      message: 'Recent sessions retrieved successfully',
      data: {
        sessions: recentSessions.map(session => ({
          sessionId: session.sessionId,
          uploadedAt: session.uploadedAt,
          status: session.status,
          filesCount: session.files?.length || 0,
          analysisProgress: session.analysisProgress,
          domain: session.analysisResults?.domainClassified,
          complexity: session.analysisResults?.complexityLevel,
          qualityScore: session.analysisResults?.qualityScore
        })),
        count: recentSessions.length
      }
    });
  } catch (error) {
    console.error('❌ Recent sessions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve recent sessions',
      error: error.message
    });
  }
});

export default router;