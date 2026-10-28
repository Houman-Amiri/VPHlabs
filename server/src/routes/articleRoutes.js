const express = require('express');
const articleController = require('../controllers/articleController');
const {
  optionalAuth,
  requireAuth,
  requireRole,
} = require('../middlewares/auth');
const { validateBody, validateQuery } = require('../middlewares/validate');
const {
  articleQuerySchema,
  createArticleSchema,
  updateArticleSchema,
} = require('../validators/articleSchemas');

const router = express.Router();

router.get(
  '/',
  optionalAuth,
  validateQuery(articleQuerySchema),
  articleController.list
);
router.get('/:id', optionalAuth, articleController.getOne);
router.post('/:id/like', articleController.like);
router.post(
  '/',
  requireAuth,
  requireRole('admin'),
  validateBody(createArticleSchema),
  articleController.create
);
router.put(
  '/:id',
  requireAuth,
  requireRole('admin'),
  validateBody(updateArticleSchema),
  articleController.update
);
router.delete(
  '/:id',
  requireAuth,
  requireRole('admin'),
  articleController.remove
);

router.routeMeta = [
  {
    method: 'GET',
    path: '/api/articles',
    auth: 'Public (Optional Admin Auth for `?all=true`)',
    query:
      '?page=1&limit=9&sortBy=published_at|views_count|likes_count&order=desc&category=&tag=&q=',
    summary:
      'Paginated SEO articles & essays list with category filter, tags, and SQL LIKE search.',
  },
  {
    method: 'GET',
    path: '/api/articles/:id',
    auth: 'Public',
    summary:
      'Fetch single article by numeric ID or slug, increment view counter, and return related articles.',
  },
  {
    method: 'POST',
    path: '/api/articles/:id/like',
    auth: 'Public',
    summary: 'Live interaction endpoint incrementing article helpful/clap counter.',
  },
  {
    method: 'POST',
    path: '/api/articles',
    auth: 'Admin (`requireAuth` + `requireRole("admin")`)',
    body: 'createArticleSchema (slug, title_fa, excerpt_fa, content_fa, SEO meta, ...)',
    summary: 'Publish or save a new article/essay.',
  },
  {
    method: 'PUT',
    path: '/api/articles/:id',
    auth: 'Admin (`requireAuth` + `requireRole("admin")`)',
    body: 'updateArticleSchema',
    summary: 'Update an existing article/essay.',
  },
  {
    method: 'DELETE',
    path: '/api/articles/:id',
    auth: 'Admin (`requireAuth` + `requireRole("admin")`)',
    summary: 'Delete an article by ID.',
  },
];

module.exports = router;
