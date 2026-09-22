import React, { useState, useEffect } from "react";
import { SITE } from "../../constants";

const STORAGE_KEY = "dataInfoToko";

export default function AdminInfoTokoPage() {
  const [form, setForm] = useState({
    nama_toko: SITE.nama_toko || "",
    tentang: SITE.tentang || "",
    alamat_toko: SITE.alamat_toko || "",
    email_toko: SITE.email_toko || "",
    tlp_toko: String(SITE.tlp_toko || ""),
    jam_buka: SITE.jam_buka || "",
    nama_bank_a: SITE.nama_bank_a || "",
    no_rek_a: String(SITE.no_rek_a || ""),
    nama_bank_b: SITE.nama_bank_b || "",
    no_rek_b: String(SITE.no_rek_b || ""),
    link_wa: SITE.link_wa || "",
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const data = JSON.parse(raw);
        setForm((f) => ({ ...f, ...data }));
      }
    } catch { /* */ }
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setSaved(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(form));
    setSaved(true);
  };

  return (
    <div>
      <p className="text-secondary small mb-4">
        Atur informasi toko yang tampil di beranda, footer, dan halaman checkout.
      </p>

      {saved && (
        <div className="alert alert-success py-2 small">Info toko berhasil disimpan (local).</div>
      )}

      <form onSubmit={handleSubmit} className="card border-0 shadow-sm bg-white p-4" style={{ borderRadius: 4, maxWidth: 720 }}>
        <div className="row g-3">
          <div className="col-md-6">
            <label className="form-label small fw-medium">Nama toko</label>
            <input name="nama_toko" className="form-control" value={form.nama_toko} onChange={handleChange} />
          </div>
          <div className="col-md-6">
            <label className="form-label small fw-medium">Jam buka</label>
            <input name="jam_buka" className="form-control" value={form.jam_buka} onChange={handleChange} />
          </div>
          <div className="col-12">
            <label className="form-label small fw-medium">Tentang toko</label>
            <textarea name="tentang" className="form-control" rows={3} value={form.tentang} onChange={handleChange} />
          </div>
          <div className="col-12">
            <label className="form-label small fw-medium">Alamat</label>
            <textarea name="alamat_toko" className="form-control" rows={2} value={form.alamat_toko} onChange={handleChange} />
          </div>
          <div className="col-md-6">
            <label className="form-label small fw-medium">Email</label>
            <input name="email_toko" type="email" className="form-control" value={form.email_toko} onChange={handleChange} />
          </div>
          <div className="col-md-6">
            <label className="form-label small fw-medium">Telepon / WA</label>
            <input name="tlp_toko" className="form-control" value={form.tlp_toko} onChange={handleChange} />
          </div>
          <div className="col-md-6">
            <label className="form-label small fw-medium">Bank A</label>
            <input name="nama_bank_a" className="form-control" value={form.nama_bank_a} onChange={handleChange} />
          </div>
          <div className="col-md-6">
            <label className="form-label small fw-medium">No. Rekening A</label>
            <input name="no_rek_a" className="form-control" value={form.no_rek_a} onChange={handleChange} />
          </div>
          <div className="col-md-6">
            <label className="form-label small fw-medium">Bank B</label>
            <input name="nama_bank_b" className="form-control" value={form.nama_bank_b} onChange={handleChange} />
          </div>
          <div className="col-md-6">
            <label className="form-label small fw-medium">No. Rekening B</label>
            <input name="no_rek_b" className="form-control" value={form.no_rek_b} onChange={handleChange} />
          </div>
          <div className="col-12">
            <label className="form-label small fw-medium">Link WhatsApp</label>
            <input name="link_wa" className="form-control" value={form.link_wa} onChange={handleChange} placeholder="https://wa.me/62..." />
          </div>
        </div>
        <button type="submit" className="btn text-white mt-4 px-4" style={{ backgroundColor: "#8B1E3F", borderRadius: 4 }}>
          Simpan Info Toko
        </button>
      </form>
    </div>
  );
}
