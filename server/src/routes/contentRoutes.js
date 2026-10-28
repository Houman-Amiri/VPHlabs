const express = require('express');
const contentController = require('../controllers/contentController');
const { requireAuth, requireRole } = require('../middlewares/auth');
const { validateBody } = require('../middlewares/validate');
const {
  contentItemSchema,
  bulkContentSchema,
} = require('../validators/contentSchemas');

const router = express.Router();

router.get('/bootstrap', contentController.getPublicSiteData);
router.get('/', requireAuth, requireRole('admin'), contentController.listAll);
router.put(
  '/',
  requireAuth,
  requireRole('admin'),
  validateBody(contentItemSchema),
  contentController.upsertOne
);
router.put(
  '/bulk',
  requireAuth,
  requireRole('admin'),
  validateBody(bulkContentSchema),
  contentController.bulkUpsert
);

router.routeMeta = [
  {
    method: 'GET',
    path: '/api/content/bootstrap',
    auth: 'Public',
    summary:
      'Returns dynamic CMS key-value page texts, active banners, and charter services.',
  },
  {
    method: 'GET',
    path: '/api/content',
    auth: 'Admin (`requireAuth` + `requireRole("admin")`)',
    query: '?section=home|about|contact|company',
    summary: 'List all editable dynamic site text keys for the Admin CMS.',
  },
  {
    method: 'PUT',
    path: '/api/content',
    auth: 'Admin (`requireAuth` + `requireRole("admin")`)',
    body: '{ content_key, section, label_fa, value_fa, value_en }',
    summary: 'Upsert a single dynamic site text block.',
  },
  {
    method: 'PUT',
    path: '/api/content/bulk',
    auth: 'Admin (`requireAuth` + `requireRole("admin")`)',
    body: '{ items: ContentItem[] }',
    summary: 'Atomically update multiple dynamic page texts across the website.',
  },
];

module.exports = router;
