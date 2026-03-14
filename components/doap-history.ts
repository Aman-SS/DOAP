import { BaseComponent } from './base.js';

export class DoapHistory extends BaseComponent {
    constructor() {
        super();
        this.render(`
            <style>
                .history-list {
                    display: grid;
                    gap: 16px;
                }
                .history-item {
                    background: var(--bg-card, rgba(30, 41, 59, 0.4));
                    border: 1px solid var(--border-color, rgba(255, 255, 255, 0.05));
                    border-radius: 12px;
                    padding: 20px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    transition: all 0.2s;
                }
                .history-item:hover {
                    border-color: var(--accent-primary, #6366f1);
                    background: rgba(30, 41, 59, 0.6);
                }
                .item-info {
                    flex: 1;
                }
                .item-title {
                    font-weight: 600;
                    margin-bottom: 4px;
                    color: var(--text-primary, #f8fafc);
                }
                .item-meta {
                    font-size: 12px;
                    color: var(--text-secondary, #94a3b8);
                }
                .item-actions {
                    display: flex;
                    gap: 8px;
                }
            </style>
            <h2>Scrape History</h2>
            <div id="history-container" class="history-list">
                <p>Loading history...</p>
            </div>
        `);
    }

    connectedCallback(): void {
        this.loadHistory();
        window.addEventListener('history-updated', () => this.loadHistory());
    }

    async loadHistory(): Promise<void> {
        const container = this.shadowRoot?.getElementById('history-container');
        if (!container) return;

        try {
            const history = await (window as any).api.getHistory();
            if (history.length === 0) {
                container.innerHTML = '<p>No history found. Start by scraping a website!</p>';
                return;
            }

            container.innerHTML = history.map((item: any) => `
                <div class="history-item">
                    <div class="item-info">
                        <div class="item-title">${this.escapeHTML(item.title || 'Untitled')}</div>
                        <div class="item-meta">${item.url} • ${new Date(item.created_at).toLocaleString()}</div>
                    </div>
                    <div class="item-actions">
                        <button class="btn btn-sm btn-secondary view-btn" data-id="${item.id}">View</button>
                        <button class="btn btn-sm btn-secondary delete-btn" data-id="${item.id}" style="color: #ef4444;">Delete</button>
                    </div>
                </div>
            `).join('');

            container.querySelectorAll('.view-btn').forEach(btn => {
                btn.addEventListener('click', () => this.viewItem(parseInt((btn as HTMLElement).dataset.id!)));
            });

            container.querySelectorAll('.delete-btn').forEach(btn => {
                btn.addEventListener('click', () => this.deleteItem(parseInt((btn as HTMLElement).dataset.id!)));
            });
        } catch (err) {
            container.innerHTML = '<p>Error loading history.</p>';
        }
    }

    async viewItem(id: number): Promise<void> {
        const history = await (window as any).api.getHistory();
        const item = history.find((h: any) => h.id === id);
        if (item) {
            window.dispatchEvent(new CustomEvent('open-modal', {
                detail: {
                    title: item.title || 'Scrape Details',
                    content: item.content
                }
            }));
        }
    }

    async deleteItem(id: number): Promise<void> {
        if (confirm('Are you sure you want to delete this scrape?')) {
            const success = await (window as any).api.deleteScrape(id);
            if (success) {
                this.loadHistory();
                window.dispatchEvent(new Event('history-updated'));
            }
        }
    }
}

customElements.define('doap-history', DoapHistory);
