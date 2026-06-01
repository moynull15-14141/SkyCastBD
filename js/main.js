(() => {
  const STORAGE_KEY = 'skycastbd-theme';
  const VALID_THEMES = ['light', 'dark'];
  const themeMeta = document.querySelector('meta[name="theme-color"]') || (() => {
    const meta = document.createElement('meta');
    meta.name = 'theme-color';
    document.head.appendChild(meta);
    return meta;
  })();

  const getSystemTheme = () => (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  const getStoredTheme = () => {
    try {
      const value = localStorage.getItem(STORAGE_KEY);
      return VALID_THEMES.includes(value) ? value : null;
    } catch {
      return null;
    }
  };

  const applyTheme = (theme, persist = false) => {
    const nextTheme = VALID_THEMES.includes(theme) ? theme : 'light';
    const root = document.documentElement;

    root.classList.add('theme-switching');
    root.dataset.theme = nextTheme;
    document.body?.setAttribute('data-theme', nextTheme);
    themeMeta.setAttribute('content', nextTheme === 'dark' ? '#07111f' : '#f4f8ff');

    const toggle = document.querySelector('[data-theme-toggle]');
    if (toggle) {
      const isDark = nextTheme === 'dark';
      toggle.setAttribute('aria-pressed', String(isDark));
      toggle.setAttribute('aria-label', `Switch to ${isDark ? 'light' : 'dark'} theme`);
      toggle.dataset.theme = nextTheme;
      const label = toggle.querySelector('[data-theme-label]');
      if (label) label.textContent = isDark ? 'Dark' : 'Light';
    }

    window.clearTimeout(applyTheme.transitionTimer);
    applyTheme.transitionTimer = window.setTimeout(() => {
      root.classList.remove('theme-switching');
    }, 420);

    if (persist) {
      try {
        localStorage.setItem(STORAGE_KEY, nextTheme);
      } catch {}
    }
  };

  const bindLazyMedia = () => {
    document.querySelectorAll('img:not([loading])').forEach((img) => {
      img.loading = 'lazy';
      img.decoding = 'async';
    });

    document.querySelectorAll('iframe:not([loading])').forEach((iframe) => {
      iframe.loading = 'lazy';
    });
  };

  const setupDeferredObservers = () => {
    const hiddenSections = document.querySelectorAll('[data-defer-render]');
    if (!hiddenSections.length || !('IntersectionObserver' in window)) return;

    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.dispatchEvent(new CustomEvent('defer-visible'));
        obs.unobserve(entry.target);
      });
    }, { rootMargin: '200px 0px' });

    hiddenSections.forEach((section) => observer.observe(section));
  };

  const init = () => {
    const stored = getStoredTheme();
    applyTheme(stored || getSystemTheme());
    bindLazyMedia();
    setupDeferredObservers();

    document.addEventListener('click', (event) => {
      const trigger = event.target.closest('[data-theme-toggle]');
      if (!trigger) return;
      const current = document.documentElement.dataset.theme || getSystemTheme();
      applyTheme(current === 'dark' ? 'light' : 'dark', true);
    });

    const media = window.matchMedia('(prefers-color-scheme: dark)');
    media.addEventListener?.('change', () => {
      if (!getStoredTheme()) applyTheme(getSystemTheme());
    });
  };

  window.SkyCastBDTheme = { applyTheme };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();

const DEFAULT_LOCATION = {
    name: 'Dhaka',
    country: 'Bangladesh',
    admin1: 'Dhaka Division',
    latitude: 23.8103,
    longitude: 90.4125,
    summary: 'Capital city'
};

function createDocumentFragment(items, renderItem) {
    const fragment = document.createDocumentFragment();
    items.forEach((item, index) => {
        const template = document.createElement('template');
        template.innerHTML = renderItem(item, index).trim();
        fragment.appendChild(template.content.firstElementChild);
    });
    return fragment;
}

function createCardElement(tagName, className, attributes = {}) {
    const element = document.createElement(tagName);
    element.className = className;
    Object.entries(attributes).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
            element.setAttribute(key, value);
        }
    });
    return element;
}

function setGridContent(grid, items, renderItem) {
    if (!grid) return;
    const fragment = document.createDocumentFragment();
    items.forEach((item, index) => {
        const element = renderItem(item, index);
        if (element) fragment.appendChild(element);
    });
    grid.replaceChildren(fragment);
}

const POPULAR_BANGLADESH_CITIES = [
    { name: 'Dhaka', country: 'Bangladesh', admin1: 'Dhaka Division', latitude: 23.8103, longitude: 90.4125, summary: 'Capital city' },
    { name: 'Chattogram', country: 'Bangladesh', admin1: 'Chattogram Division', latitude: 22.3569, longitude: 91.7832, summary: 'Port city' },
    { name: 'Sylhet', country: 'Bangladesh', admin1: 'Sylhet Division', latitude: 24.8949, longitude: 91.8687, summary: 'Tea gardens' },
    { name: 'Khulna', country: 'Bangladesh', admin1: 'Khulna Division', latitude: 22.8456, longitude: 89.5403, summary: 'Sundarbans gateway' },
    { name: 'Rajshahi', country: 'Bangladesh', admin1: 'Rajshahi Division', latitude: 24.3745, longitude: 88.6042, summary: 'Silk city' },
    { name: "Cox's Bazar", country: 'Bangladesh', admin1: 'Chattogram Division', latitude: 21.4272, longitude: 92.0058, summary: 'Sea beach' }
];

