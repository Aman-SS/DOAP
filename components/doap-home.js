import { BaseComponent } from './base.js';

export class DoapHome extends BaseComponent {
    constructor() {
        super();
        this.render(`
            <style>
                .search-hub {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    min-height: calc(100vh - 200px);
                    padding: 0 20px;
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
                    padding: 16px;
                    border-radius: 12px;
                    cursor: pointer;
                    transition: all 0.2s;
                    text-align: center;
                }
                .quick-card:hover {
                    border-color: var(--accent-color);
                    transform: translateY(-2px);
                    background: rgba(255, 255, 255, 0.05);
                }
                .quick-card i {
                    font-size: 24px;
                    display: block;
                    margin-bottom: 8px;
                }
                .quick-card span {
                    font-size: 13px;
                    font-weight: 600;
                    color: var(--text-secondary);
                }
            </style>
            
            <div class="search-hub">
                <div class="search-container">
                    <h1 class="hub-logo">DOAP</h1>
                    <div class="hub-input-group">
                        <input type="text" id="hub-search-input" placeholder="What can I help you find? Enter URL or ask anything...">
                    </div>
                </div>
                
                <div class="quick-links">
                    <div class="quick-card" data-view="history">
                        <i>📜</i>
                        <span>Recent Scrapes</span>
                    </div>
                    <div class="quick-card" data-view="curiosity">
                        <i>🤖</i>
                        <span>Ask AI</span>
                    </div>
                    <div class="quick-card" data-view="feature-map">
                        <i>🗺️</i>
                        <span>System Map</span>
                    </div>
                    <div class="quick-card" data-view="settings">
                        <i>⚙️</i>
                        <span>Settings</span>
                    </div>
                </div>
            </div>
        `);
    }

    connectedCallback() {
        const input = this.shadowRoot.getElementById('hub-search-input');
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const query = input.value.trim();
                if (query) {
                    window.dispatchEvent(new CustomEvent('navigate', {
                        detail: { view: 'browser', url: query }
                    }));
                }
            }
        });

        this.shadowRoot.querySelectorAll('.quick-card').forEach(card => {
            card.addEventListener('click', () => {
                const view = card.dataset.view;
                window.dispatchEvent(new CustomEvent('navigate', {
                    detail: { view: view }
                }));
            });
        });

        // Hide global search when on home
        const globalSearch = document.getElementById('global-search-container');
        if (globalSearch) globalSearch.classList.add('hidden');
    }

    disconnectedCallback() {
        // Show global search when leaving home
        const globalSearch = document.getElementById('global-search-container');
        if (globalSearch) globalSearch.classList.remove('hidden');
    }
}

customElements.define('doap-home', DoapHome);
