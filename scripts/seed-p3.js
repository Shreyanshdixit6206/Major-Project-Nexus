const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');
const csv = require('csv-parser');

const dbPath = path.join(__dirname, '..', 'inventory.db');
const azCsvPath = path.join(__dirname, '..', 'Data sets', 'A_Z_medicines_dataset_of_India.csv');
const pmbjpCsvPath = path.join(__dirname, '..', 'Data sets', 'Product List_13_4_2026 @ 22_22_43.csv');

// Open the DB
const db = new Database(dbPath);

console.log('Setting up Phase 3 SQLite Tables...');

db.exec(`
  DROP TABLE IF EXISTS a_z_medicines;
  CREATE TABLE a_z_medicines (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    price REAL,
    is_discontinued TEXT,
    manufacturer TEXT,
    type TEXT,
    pack_size_label TEXT,
    composition1 TEXT,
    composition2 TEXT
  );
  
  CREATE INDEX idx_az_name ON a_z_medicines(name);
  CREATE INDEX idx_az_composition1 ON a_z_medicines(composition1);

  DROP TABLE IF EXISTS pmbjp_medicines;
  CREATE TABLE pmbjp_medicines (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    drug_code TEXT,
    generic_name TEXT,
    unit_size TEXT,
    mrp REAL,
    group_name TEXT
  );

  CREATE INDEX idx_pmbjp_generic_name ON pmbjp_medicines(generic_name);
`);

const insertAzStmt = db.prepare(`
  INSERT INTO a_z_medicines (name, price, is_discontinued, manufacturer, type, pack_size_label, composition1, composition2)
  VALUES (@name, @price, @is_discontinued, @manufacturer, @type, @pack_size_label, @composition1, @composition2)
`);

const insertPmbjpStmt = db.prepare(`
  INSERT INTO pmbjp_medicines (drug_code, generic_name, unit_size, mrp, group_name)
  VALUES (@drug_code, @generic_name, @unit_size, @mrp, @group_name)
`);

async function ingestPMBJP() {
  return new Promise((resolve, reject) => {
    console.log('Ingesting PMBJP Medicines...');
    let count = 0;
    db.exec('BEGIN TRANSACTION');
    fs.createReadStream(pmbjpCsvPath)
      .pipe(csv())
      .on('data', (row) => {
        try {
          insertPmbjpStmt.run({
            drug_code: row['Drug Code'] || '',
            generic_name: row['Generic Name'] || '',
            unit_size: row['Unit Size'] || '',
            mrp: parseFloat(row['MRP']) || 0,
            group_name: row['Group Name'] || ''
          });
          count++;
        } catch (err) {
          console.error(err);
        }
      })
      .on('end', () => {
        db.exec('COMMIT');
        console.log('Successfully ingested ' + count + ' PMBJP generic medicines!');
        resolve();
      })
      .on('error', reject);
  });
}

async function ingestAZ() {
  return new Promise((resolve, reject) => {
    console.log('Ingesting A to Z Medicines (This is a large dataset...)');
    let count = 0;
    db.exec('BEGIN TRANSACTION;');
    fs.createReadStream(azCsvPath)
      .pipe(csv({
        mapHeaders: ({ header, index }) => {
          if (header.includes('price')) return 'price';
          return header;
        }
      }))
      .on('data', (row) => {
        try {
          insertAzStmt.run({
            name: row['name'] || '',
            price: parseFloat(row['price']) || 0,
            is_discontinued: row['Is_discontinued'] || 'FALSE',
            manufacturer: row['manufacturer_name'] || '',
            type: row['type'] || '',
            pack_size_label: row['pack_size_label'] || '',
            composition1: row['short_composition1'] || '',
            composition2: row['short_composition2'] || ''
          });
          count++;
          if (count % 50000 === 0) console.log('Inserted ' + count + ' A-Z rows...');
        } catch (err) {
          // Ignore
        }
      })
      .on('end', () => {
        db.exec('COMMIT;');
        console.log('Successfully ingested ' + count + ' A-Z medicines!');
        resolve();
      })
      .on('error', reject);
  });
}

async function main() {
  try {
    await ingestPMBJP();
    await ingestAZ();
    console.log('Database preparation complete!');
  } catch(e) {
    console.error('Error during setup:', e);
  } finally {
    db.close();
  }
}

main();
