const courseRepository = require('../repositories/courseRepository');
const { AppError, asyncHandler } = require('../middlewares/errorHandler');

const courseController = {
  list: asyncHandler(async (req, res) => {
    const showAll = req.query.all === 'true' && req.user?.role === 'admin';
    const items = courseRepository.findAll({ activeOnly: !showAll });

    res.status(200).json({
      success: true,
      data: items,
    });
  }),

  create: asyncHandler(async (req, res) => {
    const created = courseRepository.create(req.body);
    res.status(201).json({
      success: true,
      data: created,
    });
  }),

  update: asyncHandler(async (req, res) => {
    const updated = courseRepository.update(req.params.id, req.body);
    if (!updated) {
      throw new AppError('دوره آموزشی مورد نظر یافت نشد.', 404, 'COURSE_NOT_FOUND');
    }
    res.status(200).json({
      success: true,
      data: updated,
    });
  }),

  remove: asyncHandler(async (req, res) => {
    const removed = courseRepository.remove(req.params.id);
    if (!removed) {
      throw new AppError('دوره آموزشی مورد نظر یافت نشد.', 404, 'COURSE_NOT_FOUND');
    }
    res.status(200).json({
      success: true,
      data: { message: 'دوره آموزشی با موفقیت حذف شد.' },
    });
  }),
};

module.exports = courseController;
