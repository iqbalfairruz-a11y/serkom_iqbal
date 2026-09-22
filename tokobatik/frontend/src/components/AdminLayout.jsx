import React, { useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import AdminSidebar from "./admin/AdminSidebar";
import { useAuth } from "../AuthContext";

const TITLE_MAP = {
  "/admin": "Dashboard",
  "/admin/produk": "Kelola Produk",
  "/admin/kategori": "Kelola Kategori",
  "/admin/pembeli": "Kelola Pembeli",
  "/admin/pembelian": "Kelola Pesanan",
  "/admin/artikel": "Kelola Artikel",
  "/admin/laporan": "Laporan Penjualan",
  "/admin/pesan-kontak": "Pesan Kontak",
  "/admin/info-toko": "Info Toko",
  "/admin/profil": "Profil Saya",
};

function getRole(user) {
  if (user?.role) return user.role;
  try {
    const u = JSON.parse(localStorage.getItem("user") || "null");
    return u?.role || null;
  } catch {
    return null;
  }
}

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, token, logout } = useAuth();
  const role = getRole(user);
  const hasToken = Boolean(token || localStorage.getItem("token"));

  useEffect(() => {
    if (!hasToken) {
      navigate("/login", { replace: true });
      return;
    }
    if (role && role !== "admin") {
      // Bukan admin → arahkan ke dashboard pembeli, jangan biarkan akses panel admin
      navigate("/dashboard", { replace: true });
    }
  }, [hasToken, role, navigate]);

  const title =
    TITLE_MAP[location.pathname] ||
    (location.pathname.startsWith("/admin/") ? "Panel Admin" : "Dashboard");

  const displayName =
    user?.nama_d || user?.uname || user?.email || "Admin Sistem";

  // Jangan render panel admin jika bukan admin
  if (!hasToken || (role && role !== "admin")) {
    return (
      <div className="d-flex min-vh-100 align-items-center justify-content-center text-secondary">
        Memuat...
      </div>
    );
  }

  return (
    <div className="d-flex min-vh-100" style={{ backgroundColor: "#f5f4ef" }}>
      <AdminSidebar />
      <div className="flex-grow-1 d-flex flex-column overflow-hidden">
        <header
          className="d-flex justify-content-between align-items-center px-4 py-3 bg-white border-bottom"
          style={{ borderColor: "#ebe9e0" }}
        >
          <h4 className="fw-bold m-0 text-dark" style={{ fontSize: "1.25rem" }}>
            {title}
          </h4>
          <div className="d-flex align-items-center gap-2">
            <div
              className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold"
              style={{
                width: 36,
                height: 36,
                backgroundColor: "#343a40",
                fontSize: 13,
              }}
            >
              {(displayName || "A").charAt(0).toUpperCase()}
            </div>
            <span className="fw-medium small text-dark d-none d-sm-inline">
              {displayName}
            </span>
          </div>
        </header>

        <main className="flex-grow-1 p-4 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
