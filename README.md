# Kedai Kita POS V5.3 — Pakej Penuh

Pakej ini mengandungi **semua fail** game termasuk index.html, CSS, JavaScript, audio, konfigurasi projek dan peraturan Realtime Database.

## Cara ganti GitHub Pages
1. Buat backup repository atau download ZIP sedia ada dahulu.
2. Extract ZIP ini. Upload **kandungan folder** (fail terus di root repository), bukan satu folder tambahan.
3. Replace fail dengan nama yang sama dan Commit. Pastikan `index.html`, `app.mjs`, `cloud.mjs`, `firebase-config.js`, `version.json` semuanya berada di root.
4. Pastikan Pages deploy berjaya. Buka semula pautan laman dan tambah `?v=pos53` untuk semakan cache.
5. Aktifkan Firebase Authentication Email/Password. Pastikan Realtime Database Rules selaras dengan fail `database.rules.json`; publish Rules di Firebase Console jika belum, upload JSON ke GitHub sahaja tidak mengaktifkannya.

## Keselamatan progres
- **Jangan padam** `/users`, `/activeSessions` atau data Firebase sedia ada.
- Bacaan gagal tidak akan mengimport progres tetamu atau menyimpan progres kosong secara automatik ke akaun.
- Mod tetamu menggunakan simpanan setempat yang berasingan. Jangan pilih mula baharu bagi akaun yang masih ada progres belum disegerakkan.

## Pembaikan V5.3
- Memperbaiki pemulihan sesi masuk ketika Firebase memulangkan pengguna belum log masuk, mengelakkan render ulang simpanan tetamu yang boleh mencetuskan `TypeError`.
- Menambah maklumat ralat dan log diagnostik yang lebih tepat.
- Memuatkan fail aplikasi dan CSS menggunakan penanda versi yang seragam untuk kurangkan masalah cache Safari.
- Mengekalkan POS V5: kawalan, pembayaran kad interaktif, refund, sistem sesi aktif dan simpanan Realtime Database.

## Nota
Sambungan sebenar ke akaun Firebase milik anda tidak diuji secara langsung. Jalankan ujian log masuk dan sambung syif pada Safari selepas deploy.
