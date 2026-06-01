import { asyncHandler } from '../utils/asyncHandler.js';
import { createSearchLog } from '../services/searchLogService.js';
import {
  fetchAirQuality,
  fetchCitySearch,
  fetchCurrentWeather
} from '../services/weatherService.js';

export const searchCities = asyncHandler(async (req, res) => {
  const { city } = req.query;
  const results = await fetchCitySearch(city);

  await createSearchLog({
    type: 'city_search',
    query: city,
    resultCount: results.length,
    ip: req.ip,
    userAgent: req.get('user-agent')
  });

  res.json({ data: results });
});

export const getCurrentWeather = asyncHandler(async (req, res) => {
  const weather = await fetchCurrentWeather(req.query);

  await createSearchLog({
    type: 'weather_current',
    query: `${req.query.lat},${req.query.lon}`,
    locationName: req.query.name,
    resultCount: 1,
    ip: req.ip,
    userAgent: req.get('user-agent')
  });

  res.json({ data: weather });
});

export const getAirQuality = asyncHandler(async (req, res) => {
  const airQuality = await fetchAirQuality(req.query);

  res.json({ data: airQuality });
});
