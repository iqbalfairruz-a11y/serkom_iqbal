import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../AuthContext";
import PembeliSidebar from "../../components/PembeliSidebar";
import { formatRupiah, mediaUrl } from "../../utils";

const CART_KEY = "dataKeranjangToko";

export default function PembeliKeranjangPage() {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [items, setItems] = useState([]);

  useEffect(() => {
    if (!token && !localStorage.getItem("token")) {
      navigate("/login", { replace: true });
      return;
    }
    if (user?.role === "admin") {
      navigate("/admin", { replace: true });
      return;
    }
    try {
      const raw = localStorage.getItem(CART_KEY);
      setItems(raw ? JSON.parse(raw) : []);
    } catch {
      setItems([]);
    }
  }, [user, token, navigate]);

  const removeItem = (idx) => {
    const next = items.filter((_, i) => i !== idx);
    setItems(next);
    localStorage.setItem(CART_KEY, JSON.stringify(next));
  };

  const total = items.reduce(
    (sum, it) => sum + Number(it.harga || 0) * Number(it.qty || 1),
    0
  );

  return (
    <div className="d-flex min-vh-100" style={{ backgroundColor: "#f3f4f6" }}>
      <PembeliSidebar />
      <div className="flex-grow-1 d-flex flex-column">
        <header className="bg-white border-bottom px-4 py-3">
          <h4 className="fw-bold m-0 text-dark" style={{ fontSize: "1.25rem" }}>
            Keranjang
          </h4>
        </header>
        <main className="flex-grow-1 p-4">
          {items.length === 0 ? (
            <div className="card border-0 shadow-sm bg-white p-5 text-center" style={{ borderRadius: 14 }}>
              <p className="text-secondary mb-3">Keranjang masih kosong.</p>
              <Link to="/toko" className="btn btn-dark rounded-pill px-4">
                Belanja sekarang
              </Link>
            </div>
          ) : (
            <>
              <div className="card border-0 shadow-sm bg-white mb-3" style={{ borderRadius: 14 }}>
                <ul className="list-group list-group-flush">
                  {items.map((it, idx) => (
                    <li key={idx} className="list-group-item d-flex align-items-center gap-3 py-3">
                      <img
                        src={mediaUrl(it.gambar || it.foto)}
                        alt=""
                        style={{ width: 56, height: 56, objectFit: "cover", borderRadius: 8 }}
                        onError={(e) => {
                          e.target.src = "https://via.placeholder.com/56";
                        }}
                      />
                      <div className="flex-grow-1">
                        <div className="fw-medium">{it.nama_produk || it.nama}</div>
                        <div className="small text-secondary">
                          {formatRupiah(it.harga)} × {it.qty || 1}
                        </div>
                      </div>
                      <div className="d-flex gap-2">
                        <Link
                          to={`/checkout/${it.id_produk || it.id}`}
                          className="btn btn-sm text-white"
                          style={{ backgroundColor: "#8B1E3F" }}
                        >
                          Checkout
                        </Link>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => removeItem(idx)}
                        >
                          Hapus
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="d-flex justify-content-between align-items-center">
                <span className="fw-bold fs-5">{formatRupiah(total)}</span>
                <Link to="/toko" className="btn btn-dark rounded-pill px-4">
                  Lanjut belanja
                </Link>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
