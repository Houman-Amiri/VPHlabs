const express = require('express');
const bannerController = require('../controllers/bannerController');
const {
  optionalAuth,
  requireAuth,
  requireRole,
} = require('../middlewares/auth');
const { validateBody } = require('../middlewares/validate');
const {
  createBannerSchema,
  updateBannerSchema,
} = require('../validators/bannerSchemas');

const router = express.Router();

router.get('/', optionalAuth, bannerController.list);
router.post(
  '/',
  requireAuth,
  requireRole('admin'),
  validateBody(createBannerSchema),
  bannerController.create
);
router.put(
  '/:id',
  requireAuth,
  requireRole('admin'),
  validateBody(updateBannerSchema),
  bannerController.update
);
router.delete(
  '/:id',
  requireAuth,
  requireRole('admin'),
  bannerController.remove
);

router.routeMeta = [
  {
    method: 'GET',
    path: '/api/banners',
    auth: 'Public (`?all=true` for Admin)',
    summary: 'List active plain wide clickable carousel banners ordered by `sort_order`.',
  },
  {
    method: 'POST',
    path: '/api/banners',
    auth: 'Admin (`requireAuth` + `requireRole("admin")`)',
    body: '{ image_url, target_url, alt_fa, alt_en?, sort_order?, is_active? }',
    summary: 'Add a new slide to the home carousel banner.',
  },
  {
    method: 'PUT',
    path: '/api/banners/:id',
    auth: 'Admin (`requireAuth` + `requireRole("admin")`)',
    body: 'Partial banner fields',
    summary: 'Update banner image, destination URL, order, or active state.',
  },
  {
    method: 'DELETE',
    path: '/api/banners/:id',
    auth: 'Admin (`requireAuth` + `requireRole("admin")`)',
    summary: 'Delete a home carousel banner slide.',
  },
];

module.exports = router;
