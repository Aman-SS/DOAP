import { BaseComponent } from './base.js';

interface ArchBlock {
    id: string;
    name: string;
    icon: string;
    color: string;
    view: string;
    description: string;
    tech: string;
    status: 'active' | 'ready' | 'service';
    phase: 'built' | 'planned';
    timeline?: string;
}

interface ArchLayer {
    title: string;
    subtitle: string;
    color: string;
    icon: string;
    blocks: ArchBlock[];
}

interface Connection {
    from: string;
    to: string;
}

export class DoapFeatureMap extends BaseComponent {
    private resizeObserver: ResizeObserver | null = null;

    private layers: ArchLayer[] = [
        {
            title: 'Presentation',
            subtitle: 'User-facing views',
            color: '#6366f1',
            icon: 'visibility',
            blocks: [
                { id: 'home', name: 'Home', icon: 'home', color: '#6366f1', view: 'home', description: 'Central hub with search, quick-links, and live Ollama status monitoring', tech: 'Web Components', status: 'active', phase: 'built' },
                { id: 'browser', name: 'Browser', icon: 'language', color: '#38bdf8', view: 'browser', description: 'Embedded Chromium browser for previewing and scraping target websites', tech: 'Electron Webview', status: 'ready', phase: 'built' },
                { id: 'curiosity', name: 'Curiosity', icon: 'psychology', color: '#a855f7', view: 'curiosity', description: 'RAG-powered AI assistant that queries scraped data with context-aware prompts', tech: 'RAG Pipeline', status: 'active', phase: 'built' },
                { id: 'dashboard-widgets', name: 'Dashboard Widgets', icon: 'widgets', color: '#6366f1', view: '', description: 'Customizable dashboard with user-defined quick links and data widgets', tech: 'Web Components', status: 'ready', phase: 'planned', timeline: 'Short-term' },
                { id: 'knowledge-graph', name: 'Knowledge Graph', icon: 'share', color: '#a855f7', view: '', description: 'Interactive entity relationship visualization from scraped content', tech: 'Canvas / WebGL', status: 'ready', phase: 'planned', timeline: 'Long-term' },
            ]
        },
        {
            title: 'Application',
            subtitle: 'Core processing',
            color: '#10b981',
            icon: 'settings_suggest',
            blocks: [
                { id: 'scraper', name: 'Web Scraper', icon: 'query_stats', color: '#10b981', view: 'scrape', description: 'Crawls URLs, extracts content via Readability, and stores structured data locally', tech: 'Cheerio · JSDOM', status: 'active', phase: 'built' },
                { id: 'history', name: 'History', icon: 'history', color: '#8b5cf6', view: 'history', description: 'Browsable log of all scrape sessions with metadata, timestamps, and previews', tech: 'SQLite Queries', status: 'ready', phase: 'built' },
                { id: 'multi-llm', name: 'Multi-LLM', icon: 'model_training', color: '#ec4899', view: 'settings', description: 'Orchestrates multiple Ollama models for parallel inference and comparison', tech: 'Ollama API', status: 'service', phase: 'built' },
                { id: 'data-export', name: 'Data Export', icon: 'download', color: '#10b981', view: '', description: 'Export scraped data and AI insights in CSV, JSON, and PDF formats', tech: 'File System API', status: 'ready', phase: 'planned', timeline: 'Short-term' },
                { id: 'auto-summarizer', name: 'Auto Summarizer', icon: 'summarize', color: '#ec4899', view: '', description: 'Automated content summarization with entity extraction and sentiment analysis', tech: 'LLM Pipeline', status: 'service', phase: 'planned', timeline: 'Medium-term' },
                { id: 'scheduled-scraper', name: 'Scheduled Scraper', icon: 'schedule', color: '#10b981', view: '', description: 'Cron-based automated scraping with change detection and smart notifications', tech: 'Node Scheduler', status: 'ready', phase: 'planned', timeline: 'Long-term' },
            ]
        },
        {
            title: 'Infrastructure',
            subtitle: 'Data & services',
            color: '#f59e0b',
            icon: 'dns',
            blocks: [
                { id: 'sqlite', name: 'SQLite DB', icon: 'database', color: '#3b82f6', view: 'db-viewer', description: 'Local relational database storing scraped content, metadata, and session history', tech: 'sqlite3 · Node', status: 'active', phase: 'built' },
                { id: 'ollama', name: 'Ollama Hub', icon: 'smart_toy', color: '#f59e0b', view: 'settings', description: 'Model management hub — pull, run, and monitor local LLM instances on device', tech: 'Ollama Service', status: 'service', phase: 'built' },
                { id: 'wsl', name: 'WSL Terminal', icon: 'terminal', color: '#64748b', view: 'terminal', description: 'Integrated Linux shell via WSL for direct system access and command execution', tech: 'node-pty · xterm', status: 'ready', phase: 'built' },
                { id: 'plugin-system', name: 'Plugin System', icon: 'extension', color: '#f59e0b', view: '', description: 'Extensible plugin architecture with marketplace for community-created extensions', tech: 'Plugin SDK', status: 'ready', phase: 'planned', timeline: 'Long-term' },
                { id: 'cloud-sync', name: 'Cloud Sync', icon: 'cloud_sync', color: '#3b82f6', view: '', description: 'Opt-in cross-device sync for knowledge bases and AI query history', tech: 'Cloud APIs', status: 'service', phase: 'planned', timeline: 'Medium-term' },
                { id: 'external-apis', name: 'External AI APIs', icon: 'api', color: '#f59e0b', view: '', description: 'Support for OpenAI, Anthropic, and other cloud AI providers alongside Ollama', tech: 'REST / SDK', status: 'service', phase: 'planned', timeline: 'Medium-term' },
            ]
        }
    ];

