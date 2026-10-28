const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');
const env = require('../config/env');
const { logger } = require('../config/logger');

let dbInstance = null;
let currentDbPath = null;

/**
 * Initialize or return the singleton better-sqlite3 database connection.
 * Applies WAL journal mode, foreign key enforcement, and busy timeout pragmas.
 *
 * @param {string} [overridePath] Optional DB path override (e.g., ':memory:' in tests)
 * @returns {import('better-sqlite3').Database}
 */
function getDb(overridePath) {
  const targetPath = overridePath || process.env.SQLITE_DB_PATH || env.sqliteDbPath;

  if (dbInstance && currentDbPath === targetPath && dbInstance.open) {
    return dbInstance;
  }

  if (dbInstance && dbInstance.open) {
    dbInstance.close();
  }

  if (targetPath !== ':memory:') {
    const dir = path.dirname(path.resolve(targetPath));
    fs.mkdirSync(dir, { recursive: true });
  }

  const db = new Database(targetPath);

  // Production-grade SQLite pragmas
  if (targetPath !== ':memory:') {
    db.pragma('journal_mode = WAL');
  }
  db.pragma('foreign_keys = ON');
  db.pragma('synchronous = NORMAL');
  db.pragma('busy_timeout = 5000');
  db.pragma('temp_store = MEMORY');

  dbInstance = db;
  currentDbPath = targetPath;

  logger.debug({ dbPath: targetPath }, 'SQLite better-sqlite3 connection ready');
  return dbInstance;
}

/**
 * Gracefully close the SQLite database connection.
 */
function closeDb() {
  if (dbInstance && dbInstance.open) {
    dbInstance.close();
    logger.debug('SQLite connection closed');
  }
  dbInstance = null;
  currentDbPath = null;
}

module.exports = {
  getDb,
  closeDb,
};
