const fs = require('fs');
const path = require('path');
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const env = require('./config/env');
const { httpLogger } = require('./config/logger');
const { initSentry, attachSentryErrorHandler } = require('./config/sentry');
const { sanitizeRequest } = require('./middlewares/sanitize');
const { apiRateLimiter } = require('./middlewares/rateLimiter');
const { UPLOADS_DIR } = require('./middlewares/upload');
const { apiRouter } = require('./routes');
const seoRoutes = require('./routes/seoRoutes');
const { notFoundHandler, errorHandler } = require('./middlewares/errorHandler');

function isAllowedOrigin(origin) {
  if (!origin) return true; // Same-origin or server-to-server requests
  if (origin === env.clientOrigin || origin === env.siteUrl) return true;
  if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(origin)) return true;
  if (/^https:\/\/[a-z0-9-]+\.e2b\.app$/i.test(origin)) return true;
  if (/^https?:\/\/([a-z0-9-]+\.)?vphlabs\.com$/i.test(origin)) return true;
  return false;
}

function createApp() {
  initSentry();

  const app = express();
  app.set('trust proxy', 1);

  // Security headers (configured to allow preview iframe embedding & media serving)
  app.use(
    helmet({
      frameguard: false,
      contentSecurityPolicy: false,
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    })
  );

  // Strict origin-checked CORS with credentials for httpOnly JWT cookies
  app.use(
    cors({
      origin(origin, callback) {
        if (isAllowedOrigin(origin)) {
          return callback(null, true);
        }
        return callback(new Error('Origin not permitted by CORS policy'));
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: [
        'Content-Type',
        'Authorization',
        'X-VPH-Auth',
        'X-Requested-With',
      ],
    })
  );

  // HTTP request logging (Morgan -> Pino)
  app.use(httpLogger);

  // Body & cookie parsers
  app.use(express.json({ limit: '2mb' }));
  app.use(express.urlencoded({ extended: true, limit: '2mb' }));
  app.use(cookieParser());

  // Input sanitization against XSS & prototype pollution
  app.use(sanitizeRequest);

  // Static uploaded media & seeded banners
  app.use('/uploads', express.static(UPLOADS_DIR, { maxAge: '7d' }));
  const publicBannersDir = path.resolve(__dirname, '../../client/public/banners');
  if (fs.existsSync(publicBannersDir)) {
    app.use('/banners', express.static(publicBannersDir, { maxAge: '7d' }));
  }

  // Root SEO routes (/sitemap.xml, /robots.txt)
  app.use('/', seoRoutes);

  // General API rate limit + API routes
  app.use('/api', apiRateLimiter, apiRouter);

  // Serve built React SPA in production if client/dist exists
  const clientDistDir = path.resolve(__dirname, '../../client/dist');
  if (env.isProd && fs.existsSync(clientDistDir)) {
    app.use(express.static(clientDistDir));
    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api')) return next();
      return res.sendFile(path.join(clientDistDir, 'index.html'));
    });
  }

  // Sentry error capture + 404 + Centralized Express Error Handler
  attachSentryErrorHandler(app);
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

module.exports = {
  createApp,
};
