const db = require('../config/db');

// Buat user baru (role default pembeli)
exports.createUser = (data) => {
  const sql = `
    INSERT INTO users 
      (nama_d, nama_b, kelamin, lahir, alamat, phone, email, uname, passwd, foto, role) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  return db.execute(sql, [
    data.nama_d || '',
    data.nama_b || '',
    data.kelamin || null,
    data.lahir || null,
    data.alamat || '',
    data.phone || '',
    data.email,
    data.uname || data.username,
    data.passwd,
    data.foto || '',
    data.role || 'pembeli',
  ]);
};

exports.findUserByEmail = (email) => {
  return db.execute('SELECT * FROM users WHERE email = ?', [email]);
};

exports.findUserByCredential = (cred) => {
  return db.execute(
    'SELECT * FROM users WHERE email = ? OR uname = ?',
    [cred, cred]
  );
};

exports.findUserById = (id) => {
  return db.execute(
    `SELECT id, nama_d, nama_b, kelamin, lahir, alamat, phone, email, role, uname, foto, created_at 
     FROM users WHERE id = ?`,
    [id]
  );
};

exports.findPasswdHashById = (id) => {
  return db.execute('SELECT passwd FROM users WHERE id = ?', [id]);
};

exports.updateUserProfile = (id, data) => {
  const sql = `
    UPDATE users SET 
      nama_d = ?, nama_b = ?, kelamin = ?, lahir = ?, 
      alamat = ?, phone = ?, foto = ? 
    WHERE id = ?
  `;
  return db.execute(sql, [
    data.nama_d,
    data.nama_b,
    data.kelamin,
    data.lahir,
    data.alamat,
    data.phone,
    data.foto || '',
    id,
  ]);
};

exports.updatePassword = (id, hashedPassword) => {
  return db.execute('UPDATE users SET passwd = ? WHERE id = ?', [hashedPassword, id]);
};

exports.listByRole = (role) => {
  return db.execute(
    `SELECT id, nama_d, nama_b, email, uname, phone, role, created_at 
     FROM users WHERE role = ? ORDER BY id DESC`,
    [role]
  );
};
