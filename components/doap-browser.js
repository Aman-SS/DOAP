import { BaseComponent } from './base.js';

export class DoapBrowser extends BaseComponent {
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
                .browser-view {
                    display: flex;
                    flex-direction: column;
                    height: 100%;
                    background: #f8fafc;
                }
                .browser-toolbar {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 8px 16px;
                    background: var(--card-bg);
                    border-bottom: 1px solid var(--border-color);
                }
                .nav-controls {
                    display: flex;
                    gap: 4px;
                }
                .toolbar-btn {
                    background: transparent;
                    border: none;
                    color: var(--text-secondary);
                    width: 36px;
                    height: 36px;
                    border-radius: 50%;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s;
                }
                .toolbar-btn:hover:not(:disabled) {
                    background: rgba(255, 255, 255, 0.1);
                    color: white;
                }
                .toolbar-btn:disabled {
                    opacity: 0.3;
                    cursor: not-allowed;
                }
                .toolbar-btn .material-symbols-rounded {
                    font-size: 20px;
                }
                .address-bar-container {
                    flex: 1;
                    position: relative;
                    display: flex;
                    align-items: center;
                }
                .address-bar-container .material-symbols-rounded {
                    position: absolute;
                    left: 12px;
                    font-size: 18px;
                    color: var(--text-secondary);
                    pointer-events: none;
                }
                .address-bar {
                    width: 100%;
                    background: rgba(15, 23, 42, 0.6);
                    border: 1px solid var(--border-color);
                    padding: 8px 12px 8px 38px;
                    border-radius: 8px;
                    color: var(--text-primary);
                    font-size: 14px;
                    outline: none;
                }
                .browser-actions {
                    display: flex;
                    gap: 8px;
                }
                .action-pill {
                    padding: 6px 12px;
                    background: var(--accent-primary, #6366f1);
                    color: white;
                    border-radius: 20px;
                    font-size: 11px;
                    font-weight: 700;
                    cursor: pointer;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    border: none;
                    transition: all 0.2s;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }
                .action-pill:hover {
                    background: var(--accent-hover, #4f46e5);
                    transform: translateY(-1px);
                }
                .action-pill.secondary {
                    background: rgba(255, 255, 255, 0.1);
                }
                .action-pill.secondary:hover {
                    background: rgba(255, 255, 255, 0.2);
                }
                .webview-container {
                    flex: 1;
                    position: relative;
                    background: white;
                }
                webview {
                    width: 100%;
                    height: 100%;
                    background: white;
                }
                .loading-overlay {
                    position: absolute;
                    top: 0;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    background: rgba(15, 23, 42, 0.5);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 10;
                }
                .spinner {
                    width: 40px;
                    height: 40px;
                    border: 4px solid rgba(255, 255, 255, 0.1);
                    border-top-color: var(--accent-primary, #6366f1);
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                }
                @keyframes spin { 100% { transform: rotate(360deg); } }
            </style>
            <div class="browser-view">
                <div class="browser-toolbar">
                    <div class="nav-controls">
                        <button class="toolbar-btn" id="back-btn" title="Back" disabled>
                            <span class="material-symbols-rounded">arrow_back</span>
                        </button>
                        <button class="toolbar-btn" id="forward-btn" title="Forward" disabled>
                            <span class="material-symbols-rounded">arrow_forward</span>
                        </button>
                        <button class="toolbar-btn" id="reload-btn" title="Reload">
                            <span class="material-symbols-rounded">refresh</span>
                        </button>
                    </div>
                    <div class="address-bar-container">
                        <span class="material-symbols-rounded">language</span>
                        <input type="text" class="address-bar" id="url-input" placeholder="Search or type URL...">
                    </div>
                    <div class="browser-actions">
                        <button class="action-pill" id="scrape-page-btn">
                            <span class="material-symbols-rounded" style="font-size: 16px;">content_copy</span>
                            Scrape Context
                        </button>
                        <button class="action-pill secondary" id="ai-analyze-btn">
                            <span class="material-symbols-rounded" style="font-size: 16px;">auto_awesome</span>
                            Summarize
                        </button>
                    </div>
                </div>
                <div class="webview-container">
                    <div id="loading-overlay" class="loading-overlay hidden">
                        <div class="spinner"></div>
                    </div>
                    <webview id="browser-webview" src="about:blank" autosize="on"></webview>
                </div>
            </div>
        `);
    }

    connectedCallback() {
        this.webview = this.shadowRoot.getElementById('browser-webview');
        this.urlInput = this.shadowRoot.getElementById('url-input');
        this.backBtn = this.shadowRoot.getElementById('back-btn');
        this.forwardBtn = this.shadowRoot.getElementById('forward-btn');
        this.reloadBtn = this.shadowRoot.getElementById('reload-btn');
        this.loadingOverlay = this.shadowRoot.getElementById('loading-overlay');
        this.scrapeBtn = this.shadowRoot.getElementById('scrape-page-btn');
        this.aiBtn = this.shadowRoot.getElementById('ai-analyze-btn');

        const updateNavButtons = () => {
            if (this.webview) {
                this.backBtn.disabled = !this.webview.canGoBack();
                this.forwardBtn.disabled = !this.webview.canGoForward();
            }
        };

        this.backBtn.addEventListener('click', () => {
            if (this.webview && this.webview.canGoBack()) {
                this.webview.goBack();
            }
        });

        this.forwardBtn.addEventListener('click', () => {
            if (this.webview && this.webview.canGoForward()) {
                this.webview.goForward();
            }
        });

        this.reloadBtn.addEventListener('click', () => {
            if (this.webview) {
                this.webview.reload();
            }
        });

        this.urlInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const query = this.urlInput.value.trim();
                const finalUrl = this.normalizeUrl(query);
                this.webview.loadURL(finalUrl);
            }
        });

        this.webview.addEventListener('did-start-loading', () => {
            this.loadingOverlay.classList.remove('hidden');
        });

        const handleStopLoading = () => {
            this.loadingOverlay.classList.add('hidden');
            this.urlInput.value = this.webview.getURL();
            updateNavButtons();
        };

        this.webview.addEventListener('did-stop-loading', handleStopLoading);
        this.webview.addEventListener('did-navigate', updateNavButtons);
        this.webview.addEventListener('did-navigate-in-page', updateNavButtons);

        this.scrapeBtn.addEventListener('click', () => this.handleBrowserScrape());
        this.aiBtn.addEventListener('click', () => this.handleBrowserAI());

        // Initial load if passed via attribute
        const initialUrl = this.getAttribute('url');
        if (initialUrl && initialUrl !== 'about:blank') {
            this.urlInput.value = initialUrl;
            this.webview.addEventListener('dom-ready', () => {
                this.webview.loadURL(this.normalizeUrl(initialUrl));
            }, { once: true });
        }
    }

    normalizeUrl(url) {
        url = url.trim();
        if (!url) return 'about:blank';
        if (url.startsWith('http://') || url.startsWith('https://')) {
            return url;
        }
        if (url.includes('.') && !url.includes(' ')) {
            return 'https://' + url;
        }
        return 'https://www.google.com/search?q=' + encodeURIComponent(url);
    }

    async handleBrowserScrape() {
        const url = this.webview.getURL();
        if (url === 'about:blank') return;

        try {
            // We can even try to extract content directly via executeJavaScript
            const content = await this.webview.executeJavaScript('document.body.innerText');
            const title = await this.webview.executeJavaScript('document.title');
            
            // Call the same save-scrape logic via IPC
            const result = await window.api.saveScrape({
                url,
                title,
                content,
                selector: 'body'
            });

            if (result.success) {
                alert('Page scraped and saved to history!');
            } else {
                alert('Scrape failed: ' + result.error);
            }
        } catch (e) {
            alert('Error scraping: ' + e.message);
        }
    }

    async handleBrowserAI() {
        const url = this.webview.getURL();
        if (url === 'about:blank') return;
        
        try {
            const content = await this.webview.executeJavaScript('document.body.innerText');
            const result = await window.api.askAI({
                scrapeId: null, // Temporary/Current session
                prompt: `I am currently viewing this page: ${url}. Please summarize the main points of this content: ${content.substring(0, 10000)}`
            });

            if (result.success) {
                window.dispatchEvent(new CustomEvent('open-modal', {
                    detail: { title: "AI Analysis", content: result.response }
                }));
            } else {
                alert("AI Analysis Failed: " + result.error);
            }
        } catch (e) {
            alert("Error: " + e.message);
        }
    }
}

customElements.define('doap-browser', DoapBrowser);
