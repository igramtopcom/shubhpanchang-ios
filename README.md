# Divo (દીવો) iOS app, by shubhpanchang.in

Expo SDK 58 (React Native 0.88, Expo Router). Bundle ID `in.shubhpanchang.app`, App Store
Connect record "Divo: Gujarati Vrat & Panchang" (Apple ID 6825234507; was "ShubhPanchang: Vrat & Tithi" until 2026-10-23, see docs/RENAME-DIVO.md). Plan: the "Kế hoạch app iOS
ShubhPanchang" artifact; API contract: `docs/api-v1.md` in igramtopcom/shubhpanchang (the website,
where this app lived as `mobile/` until it moved here).

The app computes nothing astronomical itself: every tithi, sunrise, Parana and vrat day comes
from `https://shubhpanchang.in/api/v1`, the same engine as the website, and is stored on the
phone for offline use (dropped when the server's engine version changes).

## Layout

| Path | What |
|---|---|
| `src/app/` | Screens (Expo Router). `(tabs)/` Today, Vrat, Family, Calendar, Settings; `onboarding`, `place`, `family-add`; `+native-intent` maps Universal Links |
| `src/lib/` | Pure logic, tested: `api` (client + offline cache), `shubh` (next good time), `notify-plan` (iOS 64-notification budget), `time`, `i18n` (GU/EN), `places`, `links` |
| `src/lib/*.web.ts` | Web-preview stand-ins for native modules (notifications, calendar, storage) |
| `src/state/` | Prefs on the phone (`app.tsx`) and data hooks (`data.ts`) |
| `tests/` | Vitest on `src/lib`, fixtures are real `/api/v1` answers |

## Commands (from this folder)

```bash
npm test                      # logic tests (vitest)
npm run typecheck
npx expo lint
npx expo start --web --port 8083   # visual check in a browser (no notifications / Calendar on web)
```

Builds run on GitHub Actions (macOS), as for Sondra iOS and Sanftly: `docs/CI.md`. The
repository is public only for the duration of a build (`scripts/ci-build.sh`).

## Not done yet (weeks 5-7 of the plan)

Home-screen and Lock Screen widgets, Live Activity (Parana / moonrise countdown), Siri App
Intents, app icon at 1024 px, App Store screenshots and review notes.