    private connections: Connection[] = [
        { from: 'home', to: 'scraper' },
        { from: 'home', to: 'history' },
        { from: 'browser', to: 'scraper' },
        { from: 'curiosity', to: 'multi-llm' },
        { from: 'curiosity', to: 'sqlite' },
        { from: 'scraper', to: 'sqlite' },
        { from: 'history', to: 'sqlite' },
        { from: 'multi-llm', to: 'ollama' },
        { from: 'ollama', to: 'wsl' },
        // Planned connections
        { from: 'dashboard-widgets', to: 'data-export' },
        { from: 'knowledge-graph', to: 'auto-summarizer' },
        { from: 'data-export', to: 'sqlite' },
        { from: 'auto-summarizer', to: 'ollama' },
        { from: 'scheduled-scraper', to: 'sqlite' },
        { from: 'multi-llm', to: 'external-apis' },
        { from: 'external-apis', to: 'cloud-sync' },
    ];

    constructor() {
        super();
        this.render(`
            <style>
                :host {
                    --arch-gap: 16px;
                }

                .arch-container {
                    position: relative;
                    width: 100%;
                    padding-bottom: 12px;
                }

                /* SVG connection overlay */
                .connections-svg {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    pointer-events: none;
                    z-index: 1;
                }

                .conn-line {
                    stroke: rgba(148, 163, 184, 0.3);
                    stroke-width: 2;
                    fill: none;
                    stroke-dasharray: 8 5;
                    animation: dashFlow 1.2s linear infinite;
                }

                .conn-line-glow {
                    stroke: rgba(99, 102, 241, 0.08);
                    stroke-width: 8;
                    fill: none;
                    filter: blur(2px);
                }

                .conn-line-planned {
                    stroke: rgba(148, 163, 184, 0.12);
                    stroke-width: 1.5;
                    fill: none;
                    stroke-dasharray: 4 6;
                    animation: dashFlow 2s linear infinite;
                }

                @keyframes dashFlow {
                    to { stroke-dashoffset: -26; }
                }

                /* Columns layout — layers side by side */
                .columns-root {
                    display: grid;
                    grid-template-columns: 1fr auto 1fr auto 1fr;
                    gap: 0;
                    align-items: stretch;
                    position: relative;
                    z-index: 2;
                }

                @media (max-width: 800px) {
                    .columns-root {
                        grid-template-columns: 1fr;
                    }
                    .flow-indicator-h { display: none !important; }
                }

                /* Layer column */
                .arch-layer {
                    position: relative;
                    z-index: 2;
                    background: rgba(15, 23, 42, 0.25);
                    border: 1px solid rgba(255, 255, 255, 0.06);
                    border-radius: 16px;
                    padding: 20px;
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                    opacity: 0;
                    transform: translateX(-20px);
                    animation: layerIn 0.5s ease-out forwards;
                }

                .arch-layer:nth-child(1) { animation-delay: 0.1s; }
                .arch-layer:nth-child(3) { animation-delay: 0.25s; }
                .arch-layer:nth-child(5) { animation-delay: 0.4s; }

                @keyframes layerIn {
                    to { opacity: 1; transform: translateX(0); }
                }

                /* Layer header */
                .layer-header {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                    padding-bottom: 12px;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
                    text-align: center;
                }

                .layer-icon-wrap {
                    width: 36px;
                    height: 36px;
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: rgba(255, 255, 255, 0.04);
                    border: 1px solid rgba(255, 255, 255, 0.06);
                    margin: 0 auto 4px;
                }

                .layer-icon-wrap .material-symbols-rounded {
                    font-size: 20px;
                    color: var(--layer-color, #94a3b8);
                }

                .layer-title {
                    font-size: 12px;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 1.5px;
                    color: var(--layer-color, #94a3b8);
                }

                .layer-subtitle {
                    font-size: 11px;
                    color: var(--text-secondary, #64748b);
                    font-weight: 400;
                }

                /* Section divider within layer */
                .section-divider {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    margin: 4px 0;
                }

                .section-divider-line {
                    flex: 1;
                    height: 1px;
                    background: rgba(255, 255, 255, 0.06);
                }

                .section-divider-label {
                    font-size: 9px;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 1.5px;
                    color: rgba(148, 163, 184, 0.35);
                    white-space: nowrap;
                }

                /* Block card — built (default) */
                .arch-block {
                    position: relative;
                    background: rgba(30, 41, 59, 0.35);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    border-radius: 12px;
                    padding: 16px;
                    cursor: pointer;
                    transition: all 0.25s ease;
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                    overflow: hidden;
                }

                .arch-block::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    bottom: 0;
                    width: 3px;
                    background: var(--block-color, #6366f1);
                    opacity: 0.5;
                    transition: opacity 0.25s ease;
                    border-radius: 3px 0 0 3px;
                }

                .arch-block:hover {
                    /* Don't translate on hover; moving the card under the cursor can trigger
                       hover on neighboring cards (looks like "connected" highlighting). */
                    transform: none;
                    border-color: var(--block-color, #6366f1);
                    box-shadow: 0 6px 20px -6px rgba(0, 0, 0, 0.4),
                                0 0 16px -4px var(--block-color, rgba(99, 102, 241, 0.15));
                    background: rgba(30, 41, 59, 0.6);
                }

                .arch-block:hover::before {
                    opacity: 1;
                }

                .arch-block:active {
                    transform: none;
                }

                /* ===== Planned block styling ===== */
                .arch-block.planned {
                    border-style: dashed;
                    border-color: rgba(255, 255, 255, 0.06);
                    background: rgba(30, 41, 59, 0.15);
                    opacity: 0.7;
                    cursor: default;
                }

                .arch-block.planned::before {
                    opacity: 0.25;
                    background: var(--block-color, #6366f1);
                    /* dashed left accent */
                    background: repeating-linear-gradient(
                        180deg,
                        var(--block-color, #6366f1) 0px,
                        var(--block-color, #6366f1) 4px,
                        transparent 4px,
                        transparent 8px
                    );
                }

                .arch-block.planned:hover {
                    transform: none;
                    box-shadow: none;
                    background: rgba(30, 41, 59, 0.25);
                    border-color: rgba(255, 255, 255, 0.1);
                    opacity: 0.85;
                }

                .arch-block.planned .block-icon {
                    opacity: 0.5;
                }

                .arch-block.planned:hover .block-icon {
                    background: rgba(255, 255, 255, 0.04);
                    border-color: rgba(255, 255, 255, 0.06);
                    box-shadow: none;
                    opacity: 0.7;
                }

                .arch-block.planned:hover .block-icon .material-symbols-rounded {
                    color: var(--block-color, #6366f1);
                }

                /* Card top row */
                .block-top {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                .block-icon {
                    width: 36px;
                    height: 36px;
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: rgba(255, 255, 255, 0.04);
                    border: 1px solid rgba(255, 255, 255, 0.06);
                    transition: all 0.25s ease;
                    flex-shrink: 0;
                }

                .arch-block:hover .block-icon {
                    background: var(--block-color, #6366f1);
                    border-color: transparent;
                    box-shadow: 0 0 12px -2px var(--block-color, #6366f1);
                }

                .block-icon .material-symbols-rounded {
                    font-size: 20px;
                    color: var(--block-color, #6366f1);
                    transition: color 0.25s ease;
                }

                .arch-block:hover .block-icon .material-symbols-rounded {
                    color: white;
                }

                .block-name {
                    font-size: 13px;
                    font-weight: 600;
                    color: var(--text-primary, #f8fafc);
                    line-height: 1.2;
                    flex: 1;
                }

                /* Phase pill badge */
                .block-phase {
                    font-size: 8px;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    padding: 2px 6px;
                    border-radius: 4px;
                    flex-shrink: 0;
                    line-height: 1.3;
                }

                .block-phase.built {
                    background: rgba(16, 185, 129, 0.12);
                    color: #10b981;
                }

                .block-phase.planned {
                    background: rgba(251, 191, 36, 0.12);
                    color: #fbbf24;
                }

                .block-status {
                    width: 7px;
                    height: 7px;
                    border-radius: 50%;
                    flex-shrink: 0;
                }

                .block-status.active {
                    background: #10b981;
                    box-shadow: 0 0 6px rgba(16, 185, 129, 0.4);
                }

                .block-status.ready {
                    background: #3b82f6;
                    box-shadow: 0 0 6px rgba(59, 130, 246, 0.4);
                }

                .block-status.service {
                    background: #f59e0b;
                    box-shadow: 0 0 6px rgba(245, 158, 11, 0.4);
                }

                /* Description */
                .block-desc {
                    font-size: 11px;
                    color: var(--text-secondary, #64748b);
                    line-height: 1.5;
                }

                /* Bottom row: tech + timeline */
                .block-bottom {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    margin-top: auto;
                    flex-wrap: wrap;
                }

                .block-tech {
                    display: inline-flex;
                    align-items: center;
                    gap: 4px;
                    font-size: 10px;
                    font-weight: 500;
                    color: rgba(148, 163, 184, 0.6);
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    border-radius: 4px;
                    padding: 2px 8px;
                    letter-spacing: 0.3px;
                }

                .block-tech .material-symbols-rounded {
                    font-size: 12px;
                    color: rgba(148, 163, 184, 0.4);
                }

                .block-timeline {
                    display: inline-flex;
                    align-items: center;
                    gap: 3px;
                    font-size: 9px;
                    font-weight: 600;
                    color: rgba(251, 191, 36, 0.6);
                    background: rgba(251, 191, 36, 0.06);
                    border: 1px solid rgba(251, 191, 36, 0.1);
                    border-radius: 4px;
                    padding: 2px 6px;
                    letter-spacing: 0.3px;
                }

                .block-timeline .material-symbols-rounded {
                    font-size: 11px;
                }

                /* Horizontal flow arrows between columns */
                .flow-indicator-h {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 4px;
                    padding: 0 4px;
                    position: relative;
                    z-index: 2;
                }

                .flow-line-v {
                    flex: 1;
                    width: 1px;
                    background: linear-gradient(180deg, transparent, rgba(148, 163, 184, 0.15), transparent);
                }

                .flow-center-h {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 2px;
                }

                .flow-chevrons-h {
                    display: flex;
                    flex-direction: row;
                    align-items: center;
                    gap: 0;
                }

                .flow-chevron-h {
                    color: rgba(99, 102, 241, 0.5);
                    font-size: 14px;
                    line-height: 1;
                    animation: chevronPulseH 1.8s ease-in-out infinite;
                }

                .flow-chevron-h:nth-child(2) { animation-delay: 0.15s; opacity: 0.6; }
                .flow-chevron-h:nth-child(3) { animation-delay: 0.3s; opacity: 0.4; }

                @keyframes chevronPulseH {
                    0%, 100% { opacity: 0.2; transform: translateX(0); }
                    50% { opacity: 0.7; transform: translateX(2px); }
                }

                /* Legend */
                .legend {
                    display: flex;
                    justify-content: center;
                    flex-wrap: wrap;
                    gap: 14px;
                    margin-top: 16px;
                    padding: 10px;
                    font-size: 11px;
                    color: var(--text-secondary, #64748b);
                    position: relative;
                    z-index: 2;
                }

                .legend-item {
                    display: flex;
                    align-items: center;
                    gap: 5px;
                }

                .legend-swatch {
                    width: 16px;
                    height: 10px;
                    border-radius: 3px;
                }

                .legend-swatch.built {
                    background: rgba(30, 41, 59, 0.5);
                    border: 1px solid rgba(255, 255, 255, 0.12);
                }

                .legend-swatch.planned {
                    background: rgba(30, 41, 59, 0.15);
                    border: 1px dashed rgba(251, 191, 36, 0.3);
                }

                .legend-line {
                    width: 18px;
                    height: 0;
                    border-top: 2px dashed rgba(148, 163, 184, 0.35);
                }

                .legend-arrow {
                    font-size: 10px;
                    color: rgba(99, 102, 241, 0.6);
                    line-height: 1;
                }
            </style>

            <div class="welcome-card">
                <h3>Capability Architecture Map</h3>
                <p>DOAP's modular system architecture and roadmap. Solid cards are built, dashed are planned. Click built features to navigate.</p>
            </div>

            <div class="arch-container" id="arch-container">
                <svg class="connections-svg" id="connections-svg">
                    <defs>
                        <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto" markerUnits="userSpaceOnUse">
                            <polygon points="0 0, 8 3, 0 6" fill="rgba(148, 163, 184, 0.45)" />
                        </marker>
                        <marker id="arrowhead-planned" markerWidth="6" markerHeight="5" refX="6" refY="2.5" orient="auto" markerUnits="userSpaceOnUse">
                            <polygon points="0 0, 6 2.5, 0 5" fill="rgba(148, 163, 184, 0.2)" />
                        </marker>
                    </defs>
                </svg>
                <div class="columns-root" id="layers-root"></div>
            </div>
        `);
    }

