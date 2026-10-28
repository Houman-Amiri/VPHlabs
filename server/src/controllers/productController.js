const productRepository = require('../repositories/productRepository');
const { AppError, asyncHandler } = require('../middlewares/errorHandler');

const productController = {
  list: asyncHandler(async (req, res) => {
    const isAdmin = req.user && req.user.role === 'admin';
    const includeUnpublished = Boolean(isAdmin && req.query.all);

    const result = productRepository.findAll({
      page: req.query.page,
      limit: req.query.limit,
      sortBy: req.query.sortBy,
      order: req.query.order,
      category: req.query.category,
      sector: req.query.sector,
      q: req.query.q,
      featured: req.query.featured,
      includeUnpublished,
    });

    res.status(200).json({
      success: true,
      data: result.items,
      pagination: result.pagination,
    });
  }),

  getOne: asyncHandler(async (req, res) => {
    const isAdmin = req.user && req.user.role === 'admin';
    const product = productRepository.findBySlugOrId(req.params.id, {
      includeUnpublished: isAdmin,
    });

    if (!product) {
      throw new AppError(
        'محصول مورد نظر یافت نشد.',
        404,
        'PRODUCT_NOT_FOUND'
      );
    }

    res.status(200).json({
      success: true,
      data: product,
    });
  }),

  create: asyncHandler(async (req, res) => {
    const created = productRepository.create(req.body);
    res.status(201).json({
      success: true,
      data: created,
    });
  }),

  update: asyncHandler(async (req, res) => {
    const updated = productRepository.update(req.params.id, req.body);
    if (!updated) {
      throw new AppError(
        'محصول مورد نظر برای ویرایش یافت نشد.',
        404,
        'PRODUCT_NOT_FOUND'
      );
    }
    res.status(200).json({
      success: true,
      data: updated,
    });
  }),

  remove: asyncHandler(async (req, res) => {
    const deleted = productRepository.remove(req.params.id);
    if (!deleted) {
      throw new AppError(
        'محصول مورد نظر یافت نشد.',
        404,
        'PRODUCT_NOT_FOUND'
      );
    }
    res.status(200).json({
      success: true,
      data: { id: Number(req.params.id), deleted: true },
    });
  }),
};

module.exports = productController;
