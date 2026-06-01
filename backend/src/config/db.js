import mongoose from 'mongoose';
import { env } from './env.js';

export const connectDatabase = async () => {
  mongoose.set('strictQuery', true);

  try {
    await mongoose.connect(env.mongoUri, {
      autoIndex: !env.isProduction,
      serverSelectionTimeoutMS: 8000
    });
  } catch (error) {
    if (env.requireMongoDb || env.isProduction) {
      throw error;
    }

    console.warn('MongoDB unavailable. Continuing without database logging.');
    return false;
  }

  console.log('MongoDB connected.');
  return true;
};
