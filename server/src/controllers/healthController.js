const env = require('../config/env');
const healthRepository = require('../repositories/healthRepository');
const userRepository = require('../repositories/userRepository');
const productRepository = require('../repositories/productRepository');
const articleRepository = require('../repositories/articleRepository');
const bannerRepository = require('../repositories/bannerRepository');
const serviceRepository = require('../repositories/serviceRepository');
const teamRepository = require('../repositories/teamRepository');
const contactRepository = require('../repositories/contactRepository');
const { asyncHandler } = require('../middlewares/errorHandler');

const healthController = {
  check: asyncHandler(async (_req, res) => {
    const dbHealth = healthRepository.checkStatus();
    const adminRow = userRepository.findByEmailWithHash(env.seedAdminEmail);
    res.status(200).json({
      success: true,
      data: {
        status: 'ok',
        service: 'V.I.R.A Pardazesh Hoomaan API',
        build: '2026.10.28-r6',
        adminReady: Boolean(adminRow && adminRow.is_active && adminRow.role === 'admin'),
        timestamp: new Date().toISOString(),
        uptimeSeconds: Math.round(process.uptime()),
        ...dbHealth,
      },
    });
  }),

  adminDashboardStats: asyncHandler(async (_req, res) => {
    const dbHealth = healthRepository.checkStatus();
    res.status(200).json({
      success: true,
      data: {
        productsCount: productRepository.countAll(),
        articlesCount: articleRepository.countAll(),
        bannersCount: bannerRepository.countAll(),
        servicesCount: serviceRepository.countAll(),
        teamCount: teamRepository.countAll(),
        messages: contactRepository.countByStatus(),
        system: {
          uptimeSeconds: Math.round(process.uptime()),
          ...dbHealth,
        },
      },
    });
  }),
};

module.exports = healthController;
