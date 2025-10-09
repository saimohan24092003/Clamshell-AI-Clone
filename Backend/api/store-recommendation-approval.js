// Helper function to set CORS headers
function setCorsHeaders(req, res) {
  const origin = req.headers.origin;
  const allowedOrigins = process.env.FRONTEND_ORIGIN
    ? process.env.FRONTEND_ORIGIN.split(',')
    : ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:8080'];

  if (allowedOrigins.includes(origin) || !origin) {
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }
}

// Store recommendation approvals in memory (for development)
const recommendationApprovals = new Map();

export default async function handler(req, res) {
  // Set CORS headers
  setCorsHeaders(req, res);

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      sessionId,
      recommendationId,
      action,
      documents,
      aiEnhancement,
      timestamp
    } = req.body || {};

    // Ensure documents is always an array
    const documentsArray = Array.isArray(documents) ? documents : (documents ? [documents] : []);
    const isAiEnhancement = aiEnhancement === true || aiEnhancement === 'true';

    console.log('📝 Storing recommendation approval:', {
      sessionId,
      recommendationId,
      action,
      documentsCount: documentsArray.length,
      aiEnhancement: isAiEnhancement,
      timestamp
    });

    // Validate required fields
    if (!sessionId || recommendationId === undefined || !action) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        message: 'sessionId, recommendationId, and action are required'
      });
    }

    // Create approval record
    const approvalRecord = {
      sessionId,
      recommendationId,
      action,
      documents: documentsArray,
      aiEnhancement: isAiEnhancement,
      timestamp: timestamp || new Date().toISOString(),
      storedAt: new Date().toISOString()
    };

    // Store in memory
    const key = `${sessionId}_${recommendationId}`;
    if (!recommendationApprovals.has(sessionId)) {
      recommendationApprovals.set(sessionId, []);
    }

    const sessionApprovals = recommendationApprovals.get(sessionId);

    // Remove any existing approval for this recommendation
    const existingIndex = sessionApprovals.findIndex(
      approval => approval.recommendationId === recommendationId
    );

    if (existingIndex !== -1) {
      sessionApprovals[existingIndex] = approvalRecord;
      console.log(`✅ Updated existing approval for recommendation ${recommendationId}`);
    } else {
      sessionApprovals.push(approvalRecord);
      console.log(`✅ Stored new approval for recommendation ${recommendationId}`);
    }

    recommendationApprovals.set(sessionId, sessionApprovals);

    res.status(200).json({
      success: true,
      message: 'Recommendation approval stored successfully',
      data: {
        sessionId,
        recommendationId,
        action,
        timestamp: approvalRecord.timestamp
      }
    });
  } catch (error) {
    console.error('❌ Error storing recommendation approval:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to store recommendation approval',
      message: error.message
    });
  }
}

// Export the store for use in other endpoints
export { recommendationApprovals };
