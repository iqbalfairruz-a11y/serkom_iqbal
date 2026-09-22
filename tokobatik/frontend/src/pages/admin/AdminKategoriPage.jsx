import React, { useEffect, useState } from "react";
import { adminApi } from "../../api";
import PageHeader from "../../components/admin/PageHeader";
import LoadingBlock from "../../components/admin/LoadingBlock";

export default function AdminKategoriPage() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [nama, setNama] = useState("");
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await adminApi.getKategori();
      setList(Array.isArray(res) ? res : res?.data || []);
    } catch (err) {
      setError(err.message || "Gagal memuat kategori");
      setList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const resetForm = () => { setNama(""); setEditId(null); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const n = nama.trim();
    if (!n) { alert("Nama kategori wajib diisi"); return; }
    setSaving(true);
    try {
      if (editId) await adminApi.updateKategori(editId, { nama: n });
      else await adminApi.createKategori({ nama: n });
      resetForm();
      await load();
    } catch (err) {
      alert(err.message || "Gagal menyimpan");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Hapus kategori ini?")) return;
    try {
      await adminApi.deleteKategori(id);
      if (editId === id) resetForm();
      await load();
    } catch (err) {
      alert(err.message || "Gagal menghapus");
    }
  };

  return (
    <div>
      <PageHeader title="Kategori Produk" subtitle="Tambah, ubah, atau hapus kategori (CRUD)" />
      <div className="row g-4 mt-1">
        <div className="col-md-5">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <h6 className="fw-bold mb-3">{editId ? "Edit Kategori" : "Tambah Kategori"}</h6>
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label small">Nama Kategori</label>
                  <input type="text" className="form-control" value={nama}
                    onChange={(e) => setNama(e.target.value)}
                    placeholder="Contoh: Kain Batik" required />
                </div>
                <div className="d-flex gap-2">
                  <button type="submit" className="btn text-white" style={{ backgroundColor: "#8B1E3F" }} disabled={saving}>
                    {saving ? "Menyimpan..." : editId ? "Update" : "Tambah"}
                  </button>
                  {editId && (
                    <button type="button" className="btn btn-outline-secondary" onClick={resetForm}>Batal</button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
        <div className="col-md-7">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white fw-bold">Daftar Kategori</div>
            <div className="card-body p-0">
              {loading ? <LoadingBlock /> : error ? (
                <div className="alert alert-warning m-3 mb-0">{error}</div>
              ) : list.length === 0 ? (
                <p className="text-secondary p-3 mb-0">Belum ada kategori. Jalankan file kategori_migration.sql di database.</p>
              ) : (
                <table className="table table-hover mb-0 align-middle">
                  <thead className="table-light">
                    <tr><th style={{ width: 60 }}>ID</th><th>Nama</th><th style={{ width: 150 }}>Aksi</th></tr>
                  </thead>
                  <tbody>
                    {list.map((item) => (
                      <tr key={item.id}>
                        <td>{item.id}</td>
                        <td className="fw-medium">{item.nama}</td>
                        <td>
                          <button type="button" className="btn btn-sm btn-outline-secondary me-1"
                            onClick={() => { setEditId(item.id); setNama(item.nama || ""); }}>Edit</button>
                          <button type="button" className="btn btn-sm btn-outline-danger"
                            onClick={() => handleDelete(item.id)}>Hapus</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
