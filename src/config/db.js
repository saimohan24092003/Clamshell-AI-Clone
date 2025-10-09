import mongoose from 'mongoose';
import { env } from './env.js';
import { log } from '../utils/logger.js';

export async function connectDb() {
  mongoose.set('strictQuery', true);
  await mongoose.connect(env.mongoUri, { autoIndex: true });
  log.info('MongoDB connected');
}

export default connectDb;


