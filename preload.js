const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  scrapeUrl: (url, selector) => ipcRenderer.invoke('scrape-url', { url, selector }),
  saveScrape: (data) => ipcRenderer.invoke('save-scrape', data),
  deleteScrape: (id) => ipcRenderer.invoke('delete-scrape', id),
  getHistory: () => ipcRenderer.invoke('get-history'),
  getTableData: (tableName) => ipcRenderer.invoke('get-table-data', tableName),
  getSetting: (key) => ipcRenderer.invoke('get-setting', key),
  updateSetting: (key, value) => ipcRenderer.invoke('update-setting', { key, value }),
  runWslCommand: (command) => ipcRenderer.invoke('run-wsl-command', command),
  getWslIp: () => ipcRenderer.invoke('get-wsl-ip'),
  checkOllama: () => ipcRenderer.invoke('check-ollama'),
  askAI: (scrapeId, prompt) => ipcRenderer.invoke('ask-ai', { scrapeId, prompt }),
  askCuriosity: (query) => ipcRenderer.invoke('ask-curiosity', query),
  deleteModel: (name) => ipcRenderer.invoke('delete-model', name),
  pullModel: (name) => ipcRenderer.invoke('pull-model', name),
  getRunningModels: () => ipcRenderer.invoke('get-running-models'),
  getModelInfo: (name) => ipcRenderer.invoke('get-model-info', name),
  onPullProgress: (callback) => ipcRenderer.on('pull-progress', (event, data) => callback(data))
});
