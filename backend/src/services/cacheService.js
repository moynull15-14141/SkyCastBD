import NodeCache from 'node-cache';
import { env } from '../config/env.js';

const cache = new NodeCache({
  stdTTL: env.cacheTtlSeconds,
  checkperiod: Math.max(60, Math.floor(env.cacheTtlSeconds / 2)),
  useClones: false
});

export const getCached = (key) => cache.get(key);
export const setCached = (key, value, ttl = env.cacheTtlSeconds) => cache.set(key, value, ttl);
export const buildCacheKey = (namespace, params) => {
  const searchParams = new URLSearchParams();
  Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== null && value !== '')
    .sort(([a], [b]) => a.localeCompare(b))
    .forEach(([key, value]) => searchParams.set(key, String(value)));

  return `${namespace}:${searchParams.toString()}`;
};
