const produkModel = require('../models/produkModel');
const kategoriModel = require('../models/kategoriModel');
const artikelModel = require('../models/artikelModel');
const pembelianModel = require('../models/pembelianModel');
const usersModel = require('../models/usersModel');
const db = require('../config/db');
const bcrypt = require('bcrypt');

const KATEGORI_VALID = ['Kain Batik', 'Pakaian Batik', 'Aksesoris'];

// ==============================
// --- STATISTIK ADMIN ---
// ==============================

exports.getStats = async (req, res) => {
  try {
    const [stats] = await pembelianModel.getAdminStats();
    const [recent] = await pembelianModel.getRecentPembelian(5);
    const [produkCount] = await db.query('SELECT COUNT(*) AS total FROM produk');
    const [artikelCount] = await db.query('SELECT COUNT(*) AS total FROM artikel');
    const [pembeliCount] = await db.query("SELECT COUNT(*) AS total FROM users WHERE role = 'pembeli'");
    
    let pesananAktif = 0;
    let belumDibayar = 0;
    try {
      const [aktifRows] = await db.query(
        "SELECT COUNT(*) AS total FROM pembelian WHERE status IN ('Pending', 'Dikonfirmasi', 'Dikirim')"
      );
      pesananAktif = aktifRows[0]?.total || 0;
      const [belumRows] = await db.query(
        "SELECT COUNT(*) AS total FROM pembelian WHERE status = 'Pending'"
      );
      belumDibayar = belumRows[0]?.total || 0;
    } catch (_) { /* kolom status mungkin beda */ }

    res.json({
      stats: {
        ...(stats[0] || {}),
        total_produk: produkCount[0]?.total || 0,
        total_artikel: artikelCount[0]?.total || 0,
        total_pembeli: pembeliCount[0]?.total || 0,
        pesanan_aktif: pesananAktif,
        belum_dibayar: belumDibayar,
      },
      recentPembelian: recent,
    });
  } catch (err) {
    res.status(500).json({ message: 'Error server', error: err.message });
  }
};

// ==============================
// --- PROFIL ADMIN ---
// ==============================

exports.getMe = async (req, res) => {
  try {
    const [users] = await usersModel.findUserById(req.user.id);
    if (!users || users.length === 0) return res.status(404).json({ message: 'Admin tidak ditemukan' });
    res.json(users[0]);
  } catch (err) {
    res.status(500).json({ message: 'Error server', error: err.message });
  }
};

exports.updateMe = async (req, res) => {
  try {
    const { nama_d, nama_b, kelamin, lahir, alamat, phone, foto } = req.body;
    await usersModel.updateUserProfile(req.user.id, {
      nama_d,
      nama_b,
      kelamin,
      lahir,
      alamat,
      phone,
      foto: foto || '',
    });
    res.json({ message: 'Profil berhasil diperbarui' });
  } catch (err) {
    res.status(500).json({ message: 'Error server', error: err.message });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { passwordLama, passwordBaru } = req.body;
    if (!passwordLama || !passwordBaru) {
      return res.status(400).json({ message: 'Password lama dan baru wajib diisi' });
    }
    const [rows] = await usersModel.findPasswdHashById(req.user.id);
    if (!rows || rows.length === 0) return res.status(404).json({ message: 'User tidak ditemukan' });

    const isMatch = await bcrypt.compare(passwordLama, rows[0].passwd);
    if (!isMatch) return res.status(401).json({ message: 'Password lama salah' });

    const hashed = await bcrypt.hash(passwordBaru, 10);
    await usersModel.updatePassword(req.user.id, hashed);
    res.json({ message: 'Password berhasil diubah' });
  } catch (err) {
    res.status(500).json({ message: 'Error server', error: err.message });
  }
};

// ==============================
// --- CRUD PRODUK ---
// ==============================

exports.listProduk = async (req, res) => {
  try {
    const [rows] = await produkModel.findAllProduk();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Error server', error: err.message });
  }
};

