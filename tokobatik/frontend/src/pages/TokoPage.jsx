import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { api } from "../api";
import { KATEGORI_PRODUK } from "../constants";
import { formatRupiah, mediaUrl } from "../utils";

// Placeholder SVG internal (muncul otomatis saat gambar tidak ditemukan/offline)
const DEFAULT_IMAGE = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='300' height='200' viewBox='0 0 300 200'><rect width='100%' height='100%' fill='%23e9ecef'/><text x='50%' y='50%' font-family='sans-serif' font-size='14' fill='%236c757d' text-anchor='middle' dy='.3em'>Gambar Tidak Tersedia</text></svg>";

function getProdukId(item, index) {
  return item.id_produk ?? item.id ?? `local-${index}`;
}

export default function TokoPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const kategoriParam = searchParams.get("kategori") || "Semua";

  const [produkList, setProdukList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedKategori, setSelectedKategori] = useState(kategoriParam);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const kat = searchParams.get("kategori");
    setSelectedKategori(kat || "Semua");
  }, [searchParams]);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");
      let apiOk = false;
      let apiProduk = [];
      try {
        const res = await api.getProduk();
        apiProduk = Array.isArray(res) ? res : res?.data || [];
        apiOk = true;
      } catch (err) {
        console.warn("API produk gagal:", err.message);
        setError("Backend terputus. Menampilkan data yang tersedia.");
      }

      if (apiOk) {
        setProdukList(apiProduk);
        try { localStorage.setItem("dataProdukToko", JSON.stringify(apiProduk)); } catch (_) {}
      } else {
        let localProduk = [];
        try {
          localProduk = JSON.parse(localStorage.getItem("dataProdukToko") || "[]");
          if (!Array.isArray(localProduk)) localProduk = [];
        } catch {
          localProduk = [];
        }
        setProdukList(
          localProduk.map((item, i) => ({
            ...item,
            id: item.id_produk ?? item.id ?? `local-${i}`,
          }))
        );
      }
      setLoading(false);
    }
    load();
  }, []);

  const handleCategoryClick = (kategori) => {
    setSelectedKategori(kategori);
    if (kategori === "Semua") {
      searchParams.delete("kategori");
      setSearchParams(searchParams);
    } else {
      setSearchParams({ kategori });
    }
  };

  const q = searchQuery.trim().toLowerCase();
  const filteredProduk = produkList.filter((item) => {
    const kat = (item.kategori || "").trim();
    const matchKategori =
      selectedKategori === "Semua" ||
      kat.toLowerCase() === String(selectedKategori).toLowerCase();

    if (!q) return matchKategori;

    const haystack = [
      item.nama_produk,
      item.nama,
      item.kategori,
      item.deskripsi,
      item.deskripsi_produk,
      item.keterangan,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    const matchSearch = haystack.includes(q);
    return matchKategori && matchSearch;
  });

  return (
    <div className="container py-5">
      {/* Header Search & Category Filter */}
      <div className="row g-3 align-items-center mb-4 pb-2">
        <div className="col-md-5 col-lg-4">
          <div className="input-group">
            <span className="input-group-text bg-white border-end-0 rounded-start-pill ps-3 text-secondary">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z" />
              </svg>
            </span>
            <input
              type="search"
              className="form-control border-start-0 rounded-end-pill py-2 text-dark shadow-none"
              placeholder="Cari kain, pakaian, aksesoris..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Escape") setSearchQuery("");
              }}
              autoComplete="off"
              name="cari_produk"
              style={{ fontSize: "0.95rem" }}
            />
          </div>
        </div>

        <div className="col-md-7 col-lg-8">
          <div className="d-flex flex-wrap gap-2 justify-content-md-end">
            {["Semua", ...(KATEGORI_PRODUK || ["Kain Batik", "Pakaian Batik", "Aksesoris"])].map((kategori) => {
              const isActive = selectedKategori === kategori;
              return (
                <button
                  key={kategori}
                  type="button"
                  onClick={() => handleCategoryClick(kategori)}
                  className={`btn btn-sm rounded-pill px-3 ${
                    isActive ? "text-white" : "btn-outline-secondary"
                  }`}
                  style={
                    isActive
                      ? { backgroundColor: "#8B1E3F", borderColor: "#8B1E3F" }
                      : {}
                  }
                >
                  {kategori}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {error && (
        <div className="alert alert-warning py-2 small mb-3">{error}</div>
      )}

      {loading ? (
        <div className="text-center py-5 text-secondary">
          <div className="spinner-border text-secondary mb-2" role="status" />
          <p>Memuat produk...</p>
        </div>
      ) : filteredProduk.length === 0 ? (
        <div className="text-center py-5 text-secondary">
          <p className="mb-2">
            {q
              ? `Tidak ada produk untuk "${searchQuery}"${selectedKategori !== "Semua" ? ` di kategori ${selectedKategori}` : ""}.`
              : `Belum ada produk${selectedKategori !== "Semua" ? ` di kategori ${selectedKategori}` : ""}.`}
          </p>
        </div>
      ) : (
        <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4">
          {filteredProduk.map((item, index) => {
            const productId = getProdukId(item, index);
            const nama = item.nama_produk || item.nama || "Produk";
            
            // Pengecekan multi-field gambar dari database
            const rawGambar = item.gambar || item.gambar_produk || item.foto || item.foto_produk || item.image || item.url_gambar;
            const imageSrc = mediaUrl(rawGambar) || DEFAULT_IMAGE;

            return (
              <div key={String(productId)} className="col">
                <div className="card h-100 border-0 shadow-sm rounded-4 overflow-hidden">
                  <div
                    className="d-flex align-items-center justify-content-center bg-white border-bottom"
                    style={{ height: 200, padding: 12 }}
                  >
                    <img
                      src={imageSrc}
                      alt={nama}
                      className="mw-100 mh-100"
                      style={{
                        maxHeight: "100%",
                        maxWidth: "100%",
                        width: "auto",
                        height: "auto",
                        objectFit: "contain",
                        objectPosition: "center",
                      }}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = DEFAULT_IMAGE;
                      }}
                    />
                  </div>
                  <div className="card-body d-flex flex-column p-3">
                    {item.kategori && (
                      <span className="badge rounded-pill align-self-start mb-2" style={{ backgroundColor: "#e9ecef", color: "#8B1E3F" }}>
                        {item.kategori}
                      </span>
                    )}
                    <h6 className="fw-bold text-dark mb-1" style={{ lineHeight: 1.3 }}>
                      {nama}
                    </h6>
                    <p className="fw-bold mb-3" style={{ color: "#8B1E3F" }}>
                      {formatRupiah(item.harga || 0)}
                    </p>
                    <Link
                      to={`/toko/${productId}`}
                      className="btn btn-sm text-white rounded-pill mt-auto"
                      style={{ backgroundColor: "#8B1E3F" }}
                    >
                      Lihat Detail
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}