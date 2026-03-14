import { BaseComponent } from './base.js';

export class DoapScrape extends BaseComponent {
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
                .spinner {
                    width: 24px;
                    height: 24px;
                    border: 3px solid rgba(255, 255, 255, 0.1);
                    border-radius: 50%;
                    border-top-color: var(--accent-primary, #6366f1);
                    animation: spin 1s ease-in-out infinite;
                    margin: 0 auto 12px auto;
                }

                @keyframes spin {
                    to { transform: rotate(360deg); }
                }

                #scrape-progress {
                    text-align: center;
                    padding: 40px;
                    background: var(--bg-card, rgba(30, 41, 59, 0.4));
                    border-radius: 12px;
                    margin-top: 20px;
                }

                .result-card {
                    background: var(--bg-card, rgba(30, 41, 59, 0.4));
                    border: 1px solid var(--border-color, rgba(255, 255, 255, 0.05));
                    border-radius: 12px;
                    padding: 24px;
                    margin-top: 20px;
                }

                .success-header h4 {
                    color: #10b981;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .result-content {
                    background: rgba(15, 23, 42, 0.6);
                    padding: 16px;
                    border-radius: 8px;
                    margin: 16px 0;
                    font-size: 13px;
                    color: var(--text-secondary, #94a3b8);
                    max-height: 200px;
                    overflow-y: auto;
                    white-space: pre-wrap;
                }

                .warning-box {
                    color: #f59e0b;
                    background: rgba(245, 158, 11, 0.1);
                    padding: 12px;
                    border-radius: 6px;
                    border-left: 3px solid #f59e0b;
                }

                .preview-actions, .ai-actions {
                    display: flex;
                    gap: 12px;
                }
            </style>
            
            <div class="form-card">
                <h3>Start New Scrape</h3>
                <div class="input-group">
                    <label for="url-input">Website URL</label>
                    <input type="text" id="url-input" placeholder="https://example.com">
                </div>
                <div class="input-group">
                    <label for="selector-input">Target (Optional, leave empty for auto-readability)</label>
                    <input type="text" id="selector-input" placeholder="main content, .article, etc">
                </div>
                <button class="btn btn-primary" id="start-scrape-btn">Crawl & Extract</button>
            </div>
            
            <div id="scrape-progress" class="hidden">
                <div class="spinner"></div>
                <p>Crawling content...</p>
            </div>
            
            <div id="scrape-result" class="hidden result-card">
                <!-- Result injected here -->
            </div>
        `);
    }

    connectedCallback(): void {
        this.shadowRoot?.getElementById('start-scrape-btn')?.addEventListener('click', () => this.startScrape());
    }

    async startScrape(): Promise<void> {
        const shadow = this.shadowRoot;
        if (!shadow) return;

        const urlInput = shadow.getElementById('url-input') as HTMLInputElement;
        const selectorInput = shadow.getElementById('selector-input') as HTMLInputElement;
        const scrapeResult = shadow.getElementById('scrape-result') as HTMLElement;
        
        const url = urlInput.value.trim();
        if (!url) return alert('Please enter a URL');

        const selector = selectorInput.value.trim() || null;

        this.showProgress(true);
        scrapeResult.classList.add('hidden');

        try {
            const result = await (window as any).api.scrapeUrl(url, selector);
            this.showProgress(false);

            if (result.success) {
                const isEmpty = !result.content || result.content.trim().length === 0;
                const contentPreview = isEmpty 
                    ? '<div class="warning-box"><span class="material-symbols-rounded" style="vertical-align: middle; margin-right: 8px;">warning</span><strong>Warning:</strong> No content was extracted. Check your URL or selector.</div>'
                    : `<p>${result.content.substring(0, 500)}${result.content.length > 500 ? '...' : ''}</p>`;

                scrapeResult.innerHTML = `
                    <div class="success-header">
                        <h4><span class="material-symbols-rounded">article</span> Scrape Result: ${result.title || 'Untitled'}</h4>
                    </div>
                    <div class="result-content">
                        ${contentPreview}
                    </div>
                    <div class="preview-actions">
                        <button class="btn btn-primary" id="save-btn"><span class="material-symbols-rounded">save</span> Save to Database</button>
                        <button class="btn btn-secondary" id="discard-btn"><span class="material-symbols-rounded">delete</span> Discard</button>
                    </div>
                `;
                
                shadow.getElementById('save-btn')?.addEventListener('click', () => this.saveScrapeResult(result));
                shadow.getElementById('discard-btn')?.addEventListener('click', () => this.discardScrape());
                
                scrapeResult.classList.remove('hidden');
            } else {
                alert('Error: ' + result.error);
            }
        } catch (err: any) {
            this.showProgress(false);
            alert('Failed to scrape: ' + err.message);
        }
    }

    showProgress(show: boolean): void {
        const shadow = this.shadowRoot;
        if (!shadow) return;
        shadow.getElementById('scrape-progress')?.classList.toggle('hidden', !show);
        const startBtn = shadow.getElementById('start-scrape-btn') as HTMLButtonElement;
        if (startBtn) startBtn.disabled = show;
    }

    async saveScrapeResult(data: any): Promise<void> {
        const shadow = this.shadowRoot;
        if (!shadow) return;

        const saveBtn = shadow.getElementById('save-btn') as HTMLButtonElement;
        const scrapeResult = shadow.getElementById('scrape-result') as HTMLElement;
        
        if (saveBtn) {
            saveBtn.disabled = true;
            saveBtn.innerHTML = '<span class="material-symbols-rounded">sync</span> Saving...';
        }

        const saveResult = await (window as any).api.saveScrape(data);
        if (saveResult.success) {
            scrapeResult.innerHTML = `
                <div class="success-header">
                    <h4><span class="material-symbols-rounded" style="color: #10b981;">check_circle</span> Data Saved Successfully! (ID: ${saveResult.id})</h4>
                </div>
                <div class="ai-actions" style="margin-top: 20px;">
                    <button class="btn btn-primary" id="ask-ai-btn"><span class="material-symbols-rounded">psychology</span> Plan with AI</button>
                    <button class="btn btn-secondary" id="back-btn"><span class="material-symbols-rounded">arrow_back</span> Back to Scraper</button>
                </div>
            `;
            
            shadow.getElementById('ask-ai-btn')?.addEventListener('click', () => {
                // Trigger global ask ai logic
                window.dispatchEvent(new CustomEvent('ask-ai', { detail: { id: saveResult.id } }));
            });
            
            shadow.getElementById('back-btn')?.addEventListener('click', () => this.discardScrape());

            // Notify sibling components (like home stats or history list) that DB changed
            window.dispatchEvent(new Event('history-updated'));
        } else {
            alert('Failed to save: ' + saveResult.error);
            if (saveBtn) {
                saveBtn.disabled = false;
                saveBtn.innerText = 'Save to Database';
            }
        }
    }

    discardScrape(): void {
        const shadow = this.shadowRoot;
        if (!shadow) return;
        shadow.getElementById('scrape-result')?.classList.add('hidden');
        (shadow.getElementById('url-input') as HTMLInputElement).value = '';
        (shadow.getElementById('selector-input') as HTMLInputElement).value = '';
    }
}

customElements.define('doap-scrape', DoapScrape);
