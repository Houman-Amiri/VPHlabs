const express = require('express');
const healthController = require('../controllers/healthController');
const { requireAuth, requireRole } = require('../middlewares/auth');

const router = express.Router();

router.get('/health', healthController.check);
router.get(
  '/admin/stats',
  requireAuth,
  requireRole('admin'),
  healthController.adminDashboardStats
);

router.routeMeta = [
  {
    method: 'GET',
    path: '/api/health',
    auth: 'Public',
    summary: 'System health-check (uptime, SQLite connection, applied SQL migrations).',
  },
  {
    method: 'GET',
    path: '/api/admin/stats',
    auth: 'Admin (`requireAuth` + `requireRole("admin")`)',
    summary: 'Aggregated CMS dashboard counts and database health metrics.',
  },
];

module.exports = router;
