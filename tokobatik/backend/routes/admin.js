const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const {
  authenticate,
  requireRole,
  middlewareUploadGambar,
  sendHasilUpload,
} = require('../middlewares');

// Semua route admin wajib login + role admin
router.use(authenticate, requireRole('admin'));

// --- STATISTIK ---
router.get('/stats', adminController.getStats);

// --- PROFIL ADMIN ---
router.get('/me', adminController.getMe);
router.put('/me', adminController.updateMe);
router.put('/change-password', adminController.changePassword);
router.get('/profile', adminController.getMe);
router.put('/profile', adminController.updateMe);

// --- CRUD PEMBELI / USERS ---
router.get('/pembeli', adminController.listPembeli);
router.get('/pembeli/:id', adminController.getPembeliById);
router.post('/pembeli', adminController.createPembeli);
router.put('/pembeli/:id', adminController.updatePembeli);
router.delete('/pembeli/:id', adminController.deletePembeli);

router.get('/users', adminController.listPembeli);
router.get('/users/:id', adminController.getPembeliById);
router.post('/users', adminController.createPembeli);
router.put('/users/:id', adminController.updatePembeli);
router.delete('/users/:id', adminController.deletePembeli);

// --- CRUD PRODUK ---
router.get('/produk', adminController.listProduk);
router.get('/produk/:id', adminController.getProdukById);
router.post('/produk', adminController.createProduk);
router.put('/produk/:id', adminController.updateProduk);
router.delete('/produk/:id', adminController.deleteProduk);

// --- PEMBELIAN ---
router.get('/pembelian', adminController.listPembelian);
router.get('/pembelian/:id', adminController.getPembelianById);
router.put('/pembelian/:id', adminController.updatePembelian);
router.delete('/pembelian/:id', adminController.deletePembelian);

// --- CRUD ARTIKEL ---
router.get('/artikel', adminController.listArtikel);
router.get('/artikel/:id', adminController.getArtikelById);
router.post('/artikel', adminController.createArtikel);
router.put('/artikel/:id', adminController.updateArtikel);
router.delete('/artikel/:id', adminController.deleteArtikel);

// --- CRUD KATEGORI ---
router.get('/kategori', adminController.listKategori);
router.post('/kategori', adminController.createKategori);
router.put('/kategori/:id', adminController.updateKategori);
router.delete('/kategori/:id', adminController.deleteKategori);

// --- UPLOAD ---
router.post('/upload', middlewareUploadGambar, sendHasilUpload);
router.post('/upload-gambar', middlewareUploadGambar, sendHasilUpload);

module.exports = router;