const state = {
    searchTimer: null,
    latestSearchId: 0,
    selectedPopularCity: null,
    currentLocation: null,
    lastWeatherSignature: null,
    autoRefreshTimer: null,
    autoRefreshInFlight: false
};

const WEATHER_REFRESH_INTERVAL = 5 * 60 * 1000;

function bindNavigation() {
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.querySelector('.nav-menu');

    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            navToggle.classList.toggle('active');
        });
    }

    window.addEventListener('scroll', () => {
        const navbar = document.querySelector('.navbar');
        if (!navbar) return;
        navbar.style.boxShadow = window.scrollY > 50
            ? '0 10px 25px rgba(0, 0, 0, 0.1)'
            : '0 4px 6px rgba(0, 0, 0, 0.07)';
    });
}

function bindWeatherSearch() {
    const searchBtn = document.querySelector('.search-btn');
    const searchInput = document.getElementById('searchCity');
    const geoBtn = document.getElementById('geolocate');
    const resultsBox = document.getElementById('searchResults');

    if (searchBtn && searchInput) {
        searchBtn.addEventListener('click', handleSearch);
        searchInput.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') handleSearch();
        });
        searchInput.addEventListener('input', handleSearchSuggestions);
    }

    if (geoBtn) {
        geoBtn.addEventListener('click', handleGeolocation);
    }

    bindForecastQuickLinks(searchInput);

    document.addEventListener('click', (event) => {
        if (!resultsBox || event.target.closest('.hero-search-container')) return;
        clearSearchResults();
    });
}

function bindForecastQuickLinks(searchInput) {
    if (!searchInput) return;

    document.querySelectorAll('.forecast-quick-links button[data-city]').forEach((button) => {
        button.addEventListener('click', () => {
            searchInput.value = button.dataset.city || button.textContent.trim();
            handleSearch();
        });
    });
}

async function loadInitialWeather() {
    if (!navigator.geolocation) {
        await loadWeatherByLocation(DEFAULT_LOCATION);
        return;
    }

    setLoading(true, 'Detecting your location...');

    try {
        const position = await getCurrentPosition();
        await loadWeatherByCoordinates(position.coords.latitude, position.coords.longitude);
    } catch {
        await loadWeatherByLocation(DEFAULT_LOCATION);
    }
}

async function handleSearch() {
    const searchInput = document.getElementById('searchCity');
    const query = searchInput.value.trim();

    if (!query) {
        showError('Please enter a city name.');
        return;
    }

    setLoading(true, 'Searching city...');
    clearSearchResults();

    try {
        const matches = await WeatherService.searchCities(query);

        if (!matches.length) {
            throw new Error('No city found. Try a different spelling.');
        }

        searchInput.value = formatLocationName(matches[0]);
        await loadWeatherByLocation(matches[0]);
    } catch (error) {
        showError(error.message || 'Unable to search this city right now.');
        setLoading(false);
    }
}

function handleSearchSuggestions(event) {
    const query = event.target.value.trim();
    clearTimeout(state.searchTimer);

    if (query.length < 2) {
        clearSearchResults();
        return;
    }

    state.searchTimer = setTimeout(async () => {
        const searchId = ++state.latestSearchId;

        try {
            const results = await WeatherService.searchCities(query);
            if (searchId !== state.latestSearchId) return;
            renderSearchResults(results);
        } catch {
            clearSearchResults();
        }
    }, 300);
}

async function handleGeolocation() {
    if (!navigator.geolocation) {
        showError('Geolocation is not supported by your browser.');
        return;
    }

    const geoBtn = document.getElementById('geolocate');
    geoBtn.disabled = true;
    geoBtn.classList.add('loading');
    setLoading(true, 'Detecting your location...');

    try {
        const position = await getCurrentPosition();
        await loadWeatherByCoordinates(position.coords.latitude, position.coords.longitude);
    } catch (error) {
        showError(getGeolocationErrorMessage(error));
        setLoading(false);
    } finally {
        geoBtn.disabled = false;
        geoBtn.classList.remove('loading');
    }
}

async function loadWeatherByCoordinates(latitude, longitude) {
    const weather = await WeatherService.getWeatherByCoords(latitude, longitude);
    state.currentLocation = weather.location;
    state.selectedPopularCity = null;
    updateWeatherState(weather);
    updatePopularCitySelection(null);
    setLoading(false);
}

async function loadWeatherByLocation(location) {
    const weather = await WeatherService.getWeatherByCoords(location.latitude, location.longitude, location);
    state.currentLocation = {
        ...location,
        latitude: location.latitude,
        longitude: location.longitude
    };
    state.selectedPopularCity = location.name;
    updateWeatherState(weather);
    updatePopularCitySelection(location.name);
    setLoading(false);
}

function updateWeatherState(weather, { silent = false } = {}) {
    if (!weather?.current) return false;

    const signature = getWeatherSignature(weather);
    const hasChanged = signature !== state.lastWeatherSignature;
    state.lastWeatherSignature = signature;

    renderWeather(weather);
    startWeatherAutoRefresh();

    if (silent) {
        updateRefreshStatus(hasChanged ? 'Weather updated with the latest API data.' : 'Weather is already up to date.');
    }

    return hasChanged;
}

