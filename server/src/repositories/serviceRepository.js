const { prepareStmt, getDb } = require('./_stmtCache');

function hydrateService(row) {
  if (!row) return null;
  return {
    ...row,
    is_active: Boolean(row.is_active),
  };
}

const serviceRepository = {
  findAll({ activeOnly = true } = {}) {
    const sql = activeOnly
      ? 'SELECT * FROM services WHERE is_active = 1 ORDER BY sort_order ASC, id ASC'
      : 'SELECT * FROM services ORDER BY sort_order ASC, id ASC';
    return prepareStmt(sql).all().map(hydrateService);
  },

  findById(id) {
    return hydrateService(
      prepareStmt('SELECT * FROM services WHERE id = ?').get(Number(id))
    );
  },

  create(data) {
    const info = prepareStmt(`
      INSERT INTO services (
        isic_code, title_fa, title_en, description_fa, description_en,
        ai_application_fa, ai_application_en, icon_name, sort_order, is_active
      ) VALUES (
        @isic_code, @title_fa, @title_en, @description_fa, @description_en,
        @ai_application_fa, @ai_application_en, @icon_name, @sort_order, @is_active
      )
    `).run({
      isic_code: data.isic_code || '',
      title_fa: data.title_fa,
      title_en: data.title_en || '',
      description_fa: data.description_fa,
      description_en: data.description_en || '',
      ai_application_fa: data.ai_application_fa || '',
      ai_application_en: data.ai_application_en || '',
      icon_name: data.icon_name || 'Cpu',
      sort_order: Number(data.sort_order) || 0,
      is_active: data.is_active === false ? 0 : 1,
    });
    return this.findById(info.lastInsertRowid);
  },

  update(id, data) {
    const existing = this.findById(id);
    if (!existing) return null;

    prepareStmt(`
      UPDATE services SET
        isic_code = @isic_code,
        title_fa = @title_fa,
        title_en = @title_en,
        description_fa = @description_fa,
        description_en = @description_en,
        ai_application_fa = @ai_application_fa,
        ai_application_en = @ai_application_en,
        icon_name = @icon_name,
        sort_order = @sort_order,
        is_active = @is_active,
        updated_at = datetime('now')
      WHERE id = @id
    `).run({
      id: Number(id),
      isic_code: data.isic_code ?? existing.isic_code,
      title_fa: data.title_fa ?? existing.title_fa,
      title_en: data.title_en ?? existing.title_en,
      description_fa: data.description_fa ?? existing.description_fa,
      description_en: data.description_en ?? existing.description_en,
      ai_application_fa: data.ai_application_fa ?? existing.ai_application_fa,
      ai_application_en: data.ai_application_en ?? existing.ai_application_en,
      icon_name: data.icon_name ?? existing.icon_name,
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
    const info = prepareStmt('DELETE FROM services WHERE id = ?').run(Number(id));
    return info.changes > 0;
  },

  countAll() {
    return getDb().prepare('SELECT COUNT(*) AS count FROM services').get().count;
  },
};

module.exports = serviceRepository;
