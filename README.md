# Kedai Kita — GitHub Pages

Pakej game lengkap daripada versi 11 (17 Oktober 2026).

## Cara pasang
1. Ekstrak ZIP ini dahulu. Pada iPad, buka aplikasi Files dan tekan fail ZIP.
2. Cipta repository GitHub, contohnya `kedai-kita`. Pilih Public jika menggunakan GitHub Free.
3. Muat naik SEMUA isi folder hasil ekstrak ke bahagian utama repository. Pastikan `index.html` berada terus pada root, bukan dalam subfolder lain. Kekalkan folder `assets` bersama kandungannya. Jangan muat naik ZIP sahaja.
4. Commit perubahan.
5. Buka Settings > Pages.
6. Di Source pilih Deploy from a branch. Pilih branch main dan folder /(root), kemudian Save.
7. Tunggu penerbitan selesai dan buka pautan yang dipaparkan dalam Settings > Pages.
   Bentuk pautan biasanya: https://USERNAME.github.io/kedai-kita/

Jika memuat naik melalui laman GitHub pada iPad tidak mengekalkan folder assets, muat naik lima fail utama dahulu. Kemudian gunakan Add file > Create new file untuk mencipta assets/README.txt, commit, buka folder assets dan muat naik keempat-empat fail audio di situ.

## Kandungan
- index.html — halaman utama
- style.css — reka bentuk dan animasi
- app.mjs, engine.mjs, art.mjs — logik game dan ilustrasi SVG
- assets/ — empat fail audio game
- .nojekyll — tetapan hosting statik (jika fail tersembunyi ini tidak termuat naik melalui iPad, fail game masih tiada kandungan Jekyll yang perlu diproses)

Tiada npm, build, API key atau server khas diperlukan. Semua pautan fail game adalah relatif, jadi sesuai untuk alamat repository GitHub Pages.

## Nota penggunaan
- Main melalui alamat HTTPS GitHub Pages. Membuka index.html terus dari Files mungkin menyekat modul JavaScript dan audio.
- Kemajuan disimpan pada pelayar dan alamat laman. Kemajuan di laman Kedai Kita yang lama tidak berpindah secara automatik ke GitHub Pages.
- Tekan mula atau berinteraksi dengan game untuk mengaktifkan bunyi jika pelayar menyekat autoplay.
- Ilustrasi produk, pelanggan dan wang dilukis oleh kod SVG. Audio disertakan dalam assets. Fon Google dimuat melalui internet; fon gantian digunakan jika tidak tersedia.
- Ini salinan versi semasa. Kemas kini pada laman asal selepas ini tidak dimasukkan secara automatik.

## Jika halaman kosong atau 404
Pastikan nama fail tepat index.html, semua lima fail utama berada pada root, folder assets lengkap, dan Pages menggunakan main / (root). Semak status penerbitan pada tab Actions.

Dokumentasi rasmi:
https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site

Semakan eksport: fail runtime sepadan dengan versi diterbitkan; rujukan tempatan lengkap. Versi game telah lulus 65 ujian fungsi. Penerbitan di akaun GitHub anda belum dilakukan.
