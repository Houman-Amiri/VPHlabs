const { getDb } = require('../connection/db');

const cacheByDb = new WeakMap();

/**
 * Returns a cached `better-sqlite3` prepared statement bound to the current active DB.
 * Ensures true prepared statement compilation reuse while remaining safe across test DB resets.
 *
 * @param {string} sql
 * @returns {import('better-sqlite3').Statement}
 */
function prepareStmt(sql) {
  const db = getDb();
  let map = cacheByDb.get(db);
  if (!map) {
    map = new Map();
    cacheByDb.set(db, map);
  }
  let stmt = map.get(sql);
  if (!stmt) {
    stmt = db.prepare(sql);
    map.set(sql, stmt);
  }
  return stmt;
}

module.exports = {
  prepareStmt,
  getDb,
};
