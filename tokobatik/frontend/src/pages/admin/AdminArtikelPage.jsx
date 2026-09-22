import React, { useState, useEffect } from "react";
import { adminApi } from "../../api";
import { mediaUrl, onImgError, formatTanggal } from "../../utils";

const emptyForm = {
  judul: "",
  ringkasan: "",
  isi: "",
  gambar: "",
};

export default function AdminArtikelPage() {
  const [artikelList, setArtikelList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [detailItem, setDetailItem] = useState(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchArtikel();
  }, []);

  const fetchArtikel = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await adminApi.getArtikel();
      const data = Array.isArray(res) ? res : res?.data || [];
      setArtikelList(data);
      localStorage.setItem("dataArtikelToko", JSON.stringify(data));
    } catch (err) {
      console.error("fetchArtikel:", err);
      setError(err.message || "Gagal memuat artikel dari server.");
      try {
        const saved = JSON.parse(localStorage.getItem("dataArtikelToko") || "[]");
        if (Array.isArray(saved) && saved.length) setArtikelList(saved);
      } catch {
        /* ignore */
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const res = await adminApi.uploadGambar(file);
      setForm((prev) => ({ ...prev, gambar: res.path || res.url || "" }));
    } catch (err) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm((prev) => ({ ...prev, gambar: reader.result }));
      };
      reader.readAsDataURL(file);
      setError("Upload ke server gagal. Gambar disimpan sementara sebagai preview lokal.");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!form.judul.trim()) {
      setError("Judul wajib diisi.");
      return;
    }

    const isiText = form.isi || "";
    let ringkasan = (form.ringkasan || "").trim();
    if (!ringkasan && isiText) {
      ringkasan = isiText.replace(/<[^>]*>/g, "").substring(0, 200);
    }
    if (!ringkasan) ringkasan = form.judul.trim();

    const payload = {
      judul: form.judul.trim(),
      ringkasan,
      isi: isiText,
      gambar:
        form.gambar && String(form.gambar).startsWith("data:")
          ? ""
          : form.gambar || "",
    };

    setSaving(true);
    try {
      if (editId != null) {
        await adminApi.updateArtikel(editId, payload);
        setSuccess("Artikel berhasil diperbarui.");
      } else {
        await adminApi.createArtikel(payload);
        setSuccess("Artikel berhasil ditambahkan.");
      }
      setIsFormOpen(false);
      setEditId(null);
      setForm({ ...emptyForm });
      await fetchArtikel();
    } catch (err) {
      setError(
        err.message ||
          "Gagal menyimpan ke database. Pastikan backend & MySQL berjalan."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleEditClick = (item) => {
    setEditId(item.id ?? item.id_artikel);
    setForm({
      judul: item.judul || "",
      ringkasan: item.ringkasan || "",
      isi: item.isi || item.deskripsi || "",
      gambar: item.gambar || "",
    });
    setIsFormOpen(true);
    setDetailItem(null);
    setError("");
    setSuccess("");
  };

  const handleCancel = () => {
    setIsFormOpen(false);
    setEditId(null);
    setForm({ ...emptyForm });
    setError("");
  };

  const handleDelete = async (item) => {
    const id = item.id ?? item.id_artikel;
    if (!id) {
      setError("ID artikel tidak ditemukan.");
      return;
    }
    if (!window.confirm(`Hapus artikel "${item.judul}"?`)) return;
    try {
      await adminApi.deleteArtikel(id);
      setSuccess("Artikel berhasil dihapus.");
      if (detailItem && (detailItem.id ?? detailItem.id_artikel) === id) {
        setDetailItem(null);
      }
      await fetchArtikel();
    } catch (err) {
      setError(err.message || "Gagal menghapus artikel.");
    }
  };

  const getImageUrl = (img) => {
    if (!img) return mediaUrl("");
    if (String(img).startsWith("http") || String(img).startsWith("data:")) return img;
    return mediaUrl(img);
  };

  if (isFormOpen) {
    return (
      <div>
        <h4 className="fw-bold mb-4">Kelola Artikel</h4>
        <div className="card border-0 shadow-sm p-4 bg-white mb-4">
          <h5 className="mb-4 fw-bold">
            {editId != null ? "Ubah Artikel" : "Tambah Artikel Baru"}
          </h5>
          {error && (
            <div className="alert alert-danger py-2 small">{error}</div>
          )}
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label fw-medium">Judul Artikel</label>
              <input
                type="text"
                className="form-control"
                name="judul"
                value={form.judul}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label fw-medium">Isi Artikel</label>
              <textarea
                className="form-control"
                name="isi"
                rows="6"
                value={form.isi}
                onChange={handleInputChange}
              />
            </div>
            <div className="mb-3">
              <label className="form-label fw-medium">Ringkasan</label>
              <textarea
                className="form-control"
                name="ringkasan"
                rows="2"
                value={form.ringkasan}
                onChange={handleInputChange}
                placeholder="Ringkasan singkat (opsional, otomatis dari isi jika kosong)"
              />
            </div>
            <div className="mb-4">
              <label className="form-label fw-medium">Gambar Artikel</label>
              <input
                type="file"
                className="form-control"
                accept="image/*"
                onChange={handleFileChange}
                disabled={uploading}
              />
              {uploading && (
                <small className="text-secondary">Mengunggah...</small>
              )}
              {form.gambar && (
                <div className="mt-2">
                  <img
                    src={getImageUrl(form.gambar)}
                    alt="Preview"
                    style={{ height: 80, objectFit: "cover" }}
                    className="border rounded"
                    onError={onImgError}
                  />
                </div>
              )}
            </div>
            <div className="d-flex gap-2">
              <button
                type="submit"
                className="btn btn-dark px-4"
                disabled={saving || uploading}
              >
                {saving ? "Menyimpan..." : editId != null ? "Simpan Perubahan" : "Simpan Artikel"}
              </button>
              <button
                type="button"
                className="btn btn-light border px-4"
                onClick={handleCancel}
              >
                Batal
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  if (detailItem) {
    return (
      <div>
        <h4 className="fw-bold mb-4">Kelola Artikel</h4>
        <div className="card border-0 shadow-sm p-4 bg-white mb-4">
          <div className="d-flex justify-content-between align-items-center border-bottom pb-3 mb-4">
            <h5 className="fw-bold m-0">Detail Artikel</h5>
            <button
              className="btn btn-outline-secondary btn-sm px-3"
              onClick={() => setDetailItem(null)}
            >
              Kembali
            </button>
          </div>
          {detailItem.gambar && (
            <img
              src={getImageUrl(detailItem.gambar)}
              alt="artikel"
              style={{ maxHeight: 300, objectFit: "cover" }}
              className="w-100 mb-3 rounded border"
              onError={onImgError}
            />
          )}
          <small className="text-secondary d-block mb-1">
            {formatTanggal(detailItem.created_at) || detailItem.tanggal || ""}
            {detailItem.penulis ? ` · ${detailItem.penulis}` : ""}
          </small>
          <h3 className="fw-bold text-dark">{detailItem.judul}</h3>
          <p className="text-secondary mt-3" style={{ lineHeight: 1.7, whiteSpace: "pre-wrap" }}>
            {detailItem.isi || detailItem.deskripsi || "Tidak ada isi artikel."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h4 className="fw-bold mb-4">Kelola Artikel</h4>

      {error && <div className="alert alert-danger py-2 small">{error}</div>}
      {success && (
        <div className="alert alert-success py-2 small">{success}</div>
      )}

      <div className="d-flex justify-content-between align-items-end mb-4">
        <div>
          <h5 className="fw-bold mb-1">Artikel & blog</h5>
          <span className="text-secondary small">
            {loading ? "Memuat..." : `${artikelList.length} artikel`}
          </span>
        </div>
        <div className="d-flex gap-2">
          <button
            className="btn btn-outline-secondary btn-sm px-3"
            onClick={fetchArtikel}
            disabled={loading}
          >
            Refresh
          </button>
          <button
            onClick={() => {
              setForm({ ...emptyForm });
              setEditId(null);
              setIsFormOpen(true);
              setError("");
              setSuccess("");
            }}
            className="btn btn-dark btn-sm px-3"
          >
            + Artikel baru
          </button>
        </div>
      </div>

      <div className="card border-0 shadow-sm bg-white">
        <div className="table-responsive">
          <table className="table table-hover mb-0 align-middle">
            <thead>
              <tr className="text-secondary small">
                <th className="fw-medium py-3 px-3" style={{ width: "12%" }}>
                  GAMBAR
                </th>
                <th className="fw-medium py-3 px-3" style={{ width: "45%" }}>
                  JUDUL
                </th>
                <th className="fw-medium py-3 px-3" style={{ width: "18%" }}>
                  TANGGAL
                </th>
                <th className="fw-medium py-3 px-3 text-end" style={{ width: "25%" }}>
                  TINDAKAN
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="4" className="text-center text-muted py-5">
                    Memuat data...
                  </td>
                </tr>
              ) : artikelList.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-secondary py-5 text-center">
                    Belum ada artikel. Klik <strong>+ Artikel baru</strong> untuk
                    menambahkan.
                  </td>
                </tr>
              ) : (
                artikelList.map((item) => {
                  const id = item.id ?? item.id_artikel;
                  return (
                    <tr key={id}>
                      <td className="py-3 px-3">
                        <img
                          src={getImageUrl(item.gambar)}
                          alt=""
                          className="rounded border"
                          width="60"
                          height="40"
                          style={{ objectFit: "cover" }}
                          onError={onImgError}
                        />
                      </td>
                      <td className="py-3 px-3">
                        <div className="fw-bold text-dark mb-1">{item.judul}</div>
                        <div
                          className="text-secondary small text-truncate"
                          style={{ maxWidth: 400 }}
                        >
                          {item.isi || item.deskripsi || "—"}
                        </div>
                      </td>
                      <td className="py-3 px-3 text-secondary small">
                        {formatTanggal(item.created_at) || item.tanggal || "—"}
                      </td>
                      <td className="py-3 px-3 text-end">
                        <div className="d-flex justify-content-end gap-1">
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-secondary"
                            title="Detail"
                            aria-label="Detail"
                            onClick={() => setDetailItem(item)}
                          >
                            <i className="bi bi-eye"></i>
                          </button>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-dark"
                            title="Ubah"
                            aria-label="Ubah"
                            onClick={() => handleEditClick(item)}
                          >
                            <i className="bi bi-pencil"></i>
                          </button>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger"
                            title="Hapus"
                            aria-label="Hapus"
                            onClick={() => handleDelete(item)}
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
