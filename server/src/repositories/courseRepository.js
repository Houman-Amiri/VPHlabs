const { prepareStmt } = require('./_stmtCache');

function hydrateCourse(row) {
  if (!row) return null;
  let syllabus_fa = [];
  let syllabus_en = [];
  try {
    syllabus_fa = JSON.parse(row.syllabus_fa_json || '[]');
  } catch {
    syllabus_fa = [];
  }
  try {
    syllabus_en = JSON.parse(row.syllabus_en_json || '[]');
  } catch {
    syllabus_en = [];
  }
  return {
    ...row,
    syllabus_fa,
    syllabus_en,
    is_in_person: Boolean(row.is_in_person),
    is_online: Boolean(row.is_online),
    is_active: Boolean(row.is_active),
  };
}

const courseRepository = {
  findAll({ activeOnly = true } = {}) {
    const sql = activeOnly
      ? 'SELECT * FROM courses WHERE is_active = 1 ORDER BY sort_order ASC, id ASC'
      : 'SELECT * FROM courses ORDER BY sort_order ASC, id ASC';
    return prepareStmt(sql).all().map(hydrateCourse);
  },

  findById(id) {
    const row = prepareStmt('SELECT * FROM courses WHERE id = ?').get(Number(id));
    return hydrateCourse(row);
  },

  create(data) {
    const info = prepareStmt(`
      INSERT INTO courses (
        title_fa, title_en, summary_fa, summary_en,
        duration, level_fa, syllabus_fa_json, syllabus_en_json,
        is_in_person, is_online, is_active, sort_order
      ) VALUES (
        @title_fa, @title_en, @summary_fa, @summary_en,
        @duration, @level_fa, @syllabus_fa_json, @syllabus_en_json,
        @is_in_person, @is_online, @is_active, @sort_order
      )
    `).run({
      title_fa: data.title_fa,
      title_en: data.title_en || '',
      summary_fa: data.summary_fa || '',
      summary_en: data.summary_en || '',
      duration: data.duration || '',
      level_fa: data.level_fa || '',
      syllabus_fa_json: JSON.stringify(data.syllabus_fa || []),
      syllabus_en_json: JSON.stringify(data.syllabus_en || []),
      is_in_person: data.is_in_person === false ? 0 : 1,
      is_online: data.is_online === false ? 0 : 1,
      is_active: data.is_active === false ? 0 : 1,
      sort_order: Number(data.sort_order) || 0,
    });

    return this.findById(info.lastInsertRowid);
  },

  update(id, data) {
    const existing = this.findById(id);
    if (!existing) return null;

    prepareStmt(`
      UPDATE courses SET
        title_fa = @title_fa,
        title_en = @title_en,
        summary_fa = @summary_fa,
        summary_en = @summary_en,
        duration = @duration,
        level_fa = @level_fa,
        syllabus_fa_json = @syllabus_fa_json,
        syllabus_en_json = @syllabus_en_json,
        is_in_person = @is_in_person,
        is_online = @is_online,
        is_active = @is_active,
        sort_order = @sort_order,
        updated_at = datetime('now')
      WHERE id = @id
    `).run({
      id: Number(id),
      title_fa: data.title_fa ?? existing.title_fa,
      title_en: data.title_en ?? existing.title_en,
      summary_fa: data.summary_fa ?? existing.summary_fa,
      summary_en: data.summary_en ?? existing.summary_en,
      duration: data.duration ?? existing.duration,
      level_fa: data.level_fa ?? existing.level_fa,
      syllabus_fa_json: JSON.stringify(
        data.syllabus_fa !== undefined ? data.syllabus_fa : existing.syllabus_fa
      ),
      syllabus_en_json: JSON.stringify(
        data.syllabus_en !== undefined ? data.syllabus_en : existing.syllabus_en
      ),
      is_in_person:
        data.is_in_person !== undefined
          ? data.is_in_person
            ? 1
            : 0
          : existing.is_in_person
          ? 1
          : 0,
      is_online:
        data.is_online !== undefined
          ? data.is_online
            ? 1
            : 0
          : existing.is_online
          ? 1
          : 0,
      is_active:
        data.is_active !== undefined
          ? data.is_active
            ? 1
            : 0
          : existing.is_active
          ? 1
          : 0,
      sort_order:
        data.sort_order !== undefined
          ? Number(data.sort_order)
          : existing.sort_order,
    });

    return this.findById(id);
  },

  remove(id) {
    const info = prepareStmt('DELETE FROM courses WHERE id = ?').run(Number(id));
    return info.changes > 0;
  },

  countAll() {
    return prepareStmt('SELECT COUNT(*) AS count FROM courses').get().count;
  },
};

module.exports = courseRepository;
