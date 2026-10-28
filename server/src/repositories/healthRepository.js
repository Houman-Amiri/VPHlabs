const { prepareStmt } = require('./_stmtCache');

const healthRepository = {
  checkStatus() {
    const ping = prepareStmt('SELECT 1 AS ok, sqlite_version() AS sqliteVersion').get();
    const migrations = prepareStmt(
      'SELECT filename, applied_at FROM migrations_applied ORDER BY id ASC'
    ).all();

    return {
      database: ping && ping.ok === 1 ? 'connected' : 'error',
      sqliteVersion: ping ? ping.sqliteVersion : 'unknown',
      migrationsCount: migrations.length,
      lastMigration:
        migrations.length > 0 ? migrations[migrations.length - 1].filename : null,
    };
  },
};

module.exports = healthRepository;
