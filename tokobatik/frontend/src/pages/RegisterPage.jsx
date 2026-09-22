import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api"; // Pastikan path import api.js sudah sesuai dengan struktur folder Anda

export default function RegisterPage() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        nama_d: "",
        nama_b: "",
        kelamin: "Laki-laki",
        lahir: "",
        alamat: "",
        phone: "",
        email: "",
        uname: "",
        passwd: "",
        confirmPassword: ""
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (formData.passwd !== formData.confirmPassword) {
            alert("Kata sandi dan konfirmasi kata sandi tidak cocok!");
            return;
        }

        try {
            setLoading(true);
            
            // Panggil API register ke backend (port 5000)
            // Menyesuaikan payload dengan yang diharapkan usersController.js backend Anda
            const payload = {
                nama_d: formData.nama_d,
                nama_b: formData.nama_b,
                kelamin: formData.kelamin,
                lahir: formData.lahir,
                alamat: formData.alamat,
                phone: formData.phone,
                email: formData.email,
                uname: formData.uname,
                passwd: formData.passwd,
                foto: ""
            };

            // Jika file api.js Anda menggunakan helper khusus, sesuaikan. 
            // Berikut contoh umum menggunakan fetch ke endpoint backend:
            const response = await fetch("http://localhost:5000/api/users/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || "Gagal melakukan registrasi");
            }

            alert("Pendaftaran berhasil! Silakan masuk dengan akun Anda.");
            navigate("/login"); 
        } catch (err) {
            console.error("Error register:", err);
            alert(err.message || "Terjadi kesalahan pada server");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container py-5">
            <div className="row justify-content-center align-items-center" style={{ minHeight: "80vh" }}>
                <div className="col-md-8 col-lg-7 col-xl-6">
                    
                    <div className="card border-0 shadow-sm rounded-4 overflow-hidden mb-5">
                        <div style={{ height: "6px", backgroundColor: "#8B1E3F" }}></div>
                        
                        <div className="card-body p-4 p-sm-5">
                            <div className="text-center mb-4">
                                <h3 className="fw-bold text-dark mb-2">Daftar Akun</h3>
                                <p className="text-secondary small">
                                    Bergabunglah dengan Batik Nusantara untuk kemudahan mendapatkan kain dan pakaian batik berkualitas.
                                </p>
                            </div>

                            <form onSubmit={handleSubmit}>
                                <div className="row">
                                    <div className="col-md-6 mb-3">
                                        <div className="form-floating">
                                            <input type="text" className="form-control" id="inputNamaD" name="nama_d" placeholder="Nama Depan" value={formData.nama_d} onChange={handleChange} required />
                                            <label htmlFor="inputNamaD" className="text-secondary">Nama Depan</label>
                                        </div>
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <div className="form-floating">
                                            <input type="text" className="form-control" id="inputNamaB" name="nama_b" placeholder="Nama Belakang" value={formData.nama_b} onChange={handleChange} />
                                            <label htmlFor="inputNamaB" className="text-secondary">Nama Belakang (Opsional)</label>
                                        </div>
                                    </div>
                                </div>

                                <div className="row">
                                    <div className="col-md-6 mb-3">
                                        <div className="form-floating">
                                            <input type="text" className="form-control" id="inputUname" name="uname" placeholder="Username" value={formData.uname} onChange={handleChange} required />
                                            <label htmlFor="inputUname" className="text-secondary">Username</label>
                                        </div>
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <div className="form-floating">
                                            <input type="email" className="form-control" id="inputEmail" name="email" placeholder="name@example.com" value={formData.email} onChange={handleChange} required />
                                            <label htmlFor="inputEmail" className="text-secondary">Alamat Email</label>
                                        </div>
                                    </div>
                                </div>

                                <div className="row">
                                    <div className="col-md-6 mb-3">
                                        <div className="form-floating">
                                            <select className="form-select" id="inputKelamin" name="kelamin" value={formData.kelamin} onChange={handleChange}>
                                                <option value="Laki-laki">Laki-laki</option>
                                                <option value="Perempuan">Perempuan</option>
                                            </select>
                                            <label htmlFor="inputKelamin" className="text-secondary">Jenis Kelamin</label>
                                        </div>
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <div className="form-floating">
                                            <input type="date" className="form-control" id="inputLahir" name="lahir" value={formData.lahir} onChange={handleChange} required />
                                            <label htmlFor="inputLahir" className="text-secondary">Tanggal Lahir</label>
                                        </div>
                                    </div>
                                </div>

                                <div className="form-floating mb-3">
                                    <input type="tel" className="form-control" id="inputPhone" name="phone" placeholder="08123456789" value={formData.phone} onChange={handleChange} required />
                                    <label htmlFor="inputPhone" className="text-secondary">No. Telepon / WhatsApp</label>
                                </div>

                                <div className="form-floating mb-3">
                                    <textarea className="form-control" id="inputAlamat" name="alamat" placeholder="Alamat Lengkap" style={{ height: "80px" }} value={formData.alamat} onChange={handleChange} required></textarea>
                                    <label htmlFor="inputAlamat" className="text-secondary">Alamat Lengkap</label>
                                </div>

                                <div className="row">
                                    <div className="col-md-6 mb-3">
                                        <div className="form-floating">
                                            <input type="password" className="form-control" id="inputPassword" name="passwd" placeholder="Password" value={formData.passwd} onChange={handleChange} required minLength="6" />
                                            <label htmlFor="inputPassword" className="text-secondary">Kata Sandi</label>
                                        </div>
                                    </div>
                                    <div className="col-md-6 mb-4">
                                        <div className="form-floating">
                                            <input type="password" className="form-control" id="inputConfirmPassword" name="confirmPassword" placeholder="Konfirmasi Password" value={formData.confirmPassword} onChange={handleChange} required />
                                            <label htmlFor="inputConfirmPassword" className="text-secondary">Konfirmasi Kata Sandi</label>
                                        </div>
                                    </div>
                                </div>

                                <button type="submit" className="btn w-100 py-3 fw-bold text-white rounded-3 mb-4 shadow-sm" style={{ backgroundColor: "#8B1E3F" }} disabled={loading}>
                                    {loading ? "Memproses..." : "Buat Akun Sekarang"}
                                </button>

                                <p className="text-center text-secondary mb-4">
                                    Sudah punya akun?{" "}
                                    <Link to="/login" className="text-decoration-none fw-semibold" style={{ color: "#8B1E3F" }}>
                                        Masuk di sini
                                    </Link>
                                </p>

                                <div className="text-center mt-2 pt-3 border-top">
                                    <Link to="/" className="text-decoration-none text-secondary small fw-medium d-inline-flex align-items-center gap-2">
                                        &larr; Kembali ke Beranda
                                    </Link>
                                </div>

                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}