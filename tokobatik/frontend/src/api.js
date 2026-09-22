/**
 * api.js — semua pemanggilan HTTP ke backend.
 * Publik: api | Admin: adminApi | Pembeli: pembeliApi
 */
import { API_BASE, getToken } from './utils';

export { API_BASE };

/**
 * Mendapatkan header otentikasi Bearer Token
 */
export function authHeaders() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/**
 * Helper serbaguna untuk HTTP Request menggunakan fetch
 */
export async function apiRequest(path, options = {}) {
  // Hindari double slash (//) pada URL
  const baseUrl = (API_BASE || '').replace(/\/$/, '');
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const url = path.startsWith('http') ? path : `${baseUrl}${cleanPath}`;

  const headers = {
    'Content-Type': 'application/json',
    ...authHeaders(),
    ...options.headers,
  };

  // Jika body berupa FormData, hapus Content-Type agar browser menyisipkan boundary secara otomatis
  if (options.body instanceof FormData) {
    delete headers['Content-Type'];
  }

  let res;
  try {
    res = await fetch(url, { ...options, headers });
  } catch {
    throw new Error(
      'Backend tidak terhubung. Buka terminal folder backend, lalu jalankan: npm run dev (port 5000).'
    );
  }

  const body = await res.json().catch(() => ({}));

  if (!res.ok) {
    const message = body.message || body.error || `Permintaan gagal (${res.status})`;
    const err = new Error(message);
    err.status = res.status;
    err.body = body;
    // Tambahkan struktur err.response agar kompatibel dengan Axios-style error handling
    err.response = {
      status: res.status,
      data: body,
    };
    throw err;
  }

  return body;
}

/**
 * Helper untuk unggah file/gambar menggunakan Multipart FormData
 */
async function uploadGambar(endpoint, file, fieldName = 'gambar') {
  if (!file) {
    throw new Error('Tidak ada file yang dipilih untuk diunggah.');
  }

  const baseUrl = (API_BASE || '').replace(/\/$/, '');
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${baseUrl}${cleanEndpoint}`;

  const fd = new FormData();
  fd.append(fieldName, file);

  let res;
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: authHeaders(),
      body: fd,
    });
  } catch {
    throw new Error('Backend tidak terhubung. Buka terminal folder backend, lalu jalankan: npm run dev.');
  }

  const body = await res.json().catch(() => ({}));

  if (!res.ok) {
    const message = body.message || body.error || 'Upload gambar gagal';
    const err = new Error(message);
    err.status = res.status;
    err.body = body;
    err.response = {
      status: res.status,
      data: body,
    };
    throw err;
  }

  return body;
}

/** API publik + login/register */
export const api = {
  getKategori: () => apiRequest('/api/users/kategori'),
  getProduk: () => apiRequest('/api/users/produk'),
  getProdukById: (id) => apiRequest(`/api/users/produk/${id}`),
  getArtikel: () => apiRequest('/api/users/artikel'),
  getArtikelById: (id) => apiRequest(`/api/users/artikel/${id}`),
  login: (payload) =>
    apiRequest('/api/users/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  register: (payload) =>
    apiRequest('/api/users/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  getPembeliMe: () => apiRequest('/api/users/me'),
  getAdminMe: () => apiRequest('/api/admin/me'),
};

/** API panel admin */
export const adminApi = {
  getStats: () => apiRequest('/api/admin/stats'),
  getMe: () => apiRequest('/api/admin/me'),
  putMe: (payload) =>
    apiRequest('/api/admin/me', { method: 'PUT', body: JSON.stringify(payload) }),
  changePassword: (payload) =>
    apiRequest('/api/admin/change-password', { method: 'PUT', body: JSON.stringify(payload) }),
  
  // Endpoint CRUD Pembeli
  getPembeli: () => apiRequest('/api/admin/pembeli'),
  getPembeliById: (id) => apiRequest(`/api/admin/pembeli/${id}`),
  createPembeli: (payload) =>
    apiRequest('/api/admin/pembeli', { method: 'POST', body: JSON.stringify(payload) }),
  updatePembeli: (id, payload) =>
    apiRequest(`/api/admin/pembeli/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  deletePembeli: (id) => apiRequest(`/api/admin/pembeli/${id}`, { method: 'DELETE' }),

  // Endpoint Users Fallback
  getUsers: (role) => apiRequest(`/api/admin/users${role ? `?role=${role}` : ''}`),
  getUser: (id) => apiRequest(`/api/admin/users/${id}`),
  createUser: (payload) =>
    apiRequest('/api/admin/users', { method: 'POST', body: JSON.stringify(payload) }),
  updateUser: (id, payload) =>
    apiRequest(`/api/admin/users/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  deleteUser: (id) => apiRequest(`/api/admin/users/${id}`, { method: 'DELETE' }),

  getKategori: () => apiRequest('/api/admin/kategori'),
  createKategori: (payload) => apiRequest('/api/admin/kategori', { method: 'POST', body: JSON.stringify(payload) }),
  updateKategori: (id, payload) => apiRequest(`/api/admin/kategori/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  deleteKategori: (id) => apiRequest(`/api/admin/kategori/${id}`, { method: 'DELETE' }),
  getProduk: () => apiRequest('/api/admin/produk'),
  getProdukById: (id) => apiRequest(`/api/admin/produk/${id}`),
  createProduk: (payload) =>
    apiRequest('/api/admin/produk', { method: 'POST', body: JSON.stringify(payload) }),
  updateProduk: (id, payload) =>
    apiRequest(`/api/admin/produk/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  deleteProduk: (id) => apiRequest(`/api/admin/produk/${id}`, { method: 'DELETE' }),

  getPembelian: () => apiRequest('/api/admin/pembelian'),
  getPembelianById: (id) => apiRequest(`/api/admin/pembelian/${id}`),
  updatePembelian: (id, payload) =>
    apiRequest(`/api/admin/pembelian/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  deletePembelian: (id) => apiRequest(`/api/admin/pembelian/${id}`, { method: 'DELETE' }),

  getArtikel: () => apiRequest('/api/admin/artikel'),
  getArtikelById: (id) => apiRequest(`/api/admin/artikel/${id}`),
  createArtikel: (payload) =>
    apiRequest('/api/admin/artikel', { method: 'POST', body: JSON.stringify(payload) }),
  updateArtikel: (id, payload) =>
    apiRequest(`/api/admin/artikel/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  deleteArtikel: (id) => apiRequest(`/api/admin/artikel/${id}`, { method: 'DELETE' }),

  uploadGambar: (file, fieldName = 'gambar') => uploadGambar('/api/admin/upload-gambar', file, fieldName),
};

/** API area pembeli */
export const pembeliApi = {
  getDashboard: () => apiRequest('/api/users/dashboard'),
  getMe: () => apiRequest('/api/users/me'),
  putMe: (payload) =>
    apiRequest('/api/users/me', { method: 'PUT', body: JSON.stringify(payload) }),
  changePassword: (payload) =>
    apiRequest('/api/users/change-password', { method: 'PUT', body: JSON.stringify(payload) }),
  getProduk: () => apiRequest('/api/users/produk'),
  getProdukById: (id) => apiRequest(`/api/users/produk/${id}`),
  getPembelian: () => apiRequest('/api/users/pembelian'),
  getPembelianById: (id) => apiRequest(`/api/users/pembelian/${id}`),
  createPembelian: (payload) =>
    apiRequest('/api/users/pembelian', { method: 'POST', body: JSON.stringify(payload) }),
  uploadGambar: (file, fieldName = 'gambar') => uploadGambar('/api/users/upload-gambar', file, fieldName),
};