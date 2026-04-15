const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');
const csv = require('csv-parser');

const dbPath = path.join(__dirname, '..', 'inventory.db');
const csvPath = path.join(__dirname, '..', 'indian_pharmaceutical_products_clean.csv');

// Create or open the DB
const db = new Database(dbPath);

console.log('Setting up SQLite Database...');

// Create table
db.exec(`
  DROP TABLE IF EXISTS medicines;
  CREATE TABLE medicines (
    id INTEGER PRIMARY KEY,
    brand_name TEXT,
    manufacturer TEXT,
    price_inr REAL,
    is_discontinued TEXT,
    dosage_form TEXT,
    primary_ingredient TEXT,
    primary_strength TEXT,
    therapeutic_class TEXT
  );
  
  CREATE INDEX idx_brand_name ON medicines(brand_name);
  CREATE INDEX idx_primary_ingredient ON medicines(primary_ingredient);
`);

const insertStmt = db.prepare(`
  INSERT INTO medicines (id, brand_name, manufacturer, price_inr, is_discontinued, dosage_form, primary_ingredient, primary_strength, therapeutic_class) 
  VALUES (@id, @brand_name, @manufacturer, @price_inr, @is_discontinued, @dosage_form, @primary_ingredient, @primary_strength, @therapeutic_class)
`);

let count = 0;

console.log('Starting CSV Ingestion (This may take a minute for 250k+ rows)...');

db.exec('BEGIN TRANSACTION');

fs.createReadStream(csvPath)
  .pipe(csv())
  .on('data', (row) => {
    try {
      insertStmt.run({
        id: row.product_id,
        brand_name: row.brand_name || '',
        manufacturer: row.manufacturer || '',
        price_inr: parseFloat(row.price_inr) || 0,
        is_discontinued: row.is_discontinued || 'False',
        dosage_form: row.dosage_form || '',
        primary_ingredient: row.primary_ingredient || '',
        primary_strength: row.primary_strength || '',
        therapeutic_class: row.therapeutic_class || ''
      });
      count++;
      if (count % 50000 === 0) console.log(`Inserted ${count} rows...`);
    } catch (err) {
      // Ignore duplicates or malformed rows if any
    }
  })
  .on('end', () => {
    db.exec('COMMIT');
    console.log(`Successfully ingested ${count} medicines into inventory.db!`);
    db.close();
  });
