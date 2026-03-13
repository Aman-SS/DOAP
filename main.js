const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const db = require('./db');
const { crawlWebsite } = require('./scraper');
const axios = require('axios');

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    backgroundColor: '#0f172a', // Premium dark background
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  win.loadFile('index.html');
  
  // IPC Handlers
  ipcMain.handle('scrape-url', async (event, { url, selector }) => {
    try {
      const data = await crawlWebsite(url, selector);
      return { success: true, ...data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('save-scrape', async (event, data) => {
    try {
      const id = await db.saveScrape(data);
      return { success: true, id };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('get-history', async () => {
    return await db.getScrapes();
  });

  ipcMain.handle('get-table-data', async (event, tableName) => {
    try {
      return await db.getRawTableData(tableName);
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('delete-scrape', async (event, id) => {
    try {
      return await db.deleteScrape(id);
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('run-wsl-command', async (event, command) => {
    return new Promise((resolve) => {
      const { exec } = require('child_process');
      // Use 'wsl' prefix to run command in default WSL instance
      exec(`wsl ${command}`, (error, stdout, stderr) => {
        resolve({
          success: !error,
          stdout: stdout,
          stderr: stderr,
          error: error ? error.message : null
        });
      });
    });
  });

  ipcMain.handle('get-wsl-ip', async () => {
    return new Promise((resolve) => {
      const { exec } = require('child_process');
      exec(`wsl hostname -I`, (error, stdout) => {
        if (error) {
          resolve({ success: false, error: error.message });
        } else {
          const ip = stdout.trim().split(' ')[0];
          resolve({ success: true, ip: ip });
        }
      });
    });
  });

  ipcMain.handle('get-setting', async (event, key) => {
    return await db.getSetting(key);
  });

  ipcMain.handle('update-setting', async (event, { key, value }) => {
    try {
      return await db.setSetting(key, value);
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('check-ollama', async () => {
    try {
      const baseUrl = await db.getSetting('ollama_url') || 'http://127.0.0.1:11434';
      const response = await axios.get(`${baseUrl}/api/tags`);
      return { online: true, models: response.data.models };
    } catch (e) {
      return { online: false };
    }
  });

  ipcMain.handle('ask-ai', async (event, { scrapeId, prompt }) => {
    try {
        const baseUrl = await db.getSetting('ollama_url') || 'http://127.0.0.1:11434';
        const model = await db.getSetting('ollama_model') || 'llama3';
        const scrapes = await db.getScrapes();
        const scrape = scrapes.find(s => s.id === scrapeId);
        if (!scrape) throw new Error("Scrape session not found");

        const ollamaResponse = await axios.post(`${baseUrl}/api/generate`, {
            model: model,
            prompt: `Context extracted from ${scrape.url}: ${scrape.content}\n\nTask: ${prompt}`,
            stream: false
        });

        return { success: true, response: ollamaResponse.data.response };
    } catch (error) {
        return { success: false, error: error.message };
    }
  });

  ipcMain.handle('delete-model', async (event, modelName) => {
    try {
      const baseUrl = await db.getSetting('ollama_url') || 'http://127.0.0.1:11434';
      await axios.delete(`${baseUrl}/api/delete`, { data: { name: modelName } });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('pull-model', async (event, modelName) => {
    try {
      const baseUrl = await db.getSetting('ollama_url') || 'http://127.0.0.1:11434';
      const response = await axios.post(`${baseUrl}/api/pull`, { name: modelName, stream: true }, { responseType: 'stream' });
      
      response.data.on('data', chunk => {
        const lines = chunk.toString().split('\n').filter(l => l.trim());
        lines.forEach(line => {
          try {
            const json = JSON.parse(line);
            event.sender.send('pull-progress', json);
          } catch(e) {}
        });
      });

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('get-running-models', async () => {
    try {
      const baseUrl = await db.getSetting('ollama_url') || 'http://127.0.0.1:11434';
      const response = await axios.get(`${baseUrl}/api/ps`);
      return { success: true, models: response.data.models };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('get-model-info', async (event, modelName) => {
    try {
      const baseUrl = await db.getSetting('ollama_url') || 'http://127.0.0.1:11434';
      const response = await axios.post(`${baseUrl}/api/show`, { name: modelName });
      return { success: true, info: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  // win.webContents.openDevTools();
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