    connectedCallback(): void {
        const shadow = this.shadowRoot;
        if (!shadow) return;

        const layersRoot = shadow.getElementById('layers-root');
        if (!layersRoot) return;

        // Build layers as vertical columns
        this.layers.forEach((layer, li) => {
            const layerEl = document.createElement('div');
            layerEl.classList.add('arch-layer');
            layerEl.style.setProperty('--layer-color', layer.color);

            const builtBlocks = layer.blocks.filter(b => b.phase === 'built');
            const plannedBlocks = layer.blocks.filter(b => b.phase === 'planned');

            const headerHTML = `
                <div class="layer-header">
                    <div class="layer-icon-wrap">
                        <span class="material-symbols-rounded">${layer.icon}</span>
                    </div>
                    <span class="layer-title">${layer.title}</span>
                    <span class="layer-subtitle">${layer.subtitle}</span>
                </div>
            `;

            const renderBlock = (block: ArchBlock) => `
                <div class="arch-block ${block.phase === 'planned' ? 'planned' : ''}" data-id="${block.id}" data-view="${block.view}" data-phase="${block.phase}" style="--block-color: ${block.color};">
                    <div class="block-top">
                        <div class="block-icon">
                            <span class="material-symbols-rounded">${block.icon}</span>
                        </div>
                        <span class="block-name">${block.name}</span>
                        <span class="block-phase ${block.phase}">${block.phase === 'built' ? 'BUILT' : 'PLANNED'}</span>
                    </div>
                    <span class="block-desc">${block.description}</span>
                    <div class="block-bottom">
                        <span class="block-tech"><span class="material-symbols-rounded">code</span>${block.tech}</span>
                        ${block.timeline ? `<span class="block-timeline"><span class="material-symbols-rounded">schedule</span>${block.timeline}</span>` : ''}
                    </div>
                </div>
            `;

            const builtHTML = builtBlocks.map(renderBlock).join('');

            let plannedHTML = '';
            if (plannedBlocks.length > 0) {
                plannedHTML = `
                    <div class="section-divider">
                        <div class="section-divider-line"></div>
                        <span class="section-divider-label">Roadmap</span>
                        <div class="section-divider-line"></div>
                    </div>
                ` + plannedBlocks.map(renderBlock).join('');
            }

            layerEl.innerHTML = headerHTML + builtHTML + plannedHTML;
            layersRoot.appendChild(layerEl);

            // Add horizontal flow indicator between columns (not after last)
            if (li < this.layers.length - 1) {
                const flow = document.createElement('div');
                flow.classList.add('flow-indicator-h');
                flow.innerHTML = `
                    <div class="flow-line-v"></div>
                    <div class="flow-center-h">
                        <div class="flow-chevrons-h">
                            <span class="flow-chevron-h">›</span>
                            <span class="flow-chevron-h">›</span>
                            <span class="flow-chevron-h">›</span>
                        </div>
                    </div>
                    <div class="flow-line-v"></div>
                `;
                layersRoot.appendChild(flow);
            }
        });

        // Legend
        const legend = document.createElement('div');
        legend.classList.add('legend');
        legend.innerHTML = `
            <div class="legend-item"><div class="legend-swatch built"></div> Built</div>
            <div class="legend-item"><div class="legend-swatch planned"></div> Planned</div>
            <div class="legend-item"><div class="legend-line"></div><span class="legend-arrow">▶</span> Data flow</div>
        `;
        const archContainer = shadow.getElementById('arch-container');
        archContainer?.parentNode?.insertBefore(legend, archContainer.nextSibling);

        // Click handler — only for built features
        shadow.querySelectorAll('.arch-block').forEach(block => {
            block.addEventListener('click', () => {
                const el = block as HTMLElement;
                if (el.dataset.phase === 'planned') return;
                const view = el.dataset.view;
                if (view) {
                    window.dispatchEvent(new CustomEvent('navigate', { detail: { view } }));
                }
            });
        });

        // Draw SVG connections after layout settles
        setTimeout(() => this.drawConnections(), 600);

        this.resizeObserver = new ResizeObserver(() => this.drawConnections());
        const container = shadow.getElementById('arch-container');
        if (container) this.resizeObserver.observe(container);
    }

