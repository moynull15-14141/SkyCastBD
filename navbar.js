class SkyCastBDNavbar {
    constructor() {
        this.navbar = document.getElementById('navbar');
        this.navbarMenu = document.getElementById('navbarMenu');
        this.mobileToggle = document.getElementById('mobileToggle');
        this.mobileOverlay = document.getElementById('mobileOverlay');
        this.celsiusBtn = document.getElementById('celsiusBtn');
        this.fahrenheitBtn = document.getElementById('fahrenheitBtn');
        this.scrollIndicator = document.getElementById('scrollIndicator');
        this.navLinks = document.querySelectorAll('.nav-link');
        
        this.isCelsius = true;
        this.currentTemp = 28;
        
        this.init();
    }

    init() {
        this.attachEventListeners();
        this.updateScrollIndicator();
    }

    attachEventListeners() {
        this.mobileToggle.addEventListener('click', () => this.toggleMobileMenu());
        this.mobileOverlay.addEventListener('click', () => this.closeMobileMenu());
        this.celsiusBtn.addEventListener('click', () => this.switchToCelsius());
        this.fahrenheitBtn.addEventListener('click', () => this.switchToFahrenheit());
        
        this.navLinks.forEach(link => {
            link.addEventListener('click', (e) => this.handleNavigation(e, link));
        });

        window.addEventListener('scroll', () => this.handleScroll());
        window.addEventListener('resize', () => this.handleResize());
    }

    toggleMobileMenu() {
        this.mobileToggle.classList.toggle('active');
        this.navbarMenu.classList.toggle('active');
        this.mobileOverlay.classList.toggle('active');
        
        if (this.navbarMenu.classList.contains('active')) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
    }

    closeMobileMenu() {
        this.mobileToggle.classList.remove('active');
        this.navbarMenu.classList.remove('active');
        this.mobileOverlay.classList.remove('active');
        document.body.style.overflow = 'auto';
    }

    handleNavigation(e, link) {
        e.preventDefault();
        
        this.navLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');
        
        this.closeMobileMenu();
        
        const sectionId = link.getAttribute('href');
        const section = document.querySelector(sectionId);
        
        if (section) {
            section.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    handleScroll() {
        if (window.scrollY > 50) {
            this.navbar.classList.add('scrolled');
        } else {
            this.navbar.classList.remove('scrolled');
        }

        this.updateScrollIndicator();
        this.updateActiveLink();
    }

    updateScrollIndicator() {
        const scrollTotal = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPercent = scrollTotal > 0 ? (window.scrollY / scrollTotal) * 100 : 0;
        this.scrollIndicator.style.width = scrollPercent + '%';
    }

    updateActiveLink() {
        let current = '';
        const sections = document.querySelectorAll('section');
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            if (scrollY >= sectionTop - 200) {
                current = section.getAttribute('id');
            }
        });

        this.navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('data-section') === current) {
                link.classList.add('active');
            }
        });
    }

    switchToCelsius() {
        this.isCelsius = true;
        this.celsiusBtn.classList.add('active');
        this.fahrenheitBtn.classList.remove('active');
        this.updateTemperatureDisplay();
    }

    switchToFahrenheit() {
        this.isCelsius = false;
        this.fahrenheitBtn.classList.add('active');
        this.celsiusBtn.classList.remove('active');
        this.updateTemperatureDisplay();
    }

    updateTemperatureDisplay() {
        const tempElement = document.querySelector('[data-temperature]');
        if (tempElement) {
            if (this.isCelsius) {
                tempElement.textContent = this.currentTemp + '°C';
            } else {
                const fahrenheit = Math.round((this.currentTemp * 9/5) + 32);
                tempElement.textContent = fahrenheit + '°F';
            }
        }
    }

    handleResize() {
        if (window.innerWidth > 768) {
            this.closeMobileMenu();
        }
    }

    setCurrentTemperature(temp) {
        this.currentTemp = temp;
        this.updateTemperatureDisplay();
    }

    getTemperatureInCelsius() {
        return this.currentTemp;
    }

    getTemperatureInFahrenheit() {
        return Math.round((this.currentTemp * 9/5) + 32);
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const navbar = new SkyCastBDNavbar();
    
    navbar.setCurrentTemperature(28);
    
    window.SkyCastBDNavbar = navbar;
});

function formatTemperature(celsius, toFahrenheit = false) {
    if (toFahrenheit) {
        return Math.round((celsius * 9/5) + 32) + '°F';
    }
    return Math.round(celsius) + '°C';
}

function celsiusToFahrenheit(celsius) {
    return Math.round((celsius * 9/5) + 32);
}

function fahrenheitToCelsius(fahrenheit) {
    return Math.round((fahrenheit - 32) * 5/9);
}
