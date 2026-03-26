# Flowki Mobile — Setup & Deployment Guide

This document covers everything you need to get the Expo mobile app running locally, configure third-party services, and publish it to the App Store and Google Play.

---

## What's Implemented vs the Web App

The mobile MVP covers the same core daily-use surfaces as the web app:

| Feature | Web | Mobile | Notes |
|---------|-----|--------|-------|
| Email login / register | ✅ | ✅ | Sanctum bearer token stored in `expo-secure-store` |
| Dashboard (widget grid) | ✅ | ✅ | ↑/↓ reorder; live RTDB data |
| Todos (list, create, toggle, delete) | ✅ | ✅ | RTDB listener for instant updates |
| Chores (list, create, complete, delete) | ✅ | ✅ | Frequency + next-due display |
| Shopping (multi-list, items, check-off) | ✅ | ✅ | RTDB-synced |
| Calendar (month view, day events, create) | ✅ | ✅ | `react-native-calendars` |
| Weather widget | ✅ | ✅ | Fetches from `/api/mobile/weather`; requires `GOOGLE_WEATHER_API_KEY` on the server |
| Family create / join | ✅ | ✅ | Family tab with invite-code flow |
| Profile settings (name, email, colour) | ✅ | ✅ | Settings tab → Edit Profile |
| Password settings | ✅ | ✅ | Settings tab → Change Password |
| Dark / light mode | ✅ | ✅ | System preference via `useColorScheme` |
| Offline indicator | ✅ | ✅ | `@react-native-community/netinfo` banner |
| Push notifications | ✅ | ✅ | FCM via `expo-notifications`; token registered to `/api/mobile/fcm-tokens` |
| Google Maps address autocomplete | ✅ | ❌ | Planned (requires React Native Maps integration) |
| Social auth (Google OAuth) | ✅ | ❌ | Planned (`expo-auth-session`) |
| Voice command bar | ✅ | ✅ | Sends natural-language commands to `/api/mobile/voice/command` (AI agent) |
| Siri & App Intents | ✅ | ✅ (iOS 16+) | `CreateTodoIntent`, `AddShoppingItemIntent`, `GetTodayScheduleIntent`, `CompleteChoreIntent`, `AddChoreIntent`, `AddCalendarItemIntent` |
| Google Assistant App Actions | ✅ | ✅ (Android) | `shortcuts.xml` capabilities + static launcher shortcuts; same `/api/mobile/voice/command` backend |

---

## API Keys — Do You Need Them?

### For the MVP (what's built today)

| Key | Required? | Used for |
|-----|-----------|----------|
| Firebase project credentials (`EXPO_PUBLIC_FIREBASE_*`) | **Yes** | RTDB real-time listeners on all screens |
| Laravel backend URL (`EXPO_PUBLIC_API_URL`) | **Yes** | Auth + CRUD writes |
| Google Weather API key (`GOOGLE_WEATHER_API_KEY` on server) | **Optional** | Weather widget on Dashboard (widget shows "no location" if not configured) |
| Google Maps API key | **No** | Not yet used in mobile (web only for address autocomplete) |

> **Short answer:** You only need Firebase credentials and your Laravel backend URL to run the MVP. The weather widget works automatically if your family has a location set and the server has `GOOGLE_WEATHER_API_KEY` configured — it degrades gracefully otherwise.

---

## Prerequisites

