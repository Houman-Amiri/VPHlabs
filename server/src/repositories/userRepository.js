const { prepareStmt } = require('./_stmtCache');

function sanitizeUser(row) {
  if (!row) return null;
  const { password_hash: _pw, ...safe } = row;
  return {
    ...safe,
    is_active: Boolean(row.is_active),
  };
}

const userRepository = {
  findByEmailWithHash(email) {
    return (
      prepareStmt('SELECT * FROM users WHERE LOWER(email) = LOWER(?)').get(
        String(email).trim()
      ) || null
    );
  },

  findByIdWithHash(id) {
    return prepareStmt('SELECT * FROM users WHERE id = ?').get(Number(id)) || null;
  },

  findById(id) {
    return sanitizeUser(this.findByIdWithHash(id));
  },

  create({ name, email, password_hash, role = 'admin' }) {
    const info = prepareStmt(`
      INSERT INTO users (name, email, password_hash, role, is_active)
      VALUES (@name, @email, @password_hash, @role, 1)
    `).run({
      name,
      email: String(email).trim(),
      password_hash,
      role,
    });
    return this.findById(info.lastInsertRowid);
  },

  updateCredentials(id, { email, password_hash }) {
    prepareStmt(
      "UPDATE users SET email = ?, password_hash = ?, updated_at = datetime('now') WHERE id = ?"
    ).run(String(email).trim(), password_hash, Number(id));
    return this.findById(id);
  },

  updatePassword(id, password_hash) {
    prepareStmt(
      "UPDATE users SET password_hash = ?, updated_at = datetime('now') WHERE id = ?"
    ).run(password_hash, Number(id));
    return this.findById(id);
  },

  countAll() {
    return prepareStmt('SELECT COUNT(*) AS count FROM users').get().count;
  },
};

module.exports = userRepository;
