const express = require('express');
const authController = require('../controllers/authController');
const { requireAuth } = require('../middlewares/auth');
const { authRateLimiter } = require('../middlewares/rateLimiter');
const { validateBody } = require('../middlewares/validate');
const {
  loginSchema,
  changePasswordSchema,
} = require('../validators/authSchemas');

const router = express.Router();

// Phase 4.6: 5 req/min per IP brute-force protection on credential endpoints
router.post(
  '/login',
  authRateLimiter,
  validateBody(loginSchema),
  authController.login
);
router.post('/logout', authController.logout);
router.get('/me', requireAuth, authController.me);
router.post(
  '/change-password',
  authRateLimiter,
  requireAuth,
  validateBody(changePasswordSchema),
  authController.changePassword
);

router.routeMeta = [
  {
    method: 'POST',
    path: '/api/auth/login',
    auth: 'Public (Rate-limited: 5 req/min/IP)',
    body: '{ email: string, password: string }',
    summary: 'Authenticates user with bcryptjs and issues httpOnly JWT cookie + Bearer token.',
  },
  {
    method: 'POST',
    path: '/api/auth/logout',
    auth: 'Public',
    summary: 'Clears the httpOnly authentication cookie.',
  },
  {
    method: 'GET',
    path: '/api/auth/me',
    auth: 'Authenticated (`requireAuth`)',
    summary: 'Returns the currently authenticated user profile.',
  },
  {
    method: 'POST',
    path: '/api/auth/change-password',
    auth: 'Authenticated (`requireAuth`, Rate-limited: 5 req/min/IP)',
    body: '{ currentPassword: string, newPassword: string }',
    summary: 'Verifies current password and updates bcryptjs hash.',
  },
];

module.exports = router;
