const { prepareStmt } = require('./_stmtCache');

function hydrateBanner(row) {
  if (!row) return null;
  return {
    ...row,
    is_active: Boolean(row.is_active),
  };
}

const bannerRepository = {
  findAll({ activeOnly = true } = {}) {
    const sql = activeOnly
      ? 'SELECT * FROM banners WHERE is_active = 1 ORDER BY sort_order ASC, id ASC'
      : 'SELECT * FROM banners ORDER BY sort_order ASC, id ASC';
    return prepareStmt(sql).all().map(hydrateBanner);
  },

  findById(id) {
    return hydrateBanner(
      prepareStmt('SELECT * FROM banners WHERE id = ?').get(Number(id))
    );
  },

  create(data) {
    const info = prepareStmt(`
      INSERT INTO banners (
        image_url, target_url, alt_fa, alt_en,
        badge_fa, badge_en, title_fa, title_en, subtitle_fa, subtitle_en,
        sort_order, is_active
      )
      VALUES (
        @image_url, @target_url, @alt_fa, @alt_en,
        @badge_fa, @badge_en, @title_fa, @title_en, @subtitle_fa, @subtitle_en,
        @sort_order, @is_active
      )
    `).run({
      image_url: data.image_url,
      target_url: data.target_url || '/products',
      alt_fa: data.alt_fa || data.title_fa || 'بنر راهکارهای هوش مصنوعی ویرا پردازش هومان',
      alt_en: data.alt_en || data.title_en || 'V.I.R.A Pardazesh Hoomaan Enterprise AI Banner',
      badge_fa: data.badge_fa || '',
      badge_en: data.badge_en || '',
      title_fa: data.title_fa || '',
      title_en: data.title_en || '',
      subtitle_fa: data.subtitle_fa || '',
      subtitle_en: data.subtitle_en || '',
      sort_order: Number(data.sort_order) || 0,
      is_active: data.is_active === false ? 0 : 1,
    });
    return this.findById(info.lastInsertRowid);
  },

  update(id, data) {
    const existing = this.findById(id);
    if (!existing) return null;

    prepareStmt(`
      UPDATE banners SET
        image_url = @image_url,
        target_url = @target_url,
        alt_fa = @alt_fa,
        alt_en = @alt_en,
        badge_fa = @badge_fa,
        badge_en = @badge_en,
        title_fa = @title_fa,
        title_en = @title_en,
        subtitle_fa = @subtitle_fa,
        subtitle_en = @subtitle_en,
        sort_order = @sort_order,
        is_active = @is_active,
        updated_at = datetime('now')
      WHERE id = @id
    `).run({
      id: Number(id),
      image_url: data.image_url ?? existing.image_url,
      target_url: data.target_url ?? existing.target_url,
      alt_fa: data.alt_fa ?? existing.alt_fa,
      alt_en: data.alt_en ?? existing.alt_en,
      badge_fa: data.badge_fa ?? existing.badge_fa,
      badge_en: data.badge_en ?? existing.badge_en,
      title_fa: data.title_fa ?? existing.title_fa,
      title_en: data.title_en ?? existing.title_en,
      subtitle_fa: data.subtitle_fa ?? existing.subtitle_fa,
      subtitle_en: data.subtitle_en ?? existing.subtitle_en,
      sort_order:
        data.sort_order !== undefined ? Number(data.sort_order) : existing.sort_order,
      is_active:
        data.is_active !== undefined
          ? data.is_active
            ? 1
            : 0
          : existing.is_active
          ? 1
          : 0,
    });
    return this.findById(id);
  },

  remove(id) {
    const info = prepareStmt('DELETE FROM banners WHERE id = ?').run(Number(id));
    return info.changes > 0;
  },

  countAll() {
    return prepareStmt('SELECT COUNT(*) AS count FROM banners').get().count;
  },
};

module.exports = bannerRepository;
