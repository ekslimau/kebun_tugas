# 🌱 Kebun Tugas

> **Rawat kebun belajarmu, panen nilai terbaikmu.**  
> A gamified, privacy-first task & course manager tailored for Indonesian university students.

Built pixel-by-pixel from the `INCEPTION-UI-UX - Kebun Tugas` Figma design system. Fully offline, battery-friendly, zero surveillance, zero accounts required.

---

## ✨ Features

- **🌸 Bloom Animation:** Complete a task on time to trigger a celebratory bloom flower with smooth spring physics.
- **🌱 Gamified Habit Loop:** Earn coins and streak points for timely submissions. Tasks finished past due date mark as **Selesai Terlambat** (coins awarded, streak protected).
- **🛡️ Undo Safety Net:** Accidentally hit delete? 4-second animated snackbar with full restore support.
- **📅 Smart Calendar & Course Timetable:** Dynamic week picker, recurring course alarms, and deadline categorization.
- **🔔 Reliable Local Reminders:** Scheduled native alarms via `expo-notifications` (`-3d`, `-1d`, `-3h`, `-1h`) without pinging any external server.
- **🔒 100% Offline & Private:** Powered by on-device SQLite (`expo-sqlite` v2). Your assignments stay in your pocket.

---

## 🛠️ Tech Stack

| Layer | Tooling |
|---|---|
| **Framework** | [React Native 0.86](https://reactnative.dev/) + [Expo SDK 57](https://expo.dev/) (New Architecture) |
| **Routing** | [Expo Router](https://docs.expo.dev/router/introduction/) (File-based navigation) |
| **Storage** | [expo-sqlite](https://docs.expo.dev/versions/latest/sdk/sqlite/) (Native SQLite with schema migrations) |
| **Animations** | [React Native Reanimated](https://docs.swmansion.com/react-native-reanimated/) |
| **Notifications** | [expo-notifications](https://docs.expo.dev/versions/latest/sdk/notifications/) (Exact alarm scheduling) |
| **Typography** | Fredoka (headings) & Nunito (body) via `@expo-google-fonts` |

---

## 📂 Project Structure

```
src/
├── app/                  # Expo Router filesystem routes
│   ├── (tabs)/           # Core tab bar: Beranda, Kalender, Tugas, Atur
│   ├── onboarding/       # 3-step setup flow + "Nanti saja" safety warning
│   ├── tugas/            # Task creation, detail inspector & editor
│   ├── matkul/           # Course timetable & lecture manager
│   └── atur/             # Local preferences & notification triggers
├── components/           # Reusable UI primitives, bottom nav & form widgets
├── constants/            # Design system tokens (colors, radii, spacing, typography)
├── db/                   # SQLite schema, reactive store provider & seed dataset
└── lib/                  # Indonesian locale helpers, task logic & notification engine
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 20+
- JDK 17 or 21 (for local Android compile)
- Android phone or emulator (with Expo Development Build)

> ⚠️ **Note:** Standard Expo Go cannot run this project because `expo-sqlite` and `expo-notifications` rely on native modules.

### Development

```bash
# 1. Clone repository
git clone https://github.com/ekslimau/kebun_tugas.git
cd kebun_tugas

# 2. Install dependencies
npm install

# 3. Start development server
npx expo start
```

### Build APK

#### Option A: EAS Cloud Build (Recommended)
```bash
bunx eas-cli build --profile preview --platform android
```

#### Option B: Local Android Build
```bash
npx expo run:android
```

---

## 🧪 Code Quality & Sanity Checks

Every feature commit must pass these checks clean:

```bash
npx tsc --noEmit       # TypeScript type safety
npx expo lint          # ESLint rules
npx expo-doctor        # Compatibility & dependency audit
```

---

## 🌿 Roadmap / Polish Items

- [ ] Replace placeholder mascot (**Tugi** 🧅) with the finalized vector illustration from Figma.
- [ ] Add custom vector icon set for app launcher & Android splash screen.
- [ ] Direct export/backup database to JSON file.

---

## 📄 License

MIT © [ekslimau](https://github.com/ekslimau)
