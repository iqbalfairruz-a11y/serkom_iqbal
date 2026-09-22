import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { SITE } from "../constants";
import { mediaUrl } from "../utils";

const menu = [
  { to: "/dashboard", end: true, label: "Dashboard" },
  { to: "/keranjang", label: "Keranjang" },
  { to: "/transaksi", label: "Transaksi" },
  { to: "/toko", label: "Belanja" },
  { to: "/profil", label: "Profil Saya" },
];

export default function PembeliSidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const displayName =
    [user?.nama_d, user?.nama_b].filter(Boolean).join(" ") ||
    user?.uname ||
    user?.credential ||
    "Pembeli";

  const initial = (displayName || "P").charAt(0).toUpperCase();
  const foto = user?.foto ? mediaUrl(user.foto) : null;

  const handleLogout = () => {
    if (window.confirm("Yakin ingin keluar?")) {
      logout();
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/login");
    }
  };

  return (
    <aside
      className="d-flex flex-column text-white"
      style={{
        width: 240,
        minHeight: "100vh",
        backgroundColor: "#111827",
        flexShrink: 0,
      }}
    >
      {/* User card */}
      <div className="px-3 py-4 d-flex align-items-center gap-3 border-bottom border-secondary border-opacity-25">
        {foto ? (
          <img
            src={foto}
            alt=""
            className="rounded-circle"
            style={{ width: 44, height: 44, objectFit: "cover" }}
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        ) : (
          <div
            className="rounded-circle d-flex align-items-center justify-content-center fw-bold"
            style={{
              width: 44,
              height: 44,
              backgroundColor: "#374151",
              fontSize: 16,
            }}
          >
            {initial}
          </div>
        )}
        <div className="overflow-hidden">
          <div className="fw-bold text-truncate" style={{ fontSize: "0.95rem" }}>
            {displayName}
          </div>
          <div className="text-white-50 text-truncate" style={{ fontSize: "0.72rem" }}>
            {SITE.nama_toko || "Batik Nusantara"} · Pembeli
          </div>
        </div>
      </div>

      <nav className="flex-grow-1 py-3 px-2">
        <ul className="nav flex-column gap-1">
          {menu.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `nav-link px-3 py-2 rounded-3 ${
                    isActive ? "text-white fw-medium" : "text-white-50"
                  }`
                }
                style={({ isActive }) => ({
                  fontSize: "0.9rem",
                  backgroundColor: isActive ? "rgba(255,255,255,0.12)" : "transparent",
                })}
              >
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="px-3 py-3 border-top border-secondary border-opacity-25">
        <NavLink to="/" className="d-block text-white-50 text-decoration-none small mb-2">
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
