const bannerRepository = require('../repositories/bannerRepository');
const { AppError, asyncHandler } = require('../middlewares/errorHandler');

const bannerController = {
  list: asyncHandler(async (req, res) => {
    const isAdmin = req.user && req.user.role === 'admin';
    const activeOnly = !(isAdmin && req.query.all === 'true');
    const banners = bannerRepository.findAll({ activeOnly });

    res.status(200).json({
      success: true,
      data: banners,
    });
  }),

  create: asyncHandler(async (req, res) => {
    const banner = bannerRepository.create(req.body);
    res.status(201).json({
      success: true,
      data: banner,
    });
  }),

  update: asyncHandler(async (req, res) => {
    const updated = bannerRepository.update(req.params.id, req.body);
    if (!updated) {
      throw new AppError('بنر مورد نظر یافت نشد.', 404, 'BANNER_NOT_FOUND');
    }
    res.status(200).json({
      success: true,
      data: updated,
    });
  }),

  remove: asyncHandler(async (req, res) => {
    const deleted = bannerRepository.remove(req.params.id);
    if (!deleted) {
      throw new AppError('بنر مورد نظر یافت نشد.', 404, 'BANNER_NOT_FOUND');
    }
    res.status(200).json({
      success: true,
      data: { id: Number(req.params.id), deleted: true },
    });
  }),
};

module.exports = bannerController;
