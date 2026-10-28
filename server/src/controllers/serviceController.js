const serviceRepository = require('../repositories/serviceRepository');
const { AppError, asyncHandler } = require('../middlewares/errorHandler');

const serviceController = {
  list: asyncHandler(async (req, res) => {
    const isAdmin = req.user && req.user.role === 'admin';
    const activeOnly = !(isAdmin && req.query.all === 'true');
    const services = serviceRepository.findAll({ activeOnly });

    res.status(200).json({
      success: true,
      data: services,
    });
  }),

  create: asyncHandler(async (req, res) => {
    const created = serviceRepository.create(req.body);
    res.status(201).json({
      success: true,
      data: created,
    });
  }),

  update: asyncHandler(async (req, res) => {
    const updated = serviceRepository.update(req.params.id, req.body);
    if (!updated) {
      throw new AppError('خدمت مورد نظر یافت نشد.', 404, 'SERVICE_NOT_FOUND');
    }
    res.status(200).json({
      success: true,
      data: updated,
    });
  }),

  remove: asyncHandler(async (req, res) => {
    const deleted = serviceRepository.remove(req.params.id);
    if (!deleted) {
      throw new AppError('خدمت مورد نظر یافت نشد.', 404, 'SERVICE_NOT_FOUND');
    }
    res.status(200).json({
      success: true,
      data: { id: Number(req.params.id), deleted: true },
    });
  }),
};

module.exports = serviceController;
