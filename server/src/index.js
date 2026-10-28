const env = require('./config/env');
const { logger } = require('./config/logger');
const { closeDb } = require('./connection/db');
const { runMigrations } = require('./migrations/runner');
const { seedDatabase } = require('./seeds/seed');
const { createApp } = require('./app');

async function bootstrap() {
  // Phase 6.2: Apply pending numbered .sql migrations BEFORE starting the server
  const migrationResult = runMigrations();
  logger.info(
    {
      newlyApplied: migrationResult.applied.length,
      totalMigrations: migrationResult.total,
    },
    'Database migrations verified prior to server startup'
  );

  // Ensure initial company charter data & admin account exist if DB is empty
  seedDatabase();

  const app = createApp();
  const server = app.listen(env.port, env.host, () => {
    logger.info(
      { host: env.host, port: env.port, env: env.nodeEnv },
      `V.I.R.A Pardazesh Hoomaan API listening on http://${env.host}:${env.port}`
    );
  });

  const shutdown = (signal) => {
    logger.info({ signal }, 'Shutting down server gracefully...');
    server.close(() => {
      closeDb();
      process.exit(0);
    });
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

bootstrap().catch((err) => {
  logger.fatal({ err }, 'Fatal error during server startup');
  process.exit(1);
});
