import { Router } from 'express';
import {
  getAirQuality,
  getCurrentWeather,
  searchCities
} from '../controllers/weatherController.js';
import { validate } from '../middleware/validate.js';
import {
  airQualityQuerySchema,
  citySearchQuerySchema,
  weatherQuerySchema
} from '../validators/weatherSchemas.js';

export const weatherRouter = Router();

weatherRouter.get('/search', validate(citySearchQuerySchema), searchCities);
weatherRouter.get('/current', validate(weatherQuerySchema), getCurrentWeather);
weatherRouter.get('/air-quality', validate(airQualityQuerySchema), getAirQuality);
