import { BaseComponent } from '../base.js';

export class WslReference extends BaseComponent {
    constructor() {
        super();
    }

    connectedCallback(): void {
        this.render(`
            <style>
                .ref-card {
                    background: var(--bg-card, rgba(30, 41, 59, 0.4));
                    border: 1px solid var(--border-color, rgba(255, 255, 255, 0.05));
                    border-radius: 12px;
                    padding: 24px;
                }
                .cmd-list {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 16px;
                    margin-top: 16px;
                }
                .cmd-item {
                    background: rgba(15, 23, 42, 0.6);
                    padding: 12px;
                    border-radius: 8px;
                    font-family: monospace;
                    font-size: 13px;
                    cursor: pointer;
                    transition: all 0.2s;
                    border: 1px solid transparent;
                }
                .cmd-item:hover {
                    border-color: var(--accent-primary, #6366f1);
                    background: rgba(15, 23, 42, 0.8);
                }
                .cmd-desc {
                    display: block;
                    font-size: 11px;
                    color: var(--text-secondary, #94a3b8);
                    margin-top: 4px;
                    font-family: inherit;
                }
            </style>
            <div class="ref-card">
                <div class="section-header">
                    <h4><span class="material-symbols-rounded">terminal</span> Ollama Quick Commands</h4>
                    <span class="status-badge" style="background: rgba(100, 116, 139, 0.2); color: #94a3b8;">WSL Reference</span>
                </div>
                <div class="cmd-list">
                    <div class="cmd-item" data-cmd="ollama list">
                        ollama list
                        <span class="cmd-desc">List installed models</span>
                    </div>
                    <div class="cmd-item" data-cmd="ollama ps">
                        ollama ps
                        <span class="cmd-desc">See running models</span>
                    </div>
                    <div class="cmd-item" data-cmd="ollama --version">
                        ollama --version
                        <span class="cmd-desc">Check Ollama version</span>
                    </div>
                    <div class="cmd-item" data-cmd="ollama help">
                        ollama help
                        <span class="cmd-desc">Full help menu</span>
                    </div>
                </div>
            </div>
        `);

        this.shadowRoot?.querySelectorAll('.cmd-item').forEach(item => {
            item.addEventListener('click', () => {
                const cmd = item.getAttribute('data-cmd');
                if (cmd) {
                    window.dispatchEvent(new CustomEvent('run-terminal-command', { 
                        detail: { command: cmd, isPrompt: true } 
                    }));
                }
            });
        });
    }
}

customElements.define('wsl-reference', WslReference);
