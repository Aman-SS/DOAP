import { BaseComponent } from '../base.js';

export class WslReference extends BaseComponent {
    constructor() {
        super();
    }

    connectedCallback() {
        this.render(`
            <style>
                .command-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
                    gap: 8px;
                    margin-top: 12px;
                }
                .command-item {
                    display: flex;
                    flex-direction: column;
                    padding: 8px 10px;
                    background: rgba(15, 23, 42, 0.4);
                    border: 1px solid var(--border-color, rgba(255, 255, 255, 0.05));
                    border-radius: 6px;
                    transition: all 0.2s ease;
                }
                .command-item:hover {
                    background: rgba(15, 23, 42, 0.6);
                    border-color: var(--accent-primary, #6366f1);
                    transform: translateY(-1px);
                }
                .cmd-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 4px;
                }
                .cmd-header h5 { 
                    margin: 0; 
                    font-size: 11px; 
                    color: var(--accent-primary, #6366f1);
                    font-family: 'Consolas', monospace;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                .cmd-desc {
                    font-size: 10px;
                    color: var(--text-secondary, #94a3b8);
                    line-height: 1.3;
                    margin-bottom: 6px;
                }
                .cmd-code {
                    font-family: 'Consolas', monospace;
                    font-size: 10px;
                    padding: 4px 6px;
                    background: rgba(0, 0, 0, 0.3);
                    border-radius: 4px;
                    color: #94a3b8;
                    word-break: break-all;
                    border: 1px solid rgba(255, 255, 255, 0.02);
                }
                .run-btn {
                    padding: 2px 6px !important;
                    font-size: 9px !important;
                    height: 18px;
                }
            </style>
            <div class="form-card settings-section" style="padding: 16px;">
                <div class="section-header" style="margin-bottom: 12px; padding-bottom: 8px;">
                    <div class="provider-info">
                        <span class="material-symbols-rounded" style="color: var(--accent-primary); font-size: 18px;">terminal</span>
                        <h4 style="font-size: 14px; margin: 0;">Full Command Reference</h4>
                    </div>
                </div>
                
                <div class="command-grid">
                    ${this.renderCommand('serve', 'Start server', 'ollama serve')}
                    ${this.renderCommand('run', 'Run a model', 'ollama run [name]')}
                    ${this.renderCommand('pull', 'Pull a model', 'ollama pull [name]')}
                    ${this.renderCommand('list', 'List installed', 'ollama list')}
                    ${this.renderCommand('ps', 'List running', 'ollama ps')}
                    ${this.renderCommand('show', 'Model details', 'ollama show [name]')}
                    ${this.renderCommand('create', 'Create model', 'ollama create [name] -f [path]')}
                    ${this.renderCommand('cp', 'Copy model', 'ollama cp [src] [dst]')}
                    ${this.renderCommand('rm', 'Delete model', 'ollama rm [name]')}
                    ${this.renderCommand('push', 'Push model', 'ollama push [name]')}
                    ${this.renderCommand('help', 'Help menu', 'ollama help')}
                    ${this.renderCommand('version', 'Check version', 'ollama --version')}
                    ${this.renderCommand('host', 'Allow remote', 'export OLLAMA_HOST="0.0.0.0"')}
                    ${this.renderCommand('restart', 'Hard kill', 'pkill ollama', '#ef4444')}
                    ${this.renderCommand('logs', 'View server logs', 'journalctl -u ollama')}
                </div>
            </div>
        `);

        this.setupEventListeners();
    }

    renderCommand(name, desc, cmd, color) {
        return `
            <div class="command-item">
                <div class="cmd-header">
                    <h5>${name}</h5>
                    <button class="btn btn-secondary run-btn" data-cmd='${cmd}' ${color ? `style="color: ${color};"` : ''}>Run</button>
                </div>
                <div class="cmd-desc">${desc}</div>
                <code class="cmd-code">${this.escapeHTML(cmd)}</code>
            </div>
        `;
    }

    setupEventListeners() {
        this.shadowRoot.querySelectorAll('.run-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const cmd = btn.getAttribute('data-cmd');
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
