/**
 * AR Portal Engine v2.0
 * Universal Branding, SEO synchronization, and responsive orchestration.
 */

class ARPortalEngine {
    constructor() {
        this.config = null;
        this.isReady = false;
        this.handshakePromise = null;
        this.init();
    }

    async init() {
        console.log('>>> [PortalEngine v2.0] Booting...');
        
        // 1. Instant Loader Injection
        this.injectLoader();

        // 2. Auth Guard
        this.checkAuth();

        // 3. Hydrate Config
        await this.fetchConfig();

        // 4. Update Brand Assets
        if (this.config) {
            this.syncSEO();
            this.injectBrandedHeader();
            this.syncUI();
        }

        // 5. Setup Observers
        this.initObservers();

        // 6. Complete Handshake
        this.completeBoot();
    }

    injectLoader() {
        if (document.getElementById('loader-wrapper')) return;

        const loader = document.createElement('div');
        loader.id = 'loader-wrapper';
        loader.innerHTML = `
            <div class="loader-spinner" style="margin-bottom: 1.5rem;"></div>
            <div class="loader-text mono" id="portal-handshake" style="font-size: 1.1rem; letter-spacing: 2px;">Loading to Devmode...</div>
        `;
        document.body.prepend(loader);
        
        // Brief artificial delay for smooth transition (optimized for extreme loading speed)
        this.handshakePromise = new Promise(r => setTimeout(r, 50));
    }

    async fetchConfig() {
        try {
            const path = '/frontend/data/config.json';
            
            const response = await fetch(path);
            this.config = await response.json();
            console.log('>>> [PortalEngine] Config Hydrated.');
        } catch (err) {
            console.error('>>> [PortalEngine] Config Fetch Failed:', err);
        }
    }

    checkAuth() {
        const isPrivate = window.location.pathname.includes('/private/') || 
                         window.location.pathname.includes('dashboard.html');
        
        if (isPrivate) {
            const token = sessionStorage.getItem('dev_access_token');
            const tokenTime = sessionStorage.getItem('dev_access_time');
            const isExpired = tokenTime ? (Date.now() - parseInt(tokenTime)) > 1000 * 60 * 60 * 24 : true; // 24 hours
            
            if (!token || isExpired) {
                console.warn('>>> [PortalEngine] UNAUTHORIZED OR EXPIRED ACCESS ATTEMPT.');
                sessionStorage.removeItem('dev_access_token');
                sessionStorage.removeItem('dev_access_time');
                window.location.href = '/devend/login.html';
            }
        }
    }

    syncSEO() {
        if (!this.config || !this.config.meta) return;

        const path = window.location.pathname;
        let suffix = "Developer Portal";
        if (path.includes('login.html')) suffix = "Secure Access";
        else if (path.includes('dashboard.html')) suffix = "Command Center";
        else if (path.includes('guest-zone.html')) suffix = "Guest Learner";
        else if (path.includes('readme_viewer.html')) suffix = "System Explorer";

        document.title = `${this.config.meta.site_name || 'DEV.AR'} | ${suffix}`;

        // Favicons (Universal Injection)
        const faviconUrl = '/images/arlogo.png';
        
        let link = document.querySelector("link[rel*='icon']");
        if (!link) {
            link = document.createElement('link');
            link.rel = 'icon';
            document.head.appendChild(link);
        }
        link.href = faviconUrl;
        link.type = "image/png";
    }

    injectBrandedHeader() {
        if (document.querySelector('.dev-nav')) return; // Already exists
        
        // Don't inject on Dashboard or Login (they have custom layouts)
        if (window.location.pathname.includes('dashboard.html') || window.location.pathname.includes('login.html')) return;

        const logoPath = '/images/arlogo.png';

        const headerHtml = `
            <nav class="dev-nav">
                <div class="nav-container">
                    <a href="/index.html" class="nav-brand">
                        <img src="${logoPath}" alt="Logo">
                        <span id="dynamic-brand-text">AR.TECH<span class="mono" style="color: var(--primary); font-size: 0.8rem; margin-left: 2px;">|</span></span>
                    </a>
                    <ul class="nav-links">
                        <li><a href="/index.html" class="nav-link">Exit Portal</a></li>
                    </ul>
                </div>
            </nav>
        `;
        document.body.insertAdjacentHTML('afterbegin', headerHtml);

        // Contextual Branding
        const brandText = document.getElementById('dynamic-brand-text');
        if (brandText) {
            const path = window.location.pathname;
            if (path.includes('guest-zone')) brandText.innerHTML = `GUEST<span class="dot">.</span>AR<span class="mono" style="color: var(--primary); font-size: 0.8rem; margin-left: 2px;">|</span>`;
            else if (path.includes('readme_viewer')) brandText.innerHTML = `EXPLORE<span class="dot">.</span>AR<span class="mono" style="color: var(--primary); font-size: 0.8rem; margin-left: 2px;">|</span>`;
            else brandText.innerHTML = `DEV<span class="dot">.</span>AR<span class="mono" style="color: var(--primary); font-size: 0.8rem; margin-left: 2px;">|</span>`;
        }
    }

    syncUI() {
        // Uniform directory casing for physical case-sensitive Linux assets (DeveloperNotes)
        document.querySelectorAll('a').forEach(a => {
            if (a.href.toLowerCase().includes('developernotes')) {
                a.href = a.href.replace(/developernotes/i, 'DeveloperNotes');
            }
        });

        // Data-Hydration Tags
        document.querySelectorAll('[data-var]').forEach(el => {
            const keys = el.getAttribute('data-var').split('.');
            let val = this.config;
            for (let k of keys) { if (val != null) val = val[k]; }
            if (val != null && typeof val !== 'object') el.innerHTML = val;
        });
    }

    initObservers() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));
    }

    async completeBoot() {
        if (this.handshakePromise) await this.handshakePromise;

        setTimeout(() => {
            const loader = document.getElementById('loader-wrapper');
            if (loader) {
                loader.style.opacity = '0';
                loader.style.visibility = 'hidden';
                setTimeout(() => loader.remove(), 600);
            }
            this.isReady = true;
            document.body.classList.add('loaded');
            console.log('>>> [PortalEngine v2.0] System Ready.');
            
            window.dispatchEvent(new CustomEvent('portalReady', { detail: this.config }));
        }, 50);
    }
}

// Global Registry Injection
window.portalEngine = new ARPortalEngine();
