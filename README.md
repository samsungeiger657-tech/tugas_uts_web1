# BukuKu - Aplikasi Pemesanan Buku Online

UTS Pemrograman Web 1 · **Faizal Abdul Mu'id** · NIM 312510024 · Kelas I251A · Universitas Pelita Bangsa

🎥 **Video penjelasan:** https://youtube.com/GANTI-DENGAN-LINK-VIDEO
🌐 **Repository:** https://github.com/GANTI-USERNAME/tugas-uts-web1

## Deskripsi
Aplikasi web front-end sederhana untuk pemesanan buku di toko online. Tidak memakai server/database; data berasal dari `js/data.js` (array JSON) dan disimpan sementara di `localStorage`.

## Teknologi
HTML5 semantik · CSS (inline, internal, external) · JavaScript (DOM, validasi form, modal, alert)

## Struktur Folder
```
tugas-uts-web1/
├── index.html (login) · dashboard.html · stok.html · checkout.html · tracking.html
├── css/style.css
├── js/script.js · js/data.js
├── img/ (cover buku) · assets/ · screenshots/
```

## Cara Menjalankan
Buka `index.html` di browser. Akun demo: `rina@gmail.com` / `rina123` (user) atau `siti@gmail.com` / `siti123` (admin). Nomor DO contoh untuk tracking: `20230012` dan `20230013`.

## Penjelasan dan Tangkapan Layar
### 1. Login (`index.html`)
Validasi email/password; salah login memunculkan alert "Email/password yang anda masukkan salah". Tombol Lupa Password dan Daftar membuka modal.
![Login](screenshots/01-login.png)
![Alert login salah](screenshots/02-alert-login.png)
![Modal daftar](screenshots/03-modal-daftar.png)

### 2. Dashboard (`dashboard.html`)
Greeting pagi/siang/sore/malam berdasarkan jam lokal, statistik singkat, dan menu navigasi.
![Dashboard](screenshots/04-dashboard.png)

### 3. Stok/Katalog (`stok.html`)
Tabel dirender dinamis dari `dataKatalogBuku`, ada pencarian, tambah baris baru, dan hapus.
![Katalog](screenshots/05-stok.png)
![Tambah stok](screenshots/06-tambah-stok.png)

### 4. Pemesanan (`checkout.html`)
Keranjang (tambah/ubah/hapus), form pemesan dan pembayaran dengan validasi, laporan, dan history transaksi.
![Checkout](screenshots/07-checkout.png)
![Pesanan berhasil](screenshots/08-pesanan-berhasil.png)

### 5. Tracking (`tracking.html`)
Cari nomor DO, tampil nama pemesan, progress bar status, ekspedisi, tanggal kirim, jenis paket, total.
![Tracking](screenshots/09-tracking.png)