- [Node.js](https://nodejs.org/) ≥ 20 (LTS recommended)
- [Expo CLI](https://docs.expo.dev/more/expo-cli/): `npm install -g expo-cli` (or use `npx expo` without a global install)
- [EAS CLI](https://docs.expo.dev/eas/) for production builds: `npm install -g eas-cli`
- For iOS simulator: Xcode ≥ 15 (macOS only) + iOS Simulator
- For Android emulator: Android Studio + an AVD (Android Virtual Device)
- For a physical device: the **Expo Go** app (development only) from the App Store / Google Play

---

## 1. Install Dependencies

```bash
cd mobile
npm install
```

---

## 2. Configure Environment Variables

```bash
cp .env.example .env
```

Open `.env` and fill in the values:

```env
# Laravel backend — for local dev on a physical device, replace localhost with your LAN IP
EXPO_PUBLIC_API_URL=http://localhost:8000

# Firebase — copy from Firebase Console → Project Settings → General → Your apps
EXPO_PUBLIC_FIREBASE_API_KEY=AIza...
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_DATABASE_URL=https://your-project-default-rtdb.firebaseio.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-project
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=1234567890
EXPO_PUBLIC_FIREBASE_APP_ID=1:1234567890:ios:abc123
```

> **Tip:** `EXPO_PUBLIC_` prefixed variables are inlined at build time and are visible in the JavaScript bundle. Do not put secrets here — only public Firebase config values and your API URL.

---

## 3. Firebase Setup

### 3a. Create / select your Firebase project

1. Go to [console.firebase.google.com](https://console.firebase.google.com/).
2. Select your existing Flowki project (the same one the web app uses), or create a new one.
3. Enable **Realtime Database** (not Firestore) if not already enabled:  
   Build → Realtime Database → Create Database → choose your region → start in **locked mode** then update the rules as needed.

### 3b. Register a mobile app in Firebase

1. In your Firebase project, click **Add app** → choose iOS or Android (you will need to register both eventually).
2. **iOS:** enter the bundle ID `com.s8digital.flowki` (must match `app.json → ios.bundleIdentifier`).
3. **Android:** enter the package name `com.s8digital.flowki` (must match `app.json → android.package`).
4. Copy the config values into your `.env` file.

### 3c. Android — `google-services.json`

For Android FCM / Google Services to work you need the native config file:

1. In Firebase Console → Project Settings → General → Your apps → Android app → **Download `google-services.json`**.
2. Place it at `mobile/google-services.json` (already referenced in `app.json`).
3. **Do not commit this file** — it is listed in `.gitignore`.

> For the Expo Go development client, FCM push notifications won't work (they require a native build). Use EAS builds (step 6) for full notification testing.

---

## 4. Start the Development Server

```bash
cd mobile
npm start        # or: npx expo start
```

Then:
- Press **i** to open in the iOS Simulator (macOS only)
- Press **a** to open in the Android Emulator
- Scan the QR code with the **Expo Go** app on a physical device

> **Local API on a physical device:** Replace `localhost` in `EXPO_PUBLIC_API_URL` with your machine's LAN IP (e.g. `http://192.168.1.100:8000`). The device must be on the same Wi-Fi network.

---

## 5. Backend — Mobile API Routes

The mobile app talks to `/api/mobile/*` routes registered in `routes/mobile.php`. These are already implemented and registered under the `api` middleware group (Sanctum, no session cookie required).

Ensure your Laravel backend has `sanctum` configured and `HasApiTokens` is on the `User` model (both are already done in this PR).

---

## 6. Production Builds with EAS (Expo Application Services)

EAS is the Expo-managed build and submission service. You need an [Expo account](https://expo.dev/) (free tier is sufficient to start).

### 6a. Login and configure EAS

```bash
npx eas-cli login
npx eas-cli build:configure   # creates eas.json if it doesn't exist
```

`eas.json` example:

```json
{
  "cli": { "version": ">= 7.0.0" },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal"
    },
    "production": {
      "autoIncrement": true
    }
  },
  "submit": {
    "production": {}
  }
}
```

### 6b. Store secrets in EAS (not in `.env`)

```bash
# Set each secret once — EAS injects them during cloud builds
npx eas-cli secret:create --scope project --name EXPO_PUBLIC_API_URL --value "https://flowki.family"
npx eas-cli secret:create --scope project --name EXPO_PUBLIC_FIREBASE_API_KEY --value "AIza..."
# ... repeat for all EXPO_PUBLIC_FIREBASE_* vars
```

### 6c. Build for iOS / Android

```bash
# iOS production build (requires an Apple Developer account)
npx eas-cli build --platform ios --profile production

# Android production build
npx eas-cli build --platform android --profile production
```

---

## 7. App Store Setup (iOS)

### Prerequisites

- An [Apple Developer Program](https://developer.apple.com/programs/) membership (~$99 USD/year).
- Xcode installed on macOS (for certificate/provisioning profile management, though EAS can manage these automatically).

### Steps

1. **Create an App ID** in [App Store Connect](https://appstoreconnect.apple.com/):  
   Apps → + → New App → iOS → Bundle ID `com.s8digital.flowki`.
2. **Set up certificates and provisioning** — EAS manages this automatically when you run `eas build`. Accept the prompts to let EAS create certificates on your behalf.
3. **Submit to App Store Connect:**
   ```bash
   npx eas-cli submit --platform ios --latest
   ```
   This uploads the latest build to App Store Connect for TestFlight / review.
4. In App Store Connect, complete the app metadata (screenshots, description, categories, privacy policy URL).
5. Submit for **App Review** (Apple review typically takes 1–3 business days).

---

## 8. Google Play Setup (Android)

### Prerequisites

- A [Google Play Developer](https://play.google.com/console/) account (~$25 USD one-time fee).

### Steps

1. In [Google Play Console](https://play.google.com/console/), create a new app.
2. Complete the store listing, content rating questionnaire, and data safety form.
3. **First upload must be done manually** — EAS cannot submit the very first build automatically. Download the `.aab` from your EAS build and upload it in Play Console → Internal Testing.
4. After the first manual upload, subsequent releases can use EAS submit:
   ```bash
   npx eas-cli submit --platform android --latest
   ```
5. Promote the build from Internal Testing → Closed Testing → Open Testing → Production as confidence grows.

---

## 9. Over-the-Air (OTA) Updates

EAS Update lets you push JavaScript/asset changes to users instantly without going through App Store review:

```bash
npx eas-cli update --branch production --message "Fix: shopping list sync"
```

> OTA updates only work for JS/asset changes. Native code changes (new native modules, `app.json` changes, etc.) still require a full store build.

---

## 10. Siri & App Intents (iOS 16+)

Flowki ships six App Intents that surface in Siri, Spotlight, and the Shortcuts app.
They call the same `/api/mobile/voice/command` endpoint used by the in-app voice bar, so
the AI agent handles all the heavy lifting.

### Intents

| Intent | Example Siri phrase | What it does |
|---|---|---|
| `CreateTodoIntent` | "Add buy milk to my Flowki to-dos" | Creates a new family to-do |
| `AddShoppingItemIntent` | "Add eggs to my Flowki list" | Adds an item to the shopping list |
| `GetTodayScheduleIntent` | "What's on my Flowki schedule" | Reads today's calendar events |
| `CompleteChoreIntent` | "Mark vacuuming done on Flowki" | Marks a chore as complete |
| `AddChoreIntent` | "Add take out bins to my Flowki chores" | Creates a new family chore |
| `AddCalendarItemIntent` | "Add dentist on Friday to my Flowki calendar" | Adds an event to the family calendar |

### How it works

1. **Native Swift intents** (`mobile/plugins/AppIntents/FlowkiIntents.swift`) are compiled
   into the main app target via the Expo config plugin `mobile/plugins/withAppIntents.js`.
2. At runtime the Swift code reads the auth token from the iOS Keychain (same item written
   by `expo-secure-store`) and calls `POST /api/mobile/voice/command` over HTTPS.
3. The `AppShortcutsProvider` in `FlowkiShortcutsApp.swift` registers phrase suggestions so
   Siri surfaces them automatically — no manual Shortcut creation needed.
4. When the intent result causes the app to open (e.g. a user taps a follow-up notification),
   the JS hook `mobile/hooks/useAppIntentHandler.ts` intercepts the `flowki://intent?…` deep
   link and dispatches the command through the voice API.

### Build requirements

- **Xcode 15+** (App Intents compile step)
- **iOS 16+** device or simulator for intent execution
- **Apple Developer account** — Siri requires the `com.apple.developer.siri` entitlement,
  which the config plugin adds automatically. You must enable Siri in your App ID in the
  Apple Developer Portal before submitting to the App Store.

### Local testing

1. Build with EAS or a local Xcode build (`npx expo run:ios`).
2. In **Settings → Siri & Search → Flowki**, you can verify the app's donated shortcuts.
3. Say "Hey Siri, add milk to my Flowki list" — Siri will ask for confirmation and show the
   AI's response inline.

> **Note:** App Intents do **not** work in Expo Go — a native build is required.

---

## 11. Google Assistant App Actions (Android)

Flowki ships a `shortcuts.xml` that surfaces six App Actions for Google Assistant and four
static launcher shortcuts (long-press the app icon). They use the same deep-link format and
the same `/api/mobile/voice/command` backend endpoint as the iOS Siri integration.

> **Note:** App Actions and static shortcuts do **not** work in Expo Go — a native build
> (`npx expo run:android` or an EAS build) is required.

### App Actions (voice-activated)

| Built-in Intent (BII) | Example phrase | What it does |
|---|---|---|
| `actions.intent.CREATE_REMINDER` | "Hey Google, add buy milk to my Flowki to-dos" | Creates a new family to-do |
| `actions.intent.CREATE_SHOPPING_LIST_ITEM` | "Hey Google, add eggs to my Flowki list" | Adds an item to the shopping list |
| `actions.intent.GET_SCHEDULE` | "Hey Google, what's on my Flowki schedule" | Reads today's calendar events |
| `actions.intent.CREATE_TASK` | "Hey Google, add take out bins chore to Flowki" | Creates a new family chore |
| `actions.intent.RECORD_TASK_COMPLETION` | "Hey Google, mark vacuuming done on Flowki" | Marks a chore as complete |
| `actions.intent.CREATE_CALENDAR_EVENT` | "Hey Google, add dentist on Friday to my Flowki calendar" | Adds an event to the family calendar |

### Static launcher shortcuts (long-press icon)

| Shortcut | Action |
|---|---|
| New To-Do | Opens app at `flowki://intent?type=create-todo` |
| Add to List | Opens app at `flowki://intent?type=add-shopping-item` |
| Today's Schedule | Opens app at `flowki://intent?type=get-schedule` |
| Add Event | Opens app at `flowki://intent?type=add-calendar-item` |

### How it works

1. **`shortcuts.xml`** (`mobile/plugins/AppActions/shortcuts.xml`) declares the capabilities
   and static shortcuts. Android discovers this file at runtime via the `android.app.shortcuts`
   `<meta-data>` element on the main activity.
2. The Expo config plugin **`withAppActions.js`** copies `shortcuts.xml` into
   `android/app/src/main/res/xml/` and injects the `<meta-data>` element into
   `AndroidManifest.xml` during `expo prebuild`.
3. When Google Assistant matches a phrase, it opens the app with the deep link specified in
   the matching `<capability>`. Parameter values (e.g. the item name the user said) are
   substituted into the URL template before the app opens.
4. The JS hook **`useAppIntentHandler.ts`** intercepts the `flowki://intent?…` deep link
   (same hook used for iOS Siri) and forwards the command to the voice API.

### Build requirements

- **Android API 25+** for static launcher shortcuts.
- **Google Assistant** — App Actions are processed by Google's servers. The app must be
  published to Google Play and enrolled in the
  [Google Actions Center](https://developers.google.com/assistant/app/action-center) for
  production voice triggers. During development you can test with the
  **Google Assistant Plugin** for Android Studio.

### Local testing

1. Build with EAS or a local Android build (`npx expo run:android`).
2. **Static shortcuts:** long-press the Flowki icon on the home screen — the four shortcuts
   should appear.
3. **App Actions:** install the [App Actions Test Tool](https://developers.google.com/assistant/app/test-tool)
   Android Studio plugin, configure your app ID, and run an App Action preview.

---

## 12. Remaining Planned Features

The following features are planned for future sprints:

- [ ] **Google Maps address autocomplete** — for family location settings (needs a React Native Maps integration and `GOOGLE_MAPS_API_KEY`)
- [ ] **FCM push notifications** — send the device token from `expo-notifications` to the backend after login
- [ ] **Social auth (Google OAuth)** — `expo-auth-session` + backend Google callback
- [ ] **Global search** — Postgres-backed search endpoint
- [ ] **Per-member colours on member avatars** — already stored in `profile_color`; wire up to all list views
- [ ] **EAS CI/CD** — GitHub Actions workflow calling `eas build` and `eas submit` on merge to `main`
