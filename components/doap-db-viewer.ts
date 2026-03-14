import { BaseComponent } from './base.js';

export class DoapDbViewer extends BaseComponent {
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
                .db-controls {
                    display: flex;
                    gap: 12px;
                }
                .db-table-wrapper {
                    background: var(--bg-card, rgba(30, 41, 59, 0.4));
                    border: 1px solid var(--border-color, rgba(255, 255, 255, 0.05));
                    border-radius: 12px;
                    overflow: auto;
                    max-height: calc(100vh - 200px);
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    font-size: 13px;
                }
                th {
                    background: rgba(15, 23, 42, 0.6);
                    color: var(--text-secondary, #94a3b8);
                    font-weight: 600;
                    text-align: left;
                    padding: 16px;
                    position: sticky;
                    top: 0;
                    z-index: 10;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    font-size: 11px;
                }
                td {
                    padding: 16px;
                    border-bottom: 1px solid var(--border-color, rgba(255, 255, 255, 0.05));
                    color: var(--text-primary, #f8fafc);
                    max-width: 300px;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
                tr:last-child td {
                    border-bottom: none;
                }
                tr:hover td {
                    background: rgba(255, 255, 255, 0.02);
                }
            </style>
            
            <div class="history-container">
                <div class="history-header">
                    <h3>Database Tables</h3>
                    <div class="db-controls">
                        <select id="table-select" class="btn btn-secondary btn-sm">
                            <option value="scrapes">scrapes</option>
                            <option value="insights">insights</option>
                        </select>
                        <button class="btn btn-secondary btn-sm" id="refresh-btn">Refresh</button>
                    </div>
                </div>
                <div class="db-table-wrapper">
                    <table id="db-table">
                        <thead>
                            <tr id="db-table-head"></tr>
                        </thead>
                        <tbody id="db-table-body"></tbody>
                    </table>
                </div>
            </div>
        `);
    }

    connectedCallback(): void {
        this.loadDbViewer();
        
        const shadow = this.shadowRoot;
        if (!shadow) return;

        shadow.getElementById('refresh-btn')?.addEventListener('click', () => this.loadDbViewer());
        shadow.getElementById('table-select')?.addEventListener('change', () => this.loadDbViewer());
        
        window.addEventListener('history-updated', () => this.loadDbViewer());
    }

    async loadDbViewer(): Promise<void> {
        const shadow = this.shadowRoot;
        if (!shadow || !(window as any).api) return;
        
        const tableSelect = shadow.getElementById('table-select') as HTMLSelectElement;
        const tableName = tableSelect.value;
        const data = await (window as any).api.getTableData(tableName);
        
        const tableHead = shadow.getElementById('db-table-head') as HTMLElement;
        const tableBody = shadow.getElementById('db-table-body') as HTMLElement;
        
        if (!data || data.length === 0) {
            tableHead.innerHTML = '<th>No data found</th>';
            tableBody.innerHTML = '';
            return;
        }
        
        const allColumns = Object.keys(data[0]);
        const displayColumns = allColumns.filter(col => col !== 'content' && col !== 'markdown');
        
        tableHead.innerHTML = displayColumns.map(col => `<th>${col}</th>`).join('') + '<th>Actions</th>';
        
        tableBody.innerHTML = '';
        
        data.forEach((row: any) => {
            const tr = document.createElement('tr');
            
            // Generate columns
            const colsHtml = displayColumns.map(col => `<td>${this.escapeHTML(String(row[col]))}</td>`).join('');
            
            // Actions Setup
            const actionsTd = document.createElement('td');
            const actionsDiv = document.createElement('div');
            actionsDiv.style.display = 'flex';
            actionsDiv.style.gap = '8px';

            if (tableName === 'scrapes') {
                const viewContentBtn = document.createElement('button');
                viewContentBtn.className = 'btn btn-secondary btn-sm';
                viewContentBtn.innerText = 'See Content';
                viewContentBtn.onclick = () => window.dispatchEvent(new CustomEvent('open-modal', {
                    detail: { title: 'Full Content', content: row.content }
                }));

                const viewMarkdownBtn = document.createElement('button');
                viewMarkdownBtn.className = 'btn btn-secondary btn-sm';
                viewMarkdownBtn.innerText = 'See Markdown';
                viewMarkdownBtn.onclick = () => window.dispatchEvent(new CustomEvent('open-modal', {
                    detail: { title: 'Markdown Content', content: row.markdown }
                }));

                actionsDiv.appendChild(viewContentBtn);
                actionsDiv.appendChild(viewMarkdownBtn);
            }

            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'btn btn-secondary btn-sm';
            deleteBtn.style.color = '#ef4444';
            deleteBtn.innerText = 'Delete';
            deleteBtn.onclick = async () => {
                if (!confirm('Delete this record?')) return;
                const result = await (window as any).api.deleteScrape(row.id);
                if (result) {
                    window.dispatchEvent(new Event('history-updated'));
                } else {
                    alert('Failed to delete');
                }
            };
            
            actionsDiv.appendChild(deleteBtn);
            actionsTd.appendChild(actionsDiv);
            
            tr.innerHTML = colsHtml;
            tr.appendChild(actionsTd);
            
            tableBody.appendChild(tr);
        });
    }
}

customElements.define('doap-db-viewer', DoapDbViewer);
