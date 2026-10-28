const express = require('express');
const serviceController = require('../controllers/serviceController');
const {
  optionalAuth,
  requireAuth,
  requireRole,
} = require('../middlewares/auth');
const { validateBody } = require('../middlewares/validate');
const {
  createServiceSchema,
  updateServiceSchema,
} = require('../validators/serviceSchemas');

const router = express.Router();

router.get('/', optionalAuth, serviceController.list);
router.post(
  '/',
  requireAuth,
  requireRole('admin'),
  validateBody(createServiceSchema),
  serviceController.create
);
router.put(
  '/:id',
  requireAuth,
  requireRole('admin'),
  validateBody(updateServiceSchema),
  serviceController.update
);
router.delete(
  '/:id',
  requireAuth,
  requireRole('admin'),
  serviceController.remove
);

router.routeMeta = [
  {
    method: 'GET',
    path: '/api/services',
    auth: 'Public (`?all=true` for Admin)',
    summary: 'List official charter ICT & AI enterprise services.',
  },
  {
    method: 'POST',
    path: '/api/services',
    auth: 'Admin (`requireAuth` + `requireRole("admin")`)',
    body: 'createServiceSchema',
    summary: 'Add a new company service capability.',
  },
  {
    method: 'PUT',
    path: '/api/services/:id',
    auth: 'Admin (`requireAuth` + `requireRole("admin")`)',
    body: 'updateServiceSchema',
    summary: 'Update an existing service item.',
  },
  {
    method: 'DELETE',
    path: '/api/services/:id',
    auth: 'Admin (`requireAuth` + `requireRole("admin")`)',
    summary: 'Delete a service item.',
  },
];

module.exports = router;
