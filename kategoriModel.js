const db = require('../config/db');

exports.findAll = () => db.query('SELECT * FROM kategori ORDER BY nama ASC');
exports.findById = (id) => db.query('SELECT * FROM kategori WHERE id = ?', [id]);
exports.findByNama = (nama) => db.query('SELECT * FROM kategori WHERE nama = ?', [nama]);
exports.insert = (nama) => db.query('INSERT INTO kategori (nama) VALUES (?)', [nama]);
exports.update = (id, nama) => db.query('UPDATE kategori SET nama = ? WHERE id = ?', [nama, id]);
exports.remove = (id) => db.query('DELETE FROM kategori WHERE id = ?', [id]);
