# SkyCastBD Project Structure

```
SkyCastBD/
│
├── index.html                 # Main homepage
├── README.md                  # Project documentation
├── BEST_PRACTICES.md          # Development guidelines
├── .gitignore                 # Git ignore rules
│
├── css/
│   ├── main.css              # Primary stylesheet
│   └── glassmorphism.css     # Glass-effect components
│
├── js/
│   ├── main.js               # Core functionality
│   └── weather-api.js        # Weather API integration
│
├── pages/
│   ├── forecast.html         # 7-day weather forecast
│   ├── about.html            # About company
│   ├── contact.html          # Contact form
│   ├── privacy.html          # Privacy policy (template)
│   └── terms.html            # Terms of service (template)
│
├── blog/
│   └── index.html            # Blog article listing
│
└── assets/
    ├── images/               # Placeholder for images
    ├── icons/                # SVG icons & favicon
    └── fonts/                # Custom font files
```

## File Descriptions

### HTML Files
- **index.html**: Landing page with hero section, featured cities, and CTA
- **pages/forecast.html**: 7-day forecast display
- **pages/about.html**: Company mission and features
- **pages/contact.html**: Contact form with validation ready
- **blog/index.html**: Blog article grid layout

### CSS Files
- **main.css**: 
  - Root variables for theming
  - Navigation and hero styles
  - Responsive grid layouts
  - Footer styling
  - Mobile breakpoints

- **glassmorphism.css**:
  - Glass-effect component styles
  - Frosted glass cards
  - Gradient text utilities
  - Blur background effects
  - Frost effect variants

### JavaScript Files
- **main.js**:
  - Mobile menu toggle
  - Search functionality
  - Event listeners
  - DOM manipulation

- **weather-api.js**:
  - OpenWeatherMap API integration
  - Data parsing and formatting
  - Error handling
  - Weather service class

## Component Breakdown

### Navigation
- Sticky navbar with logo
- Responsive menu (hamburger on mobile)
- Active state indicators

### Hero Section
- Full-width background
- Call-to-action button
- City search bar
- Animated gradient blurs

### Weather Grid
- Responsive card layout
- Glass-morphism cards
- Weather data display
- Detail links

### Featured Cities
- Bangladesh-focused (Dhaka, Chittagong, Sylhet, Khulna)
- Current conditions
- Temperature display
- Direct access links

### CTA Section
- Notification signup
- Premium branding
- Call-to-action button

### Footer
- Company info
- Quick links
- Legal pages
- Copyright info

## Responsive Breakpoints

```
Desktop:     1200px+
Tablet:      768px - 1199px
Mobile:      480px - 767px
Small Mob:   < 480px
```

## Color Scheme

```
Primary:     #0066ff (Blue)
Secondary:   #00d4ff (Cyan)
Accent:      #ff6b35 (Orange)
Dark BG:     #0f1419 (Dark Blue)
Light Text:  #1a1a1a (Near Black)
Secondary:   #666666 (Gray)
```

## Typography

```
Font Family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif
H1:          3.5rem (56px)
H2:          2.5rem (40px)
H3:          1.75rem (28px)
Body:        1rem (16px)
Small:       0.875rem (14px)
```

## Asset Organization

### Images (assets/images/)
- Hero background images
- City preview images
- Blog featured images
- Weather condition illustrations

### Icons (assets/icons/)
- favicon.svg
- Weather icons (sunny, rainy, cloudy, etc.)
- Social media icons
- UI icons (menu, search, etc.)

### Fonts (assets/fonts/)
- System fonts preferred
- Optional: Custom font files
- Subset fonts for performance

## Adding New Features

### New Weather Page
1. Create file in `/pages/weather-page.html`
2. Copy navbar/footer template
3. Link CSS and JS files
4. Update navigation links

### New Blog Post
1. Create folder: `/blog/post-title/`
2. Create `index.html` in that folder
3. Add `article-style.css` if needed
4. Link from `/blog/index.html`

### New Component
1. Create CSS in `css/components.css` (new file)
2. Add HTML markup
3. Add JS in `js/components.js` (new file)
4. Document in BEST_PRACTICES.md

## Development Workflow

1. Open project in VS Code
2. Use Live Server extension
3. Edit HTML/CSS/JS
4. Refresh browser to see changes
5. Test responsive design
6. Commit changes to git

---

Last Updated: May 2026
