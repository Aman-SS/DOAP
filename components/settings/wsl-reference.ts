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
                    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
                    gap: 12px;
                    margin-top: 16px;
                }
                .cmd-item {
                    background: rgba(15, 23, 42, 0.6);
                    padding: 12px 16px;
                    border-radius: 8px;
                    font-family: monospace;
                    font-size: 13px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    transition: all 0.2s;
                    border: 1px solid transparent;
                    cursor: pointer;
                }
                .cmd-item:hover {
                    border-color: var(--accent-primary, #6366f1);
                    background: rgba(15, 23, 42, 0.8);
                }
                .cmd-content {
                    flex: 1;
                }
                .cmd-name {
                    font-weight: 600;
                    color: var(--accent-primary, #6366f1);
                }
                .cmd-desc {
                    display: block;
                    font-size: 11px;
                    color: var(--text-secondary, #94a3b8);
                    margin-top: 2px;
                    font-family: var(--font-family, sans-serif);
                }
                .run-btn {
                    background: rgba(99, 102, 241, 0.1);
                    color: var(--accent-primary, #6366f1);
                    border: none;
                    border-radius: 6px;
                    padding: 4px 8px;
                    font-size: 11px;
                    font-weight: 600;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    transition: all 0.2s;
                }
                .run-btn:hover {
                    background: var(--accent-primary, #6366f1);
                    color: white;
                }
                .run-btn .material-symbols-rounded {
                    font-size: 16px;
                }
            </style>
            <div class="ref-card">
                <div class="section-header">
                    <h4><span class="material-symbols-rounded">terminal</span> Ollama Quick Commands</h4>
                    <span class="status-badge" style="background: rgba(100, 116, 139, 0.2); color: #94a3b8;">WSL Reference</span>
                </div>
                <div class="cmd-list">
                    <div class="cmd-item" data-cmd="ollama serve">
                        <div class="cmd-content">
                            <span class="cmd-name">ollama serve</span>
                            <span class="cmd-desc">Start the Ollama server</span>
                        </div>
                        <button class="run-btn">
                            <span class="material-symbols-rounded">play_arrow</span> Run
                        </button>
                    </div>
                    <div class="cmd-item" data-cmd="ollama list">
                        <div class="cmd-content">
                            <span class="cmd-name">ollama list</span>
                            <span class="cmd-desc">List installed models</span>
                        </div>
                        <button class="run-btn">
                            <span class="material-symbols-rounded">play_arrow</span> Run
                        </button>
                    </div>
                    <div class="cmd-item" data-cmd="ollama ps">
                        <div class="cmd-content">
                            <span class="cmd-name">ollama ps</span>
                            <span class="cmd-desc">See running models</span>
                        </div>
                        <button class="run-btn">
                            <span class="material-symbols-rounded">play_arrow</span> Run
                        </button>
                    </div>
                    <div class="cmd-item" data-cmd="ollama pull ">
                        <div class="cmd-content">
                            <span class="cmd-name">ollama pull [model]</span>
                            <span class="cmd-desc">Download a new model</span>
                        </div>
                        <button class="run-btn">
                            <span class="material-symbols-rounded">play_arrow</span> Run
                        </button>
                    </div>
                    <div class="cmd-item" data-cmd="ollama run ">
                        <div class="cmd-content">
                            <span class="cmd-name">ollama run [model]</span>
                            <span class="cmd-desc">Launch and chat with model</span>
                        </div>
                        <button class="run-btn">
                            <span class="material-symbols-rounded">play_arrow</span> Run
                        </button>
                    </div>
                    <div class="cmd-item" data-cmd="ollama --version">
                        <div class="cmd-content">
                            <span class="cmd-name">ollama --version</span>
                            <span class="cmd-desc">Check Ollama version</span>
                        </div>
                        <button class="run-btn">
                            <span class="material-symbols-rounded">play_arrow</span> Run
                        </button>
                    </div>
                    <div class="cmd-item" data-cmd="ollama help">
                        <div class="cmd-content">
                            <span class="cmd-name">ollama help</span>
                            <span class="cmd-desc">View all commands</span>
                        </div>
                        <button class="run-btn">
                            <span class="material-symbols-rounded">play_arrow</span> Run
                        </button>
                    </div>
                    <div class="cmd-item" data-cmd="ollama stop ">
                        <div class="cmd-content">
                            <span class="cmd-name">ollama stop [model]</span>
                            <span class="cmd-desc">Stop a running model</span>
                        </div>
                        <button class="run-btn">
                            <span class="material-symbols-rounded">play_arrow</span> Run
                        </button>
                    </div>
                    <div class="cmd-item" data-cmd="ollama show ">
                        <div class="cmd-content">
                            <span class="cmd-name">ollama show [model]</span>
                            <span class="cmd-desc">Show model information</span>
                        </div>
                        <button class="run-btn">
                            <span class="material-symbols-rounded">play_arrow</span> Run
                        </button>
                    </div>
                    <div class="cmd-item" data-cmd="ollama rm ">
                        <div class="cmd-content">
                            <span class="cmd-name">ollama rm [model]</span>
                            <span class="cmd-desc">Remove a model</span>
                        </div>
                        <button class="run-btn">
                            <span class="material-symbols-rounded">play_arrow</span> Run
                        </button>
                    </div>
                </div>
            </div>
        `);

        this.shadowRoot?.querySelectorAll('.cmd-item').forEach(item => {
            item.addEventListener('click', (e) => {
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
