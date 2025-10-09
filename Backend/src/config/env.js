import dotenv from 'dotenv';
dotenv.config();

const required = (name, fallback = undefined) => {
  const value = process.env[name] ?? fallback;
  if (value === undefined || value === '') {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
};

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 3005),
  openAiApiKey: required('OPENAI_API_KEY'),
  jwtSecret: required('JWT_SECRET', 'clamshell-learning-secret-2024'),
  frontendOrigin: process.env.FRONTEND_ORIGIN || 'http://localhost:5173',
  enableRequestLogging: (process.env.REQUEST_LOGGING || 'true').toLowerCase() === 'true',

  // Database Configuration
  mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/coursecraft-ai',

  // OAuth Configuration
  googleClientId: required('GOOGLE_CLIENT_ID'),
  googleClientSecret: required('GOOGLE_CLIENT_SECRET'),
  microsoftClientId: required('MICROSOFT_CLIENT_ID'),
  microsoftClientSecret: required('MICROSOFT_CLIENT_SECRET'),

  // URLs
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  backendUrl: process.env.BACKEND_URL || 'http://localhost:3005',

  // Session
  sessionSecret: required('SESSION_SECRET')
};

export default env;
