import React from "react";
import { Link } from "react-router-dom";
import { SITE, KATEGORI_PRODUK } from "../constants";

const waLink = SITE?.link_wa || (SITE?.tlp_toko ? `https://wa.me/${SITE.tlp_toko}` : "#");

export default function Footer() {
  return (
    <footer className="text-white pt-5 pb-3" style={{ backgroundColor: "#2D1420" }}>
      <div className="container py-2">
        <div className="row g-4">
          {/* 1. PRODUK */}
          <div className="col-md-3 col-6">
            <h6 className="fw-bold mb-4 text-uppercase text-white" style={{ letterSpacing: "1px" }}>
              PRODUK
            </h6>
            <ul className="list-unstyled d-flex flex-column gap-2 mb-0" style={{ fontSize: "0.9rem" }}>
              <li>
                <Link to="/toko" className="text-white-50 text-decoration-none">
                  Semua Produk
                </Link>
              </li>
              {(KATEGORI_PRODUK || []).map((kat, index) => (
                <li key={index}>
                  <Link
                    to={`/toko?kategori=${encodeURIComponent(kat)}`}
                    className="text-white-50 text-decoration-none"
                  >
                    {kat}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* 2. MENU */}
          <div className="col-md-3 col-6">
            <h6 className="fw-bold mb-4 text-uppercase text-white" style={{ letterSpacing: "1px" }}>
              MENU
            </h6>
            <ul className="list-unstyled d-flex flex-column gap-2 mb-0" style={{ fontSize: "0.9rem" }}>
              <li>
                <Link to="/" className="text-white-50 text-decoration-none">
                  Beranda
                </Link>
              </li>
              <li>
                <Link to="/toko" className="text-white-50 text-decoration-none">
                  Toko
                </Link>
              </li>
              <li>
                <Link to="/artikel" className="text-white-50 text-decoration-none">
                  Artikel
                </Link>
              </li>
            </ul>
          </div>

          {/* 3. INFO */}
          <div className="col-md-3 col-6">
            <h6 className="fw-bold mb-4 text-uppercase text-white" style={{ letterSpacing: "1px" }}>
              INFO
            </h6>
            <ul className="list-unstyled d-flex flex-column gap-2 mb-0" style={{ fontSize: "0.9rem" }}>
              <li>
                <Link to="/register" className="text-white-50 text-decoration-none">
                  Daftar
                </Link>
              </li>
              <li>
                <Link to="/login" className="text-white-50 text-decoration-none">
                  Masuk
                </Link>
              </li>
            </ul>
          </div>

          {/* 4. KONTAK KAMI */}
          <div className="col-md-3 col-6">
            <h6 className="fw-bold mb-4 text-uppercase text-white" style={{ letterSpacing: "1px" }}>
              KONTAK KAMI
            </h6>
            <ul className="list-unstyled d-flex flex-column gap-2 mb-0 text-white-50" style={{ fontSize: "0.9rem" }}>
              {SITE?.email_toko && <li>Email: {SITE.email_toko}</li>}
              {SITE?.tlp_toko && (
                <li>
                  WhatsApp:{" "}
                  <a
                    href={waLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white-50 text-decoration-none"
                  >
                    +{SITE.tlp_toko}
                  </a>
                </li>
              )}
              {SITE?.alamat_toko && <li>Alamat: {SITE.alamat_toko}</li>}
              {SITE?.jam_buka && <li>Jam Buka: {SITE.jam_buka}</li>}
            </ul>

            {/* Ikon sosial — WhatsApp (wajib) + IG/FB jika ada */}
            <div className="d-flex align-items-center gap-2 mt-3">
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="d-inline-flex align-items-center justify-content-center rounded-circle text-white text-decoration-none"
                title="Chat WhatsApp"
                aria-label="WhatsApp"
                style={{
                  width: 40,
                  height: 40,
                  backgroundColor: "#25D366",
                }}
              >
                <i className="bi bi-whatsapp fs-5"></i>
              </a>
              {SITE?.link_ig && (
                <a
                  href={SITE.link_ig}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="d-inline-flex align-items-center justify-content-center rounded-circle text-white text-decoration-none"
                  title="Instagram"
                  aria-label="Instagram"
                  style={{ width: 40, height: 40, backgroundColor: "#E1306C" }}
                >
                  <i className="bi bi-instagram"></i>
                </a>
              )}
              {SITE?.link_fb && (
                <a
                  href={SITE.link_fb}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="d-inline-flex align-items-center justify-content-center rounded-circle text-white text-decoration-none"
                  title="Facebook"
                  aria-label="Facebook"
                  style={{ width: 40, height: 40, backgroundColor: "#1877F2" }}
                >
                  <i className="bi bi-facebook"></i>
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="border-top border-white border-opacity-10 mt-4 pt-3 text-center text-white-50 small">
          &copy; {new Date().getFullYear()} {SITE?.nama_toko || "Batik Nusantara"}. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
