const elements = {
  body: document.body,
  locationLabel: document.getElementById('locationLabel'),
  updatedTime: document.getElementById('updatedTime'),
  statusLabel: document.getElementById('statusLabel'),
  weatherIcon: document.getElementById('weatherIcon'),
  heroSkeleton: document.getElementById('heroSkeleton'),
  heroContent: document.getElementById('heroContent'),
  temperatureValue: document.getElementById('temperatureValue'),
  conditionLabel: document.getElementById('conditionLabel'),
  feelsLikeLabel: document.getElementById('feelsLikeLabel'),
  humidityValue: document.getElementById('humidityValue'),
  rainValue: document.getElementById('rainValue'),
  windValue: document.getElementById('windValue'),
  apparentValue: document.getElementById('apparentValue'),
  forecastSkeleton: document.getElementById('forecastSkeleton'),
  forecastGrid: document.getElementById('forecastGrid'),
  localTimeValue: document.getElementById('localTimeValue'),
  searchResults: document.getElementById('searchResults'),
  toast: document.getElementById('toast'),
};

const weatherCodeMap = {
  clear: {
    codes: [0],
    label: 'Clear sky',
    icon: '☀',
    theme: 'sunny',
  },
  partlyCloudy: {
    codes: [1, 2, 3],
    label: 'Partly cloudy',
    icon: '⛅',
    theme: 'cloudy',
  },
  fog: {
    codes: [45, 48],
    label: 'Foggy',
    icon: '🌫',
    theme: 'cloudy',
  },
  drizzle: {
    codes: [51, 53, 55, 56, 57],
    label: 'Drizzle',
    icon: '🌦',
    theme: 'rainy',
  },
  rain: {
    codes: [61, 63, 65, 66, 67, 80, 81, 82],
    label: 'Rain showers',
    icon: '🌧',
    theme: 'rainy',
  },
  snow: {
    codes: [71, 73, 75, 77, 85, 86],
    label: 'Snow',
    icon: '❄',
    theme: 'snow',
  },
  storm: {
    codes: [95, 96, 99],
    label: 'Thunderstorm',
    icon: '⛈',
    theme: 'storm',
  },
};

let toastTimer = null;

export function toFahrenheit(celsius) {
  return (celsius * 9) / 5 + 32;
}

export function formatTemperature(value, unit) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return '--°';
  }

  const numericValue = Number(value);
  const output = unit === 'fahrenheit' ? toFahrenheit(numericValue) : numericValue;
  return `${Math.round(output)}°${unit === 'fahrenheit' ? 'F' : 'C'}`;
}

export function formatWind(value) {
  if (value === null || value === undefined) return '-- km/h';
  return `${Math.round(Number(value))} km/h`;
}

export function formatPercent(value) {
  if (value === null || value === undefined) return '--%';
  return `${Math.round(Number(value))}%`;
}

export function getWeatherPresentation(code) {
  const matched = Object.values(weatherCodeMap).find((entry) => entry.codes.includes(Number(code)));
  return (
    matched || {
      label: 'Weather update',
      icon: '🌤',
      theme: 'default',
    }
  );
}

export function showLoadingState() {
  elements.heroSkeleton.classList.remove('is-hidden');
  elements.forecastSkeleton.classList.remove('is-hidden');
  elements.heroContent.classList.add('is-hidden');
  elements.forecastGrid.classList.add('is-hidden');
  elements.statusLabel.textContent = 'Loading weather';
}

export function hideLoadingState() {
  elements.heroSkeleton.classList.add('is-hidden');
  elements.forecastSkeleton.classList.add('is-hidden');
  elements.heroContent.classList.remove('is-hidden');
  elements.forecastGrid.classList.remove('is-hidden');
}

export function updateTheme(weatherCode) {
  const presentation = getWeatherPresentation(weatherCode);
  elements.body.dataset.theme = presentation.theme;
  elements.weatherIcon.textContent = presentation.icon;
  return presentation;
}

export function renderSearchResults(results, onSelect) {
  if (!results.length) {
    elements.searchResults.innerHTML = '';
    elements.searchResults.classList.remove('is-visible');
    return;
  }

  elements.searchResults.innerHTML = results
    .map(
      (item, index) => `
        <li>
          <button type="button" data-index="${index}" role="option" aria-selected="false">
            <span>${item.name}${item.admin1 ? `, ${item.admin1}` : ''}</span>
            <strong>${item.country}</strong>
          </button>
        </li>
      `
    )
    .join('');

  elements.searchResults.classList.add('is-visible');

  Array.from(elements.searchResults.querySelectorAll('button')).forEach((button) => {
    button.addEventListener('click', () => {
      const selected = results[Number(button.dataset.index)];
      onSelect(selected);
      clearSearchResults();
    });
  });
}

export function clearSearchResults() {
  elements.searchResults.innerHTML = '';
  elements.searchResults.classList.remove('is-visible');
}

export function renderWeather(payload, unit) {
  const current = payload.weather.current;
  const location = payload.location;
  const presentation = updateTheme(current.weather_code);
  const timezone = payload.weather.timezone || 'UTC';

  elements.locationLabel.textContent = `${location.name}, ${location.country}`;
  elements.updatedTime.textContent = new Date().toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
  elements.localTimeValue.textContent = new Date().toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZone: timezone,
  });
  elements.statusLabel.textContent = presentation.label;
  elements.temperatureValue.textContent = formatTemperature(current.temperature_2m, unit);
  elements.conditionLabel.textContent = presentation.label;
  elements.feelsLikeLabel.textContent = `Feels like ${formatTemperature(current.apparent_temperature, unit)}`;
  elements.humidityValue.textContent = formatPercent(current.relative_humidity_2m);
  elements.rainValue.textContent = formatPercent(current.precipitation_probability);
  elements.windValue.textContent = formatWind(current.wind_speed_10m);
  elements.apparentValue.textContent = formatTemperature(current.apparent_temperature, unit);

  renderForecast(payload.weather.daily, unit);
}

export function renderForecast(daily, unit) {
  const cards = daily.time.map((day, index) => {
    const presentation = getWeatherPresentation(daily.weather_code[index]);
    const date = new Date(day);
    const label = date.toLocaleDateString([], { weekday: 'short' });

    return `
      <article class="forecast-day glass-soft">
        <strong>${label}</strong>
        <div class="day-icon" aria-hidden="true">${presentation.icon}</div>
        <p>${presentation.label}</p>
        <span>${formatTemperature(daily.temperature_2m_max[index], unit)} / ${formatTemperature(daily.temperature_2m_min[index], unit)}</span>
      </article>
    `;
  });

  elements.forecastGrid.innerHTML = cards.join('');
}

export function showToast(message) {
  elements.toast.textContent = message;
  elements.toast.classList.add('is-visible');

  if (toastTimer) {
    clearTimeout(toastTimer);
  }

  toastTimer = setTimeout(() => {
    elements.toast.classList.remove('is-visible');
  }, 3200);
}
