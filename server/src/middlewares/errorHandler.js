const { ZodError } = require('zod');
const multer = require('multer');
const env = require('../config/env');
const { logger } = require('../config/logger');
const { captureExceptionSafe } = require('../config/sentry');

class AppError extends Error {
  /**
   * Operational HTTP error thrown by controllers or middlewares.
   *
   * @param {string} message Human-readable error message
   * @param {number} [statusCode=500] HTTP status code
   * @param {string} [code='INTERNAL_ERROR'] Machine-readable error code
   * @param {any} [details=null] Optional validation details
   */
  constructor(message, statusCode = 500, code = 'INTERNAL_ERROR', details = null) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Wraps Express route/controller handlers so sync throws and rejected promises
 * automatically forward to centralized errorHandler middleware.
 */
function asyncHandler(fn) {
  return function wrappedHandler(req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

function notFoundHandler(req, res, next) {
  next(
    new AppError(
      `مسیر درخواستی یافت نشد: ${req.method} ${req.originalUrl}`,
      404,
      'NOT_FOUND'
    )
  );
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, _next) {
  // Zod schema validation error
  if (err instanceof ZodError) {
    const details = err.issues.map((issue) => ({
      field: issue.path.join('.'),
      message: issue.message,
    }));
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'اطلاعات ارسالی معتبر نیست. لطفاً فیلدها را بررسی کنید.',
        details,
      },
    });
  }

  // Multer upload error
  if (err instanceof multer.MulterError) {
    const message =
      err.code === 'LIMIT_FILE_SIZE'
        ? `حجم فایل بیش از حد مجاز (${env.maxUploadSizeMb} مگابایت) است.`
        : `خطا در بارگذاری فایل: ${err.message}`;
    return res.status(400).json({
      success: false,
      error: {
        code: 'UPLOAD_ERROR',
        message,
      },
    });
  }

  // SQLite unique constraint violation
  if (err && typeof err.code === 'string' && err.code.startsWith('SQLITE_CONSTRAINT')) {
    return res.status(409).json({
      success: false,
      error: {
        code: 'CONFLICT',
        message: 'رکوردی با این شناسه یکتا (اسلاگ یا ایمیل) قبلاً ثبت شده است.',
      },
    });
  }

  // Known operational AppError
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        ...(err.details ? { details: err.details } : {}),
      },
    });
  }

  // Unexpected server error
  logger.error(
    {
      err,
      method: req.method,
      url: req.originalUrl,
    },
    'Unhandled server exception'
  );
  captureExceptionSafe(err, { method: req.method, url: req.originalUrl });

  return res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: env.isProd
        ? 'خطای داخلی سرور رخ داده است. لطفاً دقایقی دیگر تلاش کنید.'
        : err.message || 'Internal Server Error',
    },
  });
}

module.exports = {
  AppError,
  asyncHandler,
  notFoundHandler,
  errorHandler,
};
