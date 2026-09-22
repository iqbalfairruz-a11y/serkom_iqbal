-- phpMyAdmin SQL Dump
-- Database: toko_batik (diubah dari toko_pkl - Toko Batik Nusantara)
-- Generation Time: Sep 14, 2026

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `toko_batik`
--

-- --------------------------------------------------------

--
-- Table structure for table `artikel`
--

CREATE TABLE `artikel` (
  `id` int(11) NOT NULL,
  `judul` varchar(225) NOT NULL,
  `ringkasan` text NOT NULL,
  `isi` text NOT NULL,
  `gambar` varchar(500) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `artikel`
--

INSERT INTO `artikel` (`id`, `judul`, `ringkasan`, `isi`, `gambar`, `created_at`, `updated_at`) VALUES
(1, 'Mengenal Motif Batik Klasik: Dari Parang hingga Kawung', 'Setiap motif batik memiliki makna filosofis yang mendalam. Memahami arti di balik pola-pola klasik membantu Anda memilih batik yang tepat untuk berbagai acara.', 'Batik Indonesia telah diakui UNESCO sebagai Warisan Budaya Takbenda. Motif-motif klasik seperti Parang, Kawung, Truntum, dan Mega Mendung bukan sekadar hiasan, melainkan bahasa visual yang menyampaikan doa, status sosial, dan nilai-nilai kehidupan.\n\n1. Motif Parang\nMotif ini menyerupai deretan bilah pedang yang miring. Secara filosofis, Parang melambangkan kekuatan, keteguhan, dan semangat pantang menyerah. Dulu motif ini hanya boleh dikenakan oleh kalangan kerajaan. Kini Parang menjadi pilihan populer untuk acara formal dan kerja.\n\n2. Motif Kawung\nBentuknya mirip buah kolang-kaling atau mata buah aren yang tersusun rapi. Kawung melambangkan kesucian, pengendalian diri, dan kesempurnaan. Cocok untuk acara resmi maupun sehari-hari.\n\n3. Motif Mega Mendung\nBerasal dari Cirebon, motif awan yang bergelombang ini melambangkan kesabaran dan keteduhan. Warna biru dan merahnya yang khas membuatnya sangat menarik sebagai koleksi modern.\n\nDi Batik Nusantara, kami menyediakan berbagai motif klasik dan kontemporer yang sudah dikurasi kualitasnya. Pilih batik yang tidak hanya indah dipandang, tetapi juga bermakna.', '/uploads/images/1788229821396-464651961.jpeg', '2026-09-01 09:30:22', '2026-09-01 09:30:22'),
(2, 'Cara Merawat Kain Batik Agar Warna Tetap Awet', 'Batik adalah investasi. Dengan perawatan yang benar, warna dan serat kain bisa bertahan bertahun-tahun tanpa pudar atau rusak.', 'Banyak orang mengeluh batiknya cepat luntur atau kaku setelah dicuci. Padahal, dengan teknik perawatan yang tepat, batik tulis maupun cap bisa tetap indah dalam waktu lama.\n\n1. Cuci dengan tangan, hindari mesin cuci\nGunakan air dingin atau suhu ruang. Jangan merendam terlalu lama. Gosok pelan-pelan, fokus pada bagian yang kotor saja.\n\n2. Gunakan sabun lembut khusus batik atau baby shampoo\nHindari deterjen biasa yang mengandung pemutih dan pewangi keras. Sabun yang lembut menjaga warna natural dari malam dan pewarna alami.\n\n3. Jangan jemur di bawah sinar matahari langsung\nJemur di tempat teduh dengan posisi terbalik (bagian dalam menghadap luar) agar warna tidak cepat pudar.\n\n4. Setrika dengan suhu rendah dan kain pelapis\nJangan langsung menekan setrika ke permukaan motif. Gunakan kain tipis sebagai pelapis agar malam (wax) tidak meleleh dan motif tetap tajam.\n\n5. Simpan dengan benar\nLipat rapi atau gantung dengan hanger. Hindari menyimpan di tempat lembap agar tidak berjamur. Untuk koleksi berharga, bungkus dengan kertas tissue atau kain katun bersih.\n\nTim Batik Nusantara siap membantu Anda memilih produk perawatan batik yang tepat. Jangan ragu berkonsultasi saat berbelanja di toko kami.', '/uploads/images/1788229853197-255225787.jpeg', '2026-09-01 09:30:54', '2026-09-01 09:30:54'),
(3, 'Perbedaan Batik Tulis, Cap, dan Printing: Mana yang Cocok untuk Anda?', 'Tidak semua batik dibuat dengan cara yang sama. Memahami perbedaan teknik produksi membantu Anda menentukan kualitas dan harga yang sesuai kebutuhan.', 'Di pasaran, kata \"batik\" sering digunakan untuk berbagai jenis kain bermotif. Padahal secara teknis ada perbedaan besar antara batik tulis, batik cap, dan batik printing.\n\n1. Batik Tulis\nDibuat sepenuhnya dengan tangan menggunakan canting. Setiap goresan unik, tidak ada dua lembar yang 100% sama. Prosesnya memakan waktu berhari-hari hingga berminggu-minggu. Harga lebih tinggi, cocok untuk koleksi, hadiah istimewa, atau acara resmi.\n\n2. Batik Cap\nMenggunakan stempel tembaga (cap) yang dicelup malam lalu ditekan ke kain. Motif lebih seragam dibanding tulis, namun tetap memiliki karakter kerajinan tangan. Harga lebih terjangkau, cocok untuk pakaian sehari-hari dan seragam.\n\n3. Batik Printing (Sablon)\nMotif dicetak dengan mesin atau sablon. Produksi massal, harga paling ekonomis, motif sangat rapi dan konsisten. Ideal untuk fashion kasual, kaos, atau kebutuhan dalam jumlah besar.\n\nDi Batik Nusantara kami menyediakan ketiganya. Untuk kualitas premium kami prioritaskan batik tulis dan cap dari pengrajin terpercaya. Tim kami siap menjelaskan detail setiap produk agar Anda mendapatkan batik sesuai kebutuhan dan anggaran.', '/uploads/images/1788229891333-712202133.jpeg', '2026-09-01 09:31:33', '2026-09-01 09:31:33'),
(4, 'Batik Nusantara: Melestarikan Warisan, Menghadirkan Gaya Modern', 'Kami percaya batik bukan hanya warisan masa lalu, tetapi juga bagian dari gaya hidup masa kini. Batik Nusantara hadir sebagai mitra fashion yang menghargai tradisi sekaligus mengikuti tren.', 'Bagi sebagian orang, batik masih dianggap pakaian untuk acara resmi saja. Padahal, dengan desain yang tepat, batik bisa dikenakan sehari-hari—ke kantor, hangout, hingga traveling.\n\nVisi kami sederhana: mempermudah akses masyarakat terhadap batik berkualitas dengan harga yang adil, sekaligus mendukung pengrajin lokal agar tradisi ini terus hidup.\n\nMengapa memilih Batik Nusantara?\n• Keaslian dan kualitas terjamin — Kami bekerja sama langsung dengan pengrajin dan distributor resmi. Setiap kain dicek motif, pewarnaan, dan finishing-nya.\n• Pilihan lengkap — Dari kain meteran, kemeja, dress, blazer, hingga aksesoris seperti selendang dan pouch.\n• Konsultasi ramah — Belum tahu motif mana yang cocok untuk acara tertentu? Tim kami siap membantu memilih berdasarkan warna kulit, jenis acara, dan preferensi gaya.\n• Dukungan untuk UMKM batik — Sebagian koleksi kami berasal dari pengrajin independen di Solo, Yogyakarta, Pekalongan, dan Cirebon.\n\nKeberhasilan kami diukur dari kepuasan pelanggan yang bangga mengenakan batik, bukan sekadar dari angka penjualan. Mari lestarikan warisan bersama kami.', '/uploads/images/1788229919953-748256598.jpeg', '2026-09-01 09:32:01', '2026-09-01 09:32:01'),
(5, 'Tips Memilih Batik untuk Acara Formal dan Kasual', 'Pemilihan batik yang tepat membuat penampilan Anda lebih percaya diri. Berikut panduan praktis memilih motif, warna, dan potongan sesuai jenis acara.', 'Banyak orang bingung saat harus memilih batik untuk undangan resmi, kerja, atau jalan-jalan santai. Berikut tip praktis dari kami:\n\n1. Acara Formal (pernikahan, wisuda, resepsi resmi)\nPilih motif klasik seperti Parang, Kawung, atau Sido Mukti dengan warna dark (hitam, cokelat tua, biru navy, merah marun). Potongan kemeja lengan panjang atau dress dengan siluet rapi lebih elegan. Hindari motif terlalu ramai atau warna neon.\n\n2. Kerja / Office Wear\nMotif yang tidak terlalu besar dan warna netral atau pastel lebih aman. Kemeja batik dengan potongan slim fit atau regular cocok dipadukan dengan celana chino atau rok pensil. Untuk wanita, blouse batik dengan celana kulot juga sangat stylish.\n\n3. Kasual & Hangout\nBebaskan kreativitas. Motif kontemporer, warna cerah, atau batik printing dengan potongan oversized, kemeja short sleeve, atau outer longline sangat nyaman. Padukan dengan jeans atau sneakers untuk tampilan modern.\n\n4. Perhatikan kualitas kain\nSentuh dan lihat detail motif. Batik tulis biasanya memiliki sedikit ketidaksempurnaan yang justru menandakan keaslian. Pastikan warna tidak mudah luntur saat digosok pelan dengan tangan basah.\n\nDatang ke Batik Nusantara dan coba beberapa pilihan. Tim kami akan membantu mencocokkan batik dengan kebutuhan Anda.', '/uploads/images/1788229953214-274250545.jpeg', '2026-09-01 09:32:34', '2026-09-01 09:32:34'),
(6, 'Tren Batik Modern: Memadukan Tradisi dengan Fashion Kontemporer', 'Batik kini hadir dalam siluet streetwear, outerwear, hingga ready-to-wear minimalis. Berikut tren yang sedang naik daun dan cara mengikutinya tanpa kehilangan jiwa tradisional.', 'Generasi muda semakin mencintai batik, tetapi dengan cara yang berbeda dari orang tua mereka. Mereka menginginkan batik yang nyaman, versatile, dan bisa dipakai di berbagai kesempatan.\n\nTren yang sedang populer:\n1. Batik Outer & Kimono Style\nLong outer atau kimono berbahan batik tipis sangat cocok untuk layering. Bisa dipakai di atas kaos polos atau dress simple.\n\n2. Motif Abstrak & Kontemporer\nPengrajin muda banyak mengeksplorasi motif yang lebih bebas, tidak terikat pakem klasik, dengan palet warna earth tone atau pastel.\n\n3. Mix and Match dengan Bahan Lain\nBatik dipadukan dengan denim, linen, atau katun polos menciptakan tampilan fresh. Misalnya kemeja batik dengan celana cargo, atau skirt batik dengan sweater rajut.\n\n4. Aksesoris Batik\nPouch, tote bag, bandana, dan sepatu dengan aksen batik menjadi cara mudah menambah sentuhan tradisional tanpa harus full outfit batik.\n\nDi Batik Nusantara kami terus memperbarui koleksi agar tetap relevan dengan tren, tanpa mengorbankan kualitas dan makna budaya. Kunjungi toko atau hubungi kami untuk melihat koleksi terbaru.', '/uploads/images/1788229979940-611963200.jpeg', '2026-09-01 09:33:01', '2026-09-01 09:33:01');

-- --------------------------------------------------------

--
-- Table structure for table `pembelian`
--

CREATE TABLE `pembelian` (
  `id` int(11) NOT NULL,
  `id_pembeli` int(11) NOT NULL,
  `id_produk` int(11) NOT NULL,
  `nama_pembeli` varchar(50) DEFAULT NULL,
  `alamat_pembeli` text DEFAULT NULL,
  `phone_pembeli` bigint(20) DEFAULT NULL,
  `metode_pembayaran` enum('Bank Transfer','COD') NOT NULL DEFAULT 'COD',
  `pembayaran` enum('Belum','Dibayar') NOT NULL DEFAULT 'Belum',
  `pengiriman` enum('JNT Express','JNE') NOT NULL DEFAULT 'JNT Express',
  `status` enum('Tertunda','Dikemas','Dikirim','Diterima','Selesai') NOT NULL DEFAULT 'Tertunda',
  `catatan` text DEFAULT NULL,
  `foto_bukti` varchar(500) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `total_harga` int(11) NOT NULL,
  `kurir` varchar(100) DEFAULT NULL,
  `alamat_pengiriman` text DEFAULT NULL,
  `jumlah` int(11) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- (kosong - toko baru, belum ada pesanan)

-- --------------------------------------------------------

--
-- Table structure for table `produk`
--

CREATE TABLE `produk` (
  `id_produk` int(11) NOT NULL,
  `nama_produk` varchar(255) NOT NULL,
  `deskripsi` text NOT NULL,
  `harga` int(11) NOT NULL,
  `gambar` varchar(500) DEFAULT NULL,
  `kategori` enum('Kain Batik','Pakaian Batik','Aksesoris') NOT NULL DEFAULT 'Kain Batik',
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `stok` int(11) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `produk`
--

INSERT INTO `produk` (`id_produk`, `nama_produk`, `deskripsi`, `harga`, `gambar`, `kategori`, `created_at`, `updated_at`, `stok`) VALUES
(1, 'Kain Batik Tulis Parang Klasik', 'Kain batik tulis motif Parang klasik dari Solo. Dibuat dengan canting oleh pengrajin berpengalaman. Bahan katun primissima, cocok untuk dibuat kemeja, dress, atau blazer. Lebar kain ±210 cm.', 450000, '/uploads/images/1788230283851-974590271.jpg', 'Kain Batik', '2026-09-01 09:38:03', '2026-09-03 10:03:40', 25),
(2, 'Kemeja Batik Cap Kawung', 'Kemeja pria lengan panjang motif Kawung. Bahan katun nyaman, potongan regular fit. Cocok untuk kerja, acara formal, maupun semi-formal. Tersedia ukuran M–XXL.', 285000, '/uploads/images/1788230319437-35865683.jpg', 'Pakaian Batik', '2026-09-01 09:38:39', '2026-09-03 10:03:27', 40),
(3, 'Dress Batik Mega Mendung', 'Dress wanita motif Mega Mendung Cirebon. Siluet A-line nyaman, lengan pendek, bahan katun adem. Cocok untuk acara resmi maupun sehari-hari. Tersedia ukuran S–L.', 375000, '/uploads/images/1788230359343-697634609.jpg', 'Pakaian Batik', '2026-09-01 09:39:19', '2026-09-03 09:01:38', 30),
(4, 'Kain Batik Cap Truntum', 'Kain batik cap motif Truntum berwarna cokelat-krem. Motif klasik yang melambangkan cinta yang tumbuh. Bahan katun, cocok untuk kebaya atau kemeja. Lebar ±210 cm.', 195000, '/uploads/images/1788230401271-439051008.jpg', 'Kain Batik', '2026-09-01 09:40:01', '2026-09-03 09:33:21', 50),
(5, 'Selendang Batik Tulis', 'Selendang/scarf batik tulis motif flora. Bisa dipakai sebagai aksesoris leher, hijab accent, atau hiasan pinggang. Bahan sutra campuran yang jatuh indah.', 125000, '/uploads/images/1788230445932-125038014.jpg', 'Aksesoris', '2026-09-01 09:40:45', '2026-09-03 09:29:53', 60),
(6, 'Blazer Batik Modern', 'Blazer unisex motif batik kontemporer. Potongan modern, bahan katun tebal yang tetap nyaman. Cocok dipadukan dengan kaos polos atau kemeja dalaman.', 425000, '/uploads/images/1788230602237-49020453.jpg', 'Pakaian Batik', '2026-09-01 09:43:22', '2026-09-03 08:59:36', 20),
(7, 'Kain Batik Printing Premium', 'Kain batik printing motif abstrak modern. Warna stabil, motif tajam, harga lebih ekonomis. Cocok untuk seragam komunitas, fashion kasual, atau kerajinan. Lebar ±110 cm.', 85000, '/uploads/images/1788230669521-655442303.jpg', 'Kain Batik', '2026-09-01 09:44:29', '2026-09-03 08:53:37', 100),
(8, 'Tote Bag Batik', 'Tas tote berbahan kain batik dengan lining dalam. Kuat, stylish, dan praktis untuk belanja atau kerja. Motif beragam, setiap pcs unik.', 95000, '/uploads/images/1788401040031-843496756.jpeg', 'Aksesoris', '2026-09-01 09:45:10', '2026-09-03 09:04:00', 45),
(9, 'Kemeja Batik Short Sleeve', 'Kemeja batik pria lengan pendek motif kontemporer. Bahan adem, potongan slim. Ideal untuk cuaca tropis dan gaya kasual smart.', 225000, '/uploads/images/1788230750391-74550604.jpg', 'Pakaian Batik', '2026-09-01 09:45:50', '2026-09-03 08:52:01', 35),
(10, 'Kain Batik Tulis Sido Mukti', 'Kain batik tulis motif Sido Mukti (kebahagiaan & kemakmuran). Warna biru-cokelat elegan. Sangat cocok untuk acara pernikahan atau sebagai hadiah istimewa.', 550000, '/uploads/images/1788398570311-639029398.jpeg', 'Kain Batik', '2026-09-01 09:46:27', '2026-09-03 08:51:17', 15),
(11, 'Pouch / Dompet Kecil Batik', 'Pouch kecil berbahan batik untuk kosmetik, kabel, atau barang kecil. Resleting kuat, ukuran praktis. Hadiah unik yang terjangkau.', 45000, '/uploads/images/1788230822569-837680225.jpg', 'Aksesoris', '2026-09-01 09:47:02', '2026-09-03 08:50:48', 80),
(12, 'Outer Longline Batik', 'Outer panjang motif batik earth tone. Cocok untuk layering gaya modern. Bahan jatuh, nyaman dipakai seharian.', 320000, '/uploads/images/1788397572219-931856119.jpeg', 'Pakaian Batik', '2026-09-03 08:06:12', '2026-09-03 08:48:44', 28);

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `nama_d` varchar(50) NOT NULL,
  `nama_b` varchar(50) NOT NULL,
  `kelamin` text NOT NULL,
  `lahir` text NOT NULL,
  `alamat` text NOT NULL,
  `phone` bigint(20) NOT NULL,
  `email` varchar(30) NOT NULL,
  `role` enum('admin','pembeli') NOT NULL DEFAULT 'pembeli',
  `uname` varchar(30) NOT NULL,
  `passwd` varchar(256) NOT NULL,
  `foto` varchar(500) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users` (hanya admin - toko baru)
--

INSERT INTO `users` (`id`, `nama_d`, `nama_b`, `kelamin`, `lahir`, `alamat`, `phone`, `email`, `role`, `uname`, `passwd`, `foto`, `created_at`, `updated_at`) VALUES
(1, 'Budi', 'Santoso', 'Laki-laki', '2000-01-01', 'Jl. Mawar No. 12', 628123456789, 'budi@gmail.com', 'admin', 'budi123', '$2b$10$K03LvM.Q1234567890123uR4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s', '', '2026-08-24 10:56:21', '2026-08-26 14:16:12'),
(5, 'Admin', 'Utama', 'Laki-laki', '2000-01-01', 'Jl. Admin', 628123456789, 'admin@gmail.com', 'admin', 'admin', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'default.jpg', '2026-08-26 14:18:50', '2026-08-26 14:18:50');

--
-- Indexes for dumped tables
--

ALTER TABLE `artikel`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `pembelian`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_pembelian_user` (`id_pembeli`),
  ADD KEY `fk_pembelian_produk` (`id_produk`);

ALTER TABLE `produk`
  ADD PRIMARY KEY (`id_produk`);

ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_users_email` (`email`),
  ADD UNIQUE KEY `uq_users_uname` (`uname`);

--
-- AUTO_INCREMENT
--

ALTER TABLE `artikel`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

ALTER TABLE `pembelian`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1;

ALTER TABLE `produk`
  MODIFY `id_produk` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- Constraints
--

ALTER TABLE `pembelian`
  ADD CONSTRAINT `fk_pembelian_produk` FOREIGN KEY (`id_produk`) REFERENCES `produk` (`id_produk`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_pembelian_user` FOREIGN KEY (`id_pembeli`) REFERENCES `users` (`id`) ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
