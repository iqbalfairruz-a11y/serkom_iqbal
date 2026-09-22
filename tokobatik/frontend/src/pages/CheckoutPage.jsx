import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { api, pembeliApi } from "../api";
import { AuthContext } from "../AuthContext";
import { SITE, METODE_BAYAR, SHIPPING } from "../constants";
import { formatRupiah, mediaUrl } from "../utils";

const DEFAULT_IMAGE = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='300' height='200' viewBox='0 0 300 200'><rect width='100%' height='100%' fill='%23e9ecef'/><text x='50%' y='50%' font-family='sans-serif' font-size='14' fill='%236c757d' text-anchor='middle' dy='.3em'>Gambar Tidak Tersedia</text></svg>";

function getProdukId(item) {
  const rawId = item?.id_produk ?? item?.id ?? null;
  if (rawId === null || rawId === undefined) return null;
  
  const match = String(rawId).match(/(?:prod|local)-(\d+)$/);
  if (match) return parseInt(match[1], 10);
  
  const parsed = parseInt(rawId, 10);
  return isNaN(parsed) ? null : parsed;
}

function findProdukLocal(id) {
  try {
    const list = JSON.parse(localStorage.getItem("dataProdukToko") || "[]");
    if (!Array.isArray(list)) return null;

    let cleanId = id;
    const match = String(id).match(/(?:prod|local)-(\d+)$/);
    if (match) cleanId = parseInt(match[1], 10);

    const found = list.find(
      (p) => String(getProdukId(p)) === String(cleanId) || String(p.id) === String(cleanId)
    );
    if (found) return found;

    if (match) {
      const idx = parseInt(match[1], 10);
      if (idx >= 0 && idx < list.length) return list[idx];
    }
    return null;
  } catch {
    return null;
  }
}

