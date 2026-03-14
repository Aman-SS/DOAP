import { BaseComponent } from '../base.js';

export class OllamaModels extends BaseComponent {
    constructor() {
        super();
    }

    connectedCallback() {
        this.render(`
            <style>
                .discovery-tags {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 8px;
                    margin-bottom: 20px;
                }
                .discovery-tag {
                    padding: 6px 12px;
                    background: rgba(99, 102, 241, 0.1);
                    border: 1px solid rgba(99, 102, 241, 0.2);
                    border-radius: 20px;
                    font-size: 12px;
                    font-weight: 500;
                    color: var(--accent-primary, #6366f1);
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .discovery-tag:hover {
                    background: var(--accent-primary, #6366f1);
                    color: white;
                    transform: translateY(-2px);
                }
                .minimal-table {
                    width: 100%;
                    border-collapse: collapse;
                    font-size: 13px;
                }
                .minimal-table th, .minimal-table td {
                    padding: 12px;
                    text-align: left;
                    border-bottom: 1px solid var(--border-color, rgba(255, 255, 255, 0.05));
                }
                .minimal-table th {
                    color: var(--text-secondary, #94a3b8);
                    font-weight: 600;
                }
                .progress-bar-container {
                    width: 100%;
                    height: 6px;
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 3px;
                    overflow: hidden;
                    margin-top: 12px;
                }
                .progress-bar {
                    height: 100%;
                    background: var(--accent-primary, #6366f1);
                    width: 0%;
                    transition: width 0.3s ease;
                }
            </style>
            <div class="form-card settings-section">
                <div class="section-header">
                    <h4><span class="material-symbols-rounded">storage</span> Model Management</h4>
                    <button class="btn btn-secondary btn-sm" id="refresh-btn">
                        <span class="material-symbols-rounded" style="font-size: 14px;">refresh</span> Refresh
                    </button>
                </div>

                <div class="input-group">
                    <label>Discover Popular Models</label>
                    <div class="discovery-tags">
                        <div class="discovery-tag" data-model="llama3">llama3</div>
                        <div class="discovery-tag" data-model="phi3">phi3</div>
                        <div class="discovery-tag" data-model="mistral">mistral</div>
                        <div class="discovery-tag" data-model="gemma">gemma</div>
                        <div class="discovery-tag" data-model="codellama">codellama</div>
                        <div class="discovery-tag" data-model="deepseek-coder">deepseek-coder</div>
                    </div>
                </div>
                
                <div class="input-group">
                    <label>Pull New Model</label>
                    <div class="input-with-action">
                        <input type="text" id="pull-input" placeholder="e.g. llama3:8b">
                        <button class="btn btn-primary btn-sm" id="pull-btn">
                            <span class="material-symbols-rounded">cloud_download</span> Pull
                        </button>
                    </div>
                    <div id="pull-progress" class="hidden">
                        <div class="progress-bar-container">
                            <div id="progress-bar" class="progress-bar"></div>
                        </div>
                        <p id="progress-text" style="font-size: 12px; margin-top: 4px; color: var(--text-secondary);"></p>
                    </div>
                </div>

                <div style="margin-top: 20px; overflow-x: auto;">
                    <table class="minimal-table">
                        <thead>
                            <tr>
                                <th>Model Name</th>
                                <th>Size</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody id="models-body"></tbody>
                    </table>
                </div>
            </div>
        `);

        this.setupEventListeners();
        this.loadModels();
    }

    setupEventListeners() {
        this.shadowRoot.getElementById('refresh-btn').addEventListener('click', () => this.loadModels());
        this.shadowRoot.getElementById('pull-btn').addEventListener('click', () => this.pull());
        
        this.shadowRoot.querySelectorAll('.discovery-tag').forEach(tag => {
            tag.addEventListener('click', () => {
                const model = tag.getAttribute('data-model');
                const input = this.shadowRoot.getElementById('pull-input');
                if (input) {
                    input.value = model;
                    input.focus();
                }
            });
        });

        if (window.api && window.api.onPullProgress) {
            window.api.onPullProgress((data) => this.updatePullProgress(data));
        }

        window.addEventListener('ollama-service-updated', () => this.loadModels());
    }