function getWeatherSignature(weather) {
    return JSON.stringify({
        location: [
            weather.location?.name,
            weather.location?.latitude,
            weather.location?.longitude
        ],
        current: weather.current,
        hourly: weather.hourly,
        forecast: weather.forecast
    });
}

function startWeatherAutoRefresh() {
    if (state.autoRefreshTimer || !state.currentLocation) return;

    state.autoRefreshTimer = window.setInterval(refreshCurrentWeather, WEATHER_REFRESH_INTERVAL);
}

function bindWeatherAutoRefreshEvents() {
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') refreshCurrentWeather();
    });

    window.addEventListener('online', refreshCurrentWeather);
}

async function refreshCurrentWeather() {
    if (state.autoRefreshInFlight || !state.currentLocation) return;

    state.autoRefreshInFlight = true;

    try {
        const { latitude, longitude } = state.currentLocation;
        const weather = await WeatherService.getWeatherByCoords(latitude, longitude, state.currentLocation, { forceRefresh: true });
        updateWeatherState(weather, { silent: true });
    } catch {
        updateRefreshStatus('Latest weather update could not be loaded. Showing the last available data.');
    } finally {
        state.autoRefreshInFlight = false;
    }
}

function updateRefreshStatus(message) {
    const status = document.querySelector('[data-search-status]');
    if (!status) return;

    status.hidden = false;
    status.textContent = message;
}

window.SkyCastBDWeather = {
    refreshNow: refreshCurrentWeather,
    getCurrentLocation: () => state.currentLocation,
    getLastWeatherSignature: () => state.lastWeatherSignature
};

async function loadPopularCitiesWeather() {
    const grid = document.getElementById('popularCitiesGrid');
    if (!grid) return;

    renderPopularCityPlaceholders();

    const results = await Promise.allSettled(
        POPULAR_BANGLADESH_CITIES.map(async (city) => ({
            city,
            weather: await WeatherService.getWeatherByCoords(city.latitude, city.longitude, city)
        }))
    );

    const cityCards = results.map((result, index) => {
        if (result.status === 'fulfilled') {
            return {
                ...result.value.city,
                weather: result.value.weather.current,
                forecast: result.value.weather.forecast
            };
        }

        return {
            ...POPULAR_BANGLADESH_CITIES[index],
            weather: null,
            forecast: []
        };
    });

    renderPopularCityCards(cityCards);
}

function renderPopularCityPlaceholders() {
    const grid = document.getElementById('popularCitiesGrid');
    if (!grid) return;

    const fragment = document.createDocumentFragment();

    POPULAR_BANGLADESH_CITIES.forEach((city) => {
        const article = document.createElement('article');
        article.className = 'popular-city-card is-loading';
        article.setAttribute('aria-label', `${escapeHtml(city.name)} weather loading`);
        article.innerHTML = `
            <div class="popular-city-top">
                <div>
                    <h3>${escapeHtml(city.name)}</h3>
                    <p>${escapeHtml(city.summary)}</p>
                </div>
                <span class="city-chip">BD</span>
            </div>
            <div class="city-temp-skeleton"></div>
            <div class="city-line-skeleton"></div>
        `;
        fragment.appendChild(article);
    });

    grid.replaceChildren(fragment);
}

function renderPopularCityCards(cities) {
    const grid = document.getElementById('popularCitiesGrid');
    if (!grid) return;

    const fragment = document.createDocumentFragment();

    cities.forEach((city, index) => {
        const current = city.weather;
        const high = city.forecast && city.forecast[0] ? city.forecast[0].tempMax : null;
        const low = city.forecast && city.forecast[0] ? city.forecast[0].tempMin : null;
        const isActive = city.name === state.selectedPopularCity;
        const article = document.createElement('article');
        article.className = `popular-city-card${isActive ? ' is-active' : ''}`;
        article.setAttribute('itemscope', '');
        article.setAttribute('itemtype', 'https://schema.org/Place');
        article.innerHTML = `
            <button type="button" class="popular-city-button" data-city-index="${index}" aria-label="Show ${escapeHtml(city.name)} weather">
                <div class="popular-city-top">
                    <div>
                        <h3 itemprop="name">${escapeHtml(city.name)}</h3>
                        <p>${escapeHtml(city.summary)} | ${escapeHtml(city.admin1)}</p>
                    </div>
                    <span class="city-chip">${current ? escapeHtml(current.condition.icon) : 'BD'}</span>
                </div>
                <div class="popular-city-main">
                    <strong class="popular-city-temp">${current ? formatTemperature(current.temperature) : '--'}</strong>
                    <span>${current ? escapeHtml(current.condition.label) : 'Weather unavailable'}</span>
                </div>
                <div class="popular-city-meta">
                    <span>Rain ${current ? formatPercent(current.rainChance) : '--'}</span>
                    <span>Wind ${current ? formatSpeed(current.windSpeed) : '--'}</span>
                    <span>H ${formatTemperature(high)} / L ${formatTemperature(low)}</span>
                </div>
            </button>
        `;
        fragment.appendChild(article);
    });

    grid.replaceChildren(fragment);

    grid.querySelectorAll('.popular-city-button').forEach((button) => {
        button.addEventListener('click', async () => {
            const city = POPULAR_BANGLADESH_CITIES[Number(button.dataset.cityIndex)];
            if (!city) return;
            const searchInput = document.getElementById('searchCity');
            if (searchInput) searchInput.value = formatLocationName(city);
            setLoading(true, `Loading ${city.name} weather...`);

            try {
                await loadWeatherByLocation(city);
                document.getElementById('weatherGrid')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            } catch {
                showError(`Unable to load ${city.name} weather right now.`);
                setLoading(false);
            }
        });
    });
}

