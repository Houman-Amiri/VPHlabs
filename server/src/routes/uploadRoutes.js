const express = require('express');
const uploadController = require('../controllers/uploadController');
const { requireAuth, requireRole } = require('../middlewares/auth');
const { uploadMiddleware } = require('../middlewares/upload');

const router = express.Router();

router.post(
  '/',
  requireAuth,
  requireRole('admin'),
  uploadMiddleware.single('file'),
  uploadController.uploadImage
);
router.get(
  '/',
  requireAuth,
  requireRole('admin'),
  uploadController.listRecent
);

router.routeMeta = [
  {
    method: 'POST',
    path: '/api/uploads',
    auth: 'Admin (`requireAuth` + `requireRole("admin")`)',
    body: 'multipart/form-data (`file`: JPG/PNG/WEBP/GIF up to 5MB)',
    summary:
      'Validates image MIME + magic bytes via Multer and stores in local `/uploads` or S3-compatible bucket.',
  },
  {
    method: 'GET',
    path: '/api/uploads',
    auth: 'Admin (`requireAuth` + `requireRole("admin")`)',
    summary: 'Lists recent uploaded media assets.',
  },
];

module.exports = router;
