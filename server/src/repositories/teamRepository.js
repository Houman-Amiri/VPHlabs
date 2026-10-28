const { prepareStmt } = require('./_stmtCache');

function hydrateMember(row) {
  if (!row) return null;
  return {
    ...row,
    is_active: Boolean(row.is_active),
  };
}

const teamRepository = {
  findAll({ activeOnly = true } = {}) {
    const sql = activeOnly
      ? 'SELECT * FROM team_members WHERE is_active = 1 ORDER BY sort_order ASC, id ASC'
      : 'SELECT * FROM team_members ORDER BY sort_order ASC, id ASC';
    return prepareStmt(sql).all().map(hydrateMember);
  },

  findById(id) {
    return hydrateMember(
      prepareStmt('SELECT * FROM team_members WHERE id = ?').get(Number(id))
    );
  },

  create(data) {
    const info = prepareStmt(`
      INSERT INTO team_members (
        full_name_fa, full_name_en, role_fa, role_en,
        bio_fa, bio_en, avatar_url, linkedin_url, instagram_url,
        sort_order, is_active
      ) VALUES (
        @full_name_fa, @full_name_en, @role_fa, @role_en,
        @bio_fa, @bio_en, @avatar_url, @linkedin_url, @instagram_url,
        @sort_order, @is_active
      )
    `).run({
      full_name_fa: data.full_name_fa,
      full_name_en: data.full_name_en || '',
      role_fa: data.role_fa,
      role_en: data.role_en || '',
      bio_fa: data.bio_fa || '',
      bio_en: data.bio_en || '',
      avatar_url: data.avatar_url || '',
      linkedin_url: data.linkedin_url || '',
      instagram_url: data.instagram_url || '',
      sort_order: Number(data.sort_order) || 0,
      is_active: data.is_active === false ? 0 : 1,
    });
    return this.findById(info.lastInsertRowid);
  },

  update(id, data) {
    const existing = this.findById(id);
    if (!existing) return null;

    prepareStmt(`
      UPDATE team_members SET
        full_name_fa = @full_name_fa,
        full_name_en = @full_name_en,
        role_fa = @role_fa,
        role_en = @role_en,
        bio_fa = @bio_fa,
        bio_en = @bio_en,
        avatar_url = @avatar_url,
        linkedin_url = @linkedin_url,
        instagram_url = @instagram_url,
        sort_order = @sort_order,
        is_active = @is_active,
        updated_at = datetime('now')
      WHERE id = @id
    `).run({
      id: Number(id),
      full_name_fa: data.full_name_fa ?? existing.full_name_fa,
      full_name_en: data.full_name_en ?? existing.full_name_en,
      role_fa: data.role_fa ?? existing.role_fa,
      role_en: data.role_en ?? existing.role_en,
      bio_fa: data.bio_fa ?? existing.bio_fa,
      bio_en: data.bio_en ?? existing.bio_en,
      avatar_url: data.avatar_url ?? existing.avatar_url,
      linkedin_url: data.linkedin_url ?? existing.linkedin_url,
      instagram_url: data.instagram_url ?? existing.instagram_url,
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
    const info = prepareStmt('DELETE FROM team_members WHERE id = ?').run(Number(id));
    return info.changes > 0;
  },

  countAll() {
    return prepareStmt('SELECT COUNT(*) AS count FROM team_members').get().count;
  },
};

module.exports = teamRepository;