function updatePopularCitySelection(cityName) {
    document.querySelectorAll('.popular-city-card').forEach((card) => {
        const title = card.querySelector('h3');
        card.classList.toggle('is-active', title && title.textContent === cityName);
    });
}

async function loadAirQualityCards() {
    const grid = document.getElementById('aqiGrid');
    if (!grid) return;

    renderAqiPlaceholders();

    const results = await Promise.allSettled(
        POPULAR_BANGLADESH_CITIES.map(async (city) => ({
            city,
            airQuality: await WeatherService.getAirQualityByCoords(city.latitude, city.longitude, city)
        }))
    );

    const cards = results.map((result, index) => {
        if (result.status === 'fulfilled') {
            return result.value.airQuality;
        }

        const city = POPULAR_BANGLADESH_CITIES[index];
        return {
            location: city,
            aqi: null,
            updatedAt: null,
            level: WeatherService.getAqiLevel(null),
            pollutants: {}
        };
    });

    renderAqiCards(cards);
}

function renderAqiPlaceholders() {
    const grid = document.getElementById('aqiGrid');
    if (!grid) return;

    const fragment = document.createDocumentFragment();

    POPULAR_BANGLADESH_CITIES.forEach((city) => {
        const article = document.createElement('article');
        article.className = 'aqi-card aqi-loading';
        article.setAttribute('aria-label', `${escapeHtml(city.name)} AQI loading`);
        article.innerHTML = `
            <div class="aqi-card-top">
                <div>
                    <h3>${escapeHtml(city.name)}</h3>
                    <p>${escapeHtml(city.admin1)}</p>
                </div>
                <span class="aqi-badge">AQI</span>
            </div>
            <div class="aqi-value-skeleton"></div>
            <div class="aqi-text-skeleton"></div>
        `;
        fragment.appendChild(article);
    });

    grid.replaceChildren(fragment);
}

