const { prepareStmt, getDb } = require('./_stmtCache');

const contentRepository = {
  findAll({ section } = {}) {
    if (section) {
      return prepareStmt(
        'SELECT * FROM site_contents WHERE section = ? ORDER BY id ASC'
      ).all(section);
    }
    return prepareStmt('SELECT * FROM site_contents ORDER BY section ASC, id ASC').all();
  },

  findAsMap() {
    const rows = this.findAll();
    const map = {};
    for (const row of rows) {
      map[row.content_key] = {
        fa: row.value_fa,
        en: row.value_en || row.value_fa,
        section: row.section,
        label_fa: row.label_fa,
      };
    }
    return map;
  },

  upsert(entry) {
    prepareStmt(`
      INSERT INTO site_contents (content_key, section, label_fa, value_fa, value_en, updated_at)
      VALUES (@content_key, @section, @label_fa, @value_fa, @value_en, datetime('now'))
      ON CONFLICT(content_key) DO UPDATE SET
        section = excluded.section,
        label_fa = excluded.label_fa,
        value_fa = excluded.value_fa,
        value_en = excluded.value_en,
        updated_at = datetime('now')
    `).run({
      content_key: entry.content_key,
      section: entry.section || 'general',
      label_fa: entry.label_fa || entry.content_key,
      value_fa: entry.value_fa,
      value_en: entry.value_en || '',
    });

    return prepareStmt('SELECT * FROM site_contents WHERE content_key = ?').get(
      entry.content_key
    );
  },

  bulkUpsert(entries) {
    const db = getDb();
    const tx = db.transaction((items) => {
      for (const item of items) {
        this.upsert(item);
      }
    });
    tx(entries);
    return this.findAll();
  },

  seedMissing(entries) {
    const db = getDb();
    const insertIgnore = prepareStmt(`
      INSERT OR IGNORE INTO site_contents (content_key, section, label_fa, value_fa, value_en, updated_at)
      VALUES (@content_key, @section, @label_fa, @value_fa, @value_en, datetime('now'))
    `);
    const tx = db.transaction((items) => {
      let inserted = 0;
      for (const item of items) {
        const res = insertIgnore.run({
          content_key: item.content_key,
          section: item.section || 'general',
          label_fa: item.label_fa || item.content_key,
          value_fa: item.value_fa,
          value_en: item.value_en || '',
        });
        inserted += res.changes;
      }
      return inserted;
    });
    return tx(entries);
  },

  countAll() {
    return prepareStmt('SELECT COUNT(*) AS count FROM site_contents').get().count;
  },
};

module.exports = contentRepository;
