import { env } from '../config/env.js';
import { buildCacheKey, getCached, setCached } from './cacheService.js';
import { HttpError } from '../utils/httpError.js';

const WEATHER_CODE_MAP = {
  0: 'Clear sky',
  1: 'Mainly clear',
  2: 'Partly cloudy',
  3: 'Overcast',
  45: 'Fog',
  48: 'Depositing rime fog',
  51: 'Light drizzle',
  53: 'Moderate drizzle',
  55: 'Dense drizzle',
  61: 'Slight rain',
  63: 'Rain',
  65: 'Heavy rain',
  80: 'Rain showers',
  81: 'Rain showers',
  82: 'Violent rain showers',
  95: 'Thunderstorm',
  96: 'Thunderstorm with hail',
  99: 'Thunderstorm with hail'
};

const fetchJson = async (url) => {
  const response = await fetch(url, {
    headers: { accept: 'application/json' }
  });

  if (!response.ok) {
    throw new HttpError(`Weather provider failed with status ${response.status}`, 502);
  }

  return response.json();
};

const proxyWithCache = async (namespace, url, params) => {
  const cacheKey = buildCacheKey(namespace, params);
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const data = await fetchJson(url);
  setCached(cacheKey, data);
  return data;
};

export const fetchCitySearch = async (city) => {
  const params = new URLSearchParams({
    name: city,
    count: '8',
    language: 'en',
    format: 'json'
  });

  const data = await proxyWithCache('city-search', `${env.openMeteo.geocodingUrl}?${params}`, { city });

  return (data.results || []).map((place) => ({
    id: place.id,
    name: place.name,
    country: place.country || '',
    admin1: place.admin1 || '',
    latitude: place.latitude,
    longitude: place.longitude,
    timezone: place.timezone || 'auto'
  }));
};

export const fetchCurrentWeather = async ({ lat, lon, name, country, admin1 }) => {
  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lon),
    current: [
      'temperature_2m',
      'relative_humidity_2m',
      'apparent_temperature',
      'precipitation',
      'weather_code',
      'wind_speed_10m',
      'pressure_msl',
      'surface_pressure',
      'visibility',
      'uv_index'
    ].join(','),
    hourly: [
      'temperature_2m',
      'precipitation_probability',
      'weather_code',
      'wind_speed_10m'
    ].join(','),
    daily: [
      'weather_code',
      'temperature_2m_max',
      'temperature_2m_min',
      'precipitation_probability_max',
      'wind_speed_10m_max'
    ].join(','),
    timezone: 'auto',
    forecast_days: '7'
  });

  const data = await proxyWithCache('weather-current', `${env.openMeteo.forecastUrl}?${params}`, {
    lat,
    lon,
    fields: 'pressure_msl,surface_pressure,visibility,uv_index,hourly_temperature_2m,hourly_precipitation_probability,hourly_weather_code,hourly_wind_speed_10m'
  });

  return parseWeather(data, { name, country, admin1, latitude: lat, longitude: lon });
};

export const fetchAirQuality = async ({ lat, lon, name, country, admin1 }) => {
  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lon),
    current: ['us_aqi', 'pm10', 'pm2_5', 'carbon_monoxide', 'nitrogen_dioxide', 'sulphur_dioxide', 'ozone'].join(','),
    timezone: 'auto',
    forecast_days: '1'
  });

  const data = await proxyWithCache('air-quality', `${env.openMeteo.airQualityUrl}?${params}`, { lat, lon });
  const current = data.current || {};

  return {
    location: buildLocation(data, { name, country, admin1, latitude: lat, longitude: lon }),
    timezone: data.timezone || 'UTC',
    updatedAt: current.time,
    aqi: current.us_aqi,
    pollutants: {
      pm25: current.pm2_5,
      pm10: current.pm10,
      co: current.carbon_monoxide,
      no2: current.nitrogen_dioxide,
      so2: current.sulphur_dioxide,
      ozone: current.ozone
    }
  };
};

const parseWeather = (data, locationInput) => {
  const current = data.current || {};
  const hourly = data.hourly || {};
  const daily = data.daily || {};

  return {
    location: buildLocation(data, locationInput),
    timezone: data.timezone || 'UTC',
    current: {
      temperature: current.temperature_2m,
      humidity: current.relative_humidity_2m,
      windSpeed: current.wind_speed_10m,
      pressure: current.pressure_msl ?? current.surface_pressure,
      pressureMsl: current.pressure_msl,
      surfacePressure: current.surface_pressure,
      visibility: current.visibility,
      uvIndex: current.uv_index,
      condition: getCondition(current.weather_code),
      rainChance: current.precipitation_probability ?? current.precipitation,
      feelsLike: current.apparent_temperature,
      updatedAt: current.time
    },
    hourly: (hourly.time || []).map((time, index) => ({
      time,
      temperature: hourly.temperature_2m?.[index],
      rainChance: hourly.precipitation_probability?.[index],
      condition: getCondition(hourly.weather_code?.[index]),
      windSpeed: hourly.wind_speed_10m?.[index]
    })),
    forecast: (daily.time || []).map((date, index) => ({
      date,
      condition: getCondition(daily.weather_code?.[index]),
      tempMax: daily.temperature_2m_max?.[index],
      tempMin: daily.temperature_2m_min?.[index],
      rainChance: daily.precipitation_probability_max?.[index],
      windSpeed: daily.wind_speed_10m_max?.[index]
    }))
  };
};

const buildLocation = (data, locationInput) => ({
  name: locationInput.name || 'Selected location',
  country: locationInput.country || '',
  admin1: locationInput.admin1 || '',
  latitude: Number(locationInput.latitude ?? data.latitude),
  longitude: Number(locationInput.longitude ?? data.longitude)
});

const getCondition = (code) => {
  const numeric = Number(code);
  const label = WEATHER_CODE_MAP[numeric] || 'Weather update';

  return {
    code: Number.isFinite(numeric) ? numeric : null,
    label,
    type: label.toLowerCase().includes('rain') ? 'rain' : label.toLowerCase().includes('thunder') ? 'storm' : 'cloudy'
  };
};