function renderAqiCards(cards) {
    const grid = document.getElementById('aqiGrid');
    if (!grid) return;

    const fragment = document.createDocumentFragment();

    cards.forEach((card) => {
        const location = formatLocationName(card.location);
        const updated = card.updatedAt
            ? new Date(card.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            : 'Unavailable';
        const article = document.createElement('article');
        article.className = `aqi-card aqi-${card.level.className}`;
        article.setAttribute('itemscope', '');
        article.setAttribute('itemtype', 'https://schema.org/Place');
        article.innerHTML = `
            <div class="aqi-card-top">
                <div>
                    <h3 itemprop="name">${escapeHtml(card.location.name)}</h3>
                    <p>${escapeHtml(card.location.admin1 || card.location.country || 'Bangladesh')}</p>
                </div>
                <span class="aqi-badge">${escapeHtml(card.level.label)}</span>
            </div>
            <div class="aqi-main">
                <strong class="aqi-value">${card.aqi ?? '--'}</strong>
                <span>Updated ${escapeHtml(updated)}</span>
            </div>
            <div class="aqi-details">
                <span>${escapeHtml(location)}</span>
            </div>
        `;
        fragment.appendChild(article);
    });

    grid.replaceChildren(fragment);
}

function setLoading(isLoading, label = 'Loading weather...') {
    const searchBtn = document.querySelector('.search-btn');
    const weatherLoader = document.getElementById('weatherLoader');
    const weatherGrid = document.getElementById('weatherGrid');
    const forecastCards = document.getElementById('forecastCards');
    const forecastDashboard = document.querySelector('.forecast-dashboard-card');
    const weeklyForecast = document.querySelector('.weekly-forecast-grid');
    const status = document.querySelector('[data-search-status]');

    if (weatherLoader) {
        weatherLoader.hidden = !isLoading;
        const labelEl = weatherLoader.querySelector('span');
        if (labelEl) labelEl.textContent = label;
    }

    if (status && isLoading) {
        status.hidden = false;
        status.textContent = label;
    }

    if (searchBtn) searchBtn.disabled = isLoading;
    if (weatherGrid) weatherGrid.classList.toggle('is-loading', isLoading);
    if (forecastCards) forecastCards.classList.toggle('is-loading', isLoading);
    if (forecastDashboard) forecastDashboard.classList.toggle('is-loading', isLoading);
    if (weeklyForecast) weeklyForecast.classList.toggle('is-loading', isLoading);
}

function showError(message) {
    const error = document.getElementById('weatherError');
    if (!error) return;
    error.hidden = false;
    error.textContent = message;
}

function clearSearchResults() {
    const resultsBox = document.getElementById('searchResults');
    if (!resultsBox) return;
    resultsBox.classList.remove('active');
    resultsBox.innerHTML = '';
}

function renderSearchResults(results) {
    const resultsBox = document.getElementById('searchResults');
    if (!resultsBox) return;

    if (!results.length) {
        clearSearchResults();
        return;
    }

    const visibleResults = results.slice(0, 6);
    resultsBox.classList.add('active');
    resultsBox.innerHTML = visibleResults.map((item, index) => `
        <button type="button" class="search-result-item" data-result-index="${index}">
            <span>${escapeHtml(item.name)}${item.admin1 ? `, ${escapeHtml(item.admin1)}` : ''}</span>
            <strong>${escapeHtml(item.country || '')}</strong>
        </button>
    `).join('');

    resultsBox.querySelectorAll('.search-result-item').forEach((button) => {
        button.addEventListener('click', async () => {
            const selected = visibleResults[Number(button.dataset.resultIndex)];
            if (!selected) return;

            document.getElementById('searchCity').value = formatLocationName(selected);
            clearSearchResults();
            setLoading(true, `Loading ${selected.name} weather...`);

            try {
                await loadWeatherByLocation(selected);
            } catch (error) {
                showError(error.message || 'Unable to load selected city weather right now.');
                setLoading(false);
            }
        });
    });
}

function getWeatherIconName(condition = {}) {
    const label = (condition.label || '').toLowerCase();
    const type = condition.type || '';

    if (type === 'storm' || label.includes('thunder')) return 'storm';
    if (label.includes('wind')) return 'wind';
    if (type === 'rain' || label.includes('rain') || label.includes('drizzle')) return 'rain';
    if (label.includes('overcast')) return 'overcast';
    if (label.includes('partly') || label.includes('mainly')) return 'partly';
    if (type === 'clear' || label.includes('clear') || label.includes('sunny')) return 'sunny';
    if (type === 'cloudy' || label.includes('cloud')) return 'overcast';

    return 'partly';
}

function renderSkyconIcon(condition = {}, size = 'large') {
    const iconName = getWeatherIconName(condition);
    const title = escapeHtml(condition.label || 'Weather condition');
    const iconClass = `skycon-icon skycon-icon--${iconName} skycon-icon--${size}`;
    const common = 'fill="none" stroke-linecap="round" stroke-linejoin="round"';

    const icons = {
        sunny: `
            <circle class="skycon-sun-core" cx="48" cy="48" r="15"></circle>
            <g class="skycon-rays">
                <path d="M48 12v10"></path><path d="M48 74v10"></path>
                <path d="M12 48h10"></path><path d="M74 48h10"></path>
                <path d="M22.5 22.5l7 7"></path><path d="M66.5 66.5l7 7"></path>
                <path d="M73.5 22.5l-7 7"></path><path d="M29.5 66.5l-7 7"></path>
            </g>`,
        partly: `
            <g class="skycon-sun-small">
                <circle cx="34" cy="35" r="11"></circle>
                <path d="M34 15v7M34 48v7M14 35h7M47 35h7M20 21l5 5M48 49l5 5M53 21l-5 5"></path>
            </g>
            <g class="skycon-cloud">
                <path d="M28 64h34c8 0 14-5.5 14-13s-6-13-14-13c-2.3 0-4.5.5-6.4 1.6C52.7 32.7 46 28 38.5 28 28.9 28 21 35.9 21 45.5v.7C14.8 48.3 11 52.8 11 58c0 3.7 3.5 6 17 6z"></path>
            </g>`,
        overcast: `
            <g class="skycon-cloud skycon-cloud-back">
                <path d="M22 58h34c8 0 14-5.5 14-13s-6-13-14-13c-2.2 0-4.4.5-6.2 1.5C47 27 40.6 23 33.5 23 24.4 23 17 30.4 17 39.5v.7C11.2 42 8 46.2 8 51c0 4.8 4.8 7 14 7z"></path>
            </g>
            <g class="skycon-cloud">
                <path d="M34 72h34c8 0 14-5.5 14-13s-6-13-14-13c-2.3 0-4.5.5-6.4 1.6C58.7 40.7 52 36 44.5 36 34.9 36 27 43.9 27 53.5v.7C20.8 56.3 17 60.8 17 66c0 3.7 3.5 6 17 6z"></path>
            </g>`,
        rain: `
            <g class="skycon-cloud">
                <path d="M28 52h34c8 0 14-5.5 14-13s-6-13-14-13c-2.3 0-4.5.5-6.4 1.6C52.7 20.7 46 16 38.5 16 28.9 16 21 23.9 21 33.5v.7C14.8 36.3 11 40.8 11 46c0 3.7 3.5 6 17 6z"></path>
            </g>
            <g class="skycon-rain">
                <path d="M30 64l-5 10"></path><path d="M48 64l-5 10"></path><path d="M66 64l-5 10"></path>
            </g>`,
        storm: `
            <g class="skycon-cloud">
                <path d="M28 50h34c8 0 14-5.5 14-13s-6-13-14-13c-2.3 0-4.5.5-6.4 1.6C52.7 18.7 46 14 38.5 14 28.9 14 21 21.9 21 31.5v.7C14.8 34.3 11 38.8 11 44c0 3.7 3.5 6 17 6z"></path>
            </g>
            <path class="skycon-lightning" d="M48 54l-9 18h11l-5 14 17-23H51l6-9z"></path>
            <g class="skycon-rain skycon-rain-storm">
                <path d="M28 66l-4 8"></path><path d="M69 66l-4 8"></path>
            </g>`,
        wind: `
            <g class="skycon-wind">
                <path d="M15 35h45c7 0 10-4 10-9 0-4.5-3.5-8-8-8-4 0-7 2.5-8 6"></path>
                <path d="M10 50h58c8 0 13 4 13 10s-5 10-11 10c-5 0-9-3-10-8"></path>
                <path d="M20 65h25"></path>
            </g>`
    };

    return `
        <svg class="${iconClass}" viewBox="0 0 96 96" role="img" aria-label="${title}" ${common}>
            <title>${title}</title>
            ${icons[iconName] || icons.partly}
        </svg>
    `;
}

function renderWeather(weather) {
    const weatherGrid = document.getElementById('weatherGrid');
    const forecastCards = document.getElementById('forecastCards');
    const error = document.getElementById('weatherError');

    if (error) {
        error.hidden = true;
        error.textContent = '';
    }

    renderForecastPageWeather(weather);

    if (weatherGrid) {
        const current = weather.current;
        weatherGrid.innerHTML = `
            <article class="current-weather-card" itemscope itemtype="https://schema.org/Place">
                <div class="weather-card-top">
                    <div>
                        <p class="weather-eyebrow">Current weather</p>
                        <h3 itemprop="name">${escapeHtml(formatLocationName(weather.location))}</h3>
                        <p class="weather-updated">Updated ${escapeHtml(formatDateTime(current.updatedAt, weather.timezone))}</p>
                    </div>
                    <span class="weather-condition-badge" aria-label="${escapeHtml(current.condition.label)} weather">
                        ${renderSkyconIcon(current.condition, 'large')}
                    </span>
                </div>
                <div class="weather-main-row">
                    <p class="temperature">${formatTemperature(current.temperature)}</p>
                    <div>
                        <p class="condition">${escapeHtml(current.condition.label)}</p>
                        <p class="feels-like">Feels like ${formatTemperature(current.feelsLike)}</p>
                    </div>
                </div>
                <div class="weather-details-grid">
                    <div class="weather-metric"><span>Humidity</span><strong>${formatPercent(current.humidity)}</strong></div>
                    <div class="weather-metric"><span>Rain chance</span><strong>${formatPercent(current.rainChance)}</strong></div>
                    <div class="weather-metric"><span>Wind</span><strong>${formatSpeed(current.windSpeed)}</strong></div>
                    <div class="weather-metric"><span>Timezone</span><strong>${escapeHtml(weather.timezone || 'Local')}</strong></div>
                </div>
            </article>
        `;
    }

    if (forecastCards) {
        forecastCards.innerHTML = weather.forecast.map((day) => `
            <article class="forecast-card">
                <strong class="forecast-day">${escapeHtml(formatForecastDay(day.date))}</strong>
                <div class="forecast-icon">
                    ${renderSkyconIcon(day.condition, 'small')}
                </div>
                <p>${escapeHtml(day.condition.label)}</p>
                <div class="forecast-temp">
                    <span>${formatTemperature(day.tempMax)}</span>
                    <span>${formatTemperature(day.tempMin)}</span>
                </div>
                <small>Rain ${formatPercent(day.rainChance)} • Wind ${formatSpeed(day.windSpeed)}</small>
            </article>
        `).join('');
    }
}

async function renderForecastPageWeather(weather) {
    const forecastPage = document.querySelector('.forecast-page');
    if (!forecastPage || !weather?.current) return;

    const current = weather.current;
    const locationName = formatLocationName(weather.location);
    const cityName = weather.location?.name || 'Selected city';
    const updated = formatDateTime(current.updatedAt, weather.timezone);
    const status = document.querySelector('[data-search-status]');
    const nowIcon = renderSkyconIcon(current.condition, 'large');
    const weatherVisualClass = `forecast-visual-${getWeatherIconName(current.condition)}`;
    const aqi = await getForecastAirQuality(weather.location);

    const setText = (selector, value) => {
        const element = document.querySelector(selector);
        if (element) element.textContent = value;
    };

    const setHtml = (selector, value) => {
        const element = document.querySelector(selector);
        if (element) element.innerHTML = value;
    };

    setText('.forecast-now-top h2', locationName);
    setHtml('.forecast-now-main .forecast-weather-orb', nowIcon);
    setText('.forecast-now-main strong', formatTemperature(current.temperature));
    setText('.forecast-now-main p', current.condition.label);
    setText('.forecast-now-main small', `Updated ${updated}`);
    setText('.forecast-now-meta span:nth-child(1)', `Feels like ${formatTemperature(current.feelsLike)}`);
    setText('.forecast-now-meta span:nth-child(2)', `Rain ${formatPercent(current.rainChance)}`);
    setText('.forecast-now-meta span:nth-child(3)', `Wind ${formatSpeed(current.windSpeed)}`);

    const visualSlider = document.querySelector('[data-forecast-visual]');
    if (visualSlider) {
        visualSlider.className = `forecast-visual-slider ${weatherVisualClass}`;
        visualSlider.setAttribute('aria-label', `${current.condition.label} weather image slider`);
    }
    setHtml('.forecast-visual-overlay .forecast-weather-orb', nowIcon);
    setText('.forecast-dashboard-left .forecast-card-label', `${cityName} now`);
    setText('.forecast-dashboard-left h3', formatTemperature(current.temperature));
    setText('.forecast-dashboard-left .forecast-condition', current.condition.label);
    setText('.forecast-dashboard-summary span', `Feels like ${formatTemperature(current.feelsLike)}`);
    setText('.forecast-stats-grid .forecast-stat-card:nth-child(1) strong', formatPercent(current.humidity));
    setText('.forecast-stats-grid .forecast-stat-card:nth-child(2) strong', formatSpeed(current.windSpeed));
    setText('.forecast-stats-grid .forecast-stat-card:nth-child(3) strong', formatUvIndex(getUvIndexValue(current)));
    setText('.forecast-stats-grid .forecast-stat-card:nth-child(4) strong', formatAqi(aqi));
    setText('.forecast-stats-grid .forecast-stat-card:nth-child(5) strong', formatPressure(getPressureValue(current)));
    setText('.forecast-stats-grid .forecast-stat-card:nth-child(6) strong', formatVisibility(getVisibilityValue(current)));

    const hourlyCards = document.querySelectorAll('.hourly-card');
    const nextHours = getNextHourlyForecast(weather.hourly, current.updatedAt).slice(0, 12);
    hourlyCards.forEach((card, index) => {
        const hour = nextHours[index];
        const time = card.querySelector('time');
        const icon = card.querySelector('span');
        const strong = card.querySelector('strong');
        const small = card.querySelector('small');
        const condition = hour?.condition ?? current.condition;

        if (time) time.textContent = hour ? formatHourlyTime(hour.time, weather.timezone) : '--:--';
        if (icon) icon.innerHTML = renderSkyconIcon(condition, 'small');
        if (strong) strong.textContent = formatTemperature(hour?.temperature ?? current.temperature).replace('C', '');
        if (small) small.textContent = `${formatPercent(hour?.rainChance ?? current.rainChance)} rain`;
    });

    const forecastDays = weather.forecast || [];
    const weeklyGrid = document.querySelector('.weekly-forecast-grid');
    if (weeklyGrid && forecastDays.length) {
        weeklyGrid.innerHTML = forecastDays.slice(0, 7).map((day, index) => `
            <article class="weekly-card${index === 0 ? ' active' : ''}">
                <span>${escapeHtml(index === 0 ? 'Today' : formatForecastDay(day.date))}</span>
                <div>${renderSkyconIcon(day.condition, 'small')}</div>
                <h3>${escapeHtml(day.condition.label)}</h3>
                <p>${formatTemperature(day.tempMax)} / ${formatTemperature(day.tempMin)}</p>
                <small>${formatPercent(day.rainChance)} rain chance • ${formatSpeed(day.windSpeed)}</small>
            </article>
        `).join('');
    }

    if (status) {
        status.hidden = false;
        status.textContent = `${locationName} forecast loaded from the same live search system as the home page.`;
    }
}

async function getForecastAirQuality(location) {
    if (!location?.latitude || !location?.longitude || typeof WeatherService === 'undefined') return null;

    try {
        return await WeatherService.getAirQualityByCoords(location.latitude, location.longitude, location);
    } catch {
        return null;
    }
}

function getCurrentPosition() {
    return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: false,
            timeout: 8000,
            maximumAge: 600000
        });
    });
}

