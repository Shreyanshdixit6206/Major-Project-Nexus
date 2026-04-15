const path = require('path');
const Database = require('better-sqlite3');

const dbPath = path.join(__dirname, '..', 'inventory.db');
const db = new Database(dbPath);

console.log('Setting up Phase 2 Tables...');

db.exec(`
  CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    total_amount REAL,
    status TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS health_vault (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    abha_id TEXT NOT NULL,
    document_name TEXT,
    document_text TEXT,
    uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  
  CREATE INDEX IF NOT EXISTS idx_abha_id ON health_vault(abha_id);
`);

console.log('Phase 2 Tables successfully integrated into inventory.db!');
db.close();
