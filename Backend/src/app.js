// app.js

// Core dependencies
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import session from 'express-session';
import passport from 'passport';
import rateLimit from 'express-rate-limit';

// Config and utilities
import { env } from './config/env.js';
import { httpLogger } from './utils/logger.js';
import { errorHandler } from './middleware/errorHandler.js';
import { connectToDatabase, getConnectionStatus } from './config/database.js';

// Import OAuth configuration
import './config/passport.js';

// Import routes
import chatRouter from './routes/chat.js';
import authRouter from './routes/auth.js';
import strategyRouter from './routes/strategy.js';
import contentRouter from './routes/content.js';
import feedbackRouter from './routes/feedback.js';
import notificationsRouter from './routes/notifications.js';
import smeRouter from './routes/sme.js';
import preSMERouter from './routes/presme.js';
import legacyEndpointsRouter from './routes/legacy-endpoints.js';
import analyticsRouter from './routes/analytics.js';
import commentsRouter from './routes/comments.js';
import reportRouter from './routes/report.js';

// Create Express app
const app = express();

// Connect to DB
connectToDatabase().catch(error => {
  console.error('❌ Failed to connect to MongoDB:', error);
  process.exit(1);
});

// Security headers
app.use(helmet());

// CORS config
app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);

    const allowedOrigins = [
      env.frontendOrigin,
      'http://localhost:5173',
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:5173',
      'http://localhost:8080',
      'http://127.0.0.1:8080'
    ];

    if (origin.startsWith('file://') || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    if (env.nodeEnv === 'development' && origin.includes('localhost')) {
      return callback(null, true);
    }

    return callback(null, true); // Be permissive for now
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
}));

// Body parsers
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static files
app.use(express.static('public'));

// Session config
app.use(session({
  secret: env.sessionSecret,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: env.nodeEnv === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000,
  }
}));

// Passport
app.use(passport.initialize());
app.use(passport.session());

// Logger
app.use(httpLogger);

// Healthchecks
app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.get('/api/health', (req, res) => {
  const dbStatus = getConnectionStatus();
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    services: {
      api: 'healthy',
      database: {
        status: dbStatus.isConnected ? 'connected' : 'disconnected',
        readyState: dbStatus.readyState,
        host: dbStatus.host,
        name: dbStatus.name
      }
    }
  });
});

// Rate limiter
app.use(rateLimit({ windowMs: 60 * 1000, max: 120 }));

// Routes
app.use('/api/auth', authRouter);
app.use('/api/chat', chatRouter);
app.use('/api/strategy', strategyRouter);
app.use('/api/content', contentRouter);
app.use('/api/report', reportRouter);
app.use('/api/feedback', feedbackRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api/sme', smeRouter);
app.use('/api/presme', preSMERouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/comments', commentsRouter);
app.use('/api', legacyEndpointsRouter);

// Error handler
app.use(errorHandler);

export default app;
