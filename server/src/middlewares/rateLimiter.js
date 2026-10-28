const rateLimit = require('express-rate-limit');

/**
 * Phase 4.6: Strict rate-limit on /api/auth/* to 5 requests per minute per IP.
 */
const authRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_AUTH_REQUESTS',
      message:
        'تعداد تلاش‌های احراز هویت بیش از حد مجاز است (حداکثر ۵ درخواست در دقیقه). لطفاً یک دقیقه صبر کنید.',
    },
  },
});

const contactRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_REQUESTS',
      message: 'تعداد پیام‌های ارسالی بیش از حد مجاز است. لطفاً کمی بعد تلاش کنید.',
    },
  },
});

const apiRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_REQUESTS',
      message: 'تعداد درخواست‌ها بیش از حد مجاز است.',
    },
  },
});

module.exports = {
  authRateLimiter,
  contactRateLimiter,
  apiRateLimiter,
};
