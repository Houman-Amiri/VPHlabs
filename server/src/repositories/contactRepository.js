const { prepareStmt } = require('./_stmtCache');

const contactRepository = {
  findAll({ status, page = 1, limit = 20 } = {}) {
    const safePage = Math.max(1, Number(page) || 1);
    const safeLimit = Math.min(100, Math.max(1, Number(limit) || 20));
    const offset = (safePage - 1) * safeLimit;

    const where = status ? 'WHERE status = ?' : '';
    const params = status ? [status] : [];

    const total = prepareStmt(
      `SELECT COUNT(*) AS total FROM contact_messages ${where}`
    ).get(...params).total;

    const items = prepareStmt(`
      SELECT cm.*, p.title_fa AS product_title_fa
      FROM contact_messages cm
      LEFT JOIN products p ON p.id = cm.product_id
      ${status ? 'WHERE cm.status = ?' : ''}
      ORDER BY cm.created_at DESC, cm.id DESC
      LIMIT ? OFFSET ?
    `).all(...params, safeLimit, offset);

    return {
      items,
      pagination: {
        page: safePage,
        limit: safeLimit,
        total,
        totalPages: Math.max(1, Math.ceil(total / safeLimit)),
      },
    };
  },

  findById(id) {
    return (
      prepareStmt('SELECT * FROM contact_messages WHERE id = ?').get(Number(id)) ||
      null
    );
  },

  create(data) {
    const info = prepareStmt(`
      INSERT INTO contact_messages (
        full_name, organization, email, phone, subject, department, product_id, message
      ) VALUES (
        @full_name, @organization, @email, @phone, @subject, @department, @product_id, @message
      )
    `).run({
      full_name: data.full_name,
      organization: data.organization || '',
      email: data.email,
      phone: data.phone,
      subject: data.subject,
      department: data.department || 'ai-consulting',
      product_id: data.product_id ? Number(data.product_id) : null,
      message: data.message,
    });

    return this.findById(info.lastInsertRowid);
  },

  updateStatus(id, status) {
    const existing = this.findById(id);
    if (!existing) return null;
    prepareStmt(
      "UPDATE contact_messages SET status = ?, updated_at = datetime('now') WHERE id = ?"
    ).run(status, Number(id));
    return this.findById(id);
  },

  remove(id) {
    const info = prepareStmt('DELETE FROM contact_messages WHERE id = ?').run(
      Number(id)
    );
    return info.changes > 0;
  },

  countByStatus() {
    const rows = prepareStmt(
      'SELECT status, COUNT(*) AS count FROM contact_messages GROUP BY status'
    ).all();
    const summary = { unread: 0, read: 0, responded: 0, archived: 0, total: 0 };
    for (const r of rows) {
      summary[r.status] = r.count;
      summary.total += r.count;
    }
    return summary;
  },
};

module.exports = contactRepository;
