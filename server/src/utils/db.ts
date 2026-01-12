import mongoose from 'mongoose';
import { env } from '../config/environment.js';
import { logger } from './logger.js';

mongoose.connection.on('connected', () => {
  logger.info('🗄️  MongoDB connected');
});

mongoose.connection.on('disconnected', () => {
  logger.warn('MongoDB disconnected');
});

mongoose.connection.on('error', (error) => {
  logger.error({ error }, 'MongoDB connection error');
});

export const connectDB = async () => {
  await mongoose.connect(env.MONGO_URI);
};

export const disconnectDB = async () => {
  await mongoose.disconnect();
};
