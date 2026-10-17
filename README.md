# Kedai Kita POS V5.4 — Full Version

Pakej ini mengandungi semua fail permainan yang lengkap untuk GitHub Pages.

## Pembetulan
- Menambah semula elemen tersembunyi `activityStatus` yang diperlukan oleh kod lama; reka bentuk minimal V5 kekal.
- `renderActivity()` kini selamat jika elemen tersebut tidak wujud atau tiada pelanggan sedang aktif.
- Ralat semasa memaparkan progres dibezakan daripada ralat membaca data. Progres tidak dipadam atau ditimpa semasa kegagalan paparan.
- CSS, JavaScript dan `version.json` menggunakan versi baharu V5.4 untuk mengelakkan cache Safari bercampur.

## Cara pasang
1. Backup folder atau repository GitHub Pages dahulu.
2. Extract ZIP dan muat naik **semua 14 fail terus ke root repository**, menggantikan fail lama. Jangan muat naik folder induk.
3. Commit dan tunggu GitHub Pages selesai deploy.
4. Buka URL asal ditambah `?v=pos54` dan log masuk seperti biasa.
5. Jangan padam database Firebase; **Rules V5 yang telah dipublish kekal sama**.

## Ujian
Lakukan ujian log masuk, sambung sesi yang disimpan, skrin syif, dan save selepas satu transaksi. Ujian pelayar dengan Firebase simulasi boleh dijalankan tanpa mengakses akaun sebenar.