exports.getProdukById = async (req, res) => {
  try {
    const [rows] = await produkModel.findProdukById(req.params.id);
    if (!rows || rows.length === 0) return res.status(404).json({ message: 'Produk tidak ditemukan' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Error server', error: err.message });
  }
};

exports.createProduk = async (req, res) => {
  try {
    const { nama_produk, deskripsi, harga, gambar, kategori, stok } = req.body;

    if (!nama_produk || harga == null) {
      return res.status(400).json({ message: 'Nama produk dan harga wajib diisi' });
    }

    const validKategori = (kategori && String(kategori).trim()) ? String(kategori).trim() : (KATEGORI_VALID[0] || 'Kain Batik');

    const payload = {
      nama_produk: String(nama_produk).trim(),
      deskripsi: deskripsi ? String(deskripsi).trim() : '',
      harga: Number(harga) || 0,
      gambar: gambar || '',
      kategori: validKategori,
      stok: Number(stok) || 0,
    };

    await produkModel.insertProduk(payload);
    res.status(201).json({ message: 'Produk berhasil ditambahkan' });
  } catch (err) {
    console.error('Error createProduk DB:', err);
    res.status(500).json({ message: err.message || 'Terjadi kesalahan pada server database' });
  }
};

exports.updateProduk = async (req, res) => {
  try {
    const { nama_produk, deskripsi, harga, gambar, kategori, stok } = req.body;
    const [existing] = await produkModel.findProdukById(req.params.id);
    if (!existing || existing.length === 0) {
      return res.status(404).json({ message: 'Produk tidak ditemukan' });
    }

    const validKategori = (kategori && String(kategori).trim()) ? String(kategori).trim() : existing[0].kategori;

    const payload = {
      nama_produk: nama_produk ? String(nama_produk).trim() : existing[0].nama_produk,
      deskripsi: deskripsi !== undefined ? String(deskripsi).trim() : existing[0].deskripsi,
      harga: harga != null ? Number(harga) : existing[0].harga,
      gambar: gambar !== undefined ? gambar : existing[0].gambar,
      kategori: validKategori,
      stok: stok != null ? Number(stok) : existing[0].stok,
    };

    await produkModel.updateProduk(req.params.id, payload);
    res.json({ message: 'Produk berhasil diperbarui' });
  } catch (err) {
    console.error('Error updateProduk DB:', err);
    res.status(500).json({ message: err.message || 'Terjadi kesalahan pada server database' });
  }
};

exports.deleteProduk = async (req, res) => {
  try {
    const [existing] = await produkModel.findProdukById(req.params.id);
    if (!existing || existing.length === 0) {
      return res.status(404).json({ message: 'Produk tidak ditemukan' });
    }
    
    await produkModel.deleteProduk(req.params.id);
    res.json({ message: 'Produk berhasil dihapus' });
  } catch (err) {
    console.error('Error deleteProduk DB:', err);

    if (err.errno === 1451 || err.code === 'ER_ROW_IS_REFERENCED_2') {
      return res.status(400).json({
        message: 'Produk tidak dapat dihapus karena sudah pernah dipesan / terikat transaksi.'
      });
    }

    res.status(500).json({ message: 'Gagal menghapus produk dari server database', error: err.message });
  }
};

// ==============================
// --- CRUD PEMBELI / USERS ---
// ==============================

exports.listPembeli = async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT id, nama_d, nama_b, email, uname, phone, alamat, foto, role, created_at FROM users WHERE role = 'pembeli' ORDER BY id DESC"
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Error server', error: err.message });
  }
};

exports.getPembeliById = async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT id, nama_d, nama_b, email, uname, phone, alamat, foto, role, created_at FROM users WHERE id = ? AND role = 'pembeli'",
      [req.params.id]
    );
    if (!rows || rows.length === 0) return res.status(404).json({ message: 'Pembeli tidak ditemukan' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Error server', error: err.message });
  }
};

exports.createPembeli = async (req, res) => {
  try {
    let { nama, nama_d, nama_b, email, uname, username, passwd, password, phone, no_hp, alamat, foto } = req.body;
    
    if (!nama_d && nama) {
      const parts = String(nama).trim().split(' ');
      nama_d = parts[0] || '';
      nama_b = parts.slice(1).join(' ') || '';
    }

    const emailVal = email ? String(email).trim() : '';
    const usernameVal = (uname || username) ? String(uname || username).trim() : '';
    const passwordVal = passwd || password;

    if (!emailVal || !usernameVal || !passwordVal) {
      return res.status(400).json({ message: 'Email, username, dan password wajib diisi' });
    }

    const hashedPassword = await bcrypt.hash(passwordVal, 10);
    
    await db.query(
      `INSERT INTO users (nama_d, nama_b, email, uname, passwd, phone, alamat, foto, role, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pembeli', NOW())`,
      [
        nama_d || '',
        nama_b || '',
        emailVal,
        usernameVal,
        hashedPassword,
        phone || no_hp || '',
        alamat || '',
        foto || ''
      ]
    );

    res.status(201).json({ message: 'Pembeli berhasil ditambahkan' });
  } catch (err) {
    res.status(500).json({ message: 'Error server', error: err.message });
  }
};

