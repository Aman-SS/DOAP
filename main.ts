console.log('MAIN_PROCESS_STARTING');
import { app, BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';
import database from './database.js';
import { crawlWebsite } from './scraper.js';
import axios from 'axios';
import { spawn, exec } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    backgroundColor: '#0f172a', // Premium dark background
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      webviewTag: true
    }
  });

  win.loadFile(path.join(__dirname, '../index.html'));
  win.maximize();
  
  // IPC Handlers
  ipcMain.handle('scrape-url', async (event, { url, selector }: { url: string, selector: string | null }) => {
    try {
      const data = await crawlWebsite(url, selector);
      return { success: true, ...data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('save-scrape', async (event, data: any) => {
    try {
      const id = await database.saveScrape(data);
      return { success: true, id };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('get-history', async () => {
    return await database.getScrapes();
  });

  ipcMain.handle('get-table-data', async (event, tableName: string) => {
    try {
      return await database.getRawTableData(tableName);
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('delete-scrape', async (event, id: number) => {
    try {
      return await database.deleteScrape(id);
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('run-wsl-command', async (event, command: string) => {
    return new Promise((resolve) => {
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

  ipcMain.on('terminal-command-stream', (event, command: string) => {
    try {
      // Use cmd /c wsl to better handle combined command strings if needed, 
      // or just spawn wsl with arguments
      const args = command.split(' ').filter(Boolean);
      const child = spawn('wsl', args);
      
      child.stdout.on('data', (data) => {
        event.sender.send('terminal-stream-data', data.toString());
      });
      
      child.stderr.on('data', (data) => {
        event.sender.send('terminal-stream-data', data.toString());
      });
      
      child.on('close', (code) => {
        event.sender.send('terminal-stream-exit', code);
      });
    } catch (e: any) {
      event.sender.send('terminal-stream-data', `Error spawning command: ${e.message}\n`);
      event.sender.send('terminal-stream-exit', 1);
    }
  });

  ipcMain.handle('get-wsl-ip', async () => {
    return new Promise((resolve) => {
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

  ipcMain.handle('get-setting', async (event, key: string) => {
    return await database.getSetting(key);
  });

  ipcMain.handle('update-setting', async (event, { key, value }: { key: string, value: string }) => {
    try {
      return await database.setSetting(key, value);
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('check-ollama', async () => {
    try {
      const baseUrl = await database.getSetting('ollama_url') || 'http://127.0.0.1:11434';
      const response = await axios.get(`${baseUrl}/api/tags`);
      return { online: true, models: response.data.models };
    } catch (e) {
      return { online: false };
    }
  });

  ipcMain.handle('ask-ai', async (event, { scrapeId, prompt }: { scrapeId: number, prompt: string }) => {
    try {
        const baseUrl = await database.getSetting('ollama_url') || 'http://127.0.0.1:11434';
        const model = await database.getSetting('ollama_model') || 'llama3';
        const scrapes = await database.getScrapes();
        const scrape = scrapes.find(s => s.id === scrapeId);
        if (!scrape) throw new Error("Scrape session not found");

        const ollamaResponse = await axios.post(`${baseUrl}/api/generate`, {
            model: model,
            prompt: `Context extracted from ${scrape.url}: ${scrape.content}\n\nTask: ${prompt}`,
            stream: false
        });

        return { success: true, response: ollamaResponse.data.response };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
  });

  ipcMain.handle('ask-curiosity', async (event, query: string) => {
    try {
        const baseUrl = await database.getSetting('ollama_url') || 'http://127.0.0.1:11434';
        const model = await database.getSetting('ollama_model') || 'llama3';
        const scrapes = await database.getScrapes();
        
        if (!scrapes || scrapes.length === 0) {
            return { success: true, response: "I don't have any scraped data yet. Please go to the 'New Scrape' tab to crawl some websites first!", context: [] };
        }

        // Simple Keyword-based Retrieval (Naive RAG)
        const queryWords = query.toLowerCase().split(/\W+/).filter(w => w.length > 2);
        
        // Score scrapes based on keyword frequency
        const scoredScrapes = scrapes.map(scrape => {
            const content = (scrape.content || '').toLowerCase();
            const title = (scrape.title || '').toLowerCase();
            let score = 0;
            queryWords.forEach(word => {
                if (title.includes(word)) score += 5; // Title match gives higher weight
                const regex = new RegExp(word, 'g');
                const matches = content.match(regex);
                if (matches) score += matches.length;
            });
            return { ...scrape, score };
        });

        // Sort by score descending and take top 2
        scoredScrapes.sort((a, b) => b.score - a.score);
        const topContexts = scoredScrapes.filter(s => s.score > 0).slice(0, 2);
        
        // Fallback to recent 2 if no keyword match
        const contextsToUse = topContexts.length > 0 ? topContexts : scrapes.slice(0, 2);

        // Build the prompt context
        let contextText = contextsToUse.map(c => `Source URL: ${c.url}\nTitle: ${c.title}\nContent: ${c.content.substring(0, 2500)}...`).join('\n\n---\n\n');

        const systemPrompt = `You are a helpful AI assistant integrated into a desktop app. Answer the user's question using ONLY the provided context below. If the answer is not in the context, say "I don't have enough information in the scraped data to answer that."\n\nContext:\n${contextText}`;

        const ollamaResponse = await axios.post(`${baseUrl}/api/generate`, {
            model: model,
            prompt: `System: ${systemPrompt}\n\nUser Question: ${query}`,
            stream: false
        });

        return { 
            success: true, 
            response: ollamaResponse.data.response,
            context: contextsToUse.map(c => ({ title: c.title || c.url, url: c.url }))
        };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
  });

  ipcMain.handle('delete-model', async (event, modelName: string) => {
    try {
      const baseUrl = await database.getSetting('ollama_url') || 'http://127.0.0.1:11434';
      await axios.delete(`${baseUrl}/api/delete`, { data: { name: modelName } });
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('pull-model', async (event, modelName: string) => {
    try {
      const baseUrl = await database.getSetting('ollama_url') || 'http://127.0.0.1:11434';
      const response = await axios.post(`${baseUrl}/api/pull`, { name: modelName, stream: true }, { responseType: 'stream' });
      
      response.data.on('data', (chunk: any) => {
        const lines = chunk.toString().split('\n').filter((l: string) => l.trim());
        lines.forEach((line: string) => {
          try {
            const json = JSON.parse(line);
            event.sender.send('pull-progress', json);
          } catch(e) {}
        });
      });

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('get-running-models', async () => {
    try {
      const baseUrl = await database.getSetting('ollama_url') || 'http://127.0.0.1:11434';
      const response = await axios.get(`${baseUrl}/api/ps`);
      return { success: true, models: response.data.models };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('get-model-info', async (event, modelName: string) => {
    try {
      const baseUrl = await database.getSetting('ollama_url') || 'http://127.0.0.1:11434';
      const response = await axios.post(`${baseUrl}/api/show`, { name: modelName });
      return { success: true, info: response.data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('start-ollama-service', async () => {
    return new Promise((resolve) => {
      // Execute 'ollama serve' in WSL. Use detached to let it survive parent exit if needed,
      // and stdio ignore to avoid bloat.
      try {
        const child = spawn('wsl', ['ollama', 'serve'], {
          detached: true,
          stdio: 'ignore'
        });
        child.unref();
        resolve({ success: true, message: 'Ollama service start command sent' });
      } catch (error: any) {
        resolve({ success: false, error: error.message });
      }
    });
  });

  ipcMain.handle('stop-ollama-service', async () => {
    return new Promise((resolve) => {
      // Ubuntu/Debian usually has pkill. Fallback to killall if needed.
      exec('wsl pkill ollama', (error, stdout, stderr) => {
        if (error && (error as any).code !== 1) { // code 1 usually means process not found
          resolve({ success: false, error: error.message || stderr });
        } else {
          resolve({ success: true, message: 'Ollama service stopped' });
        }
      });
    });
  });

  win.webContents.on('console-message', (event, level, message, line, sourceId) => {
    console.log(`[Browser Console L${level}] ${message} (line ${line} in ${sourceId})`);
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
