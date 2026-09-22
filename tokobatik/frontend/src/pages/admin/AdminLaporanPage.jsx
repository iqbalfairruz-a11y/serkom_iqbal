import React, { useEffect, useMemo, useState } from "react";
import { adminApi } from "../../api";
import { formatRupiah, formatTanggal } from "../../utils";
import PageHeader from "../../components/admin/PageHeader";
import LoadingBlock from "../../components/admin/LoadingBlock";

function extractList(res) {
  if (Array.isArray(res)) return res;
  if (res?.data && Array.isArray(res.data)) return res.data;
  if (res?.pembelian && Array.isArray(res.pembelian)) return res.pembelian;
  return [];
}

export default function AdminLaporanPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await adminApi.getPembelian();
        const list = extractList(res);
        setRows(list);
      } catch (err) {
        console.error(err);
        setError("Gagal memuat data transaksi untuk laporan.");
        setRows([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const summary = useMemo(() => {
    const totalTransaksi = rows.length;
    const selesai = rows.filter((r) =>
      ["Selesai", "Diterima", "selesai"].includes(String(r.status || ""))
    ).length;
    const pendapatan = rows
      .filter((r) => String(r.pembayaran || "").toLowerCase() === "dibayar" || ["Selesai", "Diterima"].includes(String(r.status || "")))
      .reduce((s, r) => s + Number(r.total_harga || 0), 0);
    const pending = rows.filter((r) =>
      ["Tertunda", "Pending", "Dikemas", ""].includes(String(r.status || ""))
    ).length;
    // group by product name if available
    const byProduk = {};
    rows.forEach((r) => {
      const key = r.nama_produk || r.produk || `Produk #${r.id_produk || "-"}`;
      if (!byProduk[key]) byProduk[key] = { nama: key, qty: 0, omzet: 0 };
      byProduk[key].qty += Number(r.jumlah || 1);
      byProduk[key].omzet += Number(r.total_harga || 0);
    });
    const topProduk = Object.values(byProduk).sort((a, b) => b.omzet - a.omzet).slice(0, 8);
    return { totalTransaksi, selesai, pendapatan, pending, topProduk };
  }, [rows]);

  return (
    <div className="p-4">
      <PageHeader title="Laporan Penjualan" subtitle="Ringkasan transaksi dan omzet toko" />

      {loading ? (
        <LoadingBlock />
      ) : error ? (
        <div className="alert alert-warning">{error}</div>
      ) : (
        <>
          <div className="row g-3 mb-4">
            <div className="col-6 col-md-3">
              <div className="card border-0 shadow-sm h-100" style={{ borderLeft: "4px solid #8B1E3F" }}>
                <div className="card-body">
                  <div className="text-secondary small">Total Transaksi</div>
                  <div className="fs-4 fw-bold">{summary.totalTransaksi}</div>
                </div>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="card border-0 shadow-sm h-100" style={{ borderLeft: "4px solid #198754" }}>
                <div className="card-body">
                  <div className="text-secondary small">Selesai / Diterima</div>
                  <div className="fs-4 fw-bold">{summary.selesai}</div>
                </div>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="card border-0 shadow-sm h-100" style={{ borderLeft: "4px solid #ffc107" }}>
                <div className="card-body">
                  <div className="text-secondary small">Pesanan Aktif</div>
                  <div className="fs-4 fw-bold">{summary.pending}</div>
                </div>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="card border-0 shadow-sm h-100" style={{ borderLeft: "4px solid #0d6efd" }}>
                <div className="card-body">
                  <div className="text-secondary small">Estimasi Pendapatan</div>
                  <div className="fs-5 fw-bold">{formatRupiah(summary.pendapatan)}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="row g-4">
            <div className="col-lg-5">
              <div className="card border-0 shadow-sm">
                <div className="card-header bg-white fw-bold">Produk Terlaris (berdasarkan omzet)</div>
                <div className="card-body p-0">
                  {summary.topProduk.length === 0 ? (
                    <p className="text-secondary p-3 mb-0">Belum ada data transaksi.</p>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-sm mb-0">
                        <thead className="table-light">
                          <tr>
                            <th>Produk</th>
                            <th className="text-end">Qty</th>
                            <th className="text-end">Omzet</th>
                          </tr>
                        </thead>
                        <tbody>
                          {summary.topProduk.map((p, i) => (
                            <tr key={i}>
                              <td>{p.nama}</td>
                              <td className="text-end">{p.qty}</td>
                              <td className="text-end">{formatRupiah(p.omzet)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="col-lg-7">
              <div className="card border-0 shadow-sm">
                <div className="card-header bg-white fw-bold">Detail Transaksi</div>
                <div className="card-body p-0">
                  {rows.length === 0 ? (
                    <p className="text-secondary p-3 mb-0">Belum ada transaksi.</p>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-hover mb-0 align-middle">
                        <thead className="table-light">
                          <tr>
                            <th>#</th>
                            <th>Tanggal</th>
                            <th>Produk / ID</th>
                            <th>Status</th>
                            <th>Bayar</th>
                            <th className="text-end">Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {rows.map((r, i) => (
                            <tr key={r.id || i}>
                              <td>{r.id || i + 1}</td>
                              <td className="small">{formatTanggal(r.created_at) || r.created_at || "-"}</td>
                              <td className="small">{r.nama_produk || r.id_produk || "-"}</td>
                              <td>
                                <span className="badge bg-secondary">{r.status || "-"}</span>
                              </td>
                              <td className="small">{r.pembayaran || "-"}</td>
                              <td className="text-end fw-medium">{formatRupiah(r.total_harga || 0)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