exports.updatePembeli = async (req, res) => {
  try {
    const { nama, nama_d, nama_b, email, uname, username, phone, no_hp, alamat, foto, password, passwd } = req.body;

    const [existing] = await db.query("SELECT * FROM users WHERE id = ? AND role = 'pembeli'", [req.params.id]);
    if (!existing || existing.length === 0) {
      return res.status(404).json({ message: 'Pembeli tidak ditemukan' });
    }
    const oldData = existing[0];

    let finalNamaD = nama_d;
    let finalNamaB = nama_b;
    if (nama !== undefined && !nama_d) {
      const parts = String(nama).trim().split(' ');
      finalNamaD = parts[0] || '';
      finalNamaB = parts.slice(1).join(' ') || '';
    }

    let finalPass = oldData.passwd;
    const inputPass = password || passwd;
    if (inputPass && String(inputPass).trim() !== '') {
      finalPass = await bcrypt.hash(String(inputPass).trim(), 10);
    }

    const updateSql = `
      UPDATE users SET 
        nama_d = ?, 
        nama_b = ?, 
        email = ?, 
        uname = ?, 
        phone = ?, 
        alamat = ?, 
        foto = ?, 
        passwd = ? 
      WHERE id = ? AND role = 'pembeli'
    `;

    const updateParams = [
      finalNamaD !== undefined ? finalNamaD : oldData.nama_d,
      finalNamaB !== undefined ? finalNamaB : oldData.nama_b,
      email !== undefined ? email : oldData.email,
      (uname || username) !== undefined ? (uname || username) : oldData.uname,
      (phone || no_hp) !== undefined ? (phone || no_hp) : oldData.phone,
      alamat !== undefined ? alamat : oldData.alamat,
      foto !== undefined ? foto : oldData.foto,
      finalPass,
      req.params.id
    ];

    await db.query(updateSql, updateParams);

    res.json({ message: 'Data pembeli berhasil diperbarui' });
  } catch (err) {
    res.status(500).json({ message: 'Error server', error: err.message });
  }
};

