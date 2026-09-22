const db = require('../config/db');

exports.findAllProduk = () => {
  return db.query('SELECT * FROM produk ORDER BY id_produk DESC');
};

exports.findProdukById = (id) => {
  return db.query('SELECT * FROM produk WHERE id_produk = ?', [id]);
};

exports.insertProduk = (data) => {
  const sql = `
    INSERT INTO produk (nama_produk, deskripsi, harga, gambar, kategori, stok) 
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  return db.query(sql, [
    data.nama_produk,
    data.deskripsi || '',
    data.harga,
    data.gambar || '',
    data.kategori || '',
    data.stok != null ? data.stok : 0,
  ]);
};

exports.updateProduk = (id, data) => {
  const sql = `
    UPDATE produk SET 
      nama_produk = ?, deskripsi = ?, harga = ?, gambar = ?, kategori = ?, stok = ? 
    WHERE id_produk = ?
  `;
  return db.query(sql, [
    data.nama_produk,
    data.deskripsi || '',
    data.harga,
    data.gambar || '',
    data.kategori || '',
    data.stok != null ? data.stok : 0,
    id,
  ]);
};

exports.deleteProduk = (id) => {
  return db.query('DELETE FROM produk WHERE id_produk = ?', [id]);
};
