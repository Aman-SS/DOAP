import { BaseComponent } from '../base.js';

export class OllamaConfig extends BaseComponent {
    constructor() {
        super();
        this.preferredModel = 'llama3';
    }

    async connectedCallback() {
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

    setupEventListeners() {
        this.shadowRoot.getElementById('save-btn').addEventListener('click', () => this.save());
        this.shadowRoot.getElementById('test-btn').addEventListener('click', () => this.test());
        this.shadowRoot.getElementById('find-wsl-btn').addEventListener('click', () => this.findWsl());
        
        window.addEventListener('ollama-service-updated', () => this.checkStatus());
        window.addEventListener('ollama-models-refreshed', (e) => this.updateModelsDropdown(e.detail.models));
    }

    async loadSettings() {
        if (!window.api) return;
        const url = await window.api.getSetting('ollama_url');
        const model = await window.api.getSetting('ollama_model');
        if (url) this.shadowRoot.getElementById('url-input').value = url;
        if (model) {
            this.preferredModel = model;
            this.shadowRoot.getElementById('model-select').value = model;
        }
    }

    async checkStatus() {
        if (!window.api) return;
        const statusEl = this.shadowRoot.getElementById('api-status');
        try {
            const result = await window.api.checkOllama();
            this.updateStatusUI(statusEl, result.online ? 'Connected' : 'Offline', result.online);
            if (result.online && result.models) {
                this.updateModelsDropdown(result.models);
            }
        } catch (e) {
            this.updateStatusUI(statusEl, 'Offline', false);
        }
    }

    updateStatusUI(el, text, online) {
        if (!el) return;
        el.innerText = text;
        el.className = `status-badge ${online ? 'online' : 'offline'}`;
    }

    updateModelsDropdown(models) {
        const select = this.shadowRoot.getElementById('model-select');
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

    async test() {
        const btn = this.shadowRoot.getElementById('test-btn');
        const url = this.shadowRoot.getElementById('url-input').value.trim();
        btn.innerText = 'Testing...';
        await window.api.updateSetting('ollama_url', url);
        const status = await window.api.checkOllama();
        btn.innerText = 'Test Connection';
        
        if (status.online) {
            alert('Success! Ollama is reachable.');
            this.checkStatus();
        } else {
            alert('Failed to connect. Please check the URL and ensure Ollama is running.');
            this.checkStatus();
        }
    }

    async findWsl() {
        const btn = this.shadowRoot.getElementById('find-wsl-btn');
        btn.disabled = true;
        btn.innerText = 'Finding...';
        const result = await window.api.getWslIp();
        btn.disabled = false;
        btn.innerText = 'Auto-find WSL';
        if (result.success && result.ip) {
            this.shadowRoot.getElementById('url-input').value = `http://${result.ip}:11434`;
        }
    }

    async save() {
        const url = this.shadowRoot.getElementById('url-input').value.trim();
        const model = this.shadowRoot.getElementById('model-select').value;
        if (!url) return alert('Please enter a URL');
        
        await window.api.updateSetting('ollama_url', url);
        await window.api.updateSetting('ollama_model', model);
        
        alert('Settings saved successfully!');
        this.checkStatus();
        window.dispatchEvent(new Event('settings-updated'));
    }
}

customElements.define('ollama-config', OllamaConfig);
