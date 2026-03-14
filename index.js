// Import all components to register them with the browser
import './components/doap-home.js';
import './components/doap-scrape.js';
import './components/doap-history.js';
import './components/doap-db-viewer.js';
import './components/doap-curiosity.js';
import './components/doap-feature-map.js';
import './components/doap-settings.js';
import './components/doap-browser.js';

// Simple Router
const routes = {
    home: () => '<doap-home></doap-home>',
    scrape: () => '<doap-scrape></doap-scrape>',
    history: () => '<doap-history></doap-history>',
    'db-viewer': () => '<doap-db-viewer></doap-db-viewer>',
    curiosity: () => '<doap-curiosity></doap-curiosity>',
    'feature-map': () => '<doap-feature-map></doap-feature-map>',
    settings: () => '<doap-settings></doap-settings>',
    browser: (params) => `<doap-browser url="${params.url || ''}"></doap-browser>`
};

const appRoot = document.getElementById('app-root');
const navItems = document.querySelectorAll('.nav-item');
const globalSearchInput = document.getElementById('global-search-input');
const navDrawer = document.getElementById('nav-drawer');
const drawerOverlay = document.getElementById('drawer-overlay');
const drawerToggle = document.getElementById('drawer-toggle');
const closeDrawerBtn = document.getElementById('close-drawer');
const headerLogo = document.getElementById('header-logo');

function toggleDrawer(open) {
    if (open) {
        navDrawer.classList.remove('hidden');
        drawerOverlay.classList.remove('hidden');
        setTimeout(() => navDrawer.classList.add('open'), 10);
    } else {
        navDrawer.classList.remove('open');
        setTimeout(() => {
            navDrawer.classList.add('hidden');
            drawerOverlay.classList.add('hidden');
        }, 300);
    }
}

function navigateTo(route, params = {}) {
    if (!routes[route]) return;

    // Close drawer on navigation
    toggleDrawer(false);

    // Destroy old component, insert new one
    appRoot.innerHTML = routes[route](params);

    // Update active nav state
    navItems.forEach(btn => btn.classList.remove('active'));
    const activeBtn = document.getElementById(`nav-${route}`);
    if (activeBtn) activeBtn.classList.add('active');

    // Handle full-bleed for browser
    if (route === 'browser') {
        appRoot.classList.add('full-bleed');
    } else {
        appRoot.classList.remove('full-bleed');
    }

    // Update Header visibility
    const searchContainer = document.getElementById('global-search-container');
    if (route === 'home') {
        searchContainer.classList.add('hidden');
        headerLogo.style.opacity = '0';
        headerLogo.style.pointerEvents = 'none';
    } else {
        searchContainer.classList.remove('hidden');
        headerLogo.style.opacity = '1';
        headerLogo.style.pointerEvents = 'auto';
    }

    // Update Title
    const titles = {
        home: 'Dashboard',
        scrape: 'Web Scraper',
        history: 'Scrape History',
        'db-viewer': 'Database Viewer',
        curiosity: 'Curiosity (RAG)',
        'feature-map': 'Architecture Map',
        settings: 'Settings',
        browser: 'Browser'
    };
    document.getElementById('page-title').innerText = titles[route] || 'Dashboard';
}

// Drawer Event Listeners
drawerToggle.addEventListener('click', () => toggleDrawer(true));
closeDrawerBtn.addEventListener('click', () => toggleDrawer(false));
drawerOverlay.addEventListener('click', () => toggleDrawer(false));

// Global search handling
globalSearchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        const query = globalSearchInput.value.trim();
        if (query) {
            navigateTo('browser', { url: query });
        }
    }
});

// Bind Navigation
navItems.forEach(btn => {
    btn.addEventListener('click', () => {
        const route = btn.id.replace('nav-', '');
        navigateTo(route);
    });
});

// Handle custom navigate events thrown by components (e.g. from Feature Map or Home)
window.addEventListener('navigate', (e) => {
    if (e.detail && e.detail.view) {
        navigateTo(e.detail.view, e.detail);
    }
});

// Handle global generic modal
window.addEventListener('open-modal', (e) => {
    const modal = document.getElementById('content-modal');
    const titleEl = document.getElementById('modal-title');
    const bodyEl = document.getElementById('modal-body');

    if (e.detail) {
        titleEl.innerText = e.detail.title || 'Details';
        bodyEl.innerHTML = `<pre>${e.detail.content}</pre>`;
        modal.classList.remove('hidden');
    }
});

window.closeModal = () => {
    document.getElementById('content-modal').classList.add('hidden');
};
// Attach to window so HTML inline onclick="closeModal()" still works
window.closeModal = window.closeModal;

// Handle global provider status updates from Settings component
window.addEventListener('provider-status', (e) => {
    const dot = document.querySelector('.status-indicator .dot');
    const text = document.getElementById('provider-status');
    if (e.detail.online) {
        dot.classList.add('connected');
        text.innerText = 'Online';
    } else {
        dot.classList.remove('connected');
        text.innerText = 'Offline';
    }
});

// Initial mount
navigateTo('home');
