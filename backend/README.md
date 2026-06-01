# SkyCastBD Backend

Express backend for SkyCastBD with Open-Meteo API proxying, in-memory caching, rate limiting, MongoDB persistence, request validation, admin authentication, blog/contact/store APIs, and production-focused middleware.

## Folder Structure

```text
backend/
  src/
    app.js
    server.js
    config/
      env.js
      db.js
    controllers/
      authController.js
      blogController.js
      contactController.js
      healthController.js
      storeController.js
      weatherController.js
    middleware/
      auth.js
      errorHandler.js
      notFound.js
      rateLimiter.js
      requestLogger.js
      validate.js
    models/
      Admin.js
      Blog.js
      ContactMessage.js
      Order.js
      Product.js
      SearchLog.js
    routes/
      adminRoutes.js
      authRoutes.js
      blogRoutes.js
      contactRoutes.js
      healthRoutes.js
      orderRoutes.js
      productRoutes.js
      weatherRoutes.js
      index.js
    services/
      cacheService.js
      searchLogService.js
      weatherService.js
    utils/
      asyncHandler.js
      httpError.js
    validators/
      authSchemas.js
      blogSchemas.js
      contactSchemas.js
      storeSchemas.js
      weatherSchemas.js
  .env.example
  package.json
```

## Requirements

- Node.js 20 or newer.
- npm.
- MongoDB local or managed database if persistence is required.

## Setup

```bash
cd backend
npm install
copy .env.example .env
npm run dev
```

Default local API base URL:

```text
http://localhost:10000/api/v1
```

The default port comes from `PORT=10000` in `.env.example` and `src/config/env.js`.

## Environment Variables

```text
NODE_ENV=development
PORT=10000
CLIENT_ORIGIN=http://127.0.0.1:4173,http://localhost:4173
MONGODB_URI=mongodb://127.0.0.1:27017/skycastbd
REQUIRE_MONGODB=false
JWT_SECRET=replace-with-a-random-32-character-minimum-secret
JWT_EXPIRES_IN=7d
ADMIN_USERNAME=admin
ADMIN_PASSWORD=change-this-secure-password
OPEN_METEO_FORECAST_URL=https://api.open-meteo.com/v1/forecast
OPEN_METEO_GEOCODING_URL=https://geocoding-api.open-meteo.com/v1/search
OPEN_METEO_AIR_QUALITY_URL=https://air-quality-api.open-meteo.com/v1/air-quality
CACHE_TTL_SECONDS=300
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX=120
```

### CORS

`CLIENT_ORIGIN` is a comma-separated allowlist used by the backend CORS middleware. Only requests from these origins are allowed by browsers. Requests without an origin, such as server-to-server requests, health checks, and local API clients, are still accepted.

For production, set `CLIENT_ORIGIN` to your real frontend domains only, for example:

```text
CLIENT_ORIGIN=https://skycastbd.com,https://www.skycastbd.com
```

## Open-Meteo Provider

The backend proxies the following Open-Meteo APIs by default:

- Forecast: `https://api.open-meteo.com/v1/forecast`
- Geocoding: `https://geocoding-api.open-meteo.com/v1/search`
- Air Quality: `https://air-quality-api.open-meteo.com/v1/air-quality`

No OpenWeatherMap key or weather API key is required for the default implementation.

## Scripts

```bash
npm run dev      # Start development server with nodemon
npm start        # Start production server
npm run lint     # Run ESLint on backend source files
```

## Core Endpoints

- `GET /api/v1/health`
- `GET /api/v1/weather/search?city=Dhaka`
- `GET /api/v1/weather/current?lat=23.8103&lon=90.4125&name=Dhaka&country=Bangladesh`
- `GET /api/v1/weather/air-quality?lat=23.8103&lon=90.4125&name=Dhaka`

Additional route groups are available for authentication, admin, blog, contact, product, and order workflows under `/api/v1`.

## Deployment

1. Create a managed MongoDB database, for example MongoDB Atlas.
2. Set production environment variables:
   - `NODE_ENV=production`
   - `PORT`
   - `MONGODB_URI`
   - `REQUIRE_MONGODB=true` if the app must fail when MongoDB is unavailable
   - `JWT_SECRET` with at least 32 secure random characters
   - `CLIENT_ORIGIN` with only trusted frontend domains
   - Open-Meteo URLs only if you need to override the defaults
3. Install dependencies with `npm ci --omit=dev`.
4. Start with `npm start`.
5. Put the app behind HTTPS and a reverse proxy, or deploy to Render, Railway, Fly.io, or a Node-capable VPS.
6. Configure the frontend to call this backend API, preferably with the same domain reverse-proxy path `/api/v1` or a deployment-specific `window.SKYCASTBD_API_BASE_URL`.
