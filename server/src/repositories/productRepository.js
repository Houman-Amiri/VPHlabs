const { prepareStmt } = require('./_stmtCache');

const ALLOWED_SORT_COLUMNS = {
  sort_order: 'sort_order',
  created_at: 'created_at',
  updated_at: 'updated_at',
  title_fa: 'title_fa',
  title_en: 'title_en',
};

function hydrateProduct(row) {
  if (!row) return null;
  let features = [];
  try {
    features = JSON.parse(row.features_json || '[]');
  } catch {
    features = [];
  }
  return {
    ...row,
    features,
    demo_available: Boolean(row.demo_available),
    is_featured: Boolean(row.is_featured),
    is_published: Boolean(row.is_published),
  };
}

const productRepository = {
  /**
   * Paginated, sortable, searchable query for Products using better-sqlite3 prepared statements.
   */
  findAll({
    page = 1,
    limit = 9,
    sortBy = 'sort_order',
    order = 'asc',
    category,
    sector,
    q,
    featured,
    includeUnpublished = false,
  } = {}) {
    const safePage = Math.max(1, Number(page) || 1);
    const safeLimit = Math.min(100, Math.max(1, Number(limit) || 9));
    const offset = (safePage - 1) * safeLimit;

    const sortCol = ALLOWED_SORT_COLUMNS[sortBy] || 'sort_order';
    const sortDir = String(order).toLowerCase() === 'desc' ? 'DESC' : 'ASC';

    const conditions = [];
    const params = [];

    if (!includeUnpublished) {
      conditions.push('is_published = 1');
    }
    if (category) {
      conditions.push('category = ?');
      params.push(category);
    }
    if (sector) {
      conditions.push('target_sector = ?');
      params.push(sector);
    }
    if (featured !== undefined) {
      conditions.push('is_featured = ?');
      params.push(featured ? 1 : 0);
    }
    if (q && String(q).trim()) {
      const pattern = `%${String(q).trim()}%`;
      conditions.push(
        '(title_fa LIKE ? OR title_en LIKE ? OR summary_fa LIKE ? OR summary_en LIKE ? OR description_fa LIKE ?)'
      );
      params.push(pattern, pattern, pattern, pattern, pattern);
    }

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countSql = `SELECT COUNT(*) AS total FROM products ${whereClause}`;
    const totalRow = prepareStmt(countSql).get(...params);
    const total = totalRow ? totalRow.total : 0;

    const dataSql = `
      SELECT *
      FROM products
      ${whereClause}
      ORDER BY ${sortCol} ${sortDir}, id DESC
      LIMIT ? OFFSET ?
    `;
    const rows = prepareStmt(dataSql).all(...params, safeLimit, offset);

    return {
      items: rows.map(hydrateProduct),
      pagination: {
        page: safePage,
        limit: safeLimit,
        total,
        totalPages: Math.max(1, Math.ceil(total / safeLimit)),
      },
    };
  },

  findById(id) {
    const row = prepareStmt('SELECT * FROM products WHERE id = ?').get(Number(id));
    return hydrateProduct(row);
  },

  findBySlug(slug) {
    const row = prepareStmt('SELECT * FROM products WHERE slug = ?').get(String(slug));
    return hydrateProduct(row);
  },

  findBySlugOrId(identifier, { includeUnpublished = false } = {}) {
    const isNumeric = /^\d+$/.test(String(identifier));
    const row = isNumeric
      ? prepareStmt('SELECT * FROM products WHERE id = ?').get(Number(identifier))
      : prepareStmt('SELECT * FROM products WHERE slug = ?').get(String(identifier));

    if (!row) return null;
    if (!includeUnpublished && !row.is_published) return null;
    return hydrateProduct(row);
  },

  findAllPublishedSlugs() {
    return prepareStmt(
      'SELECT slug, updated_at FROM products WHERE is_published = 1 ORDER BY sort_order ASC'
    ).all();
  },

  create(data) {
    const stmt = prepareStmt(`
      INSERT INTO products (
        slug, title_fa, title_en, summary_fa, summary_en,
        description_fa, description_en, category, badge, image_url,
        features_json, target_sector, isic_code, demo_available,
        is_featured, is_published, sort_order
      ) VALUES (
        @slug, @title_fa, @title_en, @summary_fa, @summary_en,
        @description_fa, @description_en, @category, @badge, @image_url,
        @features_json, @target_sector, @isic_code, @demo_available,
        @is_featured, @is_published, @sort_order
      )
    `);

    const info = stmt.run({
      slug: data.slug,
      title_fa: data.title_fa,
      title_en: data.title_en || '',
      summary_fa: data.summary_fa,
      summary_en: data.summary_en || '',
      description_fa: data.description_fa,
      description_en: data.description_en || '',
      category: data.category || 'enterprise-ai',
      badge: data.badge || '',
      image_url: data.image_url || '',
      features_json: JSON.stringify(data.features || []),
      target_sector: data.target_sector || 'enterprise',
      isic_code: data.isic_code || '620101',
      demo_available: data.demo_available === false ? 0 : 1,
      is_featured: data.is_featured ? 1 : 0,
      is_published: data.is_published === false ? 0 : 1,
      sort_order: Number(data.sort_order) || 0,
    });

    return this.findById(info.lastInsertRowid);
  },

  update(id, data) {
    const existing = this.findById(id);
    if (!existing) return null;

    const stmt = prepareStmt(`
      UPDATE products SET
        slug = @slug,
        title_fa = @title_fa,
        title_en = @title_en,
        summary_fa = @summary_fa,
        summary_en = @summary_en,
        description_fa = @description_fa,
        description_en = @description_en,
        category = @category,
        badge = @badge,
        image_url = @image_url,
        features_json = @features_json,
        target_sector = @target_sector,
        isic_code = @isic_code,
        demo_available = @demo_available,
        is_featured = @is_featured,
        is_published = @is_published,
        sort_order = @sort_order,
        updated_at = datetime('now')
      WHERE id = @id
    `);

    stmt.run({
      id: Number(id),
      slug: data.slug ?? existing.slug,
      title_fa: data.title_fa ?? existing.title_fa,
      title_en: data.title_en ?? existing.title_en,
      summary_fa: data.summary_fa ?? existing.summary_fa,
      summary_en: data.summary_en ?? existing.summary_en,
      description_fa: data.description_fa ?? existing.description_fa,
      description_en: data.description_en ?? existing.description_en,
      category: data.category ?? existing.category,
      badge: data.badge ?? existing.badge,
      image_url: data.image_url ?? existing.image_url,
      features_json: JSON.stringify(data.features ?? existing.features),
      target_sector: data.target_sector ?? existing.target_sector,
      isic_code: data.isic_code ?? existing.isic_code,
      demo_available:
        data.demo_available !== undefined
          ? data.demo_available
            ? 1
            : 0
          : existing.demo_available
          ? 1
          : 0,
      is_featured:
        data.is_featured !== undefined
          ? data.is_featured
            ? 1
            : 0
          : existing.is_featured
          ? 1
          : 0,
      is_published:
        data.is_published !== undefined
          ? data.is_published
            ? 1
            : 0
          : existing.is_published
          ? 1
          : 0,
      sort_order:
        data.sort_order !== undefined ? Number(data.sort_order) : existing.sort_order,
    });

    return this.findById(id);
  },

  remove(id) {
    const info = prepareStmt('DELETE FROM products WHERE id = ?').run(Number(id));
    return info.changes > 0;
  },

  countAll() {
    return prepareStmt('SELECT COUNT(*) AS count FROM products').get().count;
  },
};

module.exports = productRepository;
