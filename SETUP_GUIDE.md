# SkyCastBD Setup & Configuration Guide

## Quick Start (5 minutes)

1. **Clone/Download Project**
   ```bash
   git clone <repository-url>
   cd SkyCastBD
   ```

2. **Open in Browser**
   - Option A: Double-click `index.html`
   - Option B: Use Live Server (VS Code extension)

3. **Get OpenWeatherMap API Key**
   - Visit: https://openweathermap.org/api
   - Sign up (free tier available)
   - Copy your API key

4. **Add API Key**
   - Open `js/weather-api.js`
   - Replace `YOUR_API_KEY_HERE` with your key
   - Save file

5. **Test**
   - Refresh browser
   - Search for any city
   - Should display weather data

## Detailed Setup

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, or Edge)
- Text editor (VS Code recommended)
- Internet connection
- Free OpenWeatherMap account

### Step-by-Step Installation

#### 1. Prepare Development Environment

```bash
# Navigate to project directory
cd /path/to/SkyCastBD

# Initialize git (if not already)
git init
git remote add origin <your-repo-url>
```

#### 2. Set Up Live Server (Recommended)

**VS Code Setup:**
1. Install "Live Server" extension
2. Right-click `index.html`
3. Select "Open with Live Server"
4. Browser opens at http://127.0.0.1:5500

**Alternative: Python Server**
```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```

#### 3. Weather API Configuration

**Free OpenWeatherMap Setup:**

1. Go to https://openweathermap.org/api
2. Click "Sign Up"
3. Create free account
4. Go to "API keys" tab
5. Copy the default key
6. Edit `js/weather-api.js`:

```javascript
const API_KEY = 'your-copied-api-key-here';
```

**Free Tier Limits:**
- 60 calls/minute
- 1 million calls/month
- 5-day forecast
- Current weather only

#### 4. Test Integration

Open browser console (F12) and test:

```javascript
// Check if WeatherService is available
console.log(WeatherService);

// Test API call
WeatherService.getWeatherByCity('Dhaka').then(data => {
    console.log('Weather data:', data);
});
```

### Environment Variable Setup (Optional)

For production deployment, use environment variables:

**Create `.env.local`:**
```
VITE_WEATHER_API_KEY=your_api_key_here
VITE_API_BASE_URL=https://api.openweathermap.org
```

**Update `js/weather-api.js`:**
```javascript
const API_KEY = process.env.VITE_WEATHER_API_KEY || 'default-key';
```

## Project Structure Recap

```
SkyCastBD/
├── index.html          ← Start here
├── css/
│   ├── main.css        ← Primary styles
│   └── glassmorphism.css
├── js/
│   ├── main.js         ← Core logic
│   └── weather-api.js  ← API integration (ADD KEY HERE)
├── pages/              ← Additional pages
├── blog/               ← Blog content
├── assets/             ← Images, icons
└── README.md           ← Documentation
```

## Key Features Overview

### 1. Homepage (index.html)
- Hero section with search
- Featured Bangladesh cities
- Glassmorphism design
- Responsive layout

### 2. Forecast Page (/pages/forecast.html)
- 7-day weather forecast
- Extended details
- Weather charts ready

### 3. About Page (/pages/about.html)
- Company mission
- Features list
- Call-to-action

### 4. Blog (/blog/index.html)
- Weather articles
- Tips and guides
- Latest news

## Customization Options

### Colors
Edit in `css/main.css`:
```css
:root {
    --primary: #0066ff;      /* Change this */
    --secondary: #00d4ff;    /* Change this */
    --accent: #ff6b35;       /* Change this */
}
```

### Featured Cities
Edit in `js/main.js`:
```javascript
const citiesData = [
    { name: 'Your City', coords: { lat: 0, lon: 0 } },
    // Add more cities
];
```

### Branding
- Update logo in navigation
- Change site title in `index.html`
- Update footer content
- Modify favicon (assets/icons/favicon.svg)

## Testing Checklist

Before going live:
- [ ] API key is working
- [ ] Cities display correctly
- [ ] Search functionality works
- [ ] Responsive on mobile
- [ ] No console errors
- [ ] All links functional
- [ ] Performance acceptable
- [ ] Loading time < 3 seconds

## Deployment Options

### Option 1: Netlify (Easiest)

1. Push code to GitHub
2. Visit https://netlify.com
3. Connect your GitHub repo
4. Deploy in one click

**Set Environment Variables:**
- Go to Site settings > Build & deploy > Environment
- Add `VITE_WEATHER_API_KEY=your_key`

### Option 2: Vercel

1. Visit https://vercel.com
2. Import your GitHub repo
3. Configure environment variables
4. Deploy

### Option 3: GitHub Pages

1. Push to GitHub
2. Go to repository Settings > Pages
3. Select branch to deploy
4. URL: `username.github.io/SkyCastBD`

### Option 4: Traditional Hosting

1. Get web hosting (Bluehost, GoDaddy, etc.)
2. Upload files via FTP
3. Configure domain
4. Done!

## Troubleshooting

### Problem: API Returns 401 Error
**Solution:** 
- Check API key is correct
- Verify OpenWeatherMap account is activated
- Wait 5 minutes after creating API key

### Problem: Cities Not Loading
**Solution:**
- Open console (F12)
- Check for errors
- Verify API key is set
- Check internet connection

### Problem: Styling Looks Wrong
**Solution:**
- Clear browser cache (Ctrl+Shift+Del)
- Hard refresh (Ctrl+F5)
- Check CSS files are linked in HTML

### Problem: Search Not Working
**Solution:**
- Check API key is valid
- Verify city name spelling
- Check browser console for errors
- Test with "London" first

## Performance Optimization

### Before Deployment

1. **Minify CSS/JS** (optional)
   ```bash
   npm install terser
   terser js/main.js -c -m -o js/main.min.js
   ```

2. **Optimize Images**
   - Compress all images
   - Use WebP format
   - Lazy load non-critical images

3. **Test Performance**
   - Use Google Lighthouse
   - Aim for > 90 score
   - Check Core Web Vitals

## Maintenance

### Monthly Tasks
- Check for broken links
- Review weather data accuracy
- Update blog content
- Monitor analytics

### Quarterly Tasks
- Update dependencies
- Review security practices
- Refresh design elements
- Test all features

### Yearly Tasks
- Audit performance
- Review SEO rankings
- Update content strategy
- Plan new features

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Blank page | Check `index.html` exists, try different browser |
| CSS not loading | Verify CSS file paths in HTML |
| API not working | Check API key, internet connection |
| Mobile looks bad | Clear cache, check media queries |
| Slow loading | Optimize images, minify CSS/JS |

## Getting Help

1. **Check Console** (F12 → Console tab)
2. **Read BEST_PRACTICES.md**
3. **Search GitHub Issues**
4. **Check OpenWeatherMap Docs**
5. **Ask in Developer Communities**

## Next Steps

After setup:
1. Explore codebase
2. Customize branding
3. Add more cities
4. Integrate local backend
5. Deploy online
6. Monitor performance

---

**Need Help?** See README.md or BEST_PRACTICES.md
Last Updated: May 2026
