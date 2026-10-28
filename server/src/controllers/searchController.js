const productRepository = require('../repositories/productRepository');
const articleRepository = require('../repositories/articleRepository');
const { asyncHandler } = require('../middlewares/errorHandler');

/**
 * Phase 7.1: Raw SQL `LIKE` search across Products and Articles via repositories
 * before reaching for an external dedicated search engine.
 */
const searchController = {
  search: asyncHandler(async (req, res) => {
    const q = String(req.query.q || '').trim();
    if (!q || q.length < 2) {
      return res.status(200).json({
        success: true,
        data: {
          query: q,
          products: [],
          articles: [],
        },
      });
    }

    const products = productRepository.findAll({
      q,
      page: 1,
      limit: 6,
    }).items;

    const articles = articleRepository.findAll({
      q,
      page: 1,
      limit: 6,
    }).items;

    return res.status(200).json({
      success: true,
      data: {
        query: q,
        products,
        articles,
      },
    });
  }),
};

module.exports = searchController;