function getGeolocationErrorMessage(error) {
    if (!error) return 'Unable to detect your location. Loading Dhaka weather.';

    if (error.code === 1) return 'Location permission denied. Showing Dhaka weather instead.';
    if (error.code === 2) return 'Location unavailable right now. Showing Dhaka weather instead.';
    if (error.code === 3) return 'Location request timed out. Showing Dhaka weather instead.';

    return 'Unable to detect your location. Showing Dhaka weather instead.';
}

function formatLocationName(location) {
    return [location.name, location.admin1, location.country].filter(Boolean).join(', ');
}

function formatPercent(value) {
    if (value === null || value === undefined || Number.isNaN(Number(value))) return '--%';
    return `${Math.round(Number(value))}%`;
}

function formatSpeed(value) {
    if (value === null || value === undefined || Number.isNaN(Number(value))) return '-- km/h';
    return `${Math.round(Number(value))} km/h`;
}

function getUvIndexValue(current = {}) {
    return current.uvIndex ?? current.uv_index;
}

function formatUvIndex(value) {
    if (value === null || value === undefined || Number.isNaN(Number(value))) return '--';

    const uv = Number(value);
    let level = 'Low';
    if (uv >= 11) level = 'Extreme';
    else if (uv >= 8) level = 'Very High';
    else if (uv >= 6) level = 'High';
    else if (uv >= 3) level = 'Moderate';

    return `${Math.round(uv)} ${level}`;
}

