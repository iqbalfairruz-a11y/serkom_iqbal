/**
 * Kelola pesanan/pembelian — Detail, Ubah, Hapus
 */
import { useState } from 'react';
import { adminApi } from '../../api';
import { useAdminList, useAdminGuard } from '../../hooks';
import { METODE_BAYAR, SHIPPING, STATUS_BAYAR, STATUS_PROSES } from '../../constants';
import PageHeader from '../../components/admin/PageHeader';
import LoadingBlock from '../../components/admin/LoadingBlock';
import AdminModal from '../../components/admin/AdminModal';
import AdminDetailModal from '../../components/admin/AdminDetailModal';
import AdminRowActions from '../../components/admin/AdminRowActions';
import { formatRupiah, formatTanggal, mediaUrl } from '../../utils';

function getPesananId(row) {
  return row?.id ?? row?.id_pembelian ?? null;
}

function getItemData(row) {
  if (!row) return {};
  const id = getPesananId(row);
  const namaPembeli =
    row.nama_pembeli ||
    [row.nama_d, row.nama_b].filter(Boolean).join(' ') ||
    row.nama ||
    'Pembeli';
  const subPembeli = row.email || row.email_pembeli || row.uname || '';
  const namaProduk = row.nama_produk || row.produk || 'Produk';
  const gambarProduk = row.gambar_produk || row.gambar || '';
  const harga = row.total_harga ?? row.harga ?? row.total ?? 0;
  const status = row.status || 'Pending';
  const pembayaran = row.pembayaran || row.status_pembayaran || STATUS_BAYAR[0];
  return { id, namaPembeli, subPembeli, namaProduk, gambarProduk, harga, status, pembayaran };
}

