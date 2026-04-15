import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

// Singleton instance to prevent multiple connections in dev mode
let db: Database.Database | null = null;

// Check if running on Vercel (read-only filesystem)
const isVercel = process.env.VERCEL === '1' || process.env.VERCEL_ENV !== undefined;

// On Vercel, use /tmp for writable SQLite files - the main DB in the bundle is read-only
function getDbPath(): string {
  const bundledDbPath = path.join(process.cwd(), 'inventory.db');

  if (isVercel) {
    const tmpDbPath = '/tmp/inventory.db';
    // Copy the bundled DB to /tmp if it doesn't exist there yet
    if (!fs.existsSync(tmpDbPath) && fs.existsSync(bundledDbPath)) {
      fs.copyFileSync(bundledDbPath, tmpDbPath);
    }
    return tmpDbPath;
  }

  return bundledDbPath;
}

export function getDb() {
  if (!db) {
    const dbPath = getDbPath();
    db = new Database(dbPath);
    db.pragma('journal_mode = WAL');
    
    db.exec(`
      CREATE TABLE IF NOT EXISTS orders (
        order_id TEXT PRIMARY KEY,
        status TEXT NOT NULL,
        total_amount REAL NOT NULL,
        items_json TEXT NOT NULL,
        user_name TEXT,
        address TEXT NOT NULL,
        phone TEXT NOT NULL,
        abha_id TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    try { db.exec(`ALTER TABLE orders ADD COLUMN user_name TEXT`); } catch (e) {}
    try { db.exec(`ALTER TABLE orders ADD COLUMN address TEXT`); } catch (e) {}
    try { db.exec(`ALTER TABLE orders ADD COLUMN phone TEXT`); } catch (e) {}
    try { db.exec(`ALTER TABLE orders ADD COLUMN abha_id TEXT`); } catch (e) {}

    db.exec(`
      CREATE TABLE IF NOT EXISTS health_vault (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        abha_id TEXT NOT NULL,
        document_name TEXT NOT NULL,
        document_text TEXT NOT NULL,
        uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    db.exec(`
      CREATE TABLE IF NOT EXISTS ai_cache (
        hash_key TEXT PRIMARY KEY,
        response_json TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);
  }
  return db;
}
