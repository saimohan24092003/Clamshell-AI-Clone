import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { env } from './config/env.js';
import { httpLogger } from './utils/logger.js';
import { errorHandler } from './middleware/errorHandler.js';

import chatRouter from './routes/chat.js';
import authRouter from './routes/auth.js';
import sapRouter from './routes/sap.js';

const app = express();

app.use(helmet());

app.use(cors({
  origin: env.frontendOrigin,
  credentials: true,
}));

app.use(express.json({ limit: '1mb' }));

app.use(httpLogger);

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

const globalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(globalLimiter);

app.use('/api/chat', chatRouter);
app.use('/api/auth', authRouter);
app.use('/api/sap', sapRouter);

app.use(errorHandler);

export default app;


