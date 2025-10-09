import { withCors } from '../utils/cors.js';

import connectDB from '../lib/mongodb.js';
import PreSMEResponse from '../models/PreSMEResponse.js';

async function handler(req, res) {

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

export default withCors(handler);
