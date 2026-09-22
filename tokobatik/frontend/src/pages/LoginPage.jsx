import React, { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../api";
import { AuthContext } from "../AuthContext";

export default function LoginPage() {
    const [form, setForm] = useState({ credential: "", passwd: "" });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const res = await api.login(form);
            const userData = res.user || { role: res.role, credential: form.credential };
            login(res.token, userData);

            if (res.role === "admin") {
                navigate("/admin");
            } else {
                navigate("/dashboard");
            }
        } catch (err) {
            setError(err.message || "Gagal masuk. Periksa kembali akun Anda.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container py-5 d-flex justify-content-center align-items-center" style={{ minHeight: "75vh" }}>
            <div className="card border shadow-sm p-4 p-md-5 rounded-4" style={{ maxWidth: "420px", width: "100%" }}>
                <h3 className="fw-bold mb-4 text-start">Login Akun</h3>

                {error && (
                    <div className="alert alert-danger py-2 small text-center mb-3" role="alert">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label className="form-label text-secondary fw-medium mb-1">
                            Email / Username:
                        </label>
                        <input
                            type="text"
                            name="credential"
                            className="form-control form-control-lg bg-light border-secondary-subtle fs-6 py-2"
                            value={form.credential}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="mb-4">
                        <label className="form-label text-secondary fw-medium mb-1">
                            Password:
                        </label>
                        <input
                            type="password"
                            name="passwd"
                            className="form-control form-control-lg bg-light border-secondary-subtle fs-6 py-2"
                            value={form.passwd}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn btn-dark btn-lg w-100 fw-semibold fs-6 py-2 rounded-3 mb-3"
                    >
                        {loading ? "Memproses..." : "Login"}
                    </button>
                </form>

                <div className="text-center mt-2">
                    <Link to="/" className="text-decoration-none text-secondary small fw-medium">
                        &larr; Kembali ke Beranda
                    </Link>
                </div>
            </div>
        </div>
    );
}