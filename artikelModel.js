const db = require('../config/db');

// Skema aktual MySQL:
// id, judul, ringkasan, isi, gambar, created_at, updated_at

exports.findAllArtikel = () => {
  return db.query('SELECT * FROM artikel ORDER BY id DESC');
};

exports.findArtikelById = (id) => {
  return db.query('SELECT * FROM artikel WHERE id = ?', [id]);
};

exports.insertArtikel = (data) => {
  const judul = data.judul || '';
  const isi = data.isi || '';
  // ringkasan wajib NOT NULL — ambil dari form atau potong dari isi
  let ringkasan = data.ringkasan || data.deskripsi || '';
  if (!ringkasan && isi) {
    ringkasan = String(isi).replace(/<[^>]*>/g, '').substring(0, 200);
  }
  if (!ringkasan) ringkasan = judul || '-';
  const gambar = data.gambar || '';

  const sql = `
    INSERT INTO artikel (judul, ringkasan, isi, gambar) 
    VALUES (?, ?, ?, ?)
  `;
  return db.query(sql, [judul, ringkasan, isi, gambar]);
};

exports.updateArtikel = (id, data) => {
  const judul = data.judul || '';
  const isi = data.isi || '';
  let ringkasan = data.ringkasan || data.deskripsi || '';
  if (!ringkasan && isi) {
    ringkasan = String(isi).replace(/<[^>]*>/g, '').substring(0, 200);
  }
  if (!ringkasan) ringkasan = judul || '-';
  const gambar = data.gambar || '';

  const sql = `
    UPDATE artikel SET judul = ?, ringkasan = ?, isi = ?, gambar = ? 
    WHERE id = ?
  `;
  return db.query(sql, [judul, ringkasan, isi, gambar, id]);
};

exports.deleteArtikel = (id) => {
  return db.query('DELETE FROM artikel WHERE id = ?', [id]);
};
