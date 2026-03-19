import { BaseComponent } from '../base.js';
import '../common/base-terminal.js';

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
                    height: 400px;
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
                .terminal-content {
                    flex: 1;
                    min-height: 0;
                }
                .terminal-title {
                    font-size: 12px;
                    color: var(--text-secondary);
                    font-weight: 600;
                    letter-spacing: 0.05em;
                }
            </style>
            <div class="terminal-container">
                <div class="terminal-header">
                    <span class="terminal-title">INTEGRATED INTERACTIVE TERMINAL</span>
                    <div class="status-badge online" style="font-size: 10px;">WSL Active</div>
                </div>
                <div class="terminal-content">
                    <base-terminal></base-terminal>
                </div>
            </div>
        `);
    }
}

customElements.define('ollama-terminal', OllamaTerminal);
