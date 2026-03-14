import sqlite3 from 'sqlite3';
import { Database } from 'sqlite3';
import * as path from 'path';
import { app } from 'electron';

const sqlite = sqlite3.verbose();

// Database path in user data folder
const dbPath = path.join(app.getPath('userData'), 'doap_database.sqlite');

const db: Database = new sqlite.Database(dbPath, (err) => {
    if (err) {
        // Silent fail or system alert in production
    } else {
        initializeSchemas();
    }
});

function initializeSchemas() {
    db.serialize(() => {
        // Table for crawled data
        db.run(`CREATE TABLE IF NOT EXISTS scrapes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            url TEXT NOT NULL,
            title TEXT,
            content TEXT,
            markdown TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        // Table for AI plans/insights
        db.run(`CREATE TABLE IF NOT EXISTS insights (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            scrape_id INTEGER,
            model TEXT,
            prompt TEXT,
            response TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (scrape_id) REFERENCES scrapes (id)
        )`);

        // Table for Settings
        db.run(`CREATE TABLE IF NOT EXISTS settings (
            key TEXT PRIMARY KEY,
            value TEXT
        )`, () => {
            // Default settings
            db.run(`INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)`, ['ollama_url', 'http://127.0.0.1:11434']);
            db.run(`INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)`, ['ollama_model', 'llama3']);
        });
    });
}

export interface ScrapeData {
    id?: number;
    url: string;
    title: string;
    content: string;
    markdown: string;
    created_at?: string;
}

export interface dbManagerInterface {
    saveScrape: (data: ScrapeData) => Promise<number>;
    getScrapes: () => Promise<ScrapeData[]>;
    getRawTableData: (tableName: string) => Promise<any[]>;
    deleteScrape: (id: number) => Promise<boolean>;
    getSetting: (key: string) => Promise<string | null>;
    setSetting: (key: string, value: string) => Promise<boolean>;
}

const dbManager: dbManagerInterface = {
    saveScrape: (data: ScrapeData) => {
        return new Promise((resolve, reject) => {
            const { url, title, content, markdown } = data;
            db.run(
                `INSERT INTO scrapes (url, title, content, markdown) VALUES (?, ?, ?, ?)`,
                [url, title, content, markdown],
                function(this: any, err: Error | null) {
                    if (err) return reject(err);
                    resolve(this.lastID);
                }
            );
        });
    },
    getScrapes: () => {
        return new Promise((resolve, reject) => {
            db.all(`SELECT * FROM scrapes ORDER BY created_at DESC`, [], (err, rows: ScrapeData[]) => {
                if (err) return reject(err);
                resolve(rows);
            });
        });
    },
    getRawTableData: (tableName: string) => {
        return new Promise((resolve, reject) => {
            // Basic safety check for table names
            const allowedTables = ['scrapes', 'insights'];
            if (!allowedTables.includes(tableName)) {
                return reject(new Error('Invalid table name'));
            }
            db.all(`SELECT * FROM ${tableName} ORDER BY created_at DESC`, [], (err, rows: any[]) => {
                if (err) return reject(err);
                resolve(rows);
            });
        });
    },
    deleteScrape: (id: number) => {
        return new Promise((resolve, reject) => {
            db.serialize(() => {
                db.run(`DELETE FROM insights WHERE scrape_id = ?`, [id]);
                db.run(`DELETE FROM scrapes WHERE id = ?`, [id], function(err) {
                    if (err) return reject(err);
                    resolve(true);
                });
            });
        });
    },
    getSetting: (key: string) => {
        return new Promise((resolve, reject) => {
            db.get(`SELECT value FROM settings WHERE key = ?`, [key], (err, row: { value: string } | undefined) => {
                if (err) return reject(err);
                resolve(row ? row.value : null);
            });
        });
    },
    setSetting: (key: string, value: string) => {
        return new Promise((resolve, reject) => {
            db.run(`INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)`, [key, value], function(err) {
                if (err) return reject(err);
                resolve(true);
            });
        });
    }
};

export default dbManager;
