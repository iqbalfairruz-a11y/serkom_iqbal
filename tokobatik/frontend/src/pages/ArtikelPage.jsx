import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import { mediaUrl, formatTanggal } from "../utils";

function getArtikelId(item, index) {
  return item.id ?? item.id_artikel ?? `local-${index}`;
}

export default function ArtikelPage() {
  const [artikel, setArtikel] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchArtikel = async () => {
      try {
        let apiOk = false;
        let apiArtikel = [];
        try {
          const res = await api.getArtikel();
          apiArtikel = Array.isArray(res) ? res : res.data || [];
          apiOk = true;
        } catch (apiErr) {
          console.warn("API artikel gagal:", apiErr.message);
        }

        if (apiOk) {
          setArtikel(apiArtikel);
          try { localStorage.setItem("dataArtikelToko", JSON.stringify(apiArtikel)); } catch (_) {}
        } else {
          const savedData = localStorage.getItem("dataArtikelToko");
          const localArtikel = savedData ? JSON.parse(savedData) : [];
          const normalizedLocal = (Array.isArray(localArtikel) ? localArtikel : []).map(
            (item, i) => ({
              ...item,
              id: item.id ?? item.id_artikel ?? `local-${i}`,
            })
          );
          setArtikel(normalizedLocal);
        }
      } catch (err) {
        setError(err.message || "Gagal memuat artikel.");
      } finally {
        setLoading(false);
      }
    };
    fetchArtikel();
  }, []);

  return (
    <div className="container py-5" style={{ minHeight: "75vh" }}>
      <div className="text-center mb-5">
        <h2 className="fw-bold">Artikel Artikel & Informasi Pertanian Inspirasi Batik</h2>
        <p className="text-secondary">
          Temukan tips, panduan, dan info terbaru seputar dunia batik dan budaya Nusantara.
        </p>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-secondary" role="status"></div>
          <p className="mt-2 text-muted">Memuat artikel...</p>
        </div>
      ) : error ? (
        <div className="alert alert-danger text-center">{error}</div>
      ) : artikel.length === 0 ? (
        <div className="text-center py-5 text-muted">Belum ada artikel yang tersedia.</div>
      ) : (
        <div className="row g-4">
          {artikel.map((item, index) => {
            const articleId = getArtikelId(item, index);
            
            // PERBAIKAN 1: Pisahkan penanganan gambar Admin dan API
            const imgSrc = mediaUrl(item.gambar || item.foto);
            
            const cuplikanIsi = item.ringkasan || item.isi
              ? item.isi.replace(/<[^>]*>?/gm, "").substring(0, 120) +
                (item.isi.length > 120 ? "..." : "")
              : item.deskripsi || "";

            // PERBAIKAN 2: Berikan tanggal default (hari ini) jika data tanggal kosong
            const rawDate = item.created_at || item.createdAt || item.tanggal || new Date().toISOString();

            return (
              <div key={articleId} className="col-md-6 col-lg-4">
                <div className="card h-100 shadow-sm border-0 rounded-4 overflow-hidden">
                  
                  {/* Gambar dipastikan selalu dirender jika salah satunya ada */}
                  {(item.gambar || item.foto) ? (
                    <img
                      src={imgSrc}
                      className="card-img-top"
                      alt={item.judul || "Artikel"}
                      style={{ height: "200px", objectFit: "cover" }}
                      onError={(e) => {
                        // Jika gambar rusak, ganti dengan gambar abu-abu kosong agar layout tidak hancur
                        e.target.src = "https://via.placeholder.com/400x200?text=Gambar+Tidak+Tersedia";
                      }}
                    />
                  ) : (
                    <div className="bg-light d-flex align-items-center justify-content-center" style={{ height: "200px" }}>
                       <span className="text-secondary small">Tanpa Gambar</span>
                    </div>
                  )}

                  <div className="card-body d-flex flex-column p-4">
                    <span className="text-secondary small mb-2">
                      {/* Menggunakan rawDate yang sudah difilter di atas */}
                      {formatTanggal(rawDate)}
                    </span>
                    <h5 className="card-title fw-bold text-dark">{item.judul}</h5>
                    <p className="card-text text-secondary small flex-grow-1 mt-2">
                      {cuplikanIsi}
                    </p>
                    <Link
                      to={`/artikel/${articleId}`}
                      className="btn rounded-3 mt-3 fw-semibold align-self-start"
                      style={{ border: "1px solid #8B1E3F", color: "#8B1E3F", backgroundColor: "transparent" }}
                    >
                      Baca Selengkapnya
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-5 text-center">
        <Link to="/" className="btn btn-outline-secondary rounded-3 fw-medium small">
          &larr; Kembali ke Beranda
        </Link>
      </div>
    </div>
  );
}