const OPEN_METEO_FORECAST_URL = 'https://api.open-meteo.com/v1/forecast';
const OPEN_METEO_AIR_QUALITY_URL = 'https://air-quality-api.open-meteo.com/v1/air-quality';
const OPEN_METEO_GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const OPEN_METEO_REVERSE_GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/reverse';
const CACHE_TTL = 15 * 60 * 1000;
const memoryCache = new Map();
const inFlightRequests = new Map();

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
    56: 'Freezing drizzle',
    57: 'Freezing drizzle',
    61: 'Slight rain',
    63: 'Rain',
    65: 'Heavy rain',
    66: 'Freezing rain',
    67: 'Freezing rain',
    71: 'Slight snow',
    73: 'Snow',
    75: 'Heavy snow',
    77: 'Snow grains',
    80: 'Rain showers',
    81: 'Rain showers',
    82: 'Violent rain showers',
    85: 'Snow showers',
    86: 'Heavy snow showers',
    95: 'Thunderstorm',
    96: 'Thunderstorm with hail',
    99: 'Thunderstorm with hail'
};

const WEATHER_ICON_MAP = {
    clear: 'Sunny',
    cloudy: 'Cloudy',
    fog: 'Fog',
    rain: 'Rain',
    snow: 'Snow',
    storm: 'Storm'
};

class WeatherService {
    static async searchCities(query) {
        const city = query.trim();
        if (!city) return [];

        const params = new URLSearchParams({
            name: city,
            count: '8',
            language: 'en',
            format: 'json'
        });

        const data = await this.fetchJson(`${OPEN_METEO_GEOCODING_URL}?${params}`);

        return (data.results || []).map((place) => ({
            id: place.id,
            name: place.name,
            country: place.country || '',
            admin1: place.admin1 || '',
            latitude: place.latitude,
            longitude: place.longitude,
            timezone: place.timezone || 'auto'
        }));
    }

    static async getWeatherByCity(cityName) {
        const matches = await this.searchCities(cityName);
        if (!matches.length) {
            throw new Error('City not found. Try another city name.');
        }

        return this.getWeatherByCoords(matches[0].latitude, matches[0].longitude, matches[0]);
    }

