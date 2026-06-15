# Panduan Deployment ke VPS

Berikut adalah langkah-langkah untuk mendeploy aplikasi SimPend ini ke VPS (Virtual Private Server) berbasis Linux (Ubuntu/Debian).

## 1. Persiapan VPS
Pastikan VPS Anda sudah ter-install:
- **Node.js** (Versi 18 atau ke atas)
- **Git**
- **PM2** (Untuk menjaga aplikasi tetap berjalan di background)
- **Nginx** (Sebagai reverse proxy, direkomendasikan)

Install PM2 secara global:
```bash
sudo npm install -g pm2
```

## 2. Kloning & Install Dependensi
Upload source code secara manual (melalui FTP/SCP) ke server atau gunakan Git. Di direktori proyek, jalankan:
```bash
npm install
```

## 3. Build Aplikasi (Server + Klien)
Aplikasi ini sudah dikonfigurasi untuk build penuh. Cukup jalankan perintah:
```bash
npm run build
```
Ini akan meng-kompilasi frontend dan backend, dan meletakkannya di folder `dist`.

## 4. Menjalankan Aplikasi
Aplikasi dilengkapi dengan file \`ecosystem.config.js\`. Jalankan aplikasi dengan PM2:
```bash
pm2 start ecosystem.config.js
```
Aplikasi sekarang berjalan di PORT \`3000\`.

## 5. Menjalankan PM2 saat Boot (Otomatis)
Agar aplikasi tetap jalan jika VPS di-restart:
```bash
pm2 save
pm2 startup
```
(lalu copy-paste dan jalankan perintah yang muncul pada terminal)

---

## Catatan Data dan Keamanan
- File database disimpan dalam file \`database.json\`. Back-up file ini secara berkala.
- Gambar modul disimpan pada folder \`uploads/\`. Folder ini terbentuk otomatis. Back-up folder ini agar gambar/progress game tidak hilang.
- Di sisi Nginx, Anda dapat melakukan konfigurasi Reverse Proxy ke \`http://127.0.0.1:3000\` serta menambahkan SSL.
