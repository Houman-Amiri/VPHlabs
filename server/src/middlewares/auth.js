const jwt = require('jsonwebtoken');
const env = require('../config/env');
const userRepository = require('../repositories/userRepository');
const { AppError } = require('./errorHandler');

const AUTH_COOKIE_NAME = 'vph_token';

function extractToken(req) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const bearer = authHeader.slice(7).trim();
    if (bearer) return bearer;
  }
  if (req.cookies && req.cookies[AUTH_COOKIE_NAME]) {
    return req.cookies[AUTH_COOKIE_NAME];
  }
  return null;
}

/**
 * Verifies JWT from httpOnly cookie or Authorization Bearer header,
 * confirms user is active, and attaches `req.user`.
 */
function requireAuth(req, _res, next) {
  const token = extractToken(req);
  if (!token) {
    return next(
      new AppError(
        'برای دسترسی به این بخش ابتدا وارد حساب کاربری شوید.',
        401,
        'UNAUTHORIZED'
      )
    );
  }

  try {
    const decoded = jwt.verify(token, env.jwtSecret);
    const user = userRepository.findById(decoded.sub);
    if (!user || !user.is_active) {
      return next(
        new AppError(
          'نشست کاربری نامعتبر یا غیرفعال است.',
          401,
          'UNAUTHORIZED'
        )
      );
    }
    req.user = user;
    return next();
  } catch {
    return next(
      new AppError(
        'نشست کاربری منقضی شده یا نامعتبر است. مجدداً وارد شوید.',
        401,
        'INVALID_TOKEN'
      )
    );
  }
}

/**
 * Attaches `req.user` if a valid token is present without rejecting anonymous callers.
 */
function optionalAuth(req, _res, next) {
  const token = extractToken(req);
  if (!token) return next();
  try {
    const decoded = jwt.verify(token, env.jwtSecret);
    const user = userRepository.findById(decoded.sub);
    if (user && user.is_active) {
      req.user = user;
    }
  } catch {
    // Ignore expired/invalid token for public endpoints
  }
  return next();
}

/**
 * Role-based authorization middleware. Must be used after `requireAuth`.
 *
 * @param  {...string} allowedRoles
 */
function requireRole(...allowedRoles) {
  return (req, _res, next) => {
    if (!req.user) {
      return next(
        new AppError('احراز هویت انجام نشده است.', 401, 'UNAUTHORIZED')
      );
    }
    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new AppError(
          'شما سطح دسترسی لازم برای انجام این عملیات را ندارید.',
          403,
          'FORBIDDEN'
        )
      );
    }
    return next();
  };
}

module.exports = {
  AUTH_COOKIE_NAME,
  requireAuth,
  optionalAuth,
  requireRole,
};
