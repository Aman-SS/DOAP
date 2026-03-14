import { BaseComponent } from './base.js';

export class DoapSettings extends BaseComponent {
    constructor() {
        super();
        this.render(`
            <style>
                .settings-tabs {
                    display: flex;
                    gap: 12px;
                    margin-bottom: 24px;
                    border-bottom: 1px solid var(--border-color, rgba(255, 255, 255, 0.05));
                    padding-bottom: 1px;
                }
                .settings-tab-btn {
                    background: transparent;
                    color: var(--text-secondary, #94a3b8);
                    border: none;
                    padding: 12px 16px;
                    font-size: 14px;
                    font-weight: 600;
                    cursor: pointer;
                    position: relative;
                    transition: color 0.2s ease;
                }
                .settings-tab-btn:hover {
                    color: var(--text-primary, #f8fafc);
                }
                .settings-tab-btn.active {
                    color: var(--accent-primary, #6366f1);
                }
                .settings-tab-btn.active::after {
                    content: '';
                    position: absolute;
                    bottom: -1px;
                    left: 0;
                    right: 0;
                    height: 2px;
                    background: var(--accent-primary, #6366f1);
                    border-radius: 2px 2px 0 0;
                }
                .settings-tab-content {
                    display: none;
                    animation: fadeIn 0.3s ease-out;
                }
                .settings-tab-content.active {
                    display: block;
                }
                .settings-grid-rows {
                    display: flex;
                    flex-direction: column;
                    gap: 24px;
                }
                .settings-row-top, .settings-row-middle, .settings-row-bottom {
                    display: grid;
                    gap: 24px;
                }
                .settings-row-middle {
                    grid-template-columns: 2fr 1fr;
                }
                .settings-row-bottom {
                    grid-template-columns: 1fr 2fr;
                }
                .settings-section {
                    height: 100%;
                }
                .section-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 20px;
                }
                .provider-info {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }
                .provider-logo {
                    width: 24px;
                    height: 24px;
                    border-radius: 4px;
                }
                .status-badge {
                    padding: 4px 10px;
                    border-radius: 12px;
                    font-size: 11px;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                .status-badge.online {
                    background: rgba(16, 185, 129, 0.1);
                    color: #10b981;
                    border: 1px solid rgba(16, 185, 129, 0.2);
                }
                .status-badge.offline {
                    background: rgba(239, 68, 68, 0.1);
                    color: #ef4444;
                    border: 1px solid rgba(239, 68, 68, 0.2);
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
                .reference-item {
                    margin-bottom: 16px;
                }
                .ref-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 8px;
                }
                .ref-header h5 { margin: 0; font-size: 13px; }
                .command-box {
                    display: block;
                    background: rgba(15, 23, 42, 0.8);
                    padding: 10px;
                    border-radius: 6px;
                    font-family: 'Consolas', monospace;
                    font-size: 12px;
                    color: #e2e8f0;
                    border: 1px solid var(--border-color, rgba(255, 255, 255, 0.05));
                    white-space: nowrap;
                    overflow-x: auto;
                }
                .terminal-container {
                    background: #0f172a;
                    border-radius: 12px;
                    border: 1px solid var(--border-color, rgba(255, 255, 255, 0.05));
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                    height: 100%;
                    min-height: 250px;
                }
                .terminal-box {
                    flex: 1;
                    padding: 16px;
                    overflow-y: auto;
                    font-family: 'Consolas', monospace;
                    font-size: 13px;
                    color: #e2e8f0;
                    white-space: pre-wrap;
                    line-height: 1.5;
                }
                .terminal-prompt { color: #10b981; margin-right: 8px; }
                .terminal-input-line {
                    display: flex;
                    align-items: center;
                    padding: 12px 16px;
                    background: rgba(0, 0, 0, 0.2);
                    border-top: 1px solid rgba(255, 255, 255, 0.05);
                }
                .terminal-input-line input {
                    flex: 1;
                    background: transparent;
                    border: none;
                    color: #e2e8f0;
                    font-family: 'Consolas', monospace;
                    font-size: 13px;
                }
                .terminal-input-line input:focus { outline: none; box-shadow: none; border: none; }
                .progress-bar-container {
                    width: 100%;
                    height: 6px;
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 3px;
                    overflow: hidden;
                }
                .progress-bar {
                    height: 100%;
                    background: var(--accent-primary, #6366f1);
                    width: 0%;
                    transition: width 0.3s ease;
                }
            </style>

            <div class="welcome-card">
                <h3>AI Connection Settings</h3>
                <p>Configure and manage your local and cloud-based AI providers.</p>
            </div>

            <div class="settings-tabs">
                <button class="settings-tab-btn active" data-tab="ollama">Ollama</button>
                <button class="settings-tab-btn" data-tab="openai">OpenAI</button>
            </div>

            <div class="settings-grid">
                <!-- Ollama Tab -->
                <div id="settings-ollama" class="settings-tab-content active">
                    <div class="settings-grid-rows">
                        <div class="settings-row-top">
                            <div class="form-card settings-section">
                                <div class="section-header">
                                    <div class="provider-info">
                                        <img src="https://ollama.com/public/ollama.png" alt="Ollama" class="provider-logo" onerror="this.style.display='none'">
                                        <h4>Ollama (Local)</h4>
                                    </div>
                                    <div id="settings-ollama-status" class="status-badge offline">Offline</div>
                                </div>
                                <div class="input-group">
                                    <label>API Server URL</label>
                                    <div class="input-with-action">
                                        <input type="text" id="ollama-url-input" placeholder="http://127.0.0.1:11434">
                                        <button class="btn btn-secondary btn-sm" id="discover-wsl-btn" title="Auto-discover WSL IP">Auto-find WSL</button>
                                        <button class="btn btn-secondary btn-sm" id="test-ollama-btn">Test Connection</button>
                                    </div>
                                </div>
                                <div class="input-group">
                                    <label>Preferred Model</label>
                                    <select id="ollama-model-select" class="btn btn-secondary" style="width: 100%; text-align: left;">
                                        <option value="llama3">llama3 (Default)</option>
                                    </select>
                                </div>
                                <button class="btn btn-primary" id="save-settings-btn" style="width: 100%;">Save Ollama Configuration</button>
                            </div>
                        </div>

                        <div class="settings-row-middle">
                            <div class="form-card settings-section">
                                <div class="section-header">
                                    <h4>Model Management</h4>
                                    <div class="header-actions">
                                        <button class="btn btn-secondary btn-sm" id="refresh-models-btn">Refresh List</button>
                                    </div>
                                </div>
                                
                                <div class="input-group">
                                    <label>Pull New Model</label>
                                    <div class="input-with-action">
                                        <input type="text" id="pull-model-input" placeholder="e.g. llama3:8b">
                                        <button class="btn btn-primary btn-sm" id="pull-model-btn">Pull Model</button>
                                    </div>
                                    <div id="pull-progress-container" class="hidden" style="margin-top: 12px;">
                                        <div class="progress-bar-container">
                                            <div id="pull-progress-bar" class="progress-bar"></div>
                                        </div>
                                        <p id="pull-status-text" style="font-size: 12px; margin-top: 4px; color: var(--text-secondary);"></p>
                                    </div>
                                </div>

                                <div style="margin-top: 20px; overflow-x: auto;">
                                    <table id="ollama-models-table" class="minimal-table">
                                        <thead>
                                            <tr>
                                                <th>Model Name</th>
                                                <th>Size</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody id="ollama-models-body"></tbody>
                                    </table>
                                </div>
                            </div>

                            <div class="form-card settings-section">
                                <div class="section-header">
                                    <h4>Running Models (PS)</h4>
                                    <span class="status-badge online" id="running-count-badge">0 Active</span>
                                </div>
                                <div id="running-models-list" class="model-list">
                                    <p style="font-size: 13px; color: var(--text-secondary); text-align: center; padding: 20px;">No models currently in memory.</p>
                                </div>
                            </div>
                        </div>

                        <div class="settings-row-bottom">
                            <aside class="settings-sidebar">
                                <div class="form-card">
                                    <h4>WSL Quick Reference</h4>
                                    <div class="reference-item">
                                        <div class="ref-header">
                                            <h5>WSL Setup</h5>
                                            <button class="btn btn-secondary btn-xs run-cmd-btn" data-cmd='export OLLAMA_HOST="0.0.0.0" && echo "Host set to 0.0.0.0"'>Run</button>
                                        </div>
                                        <code class="command-box">export OLLAMA_HOST="0.0.0.0"</code>
                                    </div>
                                    <div class="reference-item">
                                        <div class="ref-header">
                                            <h5>Check Models</h5>
                                            <button class="btn btn-secondary btn-xs run-cmd-btn" data-cmd="ollama list">Run</button>
                                        </div>
                                        <code class="command-box">ollama list</code>
                                    </div>
                                </div>
                            </aside>

                            <div class="terminal-container nested-terminal">
                                <div id="ollama-terminal-output" class="terminal-box">Ollama WSL Bridge Ready...</div>
                                <div class="terminal-input-line">
                                    <span class="terminal-prompt">$</span>
                                    <input type="text" id="ollama-terminal-input" placeholder="Run command...">
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- OpenAI Tab (Mock) -->
                <div id="settings-openai" class="settings-tab-content">
                    <div class="form-card settings-section">
                        <div class="section-header">
                            <h4>OpenAI API Settings</h4>
                            <span class="status-badge">Locked</span>
                        </div>
                        <p style="font-size: 13px; color: var(--text-secondary);">Direct OpenAI integration coming in the next update.</p>
                    </div>
                </div>
            </div>
        `);
        
        this.terminalHistory = [];
        this.historyIndex = -1;
    }

