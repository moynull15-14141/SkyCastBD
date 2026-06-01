const temperature = document.getElementById('temperature');
const conditionText = document.getElementById('conditionText');
const humidityValue = document.getElementById('humidityValue');
const windValue = document.getElementById('windValue');
const rainValue = document.getElementById('rainValue');
const tomorrowValue = document.getElementById('tomorrowValue');
const forecastGrid = document.getElementById('forecastGrid');

const API_URL =
  'https://api.open-meteo.com/v1/forecast?latitude=24&longitude=90&hourly=temperature_2m,relative_humidity_2m,precipitation_probability,wind_speed_10m&timezone=Asia%2FBangkok&forecast_days=7';

const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function getWeatherIcon(temp) {
  if (temp >= 32) return '☀';
  if (temp >= 28) return '🌤';
  if (temp >= 24) return '⛅';
  if (temp >= 20) return '☁';
  return '🌧';
}

function getWeatherLabel(temp, rainChance) {
  if (rainChance >= 65) return 'High chance of rain';
  if (rainChance >= 35) return 'Possible showers';
  if (temp >= 32) return 'Hot and sunny';
  if (temp >= 28) return 'Warm and pleasant';
  if (temp >= 24) return 'Partly cloudy';
  return 'Cool weather';
}

function groupDailyForecast(times, temperatures) {
  const dailyMap = new Map();

  times.forEach((time, index) => {
    const dateKey = time.split('T')[0];
    const temp = temperatures[index];

    if (!dailyMap.has(dateKey)) {
      dailyMap.set(dateKey, []);
    }

    dailyMap.get(dateKey).push(temp);
  });

  return Array.from(dailyMap.entries())
    .slice(0, 7)
    .map(([dateKey, temps]) => {
      const date = new Date(dateKey);
      const max = Math.max(...temps);
      const min = Math.min(...temps);
      return {
        day: dayNames[date.getDay()],
        max: Math.round(max),
        min: Math.round(min),
        icon: getWeatherIcon(max),
      };
    });
}

function renderForecast(days) {
  forecastGrid.innerHTML = days
    .map(
      (day) => `
        <div class="forecast-day glass-card">
          <span>${day.day}</span>
          <div>${day.icon}</div>
          <strong>${day.max}° / ${day.min}°</strong>
        </div>
      `
    )
    .join('');
}

async function loadWeather() {
  try {
    const response = await fetch(API_URL);

    if (!response.ok) {
      throw new Error('Unable to fetch weather data');
    }

    const data = await response.json();
    const { hourly } = data;

    if (!hourly || !hourly.time || !hourly.temperature_2m) {
      throw new Error('Weather data format is invalid');
    }

    const currentIndex = 0;
    const currentTemp = Math.round(hourly.temperature_2m[currentIndex]);
    const currentHumidity = Math.round(hourly.relative_humidity_2m[currentIndex] ?? 0);
    const currentRain = Math.round(hourly.precipitation_probability[currentIndex] ?? 0);
    const currentWind = Math.round(hourly.wind_speed_10m[currentIndex] ?? 0);

    temperature.textContent = `${currentTemp}°`;
    conditionText.textContent = getWeatherLabel(currentTemp, currentRain);
    humidityValue.textContent = `${currentHumidity}%`;
    windValue.textContent = `${currentWind} km/h`;
    rainValue.textContent = `${currentRain}%`;

    const dailyForecast = groupDailyForecast(hourly.time, hourly.temperature_2m);
    renderForecast(dailyForecast);

    if (dailyForecast[1]) {
      tomorrowValue.textContent = `${dailyForecast[1].icon} ${dailyForecast[1].max}° / ${dailyForecast[1].min}°`;
    } else {
      tomorrowValue.textContent = 'Forecast unavailable';
    }
  } catch (error) {
    temperature.textContent = '--°';
    conditionText.textContent = 'Unable to load live weather data';
    humidityValue.textContent = '--%';
    windValue.textContent = '-- km/h';
    rainValue.textContent = '--%';
    tomorrowValue.textContent = 'Forecast unavailable';
    forecastGrid.innerHTML = `
      <div class="forecast-day glass-card">
        <span>Error</span>
        <div>⚠</div>
        <strong>Weather API unavailable</strong>
      </div>
    `;
    console.error(error);
  }
}

loadWeather();
