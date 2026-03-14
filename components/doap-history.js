import { BaseComponent } from './base.js';

export class DoapHistory extends BaseComponent {
    constructor() {
        super();
        this.render(`
            <style>
                .history-container {
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                    height: 100%;
                }
                .history-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .history-list {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                    overflow-y: auto;
                    padding-right: 8px;
                }
                .history-item-card {
                    background: var(--bg-card, rgba(30, 41, 59, 0.4));
                    border: 1px solid var(--border-color, rgba(255, 255, 255, 0.05));
                    border-radius: 12px;
                    padding: 20px;
                    transition: all 0.2s ease;
                }
                .history-item-card:hover {
                    border-color: rgba(255, 255, 255, 0.1);
                    transform: translateX(4px);
                }
                .history-item-header {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                    margin-bottom: 12px;
                }
                .item-info {
                    display: flex;
                    gap: 12px;
                    font-size: 12px;
                }
                .url-tag {
                    color: var(--accent-primary, #6366f1);
                    font-weight: 600;
                }
                .date-tag {
                    color: var(--text-secondary, #94a3b8);
                }
                .item-body p {
                    font-size: 13px;
                    display: -webkit-box;
                    -webkit-line-clamp: 3;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }
                .item-actions {
                    display: flex;
                    gap: 12px;
                    margin-top: 16px;
                }
                .empty-state {
                    text-align: center;
                    padding: 40px;
                    color: var(--text-secondary, #94a3b8);
                    background: rgba(15, 23, 42, 0.3);
                    border-radius: 12px;
                    border: 1px dashed var(--border-color, rgba(255, 255, 255, 0.1));
                }
            </style>
            
            <div class="history-container">
                <div class="history-header">
                    <h3>Scrape History</h3>
                    <button class="btn btn-secondary btn-sm" id="refresh-btn">Refresh</button>
                </div>
                <div id="history-list" class="history-list">
                    <div class="empty-state">Loading history...</div>
                </div>
            </div>
        `);
    }

    connectedCallback() {
        this.loadHistory();
        this.shadowRoot.getElementById('refresh-btn').addEventListener('click', () => {
            window.dispatchEvent(new Event('history-updated'));
            this.loadHistory();
        });

        // Listen for global external changes (e.g., from Scrape component)
        window.addEventListener('history-updated', () => this.loadHistory());
    }

    async loadHistory() {
        if (!window.api) return;
        const historyList = this.shadowRoot.getElementById('history-list');
        const history = await window.api.getHistory();

        if (history.length === 0) {
            historyList.innerHTML = '<div class="empty-state">No scrapes found yet. Start by crawling a website!</div>';
            return;
        }

        historyList.innerHTML = '';
        
        history.forEach(item => {
            const card = document.createElement('div');
            card.className = 'history-item-card';
            card.innerHTML = `
                <div class="history-item-header">
                    <div class="item-info">
                        <span class="url-tag">${new URL(item.url).hostname}</span>
                        <span class="date-tag">${new Date(item.created_at).toLocaleDateString()}</span>
                    </div>
                    <h5>${item.title || 'Untitled Scrape'}</h5>
                </div>
                <div class="item-body">
                    <p>${item.content.substring(0, 200)}...</p>
                </div>
                <div class="item-actions">
                    <button class="btn btn-secondary btn-sm view-btn">View Content</button>
                    <button class="btn btn-primary btn-sm plan-btn">Plan with AI</button>
                    <button class="btn btn-secondary btn-sm delete-btn" style="color: #ef4444;">Delete</button>
                </div>
            `;

            // Bind events for this specific card
            card.querySelector('.view-btn').addEventListener('click', () => {
                window.dispatchEvent(new CustomEvent('open-modal', {
                    detail: { title: `Content from ${item.url}`, content: item.content }
                }));
            });

            card.querySelector('.plan-btn').addEventListener('click', () => {
                window.dispatchEvent(new CustomEvent('ask-ai', { detail: { id: item.id } }));
            });

            card.querySelector('.delete-btn').addEventListener('click', async () => {
                if (!confirm('Are you sure you want to delete this scrape and all associated AI insights?')) return;
                const result = await window.api.deleteScrape(item.id);
                if (result) {
                    window.dispatchEvent(new Event('history-updated'));
                } else {
                    alert('Failed to delete');
                }
            });

            historyList.appendChild(card);
        });
    }
}

customElements.define('doap-history', DoapHistory);
