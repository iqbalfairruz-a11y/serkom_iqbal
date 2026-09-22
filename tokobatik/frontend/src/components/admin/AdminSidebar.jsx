import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../AuthContext";
import { SITE } from "../../constants";

const menu = [
  { to: "/admin", end: true, label: "Dashboard", icon: "▦" },
  { to: "/admin/produk", label: "Produk", icon: "▣" },
  { to: "/admin/kategori", label: "Kategori", icon: "▤" },
  { to: "/admin/pembeli", label: "Pembeli", icon: "◎" },
  { to: "/admin/pembelian", label: "Pesanan", icon: "☰" },
  { to: "/admin/artikel", label: "Artikel", icon: "▤" },
  { to: "/admin/laporan", label: "Laporan", icon: "▥" },
  { to: "/admin/profil", label: "Profil Saya", icon: "☺" },
];

export default function AdminSidebar() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    if (window.confirm("Yakin ingin keluar?")) {
      logout();
      navigate("/login");
    }
  };

  return (
    <aside
      className="d-flex flex-column text-white"
      style={{
        width: 240,
        minHeight: "100vh",
        backgroundColor: "#1a1a1a",
        flexShrink: 0,
      }}
    >
      <div className="px-3 py-4 d-flex align-items-center gap-2 border-bottom border-secondary border-opacity-25">
        <div
          className="rounded-2 d-flex align-items-center justify-content-center bg-white text-dark fw-bold"
          style={{ width: 40, height: 40, fontSize: 16 }}
        >
          BN
        </div>
        <div>
          <div className="fw-bold" style={{ fontSize: "0.95rem" }}>
            Panel Admin
          </div>
          <div className="text-white-50" style={{ fontSize: "0.75rem" }}>
            {SITE.nama_toko || "Batik Nusantara"}
          </div>
        </div>
      </div>

      <nav className="flex-grow-1 py-3">
        <ul className="nav flex-column gap-1 px-2">
          {menu.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `nav-link d-flex align-items-center gap-2 px-3 py-2 rounded-2 ${
                    isActive
                      ? "text-white fw-medium"
                      : "text-white-50"
                  }`
                }
                style={({ isActive }) => ({
                  fontSize: "0.9rem",
                  backgroundColor: isActive ? "rgba(255,255,255,0.12)" : "transparent",
                })}
              >
                <span style={{ width: 18, textAlign: "center", opacity: 0.85 }}>
                  {item.icon}
                </span>
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="px-3 py-3 border-top border-secondary border-opacity-25">
        <NavLink
          to="/"
          className="d-block text-white-50 text-decoration-none small mb-2"
        >
          Lihat beranda
        </NavLink>
        <button
          type="button"
          onClick={handleLogout}
          className="btn btn-link text-warning text-decoration-none fw-bold small p-0"
        >
          Keluar
        </button>
      </div>
    </aside>
  );
}
