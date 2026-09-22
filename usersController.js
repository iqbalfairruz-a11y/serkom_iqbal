const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const usersModel = require('../models/usersModel');
const produkModel = require('../models/produkModel');
const artikelModel = require('../models/artikelModel');
const pembelianModel = require('../models/pembelianModel');

// ==============================
// --- AUTENTIKASI & PROFIL ---
// ==============================

exports.registerUser = async (req, res) => {
  try {
    const { nama_d, nama_b, kelamin, lahir, alamat, phone, email, uname, passwd, foto } = req.body;

    if (!email || !uname || !passwd) {
      return res.status(400).json({ message: 'Email, username, dan password wajib diisi' });
    }

    const [existingEmail] = await usersModel.findUserByEmail(email);
    const [existingUname] = await usersModel.findUserByCredential(uname);

    if (existingEmail.length > 0 || existingUname.length > 0) {
      return res.status(400).json({ message: 'Email atau Username sudah terpakai' });
    }

    const hashedPassword = await bcrypt.hash(passwd, 10);

    await usersModel.createUser({
      nama_d,
      nama_b,
      kelamin,
      lahir,
      alamat,
      phone,
      email,
      uname,
      passwd: hashedPassword,
      foto: foto || '',
      role: 'pembeli',
    });

    res.status(201).json({ message: 'Registrasi berhasil' });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ message: 'Error server', error: err.message });
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { credential, passwd } = req.body;

    if (!credential || !passwd) {
      return res.status(400).json({ message: 'Credential dan password wajib diisi' });
    }

    const [users] = await usersModel.findUserByCredential(credential);

    if (users.length === 0) {
      return res.status(401).json({ message: 'User tidak ditemukan' });
    }

    const user = users[0];
    const isMatch = await bcrypt.compare(passwd, user.passwd);
    if (!isMatch) {
      return res.status(401).json({ message: 'Password salah' });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      message: 'Login berhasil',
      token,
      role: user.role,
      user: {
        id: user.id,
        nama_d: user.nama_d,
        nama_b: user.nama_b,
        email: user.email,
        uname: user.uname,
        role: user.role,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Error server', error: err.message });
  }
};

exports.getMyProfile = async (req, res) => {
  try {
    const [users] = await usersModel.findUserById(req.user.id);
    if (users.length === 0) return res.status(404).json({ message: 'User tidak ditemukan' });
    res.json(users[0]);
  } catch (err) {
    res.status(500).json({ message: 'Error server', error: err.message });
  }
};

exports.updateMyProfile = async (req, res) => {
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
    if (passwordBaru.length < 6) {
      return res.status(400).json({ message: 'Password baru minimal 6 karakter' });
    }

    const [rows] = await usersModel.findPasswdHashById(req.user.id);
    if (rows.length === 0) return res.status(404).json({ message: 'User tidak ditemukan' });

    const isMatch = await bcrypt.compare(passwordLama, rows[0].passwd);
    if (!isMatch) {
      return res.status(401).json({ message: 'Password lama salah' });
    }

    const hashed = await bcrypt.hash(passwordBaru, 10);
    await usersModel.updatePassword(req.user.id, hashed);
    res.json({ message: 'Password berhasil diubah' });
  } catch (err) {
    res.status(500).json({ message: 'Error server', error: err.message });
  }
};

// ==============================
// --- FITUR PUBLIK ---
// ==============================

exports.listProduk = async (req, res) => {
  try {
    const [rows] = await produkModel.findAllProduk();
    res.json(rows);
  } catch (err) {
    console.error('listProduk:', err.message);
    // Kembalikan array kosong agar frontend tidak error keras
    if (err.code === 'ER_NO_SUCH_TABLE') {
      return res.json([]);
    }
    res.status(500).json({ message: 'Error server', error: err.message });
  }
};

exports.getProdukById = async (req, res) => {
  try {
    const [rows] = await produkModel.findProdukById(req.params.id);
    if (rows.length === 0) return res.status(404).json({ message: 'Produk tidak ditemukan' });
    res.json(rows[0]);
  } catch (err) {
    if (err.code === 'ER_NO_SUCH_TABLE') {
      return res.status(404).json({ message: 'Produk tidak ditemukan' });
    }
    res.status(500).json({ message: 'Error server', error: err.message });
  }
};

exports.listArtikelPublik = async (req, res) => {
  try {
    const [rows] = await artikelModel.findAllArtikel();
    res.json(rows);
  } catch (err) {
    console.error('listArtikelPublik:', err.message);
    if (err.code === 'ER_NO_SUCH_TABLE') {
      return res.json([]);
    }
    res.status(500).json({ message: 'Error server', error: err.message });
  }
};

exports.getArtikelPublikById = async (req, res) => {
  try {
    const [rows] = await artikelModel.findArtikelById(req.params.id);
    if (rows.length === 0) return res.status(404).json({ message: 'Artikel tidak ditemukan' });
    res.json(rows[0]);
  } catch (err) {
    if (err.code === 'ER_NO_SUCH_TABLE') {
      return res.status(404).json({ message: 'Artikel tidak ditemukan' });
    }
    res.status(500).json({ message: 'Error server', error: err.message });
  }
};

