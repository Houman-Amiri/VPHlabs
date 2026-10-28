const express = require('express');
const healthRoutes = require('./healthRoutes');
const authRoutes = require('./authRoutes');
const productRoutes = require('./productRoutes');
const articleRoutes = require('./articleRoutes');
const bannerRoutes = require('./bannerRoutes');
const serviceRoutes = require('./serviceRoutes');
const teamRoutes = require('./teamRoutes');
const contentRoutes = require('./contentRoutes');
const contactRoutes = require('./contactRoutes');
const uploadRoutes = require('./uploadRoutes');
const searchRoutes = require('./searchRoutes');

const apiRouter = express.Router();

const MOUNTED_API_MODULES = [
  { prefix: '/api', router: healthRoutes, group: 'System & Health' },
  { prefix: '/api/auth', router: authRoutes, group: 'Authentication & Session' },
  { prefix: '/api/products', router: productRoutes, group: 'Products & AI Solutions' },
  { prefix: '/api/articles', router: articleRoutes, group: 'Articles & Essays (Persian SEO)' },
  { prefix: '/api/banners', router: bannerRoutes, group: 'Home Carousel Banners' },
  { prefix: '/api/services', router: serviceRoutes, group: 'Charter Services (اساسنامه)' },
  { prefix: '/api/team', router: teamRoutes, group: 'Team & Colleagues (همکاران)' },
  { prefix: '/api/content', router: contentRoutes, group: 'Dynamic Page Texts CMS' },
  { prefix: '/api/contacts', router: contactRoutes, group: 'Contact & Consultation Inquiries' },
  { prefix: '/api/uploads', router: uploadRoutes, group: 'Media Uploads (Multer Local/S3)' },
  { prefix: '/api/search', router: searchRoutes, group: 'Search (SQL LIKE)' },
];

apiRouter.use('/', healthRoutes);
apiRouter.use('/auth', authRoutes);
apiRouter.use('/products', productRoutes);
apiRouter.use('/articles', articleRoutes);
apiRouter.use('/banners', bannerRoutes);
apiRouter.use('/services', serviceRoutes);
apiRouter.use('/team', teamRoutes);
apiRouter.use('/content', contentRoutes);
apiRouter.use('/contacts', contactRoutes);
apiRouter.use('/uploads', uploadRoutes);
apiRouter.use('/search', searchRoutes);

module.exports = {
  apiRouter,
  MOUNTED_API_MODULES,
};
