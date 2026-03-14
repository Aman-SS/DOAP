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
const closeDrawerBtn = document.getElementById('close-drawer');
const mainHeader = document.getElementById('main-header');
const globalDrawerToggle = document.getElementById('global-drawer-toggle');

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
    if (route === 'home') {
        mainHeader.classList.add('hidden');
    } else {
        mainHeader.classList.remove('hidden');
    }

    // Update Title (Optional: if we ever bring back page titles)
    /*
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
    const titleEl = document.getElementById('page-title');
    if (titleEl) titleEl.innerText = titles[route] || 'Dashboard';
    */
}

// Drawer Event Listeners
globalDrawerToggle.addEventListener('click', () => toggleDrawer(true));
closeDrawerBtn.addEventListener('click', () => toggleDrawer(false));
drawerOverlay.addEventListener('click', () => toggleDrawer(false));

window.addEventListener('toggle-drawer', (e) => {
    toggleDrawer(e.detail.open);
});

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

// Handle global provider status updates
window.addEventListener('provider-status', (e) => {
    const dots = document.querySelectorAll('.status-indicator .dot, .ollama-status-dot');
    const texts = document.querySelectorAll('#provider-status, .ollama-status-text');
    
    dots.forEach(dot => {
        if (e.detail.online) {
            dot.classList.add('connected');
        } else {
            dot.classList.remove('connected');
        }
    });

    texts.forEach(text => {
        text.innerText = e.detail.online ? 'Online' : 'Offline';
    });
});

// Global Status Polling & State
window.ollamaOnline = false;

async function globalCheckStatus() {
    if (!window.api) return;
    try {
        const result = await window.api.checkOllama();
        const online = !!result.online;
        window.ollamaOnline = online;
        window.dispatchEvent(new CustomEvent('provider-status', { 
            detail: { online: online } 
        }));
    } catch (e) {
        window.ollamaOnline = false;
        window.dispatchEvent(new CustomEvent('provider-status', { 
            detail: { online: false } 
        }));
    }
}

// Initial check and start polling
globalCheckStatus(); 
setInterval(globalCheckStatus, 10000);

// Initial mount
navigateTo('home');
