const express = require('express');
const router = express.Router();
const usersController = require('../controllers/usersController');
const {
  authenticate,
  requireRole,
  middlewareUploadGambar,
  sendHasilUpload,
} = require('../middlewares');

// --- AUTENTIKASI ---
router.post('/register', usersController.registerUser);
router.post('/login', usersController.loginUser); 

// --- FITUR PUBLIK ---
router.get('/produk', usersController.listProduk);
router.get('/produk/:id', usersController.getProdukById);
router.get('/artikel', usersController.listArtikelPublik);
router.get('/artikel/:id', usersController.getArtikelPublikById);
router.get('/kategori', usersController.listKategoriPublik);

// --- FITUR PEMBELI (Login + role pembeli) ---
router.get('/me', authenticate, requireRole('pembeli'), usersController.getMyProfile);
router.put('/me', authenticate, requireRole('pembeli'), usersController.updateMyProfile);
router.put('/change-password', authenticate, requireRole('pembeli'), usersController.changePassword);

router.post('/upload-gambar', authenticate, requireRole('pembeli'), middlewareUploadGambar, sendHasilUpload);

router.get('/dashboard', authenticate, requireRole('pembeli'), usersController.getDashboard);

router.post('/pembelian', authenticate, requireRole('pembeli'), usersController.createPembelian);
router.get('/pembelian', authenticate, requireRole('pembeli'), usersController.listMyPembelian);
router.get('/pembelian/:id', authenticate, requireRole('pembeli'), usersController.getMyPembelianById);

module.exports = router;
