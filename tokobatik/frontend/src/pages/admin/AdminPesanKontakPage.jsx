import React, { useState, useEffect } from "react";
import { formatTanggal } from "../../utils";

const STORAGE_KEY = "dataPesanKontak";

export default function AdminPesanKontakPage() {
  const [list, setList] = useState([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      setList(raw ? JSON.parse(raw) : []);
    } catch {
      setList([]);
    }
  }, []);

  const handleDelete = (idx) => {
    if (!window.confirm("Hapus pesan ini?")) return;
    const next = list.filter((_, i) => i !== idx);
    setList(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-end mb-3">
        <div>
          <h6 className="fw-bold mb-0 text-dark">Pesan masuk</h6>
          <small className="text-secondary">{list.length} pesan</small>
        </div>
      </div>

      <div className="card border-0 shadow-sm bg-white" style={{ borderRadius: 4 }}>
        <div className="table-responsive">
          <table className="table align-middle mb-0">
            <thead className="table-light">
              <tr className="small text-secondary">
                <th className="ps-3">Nama</th>
                <th>Email</th>
                <th>Pesan</th>
                <th>Tanggal</th>
                <th className="pe-3">Tindakan</th>
              </tr>
            </thead>
            <tbody>
              {list.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center text-secondary py-4 small">
                    Belum ada pesan kontak. Pesan dari form kontak di beranda akan muncul di sini.
                  </td>
                </tr>
              ) : (
                list.map((item, idx) => (
                  <tr key={idx}>
                    <td className="ps-3 small fw-medium">{item.nama || "-"}</td>
                    <td className="small">{item.email || "-"}</td>
                    <td className="small text-secondary" style={{ maxWidth: 280 }}>
                      {(item.pesan || "").slice(0, 80)}
                      {(item.pesan || "").length > 80 ? "…" : ""}
                    </td>
                    <td className="small text-secondary">
                      {formatTanggal(item.tanggal || item.created_at)}
                    </td>
                    <td className="pe-3">
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleDelete(idx)}
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
