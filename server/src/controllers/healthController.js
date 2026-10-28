const healthRepository = require('../repositories/healthRepository');
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
    res.status(200).json({
      success: true,
      data: {
        status: 'ok',
        service: 'V.I.R.A Pardazesh Hoomaan API',
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
