# 🌱 Kebun Tugas

![Expo SDK 57](https://img.shields.io/badge/Expo-SDK%2057-6B4EFF?logo=expo&logoColor=white)
![React Native 0.86](https://img.shields.io/badge/React%20Native-0.86-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white)
![Offline First](https://img.shields.io/badge/Privacy-100%25%20Offline-34D3A5)
![No Accounts](https://img.shields.io/badge/Accounts-none-FF7A66)

> **Rawat kebun belajarmu, panen nilai terbaikmu.**
> A gamified, privacy-first task & course manager tailored for Indonesian university students.

Built pixel-by-pixel from the `Kebun Tugas` Figma design system, one of the user product "design" for competition. Kebun Tugas is fully offline, battery-friendly, zero surveillance, zero accounts required.

Every assignment is a plant. Plant it, watch it grow as the deadline approaches, and it **blooms 🌸** the moment you finish on time. Miss the deadline, and it withers — your garden tells you the truth about your semester at a glance.

---

## 🌿 How Your Garden Grows

Every task renders as a hand-drawn SVG plant whose stage mirrors its status — no emoji, no clip-art:

| Stage | Status | Meaning |
|---|---|---|
| 🌱 **Tunas** | Deadline ≤ 3 days | Freshly planted, needs attention soon |
| 🌿 **Tumbuh** | Deadline far | Growing quietly in the background |
| 🌸 **Mekar** | Selesai tepat waktu | Rewarded: +10 coins, streak grows |
| 🥀 **Layu** | Telat | Coins still awarded, streak protected — honest, not punishing |

---

## ✨ Features

- **🌸 Bloom Animation:** Complete a task on time to trigger a celebratory bloom with smooth spring physics (Reanimated).
- **🌱 Gamified Habit Loop:** Earn coins and streak points for timely submissions. Tasks finished past due date are marked **Selesai Terlambat** — coins awarded, streak protected.
- **🪴 Friendly Empty States:** Fresh install starts with a truly empty garden — Tugi the mascot greets you on Beranda, Jadwal, Tugas, and Kalender ("Hari bebas!") with a nudge to plant your first task. Zero dummy data, zero hidden seeds.
- **🛡️ Undo Safety Net:** Accidentally hit delete? A 4-second animated snackbar restores the task in full.
- **📅 Smart Calendar & Course Timetable:** Week-by-week deadline picker (up to +4 weeks), recurring class alarms, and per-day agenda.
- **🔔 Reliable Local Reminders:** Native exact alarms via `expo-notifications` (`3 hari`, `1 hari`, `3 jam` before) — scheduled on-device, delivered even offline.
- **🌙 Onboarding that respects "no":** Decline notifications and get a gentle warning screen explaining exactly what you'll miss — then continue anyway.
- **🔒 100% Offline & Private:** One SQLite file on your phone (`expo-sqlite`, schema v2, staged migrations). No server, no analytics, no accounts. Uninstall = everything gone.

---

## 🛠️ Tech Stack

| Layer | Tooling |
|---|---|
| **Framework** | [React Native 0.86](https://reactnative.dev/) + [Expo SDK 57](https://expo.dev/) (New Architecture, Hermes) |
| **Routing** | [Expo Router](https://docs.expo.dev/router/introduction/) (file-based navigation, typed routes) |
| **Storage** | [expo-sqlite](https://docs.expo.dev/versions/latest/sdk/sqlite/) — native SQLite with `PRAGMA user_version` migrations |
| **Animations** | [React Native Reanimated](https://docs.swmansion.com/react-native-reanimated/) (bloom, slide-out cards, undo toast) |
| **Vector Art** | [react-native-svg](https://github.com/software-mansion/react-native-svg) — Tugi, plants & icons as inline SVG strings (`src/Asset.tsx`) |
| **Notifications** | [expo-notifications](https://docs.expo.dev/versions/latest/sdk/notifications/) with deterministic IDs (`task-<id>-3d`) — cancel needs no lookup table |
| **Typography** | Fredoka SemiBold (headings) & Nunito Bold/ExtraBold/Black (body) — only 4 weights bundled |
| **Build** | EAS Build — R8 minify + resource shrinking, `arm64-v8a` split, AAB for Play Store |

---

## 📂 Project Structure

```
src/
├── app/                  # Expo Router filesystem routes
│   ├── (tabs)/           # Beranda · Kalender · Tugas · Atur (one custom pill nav)
│   ├── onboarding/       # 3-step setup + "Nanti saja" warning screen
│   ├── tugas/            # Task create + detail (bloom & delete live here)
│   ├── matkul/           # Course list, create, edit
│   └── atur/             # Reminder toggles
├── components/           # UI kit, bottom nav, task/course forms, undo toast
├── constants/            # Design tokens: palette, fonts, radii, tap targets
├── db/                   # SQLite schema, migrations, reactive store provider
├── lib/                  # Indonesian date helpers, status rules, scheduling
├── Asset.tsx             # <Tugi/>, <Plant stage/>, <Icon name/> — SVG components
└── assets.ts             # Auto-generated SVG strings (single source for artwork)
plugins/
└── gradle-abi.js         # arm64-only release packaging (size)
assets/app/               # Launcher icon, adaptive icon, splash, favicon
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 20+
- JDK 17 or 21 (local Android compile)
- An Android device — **Expo Go will not work** (`expo-sqlite` / `expo-notifications` are native modules)

### Development

```bash
git clone https://github.com/ekslimau/kebun_tugas.git
cd kebun_tugas
npm install
npx expo start          # dev client required
npx expo run:android    # or build natively
```

### Shipping

```bash
# Play Store (AAB, auto version increment)
bunx eas-cli build --profile production --platform android

# Sideload test APK (arm64-v8a, minified)
bunx eas-cli build --profile preview --platform android
```

### Quality gates

```bash
npx tsc --noEmit       # types
npx expo lint          # eslint
npx expo-doctor        # dependency audit
```

---

## 📱 Test Plan (fresh install)

1. **Uninstall → install** → every screen empty, streak `0`, coins `0`
2. Onboard: name → semester → jadwal → notifications ("Nanti saja" shows the warning screen)
3. Tanam tugas with a deadline past the week picker → pick "+2 minggu"
4. Tandai selesai → bloom plays → coins +10, streak +1
5. Create an overdue task → finish it → **Selesai Terlambat** badge, streak intact
6. Delete a task → snackbar → **Urungkan** restores it

---

## 🌿 Roadmap / Polish Items

- [ ] Database export/backup to JSON (local file share)
- [ ] Widget: today's garden on the home screen
- [ ] i18n: full EN locale alongside Bahasa Indonesia

---

## 📄 License

Released under the [MIT License](./LICENSE) — free to use, modify, and ship.  
© 2026 [ekslimau](https://github.com/ekslimau). Artwork (Tugi & the Kebun Tugas garden) © the project owner.
