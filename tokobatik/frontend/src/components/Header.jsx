import React from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";

export default function Header() {
  const navigate = useNavigate();
  const { user, token, logout } = useAuth();

  const role = user?.role || (() => {
    try {
      const u = JSON.parse(localStorage.getItem("user") || "null");
      return u?.role || null;
    } catch {
      return null;
    }
  })();

  const isLoggedIn = Boolean(token || localStorage.getItem("token"));
  const isAdmin = role === "admin";

  // Admin → /admin, Pembeli → /dashboard
  const dashboardPath = isAdmin ? "/admin" : "/dashboard";
  const dashboardLabel = isAdmin ? "Panel Admin" : "Dashboard";

  const handleLogout = () => {
    if (window.confirm("Apakah Anda yakin ingin keluar?")) {
      logout();
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("admin");
      navigate("/login");
    }
  };

  return (
    <header className="bg-white border-bottom sticky-top py-3">
      <div className="container d-flex justify-content-between align-items-center">
        <Link to="/" className="text-decoration-none d-inline-flex align-items-center">
          <img
            src="/logo-batik-nusantara.png"
            alt="Batik Nusantara"
            style={{ height: 42, width: "auto", maxWidth: 220, objectFit: "contain" }}
          />
        </Link>

        <nav className="d-flex align-items-center gap-4">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `text-decoration-none fw-medium ${
                isActive ? "text-dark fw-bold" : "text-muted"
              }`
            }
          >
            Beranda
          </NavLink>

          <NavLink
            to="/toko"
            className={({ isActive }) =>
              `text-decoration-none fw-medium ${
                isActive ? "text-dark fw-bold" : "text-muted"
              }`
            }
          >
            Toko
          </NavLink>

          <NavLink
            to="/artikel"
            className={({ isActive }) =>
              `text-decoration-none fw-medium ${
                isActive ? "text-dark fw-bold" : "text-muted"
              }`
            }
          >
            Artikel
          </NavLink>

          {isLoggedIn ? (
            <>
              <NavLink
                to={dashboardPath}
                className={({ isActive }) =>
                  `text-decoration-none fw-medium ${
                    isActive ? "text-dark fw-bold" : "text-muted"
                  }`
                }
              >
                {dashboardLabel}
              </NavLink>

              <button
                type="button"
                onClick={handleLogout}
                className="btn btn-outline-danger px-3 py-1 rounded-3 ms-2"
                style={{ fontSize: "14px" }}
              >
                Keluar
              </button>
            </>
          ) : (
            <div className="d-flex align-items-center gap-2 ms-2">
              <Link
                to="/register"
                className="btn btn-outline-secondary px-3 py-1 rounded-3"
                style={{ fontSize: "14px", borderColor: "#8B1E3F", color: "#8B1E3F" }}
              >
                Daftar
              </Link>
              <Link
                to="/login"
                className="btn text-white px-4 py-1 rounded-3"
                style={{ fontSize: "14px", backgroundColor: "#8B1E3F" }}
              >
                Masuk
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
