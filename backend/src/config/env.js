import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const schema = z
  .object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(10000),
  CLIENT_ORIGIN: z.string().default('http://127.0.0.1:4173,http://localhost:4173'),
  MONGODB_URI: z.string().min(1),
  REQUIRE_MONGODB: z.enum(['true', 'false']).default('false').transform((value) => value === 'true'),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters long.').optional(),
  JWT_EXPIRES_IN: z.string().default('7d'),
  ADMIN_USERNAME: z.string().trim().min(3).max(64).optional(),
  ADMIN_PASSWORD: z.string().min(8).max(128).optional(),
  OPEN_METEO_FORECAST_URL: z.string().url().default('https://api.open-meteo.com/v1/forecast'),
  OPEN_METEO_GEOCODING_URL: z.string().url().default('https://geocoding-api.open-meteo.com/v1/search'),
  OPEN_METEO_AIR_QUALITY_URL: z.string().url().default('https://air-quality-api.open-meteo.com/v1/air-quality'),
  CACHE_TTL_SECONDS: z.coerce.number().int().positive().default(300),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(60000),
  RATE_LIMIT_MAX: z.coerce.number().int().positive().default(120)
})
  .superRefine((data, ctx) => {
    if (data.NODE_ENV === 'production' && !data.JWT_SECRET) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['JWT_SECRET'],
        message: 'JWT_SECRET is required in production.'
      });
    }
  });

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment configuration:', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = {
  nodeEnv: parsed.data.NODE_ENV,
  isProduction: parsed.data.NODE_ENV === 'production',
  port: parsed.data.PORT,
  clientOrigins: parsed.data.CLIENT_ORIGIN.split(',').map((origin) => origin.trim()),
  mongoUri: parsed.data.MONGODB_URI,
  requireMongoDb: parsed.data.REQUIRE_MONGODB,
  jwtSecret: parsed.data.JWT_SECRET || 'development-only-skycastbd-jwt-secret-change-before-production',
  jwtExpiresIn: parsed.data.JWT_EXPIRES_IN,
  adminUsername: parsed.data.ADMIN_USERNAME?.toLowerCase(),
  adminPassword: parsed.data.ADMIN_PASSWORD,
  openMeteo: {
    forecastUrl: parsed.data.OPEN_METEO_FORECAST_URL,
    geocodingUrl: parsed.data.OPEN_METEO_GEOCODING_URL,
    airQualityUrl: parsed.data.OPEN_METEO_AIR_QUALITY_URL
  },
  cacheTtlSeconds: parsed.data.CACHE_TTL_SECONDS,
  rateLimit: {
    windowMs: parsed.data.RATE_LIMIT_WINDOW_MS,
    max: parsed.data.RATE_LIMIT_MAX
  }
};
