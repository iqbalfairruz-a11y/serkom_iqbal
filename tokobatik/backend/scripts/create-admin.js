/**
 * Buat / reset akun admin default.
 * Jalankan: node scripts/create-admin.js
 * (pastikan MySQL jalan & schema sudah diimport)
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const bcrypt = require('bcrypt');
const db = require('../config/db');

async function main() {
  const email = 'admin@batiknusantara.com';
  const uname = 'admin';
  const plain = 'admin123';
  const hashed = await bcrypt.hash(plain, 10);

  const [existing] = await db.execute(
    'SELECT id FROM users WHERE email = ? OR uname = ?',
    [email, uname]
  );

  if (existing.length > 0) {
    await db.execute(
      `UPDATE users SET passwd = ?, role = 'admin', nama_d = 'Admin', nama_b = 'Toko' WHERE id = ?`,
      [hashed, existing[0].id]
    );
    console.log('Admin sudah ada — password direset ke: admin123');
  } else {
    await db.execute(
      `INSERT INTO users (nama_d, nama_b, kelamin, email, uname, passwd, role)
       VALUES (?, ?, ?, ?, ?, ?, 'admin')`,
      ['Admin', 'Toko', 'Laki-laki', email, uname, hashed]
    );
    console.log('Admin dibuat.');
  }
  console.log('Login: uname/email = admin / admin@batiknusantara.com');
  console.log('Password: admin123');
  process.exit(0);
}

main().catch((e) => {
  console.error('Gagal:', e.message);
  process.exit(1);
});
