import { BaseComponent } from '../base.js';

export class OllamaTerminal extends BaseComponent {
    constructor() {
        super();
    }

    connectedCallback(): void {
        this.render(`
            <style>
                .terminal-container {
                    background: #0f172a;
                    border: 1px solid var(--border-color, rgba(255, 255, 255, 0.05));
                    border-radius: 12px;
                    padding: 16px;
                    font-family: 'JetBrains Mono', 'Fira Code', monospace;
                    height: 300px;
                    display: flex;
                    flex-direction: column;
                }
                .terminal-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 12px;
                    padding-bottom: 12px;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
                }
                .terminal-output {
                    flex: 1;
                    overflow-y: auto;
                    color: #e2e8f0;
                    font-size: 13px;
                    white-space: pre-wrap;
                    margin-bottom: 12px;
                }
                .terminal-input-row {
                    display: flex;
                    gap: 8px;
                    align-items: center;
                }
                .terminal-prompt { color: var(--accent-primary, #6366f1); font-weight: bold; }
                .terminal-input {
                    background: transparent;
                    border: none;
                    color: white;
                    flex: 1;
                    outline: none;
                    font-family: inherit;
                    font-size: 13px;
                }
                .output-line { margin-bottom: 4px; }
                .output-line.command { color: #94a3b8; border-left: 2px solid #334155; padding-left: 8px; margin: 8px 0; font-style: italic; }
            </style>
            <div class="terminal-container">
                <div class="terminal-header">
                    <span style="font-size: 12px; color: var(--text-secondary); font-weight: 600;">INTEGRATED OLLAMA TERMINAL</span>
                    <button class="btn btn-secondary btn-xs" id="clear-btn">Clear</button>
                </div>
                <div id="terminal-output" class="terminal-output">
                    <div class="output-line">Welcome to DOAP Integrated Terminal. Commands here run in your WSL environment.</div>
                </div>
                <div class="terminal-input-row">
                    <span class="terminal-prompt">$</span>
                    <input type="text" id="terminal-input" class="terminal-input" placeholder="Type command (e.g. ollama list)..." autofocus>
                </div>
            </div>
        `);

        this.setupEventListeners();
    }

    private setupEventListeners(): void {
        const shadow = this.shadowRoot;
        if (!shadow) return;

        const input = shadow.getElementById('terminal-input') as HTMLInputElement;
        const clearBtn = shadow.getElementById('clear-btn');

        input?.addEventListener('keydown', (e: KeyboardEvent) => {
            if (e.key === 'Enter') {
                const cmd = input.value.trim();
                if (cmd) this.runCommand(cmd);
                input.value = '';
            }
        });

        clearBtn?.addEventListener('click', () => {
            const output = shadow.getElementById('terminal-output');
            if (output) output.innerHTML = '';
        });

        // Global listener to bridge other components (like Models) to the terminal
        window.addEventListener('run-terminal-command', (e: any) => {
            if (e.detail && e.detail.command) {
                this.runCommand(e.detail.command, e.detail.isPrompt);
            }
        });

        if ((window as any).api && (window as any).api.onTerminalData) {
            (window as any).api.onTerminalData((data: string) => this.appendToOutput(data));
        }
    }

    private appendToOutput(text: string, isCommand: boolean = false): void {
        const output = this.shadowRoot?.getElementById('terminal-output');
        if (!output) return;

        const line = document.createElement('div');
        line.className = isCommand ? 'output-line command' : 'output-line';
        line.innerText = isCommand ? `> ${text}` : text;
        output.appendChild(line);
        output.scrollTop = output.scrollHeight;
    }

    private async runCommand(cmd: string, isPrompt: boolean = false): Promise<void> {
        this.appendToOutput(cmd, true);
        if (!(window as any).api) return;

        try {
            const res = await (window as any).api.runWslCommand(cmd);
            if (!res.success) {
                this.appendToOutput(`Error: ${res.error}`);
            }
        } catch (e: any) {
            this.appendToOutput(`Exception: ${e.message}`);
        }
    }
}

customElements.define('ollama-terminal', OllamaTerminal);
