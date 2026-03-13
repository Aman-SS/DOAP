const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { app } = require('electron');

// Ensure database directory exists in user data folder
const dbPath = path.join(app.getPath('userData'), 'doap_database.sqlite');
console.log('Database path:', dbPath);

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database', err.message);
    } else {
        console.log('Connected to the SQLite database.');
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
        });
    });
}

const dbManager = {
    saveScrape: (data) => {
        return new Promise((resolve, reject) => {
            const { url, title, content, markdown } = data;
            db.run(
                `INSERT INTO scrapes (url, title, content, markdown) VALUES (?, ?, ?, ?)`,
                [url, title, content, markdown],
                function(err) {
                    if (err) return reject(err);
                    resolve(this.lastID);
                }
            );
        });
    },
    getScrapes: () => {
        return new Promise((resolve, reject) => {
            db.all(`SELECT * FROM scrapes ORDER BY created_at DESC`, [], (err, rows) => {
                if (err) return reject(err);
                resolve(rows);
            });
        });
    },
    getRawTableData: (tableName) => {
        return new Promise((resolve, reject) => {
            // Basic safety check for table names
            const allowedTables = ['scrapes', 'insights'];
            if (!allowedTables.includes(tableName)) {
                return reject(new Error('Invalid table name'));
            }
            db.all(`SELECT * FROM ${tableName} ORDER BY created_at DESC`, [], (err, rows) => {
                if (err) return reject(err);
                resolve(rows);
            });
        });
    },
    deleteScrape: (id) => {
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
    getSetting: (key) => {
        return new Promise((resolve, reject) => {
            db.get(`SELECT value FROM settings WHERE key = ?`, [key], (err, row) => {
                if (err) return reject(err);
                resolve(row ? row.value : null);
            });
        });
    },
    setSetting: (key, value) => {
        return new Promise((resolve, reject) => {
            db.run(`INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)`, [key, value], function(err) {
                if (err) return reject(err);
                resolve(true);
            });
        });
    }
};

module.exports = dbManager;
