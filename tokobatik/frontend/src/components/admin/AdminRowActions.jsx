/**
 * Tombol aksi baris tabel admin: Detail, Ubah, Hapus.
 */
export default function AdminRowActions({ onDetail, onEdit, onDelete }) {
  return (
    <div className="d-inline-flex align-items-center gap-1 flex-wrap">
      {onDetail && (
        <button
          type="button"
          className="btn btn-sm btn-outline-secondary"
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDetail(); }}
          title="Detail"
        >
          Detail
        </button>
      )}
      {onEdit && (
        <button
          type="button"
          className="btn btn-sm btn-outline-dark"
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); onEdit(); }}
          title="Ubah"
        >
          Ubah
        </button>
      )}
      {onDelete && (
        <button
          type="button"
          className="btn btn-sm btn-outline-danger"
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDelete(); }}
          title="Hapus"
        >
          Hapus
        </button>
      )}
    </div>
  );
}
