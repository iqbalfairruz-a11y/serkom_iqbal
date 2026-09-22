import { useState, useEffect } from 'react';
import { adminApi } from '../../api';
import { mediaUrl } from '../../utils';

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

// Helper functions membaca properti backend
const getNama = (item) => {
  if (!item) return '';
  return (
    item.nama ||
    item.nama_lengkap ||
    item.nama_pembeli ||
    item.nama_user ||
    item.name ||
    item.full_name ||
    item.User?.nama ||
    item.user?.nama ||
    item.User?.nama_lengkap ||
    item.user?.nama_lengkap ||
    item.User?.name ||
    item.user?.name ||
    ''
  );
};

const getEmail = (item) => {
  if (!item) return '';
  return item.email || item.User?.email || item.user?.email || '';
};

const getUsername = (item) => {
  if (!item) return '';
  const directUsername =
    item.username ||
    item.user_name ||
    item.uname ||
    item.nama_user ||
    item.User?.username ||
    item.user?.username ||
    item.User?.uname ||
    item.user?.uname;

  if (directUsername) return directUsername;

  const email = getEmail(item);
  if (email && email.includes('@')) {
    return email.split('@')[0];
  }
  return '';
};

const getFoto = (item) => {
  if (!item) return '';
  return (
    item.foto ||
    item.gambar ||
    item.foto_profil ||
    item.avatar ||
    item.User?.foto ||
    item.user?.foto ||
    item.User?.gambar ||
    item.user?.gambar ||
    ''
  );
};

