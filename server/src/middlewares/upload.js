const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const multer = require('multer');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const env = require('../config/env');
const { AppError } = require('./errorHandler');

const UPLOADS_DIR = env.uploadsDir;
fs.mkdirSync(UPLOADS_DIR, { recursive: true });

const ALLOWED_MIME_EXT = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
};

/**
 * Verifies binary magic bytes match declared image MIME type to block spoofed files.
 */
function hasValidImageMagicBytes(buffer, mimeType) {
  if (!buffer || buffer.length < 12) return false;

  if (mimeType === 'image/jpeg') {
    return buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  }
  if (mimeType === 'image/png') {
    return (
      buffer[0] === 0x89 &&
      buffer[1] === 0x50 &&
      buffer[2] === 0x4e &&
      buffer[3] === 0x47
    );
  }
  if (mimeType === 'image/gif') {
    const header = buffer.subarray(0, 4).toString('ascii');
    return header === 'GIF8';
  }
  if (mimeType === 'image/webp') {
    const riff = buffer.subarray(0, 4).toString('ascii');
    const webp = buffer.subarray(8, 12).toString('ascii');
    return riff === 'RIFF' && webp === 'WEBP';
  }
  return false;
}

const uploadMiddleware = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: env.maxUploadSizeMb * 1024 * 1024,
    files: 1,
  },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_MIME_EXT[file.mimetype]) {
      return cb(
        new AppError(
          'فرمت فایل مجاز نیست. تنها تصاویر JPG، PNG، WEBP و GIF قابل بارگذاری هستند.',
          400,
          'INVALID_FILE_TYPE'
        )
      );
    }
    return cb(null, true);
  },
});

let s3ClientInstance = null;
function getS3Client() {
  if (!s3ClientInstance) {
    s3ClientInstance = new S3Client({
      region: env.s3.region,
      endpoint: env.s3.endpoint || undefined,
      forcePathStyle: true,
      credentials: {
        accessKeyId: env.s3.accessKeyId,
        secretAccessKey: env.s3.secretAccessKey,
      },
    });
  }
  return s3ClientInstance;
}

/**
 * Persists a validated multer file to either local disk (`/uploads/...`) or
 * S3-compatible object storage (ArvanCloud / MinIO / AWS S3).
 */
async function persistUploadedFile(file) {
  if (!file) {
    throw new AppError('هیچ فایلی برای بارگذاری ارسال نشده است.', 400, 'NO_FILE');
  }

  const ext = ALLOWED_MIME_EXT[file.mimetype];
  if (!ext || !hasValidImageMagicBytes(file.buffer, file.mimetype)) {
    throw new AppError(
      'محتوای باینری فایل با فرمت تصویر مطابقت ندارد.',
      400,
      'INVALID_FILE_SIGNATURE'
    );
  }

  const storedName = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}${ext}`;

  if (env.storageDriver === 's3' && env.s3.bucket && env.s3.accessKeyId) {
    const key = `uploads/${storedName}`;
    await getS3Client().send(
      new PutObjectCommand({
        Bucket: env.s3.bucket,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
        ACL: 'public-read',
      })
    );

    const publicUrl = env.s3.publicBaseUrl
      ? `${env.s3.publicBaseUrl}/${key}`
      : `${env.s3.endpoint.replace(/\/+$/, '')}/${env.s3.bucket}/${key}`;

    return {
      stored_name: storedName,
      storage_driver: 's3',
      public_url: publicUrl,
    };
  }

  // Local storage driver
  const destPath = path.join(UPLOADS_DIR, storedName);
  await fs.promises.writeFile(destPath, file.buffer);

  return {
    stored_name: storedName,
    storage_driver: 'local',
    public_url: `/uploads/${storedName}`,
  };
}

module.exports = {
  UPLOADS_DIR,
  uploadMiddleware,
  persistUploadedFile,
};
