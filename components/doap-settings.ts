import { BaseComponent } from './base.js';
import './settings/ollama-service.js';
import './settings/ollama-config.js';
import './settings/ollama-models.js';
import './settings/ollama-stats.js';
import './settings/ollama-terminal.js';
import './settings/wsl-reference.js';

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
                    display: flex;
                    align-items: center;
                    gap: 8px;
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
                    padding-bottom: 60px;
                }
                .settings-row-top {
                    display: grid;
                    gap: 24px;
                }
                .settings-row-middle {
                    display: grid;
                    grid-template-columns: 2fr 1fr;
                    gap: 24px;
                }
                .settings-row-bottom {
                    display: grid;
                    grid-template-columns: 1fr 2fr;
                    gap: 24px;
                }
            </style>

            <div class="welcome-card">
                <h3>AI Connection Settings</h3>
                <p>Configure and manage your local and cloud-based AI providers.</p>
            </div>

            <div class="settings-tabs">
                <button class="settings-tab-btn active" data-tab="ollama"><span class="material-symbols-rounded">cloud_download</span> Ollama</button>
                <button class="settings-tab-btn" data-tab="openai"><span class="material-symbols-rounded">cloud</span> OpenAI</button>
            </div>

            <div class="settings-grid">
                <div id="settings-ollama" class="settings-tab-content active">
                    <div class="settings-grid-rows">
                        <div class="settings-row-top">
                            <ollama-service></ollama-service>
                        </div>
                        <div class="settings-row-top">
                            <ollama-config></ollama-config>
                        </div>
                        <div class="settings-row-middle">
                            <ollama-models></ollama-models>
                            <ollama-stats></ollama-stats>
                        </div>
                        <div class="settings-row-top">
                            <wsl-reference></wsl-reference>
                        </div>
                        <div class="settings-row-top">
                            <ollama-terminal></ollama-terminal>
                        </div>
                    </div>
                </div>

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
    }

    connectedCallback(): void {
        this.setupTabs();
    }

    private setupTabs(): void {
        const shadow = this.shadowRoot;
        if (!shadow) return;

        const tabs = shadow.querySelectorAll('.settings-tab-btn');
        tabs.forEach(btn => {
            btn.addEventListener('click', () => {
                const tabId = btn.getAttribute('data-tab');
                tabs.forEach(t => t.classList.remove('active'));
                btn.classList.add('active');
                
                shadow.querySelectorAll('.settings-tab-content').forEach(content => {
                    content.classList.toggle('active', content.id === `settings-${tabId}`);
                });

                if (tabId === 'ollama') {
                    window.dispatchEvent(new Event('check-ollama-status'));
                }
            });
        });
    }
}

customElements.define('doap-settings', DoapSettings);
