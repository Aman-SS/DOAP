import { BaseComponent } from '../base.js';

declare const Terminal: any;
declare const FitAddon: any;

export class BaseTerminal extends BaseComponent {
    private terminal: any = null;
    private fitAddon: any = null;
    private terminalId: string = '';
    private onDataCleanup: (() => void) | null = null;
    private onExitCleanup: (() => void) | null = null;
    private userInputWired = false;
    private terminalContainer: HTMLElement | null = null;
    private wireUserInputOnceRef: (() => void) | null = null;

    constructor() {
        super();
        this.terminalId = `term-${Math.random().toString(36).substr(2, 9)}`;
    }

    async connectedCallback(): Promise<void> {
        this.render(`
            <style>
                :host {
                    display: block;
                    width: 100%;
                    height: 100%;
                }
                .terminal-wrapper {
                    position: relative;
                    width: 100%;
                    height: 100%;
                    min-height: 0;
                    background: #0f172a;
                    border-radius: 8px;
                    overflow: hidden;
                    padding: 8px;
                    border: 1px solid rgba(255, 255, 255, 0.05);
                }
                #xterm-container {
                    position: absolute !important;
                    top: 0 !important;
                    left: 0 !important;
                    right: 0 !important;
                    bottom: 0 !important;
                    overflow: hidden !important;
                }
                /* xterm root must fill container and not grow - all scroll happens in .xterm-viewport */
                #xterm-container .xterm {
                    position: absolute !important;
                    top: 0 !important;
                    left: 0 !important;
                    right: 0 !important;
                    bottom: 0 !important;
                    width: 100% !important;
                    height: 100% !important;
                    overflow: hidden !important;
                }
                #xterm-container .xterm-screen {
                    overflow: hidden !important;
                }
                /* xterm.css is in document; we're in shadow DOM so hide xterm's helper textarea (keep it over terminal so clicks focus it) */
                #xterm-container .xterm-helper-textarea,
                #xterm-container textarea {
                    opacity: 0 !important;
                    position: absolute !important;
                    top: 0 !important;
                    left: 0 !important;
                    width: 100% !important;
                    height: 100% !important;
                    resize: none !important;
                }
                /* xterm viewport: Y overflow so scrollback can scroll (xterm.css is in document, we're in shadow DOM) */
                #xterm-container .xterm-viewport {
                    overflow-y: auto !important;
                    overflow-x: hidden !important;
                }
                #xterm-container .xterm-scrollbar-visible {
                    overflow-y: scroll !important;
                }
                .xterm-viewport::-webkit-scrollbar {
                    width: 8px;
                }
                .xterm-viewport::-webkit-scrollbar-track {
                    background: rgba(15, 23, 42, 1);
                }
                .xterm-viewport::-webkit-scrollbar-thumb {
                    background: rgba(51, 65, 85, 1);
                    border-radius: 4px;
                }
                .xterm-viewport::-webkit-scrollbar-thumb:hover {
                    background: rgba(71, 85, 105, 1);
                }
            </style>
            <div class="terminal-wrapper">
                <div id="xterm-container"></div>
            </div>
        `);

        // Wait for next tick to ensure container is in DOM and has dimensions
        setTimeout(() => this.initTerminal(), 50);
    }

    disconnectedCallback(): void {
        this.cleanup();
    }

    private cleanup(): void {
        if (this.onDataCleanup) this.onDataCleanup();
        if (this.onExitCleanup) this.onExitCleanup();
        if (this.terminalContainer && this.wireUserInputOnceRef) {
            this.terminalContainer.removeEventListener('click', this.wireUserInputOnceRef);
            this.terminalContainer.removeEventListener('focusin', this.wireUserInputOnceRef);
            this.terminalContainer = null;
            this.wireUserInputOnceRef = null;
        }
        if (this.terminal) {
            this.terminal.dispose();
            this.terminal = null;
        }
        if ((window as any).api?.terminal) {
            (window as any).api.terminal.kill(this.terminalId);
        }
        window.removeEventListener('resize', this.handleResize);
    }

