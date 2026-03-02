const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, 'data.db');
const schemaPath = path.join(__dirname, 'schema.sql');

// Open database connection
const db = new Database(dbPath, { verbose: console.log });
db.pragma('journal_mode = WAL');

// Initialize database schema
function initDb() {
    const schema = fs.readFileSync(schemaPath, 'utf-8');
    db.exec(schema);
    console.log('Database schema initialized.');
}

module.exports = {
    db,
    initDb
};
