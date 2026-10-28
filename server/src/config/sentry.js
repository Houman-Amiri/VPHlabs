const Sentry = require('@sentry/node');
const env = require('./env');
const { logger } = require('./logger');

let sentryInitialized = false;

function initSentry() {
  if (!env.sentryDsn || sentryInitialized) {
    return false;
  }

  Sentry.init({
    dsn: env.sentryDsn,
    environment: env.nodeEnv,
    tracesSampleRate: env.isProd ? 0.2 : 1.0,
  });

  sentryInitialized = true;
  logger.info('Sentry error tracking initialized on Express server');
  return true;
}

function captureExceptionSafe(err, context = {}) {
  if (sentryInitialized) {
    Sentry.captureException(err, { extra: context });
  }
}

function attachSentryErrorHandler(app) {
  if (sentryInitialized && typeof Sentry.setupExpressErrorHandler === 'function') {
    Sentry.setupExpressErrorHandler(app);
  }
}

module.exports = {
  initSentry,
  captureExceptionSafe,
  attachSentryErrorHandler,
};
