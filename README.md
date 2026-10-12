# Kebun Tugas

Student task manager built from the Figma file `INCEPTION-UI-UX - Kebun Tugas`.
Expo SDK 57 + Expo Router, local SQLite, local notifications. No backend, no accounts.

## Run

```bash
npm install
npx expo start          # then press a / i, or scan with a dev build
npx expo run:android    # native build (required: sqlite + notifications are native modules)
```

Expo Go will not work — `expo-sqlite` and `expo-notifications` need a development build.

## Ship

```bash
bunx eas-cli build --profile preview      # installable APK
bunx eas-cli build --profile production   # AAB for Play Store / IPA for App Store
bunx eas-cli submit --profile production
```

`eas.json` holds the profiles. Bump `version` in `app.json` before a store release.

## Checks

```bash
npx tsc --noEmit
npx expo lint
npx expo-doctor
```

## Layout

```
src/app/            routes (Expo Router)
  onboarding/       name + semester, class list, notification permission
  (tabs)/           beranda, kalender, tugas, atur — shares one custom bottom nav
  tugas/            task form (create) and task detail (edit + finish + delete)
  matkul/           class list, create, edit
  atur/notifikasi    reminder toggles
src/components/     ui kit, bottom nav, course list, course form, task form
src/db/             sqlite schema, seed, store provider (all reads/writes go here)
src/lib/            Indonesian date helpers, task status rules, notifications
src/constants/      design tokens (colours, fonts, radii, spacing)
```

Reminders are scheduled with deterministic identifiers (`task-<id>-3d`, `course-<id>-1h`),
so cancelling never needs a lookup table.

## Known gaps before a store release

- `assets/images/*.png` and `assets/expo.icon` are still the Expo template artwork —
  replace them with the Kebun Tugas icon and splash art.
- The mascot (Tugi) is a 🧅 placeholder; the Figma onion illustration was not exportable
  from the local MCP server.
- Android exact alarms: `SCHEDULE_EXACT_ALARM` is requested, but Android 14+ users must
  grant it in system settings or reminders may drift by a few minutes.
