import React, { useState } from "react";
// Import constant (sesuaikan jumlah titik '../' dengan lokasi file constants.js Anda)
import { KELAMIN, SITE } from "../../constants"; 

export default function AdminProfilPage() {
  const [profil, setProfil] = useState({
    namaDepan: "Admin",
    namaBelakang: "Sistem", 
    jenisKelamin: KELAMIN[0], // Mengambil "Laki-laki" dari constant
    tanggalLahir: "2000-01-01",
    alamat: SITE.alamat_toko, // Mengambil alamat dari constant SITE
    noTelepon: SITE.tlp_toko, // Mengambil no telepon dari constant SITE
    passwordBaru: "",
  });

  const [pesan, setPesan] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfil((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setPesan("Profil berhasil diperbarui!");
    setTimeout(() => setPesan(""), 3000);
  };

  return (
    <div className="container-fluid py-4 d-flex justify-content-center">
      <div 
        className="card border-0 shadow-sm rounded-4 bg-white p-4 p-md-5" 
        style={{ maxWidth: "800px", width: "100%" }}
      >
        {/* Header Profil */}
        <h3 className="fw-bold text-dark mb-1">Profil Admin</h3>
        <p className="text-secondary small mb-3">Ubah data pribadi dan password akun Anda</p>
        <hr className="mb-4 text-muted opacity-25" />

        {pesan && <div className="alert alert-success rounded-3 py-2 small mb-4">{pesan}</div>}

        <form onSubmit={handleSubmit}>
          {/* Row 1: Nama Depan & Nama Belakang */}
          <div className="row g-3 mb-3">
            <div className="col-md-6">
              <label className="form-label fw-semibold text-dark small mb-1">Nama Depan</label>
              <input
                type="text"
                className="form-control py-2"
                name="namaDepan"
                value={profil.namaDepan}
                onChange={handleChange}
                required
              />
            </div>
            <div className="col-md-6">
              <label className="form-label fw-semibold text-dark small mb-1">Nama Belakang</label>
              <input
                type="text"
                className="form-control py-2"
                name="namaBelakang"
                value={profil.namaBelakang}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Row 2: Jenis Kelamin & Tanggal Lahir */}
          <div className="row g-3 mb-3">
            <div className="col-md-6">
              <label className="form-label fw-semibold text-dark small mb-1">Jenis Kelamin</label>
              <select
                className="form-select py-2"
                name="jenisKelamin"
                value={profil.jenisKelamin}
                onChange={handleChange}
              >
                {/* Looping pilihan Jenis Kelamin dari constants.js */}
                {KELAMIN.map((kelamin, index) => (
                  <option key={index} value={kelamin}>
                    {kelamin}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-6">
              <label className="form-label fw-semibold text-dark small mb-1">Tanggal Lahir</label>
              <input
                type="date"
                className="form-control py-2"
                name="tanggalLahir"
                value={profil.tanggalLahir}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Row 3: Alamat */}
          <div className="mb-3">
            <label className="form-label fw-semibold text-dark small mb-1">Alamat</label>
            <textarea
              className="form-control py-2"
              rows="3"
              name="alamat"
              value={profil.alamat}
              onChange={handleChange}
            ></textarea>
          </div>

          {/* Row 4: No. Telepon / WhatsApp */}
          <div className="mb-4">
            <label className="form-label fw-semibold text-dark small mb-1">No. Telepon / WhatsApp</label>
            <input
              type="text"
              className="form-control py-2"
              name="noTelepon"
              value={profil.noTelepon}
              onChange={handleChange}
            />
          </div>

          <hr className="my-4 text-muted opacity-25" />

          {/* Row 5: Ganti Password (Opsional) */}
          <h6 className="fw-bold text-dark mb-3">Ganti Password (Opsional)</h6>
          <div className="mb-4">
            <label className="form-label fw-semibold text-dark small mb-1">Password Baru</label>
            <input
              type="password"
              className="form-control py-2"
              name="passwordBaru"
              placeholder="Kosongkan jika tidak ingin diubah"
              value={profil.passwordBaru}
              onChange={handleChange}
            />
          </div>

          <button type="submit" className="btn btn-dark rounded-3 px-4 py-2 fw-medium">
            Simpan Perubahan
          </button>
        </form>
      </div>
    </div>
  );
}