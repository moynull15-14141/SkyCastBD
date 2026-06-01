import mongoose from 'mongoose';
import { SearchLog } from '../models/SearchLog.js';

export const createSearchLog = async (payload) => {
  if (mongoose.connection.readyState !== 1) return null;
  return SearchLog.create(payload);
};
