const articleRepository = require('../repositories/articleRepository');
const { AppError, asyncHandler } = require('../middlewares/errorHandler');

const articleController = {
  list: asyncHandler(async (req, res) => {
    const isAdmin = req.user && req.user.role === 'admin';
    const includeUnpublished = Boolean(isAdmin && req.query.all);

    const result = articleRepository.findAll({
      page: req.query.page,
      limit: req.query.limit,
      sortBy: req.query.sortBy,
      order: req.query.order,
      category: req.query.category,
      tag: req.query.tag,
      q: req.query.q,
      includeUnpublished,
    });

    const categories = articleRepository.findDistinctCategories();

    res.status(200).json({
      success: true,
      data: result.items,
      categories,
      pagination: result.pagination,
    });
  }),

  getOne: asyncHandler(async (req, res) => {
    const isAdmin = req.user && req.user.role === 'admin';
    const article = articleRepository.findBySlugOrId(req.params.id, {
      includeUnpublished: isAdmin,
    });

    if (!article) {
      throw new AppError('مقاله مورد نظر یافت نشد.', 404, 'ARTICLE_NOT_FOUND');
    }

    // Increment public view counter
    if (!isAdmin) {
      articleRepository.incrementViews(article.id);
      article.views_count += 1;
    }

    // Fetch up to 3 related articles in same category or recent
    const related = articleRepository
      .findAll({ page: 1, limit: 4 })
      .items.filter((a) => a.id !== article.id)
      .slice(0, 3);

    res.status(200).json({
      success: true,
      data: article,
      related,
    });
  }),

  like: asyncHandler(async (req, res) => {
    const existing = articleRepository.findBySlugOrId(req.params.id);
    if (!existing) {
      throw new AppError('مقاله مورد نظر یافت نشد.', 404, 'ARTICLE_NOT_FOUND');
    }
    const updated = articleRepository.incrementLikes(existing.id);
    res.status(200).json({
      success: true,
      data: {
        id: updated.id,
        likes_count: updated.likes_count,
      },
    });
  }),

  create: asyncHandler(async (req, res) => {
    const created = articleRepository.create(req.body);
    res.status(201).json({
      success: true,
      data: created,
    });
  }),

  update: asyncHandler(async (req, res) => {
    const updated = articleRepository.update(req.params.id, req.body);
    if (!updated) {
      throw new AppError(
        'مقاله مورد نظر برای ویرایش یافت نشد.',
        404,
        'ARTICLE_NOT_FOUND'
      );
    }
    res.status(200).json({
      success: true,
      data: updated,
    });
  }),

  remove: asyncHandler(async (req, res) => {
    const deleted = articleRepository.remove(req.params.id);
    if (!deleted) {
      throw new AppError('مقاله مورد نظر یافت نشد.', 404, 'ARTICLE_NOT_FOUND');
    }
    res.status(200).json({
      success: true,
      data: { id: Number(req.params.id), deleted: true },
    });
  }),
};

module.exports = articleController;
