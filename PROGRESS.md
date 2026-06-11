# Minimalist Launcher - Progress Tracker

## Project Overview
Functional app blocker and distraction manager - refactoring from conceptual Expo+Convex to native Android launcher with real app blocking.

## Repo
https://github.com/upsc-serv-1/freeuse (branch: main)

---

## ✅ Completed Steps

### Phase 0: Setup
- [x] Cloned repo from GitHub
- [x] Configured git remote with PAT
- [x] Created progress tracker and pushed

### Phase 1: Eject & Native Android Config

### Step 1: Eject to Bare Workflow ✅
- [x] Ran `npx expo prebuild --platform android` - generated android/ directory
- [x] Committed and pushed

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

### Step 5: Offline Storage Migration ⬅️ CURRENT
- [ ] Install react-native-mmkv or @react-native-async-storage/async-storage
- [ ] Create `useLocalStorage.ts` hook to replace all Convex queries
- [ ] Remove ConvexProvider from app/_layout.tsx
- [ ] Replace all Convex `useQuery`/`useMutation` calls with local storage equivalents
- [ ] Update UI to use local data instead of Convex
- [ ] Remove convex/ directory
- [ ] Update .env.local (remove Convex URL)

---

## Architecture

### Native Android Services
```
AppAccessibilityService.java
  └─ Monitors foreground app via AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED
  └─ Posts package name to MutableLiveData

BlockingAndReminderService.java
  └─ Foreground Service (runs 24/7)
  └─ Listens to AccessibilityService LiveData
  └─ Fallback: polls UsageStatsManager every 5s
  └─ Checks blockedApps set, launches BlockOverlayActivity

BlockOverlayActivity.java
  └─ Translucent overlay activity
  └─ Sends HOME intent to close blocked app
  └─ Finishes immediately

AppBlockerModule.java (React Native Bridge)
  └─ updateBlockedApps(ReadableArray) - sync blocklist to native
  └─ startBlockingService() - start foreground service
  └─ isAccessibilityServiceEnabled() - check status
  └─ openUsageAccessSettings() / openAccessibilitySettings()
```

### Storage
- SharedPreferences (local, offline-first)
- Blocked apps list stored as JSON array
- React Native UI syncs via Native Bridge

---

## Notes for Next Agent
- Git remote uses PAT authentication (stored in remote URL)
- Push pattern: commit with `Step X: description`, then push
- The Android native services are in `android/app/src/main/java/com/anonymous/minimalist/`
- After Step 5 is complete, the Convex dev server can be stopped
- TypeScript: `npx tsc --noEmit` to check types
- The app will need to be built with `cd android && ./gradlew assembleRelease`