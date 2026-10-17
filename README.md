# Kedai Kita — Firebase Realtime Database Edition

Versi penuh game Kedai Kita, dengan **Firebase Authentication** (daftar, log masuk, log keluar, lupa kata laluan) dan **Realtime Database** (simpan & muat progres mengikut UID pemain).

## Langkah aktifkan Cloud Save

1. Buka https://console.firebase.google.com/ dan pilih atau cipta projek Firebase.
2. Pergi ke **Project settings > Your apps > Web** dan daftar web app untuk dapat objek `firebaseConfig`.
3. Pergi ke **Build > Authentication > Sign-in method**, aktifkan **Email/Password**. Dalam **Settings > Authorized domains** tambah domain tempat game diterbitkan, jika perlu.
4. Pergi ke **Build > Realtime Database > Create database**, pilih lokasi, kemudian dapatkan URL pangkalan data (contoh: `https://PROJECT-ID-default-rtdb.asia-southeast1.firebasedatabase.app` atau `https://PROJECT-ID-default-rtdb.firebaseio.com`).
5. Dalam `firebase-config.js`, isikan **apiKey**, **authDomain**, **projectId**, **appId**, **messagingSenderId**, serta **databaseURL** sebenar yang dipaparkan dalam Realtime Database. Jangan guna URL contoh secara literal. Jangan kongsi kata laluan atau private key.
6. Dalam **Realtime Database > Rules**, salin kandungan `database.rules.json` dan klik **Publish**. Jangan gunakan rules public `read/write: true`.
7. Upload kandungan ZIP ke root repo GitHub Pages, termasuk `index.html`, `.mjs`, `.css`, `.js`, `.json` dan audio. `PREVIEW_SATU_FAIL.html` ialah alternatif satu fail dan tak perlu dimuat naik bersama versi berbilang fail. Web hosting mesti menyokong HTTPS.

## Apa yang disimpan

Di path `users/{UID}/games/kedai-kita`:

```json
{
  "version": 1,
  "state": {
    "progress": { "day": 2, "wallet": 2500, "served": 4 },
    "sound": true,
    "session": null
  },
  "updatedAt": 1780000000000
}
```

Objek `progress` sebenar turut mengandungi inventori, naik taraf, sejarah, tetapan, dan data operasi kedai. `session` disimpan apabila ada syif aktif. `updatedAt` menggunakan timestamp daripada server Firebase. Kata laluan tidak disimpan dalam Realtime Database.

## Cara simpanan berfungsi

- Selepas login, game cuba memuat progres dari Realtime Database bagi UID pemain tersebut.
- Sepanjang bermain, progres disimpan terus pada peranti dan **auto-sync ke Realtime Database selepas kira-kira 3 saat** ketika perubahan permainan disimpan. Label di bahagian resit menunjukkan status.
- Progres peranti yang belum berjaya disegerakkan tetap disimpan secara tempatan, kemudian cuba sync semula apabila talian pulih / login semula.
- Pilih bermain sebagai tetamu untuk menyimpan hanya pada peranti; pemain boleh memilih import progres tetamu apabila mencipta akaun kosong.
- Mod santai tidak mengubah progres kerjaya, mengikut sistem asal permainan.
- Jika akaun dimainkan pada dua peranti serentak, simpanan terkini boleh menimpa simpanan terdahulu. Untuk elak konflik, main pada satu peranti pada satu masa.
- Sambungan internet diperlukan untuk pendaftaran/login pertama dan sync. Firebase tertakluk pada kuota pelan.

## Fail siap pakai

- `KedaiKita_Realtime_Database_FULL.html` ialah fail tunggal untuk preview/browser. Ubah objek `window.KEDAI_FIREBASE_CONFIG` di dalamnya.
- `KedaiKita_Realtime_Database_GitHub_Pages.zip` mengandungi semua fail web untuk publish pada GitHub Pages.
- Game yang sudah live di GPT Sites **tidak dikemas kini secara automatik** oleh fail ini.

### Jika sebelum ini sudah menggunakan Firestore

Versi ini membaca **Realtime Database sahaja**. Rekod yang sudah tersimpan di Firestore tidak berpindah automatik. Jika pernah menyimpan di Firestore, backup atau migrasikan rekod terlebih dahulu. Simpanan tetamu/tempatan masih ada pada browser yang sama, melainkan browser data dipadam.
