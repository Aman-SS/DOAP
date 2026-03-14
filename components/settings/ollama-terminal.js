import { BaseComponent } from '../base.js';

export class OllamaTerminal extends BaseComponent {
    constructor() {
        super();
        this.terminalHistory = [];
        this.historyIndex = -1;
    }

    connectedCallback() {
        this.render(`
            <style>
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
                    max-height: 400px;
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
                .terminal-input-line input:focus { outline: none; }
            </style>
            <div class="terminal-container">
                <div id="output" class="terminal-box">Ollama WSL Bridge Ready...</div>
                <div class="terminal-input-line">
                    <span class="terminal-prompt">$</span>
                    <input type="text" id="input" placeholder="Run command...">
                </div>
            </div>
        `);

        this.setupEventListeners();
    }

    setupEventListeners() {
        const input = this.shadowRoot.getElementById('input');
        
        if (window.api && window.api.onTerminalData) {
            window.api.onTerminalData((data) => this.append(data));
            window.api.onTerminalExit((code) => {
                window.dispatchEvent(new CustomEvent('terminal-command-exit', { detail: { code } }));
            });
        }

        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const cmd = e.target.value.trim();
                if (!cmd) return;
                e.target.value = '';
                
                if (cmd.toLowerCase() === 'clear') {
                    this.shadowRoot.getElementById('output').innerHTML = '<div style="color: #64748b;">Ollama WSL Bridge Ready...</div>';
                    return;
                }
                
                this.execute(cmd);
                
                this.terminalHistory.push(cmd);
                if (this.terminalHistory.length > 50) this.terminalHistory.shift();
                this.historyIndex = -1;
                
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                if (this.terminalHistory.length > 0) {
                    if (this.historyIndex === -1) this.historyIndex = this.terminalHistory.length - 1;
                    else this.historyIndex = Math.max(0, this.historyIndex - 1);
                    input.value = this.terminalHistory[this.historyIndex];
                }
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                if (this.historyIndex !== -1) {
                    this.historyIndex = Math.min(this.terminalHistory.length - 1, this.historyIndex + 1);
                    input.value = this.terminalHistory[this.historyIndex];
                    if (this.historyIndex === this.terminalHistory.length - 1) this.historyIndex = -1;
                }
            }
        });

        // Listen for global command requests from other components
        window.addEventListener('run-terminal-command', (e) => {
            if (e.detail && e.detail.command) {
                this.execute(e.detail.command, e.detail.isPrompt);
            }
        });
    }

    execute(command, isPrompt = true) {
        if (!window.api) return;
        if (isPrompt) this.append(command, 'prompt');
        window.api.terminalCommandStream(command);
        window.dispatchEvent(new CustomEvent('terminal-command-start', { detail: { command } }));
    }

    append(text, type = 'output') {
        const output = this.shadowRoot.getElementById('output');
        if (!output) return;
        
        const line = document.createElement('div');
        line.style.marginBottom = '4px';
        
        if (type === 'prompt') {
            line.innerHTML = `<span class="terminal-prompt">$</span> <span style="color: #38bdf8;">${this.escapeHTML(text)}</span>`;
        } else if (type === 'error') {
            line.innerHTML = `<span style="color: #ef4444;">${this.escapeHTML(text)}</span>`;
        } else {
            line.style.whiteSpace = 'pre-wrap';
            line.textContent = text;
        }
        
        output.appendChild(line);
        output.scrollTop = output.scrollHeight;
    }

    escapeHTML(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }
}

customElements.define('ollama-terminal', OllamaTerminal);