exports.deletePembeli = async (req, res) => {
  try {
    const [result] = await db.query("DELETE FROM users WHERE id = ? AND role = 'pembeli'", [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Pembeli tidak ditemukan' });
    res.json({ message: 'Pembeli berhasil dihapus' });
  } catch (err) {
    if (err.errno === 1451 || err.code === 'ER_ROW_IS_REFERENCED_2') {
      return res.status(400).json({
        message: 'Pembeli tidak dapat dihapus karena memiliki riwayat transaksi.'
      });
    }
    res.status(500).json({ message: 'Error server', error: err.message });
  }
};

// ==============================
// --- CRUD ARTIKEL ---
// ==============================

exports.listArtikel = async (req, res) => {
  try {
    const [rows] = await artikelModel.findAllArtikel();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Error server', error: err.message });
  }
};

exports.getArtikelById = async (req, res) => {
  try {
    const [rows] = await artikelModel.findArtikelById(req.params.id);
    if (!rows || rows.length === 0) return res.status(404).json({ message: 'Artikel tidak ditemukan' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Error server', error: err.message });
  }
};

exports.createArtikel = async (req, res) => {
  try {
    const { judul, isi, penulis, gambar, ringkasan } = req.body;
    if (!judul) return res.status(400).json({ message: 'Judul wajib diisi' });
    await artikelModel.insertArtikel({ judul, isi, penulis, gambar, ringkasan });
    res.status(201).json({ message: 'Artikel berhasil ditambahkan' });
  } catch (err) {
    console.error('createArtikel:', err);
    res.status(500).json({ message: err.message || 'Gagal menambah artikel', error: err.message });
  }
};

exports.updateArtikel = async (req, res) => {
  try {
    const { judul, isi, penulis, gambar, ringkasan } = req.body;
    const [existing] = await artikelModel.findArtikelById(req.params.id);
    if (!existing || existing.length === 0) return res.status(404).json({ message: 'Artikel tidak ditemukan' });
    await artikelModel.updateArtikel(req.params.id, { judul, isi, penulis, gambar, ringkasan });
    res.json({ message: 'Artikel berhasil diperbarui' });
  } catch (err) {
    console.error('updateArtikel:', err);
    res.status(500).json({ message: err.message || 'Gagal update artikel', error: err.message });
  }
};

exports.deleteArtikel = async (req, res) => {
  try {
    const [existing] = await artikelModel.findArtikelById(req.params.id);
    if (!existing || existing.length === 0) return res.status(404).json({ message: 'Artikel tidak ditemukan' });
    await artikelModel.deleteArtikel(req.params.id);
    res.json({ message: 'Artikel berhasil dihapus' });
  } catch (err) {
    console.error('deleteArtikel:', err);
    res.status(500).json({ message: err.message || 'Gagal hapus artikel', error: err.message });
  }
};

// ==============================
// --- CRUD PEMBELIAN ---
// ==============================

exports.listPembelian = async (req, res) => {
  try {
    const [rows] = await pembelianModel.findAllPembelianWithDetail();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Error server', error: err.message });
  }
};

exports.getPembelianById = async (req, res) => {
  try {
    const id = req.params.id;
    let rows = [];
    try {
      const result = await pembelianModel.findPembelianByIdWithDetail(id);
      rows = result[0] || [];
    } catch (e1) {
      console.warn('detail query fail, simple:', e1.message);
      const result = await pembelianModel.findPembelianById(id);
      rows = result[0] || [];
    }
    if (!rows.length) {
      return res.status(404).json({ message: 'Pembelian tidak ditemukan' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error('getPembelianById:', err);
    res.status(500).json({ message: err.message || 'Error server', error: err.message });
  }
};

exports.updatePembelian = async (req, res) => {
  try {
    const [existing] = await pembelianModel.findPembelianById(req.params.id);
    if (!existing || existing.length === 0) return res.status(404).json({ message: 'Pembelian tidak ditemukan' });
    const body = req.body || {};
    const row = existing[0];

    let bayar = body.pembayaran;
    if (bayar === undefined || bayar === null || bayar === '') bayar = body.status_pembayaran;
    if (bayar === undefined || bayar === null || bayar === '') bayar = row.pembayaran || 'Belum';
    const b = String(bayar).toLowerCase();
    if (b === 'dibayar' || b === 'lunas') bayar = 'Dibayar';
    else if (b === 'belum') bayar = 'Belum';

    await pembelianModel.updatePembelian(req.params.id, {
      status: body.status || row.status,
      total_harga: body.total_harga != null ? body.total_harga : row.total_harga,
      metode_pembayaran: body.metode_pembayaran != null ? body.metode_pembayaran : row.metode_pembayaran,
      kurir: body.kurir || body.pengiriman || row.kurir,
      pengiriman: body.pengiriman || body.kurir || row.pengiriman,
      alamat_pengiriman: body.alamat_pengiriman != null ? body.alamat_pengiriman : row.alamat_pengiriman,
      catatan: body.catatan != null ? body.catatan : row.catatan,
      pembayaran: bayar,
    });

    const [updated] = await pembelianModel.findPembelianById(req.params.id);
    res.json({
      message: 'Pembelian berhasil diperbarui',
      data: updated && updated[0] ? updated[0] : null,
      pembayaran: bayar,
    });
  } catch (err) {
    console.error('updatePembelian:', err);
    res.status(500).json({ message: err.message || 'Gagal update pesanan', error: err.message });
  }
};

exports.deletePembelian = async (req, res) => {
  try {
    await pembelianModel.deletePembelian(req.params.id);
    res.json({ message: 'Pembelian berhasil dihapus' });
  } catch (err) {
    console.error('deletePembelian:', err);
    res.status(500).json({ message: err.message || 'Gagal hapus pesanan', error: err.message });
  }
};

// --- CRUD KATEGORI ---
exports.listKategori = async (req, res) => {
  try {
    const [rows] = await kategoriModel.findAll();
    res.json({ data: rows });
  } catch (err) {
    if (err.code === 'ER_NO_SUCH_TABLE') {
      return res.json({ data: [
        { id: 1, nama: 'Kain Batik' },
        { id: 2, nama: 'Pakaian Batik' },
        { id: 3, nama: 'Aksesoris' },
      ]});
    }
    res.status(500).json({ message: err.message });
  }
};

exports.createKategori = async (req, res) => {
  try {
    const nama = (req.body?.nama || '').trim();
    if (!nama) return res.status(400).json({ message: 'Nama kategori wajib diisi' });
    const [dup] = await kategoriModel.findByNama(nama);
    if (dup && dup.length) return res.status(400).json({ message: 'Kategori sudah ada' });
    const [result] = await kategoriModel.insert(nama);
    res.status(201).json({ message: 'Kategori ditambahkan', id: result.insertId, nama });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Gagal menambah kategori' });
  }
};

exports.updateKategori = async (req, res) => {
  try {
    const id = req.params.id;
    const nama = (req.body?.nama || '').trim();
    if (!nama) return res.status(400).json({ message: 'Nama kategori wajib diisi' });
    const [existing] = await kategoriModel.findById(id);
    if (!existing || !existing.length) return res.status(404).json({ message: 'Kategori tidak ditemukan' });
    const oldNama = existing[0].nama;
    await kategoriModel.update(id, nama);
    try {
      const db = require('../config/db');
      await db.query('UPDATE produk SET kategori = ? WHERE kategori = ?', [nama, oldNama]);
    } catch (_) {}
    res.json({ message: 'Kategori diperbarui', id, nama });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Gagal update kategori' });
  }
};

exports.deleteKategori = async (req, res) => {
  try {
    const id = req.params.id;
    const [existing] = await kategoriModel.findById(id);
    if (!existing || !existing.length) return res.status(404).json({ message: 'Kategori tidak ditemukan' });
    await kategoriModel.remove(id);
    res.json({ message: 'Kategori dihapus' });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Gagal hapus kategori' });
  }
};
