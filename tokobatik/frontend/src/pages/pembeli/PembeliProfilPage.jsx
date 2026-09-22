import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../AuthContext";
import { pembeliApi } from "../../api";
import PembeliSidebar from "../../components/PembeliSidebar";

export default function PembeliProfilPage() {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [form, setForm] = useState({
    nama_d: "",
    nama_b: "",
    email: "",
    phone: "",
    alamat: "",
    kelamin: "",
    lahir: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!token && !localStorage.getItem("token")) {
      navigate("/login", { replace: true });
      return;
    }
    if (user?.role === "admin") {
      navigate("/admin", { replace: true });
      return;
    }

    async function load() {
      setLoading(true);
      try {
        const me = await pembeliApi.getMe();
        setForm({
          nama_d: me.nama_d || "",
          nama_b: me.nama_b || "",
          email: me.email || "",
          phone: me.phone || "",
          alamat: me.alamat || "",
          kelamin: me.kelamin || "",
          lahir: me.lahir ? String(me.lahir).slice(0, 10) : "",
        });
      } catch (e) {
        setErr(e.message || "Gagal memuat profil.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user, token, navigate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setMsg("");
    setErr("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg("");
    setErr("");
    try {
      await pembeliApi.putMe(form);
      setMsg("Profil berhasil diperbarui.");
    } catch (e2) {
      setErr(e2.message || "Gagal menyimpan profil.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="d-flex min-vh-100" style={{ backgroundColor: "#f3f4f6" }}>
      <PembeliSidebar />
      <div className="flex-grow-1 d-flex flex-column">
        <header className="bg-white border-bottom px-4 py-3">
          <h4 className="fw-bold m-0 text-dark" style={{ fontSize: "1.25rem" }}>
            Profil Saya
          </h4>
        </header>
        <main className="flex-grow-1 p-4">
          {loading ? (
            <div className="text-secondary">Memuat...</div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="card border-0 shadow-sm bg-white p-4"
              style={{ borderRadius: 14, maxWidth: 640 }}
            >
              {msg && <div className="alert alert-success py-2 small">{msg}</div>}
              {err && <div className="alert alert-danger py-2 small">{err}</div>}

              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label small fw-medium">Nama depan</label>
                  <input name="nama_d" className="form-control" value={form.nama_d} onChange={handleChange} />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-medium">Nama belakang</label>
                  <input name="nama_b" className="form-control" value={form.nama_b} onChange={handleChange} />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-medium">Email</label>
                  <input name="email" type="email" className="form-control" value={form.email} disabled />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-medium">Telepon</label>
                  <input name="phone" className="form-control" value={form.phone} onChange={handleChange} />
                </div>
                <div className="col-12">
                  <label className="form-label small fw-medium">Alamat</label>
                  <textarea name="alamat" className="form-control" rows={2} value={form.alamat} onChange={handleChange} />
                </div>
              </div>

              <div className="d-flex flex-wrap gap-2 mt-4">
                <button
                  type="submit"
                  className="btn btn-dark rounded-pill px-4"
                  disabled={saving}
                >
                  {saving ? "Menyimpan..." : "Simpan profil"}
                </button>
                <Link to="/ubah-password" className="btn btn-outline-secondary rounded-pill px-4">
                  Ubah password
                </Link>
              </div>
            </form>
          )}
        </main>
      </div>
    </div>
  );
}
