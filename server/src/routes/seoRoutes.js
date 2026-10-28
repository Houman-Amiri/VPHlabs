const express = require('express');
const seoController = require('../controllers/seoController');

const router = express.Router();

router.get('/sitemap.xml', seoController.sitemapXml);
router.get('/robots.txt', seoController.robotsTxt);

router.routeMeta = [
  {
    method: 'GET',
    path: '/sitemap.xml',
    auth: 'Public',
    summary: 'Dynamic XML sitemap including all static pages, products, and Persian SEO articles.',
  },
  {
    method: 'GET',
    path: '/robots.txt',
    auth: 'Public',
    summary: 'Search crawler directives pointing to `/sitemap.xml` and disallowing `/admin`.',
  },
];

module.exports = router;
