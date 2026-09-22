const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Pastikan folder upload ada
const uploadDir = path.join(__dirname, '..', 'uploads', 'images');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Middleware autentikasi Bearer JWT
exports.authenticate = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Token akses tidak ditemukan' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Token tidak valid atau kedaluwarsa' });
    }
    req.user = user;
    next();
  });
};

// Middleware batasi role
exports.requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Akses ditolak, hak akses tidak sesuai' });
    }
    next();
  };
};

// Konfigurasi multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname).toLowerCase());
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|gif|webp/;
  const ext = allowed.test(path.extname(file.originalname).toLowerCase());
  const mime = allowed.test(file.mimetype);
  if (ext && mime) {
    cb(null, true);
  } else {
    cb(new Error('Hanya file gambar (jpeg, jpg, png, gif, webp) yang diizinkan'));
  }
};

exports.middlewareUploadGambar = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter,
}).single('gambar');

exports.sendHasilUpload = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Gambar gagal diupload atau tidak ditemukan' });
  }
  res.json({
    message: 'Gambar berhasil diupload',
    path: `/uploads/images/${req.file.filename}`,
  });
};
