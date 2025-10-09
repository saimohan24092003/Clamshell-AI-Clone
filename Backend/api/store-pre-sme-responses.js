import connectDB from '../lib/mongodb.js';
import PreSMEResponse from '../models/PreSMEResponse.js';

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
    // Connect to MongoDB
    await connectDB();

    const { sessionId, preSMEAnswers } = req.body;

    console.log('💾 Storing Pre-SME responses for session:', sessionId);
    console.log('📊 Frameworks selected:', preSMEAnswers.instructionalFrameworks);

    // Validate required fields
    if (!sessionId || !preSMEAnswers) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }

    // Create or update Pre-SME response
    const preSMEResponse = await PreSMEResponse.findOneAndUpdate(
      { sessionId },
      {
        sessionId,
        clientName: preSMEAnswers.clientName, // Add this line
        contentConfirmation: preSMEAnswers.contentConfirmation,
        audienceLevel: preSMEAnswers.audienceLevel,
        courseType: preSMEAnswers.courseType,
        courseDuration: preSMEAnswers.courseDuration,
        instructionalFrameworks: preSMEAnswers.instructionalFrameworks || ['Blooms Taxonomy', 'ADDIE Model'],
        detectedDomain: preSMEAnswers.detectedDomain,
        detectedComplexity: preSMEAnswers.detectedComplexity,
        completedAt: new Date(preSMEAnswers.completedAt)
      },
      {
        upsert: true,
        new: true,
        runValidators: true
      }
    );

    console.log('✅ Pre-SME responses stored successfully');
    console.log(`📋 Document ID: ${preSMEResponse._id}`);

    res.status(200).json({
      success: true,
      message: 'Pre-SME responses stored successfully',
      data: {
        id: preSMEResponse._id,
        sessionId: preSMEResponse.sessionId,
        frameworks: preSMEResponse.instructionalFrameworks
      }
    });
  } catch (error) {
    console.error('❌ Error storing Pre-SME responses:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to store Pre-SME responses',
      message: error.message
    });
  }
}