export default function AdminPembelianPage() {
  const { handleError } = useAdminGuard();
  const { rows = [], loading, error, reload } = useAdminList(adminApi.getPembelian);
  const [modal, setModal] = useState(null);
  const [detail, setDetail] = useState(null);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [success, setSuccess] = useState('');

  const openDetail = async (row) => {
    setFormError('');
    setSuccess('');
    const pid = getPesananId(row);
    try {
      const r = await adminApi.getPembelianById(pid);
      const data = r?.data && typeof r.data === 'object' && !Array.isArray(r) ? r.data : r;
      setDetail({ ...row, ...data });
    } catch (err) {
      if (!handleError(err)) {
        setDetail(row);
      }
    }
  };

  const openEdit = async (row) => {
    setFormError('');
    setSuccess('');
    const pid = getPesananId(row);
    const apply = (p) => {
      setForm({
        metode_pembayaran: p.metode_pembayaran || METODE_BAYAR[0],
        pembayaran: p.pembayaran || p.status_pembayaran || STATUS_BAYAR[0],
        pengiriman: p.kurir || p.pengiriman || SHIPPING[0],
        status: p.status || STATUS_PROSES[0],
        catatan: p.catatan || '',
        total_harga: p.total_harga ?? p.harga ?? '',
        alamat_pengiriman: p.alamat_pengiriman || p.alamat || '',
      });
      setModal({ id: pid, row: p });
    };
    try {
      const r = await adminApi.getPembelianById(pid);
      const p = r?.data && typeof r.data === 'object' && !Array.isArray(r) ? r.data : r;
      apply({ ...row, ...p });
    } catch (err) {
      if (!handleError(err)) apply(row);
    }
  };

  const onSave = async (e) => {
    e.preventDefault();
    if (!modal?.id) return;
    setSaving(true);
    setFormError('');
    setSuccess('');
    try {
      await adminApi.updatePembelian(modal.id, {
        status: form.status,
        total_harga: form.total_harga !== '' ? Number(form.total_harga) : undefined,
        metode_pembayaran: form.metode_pembayaran,
        kurir: form.pengiriman,
        pengiriman: form.pengiriman,
        catatan: form.catatan,
        alamat_pengiriman: form.alamat_pengiriman,
        pembayaran: form.pembayaran || 'Belum',
        status_pembayaran: form.pembayaran || 'Belum',
      });
      setModal(null);
      setSuccess('Pesanan berhasil diperbarui.');
      reload();
    } catch (err) {
      if (!handleError(err)) setFormError(err.message || 'Gagal memperbarui pesanan');
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async (id) => {
    if (!id) {
      setFormError('ID pesanan tidak ditemukan.');
      return;
    }
    if (!window.confirm(`Hapus pesanan #${id}?`)) return;
    setFormError('');
    setSuccess('');
    try {
      await adminApi.deletePembelian(id);
      setSuccess(`Pesanan #${id} berhasil dihapus.`);
      if (detail && getPesananId(detail) === id) setDetail(null);
      reload();
    } catch (err) {
      if (!handleError(err)) setFormError(err.message || 'Gagal menghapus pesanan');
    }
  };

  if (loading) return <LoadingBlock />;

  const safeRows = Array.isArray(rows) ? rows : [];

  return (
    <div>
      <PageHeader title="Daftar pesanan" subtitle={`${safeRows.length} transaksi`} />

      {(error || formError) && (
        <div className="alert alert-danger mb-3 py-2 small">{error || formError}</div>
      )}
      {success && <div className="alert alert-success mb-3 py-2 small">{success}</div>}

      <div className="admin-panel">
        <div className="table-responsive">
          <table className="table admin-table mb-0 align-middle">
            <thead>
              <tr>
                <th>ID</th>
                <th>Pembeli</th>
                <th>Gambar</th>
                <th>Produk</th>
                <th>Total</th>
                <th>Status</th>
                <th>Bayar</th>
                <th className="col-actions">Tindakan</th>
              </tr>
            </thead>
            <tbody>
              {safeRows.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-secondary text-center py-4">
                    Belum ada pesanan.
                  </td>
                </tr>
              ) : (
                safeRows.map((row) => {
                  const item = getItemData(row);
                  return (
                    <tr key={item.id}>
                      <td>#{item.id}</td>
                      <td>
                        <div className="fw-medium">{item.namaPembeli}</div>
                        {item.subPembeli && (
                          <small className="text-secondary d-block">{item.subPembeli}</small>
                        )}
                      </td>
                      <td>
                        <img
                          src={mediaUrl(item.gambarProduk)}
                          alt={item.namaProduk}
                          width={48}
                          height={48}
                          className="rounded object-fit-cover"
                          style={{ objectFit: 'cover' }}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src =
                              'data:image/svg+xml,' +
                              encodeURIComponent(
                                "<svg xmlns='http://www.w3.org/2000/svg' width='48' height='48'><rect fill='%23e9ecef' width='48' height='48'/></svg>"
                              );
                          }}
                        />
                      </td>
                      <td>{item.namaProduk}</td>
                      <td className="fw-medium">{formatRupiah(item.harga)}</td>
                      <td>
                        <span className="badge text-bg-secondary">{item.status}</span>
                      </td>
                      <td>{item.pembayaran}</td>
                      <td className="col-actions">
                        <AdminRowActions
                          onDetail={() => openDetail(row)}
                          onEdit={() => openEdit(row)}
                          onDelete={() => onDelete(item.id)}
                        />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========== DETAIL ========== */}
      <AdminDetailModal
        show={Boolean(detail)}
        title={detail ? `Detail pesanan #${getPesananId(detail)}` : ''}
        onClose={() => setDetail(null)}
      >
        {detail && (
          <div>
            <div className="row g-4 mb-4">
              <div className="col-md-4">
                <div className="bg-light rounded-3 overflow-hidden border">
                  <img
                    src={mediaUrl(detail.gambar_produk || detail.gambar)}
                    alt={detail.nama_produk || 'Produk'}
                    className="w-100"
                    style={{ maxHeight: 200, objectFit: 'cover' }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
              </div>
              <div className="col-md-8">
                <h5 className="fw-bold mb-1">{detail.nama_produk || 'Produk'}</h5>
                <p className="text-success fw-bold fs-5 mb-3">
                  {formatRupiah(detail.total_harga ?? detail.harga ?? 0)}
                </p>
                <div className="d-flex flex-wrap gap-2 mb-2">
                  <span className="badge text-bg-dark">{detail.status || 'Pending'}</span>
                  <span className="badge text-bg-light border">
                    {detail.metode_pembayaran || '—'}
                  </span>
                  <span className="badge text-bg-light border">
                    {detail.kurir || detail.pengiriman || '—'}
                  </span>
                </div>
                <p className="small text-secondary mb-0">
                  {formatTanggal(detail.created_at || detail.createdAt)}
                </p>
              </div>
            </div>

            <div className="row g-3">
              <div className="col-md-6">
                <div className="border rounded-3 p-3 h-100 bg-white">
                  <h6 className="fw-bold text-secondary text-uppercase small mb-3">Pembeli</h6>
                  <dl className="row mb-0 small">
                    <dt className="col-4 text-secondary">Nama</dt>
                    <dd className="col-8 mb-2">
                      {detail.nama_pembeli ||
                        [detail.nama_d, detail.nama_b].filter(Boolean).join(' ') ||
                        '—'}
                    </dd>
                    <dt className="col-4 text-secondary">Email</dt>
                    <dd className="col-8 mb-2">{detail.email || '—'}</dd>
                    <dt className="col-4 text-secondary">Alamat</dt>
                    <dd className="col-8 mb-0">
                      {detail.alamat_pengiriman || detail.alamat || '—'}
                    </dd>
                  </dl>
                </div>
              </div>
              <div className="col-md-6">
                <div className="border rounded-3 p-3 h-100 bg-white">
                  <h6 className="fw-bold text-secondary text-uppercase small mb-3">Pesanan</h6>
                  <dl className="row mb-0 small">
                    <dt className="col-5 text-secondary">Jumlah</dt>
                    <dd className="col-7 mb-2">{detail.jumlah ?? 1}</dd>
                    <dt className="col-5 text-secondary">Status bayar</dt>
                    <dd className="col-7 mb-2">
                      {detail.pembayaran || detail.status_pembayaran || 'Belum'}
                    </dd>
                    <dt className="col-5 text-secondary">Catatan</dt>
                    <dd className="col-7 mb-0">{detail.catatan || '—'}</dd>
                  </dl>
                </div>
              </div>
            </div>

            <div className="d-flex gap-2 mt-4">
              <button
                type="button"
                className="btn btn-dark btn-sm"
                onClick={() => {
                  setDetail(null);
                  openEdit(detail);
                }}
              >
                Ubah pesanan
              </button>
              <button
                type="button"
                className="btn btn-outline-danger btn-sm"
                onClick={() => onDelete(getPesananId(detail))}
              >
                Hapus
              </button>
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm ms-auto"
                onClick={() => setDetail(null)}
              >
                Tutup
              </button>
            </div>
          </div>
        )}
      </AdminDetailModal>

      {/* ========== EDIT ========== */}
      <AdminModal
        show={Boolean(modal)}
        title={`Ubah pesanan #${modal?.id || ''}`}
        onClose={() => setModal(null)}
        wide
        hideClose
      >
        {modal?.row && (
          <div className="d-flex gap-3 align-items-center mb-4 p-3 bg-light rounded-3">
            <img
              src={mediaUrl(modal.row.gambar_produk || modal.row.gambar)}
              alt=""
              width={64}
              height={64}
              className="rounded object-fit-cover"
              style={{ objectFit: 'cover' }}
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
            <div className="small">
              <div className="fw-bold">
                {modal.row.nama_produk || 'Produk'}
              </div>
              <div className="text-secondary">
                {modal.row.nama_pembeli ||
                  [modal.row.nama_d, modal.row.nama_b].filter(Boolean).join(' ') ||
                  'Pembeli'}
              </div>
              <div className="text-secondary">
                {formatTanggal(modal.row.created_at || modal.row.createdAt)}
              </div>
            </div>
          </div>
        )}

        <form onSubmit={onSave}>
          {formError && (
            <div className="alert alert-danger py-2 small">{formError}</div>
          )}
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label small fw-medium">Metode bayar</label>
              <select
                className="form-select"
                value={form.metode_pembayaran || ''}
                onChange={(e) =>
                  setForm({ ...form, metode_pembayaran: e.target.value })
                }
              >
                {METODE_BAYAR.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-6">
              <label className="form-label small fw-medium">Status pembayaran</label>
              <select
                className="form-select"
                value={form.pembayaran || ''}
                onChange={(e) => setForm({ ...form, pembayaran: e.target.value })}
              >
                {STATUS_BAYAR.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-6">
              <label className="form-label small fw-medium">Kurir</label>
              <select
                className="form-select"
                value={form.pengiriman || ''}
                onChange={(e) => setForm({ ...form, pengiriman: e.target.value })}
              >
                {SHIPPING.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-6">
              <label className="form-label small fw-medium">Status pesanan</label>
              <select
                className="form-select"
                value={form.status || ''}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              >
                {STATUS_PROSES.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-6">
              <label className="form-label small fw-medium">Total harga</label>
              <input
                type="number"
                className="form-control"
                min={0}
                value={form.total_harga ?? ''}
                onChange={(e) => setForm({ ...form, total_harga: e.target.value })}
              />
            </div>
            <div className="col-12">
              <label className="form-label small fw-medium">Alamat pengiriman</label>
              <textarea
                className="form-control"
                rows={2}
                value={form.alamat_pengiriman || ''}
                onChange={(e) =>
                  setForm({ ...form, alamat_pengiriman: e.target.value })
                }
              />
            </div>
            <div className="col-12">
              <label className="form-label small fw-medium">Catatan</label>
              <textarea
                className="form-control"
                rows={2}
                value={form.catatan || ''}
                onChange={(e) => setForm({ ...form, catatan: e.target.value })}
              />
            </div>
          </div>
          <div className="d-flex gap-2 mt-4">
            <button
              type="submit"
              className="btn btn-dark flex-grow-1"
              disabled={saving}
            >
              {saving ? 'Menyimpan…' : 'Simpan perubahan'}
            </button>
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={() => setModal(null)}
            >
              Batal
            </button>
          </div>
        </form>
      </AdminModal>
    </div>
  );
}