    disconnectedCallback(): void {
        if (this.resizeObserver) {
            this.resizeObserver.disconnect();
            this.resizeObserver = null;
        }
    }

    private drawConnections(): void {
        const shadow = this.shadowRoot;
        if (!shadow) return;

        const svg = shadow.getElementById('connections-svg') as unknown as SVGSVGElement;
        const container = shadow.getElementById('arch-container');
        if (!svg || !container) return;

        const defs = svg.querySelector('defs');
        svg.innerHTML = '';
        if (defs) svg.appendChild(defs);

        const containerRect = container.getBoundingClientRect();

        // Determine which block IDs are planned
        const plannedIds = new Set<string>();
        this.layers.forEach(l => l.blocks.forEach(b => {
            if (b.phase === 'planned') plannedIds.add(b.id);
        }));

        this.connections.forEach(conn => {
            const fromEl = shadow.querySelector(`[data-id="${conn.from}"]`) as HTMLElement;
            const toEl = shadow.querySelector(`[data-id="${conn.to}"]`) as HTMLElement;
            if (!fromEl || !toEl) return;

            const fromRect = fromEl.getBoundingClientRect();
            const toRect = toEl.getBoundingClientRect();

            const x1 = fromRect.right - containerRect.left;
            const y1 = fromRect.top + fromRect.height / 2 - containerRect.top;
            const x2 = toRect.left - containerRect.left;
            const y2 = toRect.top + toRect.height / 2 - containerRect.top;

            const midX = (x1 + x2) / 2;
            const d = `M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${x2} ${y2}`;

            const isPlanned = plannedIds.has(conn.from) || plannedIds.has(conn.to);

            if (!isPlanned) {
                // Glow layer for built connections
                const glow = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                glow.setAttribute('d', d);
                glow.classList.add('conn-line-glow');
                svg.appendChild(glow);
            }

            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            path.setAttribute('d', d);
            path.setAttribute('marker-end', isPlanned ? 'url(#arrowhead-planned)' : 'url(#arrowhead)');
            path.classList.add(isPlanned ? 'conn-line-planned' : 'conn-line');
            svg.appendChild(path);
        });
    }
}

customElements.define('doap-feature-map', DoapFeatureMap);
