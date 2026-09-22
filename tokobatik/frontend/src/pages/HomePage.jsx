import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { SITE, KATEGORI_PRODUK } from "../constants"; 
import { api } from "../api";
import { formatRupiah, mediaUrl, formatTanggal } from "../utils";

// Helper untuk ekstrak array dari response API
const extractArrayData = (res) => {
  if (Array.isArray(res)) return res;
  if (res && Array.isArray(res.data)) return res.data;
  if (res && Array.isArray(res.produk)) return res.produk;
  if (res && Array.isArray(res.artikel)) return res.artikel;
  return [];
};

export default function HomePage() {
  const [produkList, setProdukList] = useState([]);
  const [artikelList, setArtikelList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        let produkOk = false;
        let artikelOk = false;
        let apiProduk = [];
        let apiArtikel = [];

        try {
          const resProduk = await api.getProduk();
          apiProduk = extractArrayData(resProduk);
          produkOk = true;
        } catch (err) {
          console.warn("Gagal mengambil produk dari API:", err);
        }

        try {
          const resArtikel = await api.getArtikel();
          apiArtikel = extractArrayData(resArtikel);
          artikelOk = true;
        } catch (err) {
          console.warn("Gagal mengambil artikel dari API:", err);
        }

        // API sukses (meski kosong) → pakai API & sinkronkan localStorage
        // API gagal → fallback localStorage
        if (produkOk) {
          setProdukList(apiProduk);
          try { localStorage.setItem("dataProdukToko", JSON.stringify(apiProduk)); } catch (_) {}
        } else {
          try {
            const localProduk = JSON.parse(localStorage.getItem("dataProdukToko") || "[]");
            setProdukList(Array.isArray(localProduk) ? localProduk : []);
          } catch {
            setProdukList([]);
          }
        }

        if (artikelOk) {
          setArtikelList(apiArtikel);
          try { localStorage.setItem("dataArtikelToko", JSON.stringify(apiArtikel)); } catch (_) {}
        } else {
          try {
            const localArtikel = JSON.parse(localStorage.getItem("dataArtikelToko") || "[]");
            setArtikelList(Array.isArray(localArtikel) ? localArtikel : []);
          } catch {
            setArtikelList([]);
          }
        } 
      } catch (err) {
        console.error("Gagal memuat data beranda:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return (
    <div className="container py-4">
      <style>{`
        .category-card {
          background-color: #f8f9fa;
          border-color: #e9ecef;
          transition: all 0.2s ease-in-out;
        }
        .category-card:hover {
          background-color: #8B1E3F !important;
          border-color: #8B1E3F !important;
        }
        .category-card:hover .category-title {
          color: #ffffff !important;
        }
      `}</style>
      
      {/* 1. Hero Banner */}
      <div 
        className="rounded-4 mb-5 shadow-sm overflow-hidden" 
        style={{ 
          backgroundImage: `linear-gradient(rgba(45, 20, 32, 0.75), rgba(45, 20, 32, 0.75)), url('/hero-batik.png')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat"
        }}
      >
        <div className="py-5 px-4 px-md-5 text-center">
          <h1 className="display-5 fw-bold text-white mb-3 text-capitalize" style={{ letterSpacing: "-0.5px" }}>
            {SITE?.nama_toko || "Batik Nusantara"}
          </h1>
          <p className="fs-5 text-white mb-4 mx-auto" style={{ maxWidth: "700px", opacity: 0.9, fontWeight: "300" }}>
            Temukan keindahan batik tulis, cap, dan modern. Kain premium, pakaian siap pakai, dan aksesoris autentik untuk gaya Anda.
          </p>
          <div className="d-flex justify-content-center gap-3">
            <Link to="/toko" className="btn bg-white text-dark px-4 py-2 fw-semibold rounded-pill shadow-sm">
              Produk Kami
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Kategori Produk */}
      <div className="mb-5 pb-3">
        <h4 className="fw-bold mb-4 text-dark border-bottom pb-2">Kategori Produk</h4>
        <div className="row g-3">
          {KATEGORI_PRODUK?.map((kategori, index) => (
            <div key={index} className="col-12 col-md-4">
              <Link to={`/toko?kategori=${encodeURIComponent(kategori)}`} className="text-decoration-none">
                <div 
                  className="card category-card border-1 shadow-sm rounded-4 text-center p-4 d-flex justify-content-center align-items-center"
                  style={{ height: "100px" }}
                >
                  <h5 className="category-title fw-bold mb-0" style={{ color: "#2D1420", transition: "color 0.2s ease-in-out" }}>
                    {kategori}
                  </h5>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Produk Terbaru */}
      <div className="mb-5 pb-3">
        <div className="d-flex justify-content-between align-items-end mb-4 border-bottom pb-2">
          <h4 className="fw-bold mb-0 text-dark">Produk</h4>
          <Link to="/toko" className="text-decoration-none fw-medium pb-1" style={{ fontSize: "0.9rem", color: "#8B1E3F" }}>
            Lihat Semua &rarr;
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-5 text-secondary">Memuat data batik...</div>
        ) : produkList.length === 0 ? (
          <div className="text-center py-5 text-secondary">Belum ada produk.</div>
        ) : (
          <div className="row row-cols-1 row-cols-sm-2 row-cols-md-4 g-4">
            {produkList.slice(0, 4).map((item, index) => {
              const productId = item.id || item.id_produk || `prod-${index}`;
              const imageSrc = mediaUrl(item.gambar || item.foto || item.gambar_produk);

              return (
                <div key={productId} className="col">
                  <div className="card h-100 border-0 shadow-sm rounded-4 overflow-hidden">
                    <div
                      className="d-flex align-items-center justify-content-center bg-white border-bottom"
                      style={{ height: 200, padding: 12 }}
                    >
                      <img
                        src={imageSrc}
                        alt={item.nama || item.nama_produk || "Produk"}
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
                          e.target.src = "https://via.placeholder.com/300?text=Gambar+Error";
                        }}
                      />
                    </div>
                    <div className="card-body bg-white text-center p-3 d-flex flex-column">
                      <h6 className="fw-semibold text-dark text-truncate mb-3">
                        {item.nama || item.nama_produk}
                      </h6>
                      
                      <div className="mt-auto d-flex justify-content-between align-items-center gap-2">
                        <span 
                          className="badge py-2 px-1 rounded-pill text-truncate" 
                          style={{ color: "#8B1E3F", backgroundColor: "rgba(139, 30, 63, 0.1)", fontSize: "0.8rem", width: "50%" }}
                        >
                          {formatRupiah(item.harga || 0)}
                        </span>
                        <Link 
                          to={`/produk/${productId}`} 
                          className="btn text-white rounded-pill fw-medium py-1 px-2"
                          style={{ backgroundColor: "#8B1E3F", fontSize: "0.8rem", width: "50%", whiteSpace: "nowrap" }}
                        >
                          Lihat Detail
                        </Link>
                      </div>

                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. Artikel Terbaru */}
      <div className="mb-5">
        <div className="d-flex justify-content-between align-items-end mb-4 border-bottom pb-2">
          <h4 className="fw-bold mb-0 text-dark">Artikel</h4>
          <Link to="/artikel" className="text-decoration-none fw-medium pb-1" style={{ fontSize: "0.9rem", color: "#8B1E3F" }}>
            Buka Jurnal &rarr;
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-5 text-secondary">Memuat artikel...</div>
        ) : artikelList.length === 0 ? (
          <div className="text-center py-5 text-secondary">Belum ada artikel terbaru.</div>
        ) : (
          <div className="row g-4">
            {artikelList.slice(0, 3).map((item, index) => {
              const articleId = item.id ?? item.id_artikel ?? `local-${index}`;
              const articleImage = mediaUrl(item.gambar || item.foto);

              return (
                <div key={String(articleId)} className="col-md-4">
                  <div className="card h-100 border bg-white overflow-hidden d-flex flex-column" style={{ borderColor: "#dee2e6", borderRadius: "12px" }}>
                    
                    <div className="bg-light" style={{ height: "220px" }}>
                      {articleImage ? (
                        <img
                          src={articleImage}
                          alt={item.judul || "Artikel"}
                          className="w-100 h-100"
                          style={{ objectFit: "cover" }}
                          onError={(e) => {
                            e.target.src = "https://via.placeholder.com/400x200?text=Tanpa+Gambar";
                          }}
                        />
                      ) : (
                         <div className="w-100 h-100 d-flex align-items-center justify-content-center text-secondary">
                            Tanpa Gambar
                         </div>
                      )}
                    </div>
                    
                    <div className="card-body p-4 d-flex flex-column">
                      <span className="text-secondary mb-2" style={{ fontSize: "0.85rem" }}>
                        {item.tanggal || formatTanggal(item.created_at || item.createdAt) || formatTanggal(new Date())}
                      </span>
                      
                      <h5 className="fw-bold text-dark mb-3" style={{ lineHeight: "1.4" }}>
                        {item.judul}
                      </h5>
                      
                      <p className="text-secondary mb-4 flex-grow-1" style={{ 
                        fontSize: "0.95rem",
                        display: "-webkit-box", 
                        WebkitLineClamp: 3, 
                        WebkitBoxOrient: "vertical", 
                        overflow: "hidden" 
                      }}>
                        {item.ringkasan || item.deskripsi || (item.isi ? item.isi.replace(/<[^>]*>?/gm, "") : "")}
                      </p>
                      
                      <div>
                        <Link 
                          to={`/artikel/${articleId}`} 
                          className="btn px-3 py-1"
                          style={{ 
                            borderRadius: "6px", 
                            fontSize: "0.9rem",
                            border: "1px solid #8B1E3F",
                            color: "#8B1E3F",
                            backgroundColor: "transparent"
                          }}
                        >
                          Baca Selengkapnya
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 5. Tentang Kami */}
      <div className="rounded-4 mb-4 shadow-sm" style={{ backgroundColor: "#f8f9fa", border: "1px solid #e9ecef" }}>
        <div className="p-4 p-md-5">
          <h4 className="fw-bold mb-3 text-dark text-center">Tentang {SITE?.nama_toko || "Batik Nusantara"}</h4>
          <p className="text-secondary mb-0 text-center" style={{ lineHeight: "1.8" }}>
            Batik Nusantara hadir dengan komitmen kuat untuk menjadi mitra tepercaya bagi para pecinta batik. Kami menyediakan kain batik tulis, cap, dan printing berkualitas, serta pakaian dan aksesoris siap pakai. Dengan pelayanan yang bersahabat dan koleksi yang terus diperbarui, Batik Nusantara berdedikasi melestarikan warisan budaya sekaligus menghadirkan gaya modern di seluruh Nusantara.
          </p>
        </div>
      </div>

    </div>
  );
}