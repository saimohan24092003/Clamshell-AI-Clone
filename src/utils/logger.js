import morgan from 'morgan';
import { env } from '../config/env.js';

export const httpLogger = env.enableRequestLogging
  ? morgan(':method :url :status :res[content-length] - :response-time ms')
  : (req, res, next) => next();

export const log = {
  info: (...args) => console.log('[INFO]', ...args),
  warn: (...args) => console.warn('[WARN]', ...args),
  error: (...args) => console.error('[ERROR]', ...args),
};

export default log;


