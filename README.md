# 🌱 Kebun Tugas

![Expo SDK 57](https://img.shields.io/badge/Expo-SDK%2057-6B4EFF?logo=expo&logoColor=white)
![React Native 0.86](https://img.shields.io/badge/React%20Native-0.86-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white)
![Privasi](https://img.shields.io/badge/Privasi-100%25%20Offline-34D3A5)
![Akun](https://img.shields.io/badge/Akun-tidak%20ada-FF7A66)

> **Rawat kebun belajarmu, panen nilai terbaikmu.**
> Manajer tugas & jadwal kuliah untuk mahasiswa Indonesia — gamifikasi, ramah privasi.

Dibangun piksel demi piksel dari design system Figma `Kebun Tugas`, salah satu produk desain untuk kompetisi. Sepenuhnya offline, hemat baterai, tanpa pengawasan, tanpa akun.

Setiap tugas adalah tanaman. Tanam, pantau tumbuh menjelang deadline, dan ia **mekar 🌸** begitu kamu menyelesaikannya tepat waktu. Terlambat? Ia layu — kebunmu jujur menceritakan kondisi semestermu sekilas pandang.

---

## 🌿 Tahapan Tugasmu

Setiap tugas tampil sebagai tanaman SVG gambar-tangan yang tahapnya mengikuti status — bukan emoji, bukan clip-art:

| Tahap | Status | Arti |
|---|---|---|
| 🌱 **Tunas** | Deadline ≤ 3 hari | Baru ditanam, perlu perhatian |
| 🌿 **Tumbuh** | Deadline masih jauh | Tumbuh tenang di latar |
| 🌸 **Mekar** | Selesai tepat waktu | Diberi reward: +10 koin, streak bertambah |
| 🥀 **Layu** | Terlambat | Koin tetap diberi, streak terjaga — jujur, tanpa menghukum |

---

## ✨ Fitur

- **🌸 Animasi Mekar:** Selesaikan tugas tepat waktu → animasi bunga mekar dengan fisika spring (Reanimated).
- **🌱 Loop Kebiasaan Bergamifikasi:** Kumpulkan koin & streak. Tugas selesai telat ditandai **Selesai Terlambat** — koin tetap diberi, streak terlindungi.
- **🪴 Empty State yang Ramah:** Install baru = kebun benar-benar kosong — Tugi si maskot menyambutmu di Beranda, Jadwal, Tugas, dan Kalender ("Hari bebas!") sambil mengajak menanam tugas pertama. Nol data dummy, nol seed tersembunyi.
- **🛡️ Jaring Pengaman Urungkan:** Salah hapus? Snackbar animasi 4 detik mengembalikan tugas utuh.
- **📅 Kalender & Jadwal Kuliah Pintar:** Pemilih deadline per pekan (hingga +4 minggu), alarm kuliah berulang, agenda per hari.
- **🔔 Pengingat Lokal Andal:** Exact alarm native via `expo-notifications` (`3 hari`, `1 hari`, `3 jam` sebelum) — dijadwalkan di perangkat, terkirim walau offline.
- **🌙 Onboarding yang Menghormati "Tidak":** Tolak notifikasi dan dapat layar peringatan lembut yang menjelaskan apa yang akan terlewat — lalu lanjut saja.
- **🔒 100% Offline & Privat:** Satu file SQLite di HP-mu (`expo-sqlite`, skema v2, migrasi bertahap). Tanpa server, tanpa analitik, tanpa akun. Uninstall = semua data hilang bersih.

---

## 🛠️ Teknologi

| Lapisan | Teknologi |
|---|---|
| **Framework** | [React Native 0.86](https://reactnative.dev/) + [Expo SDK 57](https://expo.dev/) (New Architecture, Hermes) |
| **Routing** | [Expo Router](https://docs.expo.dev/router/introduction/) (navigasi berbasis file, typed routes) |
| **Penyimpanan** | [expo-sqlite](https://docs.expo.dev/versions/latest/sdk/sqlite/) — SQLite native dengan migrasi `PRAGMA user_version` |
| **Animasi** | [React Native Reanimated](https://docs.swmansion.com/react-native-reanimated/) (mekar, kartu slide-out, toast urungkan) |
| **Vektor** | [react-native-svg](https://github.com/software-mansion/react-native-svg) — Tugi, tanaman & ikon sebagai string SVG inline (`src/Asset.tsx`) |
| **Notifikasi** | [expo-notifications](https://docs.expo.dev/versions/latest/sdk/notifications/) dengan ID deterministik (`task-<id>-3d`) — batal tanpa tabel pencarian |
| **Tipografi** | Fredoka SemiBold (judul) & Nunito Bold/ExtraBold/Black (isi) — hanya 4 weight |
| **Build** | EAS Build — R8 minify + shrink resource, split `arm64-v8a`, AAB untuk Play Store |

---

## 📂 Struktur Proyek

```
src/
├── app/                  # Rute Expo Router (filesystem)
│   ├── (tabs)/           # Beranda · Kalender · Tugas · Atur (satu nav pil kustom)
│   ├── onboarding/       # Setup 3 langkah + layar peringatan "Nanti saja"
│   ├── tugas/            # Buat tugas + detail (animasi mekar & hapus ada di sini)
│   ├── matkul/           # Daftar, buat, edit mata kuliah
│   └── atur/             # Saklar pengingat
├── components/           # UI kit, bottom nav, form tugas/matkul, toast urungkan
├── constants/            # Token desain: palet, font, radius, target sentuh
├── db/                   # Skema SQLite, migrasi, store provider reaktif
├── lib/                  # Helper tanggal Indonesia, aturan status, penjadwalan
├── Asset.tsx             # <Tugi/>, <Plant stage/>, <Icon name/> — komponen SVG
└── assets.ts             # String SVG auto-generate (sumber tunggal karya)
plugins/
└── gradle-abi.js         # Packaging rilis arm64-only (hemat ukuran)
assets/app/               # Ikon launcher, adaptive icon, splash, favicon
```

---

## 🚀 Mulai

### Prasyarat
- Node.js 20+
- JDK 17 atau 21 (kompilasi Android lokal)
- Perangkat Android — **Expo Go tidak bisa dipakai** (`expo-sqlite` / `expo-notifications` adalah modul native)

### Pengembangan

```bash
git clone https://github.com/ekslimau/kebun_tugas.git
cd kebun_tugas
npm install
npx expo start          # wajib dev client
npx expo run:android    # atau build native
```

### Rilis

```bash
# Play Store (AAB, version code naik otomatis)
bunx eas-cli build --profile production --platform android

# APK uji sideload (arm64-v8a, ter-minify)
bunx eas-cli build --profile preview --platform android
```

### Gerbang kualitas

```bash
npx tsc --noEmit       # tipe
npx expo lint          # eslint
npx expo-doctor        # audit dependensi
```

---

## 📱 Rencana Uji (install baru)

1. **Uninstall → install** → semua layar kosong, streak `0`, koin `0`
2. Onboarding: nama → semester → jadwal → notifikasi ("Nanti saja" memunculkan layar peringatan)
3. Tanam tugas dengan deadline lewat pemilih pekan → pilih "+2 minggu"
4. Tandai selesai → animasi mekar → koin +10, streak +1
5. Buat tugas telat → selesaikan → badge **Selesai Terlambat**, streak utuh
6. Hapus tugas → snackbar → **Urungkan** mengembalikannya

---

## 🌿 Rencana Lanjutan

- [ ] Ekspor/cadangan database ke JSON (bagikan file lokal)
- [ ] Widget: kebun hari ini di home screen
- [ ] i18n: locale EN lengkap bersama Bahasa Indonesia

---

## 📄 Lisensi

Dirilis di bawah [Lisensi MIT](./LICENSE) — bebas dipakai, diubah, dan dirilis.  
© 2026 [ekslimau](https://github.com/ekslimau). Karya seni (Tugi & taman Kebun Tugas) © pemilik proyek.
