import { BaseComponent } from './base.js';

export class DoapHome extends BaseComponent {
    constructor() {
        super();
        this.render(`
            <style>
                .material-symbols-rounded {
                    font-family: 'Material Symbols Rounded';
                    font-weight: normal;
                    font-style: normal;
                    font-size: 24px;
                    line-height: 1;
                    display: inline-block;
                    text-transform: none;
                    letter-spacing: normal;
                    word-wrap: normal;
                    white-space: nowrap;
                    direction: ltr;
                    -webkit-font-smoothing: antialiased;
                    -moz-osx-font-smoothing: grayscale;
                    text-rendering: optimizeLegibility;
                    font-feature-settings: 'liga';
                    user-select: none;
                }
                .search-hub {
                    position: relative;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    min-height: calc(100vh - 200px);
                    padding: 0 20px;
                }
                .dashboard-toggle {
                    position: absolute;
                    top: 24px;
                    right: 24px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    color: var(--text-secondary);
                    background: none;
                    border: none;
                    transition: color 0.2s, transform 0.2s;
                    z-index: 10;
                }
                .dashboard-toggle .material-symbols-rounded {
                    font-size: 32px;
                }
                .dashboard-toggle:hover {
                    color: white;
                    transform: scale(1.1);
                }
                .search-container {
                    width: 100%;
                    max-width: 680px;
                    text-align: center;
                }
                .hub-logo {
                    font-size: 48px;
                    font-weight: 800;
                    margin-bottom: 24px;
                    background: linear-gradient(135deg, var(--accent-color), #818cf8);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }
                .hub-input-group {
                    position: relative;
                    margin-bottom: 40px;
                }
                .hub-input-group input {
                    width: 100%;
                    padding: 20px 32px;
                    background: rgba(30, 41, 59, 0.6);
                    border: 1px solid var(--border-color);
                    border-radius: 100px;
                    color: white;
                    font-size: 18px;
                    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3);
                    outline: none;
                    transition: all 0.3s ease;
                }
                .hub-input-group input:focus {
                    border-color: var(--accent-color);
                    box-shadow: 0 0 0 4px rgba(56, 189, 248, 0.15);
                    background: rgba(30, 41, 59, 0.8);
                }
                .quick-links {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
                    gap: 16px;
                    width: 100%;
                    max-width: 600px;
                }
                .quick-card {
                    background: var(--card-bg);
                    border: 1px solid var(--border-color);
                    padding: 20px 16px;
                    border-radius: 12px;
                    cursor: pointer;
                    transition: all 0.2s;
                    text-align: center;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                }
                .quick-card:hover {
                    border-color: var(--accent-color);
                    transform: translateY(-2px);
                    background: rgba(255, 255, 255, 0.05);
                }
                .quick-card .material-symbols-rounded {
                    font-size: 32px;
                    margin-bottom: 12px;
                    color: var(--accent-color);
                }
                .quick-card span {
                    font-size: 13px;
                    font-weight: 600;
                    color: var(--text-secondary);
                }
            </style>
            
            <div class="search-hub">
                <button class="dashboard-toggle" id="hub-drawer-toggle" title="Menu">
                    <span class="material-symbols-rounded">menu</span>
                </button>
                <div class="search-container">
                    <h1 class="hub-logo">DOAP</h1>
                    <div class="hub-input-group">
                        <input type="text" id="hub-search-input" placeholder="What can I help you find? Enter URL or ask anything...">
                    </div>
                </div>
                
                <div class="quick-links">
                    <div class="quick-card status-card" data-view="settings" id="ollama-card">
                        <div class="status-indicator-mini">
                            <span class="ollama-status-dot"></span>
                        </div>
                        <span class="material-symbols-rounded">smart_toy</span>
                        <span class="card-label">Ollama Service</span>
                        <span class="ollama-status-text">Checking...</span>
                    </div>
                    <div class="quick-card" data-view="history">
                        <span class="material-symbols-rounded">history</span>
                        <span>Recent Scrapes</span>
                    </div>
                    <div class="quick-card" data-view="curiosity">
                        <span class="material-symbols-rounded">psychology</span>
                        <span>Ask AI</span>
                    </div>
                    <div class="quick-card" data-view="feature-map">
                        <span class="material-symbols-rounded">hub</span>
                        <span>System Map</span>
                    </div>
                    <div class="quick-card" data-view="settings">
                        <span class="material-symbols-rounded">settings</span>
                        <span>Settings</span>
                    </div>
                </div>
            </div>

            <style>
                .status-card {
                    position: relative;
                    border-color: rgba(148, 163, 184, 0.2);
                }
                .status-indicator-mini {
                    position: absolute;
                    top: 12px;
                    right: 12px;
                }
                .ollama-status-dot {
                    display: block;
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                    background: #94a3b8;
                    box-shadow: 0 0 0 3px rgba(148, 163, 184, 0.1);
                    transition: all 0.3s ease;
                }
                .ollama-status-dot.connected {
                    background: #10b981;
                    box-shadow: 0 0 8px #10b981, 0 0 0 3px rgba(16, 185, 129, 0.2);
                }
                .ollama-status-text {
                    font-size: 11px !important;
                    margin-top: 4px;
                    color: var(--text-secondary);
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                .card-label {
                    font-size: 13px;
                    font-weight: 600;
                    margin-bottom: 2px;
                }
            </style>
        `);
    }

    connectedCallback(): void {
        const shadow = this.shadowRoot;
        if (!shadow) return;

        const input = shadow.getElementById('hub-search-input') as HTMLInputElement;
        input.addEventListener('keydown', (e: KeyboardEvent) => {
            if (e.key === 'Enter') {
                const query = input.value.trim();
                if (query) {
                    window.dispatchEvent(new CustomEvent('navigate', {
                        detail: { view: 'browser', url: query }
                    }));
                }
            }
        });

        shadow.querySelectorAll('.quick-card').forEach(card => {
            card.addEventListener('click', () => {
                const view = (card as HTMLElement).dataset.view;
                window.dispatchEvent(new CustomEvent('navigate', {
                    detail: { view: view }
                }));
            });
        });

        // Initialize status from global state if available
        if (typeof (window as any).ollamaOnline !== 'undefined') {
            const dot = shadow.querySelector('.ollama-status-dot');
            const text = shadow.querySelector('.ollama-status-text') as HTMLElement;
            if (dot && text) {
                if ((window as any).ollamaOnline) dot.classList.add('connected');
                text.innerText = (window as any).ollamaOnline ? 'Online' : 'Offline';
            }
        }

        shadow.getElementById('hub-drawer-toggle')?.addEventListener('click', () => {
            window.dispatchEvent(new CustomEvent('toggle-drawer', { detail: { open: true } }));
        });
    }

    disconnectedCallback(): void {
        // Show global search when leaving home
        const globalSearch = document.getElementById('global-search-container');
        if (globalSearch) globalSearch.classList.remove('hidden');
    }
}

customElements.define('doap-home', DoapHome);
