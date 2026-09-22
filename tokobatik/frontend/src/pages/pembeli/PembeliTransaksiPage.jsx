import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../AuthContext";
import { pembeliApi } from "../../api";
import PembeliSidebar from "../../components/PembeliSidebar";
import { formatRupiah, formatTanggal } from "../../utils";

export default function PembeliTransaksiPage() {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token && !localStorage.getItem("token")) {
      navigate("/login", { replace: true });
      return;
    }
    if (user?.role === "admin") {
      navigate("/admin", { replace: true });
      return;
    }

    async function load() {
      setLoading(true);
      setError("");
      try {
        const res = await pembeliApi.getPembelian();
        setList(Array.isArray(res) ? res : []);
      } catch (err) {
        setError(err.message || "Gagal memuat transaksi.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user, token, navigate]);

  return (
    <div className="d-flex min-vh-100" style={{ backgroundColor: "#f3f4f6" }}>
      <PembeliSidebar />
      <div className="flex-grow-1 d-flex flex-column">
        <header className="bg-white border-bottom px-4 py-3">
          <h4 className="fw-bold m-0 text-dark" style={{ fontSize: "1.25rem" }}>
            Transaksi
          </h4>
        </header>
        <main className="flex-grow-1 p-4">
          {error && <div className="alert alert-danger py-2 small">{error}</div>}
          {loading ? (
            <div className="text-center text-secondary py-5">Memuat...</div>
          ) : list.length === 0 ? (
            <div className="card border-0 shadow-sm bg-white p-5 text-center" style={{ borderRadius: 14 }}>
              <p className="text-secondary mb-3">Belum ada transaksi.</p>
              <Link to="/toko" className="btn btn-dark rounded-pill px-4">
                Belanja sekarang
              </Link>
            </div>
          ) : (
            <div className="card border-0 shadow-sm bg-white" style={{ borderRadius: 14 }}>
              <div className="table-responsive">
                <table className="table align-middle mb-0">
                  <thead className="table-light">
                    <tr className="small text-secondary">
                      <th className="ps-3">ID</th>
                      <th>Total</th>
                      <th>Metode</th>
                      <th>Kurir</th>
                      <th>Status</th>
                      <th className="pe-3">Tanggal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {list.map((row) => (
                      <tr key={row.id_pembelian || row.id}>
                        <td className="ps-3 small">#{row.id_pembelian || row.id}</td>
                        <td className="small fw-medium">{formatRupiah(row.total_harga)}</td>
                        <td className="small">{row.metode_pembayaran || "-"}</td>
                        <td className="small">{row.kurir || "-"}</td>
                        <td>
                          <span className="badge bg-light text-dark border">
                            {row.status || "Pending"}
                          </span>
                        </td>
                        <td className="pe-3 small text-secondary">
                          {formatTanggal(row.created_at)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
