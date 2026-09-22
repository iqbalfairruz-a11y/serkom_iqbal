const db = require('../config/db');

// PK tabel pembelian = `id` (bukan id_pembelian)

exports.create = async (data) => {
  const attempts = [
    {
      sql: `INSERT INTO pembelian 
        (id_pembeli, id_produk, jumlah, total_harga, metode_pembayaran, kurir, alamat_pengiriman, catatan, status, created_at) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      vals: [
        data.id_pembeli,
        data.id_produk || null,
        data.jumlah || 1,
        data.total_harga,
        data.metode_pembayaran || null,
        data.kurir || null,
        data.alamat_pengiriman || null,
        data.catatan || null,
        data.status || 'Pending',
      ],
    },
    {
      sql: `INSERT INTO pembelian (id_pembeli, total_harga, status, created_at) VALUES (?, ?, ?, NOW())`,
      vals: [data.id_pembeli, data.total_harga, data.status || 'Pending'],
    },
  ];
  let lastErr;
  for (const a of attempts) {
    try {
      return await db.query(a.sql, a.vals);
    } catch (err) {
      lastErr = err;
      console.warn('pembelian.create attempt fail:', err.message);
    }
  }
  throw lastErr;
};

exports.createMinimal = exports.create;
exports.insertPembelian = exports.create;

exports.findByPembeliId = (id_pembeli) => {
  return db.query(
    `SELECT * FROM pembelian WHERE id_pembeli = ? ORDER BY created_at DESC`,
    [id_pembeli]
  );
};

exports.findPembelianByPembeliIdWithDetail = exports.findByPembeliId;

exports.findByIdAndPembeliId = (id, id_pembeli) => {
  return db.query(
    'SELECT * FROM pembelian WHERE id = ? AND id_pembeli = ?',
    [id, id_pembeli]
  );
};

exports.findPembelianByIdAndPembeliId = exports.findByIdAndPembeliId;

exports.findAllPembelianWithDetail = async () => {
  try {
    return await db.query(`
      SELECT 
        p.*,
        p.id AS id_pembelian,
        u.nama_d, 
        u.nama_b, 
        u.email,
        CONCAT(COALESCE(u.nama_d, ''), ' ', COALESCE(u.nama_b, '')) AS nama_pembeli,
        CONCAT(COALESCE(u.nama_d, ''), ' ', COALESCE(u.nama_b, '')) AS pembeli,
        COALESCE(pr.nama_produk, 'Produk') AS nama_produk,
        COALESCE(pr.nama_produk, 'Produk') AS produk,
        pr.gambar AS gambar_produk,
        pr.gambar
      FROM pembelian p 
      LEFT JOIN users u ON p.id_pembeli = u.id
      LEFT JOIN produk pr ON p.id_produk = pr.id_produk
      ORDER BY p.created_at DESC
    `);
  } catch (err) {
    console.warn('findAllPembelianWithDetail fallback:', err.message);
    return db.query(`
      SELECT 
        p.*,
        p.id AS id_pembelian,
        u.nama_d, 
        u.nama_b, 
        u.email,
        CONCAT(COALESCE(u.nama_d, ''), ' ', COALESCE(u.nama_b, '')) AS nama_pembeli
      FROM pembelian p 
      LEFT JOIN users u ON p.id_pembeli = u.id
      ORDER BY p.created_at DESC
    `);
  }
};

exports.findPembelianById = (id) => {
  return db.query('SELECT * FROM pembelian WHERE id = ?', [id]);
};

exports.findPembelianByIdWithDetail = async (id) => {
  try {
    return await db.query(
      `
      SELECT 
        p.*,
        p.id AS id_pembelian,
        u.nama_d, u.nama_b, u.email,
        CONCAT(COALESCE(u.nama_d, ''), ' ', COALESCE(u.nama_b, '')) AS nama_pembeli,
        COALESCE(pr.nama_produk, 'Produk') AS nama_produk,
        pr.gambar AS gambar_produk,
        pr.gambar
      FROM pembelian p 
      LEFT JOIN users u ON p.id_pembeli = u.id
      LEFT JOIN produk pr ON p.id_produk = pr.id_produk
      WHERE p.id = ?
    `,
      [id]
    );
  } catch (err) {
    return db.query('SELECT *, id AS id_pembelian FROM pembelian WHERE id = ?', [id]);
  }
};

exports.updatePembelian = async (id, data) => {
  const tryUpdate = async (map) => {
    const fields = [];
    const vals = [];
    for (const [col, val] of Object.entries(map)) {
      if (val !== undefined && val !== null && val !== '') {
        fields.push('`' + col + '` = ?');
        vals.push(val);
      }
    }
    if (fields.length === 0) return db.query('SELECT 1');
    vals.push(id);
    return db.query(`UPDATE pembelian SET ${fields.join(', ')} WHERE id = ?`, vals);
  };

  try {
    return await tryUpdate({
      status: data.status,
      total_harga: data.total_harga,
      metode_pembayaran: data.metode_pembayaran,
      pembayaran: data.pembayaran,
      kurir: data.kurir || data.pengiriman,
      pengiriman: data.pengiriman || data.kurir,
      alamat_pengiriman: data.alamat_pengiriman,
      catatan: data.catatan,
    });
  } catch (err) {
    console.warn('updatePembelian full fail:', err.message);
    try {
      return await tryUpdate({
        status: data.status,
        total_harga: data.total_harga,
        pembayaran: data.pembayaran,
        metode_pembayaran: data.metode_pembayaran,
      });
    } catch (err2) {
      console.warn('updatePembelian mid fail:', err2.message);
      return tryUpdate({
        status: data.status,
        pembayaran: data.pembayaran,
        total_harga: data.total_harga,
      });
    }
  }
};

exports.deletePembelian = (id) => {
  return db.query('DELETE FROM pembelian WHERE id = ?', [id]);
};

exports.getStatsByPembeliId = (id_pembeli) => {
  return db.query(
    `SELECT COUNT(*) AS total_transaksi, COALESCE(SUM(total_harga), 0) AS total_pengeluaran 
     FROM pembelian WHERE id_pembeli = ?`,
    [id_pembeli]
  );
};

exports.getAdminStats = () => {
  return db.query(`
    SELECT 
      COUNT(*) AS total_transaksi_all, 
      COALESCE(SUM(total_harga), 0) AS pendapatan_total 
    FROM pembelian
  `);
};

exports.getRecentPembelian = (limit = 5) => {
  const parsedLimit = parseInt(limit, 10) || 5;
  return db.query(`
    SELECT 
      p.*,
      p.id AS id_pembelian,
      u.nama_d, 
      u.nama_b, 
      CONCAT(COALESCE(u.nama_d, ''), ' ', COALESCE(u.nama_b, '')) AS nama_pembeli,
      COALESCE(pr.nama_produk, 'Produk') AS nama_produk, 
      pr.gambar 
    FROM pembelian p 
    LEFT JOIN users u ON p.id_pembeli = u.id 
    LEFT JOIN produk pr ON p.id_produk = pr.id_produk
    ORDER BY p.created_at DESC 
    LIMIT ${parsedLimit}
  `).catch(() =>
    db.query(`
      SELECT p.*, p.id AS id_pembelian, u.nama_d, u.nama_b,
        CONCAT(COALESCE(u.nama_d, ''), ' ', COALESCE(u.nama_b, '')) AS nama_pembeli
      FROM pembelian p 
      LEFT JOIN users u ON p.id_pembeli = u.id 
      ORDER BY p.created_at DESC 
      LIMIT ${parsedLimit}
    `)
  );
};
