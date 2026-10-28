const express = require('express');
const productController = require('../controllers/productController');
const {
  optionalAuth,
  requireAuth,
  requireRole,
} = require('../middlewares/auth');
const { validateBody, validateQuery } = require('../middlewares/validate');
const {
  productQuerySchema,
  createProductSchema,
  updateProductSchema,
} = require('../validators/productSchemas');

const router = express.Router();

router.get(
  '/',
  optionalAuth,
  validateQuery(productQuerySchema),
  productController.list
);
router.get('/:id', optionalAuth, productController.getOne);
router.post(
  '/',
  requireAuth,
  requireRole('admin'),
  validateBody(createProductSchema),
  productController.create
);
router.put(
  '/:id',
  requireAuth,
  requireRole('admin'),
  validateBody(updateProductSchema),
  productController.update
);
router.delete(
  '/:id',
  requireAuth,
  requireRole('admin'),
  productController.remove
);

router.routeMeta = [
  {
    method: 'GET',
    path: '/api/products',
    auth: 'Public (Optional Admin Auth for `?all=true`)',
    query:
      '?page=1&limit=9&sortBy=sort_order|created_at|title_fa&order=asc|desc&category=&sector=&featured=&q=',
    summary:
      'Paginated, sortable, filterable list of AI & software products with SQL LIKE search (`?q=`).',
  },
  {
    method: 'GET',
    path: '/api/products/:id',
    auth: 'Public',
    summary: 'Fetch single product by numeric ID or URL slug.',
  },
  {
    method: 'POST',
    path: '/api/products',
    auth: 'Admin (`requireAuth` + `requireRole("admin")`)',
    body: 'createProductSchema (slug, title_fa, summary_fa, description_fa, features[], ...)',
    summary: 'Create a new product in SQLite via `productRepository`.',
  },
  {
    method: 'PUT',
    path: '/api/products/:id',
    auth: 'Admin (`requireAuth` + `requireRole("admin")`)',
    body: 'updateProductSchema (partial fields)',
    summary: 'Update an existing product by ID.',
  },
  {
    method: 'DELETE',
    path: '/api/products/:id',
    auth: 'Admin (`requireAuth` + `requireRole("admin")`)',
    summary: 'Delete a product by ID.',
  },
];

module.exports = router;
