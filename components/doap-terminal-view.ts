import { BaseComponent } from './base.js';
import './common/base-terminal.js';

export class DoapTerminalView extends BaseComponent {
    constructor() {
        super();
    }

    connectedCallback(): void {
        this.render(`
            <style>
                .terminal-view-container {
                    display: flex;
                    flex-direction: column;
                    flex: 1 1 0;
                    min-height: 0;
                    gap: 20px;
                }
                .terminal-wrapper {
                    flex: 1 1 0;
                    min-height: 0;
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                    background: #0f172a;
                    border: 1px solid var(--border-color, rgba(255, 255, 255, 0.05));
                    border-radius: 12px;
                    padding: 4px;
                }
                .terminal-wrapper base-terminal {
                    flex: 1;
                    min-height: 0;
                    overflow: hidden;
                }
                .view-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .terminal-info {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }
                .terminal-icon {
                    width: 40px;
                    height: 40px;
                    border-radius: 10px;
                    background: rgba(99, 102, 241, 0.1);
                    color: var(--accent-primary);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
            </style>
            
            <div class="terminal-view-container">
                <div class="view-header">
                    <div class="terminal-info">
                        <div class="terminal-icon">
                            <span class="material-symbols-rounded">terminal</span>
                        </div>
                        <div>
                            <h2 style="margin: 0;">WSL Terminal</h2>
                            <p style="margin: 4px 0 0 0; color: var(--text-secondary); font-size: 14px;">Full interactive shell access to your WSL environment.</p>
                        </div>
                    </div>
                </div>
                
                <div class="terminal-wrapper">
                    <base-terminal></base-terminal>
                </div>
            </div>
        `);
    }
}

customElements.define('doap-terminal-view', DoapTerminalView);
