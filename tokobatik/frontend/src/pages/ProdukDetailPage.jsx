import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { api } from "../api";
import { formatRupiah, mediaUrl } from "../utils";

function getProdukId(item) {
  return item?.id_produk ?? item?.id ?? null;
}

function findLocal(id) {
  try {
    const list = JSON.parse(localStorage.getItem("dataProdukToko") || "[]");
    if (!Array.isArray(list)) return null;
    const found = list.find(
      (p) => String(getProdukId(p)) === String(id) || String(p.id) === String(id)
    );
    if (found) return found;
    const m = String(id).match(/^(?:prod|local)-(\d+)$/);
    if (m) {
      const idx = parseInt(m[1], 10);
      if (idx >= 0 && idx < list.length) return list[idx];
    }
    return null;
  } catch {
    return null;
  }
}

export default function ProdukDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [produk, setProduk] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError("");

      const local = findLocal(id);
      if (local) {
        if (!cancelled) {
          setProduk(local);
          setLoading(false);
        }
        return;
      }

      const isNumeric = /^\d+$/.test(String(id));
      if (isNumeric) {
        try {
          const data = await api.getProdukById(id);
          if (!cancelled) {
            setProduk(data);
            setLoading(false);
          }
          return;
        } catch (err) {
          console.warn("getProdukById gagal:", err.message);
        }
      }

      try {
        const res = await api.getProduk();
        const list = Array.isArray(res) ? res : res?.data || [];
        const found = list.find((p) => String(getProdukId(p)) === String(id));
        if (!cancelled) {
          setProduk(found || null);
          if (!found) setError("Produk tidak ditemukan.");
        }
      } catch (err) {
        if (!cancelled) setError(err.message || "Gagal memuat produk.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="container py-5 text-center text-secondary" style={{ minHeight: "50vh" }}>
        <div className="spinner-border text-secondary mb-3" role="status" />
        <p>Memuat produk...</p>
      </div>
    );
  }

  if (!produk) {
    return (
      <div className="container py-5 text-center" style={{ minHeight: "50vh" }}>
        <h4 className="mb-3">Produk tidak ditemukan.</h4>
        <p className="text-secondary small mb-4">{error}</p>
        <Link to="/toko" className="btn btn-outline-secondary rounded-pill px-4">
          Kembali ke Toko
        </Link>
      </div>
    );
  }

  const namaProduk = produk.nama_produk || produk.nama || "Produk";
  const imageSrc = mediaUrl(produk.gambar || produk.foto || produk.gambar_produk);
  const checkoutId = getProdukId(produk) || id;

  // FITUR BARU: Logika validasi saat klik Beli Sekarang
  const handleBeliSekarang = () => {
    // 1. Cek apakah ada data user di localStorage (sesuaikan key 'user' dengan nama yang Anda pakai saat login)
    const userData = localStorage.getItem("user"); 
    
    if (!userData) {
      alert("Silakan login terlebih dahulu untuk membeli produk.");
      navigate("/login"); // Arahkan ke halaman login (sesuaikan routenya)
      return;
    }

    try {
      const user = JSON.parse(userData);
      // 2. Cek apakah role user adalah admin
      if (user.role === "admin" || user.level === "admin") {
        alert("Maaf, Admin tidak diizinkan untuk melakukan pembelian.");
        return;
      }
    } catch (err) {
      console.error("Gagal membaca data login", err);
    }

    // 3. Lolos semua pengecekan, arahkan ke checkout
    navigate(`/checkout/${checkoutId}`);
  };

  const handleTambahKeranjang = () => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      alert("Silakan login terlebih dahulu untuk menambah ke keranjang.");
      navigate("/login");
      return;
    }
    try {
      const user = JSON.parse(userData);
      if (user.role === "admin" || user.level === "admin") {
        alert("Maaf, Admin tidak diizinkan menambah keranjang.");
        return;
      }
    } catch (_) {}

    const CART_KEY = "dataKeranjangToko";
    let cart = [];
    try {
      cart = JSON.parse(localStorage.getItem(CART_KEY) || "[]");
      if (!Array.isArray(cart)) cart = [];
    } catch {
      cart = [];
    }
    const idProd = getProdukId(produk) || id;
    const existing = cart.findIndex(
      (it) => String(it.id_produk || it.id) === String(idProd)
    );
    if (existing >= 0) {
      cart[existing].qty = Number(cart[existing].qty || 1) + 1;
    } else {
      cart.push({
        id_produk: idProd,
        id: idProd,
        nama_produk: namaProduk,
        harga: produk.harga || 0,
        gambar: produk.gambar || produk.foto || produk.gambar_produk,
        qty: 1,
      });
    }
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    alert("Produk ditambahkan ke keranjang.");
  };

  return (
    <div className="container py-5">
      <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
        <div className="row g-0">
          <div className="col-md-5 col-lg-4 bg-light d-flex align-items-center justify-content-center p-4">
            <img
              src={imageSrc}
              alt={namaProduk}
              className="img-fluid rounded-3 shadow-sm"
              style={{ maxHeight: "400px", objectFit: "contain", width: "100%" }}
              onError={(e) => {
                e.target.src = "https://via.placeholder.com/400?text=Gambar+Tidak+Tersedia";
              }}
            />
          </div>

          <div className="col-md-7 col-lg-8 p-4 p-md-5 d-flex flex-column">
            {produk.kategori && (
              <div className="mb-2">
                <span
                  className="badge rounded-pill px-3 py-2"
                  style={{ backgroundColor: "#e9ecef", color: "#8B1E3F" }}
                >
                  {produk.kategori}
                </span>
              </div>
            )}

            <h2 className="fw-bold text-dark mb-3">{namaProduk}</h2>

            <h3 className="fw-bold mb-4" style={{ color: "#8B1E3F" }}>
              {formatRupiah(produk.harga || 0)}
            </h3>

            {produk.stok != null && (
              <p className="text-secondary small mb-3">Stok: {produk.stok}</p>
            )}

            <div className="mb-4">
              <h6 className="fw-bold text-dark border-bottom pb-2 mb-3">Deskripsi Produk</h6>
              <p className="text-secondary" style={{ lineHeight: "1.7", whiteSpace: "pre-wrap" }}>
                {produk.deskripsi || "Belum ada deskripsi untuk produk ini."}
              </p>
            </div>

            <div className="mt-auto d-flex flex-wrap gap-3 pt-4 border-top">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="btn btn-outline-secondary rounded-pill px-4 py-2 fw-medium"
              >
                Kembali
              </button>
              <button
                type="button"
                className="btn rounded-pill px-4 py-2 fw-medium"
                style={{ border: "1px solid #8B1E3F", color: "#8B1E3F", backgroundColor: "transparent" }}
                onClick={handleTambahKeranjang}
              >
                + Keranjang
              </button>
              <button
                type="button"
                className="btn text-white rounded-pill px-5 py-2 fw-medium shadow-sm flex-grow-1"
                style={{ backgroundColor: "#8B1E3F" }}
                onClick={handleBeliSekarang}
              >
                Beli Sekarang
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}