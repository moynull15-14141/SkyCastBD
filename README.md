# SkyCastBD - Weather Forecasting Website

SkyCastBD is a Bangladesh-first weather forecasting platform with a premium glassmorphism UI, responsive multi-page frontend, Open-Meteo weather/AQI data, and an optional Express backend API proxy for caching, rate limiting, admin, blog, contact, and store features.

## Features

- **Modern UI Design**: Glassmorphism aesthetic, dark/light theme support, smooth interactions, and premium dashboard-style weather cards.
- **Responsive Layout**: Mobile-first pages that work across desktop, tablet, and mobile devices.
- **Bangladesh Focus**: Featured weather and AQI sections for major Bangladesh cities such as Dhaka, Chattogram, Sylhet, Khulna, Rajshahi, and Cox's Bazar.
- **Open-Meteo Integration**: Uses Open-Meteo forecast, geocoding, and air-quality APIs. No weather API key is required for the default public data provider.
- **Backend API Proxy**: Express backend can proxy weather requests, cache provider responses, apply rate limits, validate input, and store search/admin data in MongoDB.
- **CMS/Admin Modules**: Blog, contact, product, and order management support through the backend API.
- **SEO Optimized**: Semantic HTML, meta tags, Open Graph/Twitter tags, structured data, sitemap, and robots file.
- **Pure Frontend Pages**: Static HTML, CSS, and JavaScript pages with no frontend framework build step required.

## Project Structure

```text
SkyCastBD/
├── index.html              # Homepage
├── css/
│   ├── main.css            # Primary styles
│   ├── glassmorphism.css   # Glass effect components
│   ├── blog.css            # Blog page styles
│   └── cms.css             # Admin/CMS styles
├── js/
│   ├── main.js             # Main frontend interactions and weather UI
│   ├── weather-api.js      # Browser weather service with backend fallback/direct Open-Meteo fallback
│   ├── cms-api.js          # CMS/admin API client
│   ├── admin.js            # Admin dashboard logic
│   ├── contact.js          # Contact form logic
│   └── store.js            # Store page logic
├── pages/                  # Static content and app pages
├── blog/                   # Blog list, post template, and articles
├── backend/                # Express API, MongoDB models, validation, caching, and routes
├── robots.txt
├── sitemap.xml
└── README.md
```

## Getting Started

### Requirements

- Modern browser such as Chrome, Firefox, Safari, or Edge.
- VS Code or another code editor.
- Optional: VS Code Live Server extension for local static frontend development.
- Optional backend requirements: Node.js 20+, npm, and MongoDB if persistence is enabled.

### Frontend Setup

1. Clone or download the project.
2. Open `index.html` directly in a browser, or serve the project with Live Server.
3. The frontend uses `js/weather-api.js` to call the configured backend first, then falls back to Open-Meteo directly if the backend is unavailable.

### Backend Setup

```bash
cd backend
npm install
copy .env.example .env
npm run dev
```

The backend defaults to:

```text
http://localhost:10000/api/v1
```

Update `backend/.env` when needed:

```text
PORT=10000
CLIENT_ORIGIN=http://127.0.0.1:4173,http://localhost:4173
MONGODB_URI=mongodb://127.0.0.1:27017/skycastbd
REQUIRE_MONGODB=false
```

`CLIENT_ORIGIN` is a comma-separated allowlist used by backend CORS protection.

## Weather Data Provider

SkyCastBD uses Open-Meteo by default:

- Forecast API: `https://api.open-meteo.com/v1/forecast`
- Geocoding API: `https://geocoding-api.open-meteo.com/v1/search`
- Air Quality API: `https://air-quality-api.open-meteo.com/v1/air-quality`

No OpenWeatherMap key or API key configuration is required for the default implementation.

## Key Features Explained

### Glassmorphism Design

- Frosted glass cards with backdrop blur.
- Layered gradients for a modern weather-dashboard aesthetic.
- Smooth hover states and transitions.
- Dark/light theme support.

### Responsive Breakpoints

- Desktop: 1200px+
- Tablet: 768px - 1200px
- Mobile: below 768px
- Small Mobile: below 480px

### Weather Integration

- Real-time current weather.
- City search using Open-Meteo geocoding.
- 7-day forecast.
- Bangladesh popular cities quick cards.
- AQI and pollutant values for major Bangladesh cities.
- Backend proxy support for caching and rate limiting.

## Customization

### Colors

Edit CSS variables in `css/main.css`:

```css
:root {
    --primary: #0066ff;
    --secondary: #00d4ff;
    --accent: #ff6b35;
}
```

### Featured Cities

Modify the `POPULAR_BANGLADESH_CITIES` list in `js/main.js`.

### Backend API URL

`js/weather-api.js` reads `window.SKYCASTBD_API_BASE_URL` when provided. If no runtime override exists, it falls back to the configured production API base URL.

## SEO Best Practices Implemented

- Semantic HTML5 structure.
- Meta description, keywords, canonical link, and social sharing tags.
- Structured data with JSON-LD.
- Sitemap and robots file.
- Responsive design for mobile indexing.
- Clear navigation and crawlable static pages.

## Performance Optimization

- No heavy frontend framework runtime.
- Deferred JavaScript loading.
- Lazy media handling.
- In-memory and browser-side weather request deduplication/fallbacks.
- Backend cache support for weather provider responses.

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## License

MIT License - feel free to use for personal or commercial projects.

## Contributing

Contributions are welcome. Please follow the existing project structure, naming conventions, and coding standards.

---

Made with 🌦️ in Bangladesh by SkyCastBD Team
