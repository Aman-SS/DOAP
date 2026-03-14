import { BaseComponent } from './base.js';

export class DoapFeatureMap extends BaseComponent {
    constructor() {
        super();
        this.featureGraph = null;
        this.render(`
            <style>
                #feature-graph-container {
                    width: 100%;
                    height: 650px;
                    background: rgba(15, 23, 42, 0.6);
                    border-radius: 16px;
                    border: 1px solid var(--border-color, rgba(255, 255, 255, 0.05));
                    overflow: hidden;
                    position: relative;
                }
            </style>
            
            <div class="welcome-card">
                <h3>Capability Architecture Map</h3>
                <p>Interactive force-directed graph of DOAP's integrated systems. Drag nodes to explore, click to navigate.</p>
            </div>
            <div id="feature-graph-container">
                <!-- Graph rendered here -->
            </div>
        `);
    }

    connectedCallback() {
        // Delay slightly to ensure component has dimensions after DOM insertion
        setTimeout(() => this.initFeatureGraph(), 150);

        window.addEventListener('resize', this.handleResize.bind(this));
    }

    disconnectedCallback() {
        window.removeEventListener('resize', this.handleResize.bind(this));
        if (this.featureGraph) {
            // Cleanup if the library supports it
            this.shadowRoot.getElementById('feature-graph-container').innerHTML = '';
            this.featureGraph = null;
        }
    }

    handleResize() {
        const container = this.shadowRoot.getElementById('feature-graph-container');
        if (this.featureGraph && container) {
            this.featureGraph.width(container.clientWidth);
            this.featureGraph.height(container.clientHeight);
        }
    }

    initFeatureGraph() {
        const container = this.shadowRoot.getElementById('feature-graph-container');
        if (!container) return;

        const width = container.clientWidth || 800;
        const height = container.clientHeight || 600;

        if (typeof ForceGraph === 'undefined') {
            container.innerHTML = '<div style="color: #ef4444; padding: 20px; text-align: center;">Error: ForceGraph library not loaded. Check internet connection.</div>';
            return;
        }

        const gData = {
            nodes: [
                { id: 'core', name: 'DOAP Core', val: 24, color: '#6366f1', view: 'home' },
                { id: 'scraper', name: 'Web Scraper', val: 16, color: '#10b981', view: 'scrape' },
                { id: 'sqlite', name: 'SQLite DB', val: 16, color: '#3b82f6', view: 'db-viewer' },
                { id: 'history', name: 'History', val: 12, color: '#8b5cf6', view: 'history' },
                { id: 'ollama', name: 'Ollama Hub', val: 18, color: '#f59e0b', view: 'settings' },
                { id: 'wsl', name: 'WSL Terminal', val: 12, color: '#64748b', view: 'settings' },
                { id: 'multi', name: 'Multi-LLM', val: 12, color: '#ec4899', view: 'settings' },
                { id: 'rag', name: 'Curiosity (RAG)', val: 16, color: '#a855f7', view: 'curiosity' }
            ],
            links: [
                { source: 'core', target: 'scraper' },
                { source: 'core', target: 'ollama' },
                { source: 'core', target: 'sqlite' },
                { source: 'scraper', target: 'sqlite' },
                { source: 'sqlite', target: 'history' },
                { source: 'ollama', target: 'wsl' },
                { source: 'ollama', target: 'multi' },
                { source: 'ollama', target: 'core' },
                { source: 'sqlite', target: 'rag' },
                { source: 'ollama', target: 'rag' },
                { source: 'core', target: 'rag' }
            ]
        };

        this.featureGraph = ForceGraph()(container)
            .graphData(gData)
            .nodeColor('color')
            .nodeVal('val')
            .linkColor(() => 'rgba(255, 255, 255, 0.2)')
            .linkWidth(1.5)
            .linkDirectionalParticles(2)
            .linkDirectionalParticleSpeed(0.005)
            .backgroundColor('rgba(0,0,0,0)')
            .width(width)
            .height(height)
            .d3Force('charge', d3.forceManyBody().strength(-400))
            .d3Force('collide', d3.forceCollide(node => (node.val / 2) + 10))
            .d3Force('link', d3.forceLink().id(d => d.id).distance(100))
            .onNodeClick(node => {
                if (node.view) {
                    window.dispatchEvent(new CustomEvent('navigate', { detail: { view: node.view } }));
                }
            })
            .nodeCanvasObject((node, ctx, globalScale) => {
                const label = node.name;
                const fontSize = 14 / globalScale;
                ctx.font = `${fontSize}px Inter, sans-serif`;
                
                ctx.beginPath();
                ctx.arc(node.x, node.y, node.val / 2, 0, 2 * Math.PI, false);
                ctx.fillStyle = node.color;
                
                ctx.shadowColor = node.color;
                ctx.shadowBlur = 15 * (node.val / 10);
                ctx.fill();
                
                ctx.shadowBlur = 0;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
                ctx.fillText(label, node.x, node.y + (node.val / 2) + fontSize);
            });
    }
}

customElements.define('doap-feature-map', DoapFeatureMap);
