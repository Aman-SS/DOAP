// Import all components to register them with the browser
import './components/doap-home.js';
import './components/doap-scrape.js';
import './components/doap-history.js';
import './components/doap-db-viewer.js';
import './components/doap-curiosity.js';
import './components/doap-feature-map.js';
import './components/doap-browser.js';
// Settings (and its terminal) and Terminal view are lazy-loaded to avoid xterm/globals blocking app start

// Define the API interface as exposed by preload.js
interface Window {
    api: any;
    ollamaOnline: boolean;
    closeModal: () => void;
}

declare const window: Window & typeof globalThis;

// Simple Router
const routes: Record<string, (params: any) => string> = {
    home: () => '<doap-home></doap-home>',
    scrape: () => '<doap-scrape></doap-scrape>',
    history: () => '<doap-history></doap-history>',
    'db-viewer': () => '<doap-db-viewer></doap-db-viewer>',
    curiosity: () => '<doap-curiosity></doap-curiosity>',
    'feature-map': () => '<doap-feature-map></doap-feature-map>',
    terminal: () => '<doap-terminal-view></doap-terminal-view>',
    settings: () => '<doap-settings></doap-settings>',
    browser: (params: any) => `<doap-browser url="${params.url || ''}"></doap-browser>`
};

const appRoot = document.getElementById('app-root') as HTMLElement | null;
const navItems = document.querySelectorAll('.nav-item') as NodeListOf<HTMLElement>;
const globalSearchInput = document.getElementById('global-search-input') as HTMLInputElement | null;
const navDrawer = document.getElementById('nav-drawer') as HTMLElement | null;
const drawerOverlay = document.getElementById('drawer-overlay') as HTMLElement | null;
const closeDrawerBtn = document.getElementById('close-drawer') as HTMLElement | null;
const mainHeader = document.getElementById('main-header') as HTMLElement | null;
const globalDrawerToggle = document.getElementById('global-drawer-toggle') as HTMLElement | null;

function toggleDrawer(open: boolean) {
    if (!navDrawer || !drawerOverlay) return;
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

async function navigateTo(route: string, params: any = {}) {
    if (!appRoot || !routes[route]) return;

    // Close drawer on navigation
    toggleDrawer(false);

    // Lazy-load terminal/settings so xterm and globals don't block initial app load.
    // Use full URL for dynamic import so it works under Electron's file:// protocol.
    const baseUrl = new URL(import.meta.url).href.replace(/\/[^/]*$/, '/');
    try {
        if (route === 'terminal') {
            await import(/* @vite-ignore */ new URL('components/doap-terminal-view.js', baseUrl).href);
        }
        if (route === 'settings') {
            await import(/* @vite-ignore */ new URL('components/doap-settings.js', baseUrl).href);
        }
    } catch (err) {
        console.error('DOAP: Failed to load view', route, err);
        appRoot.innerHTML = `<div class="welcome-card" style="padding: 24px;"><p style="color: var(--text-secondary);">Failed to load ${route}. Check the console for details.</p></div>`;
        return;
    }

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
    if (mainHeader) {
        if (route === 'home') {
            mainHeader.classList.add('hidden');
        } else {
            mainHeader.classList.remove('hidden');
        }
    }
}

// Drawer Event Listeners
globalDrawerToggle?.addEventListener('click', () => toggleDrawer(true));
closeDrawerBtn?.addEventListener('click', () => toggleDrawer(false));
drawerOverlay?.addEventListener('click', () => toggleDrawer(false));

window.addEventListener('toggle-drawer', (e: any) => {
    toggleDrawer(e.detail.open);
});

// Global search handling
globalSearchInput?.addEventListener('keydown', (e: KeyboardEvent) => {
    if (e.key === 'Enter' && globalSearchInput) {
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
window.addEventListener('navigate', (e: any) => {
    if (e.detail && e.detail.view) {
        navigateTo(e.detail.view, e.detail);
    }
});

// Handle global generic modal
window.addEventListener('open-modal', (e: any) => {
    const modal = document.getElementById('content-modal') as HTMLElement;
    const titleEl = document.getElementById('modal-title') as HTMLElement;
    const bodyEl = document.getElementById('modal-body') as HTMLElement;

    if (e.detail) {
        titleEl.innerText = e.detail.title || 'Details';
        bodyEl.innerHTML = `<pre>${e.detail.content}</pre>`;
        modal.classList.remove('hidden');
    }
});

window.closeModal = () => {
    (document.getElementById('content-modal') as HTMLElement).classList.add('hidden');
};

// Handle global provider status updates
window.addEventListener('provider-status', (e: any) => {
    const dots = document.querySelectorAll('.status-indicator .dot, .ollama-status-dot') as NodeListOf<HTMLElement>;
    const texts = document.querySelectorAll('#provider-status, .ollama-status-text') as NodeListOf<HTMLElement>;
    
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

// Initial mount (guard so a missing app-root doesn't throw)
if (appRoot) {
    navigateTo('home');
} else {
    console.error('DOAP: #app-root not found. Check that index.html is loaded correctly.');
}
