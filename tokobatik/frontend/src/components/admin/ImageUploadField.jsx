import { useState } from 'react';
import { adminApi } from '../../api';
import { mediaUrl } from '../../utils';

export default function ImageUploadField({ value, onChange }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError('');

    try {
      // Mengirim file langsung melalui FormData ke API
      const response = await adminApi.uploadGambar(file);
      
      // Mengambil nama file atau path hasil upload secara aman
      const imagePath =
        response?.filename ||
        response?.path ||
        response?.url ||
        response?.gambar ||
        response?.data?.filename ||
        response?.data?.path ||
        '';

      if (onChange) {
        // Mengirimkan hasil path gambar ke state form utama
        onChange({ target: { name: 'gambar', value: imagePath } });
      }
    } catch (err) {
      setError(err.body?.message || err.message || 'Gagal mengunggah gambar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <input
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        disabled={loading}
        className="form-control"
      />

      {loading && (
        <small className="text-muted d-block mt-1">Mengunggah gambar...</small>
      )}

      {error && (
        <small className="text-danger d-block mt-1">{error}</small>
      )}

      {value && !loading && (
        <div className="mt-2 d-flex align-items-center gap-2">
          <img
            src={mediaUrl(value)}
            alt="Preview"
            className="rounded border"
            style={{ width: '60px', height: '60px', objectFit: 'cover' }}
          />
          <small className="text-muted text-truncate" style={{ maxWidth: '250px' }}>
            {value}
          </small>
        </div>
      )}
    </div>
  );
}