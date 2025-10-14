import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cors from 'cors';

dotenv.config();

const app = express();

// Standard CORS configuration
const corsOptions = {
  origin: [
    /localhost:3000$/,
    /localhost:3001$/,
    /vercel\.app$/
  ],
  credentials: true,
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Enable pre-flight for all routes

// MongoDB Connection (async, will connect on first request)
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/coursecraft-ai';
let isConnected = false;

async function connectDB() {
  if (isConnected) return;
  try {
    await mongoose.connect(MONGODB_URI);
    isConnected = true;
    console.log('✅ MongoDB connected');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    throw err;
  }
}

// Connect to DB on startup (non-blocking)
connectDB().catch(() => console.log('ℹ️  Running without MongoDB - some features may be limited'));

// Body parser with increased limit for file uploads
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Root route handler
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'CourseCraft AI Backend is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    endpoints: {
      health: '/api/health',
      upload: '/api/upload',
      analyze: '/api/analyze',
      strategy: '/api/strategy',
      learningMap: '/api/learning-map'
    }
  });
});

// Basic health check
app.get('/api/health', async (req, res) => {
  try {
    await connectDB();
    res.json({
      status: 'ok',
      message: 'CourseCraft AI Backend is running',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Database connection failed',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      database: 'error',
      error: error.message
    });
  }
});

app.get('/health', async (req, res) => {
  try {
    await connectDB();
    res.json({ status: 'ok', database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' });
  } catch (error) {
    res.json({ status: 'ok', database: 'error' });
  }
});

// Import API route handlers
import healthHandler from './api/health.js';
import uploadHandler from './api/upload.js';
import analyzeHandler from './api/analyze.js';
import strategyHandler from './api/strategy.js';
import learningMapHandler from './api/learning-map.js';
import storePreSMEHandler from './api/store-pre-sme-responses.js';
import generateFinalReportHandler from './api/generate-final-report.js';
import uploadRecommendationDocsHandler from './api/upload-recommendation-docs.js';
import storeRecommendationApprovalHandler from './api/store-recommendation-approval.js';
import enhanceRecommendationContentHandler from './api/enhance-recommendation-content.js';
import generateStrategiesHandler from './api/generate-strategies.js';
import generateLearningMapAIHandler from './api/generate-learning-map-ai.js';

// Register API routes
app.all('/api/health', healthHandler);
app.all('/api/upload', uploadHandler);
app.all('/api/analyze', analyzeHandler);
app.all('/api/strategy', strategyHandler);
app.all('/api/learning-map', learningMapHandler);
app.all('/api/store-pre-sme-responses', storePreSMEHandler);
app.all('/api/generate-final-report', generateFinalReportHandler);
app.all('/upload-recommendation-docs', uploadRecommendationDocsHandler);
app.all('/store-recommendation-approval', storeRecommendationApprovalHandler);
app.all('/api/enhance-recommendation-content', enhanceRecommendationContentHandler);
app.all('/api/generate-strategies', generateStrategiesHandler);
app.all('/api/generate-learning-map-ai', generateLearningMapAIHandler);

// Global error handler
app.use((error, req, res, next) => {
  console.error('Error:', error);
  res.status(error.status || 500).json({
    success: false,
    error: error.message || 'Internal server error'
  });
});

// For local development
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📍 Health check: http://localhost:${PORT}/api/health`);
  });
}

// Export for Vercel serverless
export default app;
