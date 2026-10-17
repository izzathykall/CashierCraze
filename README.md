# Kedai Kita — Firebase Realtime Database (Konfigurasi dipasang)

Projek Firebase yang digunakan: `kedaikita-60c28`

Realtime Database: `https://kedaikita-60c28-default-rtdb.asia-southeast1.firebasedatabase.app`

## Tindakan penting dalam Firebase Console (WAJIB)

1. Buka https://console.firebase.google.com/project/kedaikita-60c28/authentication/providers lalu aktifkan **Email/Password** di Sign-in method dan simpan. Jika belum mula Authentication, tekan Get started dahulu.
2. Pergi ke https://console.firebase.google.com/project/kedaikita-60c28/database , pilih **Realtime Database**. Jika database belum diwujudkan, create dahulu di region yang dikehendaki (URL dalam konfigurasi merujuk database tersebut).
3. Di Realtime Database > **Rules**, gantikan rules dengan kandungan `database.rules.json`, lalu klik **Publish**. Ini penting: jangan gunakan `.read: true` / `.write: true` secara umum. Path data: `users/{uid}/games/kedai-kita`.
4. Di **Authentication > Settings > Authorized domains**, pastikan domain GitHub Pages awak atau domain custom disenaraikan (contoh `USERNAME.github.io` tanpa `https://`, atau domain GPT Sites jika digunakan).

## Cara main dan pasang di GitHub Pages

- Pakej ini sudah mengandungi `firebase-config.js` yang siap diisi. **Tidak perlu edit lagi konfigurasi.**
- Upload **semua fail di dalam folder ZIP** (bukan folder tambahan) ke root repository GitHub Pages. Fail permulaan ialah `index.html`.
- Buka link GitHub Pages menggunakan HTTPS, kemudian daftar akaun menggunakan email dan kata laluan.
- Pilih log masuk supaya progres kerjaya disimpan ke Realtime Database setiap kali game melakukan save; cloud sync dijadualkan ~3 saat selepas perubahan dan fail tempatan disimpan sebagai sandaran.
- Pilih tetamu jika belum mahu login: progres hanya ada pada peranti tersebut. Bila login akaun kosong, game menawarkan pilihan import progres tetamu.
- Jangan serahkan password akaun Firebase atau service account file kepada sesiapa.

## Semak simpanan

Dalam Firebase Console > Realtime Database > Data, cari `users` > `[uid pemain]` > `games` > `kedai-kita`, yang mengandungi `state` dengan progres dan `updatedAt`.

## Penting

Kod Web Firebase boleh dimasukkan ke fail awam, tetapi **bukan kunci rahsia**. Keselamatan data pengguna dikawal oleh Authentication dan Realtime Database Rules.
Tidak ada akses Firebase Console dari fail ini: activation Authentication dan Publish Rules mesti dibuat oleh pemilik projek.
Ujian dengan Firebase simulasi bukan pengesahan sambungan sebenar: untuk ujian live, aktifkan Email/Password + peraturan dahulu dan buat akaun ujian sendiri.
Permainan di dua peranti secara serentak boleh menimpa simpanan sebelumnya, jadi gunakan satu peranti setiap masa.
Versi yang sudah live di GPT Sites tidak diperbaharui secara automatik.

## Fail

`index.html`, `style.css`, `app.mjs`, `engine.mjs`, `art.mjs`, `cloud.mjs`, `firebase-config.js`, audio, `database.rules.json`, dan fail HTML satu-fail `KedaiKita_Firebase_CONNECTED_PREVIEW.html`.
