const express = require('express');
const contactController = require('../controllers/contactController');
const { requireAuth, requireRole } = require('../middlewares/auth');
const { contactRateLimiter } = require('../middlewares/rateLimiter');
const { validateBody } = require('../middlewares/validate');
const {
  createContactSchema,
  updateContactStatusSchema,
} = require('../validators/contactSchemas');

const router = express.Router();

router.post(
  '/',
  contactRateLimiter,
  validateBody(createContactSchema),
  contactController.submit
);
router.get('/', requireAuth, requireRole('admin'), contactController.list);
router.patch(
  '/:id/status',
  requireAuth,
  requireRole('admin'),
  validateBody(updateContactStatusSchema),
  contactController.updateStatus
);
router.delete(
  '/:id',
  requireAuth,
  requireRole('admin'),
  contactController.remove
);

router.routeMeta = [
  {
    method: 'POST',
    path: '/api/contacts',
    auth: 'Public (Rate-limited: 15 req/15min/IP)',
    body: '{ full_name, organization?, email, phone, subject, department, product_id?, message }',
    summary: 'Submit a contact or enterprise AI consultation inquiry.',
  },
  {
    method: 'GET',
    path: '/api/contacts',
    auth: 'Admin (`requireAuth` + `requireRole("admin")`)',
    query: '?status=unread|read|responded|archived&page=1&limit=20',
    summary: 'Paginated list of incoming contact/consultation inquiries.',
  },
  {
    method: 'PATCH',
    path: '/api/contacts/:id/status',
    auth: 'Admin (`requireAuth` + `requireRole("admin")`)',
    body: '{ status: "unread" | "read" | "responded" | "archived" }',
    summary: 'Update inquiry workflow status.',
  },
  {
    method: 'DELETE',
    path: '/api/contacts/:id',
    auth: 'Admin (`requireAuth` + `requireRole("admin")`)',
    summary: 'Delete a contact inquiry by ID.',
  },
];

module.exports = router;
