const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const env = require('../config/env');
const userRepository = require('../repositories/userRepository');
const { AppError, asyncHandler } = require('../middlewares/errorHandler');
const { AUTH_COOKIE_NAME } = require('../middlewares/auth');

function buildCookieOptions(req) {
  const isHttps =
    Boolean(req?.secure) ||
    req?.headers?.['x-forwarded-proto'] === 'https' ||
    env.cookieSecure;

  return {
    httpOnly: true,
    secure: isHttps,
    sameSite: isHttps ? 'none' : 'lax',
    partitioned: isHttps,
    path: '/',
    maxAge: 12 * 60 * 60 * 1000, // 12 hours
  };
}

function signUserToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      role: user.role,
    },
    env.jwtSecret,
    { expiresIn: env.jwtExpiresIn }
  );
}

const authController = {
  login: asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const userRecord = userRepository.findByEmailWithHash(email);

    if (!userRecord || !userRecord.is_active) {
      throw new AppError(
        'ایمیل یا رمز عبور اشتباه است.',
        401,
        'INVALID_CREDENTIALS'
      );
    }

    const valid = await bcrypt.compare(password, userRecord.password_hash);
    if (!valid) {
      throw new AppError(
        'ایمیل یا رمز عبور اشتباه است.',
        401,
        'INVALID_CREDENTIALS'
      );
    }

    const safeUser = userRepository.findById(userRecord.id);
    const token = signUserToken(safeUser);

    res.cookie(AUTH_COOKIE_NAME, token, buildCookieOptions(req));

    res.status(200).json({
      success: true,
      data: {
        user: safeUser,
        token,
      },
    });
  }),

  logout: asyncHandler(async (req, res) => {
    const opts = buildCookieOptions(req);
    delete opts.maxAge;
    res.clearCookie(AUTH_COOKIE_NAME, opts);
    res.status(200).json({
      success: true,
      data: { message: 'خروج از حساب کاربری با موفقیت انجام شد.' },
    });
  }),

  me: asyncHandler(async (req, res) => {
    res.status(200).json({
      success: true,
      data: {
        user: req.user,
      },
    });
  }),

  changePassword: asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const record = userRepository.findByIdWithHash(req.user.id);
    if (!record) {
      throw new AppError('کاربر یافت نشد.', 404, 'USER_NOT_FOUND');
    }

    const matches = await bcrypt.compare(currentPassword, record.password_hash);
    if (!matches) {
      throw new AppError(
        'رمز عبور فعلی نادرست است.',
        400,
        'INVALID_CURRENT_PASSWORD'
      );
    }

    const newHash = await bcrypt.hash(newPassword, 12);
    userRepository.updatePassword(req.user.id, newHash);

    res.status(200).json({
      success: true,
      data: { message: 'رمز عبور با موفقیت تغییر یافت.' },
    });
  }),
};

module.exports = authController;
