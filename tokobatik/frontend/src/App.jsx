import React from "react";
import { Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import TokoPage from "./pages/TokoPage";
import ArtikelPage from "./pages/ArtikelPage";
import ProdukDetailPage from "./pages/ProdukDetailPage"; 
import ArtikelDetailPage from "./pages/ArtikelDetailPage";
import CheckoutPage from "./pages/CheckoutPage"; 

// IMPORT UNTUK PEMBELI STANDALONE
import PembeliDashboardPage from "./pages/pembeli/PembeliDashboardPage";
import PembeliProfilPage from "./pages/pembeli/PembeliProfilPage"; 
import PembeliUbahPasswordPage from "./pages/pembeli/PembeliUbahPasswordPage";
import PembeliTransaksiPage from "./pages/pembeli/PembeliTransaksiPage";
import PembeliKeranjangPage from "./pages/pembeli/PembeliKeranjangPage";

// Import Layout dan Page Admin
import AdminLayout from "./components/AdminLayout";
import AdminOverviewPage from "./pages/admin/AdminOverviewPage";
import AdminProdukPage from "./pages/admin/AdminProdukPage";
import AdminProfilPage from "./pages/admin/AdminProfilPage";
import AdminPembeliPage from "./pages/admin/AdminPembeliPage";
import AdminPembelianPage from "./pages/admin/AdminPembelianPage";
import AdminArtikelPage from "./pages/admin/AdminArtikelPage";
import AdminLaporanPage from "./pages/admin/AdminLaporanPage";
import AdminKategoriPage from "./pages/admin/AdminKategoriPage";
export default function App() {
  return (
    <Routes>
      {/* ROUTE ADMIN (Tanpa Header/Footer Publik) */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminOverviewPage />} />
        <Route path="produk" element={<AdminProdukPage />} />
        <Route path="kategori" element={<AdminKategoriPage />} />
        <Route path="pembeli" element={<AdminPembeliPage />} />
        <Route path="pembelian" element={<AdminPembelianPage />} />
        <Route path="artikel" element={<AdminArtikelPage />} />
        <Route path="laporan" element={<AdminLaporanPage />} />
        <Route path="profil" element={<AdminProfilPage />} />
</Route>

      {/* ROUTE PEMBELI STANDALONE (Tanpa Header/Footer Publik) */}
      <Route path="/dashboard" element={<PembeliDashboardPage />} />
      <Route path="/profil" element={<PembeliProfilPage />} />
      <Route path="/ubah-password" element={<PembeliUbahPasswordPage />} />
      <Route path="/transaksi" element={<PembeliTransaksiPage />} />
      <Route path="/keranjang" element={<PembeliKeranjangPage />} />

      {/* ROUTE PUBLIK (Dengan Header & Footer) */}
      <Route
        path="*"
        element={
          <div className="d-flex flex-column min-vh-100">
            <Header />
            <main className="flex-grow-1">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/toko" element={<TokoPage />} />
                <Route path="/toko/:id" element={<ProdukDetailPage />} />
                <Route path="/produk/:id" element={<ProdukDetailPage />} />
                <Route path="/artikel" element={<ArtikelPage />} />
                <Route path="/artikel/:id" element={<ArtikelDetailPage />} />
                <Route path="/checkout/:id" element={<CheckoutPage />} />
              </Routes>
            </main>
            <Footer />
          </div>
        }
      />
    </Routes>
  );
}