function getPressureValue(current = {}) {
    return current.pressure ?? current.pressureMsl ?? current.pressure_msl ?? current.surfacePressure ?? current.surface_pressure;
}

function getVisibilityValue(current = {}) {
    return current.visibility;
}

function formatPressure(value) {
    if (value === null || value === undefined || Number.isNaN(Number(value))) return '-- hPa';
    return `${Math.round(Number(value))} hPa`;
}

function formatVisibility(value) {
    if (value === null || value === undefined || Number.isNaN(Number(value))) return '-- km';
    const meters = Number(value);
    if (meters >= 1000) return `${(meters / 1000).toFixed(1).replace(/\.0$/, '')} km`;
    return `${Math.round(meters)} m`;
}

function formatAqi(airQuality) {
    const value = airQuality?.aqi;
    if (value === null || value === undefined || Number.isNaN(Number(value))) return '--';
    const label = airQuality?.level?.label ? ` ${airQuality.level.label}` : '';
    return `${Math.round(Number(value))}${label}`;
}

function formatDateTime(value, timezone) {
    if (!value) return 'just now';

    try {
        return new Date(value).toLocaleString([], {
            weekday: 'short',
            hour: '2-digit',
            minute: '2-digit',
            timeZone: timezone || undefined
        });
    } catch {
        return new Date(value).toLocaleString([], {
            weekday: 'short',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
}

function getNextHourlyForecast(hourly = [], currentTime) {
    if (!Array.isArray(hourly) || !hourly.length) return [];

    if (currentTime) {
        const firstUpcomingIndex = hourly.findIndex((hour) => typeof hour.time === 'string' && hour.time >= currentTime);
        if (firstUpcomingIndex >= 0) return hourly.slice(firstUpcomingIndex);
    }

    const now = Date.now();
    const upcoming = hourly.filter((hour) => {
        const hourTime = new Date(hour.time).getTime();
        return Number.isFinite(hourTime) && hourTime >= now;
    });

    return upcoming.length ? upcoming : hourly;
}

function formatHourlyTime(value) {
    if (!value) return '--:--';

    const timePart = String(value).split('T')[1];
    const [hourText, minuteText = '00'] = (timePart || '').split(':');
    const hour = Number(hourText);

    if (Number.isFinite(hour)) {
        const suffix = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour % 12 || 12;
        return `${displayHour}:${minuteText.padStart(2, '0')} ${suffix}`;
    }

    return new Date(value).toLocaleTimeString([], {
        hour: 'numeric',
        minute: '2-digit'
    });
}

function formatForecastDay(value) {
    return new Date(value).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
}

// function escapeHtml(value) {
//     return String(value)
//         .replaceAll('&', '&')
//         .replaceAll('<', '<')
//         .replaceAll('>', '>')
//         .replaceAll('"', '"')
//         .replaceAll("'", ''');
// }

function escapeHtml(value) {
    return String(value)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');
}

function formatTemperature(celsius, toFahrenheit = false) {
    if (celsius === null || celsius === undefined || Number.isNaN(Number(celsius))) return '--°C';

    if (toFahrenheit) {
        return Math.round((Number(celsius) * 9/5) + 32) + '°F';
    }
    return Math.round(Number(celsius)) + '°C';
}

function celsiusToFahrenheit(celsius) {
    return Math.round((celsius * 9/5) + 32);
}

function fahrenheitToCelsius(fahrenheit) {
    return Math.round((fahrenheit - 32) * 5/9);
}
function bindContactForm() {
    const form = document.getElementById('contactForm');
    if (!form) return;

    const submitButton = form.querySelector('button[type="submit"]');
    const notification = document.createElement('div');
    notification.className = 'contact-notification';
    notification.setAttribute('role', 'status');
    notification.setAttribute('aria-live', 'polite');
    notification.hidden = true;
    notification.style.cssText = [
        'margin-top: 1rem',
        'padding: 0.9rem 1rem',
        'border-radius: 12px',
        'background: rgba(34, 197, 94, 0.14)',
        'border: 1px solid rgba(34, 197, 94, 0.35)',
        'color: #15803d',
        'font-weight: 700',
        'box-shadow: 0 12px 28px rgba(34, 197, 94, 0.14)',
        'transition: opacity 180ms ease, transform 180ms ease'
    ].join('; ');

    form.appendChild(notification);

    form.addEventListener('submit', (event) => {
        event.preventDefault();

        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        notification.textContent = 'Message sent successfully!';
        notification.hidden = false;
        notification.style.opacity = '1';
        notification.style.transform = 'translateY(0)';

        if (submitButton) {
            submitButton.disabled = true;
            submitButton.textContent = 'Message Sent';
        }

        form.reset();

        window.clearTimeout(bindContactForm.hideTimer);
        bindContactForm.hideTimer = window.setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateY(-6px)';

            window.setTimeout(() => {
                notification.hidden = true;
                if (submitButton) {
                    submitButton.disabled = false;
                    submitButton.textContent = 'Send Message';
                }
            }, 180);
        }, 3200);
    });
}

function initSkyCastBDPage() {
    bindNavigation();
    bindWeatherAutoRefreshEvents();
    bindContactForm();

    const hasWeatherRuntime = typeof WeatherService !== 'undefined';
    const hasSearchInput = Boolean(document.getElementById('searchCity'));
    const hasHomeWeatherWidgets = document.getElementById('weatherGrid') || document.getElementById('forecastCards') || document.getElementById('popularCitiesGrid') || document.getElementById('aqiGrid');
    const hasForecastPage = Boolean(document.querySelector('.forecast-page'));

    if (hasWeatherRuntime && (hasSearchInput || hasHomeWeatherWidgets || hasForecastPage)) {
        if (hasSearchInput) bindWeatherSearch();

        Promise.allSettled([
            hasHomeWeatherWidgets ? loadPopularCitiesWeather() : Promise.resolve(),
            hasHomeWeatherWidgets ? loadAirQualityCards() : Promise.resolve(),
            (hasHomeWeatherWidgets || hasForecastPage) ? loadInitialWeather() : Promise.resolve()
        ]).catch(() => {});
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSkyCastBDPage, { once: true });
} else {
    initSkyCastBDPage();
}


