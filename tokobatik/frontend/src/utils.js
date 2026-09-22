/**
 * utils.js — format tampilan, media, kategori, sesi, profil, & helper transaksi.
 */
import { KELAMIN } from './constants';

export const TOKEN_KEY = 'toko_token';
export const ROLE_KEY = 'toko_role';
export const USER_KEY = 'toko_user';
export const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const EMPTY_MEDIA = new Set(['', 'null', 'undefined', 'default.jpg', 'default-logo.jpg']);

export const PLACEHOLDER_IMAGE = '/placeholder.png';
export const LABEL_SEMUA = 'Semua';

// --- FORMATTER ---

export function formatRupiah(n) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(Number(n) || 0);
}

export function formatTanggal(iso) {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return String(iso);
  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function formatTanggalWaktu(iso) {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return String(iso);
  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function toDateInputValue(value) {
  if (value == null || value === '') return '';
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().slice(0, 10);
  }
  const s = String(value).trim();
  const iso = s.match(/^(\d{4}-\d{2}-\d{2})/);
  if (iso) return iso[1];
  const d = new Date(s);
  if (!Number.isNaN(d.getTime())) return d.toISOString().slice(0, 10);
  return '';
}

export function jamOperasional(jamBuka, jamTutup) {
  if (!jamBuka || !jamTutup) return '';
  const formatJam = (j) => (String(j).includes(':') ? j : `${j}:00`);
  return `${formatJam(jamBuka)} – ${formatJam(jamTutup)} WIB`;
}

// --- MEDIA & GAMBAR ---

/** true jika path DB punya gambar upload yang valid (bukan kosong / default). */
export function hasMedia(path) {
  if (path == null) return false;
  const p = String(path).trim().toLowerCase();
  return p !== '' && !EMPTY_MEDIA.has(p);
}

/**
 * URL untuk <img src>:
 * - kosong / default.jpg / null → /placeholder.png
 * - http(s) / data: / blob: → apa adanya
 * - /uploads/... atau filename → digabung API_BASE
 */
export function mediaUrl(path) {
  if (!hasMedia(path)) return PLACEHOLDER_IMAGE;
  let p = String(path).trim().replace(/\\/g, '/');

  if (
    p.startsWith('http://') ||
    p.startsWith('https://') ||
    p.startsWith('data:') ||
    p.startsWith('blob:')
  ) {
    return p;
  }

  // Path relatif ke backend (upload)
  if (p.startsWith('/uploads')) return `${API_BASE}${p}`;
  if (p.startsWith('uploads/')) return `${API_BASE}/${p}`;
  // Hanya nama file
  if (p.includes('/')) {
    // path seperti images/xxx.jpg
    return `${API_BASE}/uploads/${p.replace(/^\/?uploads\//, '')}`;
  }
  return `${API_BASE}/uploads/images/${p}`;
}

/** Jika file upload 404/rusak, ganti ke placeholder (pakai di onError). */
export function onImgError(e) {
  const el = e.currentTarget;
  if (el.dataset.ph === '1') return;
  el.dataset.ph = '1';
  el.src = PLACEHOLDER_IMAGE;
}

// --- PRODUK & KATEGORI ---

export function kategoriDariProduk(produk = []) {
  const set = new Set();
  for (const p of produk) {
    if (p.kategori) set.add(p.kategori);
  }
  return [...set].sort((a, b) => a.localeCompare(b, 'id'));
}

export function produkPerKategori(produk = []) {
  const map = new Map();
  for (const p of produk) {
    if (p.kategori && !map.has(p.kategori)) map.set(p.kategori, p);
  }
  return [...map.entries()].map(([kategori, item]) => ({ kategori, produk: item }));
}

export function kategoriGridData(produk = [], limit = 3) {
  return produkPerKategori(produk)
    .slice(0, limit)
    .map(({ kategori, produk: item }) => ({
      kategori,
      produk: item,
      jumlah: produk.filter((p) => p.kategori === kategori).length,
    }));
}

export function belanjaUrl(idProduk) {
  return `/akun/belanja?produk=${idProduk}`;
}

export function taglineBeranda(info, kategoriList = []) {
  const tentang = String(info?.tentang || '').trim();
  if (tentang) return tentang;
  const nama = info?.nama_toko || 'Toko kami';
  if (kategoriList.length >= 2) {
    const cats = kategoriList.slice(0, 3).join(', ');
    const sisa = kategoriList.length > 3 ? ', dan produk lainnya' : '';
    return `${nama} menyediakan ${cats}${sisa} — pilihan lengkap, kualitas terbaik.`;
  }
  return `${nama} menyediakan berbagai produk segar dan berkualitas.`;
}

// --- SESI, AUTENTIKASI & USER ---

/** Mengambil token login (pencarian fallback 'toko_token' dan 'token') */
export function getToken() {
  return localStorage.getItem(TOKEN_KEY) || localStorage.getItem('token');
}

export function getRole() {
  return localStorage.getItem(ROLE_KEY);
}

export function getUser() {
  try {
    const u = localStorage.getItem(USER_KEY);
    return u ? JSON.parse(u) : null;
  } catch {
    return null;
  }
}

export function saveSession(token, role, user = null) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem('token', token); // Sinkronisasi key fallback
  localStorage.setItem(ROLE_KEY, role);
  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem('token');
  localStorage.removeItem(ROLE_KEY);
  localStorage.removeItem(USER_KEY);
}

export function isLoggedIn() {
  return Boolean(getToken());
}

export function isAdmin() {
  return getRole() === 'admin';
}

export function isPembeli() {
  return getRole() === 'pembeli';
}

// --- PROFIL & FORM ---

export function normalizeKelamin(value) {
  const s = String(value || '').trim();
  if (s === 'L') return 'Laki-laki';
  if (s === 'P') return 'Perempuan';
  if (KELAMIN.includes(s)) return s;
  return KELAMIN[0];
}

export function buildProfilePayload(form) {
  const { passwd_lama, passwd, passwd_confirm, ...profile } = form;
  const payload = { ...profile };
  const newPass = String(passwd || '').trim();
  if (!newPass) return payload;
  if (!String(passwd_lama || '').trim()) {
    throw new Error('Password lama wajib diisi untuk mengganti password.');
  }
  if (newPass.length < 6) throw new Error('Password baru minimal 6 karakter.');
  if (newPass !== String(passwd_confirm || '').trim()) {
    throw new Error('Konfirmasi password baru tidak cocok.');
  }
  payload.passwd = newPass;
  payload.passwd_lama = passwd_lama;
  return payload;
}

export const emptyPasswordFields = {
  passwd_lama: '',
  passwd: '',
  passwd_confirm: '',
};

// --- HELPER TRANSAKSI & UTILITY ---

/** Class badge warna Tailwind berdasarkan status pesanan */
export function getStatusBadgeClass(status) {
  switch (String(status).toLowerCase()) {
    case 'selesai':
    case 'diterima':
    case 'dibayar':
      return 'bg-green-100 text-green-800 border-green-300';
    case 'dikirim':
    case 'dikemas':
      return 'bg-blue-100 text-blue-800 border-blue-300';
    case 'pending':
    case 'tertunda':
    case 'belum':
      return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    case 'batal':
    case 'dibatalkan':
      return 'bg-red-100 text-red-800 border-red-300';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-300';
  }
}

/** Format nomor telepon/WA ke standar 62... */
export function formatNoHP(phone) {
  if (!phone) return '';
  let str = String(phone).replace(/\D/g, '');
  if (str.startsWith('0')) {
    str = '62' + str.slice(1);
  }
  return str;
}