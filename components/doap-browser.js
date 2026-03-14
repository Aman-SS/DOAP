import { BaseComponent } from './base.js';

export class DoapBrowser extends BaseComponent {
    constructor() {
        super();
        this.render(`
            <style>
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
                    background: var(--sidebar-bg, #1e293b);
                    border-bottom: 1px solid var(--border-color, #334155);
                    color: white;
                }
                .browser-nav-btns {
                    display: flex;
                    gap: 8px;
                }
                .nav-btn {
                    background: rgba(255, 255, 255, 0.1);
                    border: none;
                    color: white;
                    width: 32px;
                    height: 32px;
                    border-radius: 6px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 18px;
                }
                .nav-btn:hover {
                    background: rgba(255, 255, 255, 0.2);
                }
                .browser-address-bar {
                    flex: 1;
                    position: relative;
                }
                .browser-address-bar input {
                    width: 100%;
                    background: rgba(15, 23, 42, 0.6);
                    border: 1px solid var(--border-color, #334155);
                    padding: 8px 12px;
                    border-radius: 6px;
                    color: white;
                    font-size: 13px;
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
                    <div class="browser-nav-btns">
                        <button class="nav-btn" id="back-btn" title="Back">←</button>
                        <button class="nav-btn" id="forward-btn" title="Forward">→</button>
                        <button class="nav-btn" id="reload-btn" title="Reload">↻</button>
                    </div>
                    <div class="browser-address-bar">
                        <input type="text" id="url-input" placeholder="Search or type URL...">
                    </div>
                    <div class="browser-actions">
                        <button class="action-pill" id="scrape-page-btn">Scrape Context</button>
                        <button class="action-pill secondary" id="ai-analyze-btn">Summarize</button>
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

        this.backBtn.addEventListener('click', () => this.webview.canGoBack() && this.webview.goBack());
        this.forwardBtn.addEventListener('click', () => this.webview.canGoForward() && this.webview.goForward());
        this.reloadBtn.addEventListener('click', () => this.webview.reload());

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

        this.webview.addEventListener('did-stop-loading', () => {
            this.loadingOverlay.classList.add('hidden');
            this.urlInput.value = this.webview.getURL();
        });

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
