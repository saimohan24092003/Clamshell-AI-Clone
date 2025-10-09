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
  port: Number(process.env.PORT || 5000),
  openAiApiKey: required('OPENAI_API_KEY'),
  jwtSecret: required('JWT_SECRET', 'replace-me-in-production'),
  frontendOrigin: process.env.FRONTEND_ORIGIN || 'http://localhost:3000',
  enableRequestLogging: (process.env.REQUEST_LOGGING || 'true').toLowerCase() === 'true',
  mongoUri: required('MONGODB_URI', 'mongodb://127.0.0.1:27017/eduai'),
  sapApiKey: process.env.SAP_API_KEY || '',
  sapBaseUrl: process.env.SAP_BASE_URL || '',
};

export default env;


