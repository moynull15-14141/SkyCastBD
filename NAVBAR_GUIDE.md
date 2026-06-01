# SkyCastBD Premium Sticky Navbar - Complete Guide

## 📋 Overview

A premium, responsive sticky navbar with:
- Glassmorphism frosted glass effect
- Logo on left (SkyCastBD)
- Navigation menu in center (5 items)
- Temperature toggle on right (°C/°F)
- Mobile hamburger menu
- Smooth scrolling and animations
- Active link auto-highlighting
- Scroll progress indicator

## 🚀 Quick Start

### 1. Copy Files
```
navbar.html  - HTML structure (130 lines)
navbar.css   - Styling with glassmorphism (325 lines)
navbar.js    - Interactive functionality (175 lines)
```

### 2. Include in Your Project
```html
<link rel="stylesheet" href="navbar.css">
<script src="navbar.js"></script>
```

### 3. Add HTML
Copy the navbar HTML from navbar.html to your page before content.

### 4. Done!
The navbar is now sticky and fully functional.

## 🎨 Design Features

### Glassmorphism Effect
- Frosted glass with blur(10px)
- Semi-transparent background
- Border with glass reflection
- Premium visual appearance

### Color Scheme (Bangladesh Branding)
- Primary: #1e90ff (Dodger Blue)
- Secondary: #00d4ff (Cyan) 
- Accent: #ff6b35 (Orange)
- Text: White on dark, dark on light

### Responsive Breakpoints
- Desktop: 1024px+ (full menu)
- Tablet: 768px-1023px (compact)
- Mobile: 768px and below (slide menu)
- Small mobile: 480px and below (minimal)

## 📱 Components

### Logo Section
- Weather icon SVG with glow
- "SkyCastBD" gradient text
- Hover lift effect
- Clickable link to home

### Navigation Menu (5 Items)
1. 🏠 Overview
2. 📊 Forecast
3. 🌍 Cities
4. 💨 Air Quality
5. 🚨 Alerts

Features:
- Emoji icons
- Hover animations
- Active indicator (pulsing dot)
- Smooth transitions
- Mobile responsive

### Temperature Toggle
- Celsius/Fahrenheit buttons
- Active state styling
- Glass effect background
- Click to switch units
- Shows current temperature

### Mobile Menu
- Hamburger toggle button
- Slide-in menu from right
- Full-height overlay
- Dark semi-transparent background
- Close on selection
- Touch-friendly spacing

### Scroll Indicator
- Progress bar at navbar bottom
- Cyan to blue gradient
- Updates with page scroll
- Visual scroll position

## 💻 JavaScript API

### Main Class: SkyCastBDNavbar

```javascript
// Initialize (happens automatically)
const navbar = new SkyCastBDNavbar();

// Temperature methods
navbar.setCurrentTemperature(28);
navbar.switchToCelsius();
navbar.switchToFahrenheit();
navbar.getTemperatureInCelsius();
navbar.getTemperatureInFahrenheit();

// Menu methods
navbar.toggleMobileMenu();
navbar.closeMobileMenu();

// Utility methods
navbar.updateActiveLink();
navbar.updateScrollIndicator();

// Helper functions
formatTemperature(28, false);    // "28°C"
formatTemperature(28, true);     // "82°F"
celsiusToFahrenheit(28);         // 82
fahrenheitToCelsius(82);         // 28
```

## 🔧 Customization

### Change Colors
Edit CSS variables in navbar.css:
```css
:root {
    --primary: #your-blue;
    --secondary: #your-cyan;
    --accent: #your-orange;
}
```

### Change Menu Items
Edit navbar.html nav-link items. Each link has:
- href="#section" - Scroll target
- data-section="section" - Active tracking
- nav-icon - Emoji
- Link text

### Set Initial Temperature
```javascript
navbar.setCurrentTemperature(28); // Your city temp
```

### Update Logo
Replace SVG icon or image in logo-link.

### Add Sections
Create new <section> with matching id:
```html
<section id="your-section">
    <!-- Content -->
</section>
```

## 🎯 Features Explained

### Sticky Positioning
- Stays at top while scrolling
- Blur effect increases on scroll
- Shadow appears after 50px scroll
- Smooth transitions

