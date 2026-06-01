import {
  fetchWeatherByCoords,
  getDefaultCity,
  resolveInitialLocation,
  searchCities,
} from './api.js';
import {
  clearSearchResults,
  renderSearchResults,
  renderWeather,
  showLoadingState,
  hideLoadingState,
  showToast,
} from './dom.js';

const state = {
  unit: 'celsius',
  selectedLocation: null,
  weatherData: null,
  searchResults: [],
};

const elements = {
  searchForm: document.getElementById('searchForm'),
  citySearch: document.getElementById('citySearch'),
  unitToggle: document.getElementById('unitToggle'),
};

function debounce(callback, delay = 350) {
  let timerId;

  return (...args) => {
    clearTimeout(timerId);
    timerId = setTimeout(() => callback(...args), delay);
  };
}

async function loadWeatherForLocation(location) {
  showLoadingState();

  try {
    const weather = await fetchWeatherByCoords(location.latitude, location.longitude);
    state.selectedLocation = location;
    state.weatherData = weather;

    renderWeather(
      {
        location,
        weather,
      },
      state.unit
    );
  } catch (error) {
    console.error(error);
    showToast('Unable to load weather data right now. Please try again.');
  } finally {
    hideLoadingState();
  }
}

async function bootstrapWeather() {
  try {
    const initialLocation = await resolveInitialLocation();
    await loadWeatherForLocation(initialLocation);
  } catch (error) {
    console.error(error);
    showToast('Unable to detect your location. Loading fallback city.');
    await loadWeatherForLocation(getDefaultCity());
  }
}

const handleSearchInput = debounce(async (event) => {
  const query = event.target.value.trim();

  if (query.length < 2) {
    clearSearchResults();
    return;
  }

  try {
    const results = await searchCities(query);
    state.searchResults = results;

    renderSearchResults(results, async (selected) => {
      elements.citySearch.value = `${selected.name}, ${selected.country}`;
      await loadWeatherForLocation(selected);
    });
  } catch (error) {
    console.error(error);
    clearSearchResults();
    showToast('City search failed. Please check the name and try again.');
  }
}, 400);

async function handleSearchSubmit(event) {
  event.preventDefault();

  const query = elements.citySearch.value.trim();
  if (!query) {
    showToast('Please enter a city name to search.');
    return;
  }

  try {
    const results = await searchCities(query);

    if (!results.length) {
      showToast('No city found. Try a different search keyword.');
      clearSearchResults();
      return;
    }

    clearSearchResults();
    elements.citySearch.value = `${results[0].name}, ${results[0].country}`;
    await loadWeatherForLocation(results[0]);
  } catch (error) {
    console.error(error);
    showToast('Unable to complete search right now.');
  }
}

function handleUnitToggle(event) {
  state.unit = event.target.checked ? 'fahrenheit' : 'celsius';

  if (state.weatherData && state.selectedLocation) {
    renderWeather(
      {
        location: state.selectedLocation,
        weather: state.weatherData,
      },
      state.unit
    );
  }
}

function bindEvents() {
  elements.citySearch.addEventListener('input', handleSearchInput);
  elements.searchForm.addEventListener('submit', handleSearchSubmit);
  elements.unitToggle.addEventListener('change', handleUnitToggle);

  document.addEventListener('click', (event) => {
    if (!elements.searchForm.contains(event.target)) {
      clearSearchResults();
    }
  });
}

function init() {
  bindEvents();
  bootstrapWeather();
}

init();
