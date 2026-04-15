import Database from 'better-sqlite3';
import path from 'path';

// Singleton instance to prevent multiple connections in dev mode
let db: Database.Database | null = null;

export function getDb() {
  if (!db) {
    const dbPath = path.join(process.cwd(), 'inventory.db');
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