    private async initTerminal(): Promise<void> {
        const container = this.shadowRoot?.getElementById('xterm-container');
        if (!container || typeof Terminal === 'undefined') return;

        this.terminal = new Terminal({
            cursorBlink: true,
            scrollback: 5000,
            theme: {
                background: '#0f172a',
                foreground: '#e2e8f0',
                cursor: '#6366f1',
                selectionBackground: 'rgba(99, 102, 241, 0.3)',
                black: '#1e293b',
                red: '#ef4444',
                green: '#10b981',
                yellow: '#f59e0b',
                blue: '#3b82f6',
                magenta: '#8b5cf6',
                cyan: '#06b6d4',
                white: '#f8fafc'
            },
            fontSize: 13,
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            letterSpacing: 0,
            lineHeight: 1.2
        });

        if (typeof FitAddon !== 'undefined') {
            this.fitAddon = new FitAddon.FitAddon();
            this.terminal.loadAddon(this.fitAddon);
        }

        this.terminal.open(container);
        this.fitAddon?.fit();
        this.terminal.clear();
        requestAnimationFrame(() => {
            this.fitAddon?.fit();
        });

        // Don't take focus on open so stray key events don't type into the terminal.
        if (typeof this.terminal.blur === 'function') {
            this.terminal.blur();
        }
        (container as HTMLElement).setAttribute('tabindex', '0');
        setTimeout(() => {
            if (document.activeElement && (container as HTMLElement).contains(document.activeElement)) {
                (document.activeElement as HTMLElement).blur();
            }
        }, 0);

        // Register resize handler
        window.addEventListener('resize', this.handleResize);

        // Link with Backend PTY
        const api = (window as any).api;
        if (api?.terminal) {
            await api.terminal.spawn(this.terminalId);

            // Initial resize to match fit
            const { cols, rows } = this.terminal;
            api.terminal.resize(this.terminalId, cols, rows);

            // Handle incoming data (PTY -> screen); scroll to bottom so new output is visible, not space at top
            this.onDataCleanup = api.terminal.onData(this.terminalId, (data: string) => {
                this.terminal.write(data);
                if (typeof this.terminal.scrollToBottom === 'function') {
                    this.terminal.scrollToBottom();
                }
            });

            // Handle terminal exit
            this.onExitCleanup = api.terminal.onExit(this.terminalId, (info: any) => {
                this.terminal.write(`\r\n\x1b[31m[Process exited with code ${info.exitCode}]\x1b[0m\r\n`);
                if (typeof this.terminal.scrollToBottom === 'function') {
                    this.terminal.scrollToBottom();
                }
            });

            // Wire user typing only on first focus/click so stray keys never reach the PTY
            const containerEl = container as HTMLElement;
            this.terminalContainer = containerEl;
            this.wireUserInputOnceRef = () => {
                if (this.userInputWired || !this.terminal) return;
                this.userInputWired = true;
                this.terminal.onData((data: string) => {
                    api.terminal.write(this.terminalId, data);
                });
                if (this.terminalContainer && this.wireUserInputOnceRef) {
                    this.terminalContainer.removeEventListener('click', this.wireUserInputOnceRef);
                    this.terminalContainer.removeEventListener('focusin', this.wireUserInputOnceRef);
                }
            };
            containerEl.addEventListener('click', this.wireUserInputOnceRef);
            containerEl.addEventListener('focusin', this.wireUserInputOnceRef);

            // Global: send command to this terminal
            window.addEventListener('run-terminal-command', (e: any) => {
                if (e.detail && e.detail.command) {
                    api.terminal.write(this.terminalId, e.detail.command + '\n');
                }
            });
        }
    }

    private handleResize = () => {
        if (this.fitAddon) {
            this.fitAddon.fit();
            const { cols, rows } = this.terminal;
            (window as any).api?.terminal?.resize(this.terminalId, cols, rows);
        }
    }
}

customElements.define('base-terminal', BaseTerminal);
