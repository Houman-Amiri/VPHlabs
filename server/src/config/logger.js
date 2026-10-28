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
      'req.headers.cookie',
      'password',
      'password_hash',
      'currentPassword',
      'newPassword',
    ],
    censor: '[REDACTED]',
  },
});

const httpLogger = morgan(
  ':remote-addr :method :url :status :res[content-length] - :response-time ms',
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
