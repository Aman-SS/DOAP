import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('api', {
  scrapeUrl: (url: string, selector: string | null) => ipcRenderer.invoke('scrape-url', { url, selector }),
  saveScrape: (data: any) => ipcRenderer.invoke('save-scrape', data),
  deleteScrape: (id: number) => ipcRenderer.invoke('delete-scrape', id),
  getHistory: () => ipcRenderer.invoke('get-history'),
  getTableData: (tableName: string) => ipcRenderer.invoke('get-table-data', tableName),
  getSetting: (key: string) => ipcRenderer.invoke('get-setting', key),
  updateSetting: (key: string, value: string) => ipcRenderer.invoke('update-setting', { key, value }),
  runWslCommand: (command: string) => ipcRenderer.invoke('run-wsl-command', command),
  getWslIp: () => ipcRenderer.invoke('get-wsl-ip'),
  checkOllama: () => ipcRenderer.invoke('check-ollama'),
  askAI: (scrapeId: number, prompt: string) => ipcRenderer.invoke('ask-ai', { scrapeId, prompt }),
  askCuriosity: (query: string) => ipcRenderer.invoke('ask-curiosity', query),
  deleteModel: (name: string) => ipcRenderer.invoke('delete-model', name),
  pullModel: (name: string) => ipcRenderer.invoke('pull-model', name),
  getRunningModels: () => ipcRenderer.invoke('get-running-models'),
  getModelInfo: (name: string) => ipcRenderer.invoke('get-model-info', name),
  startOllamaService: () => ipcRenderer.invoke('start-ollama-service'),
  stopOllamaService: () => ipcRenderer.invoke('stop-ollama-service'),
  onPullProgress: (callback: (data: any) => void) => ipcRenderer.on('pull-progress', (event, data) => callback(data)),
  terminalCommandStream: (command: string) => ipcRenderer.send('terminal-command-stream', command),
  onTerminalData: (callback: (data: string) => void) => ipcRenderer.on('terminal-stream-data', (event, data) => callback(data)),
  onTerminalExit: (callback: (code: number) => void) => ipcRenderer.on('terminal-stream-exit', (event, code) => callback(code))
});