    connectedCallback() {
        this.setupTabs();
        this.setupTerminal();
        
        // Wait for window.api injection
        setTimeout(() => {
            this.loadSettings();
            this.checkOllama();
            this.loadOllamaModels();
            this.loadRunningModels();
        }, 100);

        this.shadowRoot.getElementById('test-ollama-btn')?.addEventListener('click', () => this.testConnection());
        this.shadowRoot.getElementById('save-settings-btn')?.addEventListener('click', () => this.saveSettings());
        this.shadowRoot.getElementById('refresh-models-btn')?.addEventListener('click', () => {
            this.loadOllamaModels();
            this.loadRunningModels();
        });
        
        this.shadowRoot.getElementById('discover-wsl-btn')?.addEventListener('click', async () => {
            const btn = this.shadowRoot.getElementById('discover-wsl-btn');
            btn.disabled = true;
            btn.innerText = 'Finding...';
            const result = await window.api.getWslIp();
            btn.disabled = false;
            btn.innerText = 'Auto-find WSL';
            if (result.success && result.ip) {
                this.shadowRoot.getElementById('ollama-url-input').value = `http://\${result.ip}:11434`;
                alert(`WSL IP found: \${result.ip}. URL updated.`);
            } else {
                alert('Could not find WSL IP. Ensure WSL is running.');
            }
        });

        this.shadowRoot.getElementById('pull-model-btn')?.addEventListener('click', () => this.pullModel());

        this.shadowRoot.querySelectorAll('.run-cmd-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const cmd = btn.getAttribute('data-cmd');
                if (cmd) this.executeWslCommand(cmd);
            });
        });

        // Listen for IPC pull progress
        if (window.api && window.api.onPullProgress) {
            window.api.onPullProgress((data) => this.updatePullProgress(data));
        }

        // Auto polling status
        this.pollingInterval = setInterval(() => this.checkOllama(), 10000);
    }

    disconnectedCallback() {
        if (this.pollingInterval) clearInterval(this.pollingInterval);
    }

    setupTabs() {
        const tabs = this.shadowRoot.querySelectorAll('.settings-tab-btn');
        tabs.forEach(btn => {
            btn.addEventListener('click', () => {
                const tabId = btn.getAttribute('data-tab');
                tabs.forEach(t => t.classList.remove('active'));
                btn.classList.add('active');
                
                this.shadowRoot.querySelectorAll('.settings-tab-content').forEach(content => {
                    content.classList.toggle('active', content.id === `settings-\${tabId}`);
                });
            });
        });
    }

    async loadSettings() {
        if (!window.api) return;
        const url = await window.api.getSetting('ollama_url');
        const model = await window.api.getSetting('ollama_model');
        if (url) this.shadowRoot.getElementById('ollama-url-input').value = url;
        if (model) this.preferredModel = model; // Will be set in dropdown during loadOllamaModels()
    }

    async testConnection() {
        if (!window.api) return;
        const btn = this.shadowRoot.getElementById('test-ollama-btn');
        const url = this.shadowRoot.getElementById('ollama-url-input').value.trim();
        
        btn.innerText = 'Testing...';
        await window.api.updateSetting('ollama_url', url);
        const status = await window.api.checkOllama();
        btn.innerText = 'Test Connection';
        
        if (status.online) {
            alert('Success! Ollama is reachable.');
            this.checkOllama();
            this.loadOllamaModels();
        } else {
            alert('Failed to connect. Please check the URL and ensure Ollama is running.');
            this.checkOllama();
        }
    }

    async saveSettings() {
        const url = this.shadowRoot.getElementById('ollama-url-input').value.trim();
        const model = this.shadowRoot.getElementById('ollama-model-select').value;
        if (!url) return alert('Please enter a URL');
        
        const res1 = await window.api.updateSetting('ollama_url', url);
        const res2 = await window.api.updateSetting('ollama_model', model);
        
        if (res1 && res2) {
            alert('Settings saved successfully!');
            this.checkOllama();
            window.dispatchEvent(new Event('settings-updated'));
        } else {
            alert('Failed to save settings');
        }
    }

    async checkOllama() {
        if (!window.api) return;
        const settingsStatus = this.shadowRoot.getElementById('settings-ollama-status');
        try {
            const result = await window.api.checkOllama();
            if (result.online) {
                settingsStatus.innerText = 'Connected';
                settingsStatus.classList.remove('offline');
                settingsStatus.classList.add('online');
                window.dispatchEvent(new CustomEvent('provider-status', { detail: { online: true } }));
            } else {
                this.setOffline();
            }
        } catch (e) {
            this.setOffline();
        }
    }

    setOffline() {
        const settingsStatus = this.shadowRoot.getElementById('settings-ollama-status');
        settingsStatus.innerText = 'Offline';
        settingsStatus.classList.remove('online');
        settingsStatus.classList.add('offline');
        window.dispatchEvent(new CustomEvent('provider-status', { detail: { online: false } }));
    }

    async loadOllamaModels() {
        const tableBody = this.shadowRoot.getElementById('ollama-models-body');
        const modelSelect = this.shadowRoot.getElementById('ollama-model-select');
        if (!tableBody || !window.api) return;

        const preferredModel = await window.api.getSetting('ollama_model') || 'llama3';

        try {
            const result = await window.api.checkOllama();
            if (!result.online) {
                tableBody.innerHTML = '<tr><td colspan="3" style="text-align: center;">Ollama is offline</td></tr>';
                return;
            }

            const models = result.models || [];
            
            if (models.length === 0) {
                tableBody.innerHTML = '<tr><td colspan="3" style="text-align: center;">No models installed</td></tr>';
            } else {
                tableBody.innerHTML = '';
                models.forEach(m => {
                    const sizeGB = (m.size / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
                    const tr = document.createElement('tr');
                    tr.style.opacity = '0';
                    tr.innerHTML = `
                        <td style="font-weight: 600;">\${m.name}</td>
                        <td>\${sizeGB}</td>
                        <td>
                            <div style="display: flex; gap: 8px;">
                                <button class="btn btn-secondary btn-xs info-btn">Info</button>
                                <button class="btn btn-secondary btn-xs delete-btn" style="color: #ef4444;">Del</button>
                            </div>
                        </td>
                    `;
                    
                    tr.querySelector('.info-btn').onclick = async () => {
                        const res = await window.api.getModelInfo(m.name);
                        if(res.success) {
                            window.dispatchEvent(new CustomEvent('open-modal', {
                                detail: { title: `Info: \${m.name}`, content: res.info.modelfile || res.info.template }
                            }));
                        }
                    };
                    
                    tr.querySelector('.delete-btn').onclick = async () => {
                        if (!confirm(`Delete model '\${m.name}'?`)) return;
                        const res = await window.api.deleteModel(m.name);
                        if (res.success) this.loadOllamaModels();
                        else alert("Failed to delete model");
                    };

                    tableBody.appendChild(tr);
                    // simple fade-in
                    requestAnimationFrame(() => tr.style.opacity = '1');
                });
            }

            const currentSelection = modelSelect.value;
            modelSelect.innerHTML = models.map(m => `<option value="\${m.name}">\${m.name}</option>`).join('');
            
            if (models.some(m => m.name === preferredModel)) {
                modelSelect.value = preferredModel;
            } else if (models.length > 0) {
                modelSelect.value = models.some(m => m.name === currentSelection) ? currentSelection : models[0].name;
            }
        } catch (error) {
            tableBody.innerHTML = `<tr><td colspan="3" style="color: #ef4444;">Error: \${error.message}</td></tr>`;
        }
    }

    async loadRunningModels() {
        const list = this.shadowRoot.getElementById('running-models-list');
        const badge = this.shadowRoot.getElementById('running-count-badge');
        if (!list || !window.api) return;

        try {
            const result = await window.api.getRunningModels();
            if (result.success && result.models) {
                const models = result.models;
                badge.innerText = `\${models.length} Active`;
                
                if (models.length === 0) {
                    list.innerHTML = '<p style="font-size: 13px; color: var(--text-secondary); text-align: center; padding: 20px;">No models currently in memory.</p>';
                } else {
                    list.innerHTML = models.map(m => `
                        <div class="model-item">
                            <div class="model-item-info">
                                <h5>\${m.name}</h5>
                                <p>\${m.size_vram ? (m.size_vram / (1024 * 1024 * 1024)).toFixed(2) + ' GB VRAM' : 'In memory'}</p>
                            </div>
                            <span class="status-badge online" style="font-size: 9px;">Running</span>
                        </div>
                    `).join('');
                }
            }
        } catch (e) { }
    }

    async pullModel() {
        const input = this.shadowRoot.getElementById('pull-model-input');
        const name = input.value.trim();
        if (!name) return;

        const container = this.shadowRoot.getElementById('pull-progress-container');
        const bar = this.shadowRoot.getElementById('pull-progress-bar');
        const text = this.shadowRoot.getElementById('pull-status-text');

        container.classList.remove('hidden');
        bar.style.width = '0%';
        text.innerText = `Preparing to pull \${name}...`;

        const res = await window.api.pullModel(name);
        if (!res.success) {
            alert("Failed to start pull: " + res.error);
            container.classList.add('hidden');
        }
    }

    updatePullProgress(data) {
        const container = this.shadowRoot.getElementById('pull-progress-container');
        const bar = this.shadowRoot.getElementById('pull-progress-bar');
        const text = this.shadowRoot.getElementById('pull-status-text');
        
        if (data.status) {
            text.innerText = data.status;
            if (data.completed && data.total) {
                const percent = (data.completed / data.total * 100).toFixed(1);
                bar.style.width = `\${percent}%`;
                text.innerText = `\${data.status} (\${percent}%)`;
            }
            
            if (data.status === 'success') {
                text.innerText = "Model pulled successfully!";
                bar.style.width = '100%';
                this.loadOllamaModels();
                setTimeout(() => {
                    container.classList.add('hidden');
                    this.shadowRoot.getElementById('pull-model-input').value = '';
                }, 3000);
            }
        }
    }

    setupTerminal() {
        const input = this.shadowRoot.getElementById('ollama-terminal-input');
        input.addEventListener('keydown', async (e) => {
            if (e.key === 'Enter') {
                const cmd = e.target.value.trim();
                if (!cmd) return;
                e.target.value = '';
                this.terminalHistory.push(cmd);
                this.historyIndex = -1;
                
                if (cmd.toLowerCase() === 'clear') {
                    this.shadowRoot.getElementById('ollama-terminal-output').innerHTML = 'Ollama WSL Bridge Ready...';
                    return;
                }
                this.executeWslCommand(cmd);
            } else if (e.key === 'ArrowUp') {
                if (this.terminalHistory.length > 0) {
                    this.historyIndex = this.historyIndex === -1 ? this.terminalHistory.length - 1 : Math.max(0, this.historyIndex - 1);
                    e.target.value = this.terminalHistory[this.historyIndex];
                }
            } else if (e.key === 'ArrowDown') {
                if (this.historyIndex !== -1) {
                    this.historyIndex = Math.min(this.terminalHistory.length - 1, this.historyIndex + 1);
                    e.target.value = this.terminalHistory[this.historyIndex];
                }
            }
        });
    }

    async executeWslCommand(command) {
        const output = this.shadowRoot.getElementById('ollama-terminal-output');
        const runBtns = this.shadowRoot.querySelectorAll('.run-cmd-btn');
        runBtns.forEach(btn => btn.disabled = true);

        output.innerHTML += `\\n<span class="terminal-prompt">$</span> \${command}`;
        output.scrollTop = output.scrollHeight;

        const result = await window.api.runWslCommand(command);
        if (result.success) {
            output.innerHTML += `\\n\${result.stdout}`;
        } else {
            output.innerHTML += `\\n<span style="color: #ef4444;">Error: \${result.error || result.stderr}</span>`;
        }
        output.scrollTop = output.scrollHeight;
        runBtns.forEach(btn => btn.disabled = false);
    }
}

customElements.define('doap-settings', DoapSettings);
