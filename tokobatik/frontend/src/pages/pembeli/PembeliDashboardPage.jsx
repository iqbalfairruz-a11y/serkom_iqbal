import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../AuthContext";
import { pembeliApi } from "../../api";
import PembeliSidebar from "../../components/PembeliSidebar";
import { formatRupiah } from "../../utils";

function StatBox({ icon, label, value, sub }) {
  return (
    <div className="col-6 col-md-3">
      <div
        className="card border-0 shadow-sm h-100 bg-white"
        style={{ borderRadius: 12 }}
      >
        <div className="card-body p-3 p-md-4">
          <div className="d-flex align-items-center gap-2 mb-2 text-secondary" style={{ fontSize: "0.75rem", letterSpacing: "0.4px" }}>
            <span style={{ fontSize: "1rem" }}>{icon}</span>
            <span className="text-uppercase fw-semibold">{label}</span>
          </div>
          <div className="fw-bold text-dark" style={{ fontSize: "1.75rem", lineHeight: 1.2 }}>
            {value}
          </div>
          {sub && (
            <div className="text-muted mt-1" style={{ fontSize: "0.78rem" }}>
              {sub}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PembeliDashboardPage() {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [stats, setStats] = useState({
    total: 0,
    tertunda: 0,
    diproses: 0,
    selesai: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let role = user?.role;
    if (!role) {
      try {
        role = JSON.parse(localStorage.getItem("user") || "null")?.role;
      } catch { /* */ }
    }
    if (role === "admin") {
      navigate("/admin", { replace: true });
      return;
    }
    if (!token && !localStorage.getItem("token")) {
      navigate("/login", { replace: true });
      return;
    }

    async function load() {
      setLoading(true);
      try {
        const list = await pembeliApi.getPembelian();
        const rows = Array.isArray(list) ? list : list?.riwayat || [];
        const tertunda = rows.filter((r) =>
          ["Pending", "Tertunda", "Belum"].includes(r.status)
        ).length;
        const diproses = rows.filter((r) =>
          ["Dikonfirmasi", "Dikemas", "Dikirim", "Diproses"].includes(r.status)
        ).length;
        const selesai = rows.filter((r) =>
          ["Selesai", "Diterima"].includes(r.status)
        ).length;
        setStats({
          total: rows.length,
          tertunda,
          diproses,
          selesai,
        });
      } catch {
        try {
          const dash = await pembeliApi.getDashboard();
          setStats((s) => ({
            ...s,
            total: dash?.total_transaksi || 0,
          }));
        } catch { /* */ }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user, token, navigate]);

  const firstName =
    user?.nama_d ||
    user?.uname ||
    user?.credential ||
    (() => {
      try {
        return JSON.parse(localStorage.getItem("user") || "{}")?.nama_d ||
          JSON.parse(localStorage.getItem("user") || "{}")?.uname ||
          "Pembeli";
      } catch {
        return "Pembeli";
      }
    })();

  return (
    <div className="d-flex min-vh-100" style={{ backgroundColor: "#f3f4f6" }}>
      <PembeliSidebar />

      <div className="flex-grow-1 d-flex flex-column overflow-hidden">
        <header className="bg-white border-bottom px-4 py-3">
          <h4 className="fw-bold m-0 text-dark" style={{ fontSize: "1.25rem" }}>
            Dashboard
          </h4>
        </header>

        <main className="flex-grow-1 p-4 overflow-auto">
          {/* Greeting */}
          <div
            className="card border-0 shadow-sm mb-4 bg-white"
            style={{ borderRadius: 14 }}
          >
            <div className="card-body p-4">
              <h4 className="fw-bold mb-1 text-dark">
                Halo, {firstName}{" "}
                <span aria-hidden="true">👋</span>
              </h4>
              <p className="text-secondary mb-0" style={{ fontSize: "0.95rem" }}>
                Ringkasan pesanan & status belanja kamu di Batik Nusantara.
              </p>
            </div>
          </div>

          {/* Stats */}
          {loading ? (
            <div className="text-center text-secondary py-4">
              <div className="spinner-border spinner-border-sm me-2" role="status" />
              Memuat data...
            </div>
          ) : (
            <div className="row g-3 mb-4">
              <StatBox
                icon="🛒"
                label="Total Pesanan"
                value={stats.total}
                sub="Semua transaksi kamu"
              />
              <StatBox
                icon="⏳"
                label="Tertunda"
                value={stats.tertunda}
                sub="Menunggu diproses"
              />
              <StatBox
                icon="📦"
                label="Diproses"
                value={stats.diproses}
                sub="Dikemas / dikirim"
              />
              <StatBox
                icon="✓"
                label="Selesai"
                value={stats.selesai}
                sub="Pesanan selesai"
              />
            </div>
          )}

          {/* Aksi cepat */}
          <div
            className="card border-0 shadow-sm bg-white"
            style={{ borderRadius: 14 }}
          >
            <div className="card-body p-4">
              <h6 className="fw-bold mb-1 text-dark">Aksi cepat</h6>
              <p className="text-secondary small mb-3">
                Pesan produk favorit atau cek status pesanan terakhir.
              </p>
              <div className="d-flex flex-wrap gap-2">
                <Link
                  to="/toko"
                  className="btn btn-dark rounded-pill px-4 fw-medium"
                >
                  + Belanja sekarang
                </Link>
                <Link
                  to="/transaksi"
                  className="btn btn-outline-secondary rounded-pill px-4"
                >
                  Lihat transaksi
                </Link>
                <Link
                  to="/profil"
                  className="btn btn-outline-secondary rounded-pill px-4"
                >
                  Ubah profil
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
