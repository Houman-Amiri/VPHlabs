const contactRepository = require('../repositories/contactRepository');
const { AppError, asyncHandler } = require('../middlewares/errorHandler');

const contactController = {
  submit: asyncHandler(async (req, res) => {
    const created = contactRepository.create(req.body);
    res.status(201).json({
      success: true,
      data: {
        id: created.id,
        message:
          'درخواست شما با موفقیت ثبت شد. کارشناسان ویرا پردازش هومان در کوتاه‌ترین زمان با شما تماس خواهند گرفت.',
      },
    });
  }),

  list: asyncHandler(async (req, res) => {
    const result = contactRepository.findAll({
      status: req.query.status,
      page: req.query.page,
      limit: req.query.limit,
    });
    const counts = contactRepository.countByStatus();

    res.status(200).json({
      success: true,
      data: result.items,
      counts,
      pagination: result.pagination,
    });
  }),

  updateStatus: asyncHandler(async (req, res) => {
    const updated = contactRepository.updateStatus(
      req.params.id,
      req.body.status
    );
    if (!updated) {
      throw new AppError('پیام مورد نظر یافت نشد.', 404, 'MESSAGE_NOT_FOUND');
    }
    res.status(200).json({
      success: true,
      data: updated,
    });
  }),

  remove: asyncHandler(async (req, res) => {
    const deleted = contactRepository.remove(req.params.id);
    if (!deleted) {
      throw new AppError('پیام مورد نظر یافت نشد.', 404, 'MESSAGE_NOT_FOUND');
    }
    res.status(200).json({
      success: true,
      data: { id: Number(req.params.id), deleted: true },
    });
  }),
};

module.exports = contactController;