    async loadModels() {
        const body = this.shadowRoot.getElementById('models-body');
        if (!body || !window.api) return;

        const preferred = await window.api.getSetting('ollama_model') || 'llama3';

        try {
            const result = await window.api.checkOllama();
            if (!result.online) {
                body.innerHTML = '<tr><td colspan="3" style="text-align: center;">Ollama is offline</td></tr>';
                return;
            }

            const models = result.models || [];
            window.dispatchEvent(new CustomEvent('ollama-models-refreshed', { detail: { models } }));

            if (models.length === 0) {
                body.innerHTML = '<tr><td colspan="3" style="text-align: center;">No models installed</td></tr>';
            } else {
                body.innerHTML = '';
                models.forEach(m => {
                    const isActive = m.name === preferred;
                    const sizeGB = (m.size / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
                    const tr = document.createElement('tr');
                    tr.style.opacity = '0';
                    tr.style.transition = 'opacity 0.3s ease';
                    tr.innerHTML = `
                        <td style="font-weight: 600;">
                            <div style="display: flex; align-items: center; gap: 8px;">
                                ${m.name}
                                ${isActive ? '<span class="status-badge online" style="font-size: 9px; padding: 2px 6px;">Active</span>' : ''}
                            </div>
                        </td>
                        <td>${sizeGB}</td>
                        <td>
                            <div style="display: flex; gap: 8px;">
                                ${!isActive ? `<button class="btn btn-primary btn-xs use-btn" title="Use as preferred model"><span class="material-symbols-rounded" style="font-size: 14px;">play_circle</span></button>` : ''}
                                <button class="btn btn-secondary btn-xs info-btn" title="Model details"><span class="material-symbols-rounded" style="font-size: 14px;">info</span></button>
                                <button class="btn btn-secondary btn-xs delete-btn" style="color: #ef4444;" title="Delete model"><span class="material-symbols-rounded" style="font-size: 14px;">delete</span></button>
                            </div>
                        </td>
                    `;
                    
                    if (!isActive) {
                        tr.querySelector('.use-btn').onclick = () => this.activate(m.name);
                    }
                    
                    tr.querySelector('.info-btn').onclick = async () => this.showInfo(m.name);
                    tr.querySelector('.delete-btn').onclick = () => this.delete(m.name);

                    body.appendChild(tr);
                    requestAnimationFrame(() => tr.style.opacity = '1');
                });
            }
        } catch (e) {
            body.innerHTML = '<tr><td colspan="3" style="text-align: center; color: #ef4444;">Failed to load models</td></tr>';
        }
    }

    async activate(name) {
        if (!window.api) return;
        window.dispatchEvent(new CustomEvent('run-terminal-command', { 
            detail: { command: `echo "Switching to model: ${name}"`, isPrompt: false } 
        }));
        await window.api.updateSetting('ollama_model', name);
        this.loadModels();
        window.dispatchEvent(new Event('settings-updated'));
    }

    async showInfo(name) {
        const res = await window.api.getModelInfo(name);
        if(res.success) {
            window.dispatchEvent(new CustomEvent('open-modal', {
                detail: { title: `Info: ${name}`, content: res.info.modelfile || res.info.template }
            }));
        }
    }

    async delete(name) {
        if (!confirm(`Delete model '${name}'?`)) return;
        window.dispatchEvent(new CustomEvent('run-terminal-command', { 
            detail: { command: `ollama rm ${name}`, isPrompt: true } 
        }));
        const res = await window.api.deleteModel(name);
        if (res.success) {
            this.loadModels();
        }
    }

    async pull() {
        const input = this.shadowRoot.getElementById('pull-input');
        const name = input.value.trim();
        if (!name) return;

        const progress = this.shadowRoot.getElementById('pull-progress');
        const bar = this.shadowRoot.getElementById('progress-bar');
        const text = this.shadowRoot.getElementById('progress-text');

        window.dispatchEvent(new CustomEvent('run-terminal-command', { 
            detail: { command: `ollama pull ${name}`, isPrompt: true } 
        }));

        progress.classList.remove('hidden');
        bar.style.width = '0%';
        text.innerText = `Preparing to pull ${name}...`;

        const res = await window.api.pullModel(name);
        if (!res.success) {
            progress.classList.add('hidden');
        }
    }

    updatePullProgress(data) {
        const progress = this.shadowRoot.getElementById('pull-progress');
        const bar = this.shadowRoot.getElementById('progress-bar');
        const text = this.shadowRoot.getElementById('progress-text');
        
        if (data.status) {
            text.innerText = data.status;
            if (data.completed && data.total) {
                const percent = (data.completed / data.total * 100).toFixed(1);
                bar.style.width = `${percent}%`;
                text.innerText = `${data.status} (${percent}%)`;
            }
            
            if (data.status === 'success') {
                text.innerText = "Model pulled successfully!";
                bar.style.width = '100%';
                this.loadModels();
                setTimeout(() => {
                    progress.classList.add('hidden');
                    this.shadowRoot.getElementById('pull-input').value = '';
                }, 3000);
            }
        }
    }
}

customElements.define('ollama-models', OllamaModels);