export default function CheckoutPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token } = useContext(AuthContext);

  const [produk, setProduk] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [qty, setQty] = useState(1);
  const [form, setForm] = useState({
    metode_pembayaran: METODE_BAYAR[0],
    kurir: SHIPPING[0],
    alamat_pengiriman: "",
    catatan: "",
  });

  useEffect(() => {
    if (!token) {
      navigate("/login", { state: { from: `/checkout/${id}` } });
      return;
    }

    async function load() {
      setLoading(true);
      setError("");

      let cleanId = id;
      const matchId = String(id).match(/(?:prod|local)-(\d+)$/);
      if (matchId) cleanId = parseInt(matchId[1], 10);

      // LocalStorage check
      const local = findProdukLocal(id);
      if (local) {
        setProduk(local);
        setLoading(false);
        try {
          const me = await pembeliApi.getMe();
          if (me?.alamat) setForm((f) => ({ ...f, alamat_pengiriman: me.alamat }));
        } catch { /* ignore */ }
        return;
      }

      // API check
      try {
        const data = await api.getProdukById(cleanId);
        setProduk(data);
        try {
          const me = await pembeliApi.getMe();
          if (me?.alamat) setForm((f) => ({ ...f, alamat_pengiriman: me.alamat }));
        } catch { /* ignore */ }
      } catch (err) {
        try {
          const res = await api.getProduk();
          const list = Array.isArray(res) ? res : [];
          const found = list.find((p) => String(getProdukId(p)) === String(cleanId));
          setProduk(found || null);
          if (!found) setError("Produk tidak ditemukan di database.");
        } catch (e2) {
          setError(e2.message || "Gagal memuat produk.");
        }
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [id, token, navigate]);

  const harga = Number(produk?.harga || 0);
  const total = harga * qty;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.alamat_pengiriman.trim()) {
      setError("Alamat pengiriman wajib diisi.");
      return;
    }
    if (qty < 1) {
      setError("Jumlah minimal 1.");
      return;
    }

    setSubmitting(true);
    
    // Validasi ID Produk yang aman terhadap angka 0
    let finalProdukId = getProdukId(produk);
    if (finalProdukId === null || finalProdukId === undefined) {
      const match = String(id).match(/(?:prod|local)-(\d+)$/);
      if (match) {
        finalProdukId = parseInt(match[1], 10);
      } else {
        const parsedUrlId = parseInt(id, 10);
        if (!isNaN(parsedUrlId)) finalProdukId = parsedUrlId;
      }
    }

    if (finalProdukId === null || finalProdukId === undefined || isNaN(finalProdukId)) {
      setError("Gagal mendeteksi ID Produk. Pastikan Anda mengakses dari link produk yang benar.");
      setSubmitting(false);
      return;
    }

    const payload = {
      total_harga: total,
      metode_pembayaran: form.metode_pembayaran,
      kurir: form.kurir,
      alamat_pengiriman: form.alamat_pengiriman.trim(),
      catatan: form.catatan || undefined,
      id_produk: finalProdukId, 
      jumlah: qty,
    };

    try {
      await pembeliApi.createPembelian(payload);
      setSuccess(true);
    } catch (err) {
      // Simpan cadangan offline ke LocalStorage
      try {
        const key = "dataPesananLokal";
        const existing = JSON.parse(localStorage.getItem(key) || "[]");
        existing.unshift({
          id: `local-${Date.now()}`,
          ...payload,
          nama_produk: produk?.nama_produk || produk?.nama,
          status: "Pending",
          created_at: new Date().toISOString(),
          sumber: "lokal",
        });
        localStorage.setItem(key, JSON.stringify(existing));
      } catch { /* ignore */ }

      const msg = err.message || "Gagal membuat pesanan.";
      if (/tabel|table|schema|ER_NO/i.test(msg)) {
        setError("Database backend belum siap. Pesanan sementara disimpan secara lokal di browser Anda.");
        setSuccess(true);
      } else {
        setError(msg);
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-5 text-center text-secondary" style={{ minHeight: "50vh" }}>
        <div className="spinner-border text-secondary mb-3" role="status" />
        <p>Memuat checkout...</p>
      </div>
    );
  }

  if (success) {
    return (
      <div className="container py-5" style={{ minHeight: "60vh" }}>
        <div className="row justify-content-center">
          <div className="col-md-7 col-lg-6">
            <div className="card border-0 shadow-sm rounded-4 p-4 p-md-5 text-center">
              <div
                className="mx-auto mb-3 d-flex align-items-center justify-content-center rounded-circle"
                style={{ width: 64, height: 64, backgroundColor: "#d1e7dd" }}
              >
                <span style={{ fontSize: 28, color: "#0f5132" }}>✓</span>
              </div>
              <h3 className="fw-bold mb-2">Pesanan Berhasil Dibuat</h3>
              <p className="text-secondary mb-4">
                Terima kasih! Pesanan Anda sedang diproses. Status: <strong>Pending</strong>.
              </p>
              {form.metode_pembayaran === "Bank Transfer" && (
                <div className="alert alert-light border text-start small mb-4">
                  <strong>Transfer ke rekening:</strong>
                  <ul className="mb-0 mt-2">
                    <li>{SITE.nama_bank_a}: {SITE.no_rek_a}</li>
                    <li>{SITE.nama_bank_b}: {SITE.no_rek_b}</li>
                  </ul>
                  <p className="mb-0 mt-2 text-muted">
                    Total Bayar: <strong>{formatRupiah(total)}</strong>
                  </p>
                </div>
              )}
              <div className="d-flex gap-2 justify-content-center flex-wrap">
                <Link to="/toko" className="btn text-white rounded-pill px-4" style={{ backgroundColor: "#8B1E3F" }}>
                  Kembali ke Toko
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!produk) {
    return (
      <div className="container py-5 text-center" style={{ minHeight: "50vh" }}>
        <h4 className="mb-3">Produk tidak ditemukan</h4>
        <p className="text-secondary small mb-4">{error}</p>
        <Link to="/toko" className="btn btn-outline-secondary rounded-pill px-4">
          Kembali ke Toko
        </Link>
      </div>
    );
  }

  const namaProduk = produk.nama_produk || produk.nama || "Produk";
  const rawGambar = produk.gambar || produk.gambar_produk || produk.foto || produk.foto_produk || produk.image;
  const gambar = mediaUrl(rawGambar) || DEFAULT_IMAGE;

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-9">
          <Link to={`/toko/${getProdukId(produk) ?? id}`} className="text-decoration-none fw-medium mb-4 d-inline-block" style={{ color: "#8B1E3F" }}>
            &larr; Kembali ke Produk
          </Link>

          <h2 className="fw-bold mb-4">Checkout & Pembayaran</h2>

          {error && (
            <div className="alert alert-danger py-2 small" role="alert">
              {error}
            </div>
          )}

          <div className="row g-4">
            <div className="col-md-5">
              <div className="card border-0 shadow-sm rounded-4 overflow-hidden h-100">
                <div className="bg-light" style={{ height: 200 }}>
                  <img
                    src={gambar}
                    alt={namaProduk}
                    className="w-100 h-100"
                    style={{ objectFit: "cover" }}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = DEFAULT_IMAGE;
                    }}
                  />
                </div>
                <div className="card-body p-4">
                  <h5 className="fw-bold">{namaProduk}</h5>
                  {produk.kategori && (
                    <span className="badge rounded-pill mb-2" style={{ backgroundColor: "#e9ecef", color: "#8B1E3F" }}>
                      {produk.kategori}
                    </span>
                  )}
                  <p className="fw-bold mb-0" style={{ color: "#8B1E3F", fontSize: "1.25rem" }}>
                    {formatRupiah(harga)}
                  </p>
                </div>
              </div>
            </div>

            <div className="col-md-7">
              <div className="card border-0 shadow-sm rounded-4 p-4">
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="form-label fw-medium">Jumlah</label>
                    <div className="input-group" style={{ maxWidth: 160 }}>
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() => setQty((q) => Math.max(1, q - 1))}
                      >
                        −
                      </button>
                      <input
                        type="number"
                        className="form-control text-center"
                        min={1}
                        value={qty}
                        onChange={(e) => setQty(Math.max(1, parseInt(e.target.value, 10) || 1))}
                      />
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() => setQty((q) => q + 1)}
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-medium">Metode Pembayaran</label>
                    <select
                      name="metode_pembayaran"
                      className="form-select"
                      value={form.metode_pembayaran}
                      onChange={handleChange}
                    >
                      {METODE_BAYAR.map((m) => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>

                  {form.metode_pembayaran === "Bank Transfer" && (
                    <div className="alert alert-success border mb-3 py-3 small">
                      <div className="fw-semibold mb-2">Transfer ke rekening toko:</div>
                      <div className="d-flex flex-column gap-1">
                        <div>
                          <span className="text-secondary">{SITE.nama_bank_a}</span>
                          {" · "}
                          <strong className="user-select-all">{SITE.no_rek_a}</strong>
                          <span className="text-muted"> a.n. {SITE.nama_toko}</span>
                        </div>
                        <div>
                          <span className="text-secondary">{SITE.nama_bank_b}</span>
                          {" · "}
                          <strong className="user-select-all">{SITE.no_rek_b}</strong>
                          <span className="text-muted"> a.n. {SITE.nama_toko}</span>
                        </div>
                      </div>
                      <div className="text-muted mt-2 mb-0">
                        Setelah transfer, simpan bukti pembayaran. Pesanan akan dikonfirmasi oleh admin.
                      </div>
                    </div>
                  )}

                  <div className="mb-3">
                    <label className="form-label fw-medium">Kurir Pengiriman</label>
                    <select name="kurir" className="form-select" value={form.kurir} onChange={handleChange}>
                      {SHIPPING.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-medium">Alamat Pengiriman</label>
                    <textarea
                      name="alamat_pengiriman"
                      className="form-control"
                      rows={3}
                      required
                      value={form.alamat_pengiriman}
                      onChange={handleChange}
                      placeholder="Alamat lengkap penerima"
                    />
                  </div>

                  <div className="mb-4">
                    <label className="form-label fw-medium">Catatan (opsional)</label>
                    <input
                      name="catatan"
                      className="form-control"
                      value={form.catatan}
                      onChange={handleChange}
                      placeholder="Catatan untuk penjual"
                    />
                  </div>

                  <div className="d-flex justify-content-between align-items-center border-top pt-3 mb-3">
                    <span className="text-secondary">Total Bayar</span>
                    <span className="fw-bold fs-4" style={{ color: "#8B1E3F" }}>
                      {formatRupiah(total)}
                    </span>
                  </div>

                  <button
                    type="submit"
                    className="btn text-white w-100 rounded-pill py-2 fw-medium"
                    style={{ backgroundColor: "#8B1E3F" }}
                    disabled={submitting}
                  >
                    {submitting ? "Memproses..." : "Buat Pesanan"}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}