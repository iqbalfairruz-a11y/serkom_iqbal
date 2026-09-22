const mysql = require('mysql2');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_DATABASE || 'toko_batik',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Uji koneksi saat startup
pool.getConnection((err, connection) => {
  if (err) {
    console.error('Error connecting to the database:', err.message);
    console.error('Pastikan MySQL berjalan dan database "toko_batik" sudah dibuat.');
    return;
  }
  console.log('MySQL connected successfully');
  connection.release();
});

module.exports = pool.promise();
