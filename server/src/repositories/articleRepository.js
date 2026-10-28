const { prepareStmt } = require('./_stmtCache');

const ALLOWED_SORT_COLUMNS = {
  published_at: 'published_at',
  created_at: 'created_at',
  views_count: 'views_count',
  likes_count: 'likes_count',
  title_fa: 'title_fa',
};

function hydrateArticle(row) {
  if (!row) return null;
  let tags = [];
  try {
    tags = JSON.parse(row.tags_json || '[]');
  } catch {
    tags = [];
  }
  return {
    ...row,
    tags,
    is_published: Boolean(row.is_published),
  };
}

const articleRepository = {
  findAll({
    page = 1,
    limit = 9,
    sortBy = 'published_at',
    order = 'desc',
    category,
    tag,
    q,
    includeUnpublished = false,
  } = {}) {
    const safePage = Math.max(1, Number(page) || 1);
    const safeLimit = Math.min(100, Math.max(1, Number(limit) || 9));
    const offset = (safePage - 1) * safeLimit;

    const sortCol = ALLOWED_SORT_COLUMNS[sortBy] || 'published_at';
    const sortDir = String(order).toLowerCase() === 'asc' ? 'ASC' : 'DESC';

    const conditions = [];
    const params = [];

    if (!includeUnpublished) {
      conditions.push('is_published = 1');
    }
    if (category) {
      conditions.push('category = ?');
      params.push(category);
    }
    if (tag) {
      conditions.push('tags_json LIKE ?');
      params.push(`%${String(tag).trim()}%`);
    }
    if (q && String(q).trim()) {
      const pattern = `%${String(q).trim()}%`;
      conditions.push(
        '(title_fa LIKE ? OR title_en LIKE ? OR excerpt_fa LIKE ? OR content_fa LIKE ? OR tags_json LIKE ?)'
      );
      params.push(pattern, pattern, pattern, pattern, pattern);
    }

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const total = prepareStmt(
      `SELECT COUNT(*) AS total FROM articles ${whereClause}`
    ).get(...params).total;

    const rows = prepareStmt(`
      SELECT *
      FROM articles
      ${whereClause}
      ORDER BY ${sortCol} ${sortDir}, id DESC
      LIMIT ? OFFSET ?
    `).all(...params, safeLimit, offset);

    return {
      items: rows.map(hydrateArticle),
      pagination: {
        page: safePage,
        limit: safeLimit,
        total,
        totalPages: Math.max(1, Math.ceil(total / safeLimit)),
      },
    };
  },

  findById(id) {
    const row = prepareStmt('SELECT * FROM articles WHERE id = ?').get(Number(id));
    return hydrateArticle(row);
  },

  findBySlug(slug) {
    const row = prepareStmt('SELECT * FROM articles WHERE slug = ?').get(String(slug));
    return hydrateArticle(row);
  },

  findBySlugOrId(identifier, { includeUnpublished = false } = {}) {
    const isNumeric = /^\d+$/.test(String(identifier));
    const row = isNumeric
      ? prepareStmt('SELECT * FROM articles WHERE id = ?').get(Number(identifier))
      : prepareStmt('SELECT * FROM articles WHERE slug = ?').get(String(identifier));

    if (!row) return null;
    if (!includeUnpublished && !row.is_published) return null;
    return hydrateArticle(row);
  },

  incrementViews(id) {
    prepareStmt('UPDATE articles SET views_count = views_count + 1 WHERE id = ?').run(
      Number(id)
    );
  },

  incrementLikes(id) {
    prepareStmt('UPDATE articles SET likes_count = likes_count + 1 WHERE id = ?').run(
      Number(id)
    );
    return this.findById(id);
  },

  findAllPublishedSlugs() {
    return prepareStmt(
      'SELECT id, slug, updated_at, published_at FROM articles WHERE is_published = 1 ORDER BY published_at DESC'
    ).all();
  },

  findDistinctCategories() {
    return prepareStmt(
      'SELECT DISTINCT category FROM articles WHERE is_published = 1 ORDER BY category ASC'
    )
      .all()
      .map((r) => r.category);
  },

  create(data) {
    const stmt = prepareStmt(`
      INSERT INTO articles (
        slug, title_fa, title_en, excerpt_fa, excerpt_en,
        content_fa, content_en, cover_image, category, tags_json,
        author_name, reading_time_minutes, meta_title, meta_description,
        meta_keywords, is_published, published_at
      ) VALUES (
        @slug, @title_fa, @title_en, @excerpt_fa, @excerpt_en,
        @content_fa, @content_en, @cover_image, @category, @tags_json,
        @author_name, @reading_time_minutes, @meta_title, @meta_description,
        @meta_keywords, @is_published, @published_at
      )
    `);

    const info = stmt.run({
      slug: data.slug,
      title_fa: data.title_fa,
      title_en: data.title_en || '',
      excerpt_fa: data.excerpt_fa,
      excerpt_en: data.excerpt_en || '',
      content_fa: data.content_fa,
      content_en: data.content_en || '',
      cover_image: data.cover_image || '',
      category: data.category || 'هوش مصنوعی سازمانی',
      tags_json: JSON.stringify(data.tags || []),
      author_name: data.author_name || 'تیم پژوهش هوش مصنوعی ویرا',
      reading_time_minutes: Number(data.reading_time_minutes) || 5,
      meta_title: data.meta_title || data.title_fa,
      meta_description: data.meta_description || data.excerpt_fa,
      meta_keywords: data.meta_keywords || '',
      is_published: data.is_published === false ? 0 : 1,
      published_at: data.published_at || new Date().toISOString(),
    });

    return this.findById(info.lastInsertRowid);
  },

  update(id, data) {
    const existing = this.findById(id);
    if (!existing) return null;

    prepareStmt(`
      UPDATE articles SET
        slug = @slug,
        title_fa = @title_fa,
        title_en = @title_en,
        excerpt_fa = @excerpt_fa,
        excerpt_en = @excerpt_en,
        content_fa = @content_fa,
        content_en = @content_en,
        cover_image = @cover_image,
        category = @category,
        tags_json = @tags_json,
        author_name = @author_name,
        reading_time_minutes = @reading_time_minutes,
        meta_title = @meta_title,
        meta_description = @meta_description,
        meta_keywords = @meta_keywords,
        is_published = @is_published,
        updated_at = datetime('now')
      WHERE id = @id
    `).run({
      id: Number(id),
      slug: data.slug ?? existing.slug,
      title_fa: data.title_fa ?? existing.title_fa,
      title_en: data.title_en ?? existing.title_en,
      excerpt_fa: data.excerpt_fa ?? existing.excerpt_fa,
      excerpt_en: data.excerpt_en ?? existing.excerpt_en,
      content_fa: data.content_fa ?? existing.content_fa,
      content_en: data.content_en ?? existing.content_en,
      cover_image: data.cover_image ?? existing.cover_image,
      category: data.category ?? existing.category,
      tags_json: JSON.stringify(data.tags ?? existing.tags),
      author_name: data.author_name ?? existing.author_name,
      reading_time_minutes:
        data.reading_time_minutes !== undefined
          ? Number(data.reading_time_minutes)
          : existing.reading_time_minutes,
      meta_title: data.meta_title ?? existing.meta_title,
      meta_description: data.meta_description ?? existing.meta_description,
      meta_keywords: data.meta_keywords ?? existing.meta_keywords,
      is_published:
        data.is_published !== undefined
          ? data.is_published
            ? 1
            : 0
          : existing.is_published
          ? 1
          : 0,
    });

    return this.findById(id);
  },

  remove(id) {
    const info = prepareStmt('DELETE FROM articles WHERE id = ?').run(Number(id));
    return info.changes > 0;
  },

  countAll() {
    return prepareStmt('SELECT COUNT(*) AS count FROM articles').get().count;
  },
};

module.exports = articleRepository;
