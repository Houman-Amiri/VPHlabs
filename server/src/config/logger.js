const pino = require('pino');
const morgan = require('morgan');
const env = require('./env');

const logger = pino({
  level: env.isTest ? 'silent' : env.isProd ? 'info' : 'debug',
  base: {
    service: 'vphlabs-api',
    env: env.nodeEnv,
  },
  timestamp: pino.stdTimeFunctions.isoTime,
  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers["x-vph-auth"]',
      'req.headers.cookie',
      'password',
      'password_hash',
      'currentPassword',
      'newPassword',
    ],
    censor: '[REDACTED]',
  },
});

morgan.token('safe-url', (req) =>
  (req.originalUrl || req.url || '').replace(
    /([?&]_vph_auth=)[^&]+/g,
    '$1[REDACTED]'
  )
);

const httpLogger = morgan(
  ':remote-addr :method :safe-url :status :res[content-length] - :response-time ms',
  {
    skip: () => env.isTest,
    stream: {
      write: (message) => {
        logger.info({ type: 'http_access' }, message.trim());
      },
    },
  }
);

module.exports = {
  logger,
  httpLogger,
};
