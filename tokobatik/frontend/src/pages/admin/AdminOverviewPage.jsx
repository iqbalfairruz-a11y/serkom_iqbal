import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { adminApi } from "../../api";
import { formatRupiah, formatTanggal } from "../../utils";

function StatCard({ label, value, borderColor, sub }) {
  return (
    <div className="col-6 col-md-3">
      <div
        className="card border-0 shadow-sm h-100 bg-white"
        style={{
          borderLeft: `3px solid ${borderColor}`,
          borderRadius: 4,
        }}
      >
        <div className="card-body py-3 px-3">
          <small
            className="text-secondary fw-bold d-block text-uppercase"
            style={{ fontSize: "0.68rem", letterSpacing: "0.5px" }}
          >
            {label}
          </small>
          <div className="fw-bold mt-2 mb-0 text-dark" style={{ fontSize: "1.65rem", lineHeight: 1.2 }}>
            {value}
          </div>
          {sub && (
            <small className="text-muted" style={{ fontSize: "0.72rem" }}>
              {sub}
            </small>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AdminOverviewPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    pembeli: 0,
    transaksi: 0,
    produk: 0,
    terjual: 0,
    artikel: 0,
    pesanKontak: 0,
    pesananAktif: 0,
    belumDibayar: 0,
    pendapatan: 0,
  });
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);

      let localProduk = 0;
      let localArtikel = 0;
      let localKontak = 0;
      try {
        localProduk = JSON.parse(localStorage.getItem("dataProdukToko") || "[]").length || 0;
      } catch { /* */ }
      try {
        localArtikel = JSON.parse(localStorage.getItem("dataArtikelToko") || "[]").length || 0;
      } catch { /* */ }
      try {
        localKontak = JSON.parse(localStorage.getItem("dataPesanKontak") || "[]").length || 0;
      } catch { /* */ }

      let next = {
        pembeli: 0,
        transaksi: 0,
        produk: localProduk,
        terjual: 0,
        artikel: localArtikel,
        pesanKontak: localKontak,
        pesananAktif: 0,
        belumDibayar: 0,
        pendapatan: 0,
      };
      let recentList = [];

      try {
        const res = await adminApi.getStats();
        const s = res?.stats || {};
        const apiProduk = Number(s.total_produk || 0);
        const apiArtikel = Number(s.total_artikel || 0);
        const apiPembeli = Number(s.total_pembeli || 0);
        const apiTransaksi = Number(s.total_transaksi_all || 0);
        const pendapatan = Number(s.pendapatan_total || 0);

        next = {
          ...next,
          pembeli: apiPembeli || next.pembeli,
          transaksi: apiTransaksi,
          produk: Math.max(apiProduk, localProduk),
          terjual: apiTransaksi,
          artikel: Math.max(apiArtikel, localArtikel),
          pendapatan,
        };

        // Hitung status dari list pembelian
        try {
          const list = await adminApi.getPembelian();
          const rows = Array.isArray(list) ? list : [];
          recentList = rows.slice(0, 5);
          const aktif = rows.filter((r) =>
            ["Pending", "Dikonfirmasi", "Dikirim", "Tertunda", "Dikemas"].includes(r.status)
          ).length;
          const belum = rows.filter(
            (r) =>
              r.status === "Pending" ||
              r.pembayaran === "Belum" ||
              !r.pembayaran
          ).length;
          next.pesananAktif = aktif;
          next.belumDibayar = belum;
          next.transaksi = rows.length || next.transaksi;
          next.terjual = rows.length || next.terjual;
        } catch { /* */ }

        if (Array.isArray(res?.recentPembelian) && res.recentPembelian.length) {
          recentList = res.recentPembelian;
        }
      } catch (err) {
        console.warn("Stats API gagal, pakai data lokal:", err.message);
        try {
          const list = await adminApi.getPembeli();
          next.pembeli = Array.isArray(list) ? list.length : 0;
        } catch { /* */ }
        try {
          const list = await adminApi.getProduk();
          const n = Array.isArray(list) ? list.length : 0;
          next.produk = Math.max(n, localProduk);
        } catch { /* */ }
        try {
          const list = await adminApi.getArtikel();
          const n = Array.isArray(list) ? list.length : 0;
          next.artikel = Math.max(n, localArtikel);
        } catch { /* */ }
      }

      setStats(next);
      setRecent(recentList);
      setLoading(false);
    }
    load();
  }, []);

  return (
    <div>
      {loading ? (
        <div className="text-center py-5 text-secondary">
          <div className="spinner-border spinner-border-sm text-secondary me-2" role="status" />
          Memuat statistik...
        </div>
      ) : (
        <>
          <div className="row g-3 mb-3">
            <StatCard label="Pembeli Terdaftar" value={stats.pembeli} borderColor="#ffc107" />
            <StatCard label="Total Transaksi" value={stats.transaksi} borderColor="#343a40" />
            <StatCard label="Produk di Katalog" value={stats.produk} borderColor="#ffc107" />
            <StatCard
              label="Produk Terjual"
              value={stats.terjual}
              borderColor="#ffc107"
              sub="Jumlah pesanan"
            />
          </div>

          <div className="row g-3 mb-4">
            <StatCard label="Artikel" value={stats.artikel} borderColor="#ffc107" />
            <StatCard label="Pesan Kontak" value={stats.pesanKontak} borderColor="#343a40" />
            <StatCard label="Pesanan Aktif" value={stats.pesananAktif} borderColor="#dc3545" />
            <StatCard label="Belum Dibayar" value={stats.belumDibayar} borderColor="#dc3545" />
          </div>

          <div className="card border-0 shadow-sm mb-4 bg-white" style={{ borderRadius: 4 }}>
            <div className="card-body p-4 d-flex justify-content-between align-items-center flex-wrap gap-2">
              <div>
                <h6 className="fw-bold mb-1 text-dark">Pendapatan (dibayar)</h6>
                <p className="text-secondary small mb-0">
                  Total dari pesanan dengan status pembayaran &quot;Dibayar&quot;.
                </p>
              </div>
              <div className="fw-bold" style={{ fontSize: "1.5rem", color: "#e6a817" }}>
                {formatRupiah(stats.pendapatan)}
              </div>
            </div>
          </div>

          <div className="card border-0 shadow-sm mb-4 bg-white" style={{ borderRadius: 4 }}>
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="fw-bold mb-0 text-dark">Transaksi terbaru</h6>
                <Link
                  to="/admin/pembelian"
                  className="btn btn-sm btn-outline-secondary"
                  style={{ borderRadius: 4 }}
                >
                  Lihat semua
                </Link>
              </div>

              {recent.length === 0 ? (
                <p className="text-secondary small mb-0">Belum ada pesanan.</p>
              ) : (
                <div className="table-responsive">
                  <table className="table table-sm align-middle mb-0">
                    <thead>
                      <tr className="text-secondary small">
                        <th>ID</th>
                        <th>Pembeli</th>
                        <th>Total</th>
                        <th>Status</th>
                        <th>Tanggal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recent.map((row) => (
                        <tr key={row.id_pembelian || row.id}>
                          <td className="small">#{row.id_pembelian || row.id}</td>
                          <td className="small">
                            {[row.nama_d, row.nama_b].filter(Boolean).join(" ") ||
                              row.email ||
                              `Pembeli #${row.id_pembeli}`}
                          </td>
                          <td className="small fw-medium">{formatRupiah(row.total_harga)}</td>
                          <td>
                            <span className="badge bg-light text-dark border">
                              {row.status || "Pending"}
                            </span>
                          </td>
                          <td className="small text-secondary">
                            {formatTanggal(row.created_at)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          <div className="d-flex flex-wrap gap-2">
            <button
              type="button"
              className="btn bg-white border shadow-sm fw-medium px-3 text-dark"
              style={{ borderRadius: 4 }}
              onClick={() => navigate("/admin/produk")}
            >
              + Tambah produk
            </button>
            <button
              type="button"
              className="btn bg-white border shadow-sm fw-medium px-3 text-dark"
              style={{ borderRadius: 4 }}
              onClick={() => navigate("/admin/artikel")}
            >
              + Tulis artikel
            </button>
            <button
              type="button"
              className="btn bg-white border shadow-sm fw-medium px-3 text-dark"
              style={{ borderRadius: 4 }}
              onClick={() => navigate("/admin/info-toko")}
            >
              Atur info toko
            </button>
          </div>
        </>
      )}
    </div>
  );
}
