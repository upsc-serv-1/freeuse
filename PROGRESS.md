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
- [x] Created progress tracker

---

## 🎯 Current Phase: Phase 1 - Eject & Native Android Config

### Step 1: Eject to Bare Workflow ⬅️ CURRENT
- [ ] Run `npx expo prebuild` to generate android/ and ios/ directories

### Step 2: Make Default Launcher
- [ ] Add `android.intent.category.HOME` and `android.intent.category.DEFAULT` to MainActivity

### Step 3: Add Android Permissions
- [ ] PACKAGE_USAGE_STATS
- [ ] SYSTEM_ALERT_WINDOW
- [ ] BIND_ACCESSIBILITY_SERVICE
- [ ] REQUEST_IGNORE_BATTERY_OPTIMIZATIONS
- [ ] FOREGROUND_SERVICE
- [ ] QUERY_ALL_PACKAGES

### Step 4: Native Android Services
- [ ] AppAccessibilityService.kt - monitors foreground app
- [ ] BlockingAndReminderService.kt - foreground service for blocking
- [ ] BlockOverlayActivity.kt - blocking overlay
- [ ] Native Module Bridge - React Native ↔ Android native

### Step 5: Offline Storage Migration
- [ ] Remove Convex dependency
- [ ] Implement react-native-mmkv for local storage
- [ ] Refactor UI to use local storage instead of Convex queries
- [ ] Ensure all blocking rules work offline

---

## Notes for Next Agent
- Git remote uses PAT authentication (stored in remote URL)
- Push pattern: commit with `Step X: description`, then push
- After `npx expo prebuild`, android/ directory will be generated
- Convex dev server can be stopped after migration to local storage
- TypeScript: `npx tsc --noEmit` to check types