### Active Link Tracking
- Automatically highlights current section
- Updates as you scroll
- Works with smooth scroll
- Updates on navigation click

### Temperature Toggle
- Switch between °C and °F
- Persistent during session
- Smooth button transitions
- Active state styling

### Mobile Responsive
- Hamburger menu on touch devices
- Full-screen overlay menu
- Optimized touch targets
- Smooth slide animation

### Accessibility
- ARIA labels on buttons
- Semantic HTML structure
- Keyboard navigation support
- High contrast colors

## 📊 Animation Details

### Logo Hover
```
- Lift up 2px
- Glow shadow appears
- Smooth 0.3s transition
```

### Nav Link Hover
```
- Background fades in
- Icon scales and rotates
- Lift up 2px
- Smooth 0.3s transition
```

### Active Link Indicator
```
- Pulsing dot appears below link
- Pulse animation 1.5s loop
- Cyan color (#00d4ff)
- Mobile: Removed, uses border instead
```

### Mobile Menu
```
- Slide in from right
- Duration: 0.3s smooth
- Overlay fades in
- Hamburger animates to X
```

## 📈 Performance

- Total size: ~18KB (HTML+CSS+JS)
- No external dependencies
- GPU-accelerated animations
- Efficient event handling
- Optimized CSS selectors

## 🌐 Browser Support

✅ Chrome 90+
✅ Firefox 88+
✅ Safari 14+
✅ Edge 90+
✅ Mobile browsers
✅ iOS Safari
✅ Android Chrome

## 🐛 Common Issues

**Menu not closing?**
- Check `closeMobileMenu()` fires on link click
- Test on different viewport sizes

**Temperature not converting?**
- Ensure value set with `setCurrentTemperature()`
- Check element has `data-temperature` attribute

**Active link not updating?**
- Verify section `id` matches nav link `href`
- Check `data-section` value matches

**Glassmorphism not showing?**
- Browser might not support backdrop-filter
- Check CSS is loaded
- Try newer browser

**Scroll indicator missing?**
- Check element with id="scrollIndicator" exists
- Verify page content is scrollable

## 🚀 Advanced Usage

### With Weather API
```javascript
async function loadWeather() {
    const res = await fetch('/api/weather');
    const data = await res.json();
    navbar.setCurrentTemperature(data.temp);
}

loadWeather();
```

### With Routing
```javascript
router.on('change', (route) => {
    navbar.updateActiveLink();
});
```

### Custom Temperature Display
```javascript
// Update whenever temp changes
navbar.setCurrentTemperature(newTemp);
// Reflects in all display elements
```

## 📝 Code Structure

### HTML (navbar.html)
- Semantic nav element
- Flex layout for responsive design
- Data attributes for JavaScript hooks
- Accessible ARIA labels

### CSS (navbar.css)
- CSS variables for theming
- Mobile-first responsive design
- Glassmorphism effects
- Smooth animations
- Print styles included

### JavaScript (navbar.js)
- Class-based architecture
- Event delegation
- No external dependencies
- Modular methods
- Helper functions

## ✨ Highlights

✅ Modern glassmorphism design
✅ Fully responsive (mobile optimized)
✅ Smooth animations and transitions
✅ Temperature toggle functionality
✅ Auto-active link highlighting
✅ Scroll progress indicator
✅ Accessibility features
✅ No dependencies
✅ Easy to customize
✅ Well-documented code

## 📚 Files

- **navbar.html** - 130 lines, complete HTML structure
- **navbar.css** - 325 lines, all styling with responsive design
- **navbar.js** - 175 lines, interactive functionality
- **NAVBAR_GUIDE.md** - This documentation

## 🎓 Learning Resources

Study the files to learn:
- Glassmorphism CSS techniques
- Sticky positioning
- Mobile-first responsive design
- Event handling in vanilla JavaScript
- CSS animations and transitions
- Accessible HTML patterns

## 📞 Support

For questions or customization:
1. Check the code comments
2. Review CSS variable names
3. Test with browser DevTools
4. Verify HTML structure matches

---

**Version 1.0** | May 2026 | SkyCastBD Premium Navbar
