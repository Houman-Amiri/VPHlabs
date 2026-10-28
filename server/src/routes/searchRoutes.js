const express = require('express');
const searchController = require('../controllers/searchController');

const router = express.Router();

router.get('/', searchController.search);

router.routeMeta = [
  {
    method: 'GET',
    path: '/api/search',
    auth: 'Public',
    query: '?q=keyword',
    summary:
      'Unified raw SQL `LIKE` search across published AI products and technical articles.',
  },
];

module.exports = router;
