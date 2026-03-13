const navHome = document.getElementById('nav-home');
const navScrape = document.getElementById('nav-scrape');
const navHistory = document.getElementById('nav-history');
const navSettings = document.getElementById('nav-settings');

const views = {
    home: document.getElementById('home-view'),
    scrape: document.getElementById('scrape-view'),
    history: document.getElementById('history-view'),
    'db-viewer': document.getElementById('db-viewer-view'),
    'feature-map': document.getElementById('feature-map-view'),
    settings: document.getElementById('settings-view')
};

const providerStatusText = document.getElementById('provider-status');
const statusDot = document.querySelector('.dot');

// View Switching
function showView(viewName) {
    Object.keys(views).forEach(key => {
        if (key === viewName) {
            views[key].classList.remove('hidden');
        } else {
            views[key].classList.add('hidden');
        }
    });

    // Update nav active state
    document.querySelectorAll('.nav-item').forEach(btn => btn.classList.remove('active'));
    const activeNav = document.getElementById(`nav-${viewName}`);
    if (activeNav) activeNav.classList.add('active');

    // Auto-init specific views
    if (viewName === 'feature-map') {
        initFeatureGraph();
    }
}

navHome.addEventListener('click', () => showView('home'));
navScrape.addEventListener('click', () => showView('scrape'));
navHistory.addEventListener('click', () => {
    showView('history');
    loadHistory();
});
document.getElementById('nav-db-viewer').addEventListener('click', () => {
    showView('db-viewer');
    loadDbViewer();
});
document.getElementById('nav-feature-map').addEventListener('click', () => {
    showView('feature-map');
    initFeatureGraph();
});
navSettings.addEventListener('click', () => showView('settings'));

// Scrape Logic
const startScrapeBtn = document.getElementById('start-scrape-btn');
const urlInput = document.getElementById('url-input');
const selectorInput = document.getElementById('selector-input');
const scrapeProgress = document.getElementById('scrape-progress');
const scrapeResult = document.getElementById('scrape-result');

startScrapeBtn.addEventListener('click', async () => {
    const url = urlInput.value.trim();
    if (!url) return alert('Please enter a URL');

    const selector = selectorInput.value.trim() || null;

    showProgress(true);
    scrapeResult.classList.add('hidden');

    try {
        const result = await window.api.scrapeUrl(url, selector);
        showProgress(false);

        if (result.success) {
            const isEmpty = !result.content || result.content.trim().length === 0;
            const contentPreview = isEmpty 
                ? '<div class="warning-box"><strong>Warning:</strong> No content was extracted. Check your URL or selector.</div>'
                : `<p>${result.content.substring(0, 500)}${result.content.length > 500 ? '...' : ''}</p>`;

            scrapeResult.innerHTML = `
                <div class="success-header">
                    <h4>Scrape Result: ${result.title || 'Untitled'}</h4>
                </div>
                <div class="result-content">
                    ${contentPreview}
                </div>
                <div class="preview-actions">
                    <button class="btn btn-primary" id="save-btn">Save to Database</button>
                    <button class="btn btn-secondary" onclick="discardScrape()">Discard</button>
                </div>
            `;
            
            // Re-bind save button
            document.getElementById('save-btn').onclick = () => saveScrapeResult(result);
            
            scrapeResult.classList.remove('hidden');
        } else {
            alert('Error: ' + result.error);
        }
    } catch (err) {
        showProgress(false);
        alert('Failed to scrape: ' + err.message);
    }
});

function showProgress(show) {
    scrapeProgress.classList.toggle('hidden', !show);
    startScrapeBtn.disabled = show;
}

