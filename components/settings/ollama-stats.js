import { BaseComponent } from '../base.js';

export class OllamaStats extends BaseComponent {
    constructor() {
        super();
    }

    connectedCallback() {
        this.render(`
            <style>
                .model-list {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }
                .model-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 12px;
                    background: rgba(15, 23, 42, 0.4);
                    border: 1px solid var(--border-color, rgba(255, 255, 255, 0.05));
                    border-radius: 8px;
                }
                .model-item h5 { margin: 0 0 4px 0; font-size: 13px; }
                .model-item p { margin: 0; font-size: 11px; color: var(--text-secondary, #94a3b8); }
            </style>
            <div class="form-card settings-section">
                <div class="section-header">
                    <h4><span class="material-symbols-rounded">memory</span> Running Models (PS)</h4>
                    <span class="status-badge online" id="running-count">0 Active</span>
                </div>
                <div id="running-list" class="model-list">
                    <p style="font-size: 13px; color: var(--text-secondary); text-align: center; padding: 20px;">No models currently in memory.</p>
                </div>
            </div>
        `);

        this.loadRunning();
        window.addEventListener('ollama-service-updated', () => this.loadRunning());
        window.addEventListener('settings-updated', () => this.loadRunning());
        
        // Polling for stats might be good, but for now just update on events
        this.pollInterval = setInterval(() => this.loadRunning(), 10000);
    }

    disconnectedCallback() {
        if (this.pollInterval) clearInterval(this.pollInterval);
    }

    async loadRunning() {
        const list = this.shadowRoot.getElementById('running-list');
        const badge = this.shadowRoot.getElementById('running-count');
        if (!list || !window.api) return;

        try {
            const result = await window.api.getRunningModels();
            if (result.success && result.models) {
                const models = result.models;
                badge.innerText = `${models.length} Active`;
                
                if (models.length === 0) {
                    list.innerHTML = '<p style="font-size: 13px; color: var(--text-secondary); text-align: center; padding: 20px;">No models currently in memory.</p>';
                } else {
                    list.innerHTML = models.map(m => `
                        <div class="model-item">
                            <div class="model-item-info">
                                <h5>${m.name}</h5>
                                <p>${m.size_vram ? (m.size_vram / (1024 * 1024 * 1024)).toFixed(2) + ' GB VRAM' : 'In memory'}</p>
                            </div>
                            <span class="status-badge online" style="font-size: 9px;">Running</span>
                        </div>
                    `).join('');
                }
            } else {
                badge.innerText = '0 Active';
                list.innerHTML = '<p style="font-size: 13px; color: var(--text-secondary); text-align: center; padding: 20px;">Service unreachable.</p>';
            }
        } catch (e) {
            badge.innerText = 'Offline';
        }
    }
}

customElements.define('ollama-stats', OllamaStats);