export default function AdminPembeliPage() {
  const [pembeli, setPembeli] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Form State
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [isReadOnly, setIsReadOnly] = useState(false);

  const [form, setForm] = useState({
    nama: '',
    username: '',
    email: '',
    password: '',
    no_hp: '',
    alamat: '',
    foto: '',
  });
  const [fileFoto, setFileFoto] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchPembeli();
  }, []);

  const fetchPembeli = async () => {
    setLoading(true);
    try {
      let data;
      if (typeof adminApi.getPembeli === 'function') {
        try {
          data = await adminApi.getPembeli();
        } catch {
          data = await adminApi.getUsers('pembeli');
        }
      } else {
        data = await adminApi.getUsers('pembeli');
      }
      setPembeli(Array.isArray(data) ? data : data?.pembeli || data?.users || data?.data || []);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.body?.message || err.message || 'Gagal memuat daftar pembeli');
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

  const getInitials = (item) => {
    const name = getNama(item) || getUsername(item) || getEmail(item);
    if (!name) return 'P';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) setFileFoto(file);
  };

  const resetForm = () => {
    setForm({
      nama: '',
      username: '',
      email: '',
      password: '',
      no_hp: '',
      alamat: '',
      foto: '',
    });
    setFileFoto(null);
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
      let pathFoto = form.foto;

      if (fileFoto) {
        const uploadRes = await adminApi.uploadGambar(fileFoto);
        pathFoto =
          uploadRes?.filename ||
          uploadRes?.gambar ||
          uploadRes?.foto ||
          uploadRes?.path ||
          uploadRes?.url ||
          uploadRes?.data?.filename ||
          uploadRes?.data?.path ||
          '';
      }

      const namaTrimmed = form.nama.trim();
      const usernameTrimmed = form.username.trim();
      const emailTrimmed = form.email.trim();
      const hpTrimmed = form.no_hp.trim();
      const alamatTrimmed = form.alamat.trim();

      const payload = {
        nama: namaTrimmed,
        nama_lengkap: namaTrimmed,
        nama_pembeli: namaTrimmed,
        nama_user: namaTrimmed,
        name: namaTrimmed,
        full_name: namaTrimmed,

        username: usernameTrimmed,
        user_name: usernameTrimmed,
        uname: usernameTrimmed,

        email: emailTrimmed,
        no_hp: hpTrimmed,
        telepon: hpTrimmed,
        phone: hpTrimmed,

        alamat: alamatTrimmed,
        address: alamatTrimmed,

        foto: pathFoto || '',
        gambar: pathFoto || '',
        avatar: pathFoto || '',

        role: 'pembeli',
      };

      if (form.password) {
        payload.password = form.password;
        payload.passwd = form.password;
      }

      if (editId) {
        // Fallback antara updatePembeli & updateUser
        if (typeof adminApi.updatePembeli === 'function') {
          try {
            await adminApi.updatePembeli(editId, payload);
          } catch {
            await adminApi.updateUser(editId, payload);
          }
        } else {
          await adminApi.updateUser(editId, payload);
        }
        setSuccessMsg('Data pembeli berhasil diperbarui.');
      } else {
        // Fallback antara createPembeli & createUser
        if (typeof adminApi.createPembeli === 'function') {
          try {
            await adminApi.createPembeli(payload);
          } catch {
            await adminApi.createUser(payload);
          }
        } else {
          await adminApi.createUser(payload);
        }
        setSuccessMsg('Akun pembeli baru berhasil ditambahkan.');
      }

      resetForm();
      await fetchPembeli();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.body?.message || err.message || 'Gagal menyimpan data pembeli.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDetail = (item) => {
    const id = item.id_user || item.id_pembeli || item.id;
    setEditId(id);
    setIsReadOnly(true);
    setForm({
      nama: getNama(item),
      username: getUsername(item),
      email: getEmail(item),
      password: '',
      no_hp: item.no_hp || item.telepon || item.phone || item.User?.no_hp || item.user?.no_hp || '',
      alamat: item.alamat || item.address || item.User?.alamat || item.user?.alamat || '',
      foto: getFoto(item),
    });
    setFileFoto(null);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEdit = (item) => {
    const id = item.id_user || item.id_pembeli || item.id;
    setEditId(id);
    setIsReadOnly(false);
    setForm({
      nama: getNama(item),
      username: getUsername(item),
      email: getEmail(item),
      password: '',
      no_hp: item.no_hp || item.telepon || item.phone || item.User?.no_hp || item.user?.no_hp || '',
      alamat: item.alamat || item.address || item.User?.alamat || item.user?.alamat || '',
      foto: getFoto(item),
    });
    setFileFoto(null);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (target) => {
    const id = typeof target === 'object' ? (target?.id_user || target?.id_pembeli || target?.id) : target;
    const namaPembeli = typeof target === 'object' ? (getNama(target) || getUsername(target) || getEmail(target)) : 'pembeli ini';

    if (!id) {
      setErrorMsg('ID pembeli tidak terdeteksi.');
      return;
    }

    if (!window.confirm(`Apakah Anda yakin ingin menghapus akun "${namaPembeli}"?`)) return;

    setErrorMsg('');
    setSuccessMsg('');

    try {
      let res;
      if (typeof adminApi.deletePembeli === 'function') {
        try {
          res = await adminApi.deletePembeli(id);
        } catch {
          res = await adminApi.deleteUser(id);
        }
      } else {
        res = await adminApi.deleteUser(id);
      }
      setSuccessMsg(res?.message || 'Akun pembeli berhasil dihapus.');
      await fetchPembeli();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.body?.message || err.message || 'Gagal menghapus akun pembeli.');
    }
  };

  return (
    <div className="container-fluid p-4 bg-light min-vh-100">
      {/* Header & Tombol Tambah */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-normal mb-1">Daftar pembeli</h4>
          <span className="text-muted small">{pembeli.length} akun pembeli</span>
        </div>

        <button
          onClick={() => {
            if (showForm) resetForm();
            else setShowForm(true);
          }}
          className="btn btn-dark px-3 py-2 fw-medium btn-sm d-flex align-items-center gap-2"
          style={{ backgroundColor: '#1a1a1a', border: 'none' }}
        >
          <span>{showForm ? '✕ Tutup' : '+ Pembeli baru'}</span>
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

      {/* Form Tambah/Edit/Detail Pembeli */}
      {showForm && (
        <div className="card border-0 shadow-sm mb-4 rounded-3">
          <div className="card-header bg-white border-bottom py-3">
            <h6 className="card-title mb-0 fw-bold">
              {isReadOnly ? '👁️ Detail Pembeli' : editId ? '✏️ Edit Pembeli' : '➕ Tambah Pembeli Baru'}
            </h6>
          </div>
          <div className="card-body p-3">
            <form onSubmit={handleSubmit}>
              <fieldset disabled={isReadOnly}>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold">Nama Lengkap *</label>
                    <input
                      type="text"
                      name="nama"
                      value={form.nama}
                      onChange={handleChange}
                      required
                      className="form-control form-control-sm"
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold">Username *</label>
                    <input
                      type="text"
                      name="username"
                      value={form.username}
                      onChange={handleChange}
                      required
                      className="form-control form-control-sm"
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label small fw-semibold">Email *</label>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      required
                      className="form-control form-control-sm"
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold">
                      Password {editId ? '(Kosongkan jika tidak diubah)' : '*'}
                    </label>
                    <input
                      type="password"
                      name="password"
                      value={form.password}
                      onChange={handleChange}
                      required={!editId}
                      className="form-control form-control-sm"
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label small fw-semibold">No. HP / Telepon</label>
                    <input
                      type="text"
                      name="no_hp"
                      value={form.no_hp}
                      onChange={handleChange}
                      className="form-control form-control-sm"
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold">Foto Profil</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      disabled={isReadOnly}
                      className="form-control form-control-sm"
                    />
                  </div>

                  <div className="col-12">
                    <label className="form-label small fw-semibold">Alamat</label>
                    <textarea
                      name="alamat"
                      rows={2}
                      value={form.alamat}
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

      {/* Tabel Data Pembeli */}
      <div className="card border-0 shadow-sm rounded-3">
        <div className="card-body p-0">
          {loading ? (
            <div className="p-4 text-center text-muted small">Memuat data...</div>
          ) : pembeli.length === 0 ? (
            <div className="p-4 text-center text-muted small">Belum ada akun pembeli terdaftar.</div>
          ) : (
            <div className="table-responsive">
              <table className="table align-middle mb-0" style={{ borderCollapse: 'separate', borderSpacing: '0' }}>
                <thead>
                  <tr className="border-bottom" style={{ borderColor: '#eee' }}>
                    <th className="ps-4 py-3 text-uppercase text-secondary fw-normal" style={{ fontSize: '11px', letterSpacing: '0.5px' }}>FOTO</th>
                    <th className="py-3 text-uppercase text-secondary fw-normal" style={{ fontSize: '11px', letterSpacing: '0.5px' }}>NAMA</th>
                    <th className="py-3 text-uppercase text-secondary fw-normal" style={{ fontSize: '11px', letterSpacing: '0.5px' }}>EMAIL</th>
                    <th className="py-3 text-uppercase text-secondary fw-normal" style={{ fontSize: '11px', letterSpacing: '0.5px' }}>USERNAME</th>
                    <th className="text-end pe-4 py-3 text-uppercase text-secondary fw-normal" style={{ fontSize: '11px', letterSpacing: '0.5px' }}>TINDAKAN</th>
                  </tr>
                </thead>
                <tbody>
                  {pembeli.map((item) => {
                    const id = item.id_user || item.id_pembeli || item.id;
                    const namaVal = getNama(item);
                    const usernameVal = getUsername(item);
                    const emailVal = getEmail(item);
                    const rawFoto = getFoto(item);
                    const srcFoto = getImageUrl(rawFoto);

                    return (
                      <tr key={id} className="border-bottom" style={{ borderColor: '#f4f4f4' }}>
                        {/* Foto / Avatar */}
                        <td className="ps-4 py-3" style={{ width: '70px' }}>
                          {srcFoto ? (
                            <img
                              src={srcFoto}
                              alt={namaVal || usernameVal || 'User'}
                              className="rounded-circle object-fit-cover border"
                              style={{ width: '40px', height: '40px' }}
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.style.display = 'none';
                                if (e.target.nextSibling) {
                                  e.target.nextSibling.style.display = 'flex';
                                }
                              }}
                            />
                          ) : null}
                          <div
                            className="rounded-circle bg-warning text-white fw-bold d-flex align-items-center justify-content-center"
                            style={{
                              width: '40px',
                              height: '40px',
                              fontSize: '14px',
                              display: srcFoto ? 'none' : 'flex',
                            }}
                          >
                            {getInitials(item)}
                          </div>
                        </td>

                        {/* Nama */}
                        <td className="py-3 fw-semibold text-dark" style={{ fontSize: '14px' }}>
                          {namaVal || usernameVal || '-'}
                        </td>

                        {/* Email */}
                        <td className="py-3 text-secondary" style={{ fontSize: '13px' }}>
                          {emailVal || '-'}
                        </td>

                        {/* Username */}
                        <td className="py-3 text-secondary" style={{ fontSize: '13px' }}>
                          {usernameVal || '-'}
                        </td>

                        {/* Tindakan */}
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
                              title="Edit Pembeli"
                              onClick={() => handleEdit(item)}
                            >
                              <EditIcon />
                            </button>
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-danger d-inline-flex align-items-center justify-content-center p-2"
                              title="Hapus Pembeli"
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