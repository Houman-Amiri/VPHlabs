const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { getDb } = require('../connection/db');
const { logger } = require('../config/logger');

const MIGRATIONS_DIR = __dirname;

/**
 * Minimal SQL migration runner for better-sqlite3.
 * Ensures `migrations_applied` table exists, scans numbered `.sql` files in
 * lexicographical order, and applies pending migrations atomically inside a transaction.
 *
 * @param {import('better-sqlite3').Database} [customDb]
 * @returns {{ applied: string[], total: number }}
 */
function runMigrations(customDb) {
  const db = customDb || getDb();

  db.exec(`
    CREATE TABLE IF NOT EXISTS migrations_applied (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      filename TEXT NOT NULL UNIQUE,
      checksum TEXT NOT NULL,
      applied_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  const files = fs
    .readdirSync(MIGRATIONS_DIR)
    .filter((f) => /^\d+_.*\.sql$/i.test(f))
    .sort((a, b) => a.localeCompare(b));

  const getAppliedStmt = db.prepare(
    'SELECT filename, checksum FROM migrations_applied WHERE filename = ?'
  );
  const insertAppliedStmt = db.prepare(
    'INSERT INTO migrations_applied (filename, checksum) VALUES (?, ?)'
  );

  const newlyApplied = [];

  for (const filename of files) {
    const fullPath = path.join(MIGRATIONS_DIR, filename);
    const sql = fs.readFileSync(fullPath, 'utf8');
    const checksum = crypto.createHash('sha256').update(sql).digest('hex');

    const existing = getAppliedStmt.get(filename);
    if (existing) {
      continue;
    }

    const applyTx = db.transaction(() => {
      db.exec(sql);
      insertAppliedStmt.run(filename, checksum);
    });

    applyTx();
    newlyApplied.push(filename);
    logger.info({ filename }, 'Applied SQL migration');
  }

  return {
    applied: newlyApplied,
    total: files.length,
  };
}

if (require.main === module) {
  try {
    const result = runMigrations();
    console.log(
      `[migrations] Complete. Newly applied: ${result.applied.length} / Total migrations: ${result.total}`
    );
    if (result.applied.length > 0) {
      console.log('[migrations] Applied files:', result.applied.join(', '));
    }
  } catch (err) {
    console.error('[migrations] Failed to apply SQL migrations:', err);
    process.exit(1);
  }
}

module.exports = {
  runMigrations,
};
