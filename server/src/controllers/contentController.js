const contentRepository = require('../repositories/contentRepository');
const bannerRepository = require('../repositories/bannerRepository');
const serviceRepository = require('../repositories/serviceRepository');
const teamRepository = require('../repositories/teamRepository');
const { asyncHandler } = require('../middlewares/errorHandler');

const contentController = {
  /**
   * Public site bootstrap endpoint returning dynamic CMS texts, active banners,
   * charter services, and active team members (همکاران).
   */
  getPublicSiteData: asyncHandler(async (_req, res) => {
    const contents = contentRepository.findAsMap();
    const banners = bannerRepository.findAll({ activeOnly: true });
    const services = serviceRepository.findAll({ activeOnly: true });
    const teamMembers = teamRepository.findAll({ activeOnly: true });

    res.status(200).json({
      success: true,
      data: {
        contents,
        banners,
        services,
        teamMembers,
      },
    });
  }),

  listAll: asyncHandler(async (req, res) => {
    const items = contentRepository.findAll({ section: req.query.section });
    res.status(200).json({
      success: true,
      data: items,
    });
  }),

  upsertOne: asyncHandler(async (req, res) => {
    const saved = contentRepository.upsert(req.body);
    res.status(200).json({
      success: true,
      data: saved,
    });
  }),

  bulkUpsert: asyncHandler(async (req, res) => {
    const items = contentRepository.bulkUpsert(req.body.items);
    res.status(200).json({
      success: true,
      data: items,
    });
  }),
};

module.exports = contentController;
