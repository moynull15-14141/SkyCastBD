const OPEN_METEO_FORECAST_URL = 'https://api.open-meteo.com/v1/forecast';
const OPEN_METEO_AIR_QUALITY_URL = 'https://air-quality-api.open-meteo.com/v1/air-quality';
const OPEN_METEO_GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const SKYCASTBD_API_BASE_URL = window.SKYCASTBD_API_BASE_URL || 'https://skycastbd.onrender.com/api/v1';

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

        const backendParams = new URLSearchParams({ city });

        try {
            const response = await this.fetchJson(`${SKYCASTBD_API_BASE_URL}/weather/search?${backendParams}`);
            return response.data || [];
        } catch {
            // Fall back to Open-Meteo directly when the local backend is not running.
        }

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
        const backendParams = new URLSearchParams({
            lat: String(latitude),
            lon: String(longitude),
            name: location?.name || '',
            country: location?.country || '',
            admin1: location?.admin1 || ''
        });

        try {
            const response = await this.fetchJson(`${SKYCASTBD_API_BASE_URL}/weather/current?${backendParams}`, options);
            const backendWeather = this.normalizeWeatherData(response.data);

            if (backendWeather.current.pressure !== undefined && backendWeather.current.visibility !== undefined && backendWeather.current.uvIndex !== undefined && Array.isArray(backendWeather.hourly)) {
                return backendWeather;
            }
        } catch {
            // Fall back to Open-Meteo directly when the local backend is not running or lacks newer fields.
        }

        const params = new URLSearchParams({
            latitude: String(latitude),
            longitude: String(longitude),
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

        const [weather, resolvedLocation] = await Promise.all([
            this.fetchJson(`${OPEN_METEO_FORECAST_URL}?${params}`, options),
            location ? Promise.resolve(location) : this.reverseGeocode(latitude, longitude)
        ]);

        return this.parseWeatherData(weather, resolvedLocation);
    }

    static async getAirQualityByCoords(latitude, longitude, location = null, options = {}) {
        const backendParams = new URLSearchParams({
            lat: String(latitude),
            lon: String(longitude),
            name: location?.name || '',
            country: location?.country || '',
            admin1: location?.admin1 || ''
        });

        try {
            const response = await this.fetchJson(`${SKYCASTBD_API_BASE_URL}/weather/air-quality?${backendParams}`, options);
            return {
                ...response.data,
                level: this.getAqiLevel(response.data?.aqi)
            };
        } catch {
            // Fall back to Open-Meteo directly when the local backend is not running.
        }

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
        // Open-Meteo does not expose a supported browser-safe reverse geocoding endpoint.
        // Returning a local fallback prevents noisy 404/CORS console errors for GPS-based lookups.
        return {
            name: 'Current location',
            country: '',
            latitude,
            longitude,
            timezone: 'auto'
        };
    }

    static async fetchJson(url, options = {}) {
        const response = await fetch(url, {
            cache: options.forceRefresh ? 'no-store' : 'default'
        });

        if (!response.ok) {
            throw new Error(`Open-Meteo request failed with status ${response.status}: ${url}`);
        }

        return response.json();
    }

    static normalizeWeatherData(weather) {
        if (!weather?.current) return weather;

        return {
            ...weather,
            current: {
                ...weather.current,
                pressure: weather.current.pressure ?? weather.current.pressure_msl ?? weather.current.surface_pressure,
                visibility: weather.current.visibility,
                uvIndex: weather.current.uvIndex ?? weather.current.uv_index
            }
        };
    }

    static parseWeatherData(data, location) {
        const current = data.current || {};
        const hourly = data.hourly || {};
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
                pressure: current.pressure_msl ?? current.surface_pressure,
                pressureMsl: current.pressure_msl,
                surfacePressure: current.surface_pressure,
                visibility: current.visibility,
                uvIndex: current.uv_index,
                condition,
                rainChance: current.precipitation_probability ?? current.precipitation,
                feelsLike: current.apparent_temperature,
                updatedAt: current.time
            },
            hourly: (hourly.time || []).map((time, index) => ({
                time,
                temperature: hourly.temperature_2m?.[index],
                rainChance: hourly.precipitation_probability?.[index],
                condition: this.getCondition(hourly.weather_code?.[index]),
                windSpeed: hourly.wind_speed_10m?.[index]
            })),
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
                recommendation: 'Air quality is healthy. It is a good time for normal outdoor activity.'
            };
        }

        if (aqi <= 100) {
            return {
                label: 'Moderate',
                className: 'moderate',
                recommendation: 'Air quality is acceptable. Sensitive people should watch for coughing, irritation, or breathing discomfort.'
            };
        }

        if (aqi <= 150) {
            return {
                label: 'Unhealthy for Sensitive Groups',
                className: 'sensitive',
                recommendation: 'Children, older adults, and people with asthma should reduce prolonged outdoor exertion.'
            };
        }

        if (aqi <= 200) {
            return {
                label: 'Unhealthy',
                className: 'unhealthy',
                recommendation: 'Limit outdoor activity and consider a mask if you need to travel through busy roads.'
            };
        }

        if (aqi <= 300) {
            return {
                label: 'Very Unhealthy',
                className: 'very-unhealthy',
                recommendation: 'Avoid outdoor exertion. Keep windows closed and use filtered indoor air where possible.'
            };
        }

        return {
            label: 'Hazardous',
            className: 'hazardous',
            recommendation: 'Stay indoors, avoid outdoor exercise, and follow local health advisories.'
        };
    }

    static getCondition(code) {
        const label = WEATHER_CODE_MAP[Number(code)] || 'Weather update';
        const normalized = label.toLowerCase();
        let type = 'cloudy';

        if (normalized.includes('clear')) type = 'clear';
        if (normalized.includes('fog')) type = 'fog';
        if (normalized.includes('rain') || normalized.includes('drizzle')) type = 'rain';
        if (normalized.includes('snow')) type = 'snow';
        if (normalized.includes('thunder')) type = 'storm';

        return {
            code,
            label,
            type,
            icon: WEATHER_ICON_MAP[type]
        };
    }
}
