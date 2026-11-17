# FileKu — Aplikasi berbagi file

Aplikasi web sederhana untuk upload, download, dan membagikan tautan file melalui WhatsApp. Frontend memakai Vite, penyimpanan memakai Supabase Storage, hosting frontend memakai Vercel.

## Isi fitur
- Upload beberapa file sekaligus atau memilih folder dari perangkat (isi folder diunggah sebagai file individual).
- PDF, Word, Excel, foto, video, ZIP, dan format lain yang diterima browser.
- Daftar 30 file terbaru.
- Tautan publik untuk download.
- Tombol berbagi melalui WhatsApp.
- Maksimum default 50 MB per file.

## A. Buat database dan penyimpanan Supabase
1. Buka https://supabase.com/ lalu daftar / login.
2. Buat project baru bernama `fileku`. Pilih region terdekat yang tersedia.
3. Simpan database password dengan aman.
4. Setelah project siap, buka **SQL Editor**.
5. Pilih **New query**, buka file `supabase.sql` dari paket ini, salin seluruh isinya, lalu jalankan (**Run**).
6. Buka **Project Settings > API** (atau API Keys).
7. Salin **Project URL** dan **anon / publishable public key**. Jangan gunakan `service_role` atau secret key di website.

## B. Masukkan konfigurasi Supabase
1. Buka file `src.js`.
2. Ganti dua baris paling atas:
   - `SUPABASE_URL` dengan Project URL milik Anda.
   - `SUPABASE_ANON_KEY` dengan anon/public key.
3. Simpan file.

Contoh bentuk URL: `https://abcdefgh.supabase.co`. Jangan menyalin contoh ini sebagai URL asli.

## C. Jalankan di komputer (opsional)
1. Instal Node.js versi LTS dari https://nodejs.org/
2. Ekstrak ZIP FileKu.
3. Buka terminal / Command Prompt di folder hasil ekstrak.
4. Jalankan:
   ```bash
   npm install
   npm run dev
   ```
5. Buka alamat lokal yang muncul di terminal (biasanya `http://localhost:5173`).

## D. Hosting gratis melalui Vercel
Cara paling mudah adalah melalui GitHub:
1. Buat akun di https://github.com/
2. Buat repository baru bernama `fileku`.
3. Upload semua isi folder project ini ke repository (pastikan `package.json`, `index.html`, `src.js`, `style.css`, `supabase.sql`, dan folder `public` berada di root).
4. Buka https://vercel.com/ dan daftar menggunakan GitHub.
5. Pilih **Add New > Project**, lalu impor repository `fileku`.
6. Framework akan terdeteksi sebagai Vite. Pastikan:
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`
7. Klik **Deploy**.
8. Setelah selesai, Vercel memberikan alamat website seperti `fileku-anda.vercel.app`.

Karena konfigurasi Supabase berada di `src.js`, pastikan URL dan public anon key sudah diisi sebelum deploy. Jika mengubah kode setelah deploy, push perubahan ke GitHub agar Vercel membangun ulang.

## E. Tes website
1. Buka URL Vercel.
2. Unggah file PDF kecil sebagai tes.
3. Pastikan file muncul pada bagian "File terbaru".
4. Klik Unduh untuk memastikan file bisa dibuka.
5. Klik WhatsApp untuk membagikan tautan.

## Batasan dan keamanan penting
- Ini adalah aplikasi **publik**: siapa pun yang mengetahui alamat website dapat mengunggah file dan melihat daftar file yang dibagikan.
- File dalam bucket publik dapat diakses oleh siapa pun yang memiliki URL. Jangan unggah dokumen pribadi, KTP, data bank, dokumen rahasia, atau file sensitif.
- Batas aplikasi default 50 MB per file. Batas bucket Supabase juga disetel 50 MB di SQL.
- Paket gratis memiliki kuota penyimpanan, bandwidth, dan penggunaan yang dapat berubah. Periksa halaman pricing Supabase dan Vercel sebelum dipakai secara luas.
- Kebijakan upload pada starter ini mengizinkan upload anonim. Ini cocok untuk demo/prototipe, tetapi rentan spam dan penyalahgunaan. Untuk penggunaan publik serius, tambahkan CAPTCHA, pembatasan laju (rate limit), moderasi, dan mekanisme penghapusan file.
- Daftar file menampilkan maksimal 30 unggahan terbaru.
- Tombol WhatsApp membuka WhatsApp dengan pesan dan tautan file; pengguna tetap menekan tombol kirim di WhatsApp.
- Jangan pernah memasukkan Supabase `service_role` key atau secret key ke kode frontend / GitHub.

## Struktur project
```text
fileku/
├── index.html
├── package.json
├── src.js
├── style.css
├── supabase.sql
├── README.md
└── public/
    └── _redirects
```