// Ollama Check
async function checkOllama() {
    const statusDot = document.querySelector('.status-indicator .dot');
    const statusText = document.getElementById('provider-status');
    const settingsStatus = document.getElementById('settings-ollama-status');
    const label = document.getElementById('provider-label');
    
    // Only update if we are on the Ollama tab or initialized
    if (label.innerText !== 'Ollama') return;

    try {
        const result = await window.api.checkOllama();
        if (result.online) {
            statusDot.classList.add('connected');
            statusText.innerText = 'Online';
            if (settingsStatus) {
                settingsStatus.innerText = 'Connected';
                settingsStatus.classList.remove('offline');
                settingsStatus.classList.add('online');
            }
        } else {
            statusDot.classList.remove('connected');
            statusText.innerText = 'Offline';
            if (settingsStatus) {
                settingsStatus.innerText = 'Offline';
                settingsStatus.classList.remove('online');
                settingsStatus.classList.add('offline');
            }
        }
    } catch (error) {
        statusDot.classList.remove('connected');
        statusText.innerText = 'Error';
    }
}

async function updateStats() {
    const history = await window.api.getHistory();
    document.getElementById('stat-scrapes').innerText = history.length;
}

async function loadHistory() {
    const historyList = document.getElementById('history-list');
    const history = await window.api.getHistory();

    if (history.length === 0) {
        historyList.innerHTML = '<div class="empty-state">No scrapes found yet. Start by crawling a website!</div>';
        return;
    }

    historyList.innerHTML = history.map(item => `
        <div class="history-item-card">
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
                <button class="btn btn-secondary btn-sm" onclick="viewFullScrape(${item.id})">View Content</button>
                <button class="btn btn-primary btn-sm" onclick="askAiAboutThis(${item.id})">Plan with AI</button>
                <button class="btn btn-secondary btn-sm" style="color: #ef4444;" onclick="deleteScrape(${item.id})">Delete</button>
            </div>
        </div>
    `).join('');
}

window.viewFullScrape = async (id) => {
    const history = await window.api.getHistory();
    const item = history.find(s => s.id === id);
    if (item) {
        window.openModal(`Content from ${item.url}`, item.content);
    }
};

window.openModal = (title, content) => {
    const modal = document.getElementById('content-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body');
    
    modalTitle.innerText = title;
    modalBody.innerHTML = `<pre>${content}</pre>`;
    
    modal.classList.remove('hidden');
};

window.saveScrapeResult = async (data) => {
    const saveBtn = document.getElementById('save-btn');
    saveBtn.disabled = true;
    saveBtn.innerText = 'Saving...';

    const saveResult = await window.api.saveScrape(data);
    if (saveResult.success) {
        scrapeResult.innerHTML = `
            <div class="success-header">
                <h4>Data Saved Successfully! (ID: ${saveResult.id})</h4>
            </div>
            <div class="ai-actions" style="margin-top: 20px;">
                <button class="btn btn-primary" onclick="askAiAboutThis(${saveResult.id})">Plan with AI</button>
                <button class="btn btn-secondary" onclick="discardScrape()">Back to Scraper</button>
            </div>
        `;
        updateStats();
    } else {
        alert('Failed to save: ' + saveResult.error);
        saveBtn.disabled = false;
        saveBtn.innerText = 'Save to Database';
    }
};

window.discardScrape = () => {
    scrapeResult.classList.add('hidden');
    urlInput.value = '';
    selectorInput.value = '';
};

window.closeModal = () => {
    document.getElementById('content-modal').classList.add('hidden');
};