    static async getWeatherByCoords(latitude, longitude, location = null, options = {}) {
        const params = new URLSearchParams({
            latitude: String(latitude),
            longitude: String(longitude),
            current: [
                'temperature_2m',
                'relative_humidity_2m',
                'apparent_temperature',
                'precipitation',
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

        const [weather, resolvedLocation] = await Promise.all([
            this.fetchJson(`${OPEN_METEO_FORECAST_URL}?${params}`, options),
            location ? Promise.resolve(location) : this.reverseGeocode(latitude, longitude)
        ]);

        return this.parseWeatherData(weather, resolvedLocation);
    }

    static async getAirQualityByCoords(latitude, longitude, location = null, options = {}) {
        const params = new URLSearchParams({
            latitude: String(latitude),
            longitude: String(longitude),
            current: [
                'us_aqi',
                'pm10',
                'pm2_5',
                'carbon_monoxide',
                'nitrogen_dioxide',
                'sulphur_dioxide',
                'ozone'
            ].join(','),
            timezone: 'auto',
            forecast_days: '1'
        });

        const [airQuality, resolvedLocation] = await Promise.all([
            this.fetchJson(`${OPEN_METEO_AIR_QUALITY_URL}?${params}`, options),
            location ? Promise.resolve(location) : this.reverseGeocode(latitude, longitude)
        ]);

        return this.parseAirQualityData(airQuality, resolvedLocation);
    }

    static async reverseGeocode(latitude, longitude) {
        const params = new URLSearchParams({
            latitude: String(latitude),
            longitude: String(longitude),
            language: 'en',
            format: 'json'
        });

        try {
            const data = await this.fetchJson(`${OPEN_METEO_REVERSE_GEOCODING_URL}?${params}`);
            const place = data.results && data.results[0];

            if (!place) {
                return {
                    name: 'Current location',
                    country: '',
                    latitude,
                    longitude
                };
            }

            return {
                id: place.id,
                name: place.name,
                country: place.country || '',
                admin1: place.admin1 || '',
                latitude,
                longitude,
                timezone: place.timezone || 'auto'
            };
        } catch {
            return {
                name: 'Current location',
                country: '',
                latitude,
                longitude
            };
        }
    }

    static async fetchJson(url, options = {}) {
        const cacheKey = url;
        const cached = options.forceRefresh ? null : this.getCachedValue(cacheKey);
        if (cached) {
            return cached;
        }

        if (inFlightRequests.has(cacheKey)) {
            return inFlightRequests.get(cacheKey);
        }

        const request = fetch(url, {
            cache: options.forceRefresh ? 'no-store' : 'default'
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`Open-Meteo request failed with status ${response.status}`);
                }

                return response.json();
            })
            .then((data) => {
                this.setCachedValue(cacheKey, data);
                return data;
            })
            .finally(() => {
                inFlightRequests.delete(cacheKey);
            });

        inFlightRequests.set(cacheKey, request);
        return request;
    }

    static getCachedValue(key) {
        const memoryHit = memoryCache.get(key);
        if (memoryHit && memoryHit.expiresAt > Date.now()) {
            return memoryHit.data;
        }

        if (memoryHit) {
            memoryCache.delete(key);
        }

        try {
            const raw = localStorage.getItem(key);
            if (!raw) return null;
            const parsed = JSON.parse(raw);
            if (!parsed || parsed.expiresAt <= Date.now()) {
                localStorage.removeItem(key);
                return null;
            }

            memoryCache.set(key, parsed);
            return parsed.data;
        } catch {
            return null;
        }
    }

    static setCachedValue(key, data) {
        const payload = {
            data,
            expiresAt: Date.now() + CACHE_TTL
        };

        memoryCache.set(key, payload);

        try {
            localStorage.setItem(key, JSON.stringify(payload));
        } catch {
            // Ignore quota and storage errors.
        }
    }

    static parseWeatherData(data, location) {
        const current = data.current || {};
        const daily = data.daily || {};
        const condition = this.getCondition(current.weather_code);

        return {
            location: {
                name: location.name || 'Selected location',
                country: location.country || '',
                admin1: location.admin1 || '',
                latitude: location.latitude ?? data.latitude,
                longitude: location.longitude ?? data.longitude
            },
            timezone: data.timezone || 'UTC',
            current: {
                temperature: current.temperature_2m,
                humidity: current.relative_humidity_2m,
                windSpeed: current.wind_speed_10m,
                condition,
                rainChance: current.precipitation_probability ?? current.precipitation,
                feelsLike: current.apparent_temperature,
                updatedAt: current.time
            },
            forecast: (daily.time || []).map((date, index) => ({
                date,
                condition: this.getCondition(daily.weather_code[index]),
                tempMax: daily.temperature_2m_max[index],
                tempMin: daily.temperature_2m_min[index],
                rainChance: daily.precipitation_probability_max[index],
                windSpeed: daily.wind_speed_10m_max[index]
            }))
        };
    }

    static parseAirQualityData(data, location) {
        const current = data.current || {};
        const level = this.getAqiLevel(current.us_aqi);

        return {
            location: {
                name: location.name || 'Selected location',
                country: location.country || '',
                admin1: location.admin1 || '',
                latitude: location.latitude ?? data.latitude,
                longitude: location.longitude ?? data.longitude
            },
            timezone: data.timezone || 'UTC',
            updatedAt: current.time,
            aqi: current.us_aqi,
            level,
            pollutants: {
                pm25: current.pm2_5,
                pm10: current.pm10,
                co: current.carbon_monoxide,
                no2: current.nitrogen_dioxide,
                so2: current.sulphur_dioxide,
                ozone: current.ozone
            }
        };
    }

    static getAqiLevel(value) {
        const aqi = Number(value);

        if (!Number.isFinite(aqi)) {
            return {
                label: 'Unavailable',
                className: 'unknown',
                recommendation: 'Air quality data is unavailable right now. Check again shortly before planning outdoor activity.'
            };
        }

        if (aqi <= 50) {
            return {
                label: 'Good',
                className: 'good',
                recommendation: 'Air quality is good. Enjoy your outdoor plans.'
            };
        }

        if (aqi <= 100) {
            return {
                label: 'Moderate',
                className: 'moderate',
                recommendation: 'Sensitive groups should monitor conditions before long outdoor exposure.'
            };
        }

        if (aqi <= 150) {
            return {
                label: 'Unhealthy for Sensitive Groups',
                className: 'unhealthy-sensitive',
                recommendation: 'Sensitive groups should reduce prolonged outdoor exertion.'
            };
        }

        if (aqi <= 200) {
            return {
                label: 'Unhealthy',
                className: 'unhealthy',
                recommendation: 'Limit outdoor activity and consider wearing a mask outside.'
            };
        }

        if (aqi <= 300) {
            return {
                label: 'Very Unhealthy',
                className: 'very-unhealthy',
                recommendation: 'Avoid outdoor activity and keep air purifiers on if available.'
            };
        }

        return {
            label: 'Hazardous',
            className: 'hazardous',
            recommendation: 'Stay indoors and avoid unnecessary outdoor exposure.'
        };
    }

    static getCondition(code) {
        if (code === undefined || code === null) {
            return {
                label: 'Unavailable',
                icon: WEATHER_ICON_MAP.cloudy,
                code: null
            };
        }

        const numeric = Number(code);
        if (numeric === 0) return { label: WEATHER_CODE_MAP[0], icon: WEATHER_ICON_MAP.clear, code: numeric };
        if (numeric <= 3) return { label: WEATHER_CODE_MAP[numeric], icon: WEATHER_ICON_MAP.cloudy, code: numeric };
        if (numeric <= 48) return { label: WEATHER_CODE_MAP[numeric] || WEATHER_CODE_MAP[45], icon: WEATHER_ICON_MAP.fog, code: numeric };
        if (numeric <= 67 || (numeric >= 80 && numeric <= 82)) return { label: WEATHER_CODE_MAP[numeric] || WEATHER_CODE_MAP[61], icon: WEATHER_ICON_MAP.rain, code: numeric };
        if (numeric <= 86) return { label: WEATHER_CODE_MAP[numeric] || WEATHER_CODE_MAP[85], icon: WEATHER_ICON_MAP.snow, code: numeric };
        return { label: WEATHER_CODE_MAP[numeric] || WEATHER_CODE_MAP[95], icon: WEATHER_ICON_MAP.storm, code: numeric };
    }
}
