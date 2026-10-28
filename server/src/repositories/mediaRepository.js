const { prepareStmt } = require('./_stmtCache');

const mediaRepository = {
  create(entry) {
    const info = prepareStmt(`
      INSERT INTO media_uploads (
        original_name, stored_name, mime_type, size_bytes,
        storage_driver, public_url, uploaded_by
      ) VALUES (
        @original_name, @stored_name, @mime_type, @size_bytes,
        @storage_driver, @public_url, @uploaded_by
      )
    `).run({
      original_name: entry.original_name,
      stored_name: entry.stored_name,
      mime_type: entry.mime_type,
      size_bytes: Number(entry.size_bytes),
      storage_driver: entry.storage_driver || 'local',
      public_url: entry.public_url,
      uploaded_by: entry.uploaded_by ? Number(entry.uploaded_by) : null,
    });

    return prepareStmt('SELECT * FROM media_uploads WHERE id = ?').get(
      info.lastInsertRowid
    );
  },

  findRecent(limit = 30) {
    return prepareStmt(
      'SELECT * FROM media_uploads ORDER BY created_at DESC LIMIT ?'
    ).all(Number(limit));
  },
};

module.exports = mediaRepository;
