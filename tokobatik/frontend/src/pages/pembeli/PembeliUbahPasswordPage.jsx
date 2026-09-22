import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../AuthContext";
import { pembeliApi } from "../../api";
import PembeliSidebar from "../../components/PembeliSidebar";

export default function PembeliUbahPasswordPage() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [form, setForm] = useState({ passwordLama: "", passwordBaru: "", konfirmasiPassword: "" });
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setMsg("");
    setErr("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.passwordBaru !== form.konfirmasiPassword) {
      setErr("Konfirmasi password tidak cocok.");
      return;
    }
    if (form.passwordBaru.length < 6) {
      setErr("Password baru minimal 6 karakter.");
      return;
    }
    setLoading(true);
    try {
      await pembeliApi.changePassword({
        passwordLama: form.passwordLama,
        passwordBaru: form.passwordBaru,
      });
      setMsg("Password berhasil diubah.");
      setForm({ passwordLama: "", passwordBaru: "", konfirmasiPassword: "" });
    } catch (ex) {
      setErr(ex.message || "Gagal mengubah password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex min-vh-100" style={{ backgroundColor: "#f3f4f6" }}>
      <PembeliSidebar />
      <div className="flex-grow-1 d-flex flex-column">
        <header className="bg-white border-bottom px-4 py-3">
          <h4 className="fw-bold m-0 text-dark" style={{ fontSize: "1.25rem" }}>Ubah Password</h4>
        </header>
        <main className="flex-grow-1 p-4">
          <form onSubmit={handleSubmit} className="card border-0 shadow-sm bg-white p-4" style={{ borderRadius: 14, maxWidth: 420 }}>
            {msg && <div className="alert alert-success py-2 small">{msg}</div>}
            {err && <div className="alert alert-danger py-2 small">{err}</div>}
            <div className="mb-3">
              <label className="form-label small fw-medium">Password lama</label>
              <input type="password" name="passwordLama" className="form-control" value={form.passwordLama} onChange={handleChange} required />
            </div>
            <div className="mb-3">
              <label className="form-label small fw-medium">Password baru</label>
              <input type="password" name="passwordBaru" className="form-control" value={form.passwordBaru} onChange={handleChange} required />
            </div>
            <div className="mb-4">
              <label className="form-label small fw-medium">Konfirmasi password baru</label>
              <input type="password" name="konfirmasiPassword" className="form-control" value={form.konfirmasiPassword} onChange={handleChange} required />
            </div>
            <button type="submit" className="btn btn-dark rounded-pill px-4" disabled={loading}>
              {loading ? "Menyimpan..." : "Simpan password"}
            </button>
          </form>
        </main>
      </div>
    </div>
  );
}
