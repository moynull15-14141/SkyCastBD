import { z } from 'zod';

const coordinate = z.coerce.number().finite();
const optionalText = z.string().trim().optional();

export const citySearchQuerySchema = z.object({
  city: z.string().trim().min(2).max(80)
});

export const weatherQuerySchema = z.object({
  lat: coordinate.min(-90).max(90),
  lon: coordinate.min(-180).max(180),
  name: optionalText,
  country: optionalText,
  admin1: optionalText
});

export const airQualityQuerySchema = weatherQuerySchema;
