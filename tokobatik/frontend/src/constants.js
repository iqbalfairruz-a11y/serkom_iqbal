/**
 * constants.js — info toko (SITE), menu publik, enum form.
 * Diubah menjadi Toko Batik Nusantara
 */

export const SITE = {
  logo_toko: '/logo-batik-nusantara.png',
  nama_toko: 'Batik Nusantara',
  tentang:
    'Menyediakan berbagai kain batik, pakaian batik, dan aksesoris berkualitas — dari batik tulis klasik hingga motif modern untuk gaya hidup Anda.',
  foto_banner: '',
  alamat_toko: 'Jl. Batik Raya No. 12, Solo, Jawa Tengah',
  email_toko: 'batiknusantara@gmail.com',
  tlp_toko: '628982112370',
  nama_bank_a: 'BCA',
  nama_bank_b: 'Mandiri',
  no_rek_a: '12465789',
  no_rek_b: '9876543210',
  jam_buka: '08:00',
  jam_tutup: '20:00',
  jam_operasional_label: '08:00 - 20:00 WIB',
  logo_wa: '',
  logo_ig: '',
  logo_fb: '',
  link_wa: 'https://wa.me/628982112370',
  link_ig: 'https://instagram.com/',
  link_fb: 'https://facebook.com/',
};

export const PUBLIC_NAV = [
  { to: '/', label: 'Beranda', end: true },
  { to: '/toko', label: 'Toko' },
  { to: '/artikel', label: 'Artikel' },
];

export const KELAMIN = ['Laki-laki', 'Perempuan'];
export const KATEGORI_PRODUK = ['Kain Batik', 'Pakaian Batik', 'Aksesoris'];
export const METODE_BAYAR = ['Bank Transfer', 'COD'];
export const SHIPPING = ['JNT Express', 'JNE'];
export const STATUS_PROSES = [
  'Pending',
  'Dikonfirmasi',
  'Dikemas',
  'Dikirim',
  'Diterima',
  'Selesai',
  'Dibatalkan',
];
export const STATUS_BAYAR = ['Belum', 'Dibayar'];
