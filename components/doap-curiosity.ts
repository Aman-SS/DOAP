import { BaseComponent } from './base.js';

export class DoapCuriosity extends BaseComponent {
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
                }
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
                .result-card {
                    background: var(--bg-card, rgba(30, 41, 59, 0.4));
                    border: 1px solid var(--border-color, rgba(255, 255, 255, 0.05));
                    border-radius: 12px;
                    padding: 24px;
                    margin-top: 20px;
                    font-size: 14px;
                    line-height: 1.6;
                }
                .error-card {
                    border-left: 4px solid #ef4444;
                    background: rgba(239, 68, 68, 0.1);
                }
                .loading-container {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    margin-top: 20px;
                }
                .resolution-link {
                    color: var(--accent-primary, #6366f1);
                    text-decoration: underline;
                    cursor: pointer;
                    font-weight: 600;
                }
                .resolution-link:hover {
                    color: var(--accent-hover, #4f46e5);
                }
            </style>
            
            <div class="welcome-card">
                <h3>Curiosity (RAG)</h3>
                <p>Ask questions about your scraped data using local AI.</p>
            </div>
            <div class="form-card">
                <div class="input-group">
                    <label for="curiosity-input">What would you like to know?</label>
                    <div class="input-with-action">
                        <input type="text" id="curiosity-input" placeholder="e.g. Summarize the latest scrapes...">
                        <button class="btn btn-primary" id="ask-curiosity-btn">Ask AI</button>
                    </div>
                </div>
            </div>
            
            <div id="curiosity-error" class="hidden result-card error-card"></div>
            
            <div id="curiosity-progress" class="hidden loading-container">
                <div class="spinner"></div>
                <p>Searching and thinking...</p>
            </div>
            <div id="curiosity-result" class="hidden result-card"></div>
        `);
    }

    connectedCallback(): void {
        const shadow = this.shadowRoot;
        if (!shadow) return;

        const askBtn = shadow.getElementById('ask-curiosity-btn') as HTMLButtonElement;
        const input = shadow.getElementById('curiosity-input') as HTMLInputElement;

        askBtn?.addEventListener('click', () => this.askAI());
        input?.addEventListener('keydown', (e: KeyboardEvent) => {
            if (e.key === 'Enter') this.askAI();
        });

        // Expose a way to be triggered globally (e.g. via "Plan with AI" action)
        window.addEventListener('ask-ai', (e: any) => {
            if (e.detail && e.detail.id) {
                this.handleScrapeSpecificAsk(e.detail.id);
            }
        });

        // Delegate clicks for resolution links
        shadow.getElementById('curiosity-error')?.addEventListener('click', (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (target.classList.contains('resolution-link')) {
                const view = target.dataset.view;
                if (view) {
                    window.dispatchEvent(new CustomEvent('navigate', {
                        detail: { view: view }
                    }));
                }
            }
        });
    }

    async handleScrapeSpecificAsk(scrapeId: number): Promise<void> {
        // As a bridge for the older 'Plan with AI' button which relied on window.prompt
        const promptText = window.prompt("What would you like to plan/do with this specific data?");
        if (!promptText) return;
        
        try {
            const result = await (window as any).api.askAI(scrapeId, promptText);
            if (result.success) {
                window.dispatchEvent(new CustomEvent('open-modal', {
                    detail: { title: "AI Response", content: result.response }
                }));
            } else {
                alert("AI Planning Failed: " + result.error);
            }
        } catch (e: any) {
            alert("Exception: " + e.message);
        }
    }

    async askAI(): Promise<void> {
        const shadow = this.shadowRoot;
        if (!shadow) return;

        const input = shadow.getElementById('curiosity-input') as HTMLInputElement;
        const askBtn = shadow.getElementById('ask-curiosity-btn') as HTMLButtonElement;
        const progress = shadow.getElementById('curiosity-progress') as HTMLElement;
        const resultDiv = shadow.getElementById('curiosity-result') as HTMLElement;
        const errorDiv = shadow.getElementById('curiosity-error') as HTMLElement;

        const query = input.value.trim();
        if (!query) return alert('Please enter a question');

        progress.classList.remove('hidden');
        resultDiv.classList.add('hidden');
        errorDiv.classList.add('hidden');
        askBtn.disabled = true;

        try {
            const result = await (window as any).api.askCuriosity(query);
            progress.classList.add('hidden');
            askBtn.disabled = false;

            if (result.success) {
                resultDiv.innerHTML = `
                    <div style="margin-bottom: 12px;"><strong>Answer:</strong></div>
                    <div style="white-space: pre-wrap; color: var(--text-primary);">${result.response}</div>
                    ${result.context && result.context.length > 0 ? `
                    <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid var(--border-color); font-size: 12px; color: var(--text-secondary);">
                        <strong>Sources Used:</strong><br>
                        ${result.context.map((c: any, i: number) => `<div style="margin-top: 4px;">[${i+1}] ${c.title || 'Source'}</div>`).join('')}
                    </div>` : ''}
                `;
                resultDiv.classList.remove('hidden');
            } else {
                this.showCuriosityError(result.error);
            }
        } catch (err: any) {
            progress.classList.add('hidden');
            askBtn.disabled = false;
            this.showCuriosityError(err.message);
        }
    }

    showCuriosityError(errorMsg: string): void {
        const shadow = this.shadowRoot;
        if (!shadow) return;

        const errorDiv = shadow.getElementById('curiosity-error') as HTMLElement;
        let title = "Failed to Generate Answer";
        let fixHtml = "";

        const lowerError = errorMsg.toLowerCase();

        if (lowerError.includes('econnrefused') || lowerError.includes('fetch') || lowerError.includes('network')) {
            title = "Ollama is Offline or Unreachable";
            fixHtml = `
                <ul style="margin-top: 8px; margin-left: 20px;">
                    <li>Ensure the Ollama application is currently running on your machine.</li>
                    <li>Go to the <span class="resolution-link" data-view="settings">Settings</span> tab and verify your API URL (usually <code>http://127.0.0.1:11434</code>).</li>
                    <li>Click <strong>Test Connection</strong> in Settings to verify connectivity.</li>
                    <li>If using WSL, you may need to use the Auto-find WSL button in Settings.</li>
                </ul>
            `;
        } else if (lowerError.includes('model') && lowerError.includes('not found')) {
            title = "Model Not Found";
            fixHtml = `
                <ul style="margin-top: 8px; margin-left: 20px;">
                    <li>The preferred model selected in your <span class="resolution-link" data-view="settings">Settings</span> is not installed.</li>
                    <li>Go to the <span class="resolution-link" data-view="settings">Settings</span> tab and pull the model (e.g., type <code>llama3</code> and click Pull Model).</li>
                    <li>Or, change your preferred model in the dropdown to one you already have downloaded.</li>
                </ul>
            `;
        } else {
            fixHtml = `
                <ul style="margin-top: 8px; margin-left: 20px;">
                    <li>Check the <span class="resolution-link" data-view="settings">Settings</span> tab to assure Ollama is fully connected.</li>
                    <li>Ensure you have scraped websites in the <span class="resolution-link" data-view="scrape">New Scrape</span> tab first. RAG needs data to search!</li>
                    <li>If the problem persists, try restarting the application or reloading Ollama.</li>
                </ul>
            `;
        }

        errorDiv.innerHTML = `
            <div style="display: flex; gap: 12px; align-items: flex-start;">
                <span class="material-symbols-rounded" style="color: #ef4444; font-size: 28px;">error</span>
                <div>
                    <h4 style="color: #ef4444; margin-bottom: 8px;">${title}</h4>
                    <p style="font-size: 13px; color: var(--text-secondary); margin-bottom: 12px;"><strong>Error details:</strong> ${errorMsg}</p>
                    <div style="font-size: 13px; color: var(--text-primary);">
                        <strong>How to fix this:</strong>
                        ${fixHtml}
                    </div>
                </div>
            </div>
        `;
        errorDiv.classList.remove('hidden');
    }
}

customElements.define('doap-curiosity', DoapCuriosity);
