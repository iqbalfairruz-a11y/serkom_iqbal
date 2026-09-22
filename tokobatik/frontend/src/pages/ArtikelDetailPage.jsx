import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../api";
import { formatTanggal, mediaUrl } from "../utils";

function getArtikelId(item) {
  return item?.id ?? item?.id_artikel ?? null;
}

function findInLocal(id) {
  try {
    const saved = localStorage.getItem("dataArtikelToko");
    const list = saved ? JSON.parse(saved) : [];
    if (!Array.isArray(list)) return null;
    const byId = list.find(
      (item) =>
        String(getArtikelId(item)) === String(id) ||
        String(item.id) === String(id)
    );
    if (byId) return byId;
    const m = String(id).match(/^(?:local|art)-(\d+)$/);
    if (m) {
      const idx = parseInt(m[1], 10);
      if (idx >= 0 && idx < list.length) return list[idx];
    }
    return null;
  } catch {
    return null;
  }
}

export default function ArtikelDetailPage() {
  const { id } = useParams();
  const [artikel, setArtikel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError("");
      setArtikel(null);

      const local = findInLocal(id);
      if (local) {
        if (!cancelled) {
          setArtikel(local);
          setLoading(false);
        }
        return;
      }

      const isNumericId = /^\d+$/.test(String(id));
      if (isNumericId) {
        try {
          const data = await api.getArtikelById(id);
          if (!cancelled) {
            setArtikel(data);
            setLoading(false);
          }
          return;
        } catch (err) {
          console.warn("getArtikelById gagal:", err.message);
        }
      }

      try {
        const res = await api.getArtikel();
        const list = Array.isArray(res) ? res : res?.data || [];
        const found = list.find(
          (item) => String(getArtikelId(item)) === String(id)
        );
        if (!cancelled) {
          setArtikel(found || null);
          if (!found) setError("Artikel tidak ditemukan.");
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err.message ||
              "Gagal memuat artikel. Pastikan backend berjalan."
          );
        }
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
        <p>Memuat isi artikel...</p>
      </div>
    );
  }

  if (!artikel) {
    return (
      <div className="container py-5 text-center" style={{ minHeight: "50vh" }}>
        <h4 className="text-dark mb-2">Artikel tidak ditemukan.</h4>
        <p className="text-secondary small mb-4">
          {error || "Artikel mungkin sudah dihapus atau ID tidak valid."}
        </p>
        <div className="d-flex gap-2 justify-content-center flex-wrap">
          <Link to="/artikel" className="btn rounded-pill px-4" style={{ border: "1px solid #8B1E3F", color: "#8B1E3F", backgroundColor: "transparent" }}>
            Lihat Semua Artikel
          </Link>
          <Link to="/" className="btn rounded-pill px-4" style={{ border: "1px solid #8B1E3F", color: "#8B1E3F", backgroundColor: "transparent" }}>
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    );
  }

  const judul = artikel.judul || "Tanpa Judul";
  const penulis = artikel.penulis || "";
  const tanggal = formatTanggal(
    artikel.created_at || artikel.createdAt || artikel.tanggal
  );
  const isi = artikel.isi || artikel.deskripsi || "";
  const gambarSrc = mediaUrl(artikel.gambar || artikel.foto);

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <Link
            to="/artikel"
            className="text-decoration-none fw-medium mb-4 d-inline-block"
            style={{ color: "#8B1E3F" }}
          >
            &larr; Kembali ke Artikel
          </Link>

          <h1 className="fw-bold text-dark mb-3" style={{ lineHeight: "1.3" }}>
            {judul}
          </h1>

          <div className="d-flex flex-wrap align-items-center gap-3 mb-3 text-secondary small">
            {tanggal && <span>{tanggal}</span>}
          </div>

          {artikel.ringkasan && (
            <p className="lead text-secondary mb-4">{artikel.ringkasan}</p>
          )}

          {(artikel.gambar || artikel.foto) && (
            <div
              className="mb-5 rounded-4 overflow-hidden shadow-sm bg-light"
              style={{ maxHeight: "480px" }}
            >
              <img
                src={gambarSrc}
                alt={judul}
                className="w-100"
                style={{ objectFit: "cover", maxHeight: "480px" }}
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            </div>
          )}

          <article className="fs-5 text-secondary" style={{ lineHeight: "1.85" }}>
            {String(isi).includes("<") ? (
              <div dangerouslySetInnerHTML={{ __html: isi }} />
            ) : (
              String(isi)
                .split("\n")
                .map((para, i) =>
                  para.trim() ? (
                    <p key={i} className="mb-3">
                      {para}
                    </p>
                  ) : (
                    <br key={i} />
                  )
                )
            )}
          </article>

          <hr className="my-5" />
          <Link to="/artikel" className="btn rounded-pill px-4" style={{ border: "1px solid #8B1E3F", color: "#8B1E3F", backgroundColor: "transparent" }}>
            Lihat Artikel Lainnya
          </Link>
        </div>
      </div>
    </div>
  );
}
