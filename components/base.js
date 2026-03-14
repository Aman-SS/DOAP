export class BaseComponent extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    // Helper to inject global styles into shadow DOM
    getSharedStyles() {
        return `
            <style>
                :host {
                    display: block;
                    width: 100%;
                    height: 100%;
                    animation: fadeIn 0.3s ease-out;
                }
                
                * {
                    box-sizing: border-box;
                    margin: 0;
                    padding: 0;
                }

                h2, h3, h4, h5 {
                    color: var(--text-primary, #f8fafc);
                    margin-bottom: 12px;
                    font-weight: 600;
                }
                
                p {
                    color: var(--text-secondary, #94a3b8);
                    line-height: 1.5;
                }

                .welcome-card {
                    background: linear-gradient(135deg, rgba(30, 41, 59, 0.8), rgba(15, 23, 42, 0.9));
                    border: 1px solid var(--border-color, rgba(255, 255, 255, 0.05));
                    border-radius: 16px;
                    padding: 30px;
                    margin-bottom: 24px;
                    box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.5);
                    position: relative;
                    overflow: hidden;
                }

                .welcome-card::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    height: 2px;
                    background: linear-gradient(90deg, transparent, var(--accent-primary, #6366f1), transparent);
                    opacity: 0.5;
                }

                /* Utility Buttons */
                .btn {
                    padding: 10px 20px;
                    border-radius: 8px;
                    font-family: inherit;
                    font-size: 14px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    border: none;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                }

                .btn:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                .btn-primary {
                    background: var(--accent-primary, #6366f1);
                    color: white;
                    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
                }

                .btn-primary:hover:not(:disabled) {
                    background: var(--accent-hover, #4f46e5);
                    transform: translateY(-1px);
                    box-shadow: 0 6px 16px rgba(99, 102, 241, 0.4);
                }

                .btn-secondary {
                    background: rgba(255, 255, 255, 0.05);
                    color: var(--text-primary, #f8fafc);
                    border: 1px solid var(--border-color, rgba(255, 255, 255, 0.1));
                }

                .btn-secondary:hover:not(:disabled) {
                    background: rgba(255, 255, 255, 0.1);
                }

                .btn-sm {
                    padding: 6px 12px;
                    font-size: 13px;
                }
                
                .btn-xs {
                    padding: 4px 8px;
                    font-size: 11px;
                    border-radius: 4px;
                }

                /* Forms */
                .form-card {
                    background: var(--bg-card, rgba(30, 41, 59, 0.4));
                    border: 1px solid var(--border-color, rgba(255, 255, 255, 0.05));
                    border-radius: 12px;
                    padding: 24px;
                }

                .input-group {
                    margin-bottom: 20px;
                }

                .input-group label {
                    display: block;
                    margin-bottom: 8px;
                    font-size: 13px;
                    font-weight: 600;
                    color: var(--text-secondary, #94a3b8);
                }

                input[type="text"], input[type="password"], select {
                    width: 100%;
                    padding: 12px 16px;
                    background: rgba(15, 23, 42, 0.6);
                    border: 1px solid var(--border-color, rgba(255, 255, 255, 0.1));
                    border-radius: 8px;
                    color: var(--text-primary, #f8fafc);
                    font-family: inherit;
                    font-size: 14px;
                    transition: all 0.2s ease;
                }

                input:focus, select:focus {
                    outline: none;
                    border-color: var(--accent-primary, #6366f1);
                    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
                }

                .input-with-action {
                    display: flex;
                    gap: 12px;
                }
                
                .input-with-action input {
                    flex: 1;
                }

                .hidden {
                    display: none !important;
                }

                /* Layout & Containers */
                .settings-section {
                    margin-bottom: 24px;
                }

                .section-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 24px;
                    padding-bottom: 16px;
                    border-bottom: 1px solid var(--border-color, rgba(255, 255, 255, 0.05));
                }

                .provider-info {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                /* Status Badges */
                .status-badge {
                    padding: 4px 12px;
                    border-radius: 20px;
                    font-size: 11px;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    background: rgba(255, 255, 255, 0.05);
                    color: var(--text-secondary, #94a3b8);
                }

                .status-badge.online {
                    background: rgba(16, 185, 129, 0.1);
                    color: #10b981;
                }

                .status-badge.offline {
                    background: rgba(239, 68, 68, 0.1);
                    color: #ef4444;
                }

                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                /* Icons */
                .material-symbols-rounded {
                    font-family: 'Material Symbols Rounded';
                    font-weight: normal;
                    font-style: normal;
                    font-size: 24px;
                    line-height: 1;
                    letter-spacing: normal;
                    text-transform: none;
                    display: inline-block;
                    white-space: nowrap;
                    word-wrap: normal;
                    direction: ltr;
                    -webkit-font-feature-settings: 'liga';
                    -webkit-font-smoothing: antialiased;
                }
            </style>
        `;
    }

    render(htmlContent) {
        this.shadowRoot.innerHTML = this.getSharedStyles() + htmlContent;
    }

    escapeHTML(str) {
        if (!str) return '';
        return str.replace(/[&<>"']/g, function(m) {
            return {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#039;'
            }[m];
        });
    }
}
