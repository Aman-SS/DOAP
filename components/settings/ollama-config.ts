import { BaseComponent } from '../base.js';

export class OllamaConfig extends BaseComponent {
    private preferredModel: string = 'llama3';

    constructor() {
        super();
    }

    async connectedCallback(): Promise<void> {
        this.render(`
            <div class="form-card settings-section">
                <div class="section-header">
                    <div class="provider-info">
                        <img src="https://ollama.com/public/ollama.png" alt="Ollama" style="width: 24px; height: 24px; border-radius: 4px;" onerror="this.style.display='none'">
                        <h4>API Configuration</h4>
                    </div>
                    <div id="api-status" class="status-badge offline">Offline</div>
                </div>
                <div class="input-group">
                    <label>API Server URL</label>
                    <div class="input-with-action">
                        <input type="text" id="url-input" placeholder="http://127.0.0.1:11434">
                        <button class="btn btn-secondary btn-sm" id="find-wsl-btn">Auto-find WSL</button>
                        <button class="btn btn-secondary btn-sm" id="test-btn">Test Connection</button>
                    </div>
                </div>
                <div class="input-group">
                    <label>Preferred Model</label>
                    <select id="model-select" class="btn btn-secondary" style="width: 100%; text-align: left;">
                        <option value="llama3">llama3 (Default)</option>
                    </select>
                </div>
                <button class="btn btn-primary" id="save-btn" style="width: 100%;">
                    <span class="material-symbols-rounded">save</span> Save Configuration
                </button>
            </div>
        `);

        this.setupEventListeners();
        await this.loadSettings();
        this.checkStatus();
    }

    private setupEventListeners(): void {
        const shadow = this.shadowRoot;
        if (!shadow) return;

        shadow.getElementById('save-btn')?.addEventListener('click', () => this.save());
        shadow.getElementById('test-btn')?.addEventListener('click', () => this.test());
        shadow.getElementById('find-wsl-btn')?.addEventListener('click', () => this.findWsl());
        
        window.addEventListener('ollama-service-updated', () => this.checkStatus());
        window.addEventListener('ollama-models-refreshed', (e: any) => this.updateModelsDropdown(e.detail.models));
    }

    async loadSettings(): Promise<void> {
        if (!(window as any).api) return;
        const shadow = this.shadowRoot;
        if (!shadow) return;

        const url = await (window as any).api.getSetting('ollama_url');
        const model = await (window as any).api.getSetting('ollama_model');
        const urlInput = shadow.getElementById('url-input') as HTMLInputElement;
        const modelSelect = shadow.getElementById('model-select') as HTMLSelectElement;

        if (url && urlInput) urlInput.value = url;
        if (model) {
            this.preferredModel = model;
            if (modelSelect) modelSelect.value = model;
        }
    }

    async checkStatus(): Promise<void> {
        if (!(window as any).api) return;
        const statusEl = this.shadowRoot?.getElementById('api-status');
        if (!statusEl) return;

        try {
            const result = await (window as any).api.checkOllama();
            this.updateStatusUI(statusEl, result.online ? 'Connected' : 'Offline', result.online);
            if (result.online && result.models) {
                this.updateModelsDropdown(result.models);
            }
        } catch (e) {
            this.updateStatusUI(statusEl, 'Offline', false);
        }
    }

    private updateStatusUI(el: HTMLElement, text: string, online: boolean): void {
        el.innerText = text;
        el.className = `status-badge ${online ? 'online' : 'offline'}`;
    }

    private updateModelsDropdown(models: any[]): void {
        const select = this.shadowRoot?.getElementById('model-select') as HTMLSelectElement;
        if (!select || !models) return;
        
        // Store current value to re-select it
        const currentVal = select.value || this.preferredModel;
        
        if (models.length === 0) {
            select.innerHTML = '<option value="">No models found</option>';
            return;
        }

        // Generate options: exact match or contains (to handle :latest tags)
        select.innerHTML = models.map(m => {
            const isSelected = m.name === currentVal || (m.name.split(':')[0] === currentVal);
            return `<option value="${m.name}" ${isSelected ? 'selected' : ''}>${m.name}</option>`;
        }).join('');

        // If something was selected, update this.preferredModel
        if (select.value) {
            this.preferredModel = select.value;
        }
    }

    async test(): Promise<void> {
        const shadow = this.shadowRoot;
        if (!shadow) return;

        const btn = shadow.getElementById('test-btn') as HTMLElement;
        const urlInput = shadow.getElementById('url-input') as HTMLInputElement;
        const url = urlInput.value.trim();

        const originalText = btn.innerText;
        btn.innerText = 'Testing...';
        await (window as any).api.updateSetting('ollama_url', url);
        const status = await (window as any).api.checkOllama();
        btn.innerText = originalText;
        
        if (status.online) {
            alert('Success! Ollama is reachable.');
            this.checkStatus();
        } else {
            alert('Failed to connect. Please check the URL and ensure Ollama is running.');
            this.checkStatus();
        }
    }

    async findWsl(): Promise<void> {
        const shadow = this.shadowRoot;
        if (!shadow) return;

        const btn = shadow.getElementById('find-wsl-btn') as HTMLButtonElement;
        btn.disabled = true;
        const originalText = btn.innerText;
        btn.innerText = 'Finding...';
        const result = await (window as any).api.getWslIp();
        btn.disabled = false;
        btn.innerText = originalText;
        if (result.success && result.ip) {
            const urlInput = shadow.getElementById('url-input') as HTMLInputElement;
            if (urlInput) urlInput.value = `http://${result.ip}:11434`;
        }
    }

    async save(): Promise<void> {
        const shadow = this.shadowRoot;
        if (!shadow) return;

        const urlInput = shadow.getElementById('url-input') as HTMLInputElement;
        const modelSelect = shadow.getElementById('model-select') as HTMLSelectElement;
        const url = urlInput.value.trim();
        const model = modelSelect.value;

        if (!url) return alert('Please enter a URL');
        
        await (window as any).api.updateSetting('ollama_url', url);
        await (window as any).api.updateSetting('ollama_model', model);
        
        alert('Settings saved successfully!');
        this.checkStatus();
        window.dispatchEvent(new Event('settings-updated'));
    }
}

customElements.define('ollama-config', OllamaConfig);