async function loadDbViewer() {
    const tableSelect = document.getElementById('table-select');
    const tableName = tableSelect.value;
    const data = await window.api.getTableData(tableName);
    
    const tableHead = document.getElementById('db-table-head');
    const tableBody = document.getElementById('db-table-body');
    
    if (!data || data.length === 0) {
        tableHead.innerHTML = '<th>No data found</th>';
        tableBody.innerHTML = '';
        return;
    }
    
    // Get columns from first row, filtering out large text blobs
    const allColumns = Object.keys(data[0]);
    const displayColumns = allColumns.filter(col => col !== 'content' && col !== 'markdown');
    
    tableHead.innerHTML = displayColumns.map(col => `<th>${col}</th>`).join('') + '<th>Actions</th>';
    
    tableBody.innerHTML = data.map(row => {
        let actions = '';
        if (tableName === 'scrapes') {
            actions += `
                <button class="btn btn-secondary btn-sm" onclick="openModal('Full Content', ${JSON.stringify(row.content).replace(/"/g, '&quot;')})">See Content</button>
                <button class="btn btn-secondary btn-sm" onclick="openModal('Markdown Content', ${JSON.stringify(row.markdown).replace(/"/g, '&quot;')})">See Markdown</button>
            `;
        }
        actions += `<button class="btn btn-secondary btn-sm" style="color: #ef4444;" onclick="deleteScrape(${row.id})">Delete</button>`;

        return `
            <tr>
                ${displayColumns.map(col => `<td>${row[col]}</td>`).join('')}
                <td>
                    <div style="display: flex; gap: 8px;">
                        ${actions}
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

window.deleteScrape = async (id) => {
    if (!confirm('Are you sure you want to delete this scrape and all associated AI insights?')) return;
    
    const result = await window.api.deleteScrape(id);
    if (result) {
        updateStats();
        if (views.history.classList.contains('hidden') === false) loadHistory();
        if (views['db-viewer'].classList.contains('hidden') === false) loadDbViewer();
    } else {
        alert('Failed to delete');
    }
};

// Add listener for table selection change
document.getElementById('table-select')?.addEventListener('change', loadDbViewer);

window.askAiAboutThis = async (id) => {
    const prompt = prompt("What would you like to plan/do with this data?");
    if (!prompt) return;

    // Show loading state...
    const result = await window.api.askAI(id, prompt);
    if (result.success) {
        alert("AI Response: " + result.response);
    } else {
        alert("AI Planning Failed: " + result.error);
    }
}

async function loadSettings() {
    const url = await window.api.getSetting('ollama_url');
    const model = await window.api.getSetting('ollama_model');
    
    if (url) document.getElementById('ollama-url-input').value = url;
    if (model) document.getElementById('ollama-model-select').value = model;
}

document.getElementById('test-ollama-btn').addEventListener('click', async () => {
    const btn = document.getElementById('test-ollama-btn');
    const url = document.getElementById('ollama-url-input').value.trim();
    
    btn.innerText = 'Testing...';
    btn.classList.add('pulse');
    
    // Temporarily update setting to test
    await window.api.updateSetting('ollama_url', url);
    const status = await window.api.checkOllama();
    
    btn.innerText = 'Test Connection';
    btn.classList.remove('pulse');
    
    if (status.online) {
        alert('Success! Ollama is reachable.');
        document.querySelector('.status-indicator .dot').classList.add('connected');
        document.getElementById('provider-status').innerText = 'Online';
    } else {
        document.querySelector('.status-indicator .dot').classList.remove('connected');
        document.getElementById('provider-status').innerText = 'Failed';
        alert('Failed to connect. Please check the URL and ensure Ollama is running.');
    }
    
    checkOllama();
});

document.getElementById('save-settings-btn').addEventListener('click', async () => {
    const url = document.getElementById('ollama-url-input').value.trim();
    const model = document.getElementById('ollama-model-select').value;
    
    if (!url) return alert('Please enter a URL');
    
    const res1 = await window.api.updateSetting('ollama_url', url);
    const res2 = await window.api.updateSetting('ollama_model', model);
    
    if (res1 && res2) {
        alert('Settings saved successfully!');
        checkOllama();
    } else {
        alert('Failed to save settings');
    }
});

async function executeWslCommand(command) {
    const activeTab = document.querySelector('.settings-tab-btn.active').getAttribute('data-tab');
    const outputId = activeTab === 'ollama' ? 'ollama-terminal-output' : 
                     activeTab === 'openai' ? 'openai-terminal-output' :
                     activeTab === 'anthropic' ? 'anthropic-terminal-output' :
                     'hf-terminal-output';
    const output = document.getElementById(outputId);
    
    // Switch to settings view if not already there
    showView('settings');

    const runBtns = document.querySelectorAll('.run-cmd-btn');
    runBtns.forEach(btn => btn.disabled = true);

    output.innerHTML += `\n<span class="terminal-prompt">$</span> ${command}`;
    output.scrollTop = output.scrollHeight;

    const result = await window.api.runWslCommand(command);
    if (result.success) {
        output.innerHTML += `\n${result.stdout}`;
    } else {
        output.innerHTML += `\n<span style="color: #ef4444;">Error: ${result.error || result.stderr}</span>`;
    }
    output.scrollTop = output.scrollHeight;
    runBtns.forEach(btn => btn.disabled = false);
}

// Terminal Input
const terminalHistory = [];
let historyIndex = -1;

document.getElementById('ollama-terminal-input').addEventListener('keydown', async (e) => {
    if (e.key === 'Enter') {
        const cmd = e.target.value.trim();
        if (!cmd) return;

        e.target.value = '';
        terminalHistory.push(cmd);
        historyIndex = -1;

        if (cmd.toLowerCase() === 'clear') {
            document.getElementById('ollama-terminal-output').innerHTML = 'Ollama WSL Bridge Ready...';
            return;
        }

        executeWslCommand(cmd);
    } else if (e.key === 'ArrowUp') {
        if (terminalHistory.length > 0) {
            historyIndex = historyIndex === -1 ? terminalHistory.length - 1 : Math.max(0, historyIndex - 1);
            e.target.value = terminalHistory[historyIndex];
        }
    } else if (e.key === 'ArrowDown') {
        if (historyIndex !== -1) {
            historyIndex = Math.min(terminalHistory.length - 1, historyIndex + 1);
            e.target.value = terminalHistory[historyIndex];
        }
    }
});

document.getElementById('discover-wsl-btn').addEventListener('click', async () => {
    const btn = document.getElementById('discover-wsl-btn');
    btn.disabled = true;
    btn.innerText = 'Finding...';
    
    const result = await window.api.getWslIp();
    btn.disabled = false;
    btn.innerText = 'Auto-find WSL';
    
    if (result.success && result.ip) {
        const urlInput = document.getElementById('ollama-url-input');
        urlInput.value = `http://${result.ip}:11434`;
        alert(`WSL IP found: ${result.ip}. URL updated.`);
    } else {
        alert('Could not find WSL IP. Ensure WSL is running.');
    }
});

