import { BaseComponent } from '../base.js';

export class OllamaService extends BaseComponent {
    constructor() {
        super();
    }

    connectedCallback() {
        this.render(`
            <div class="form-card settings-section">
                <div class="section-header">
                    <div class="provider-info">
                        <span class="material-symbols-rounded" style="color: var(--accent-primary);">settings_suggest</span>
                        <h4>Ollama Service Management</h4>
                    </div>
                    <div id="service-status" class="status-badge offline">Checking...</div>
                </div>
                <div style="display: flex; gap: 12px; margin-bottom: 20px;">
                    <button class="btn btn-primary" id="start-btn" style="flex: 1;">
                        <span class="material-symbols-rounded">play_arrow</span> Start Ollama
                    </button>
                    <button class="btn btn-secondary" id="stop-btn" style="flex: 1; color: #ef4444;">
                        <span class="material-symbols-rounded">stop</span> Stop Ollama
                    </button>
                </div>
                <p style="font-size: 12px; color: var(--text-secondary);">Directly control the Ollama server instance in your WSL environment. Starting the service may take a few seconds to become reachable.</p>
            </div>
        `);

        this.setupEventListeners();
        this.checkStatus();
    }

    setupEventListeners() {
        this.shadowRoot.getElementById('start-btn').addEventListener('click', () => this.start());
        this.shadowRoot.getElementById('stop-btn').addEventListener('click', () => this.stop());
        
        // Listen for global status checks
        window.addEventListener('check-ollama-status', () => this.checkStatus());
    }

    async checkStatus() {
        if (!window.api) return;
        const statusEl = this.shadowRoot.getElementById('service-status');
        try {
            const result = await window.api.checkOllama();
            this.updateStatusUI(statusEl, result.online ? 'Running' : 'Stopped', result.online);
        } catch (e) {
            this.updateStatusUI(statusEl, 'Offline', false);
        }
    }

    updateStatusUI(el, text, online) {
        if (!el) return;
        el.innerText = text;
        el.className = `status-badge ${online ? 'online' : 'offline'}`;
    }

    async start() {
        const btn = this.shadowRoot.getElementById('start-btn');
        btn.disabled = true;
        btn.innerHTML = '<span class="material-symbols-rounded">sync</span> Starting...';
        
        window.dispatchEvent(new CustomEvent('run-terminal-command', { 
            detail: { command: 'ollama serve', isPrompt: true } 
        }));

        const res = await window.api.startOllamaService();
        if (res.success) {
            setTimeout(() => {
                this.checkStatus();
                btn.disabled = false;
                btn.innerHTML = '<span class="material-symbols-rounded">play_arrow</span> Start Ollama';
                window.dispatchEvent(new Event('ollama-service-updated'));
            }, 3000);
        } else {
            btn.disabled = false;
            btn.innerHTML = '<span class="material-symbols-rounded">play_arrow</span> Start Ollama';
        }
    }

    async stop() {
        if (!confirm('Are you sure you want to stop the Ollama service?')) return;
        const btn = this.shadowRoot.getElementById('stop-btn');
        btn.disabled = true;
        btn.innerHTML = '<span class="material-symbols-rounded">sync</span> Stopping...';

        window.dispatchEvent(new CustomEvent('run-terminal-command', { 
            detail: { command: 'pkill ollama', isPrompt: true } 
        }));

        const res = await window.api.stopOllamaService();
        if (res.success) {
            setTimeout(() => {
                this.checkStatus();
                btn.disabled = false;
                btn.innerHTML = '<span class="material-symbols-rounded">stop</span> Stop Ollama';
                window.dispatchEvent(new Event('ollama-service-updated'));
            }, 1000);
        } else {
            btn.disabled = false;
            btn.innerHTML = '<span class="material-symbols-rounded">stop</span> Stop Ollama';
        }
    }
}

customElements.define('ollama-service', OllamaService);
