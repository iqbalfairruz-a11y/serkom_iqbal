import { useState, useEffect } from 'react';
import { adminApi } from '../../api';
import { mediaUrl, onImgError, formatRupiah } from '../../utils';
import { KATEGORI_PRODUK } from '../../constants';

// SVG Icons
const EyeIcon = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

const EditIcon = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);

const TrashIcon = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

export default function AdminProdukPage() {
  const [produk, setProduk] = useState([]);
  const [kategoriList, setKategoriList] = useState(KATEGORI_PRODUK || []);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Form State
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [isReadOnly, setIsReadOnly] = useState(false);

  const [form, setForm] = useState({
    nama_produk: '',
    deskripsi: '',
    harga: '',
    stok: '',
    kategori: KATEGORI_PRODUK?.[0] || 'Kain Batik',
    gambar: '',
  });
  const [fileGambar, setFileGambar] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await adminApi.getKategori();
        const rows = Array.isArray(res) ? res : res?.data || [];
        const names = rows.map((r) => r.nama || r).filter(Boolean);
        if (names.length) setKategoriList(names);
      } catch (_) {}
    })();
  }, []);

  useEffect(() => {
    fetchProduk();
  }, []);

  const fetchProduk = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getProduk();
      setProduk(Array.isArray(data) ? data : data?.produk || data?.data || []);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.body?.message || err.message || 'Gagal memuat daftar produk');
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (path) => {
    if (!path) return '';
    if (typeof mediaUrl === 'function') {
      const resolved = mediaUrl(path);
      if (resolved) return resolved;
    }
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `http://localhost:5000${cleanPath.startsWith('/uploads') ? '' : '/uploads'}${cleanPath}`;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) setFileGambar(file);
  };

  const resetForm = () => {
    setForm({
      nama_produk: '',
      deskripsi: '',
      harga: '',
      stok: '',
      kategori: KATEGORI_PRODUK?.[0] || 'Kain Batik',
      gambar: '',
    });
    setFileGambar(null);
    setEditId(null);
    setIsReadOnly(false);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isReadOnly) return;

    setErrorMsg('');
    setSuccessMsg('');
    setSubmitting(true);

    try {
      let pathGambar = form.gambar;

      if (fileGambar) {
        const uploadRes = await adminApi.uploadGambar(fileGambar);
        pathGambar =
          uploadRes?.filename ||
          uploadRes?.gambar ||
          uploadRes?.path ||
          uploadRes?.url ||
          uploadRes?.data?.filename ||
          uploadRes?.data?.path ||
          '';
      }

      const payload = {
        nama_produk: form.nama_produk.trim(),
        deskripsi: form.deskripsi.trim(),
        harga: Number(form.harga) || 0,
        stok: Number(form.stok) || 0,
        kategori: form.kategori,
        gambar: pathGambar || '',
      };

      if (editId) {
        await adminApi.updateProduk(editId, payload);
        setSuccessMsg('Produk berhasil diperbarui.');
      } else {
        await adminApi.createProduk(payload);
        setSuccessMsg('Produk baru berhasil ditambahkan.');
      }

      resetForm();
      fetchProduk();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.body?.message || err.message || 'Gagal menyimpan produk.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDetail = (item) => {
    const id = item.id_produk || item.id;
    setEditId(id);
    setIsReadOnly(true);
    setForm({
      nama_produk: item.nama_produk || item.nama || '',
      deskripsi: item.deskripsi || '',
      harga: item.harga || '',
      stok: item.stok || '',
      kategori: item.kategori || KATEGORI_PRODUK?.[0] || 'Kain Batik',
      gambar: item.gambar || item.foto || '',
    });
    setFileGambar(null);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEdit = (item) => {
    const id = item.id_produk || item.id;
    setEditId(id);
    setIsReadOnly(false);
    setForm({
      nama_produk: item.nama_produk || item.nama || '',
      deskripsi: item.deskripsi || '',
      harga: item.harga || '',
      stok: item.stok || '',
      kategori: item.kategori || KATEGORI_PRODUK?.[0] || 'Kain Batik',
      gambar: item.gambar || item.foto || '',
    });
    setFileGambar(null);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Mendukung argumen berupa objek item atau ID langsung
  const handleDelete = async (target) => {
    const id = typeof target === 'object' ? (target?.id_produk || target?.id) : target;
    const namaProduk = typeof target === 'object' ? (target?.nama_produk || target?.nama) : 'produk ini';

    if (!id) {
      setErrorMsg('ID produk tidak terdeteksi.');
      return;
    }

    if (!window.confirm(`Apakah Anda yakin ingin menghapus "${namaProduk}"?`)) return;

    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await adminApi.deleteProduk(id);
      setSuccessMsg(res?.message || 'Produk berhasil dihapus.');
      fetchProduk();
    } catch (err) {
      const serverErr =
        err.response?.data?.message ||
        err.body?.message ||
        err.message ||
        'Gagal menghapus produk. Produk mungkin terhubung dengan data pesanan.';
      setErrorMsg(serverErr);
    }
  };

  return (
    <div className="container-fluid p-4 bg-light min-vh-100">
      {/* Header & Tombol Tambah */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-normal mb-1">Daftar produk</h4>
          <span className="text-muted small">{produk.length} produk</span>
        </div>

        <button
          onClick={() => {
            if (showForm) resetForm();
            else setShowForm(true);
          }}
          className="btn btn-dark px-3 py-2 fw-medium btn-sm d-flex align-items-center gap-2"
          style={{ backgroundColor: '#1a1a1a', border: 'none' }}
        >
          <span>{showForm ? '✕ Tutup' : '+ Produk baru'}</span>
        </button>
      </div>

      {/* Alert Notifications */}
      {errorMsg && (
        <div className="alert alert-danger alert-dismissible fade show py-2 px-3 mb-3 small" role="alert">
          {errorMsg}
          <button type="button" className="btn-close p-2" onClick={() => setErrorMsg('')}></button>
        </div>
      )}
      {successMsg && (
        <div className="alert alert-success alert-dismissible fade show py-2 px-3 mb-3 small" role="alert">
          {successMsg}
          <button type="button" className="btn-close p-2" onClick={() => setSuccessMsg('')}></button>
        </div>
      )}

      {/* Form Tambah/Edit/Detail Produk */}
      {showForm && (
        <div className="card border-0 shadow-sm mb-4 rounded-3">
          <div className="card-header bg-white border-bottom py-3">
            <h6 className="card-title mb-0 fw-bold">
              {isReadOnly ? '👁️ Detail Produk' : editId ? '✏️ Edit Produk' : '➕ Tambah Produk Baru'}
            </h6>
          </div>
          <div className="card-body p-3">
            <form onSubmit={handleSubmit}>
              <fieldset disabled={isReadOnly}>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold">Nama Produk *</label>
                    <input
                      type="text"
                      name="nama_produk"
                      value={form.nama_produk}
                      onChange={handleChange}
                      required
                      className="form-control form-control-sm"
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold">Kategori</label>
                    <select
                      name="kategori"
                      value={form.kategori}
                      onChange={handleChange}
                      className="form-select form-select-sm"
                    >
                      {(kategoriList?.length ? kategoriList : (KATEGORI_PRODUK || ['Kain Batik', 'Pakaian Batik', 'Aksesoris'])).map((kat) => (
                        <option key={kat} value={kat}>{kat}</option>
                      ))}
                    </select>
                  </div>

                  <div className="col-md-4">
                    <label className="form-label small fw-semibold">Harga (Rp) *</label>
                    <input
                      type="number"
                      name="harga"
                      min="0"
                      value={form.harga}
                      onChange={handleChange}
                      required
                      className="form-control form-control-sm"
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label small fw-semibold">Stok *</label>
                    <input
                      type="number"
                      name="stok"
                      min="0"
                      value={form.stok}
                      onChange={handleChange}
                      required
                      className="form-control form-control-sm"
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label small fw-semibold">Foto Produk</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      disabled={isReadOnly}
                      className="form-control form-control-sm"
                    />
                  </div>

                  <div className="col-12">
                    <label className="form-label small fw-semibold">Deskripsi</label>
                    <textarea
                      name="deskripsi"
                      rows={2}
                      value={form.deskripsi}
                      onChange={handleChange}
                      className="form-control form-control-sm"
                    />
                  </div>
                </div>
              </fieldset>

              <div className="col-12 pt-3">
                {!isReadOnly && (
                  <button type="submit" disabled={submitting} className="btn btn-sm btn-dark px-4 me-2">
                    {submitting ? 'Menyimpan...' : editId ? 'Perbarui' : 'Simpan'}
                  </button>
                )}
                <button type="button" onClick={resetForm} className="btn btn-sm btn-light border px-3">
                  {isReadOnly ? 'Tutup' : 'Batal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tabel Data Produk */}
      <div className="card border-0 shadow-sm rounded-3">
        <div className="card-body p-0">
          {loading ? (
            <div className="p-4 text-center text-muted small">Memuat data...</div>
          ) : produk.length === 0 ? (
            <div className="p-4 text-center text-muted small">Belum ada produk terdaftar.</div>
          ) : (
            <div className="table-responsive">
              <table className="table align-middle mb-0" style={{ borderCollapse: 'separate', borderSpacing: '0' }}>
                <thead>
                  <tr className="border-bottom" style={{ borderColor: '#eee' }}>
                    <th className="ps-4 py-3 text-uppercase text-secondary fw-normal" style={{ fontSize: '11px', letterSpacing: '0.5px' }}>GAMBAR</th>
                    <th className="py-3 text-uppercase text-secondary fw-normal" style={{ fontSize: '11px', letterSpacing: '0.5px' }}>NAMA</th>
                    <th className="py-3 text-uppercase text-secondary fw-normal" style={{ fontSize: '11px', letterSpacing: '0.5px' }}>KATEGORI</th>
                    <th className="py-3 text-uppercase text-secondary fw-normal" style={{ fontSize: '11px', letterSpacing: '0.5px' }}>HARGA</th>
                    <th className="text-end pe-4 py-3 text-uppercase text-secondary fw-normal" style={{ fontSize: '11px', letterSpacing: '0.5px' }}>TINDAKAN</th>
                  </tr>
                </thead>
                <tbody>
                  {produk.map((item) => {
                    const id = item.id_produk || item.id;
                    const rawImage = item.gambar || item.foto;
                    const srcGambar = getImageUrl(rawImage);

                    return (
                      <tr key={id} className="border-bottom" style={{ borderColor: '#f4f4f4' }}>
                        {/* Gambar */}
                        <td className="ps-4 py-3" style={{ width: '80px' }}>
                          <div 
                            className="bg-light rounded d-flex align-items-center justify-content-center border overflow-hidden" 
                            style={{ width: '50px', height: '42px' }}
                          >
                            <img
                              src={srcGambar || 'https://via.placeholder.com/150?text=No+Img'}
                              alt={item.nama_produk || item.nama || 'Produk'}
                              className="w-100 h-100"
                              style={{ objectFit: 'cover' }}
                              onError={typeof onImgError === 'function' ? onImgError : (e) => {
                                e.target.onerror = null;
                                e.target.src = 'https://via.placeholder.com/150?text=No+Img';
                              }}
                            />
                          </div>
                        </td>

                        {/* Nama */}
                        <td className="py-3 fw-semibold text-dark" style={{ fontSize: '14px' }}>
                          {item.nama_produk || item.nama || '-'}
                        </td>

                        {/* Kategori */}
                        <td className="py-3 text-secondary" style={{ fontSize: '13px' }}>
                          {item.kategori || '-'}
                        </td>

                        {/* Harga */}
                        <td className="py-3 text-dark" style={{ fontSize: '13px' }}>
                          {formatRupiah(item.harga || 0)}
                        </td>

                        {/* Tombol Tindakan Berbentuk Icon */}
                        <td className="text-end pe-4 py-3">
                          <div className="btn-group" role="group">
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-secondary d-inline-flex align-items-center justify-content-center p-2"
                              title="Lihat Detail"
                              onClick={() => handleDetail(item)}
                            >
                              <EyeIcon />
                            </button>
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-primary d-inline-flex align-items-center justify-content-center p-2"
                              title="Ubah Produk"
                              onClick={() => handleEdit(item)}
                            >
                              <EditIcon />
                            </button>
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-danger d-inline-flex align-items-center justify-content-center p-2"
                              title="Hapus Produk"
                              onClick={() => handleDelete(item)}
                            >
                              <TrashIcon />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}