// Bind all Run buttons
document.querySelectorAll('.run-cmd-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const cmd = btn.getAttribute('data-cmd');
        if (cmd) executeWslCommand(cmd);
    });
});

// Settings Tab Switching
document.querySelectorAll('.settings-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const tabId = btn.getAttribute('data-tab');
        showSettingsTab(tabId);
    });
});

function showSettingsTab(tabId) {
    // Update buttons
    document.querySelectorAll('.settings-tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-tab') === tabId);
    });

    // Update content
    document.querySelectorAll('.settings-tab-content').forEach(content => {
        content.classList.toggle('active', content.id === `settings-${tabId}`);
    });

    // Update Header Label
    const providers = {
        ollama: 'Ollama',
        openai: 'OpenAI',
        anthropic: 'Anthropic',
        huggingface: 'Hugging Face'
    };
    document.getElementById('provider-label').innerText = providers[tabId] || 'LLM';
    
    // Reset status if switching to locked/new providers
    if (tabId !== 'ollama') {
        document.getElementById('provider-status').innerText = 'Locked';
        document.querySelector('.status-indicator .dot').classList.remove('connected');
    } else {
        checkOllama();
        loadOllamaModels();
        loadRunningModels();
    }
}

// Ollama Model Management logic
async function loadOllamaModels() {
    const tableBody = document.getElementById('ollama-models-body');
    const modelSelect = document.getElementById('ollama-model-select');
    if (!tableBody) return;

    const preferredModel = await window.api.getSetting('ollama_model') || 'llama3';

    try {
        const result = await window.api.checkOllama();
        if (!result.online) {
            tableBody.innerHTML = '<tr><td colspan="4" style="text-align: center; padding: 20px;">Ollama is offline</td></tr>';
            return;
        }

        const models = result.models || [];
        
        // Update Table
        if (models.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="4" style="text-align: center; padding: 20px;">No models installed</td></tr>';
        } else {
            tableBody.innerHTML = models.map(m => {
                const sizeGB = (m.size / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
                const modDate = new Date(m.modified_at).toLocaleDateString();
                return `
                    <tr>
                        <td style="font-weight: 600;">${m.name}</td>
                        <td>${sizeGB}</td>
                        <td>${modDate}</td>
                        <td>
                            <div style="display: flex; gap: 8px;">
                                <button class="btn btn-secondary btn-xs" onclick="viewModelInfo('${m.name}')">Info</button>
                                <button class="btn btn-secondary btn-xs" style="color: #ef4444;" onclick="deleteModel('${m.name}')">Delete</button>
                            </div>
                        </td>
                    </tr>
                `;
            }).join('');
        }

        // Update Dropdown
        const currentSelection = modelSelect.value;
        modelSelect.innerHTML = models.map(m => `<option value="${m.name}">${m.name}</option>`).join('');
        
        // If preferred model exists in list, select it
        if (models.some(m => m.name === preferredModel)) {
            modelSelect.value = preferredModel;
        } else if (models.length > 0) {
            if (models.some(m => m.name === currentSelection)) {
                modelSelect.value = currentSelection;
            } else {
                modelSelect.value = models[0].name;
            }
        }
    } catch (error) {
        tableBody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: #ef4444;">Error: ${error.message}</td></tr>`;
    }
}

async function loadRunningModels() {
    const list = document.getElementById('running-models-list');
    const badge = document.getElementById('running-count-badge');
    if (!list) return;

    try {
        const result = await window.api.getRunningModels();
        if (result.success && result.models) {
            const models = result.models;
            badge.innerText = `${models.length} Active`;
            
            if (models.length === 0) {
                list.innerHTML = '<p style="font-size: 13px; color: var(--text-secondary); text-align: center; padding: 20px;">No models currently in memory.</p>';
            } else {
                list.innerHTML = models.map(m => `
                    <div class="model-item">
                        <div class="model-item-info">
                            <h5>${m.name}</h5>
                            <p>${m.size_vram ? (m.size_vram / (1024 * 1024 * 1024)).toFixed(2) + ' GB VRAM' : 'In memory'}</p>
                        </div>
                        <span class="status-badge online" style="font-size: 9px;">Running</span>
                    </div>
                `).join('');
            }
        }
    } catch (e) {
        console.error("Failed to load running models", e);
    }
}

window.viewModelInfo = async (name) => {
    const result = await window.api.getModelInfo(name);
    if (result.success) {
        let details = "Model Details:\n";
        if (result.info.modelfile) details += "\n--- Modelfile ---\n" + result.info.modelfile;
        if (result.info.parameters) details += "\n--- Parameters ---\n" + result.info.parameters;
        if (result.info.template) details += "\n--- Template ---\n" + result.info.template;
        
        window.openModal(`Info: ${name}`, details);
    }
};

window.deleteModel = async (name) => {
    if (!confirm(`Are you sure you want to delete model '${name}'?`)) return;
    const res = await window.api.deleteModel(name);
    if (res.success) {
        loadOllamaModels();
    } else {
        alert("Failed to delete model: " + res.error);
    }
};

document.getElementById('refresh-models-btn')?.addEventListener('click', () => {
    loadOllamaModels();
    loadRunningModels();
});

// Feature Graph Map Logic
let featureGraph = null;
function initFeatureGraph() {
    const container = document.getElementById('feature-graph-container');
    if (!container) return;

    // Ensure container has dimensions
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 600;

    // Define Graph Data
    const gData = {
        nodes: [
            { id: 'core', name: 'DOAP Core', val: 24, color: '#6366f1', view: 'home' },
            { id: 'scraper', name: 'Web Scraper', val: 16, color: '#10b981', view: 'scrape' },
            { id: 'sqlite', name: 'SQLite DB', val: 16, color: '#3b82f6', view: 'db-viewer' },
            { id: 'history', name: 'History', val: 12, color: '#8b5cf6', view: 'history' },
            { id: 'ollama', name: 'Ollama Hub', val: 18, color: '#f59e0b', view: 'settings' },
            { id: 'wsl', name: 'WSL Terminal', val: 12, color: '#64748b', view: 'settings' },
            { id: 'multi', name: 'Multi-LLM', val: 12, color: '#ec4899', view: 'settings' }
        ],
        links: [
            { source: 'core', target: 'scraper' },
            { source: 'core', target: 'ollama' },
            { source: 'core', target: 'sqlite' },
            { source: 'scraper', target: 'sqlite' },
            { source: 'sqlite', target: 'history' },
            { source: 'ollama', target: 'wsl' },
            { source: 'ollama', target: 'multi' },
            { source: 'ollama', target: 'core' }
        ]
    };

    if (featureGraph) {
        featureGraph.width(width).height(height);
        return;
    }

    // Use a small timeout to ensure the container is rendered and has dimensions
    console.log("Initializing Feature Graph...");
    setTimeout(() => {
        const finalWidth = container.clientWidth || 800;
        const finalHeight = container.clientHeight || 600;
        console.log(`Graph Dimensions: ${finalWidth}x${finalHeight}`);

        if (typeof ForceGraph === 'undefined') {
            console.error("ForceGraph library is not loaded!");
            container.innerHTML = '<div style="color: #ef4444; padding: 20px; text-align: center;">Error: ForceGraph library not loaded. Check internet connection or CSP.</div>';
            return;
        }

        featureGraph = ForceGraph()(container)
            .graphData(gData)
            .nodeColor('color')
            .nodeVal('val')
            .linkColor(() => 'rgba(255, 255, 255, 0.2)')
            .linkWidth(1.5)
            .linkDirectionalParticles(2)
            .linkDirectionalParticleSpeed(0.005)
            .backgroundColor('rgba(0,0,0,0)')
            .width(finalWidth)
            .height(finalHeight)
            .onNodeClick(node => {
                console.log(`Node Clicked: ${node.name} -> ${node.view}`);
                if (node.view) {
                    showView(node.view);
                }
            })
            .nodeCanvasObject((node, ctx, globalScale) => {
                const label = node.name;
                const fontSize = 14 / globalScale;
                ctx.font = `${fontSize}px Inter, sans-serif`;
                const textWidth = ctx.measureText(label).width;

                // Draw node circle with glow
                ctx.beginPath();
                ctx.arc(node.x, node.y, node.val / 2, 0, 2 * Math.PI, false);
                ctx.fillStyle = node.color;
                
                // Active bloom effect
                ctx.shadowColor = node.color;
                ctx.shadowBlur = 15 * (node.val / 10);
                ctx.fill();
                
                // Draw Label
                ctx.shadowBlur = 0; // Disable shadow for text
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
                ctx.fillText(label, node.x, node.y + (node.val / 2) + fontSize);
            });
        
        // Add text labels separately if needed, but let's see if this works first
        console.log("Graph initialized successfully.");
    }, 100);

    // Handle Resize
    window.addEventListener('resize', () => {
        if (featureGraph && container) {
            featureGraph.width(container.clientWidth);
            featureGraph.height(container.clientHeight);
        }
    });
}


document.getElementById('pull-model-btn')?.addEventListener('click', async () => {
    const input = document.getElementById('pull-model-input');
    const name = input.value.trim();
    if (!name) return;

    const container = document.getElementById('pull-progress-container');
    const bar = document.getElementById('pull-progress-bar');
    const text = document.getElementById('pull-status-text');

    container.classList.remove('hidden');
    bar.style.width = '0%';
    text.innerText = `Preparing to pull ${name}...`;

    const res = await window.api.pullModel(name);
    if (!res.success) {
        alert("Failed to start pull: " + res.error);
        container.classList.add('hidden');
    }
});

window.api.onPullProgress((data) => {
    const bar = document.getElementById('pull-progress-bar');
    const text = document.getElementById('pull-status-text');
    if (!bar || !text) return;
    
    if (data.status) {
        text.innerText = data.status;
        if (data.completed && data.total) {
            const percent = (data.completed / data.total * 100).toFixed(1);
            bar.style.width = `${percent}%`;
            text.innerText = `${data.status} (${percent}%)`;
        }
        
        if (data.status === 'success') {
            text.innerText = "Model pulled successfully!";
            bar.style.width = '100%';
            loadOllamaModels();
            setTimeout(() => {
                document.getElementById('pull-progress-container').classList.add('hidden');
                document.getElementById('pull-model-input').value = '';
            }, 3000);
        }
    }
});

// Init
checkOllama();
updateStats();
loadSettings();
setInterval(checkOllama, 10000);