// ==============================
// --- DASHBOARD & PEMBELIAN ---
// ==============================

exports.getDashboard = async (req, res) => {
  try {
    const [stats] = await pembelianModel.getStatsByPembeliId(req.user.id);
    const [pembelian] = await pembelianModel.findByPembeliId(req.user.id);
    res.json({
      message: 'Selamat datang di Dashboard Pembeli',
      total_transaksi: stats[0]?.total_transaksi || 0,
      total_pengeluaran: stats[0]?.total_pengeluaran || 0,
      riwayat: pembelian.slice(0, 5),
    });
  } catch (err) {
    res.status(500).json({ message: 'Error server', error: err.message });
  }
};

exports.createPembelian = async (req, res) => {
  try {
    const id_pembeli = req.user.id;
    const {
      id_produk,
      total_harga,
      metode_pembayaran,
      kurir,
      alamat_pengiriman,
      catatan,
      jumlah,
    } = req.body;

    // Bersihkan id_produk dari string (misal: "prod-1" menjadi 1)
    let cleanIdProduk = null;
    if (id_produk != null && id_produk !== '') {
      cleanIdProduk = parseInt(String(id_produk).replace(/\D/g, ''), 10);
    }

    if (!cleanIdProduk || Number.isNaN(cleanIdProduk)) {
      return res.status(400).json({ message: 'ID Produk tidak valid atau kosong' });
    }

    if (!total_harga || Number(total_harga) <= 0) {
      return res.status(400).json({ message: 'Total harga tidak valid' });
    }

    const qty = Math.max(1, parseInt(jumlah, 10) || 1);

    const validMetode = ['Bank Transfer', 'COD'];
    if (metode_pembayaran && !validMetode.includes(metode_pembayaran)) {
      return res.status(400).json({ message: 'Metode tidak valid. Gunakan: Bank Transfer atau COD' });
    }

    const validKurir = ['JNT Express', 'JNE'];
    if (kurir && !validKurir.includes(kurir)) {
      return res.status(400).json({ message: 'Kurir tidak valid. Gunakan: JNT Express atau JNE' });
    }

    // Cek produk & stok
    try {
      const [produkRows] = await produkModel.findProdukById(cleanIdProduk);
      if (!produkRows || produkRows.length === 0) {
        return res.status(404).json({ message: 'Produk tidak ditemukan' });
      }
      const stok = Number(produkRows[0].stok);
      if (!Number.isNaN(stok) && stok < qty) {
        return res.status(400).json({ message: `Stok tidak cukup. Sisa stok: ${stok}` });
      }
    } catch (cekErr) {
      if (cekErr.code === 'ER_NO_SUCH_TABLE') {
        return res.status(500).json({
          message: 'Tabel produk belum ada. Import database/schema.sql di phpMyAdmin.',
        });
      }
      // lanjut saja jika query gagal karena alasan lain
    }

    const payload = {
      id_pembeli,
      id_produk: cleanIdProduk,
      jumlah: qty,
      total_harga: Number(total_harga),
      metode_pembayaran: metode_pembayaran || null,
      kurir: kurir || null,
      alamat_pengiriman: alamat_pengiriman || null,
      catatan: catatan || null,
      status: 'Pending',
    };

    try {
      await pembelianModel.create(payload);
    } catch (insertErr) {
      console.warn('Insert lengkap gagal, coba minimal:', insertErr.message);
      await pembelianModel.createMinimal(payload);
    }

    // Kurangi stok (best-effort)
    try {
      await require('../config/db').query(
        'UPDATE produk SET stok = GREATEST(0, stok - ?) WHERE id_produk = ?',
        [qty, cleanIdProduk]
      );
    } catch (_) { /* abaikan jika kolom/tabel beda */ }

    res.status(201).json({ message: 'Pesanan berhasil dibuat' });
  } catch (err) {
    console.error('Create pembelian error:', err);
    res.status(500).json({
      message: err.code === 'ER_NO_SUCH_TABLE'
        ? 'Tabel pembelian belum ada. Import database/schema.sql di phpMyAdmin.'
        : (err.message || 'Error server'),
      error: err.message,
    });
  }
};

exports.listMyPembelian = async (req, res) => {
  try {
    const [rows] = await pembelianModel.findByPembeliId(req.user.id);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Error server', error: err.message });
  }
};

exports.getMyPembelianById = async (req, res) => {
  try {
    const [rows] = await pembelianModel.findByIdAndPembeliId(req.params.id, req.user.id);
    if (rows.length === 0) return res.status(404).json({ message: 'Pesanan tidak ditemukan' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Error server', error: err.message });
  }
};


exports.listKategoriPublik = async (req, res) => {
  try {
    const kategoriModel = require('../models/kategoriModel');
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
