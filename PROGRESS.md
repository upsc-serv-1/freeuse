# Minimalist Launcher - Progress Tracker

## Project Overview
Functional app blocker and distraction manager - refactored from conceptual Expo+Convex to native Android launcher with real app blocking capability.

## Repo
https://github.com/upsc-serv-1/freeuse (branch: main)

---

## ✅ All Completed Steps

### Phase 0: Setup
- [x] Cloned repo from GitHub
- [x] Configured git remote with PAT
- [x] Created progress tracker and pushed

### Phase 1: Eject & Native Android Config

### Step 1: Eject to Bare Workflow ✅
- [x] Ran `npx expo prebuild --platform android` - generated android/ directory
- [x] Committed and pushed to GitHub

### Step 2-3: Default Launcher + Permissions ✅
- [x] Added HOME and DEFAULT intent filter categories to MainActivity
- [x] Added PACKAGE_USAGE_STATS permission
- [x] Added SYSTEM_ALERT_WINDOW permission
- [x] Added BIND_ACCESSIBILITY_SERVICE permission
- [x] Added REQUEST_IGNORE_BATTERY_OPTIMIZATIONS permission
- [x] Added FOREGROUND_SERVICE / FOREGROUND_SERVICE_SPECIAL_USE
- [x] Added QUERY_ALL_PACKAGES permission
- [x] Added RECEIVE_BOOT_COMPLETED permission

### Step 4: Native Android Services ✅
- [x] Created `AppAccessibilityService.java` - monitors TYPE_WINDOW_STATE_CHANGED events
- [x] Created `BlockingAndReminderService.java` - foreground service with polling fallback
- [x] Created `BlockOverlayActivity.java` - blocking overlay that sends HOME intent
- [x] Created `BootReceiver.java` - restarts service after device reboot
- [x] Created `AppBlockerModule.java` - React Native bridge module
- [x] Created `AppBlockerPackage.java` - RN package registration
- [x] Created `accessibility_service_config.xml` - accessibility service configuration
- [x] Updated `AndroidManifest.xml` with all services, activities, receivers

### Step 5: Offline Storage Migration ✅
- [x] Installed @react-native-async-storage/async-storage
- [x] Created `useLocalStorage.ts` hook - replaces all Convex queries/mutations
- [x] Removed ConvexProvider from app/_layout.tsx
- [x] Replaced all Convex `useQuery`/`useMutation` calls with local storage equivalents
- [x] Seeded 20 default distracting apps locally
- [x] All app data (blocks, limits, renames, usage, favorites) stored offline

---

## Architecture Summary

### Native Android Services
```
android/app/src/main/java/com/anonymous/minimalist/
├── services/
│   ├── AppAccessibilityService.java    # Monitors foreground app via accessibility events
│   └── BlockingAndReminderService.java # Persistent foreground service with UsageStats polling
├── ui/
│   └── BlockOverlayActivity.java       # Translucent overlay that sends HOME intent
├── receivers/
│   └── BootReceiver.java               # Restarts service after reboot
├── bridge/
│   ├── AppBlockerModule.java           # RN ↔ Android native bridge (set blocked apps, start service, check status)
│   └── AppBlockerPackage.java          # Package registration for RN
└── res/xml/
    └── accessibility_service_config.xml
```

### Local Storage
- `hooks/useLocalStorage.ts` - Complete local storage hook using AsyncStorage
- All data persisted offline (no cloud dependency)
- Seed data for 20 common distracting apps
- Functions: toggleBlock, blockForDays, setTimeLimit, renameApp, toggleHidden, toggleFavorite, toggleUninstall, recordUsage

### What Was Removed
- ConvexProvider from root layout
- All Convex `useQuery`/`useMutation` calls
- convex/ directory kept but no longer imported
- .env.local kept but Convex URL no longer needed

---

## Notes for Next Agent
1. **Build the APK**: Run `cd android && ./gradlew assembleRelease` to generate the release APK
2. **Permissions**: Users must grant Usage Stats, Accessibility, and Notification Listener permissions in Android Settings
3. **Git**: PAT stored in remote URL - `git config user.email "bot@example.com"` and `git config user.name "bot"` needed before commit
4. **TypeScript**: Run `npx tsc --noEmit` to check types
5. **Future work**: 
   - Register AppBlockerPackage in MainApplication.kt (getPackages method)
   - Add grayscale mode service
   - Add notification filtering service
   - Add app usage statistics UI
6. **Convex server**: Can be stopped - the app no longer depends on it