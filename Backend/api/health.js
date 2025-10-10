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
      database: dbStatus
    });
  } catch (error) {
    res.status(200).json({
      status: 'ok',
      message: 'CourseCraft AI Backend is running',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      database: 'error',
      dbError: error.message
    });
  }
}

export default withCors(handler);
