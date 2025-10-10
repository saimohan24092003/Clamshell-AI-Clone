import connectDB from '../lib/mongodb.js';
import mongoose from 'mongoose';
import { withCors } from '../utils/cors.js';

async function handler(req, res) {
  try {
    await connectDB();
    const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';

    res.status(200).json({
      status: 'ok',
      message: 'CourseCraft AI Backend is running',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      database: dbStatus,
      ai_expert: 'Dr. Elena Rodriguez',
      accuracy: '95%+',
      capabilities: [
        'Content Analysis',
        'Instructional Design',
        'Learning Strategy Generation',
        'SME Question Generation',
        'Gap Analysis',
        'Domain Classification'
      ]
    });
  } catch (error) {
    res.status(200).json({
      status: 'ok',
      message: 'CourseCraft AI Backend is running',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      database: 'error',
      dbError: error.message,
      ai_expert: 'Dr. Elena Rodriguez',
      accuracy: '95%+',
      capabilities: [
        'Content Analysis',
        'Instructional Design',
        'Learning Strategy Generation',
        'SME Question Generation',
        'Gap Analysis',
        'Domain Classification'
      ]
    });
  }
}

export default withCors(handler);
