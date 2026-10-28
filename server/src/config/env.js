const path = require('path');
const dotenv = require('dotenv');

// Load .env from repo root or server root if present
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const nodeEnv = process.env.NODE_ENV || 'development';

const env = {
  nodeEnv,
  isProd: nodeEnv === 'production',
  isTest: nodeEnv === 'test',
  port: parseInt(process.env.PORT || '4000', 10),
  host: process.env.HOST || '0.0.0.0',
  siteUrl: (process.env.SITE_URL || 'https://vphlabs.com').replace(/\/+$/, ''),
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  sqliteDbPath:
    process.env.SQLITE_DB_PATH ||
    path.resolve(__dirname, '../../data/vphlabs.db'),
  jwtSecret:
    process.env.JWT_SECRET ||
    'vphlabs-dev-only-jwt-secret-replace-in-production-env-64chars!!',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '12h',
  cookieSecure:
    process.env.COOKIE_SECURE === 'true' || nodeEnv === 'production',
  seedAdminEmail: process.env.SEED_ADMIN_EMAIL || 'admin@vphlabs.com',
  seedAdminPassword: process.env.SEED_ADMIN_PASSWORD || 'VphAdmin!2026#Secure',
  seedAdminName: process.env.SEED_ADMIN_NAME || 'شهرام امیری',
  storageDriver: process.env.STORAGE_DRIVER || 'local',
  maxUploadSizeMb: parseInt(process.env.MAX_UPLOAD_SIZE_MB || '5', 10),
  s3: {
    endpoint: process.env.S3_ENDPOINT || '',
    region: process.env.S3_REGION || 'ir-thr-at1',
    bucket: process.env.S3_BUCKET || '',
    accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
    publicBaseUrl: (process.env.S3_PUBLIC_BASE_URL || '').replace(/\/+$/, ''),
  },
  sentryDsn: process.env.SENTRY_DSN || '',
};

module.exports = env;
