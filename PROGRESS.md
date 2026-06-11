# Minimalist Launcher - Progress Tracker

## Project Overview
Functional app blocker and distraction manager built with Expo + Convex.

## Repo
https://github.com/upsc-serv-1/freeuse (branch: main)

---

## ✅ Completed Steps

### Step 1-3: Initial Setup
- [x] App config, black splash, progress tracker
- [x] Home screen, search screen, settings screen scaffold
- [x] Pushed to GitHub

### Step 4: Convex Backend + Functional App ⬅️ CURRENT
- [x] Convex schema: apps, blocklist, appRenames, focusSessions, hiddenApps tables
- [x] queries: getAllApps, getBlocklist, getAppRenames, getHiddenApps, getTodaysUsage
- [x] mutations: seedApps, toggleBlockApp, setTimeLimit, removeFromBlocklist, renameApp, toggleHiddenApp, recordAppUsage
- [x] Seeded 20 distracting apps (Instagram, TikTok, YouTube, etc.)
- [x] Convex dev server running on port 3210
- [x] `.env.local` configured with Convex URL

### Step 5: Functional UI
- [x] **Home screen** - live clock, date, today's restrictions summary (blocked + timed out apps)
- [x] **All Apps screen** (`/app-list`) - text-only app names (no icons), search, block/unblock, set time limits (1/5/15/30/60 min), rename apps
- [x] **Focus tab** - view all blocked apps & timed apps with progress bars, usage tracking
- [x] **Search screen** - search app names, quick block + time limit buttons
- [x] **Settings screen** - all config sections

---

## 🎯 How It Works

1. **App list** shows app names only (no icons) - searchable
2. **Block an app** → it's prevented from opening (shows "BLOCKED" status)
3. **Set time limit** → choose 1/5/15/30/60 min per day → tracks usage count
4. **Rename app** → change Instagram to "Distraction 1" to reduce temptation
5. **Focus tab** → shows all restrictions with usage progress bars
6. **Home screen** → quick summary of today's restrictions

---

## 🔮 Next Steps Available
- [ ] Grayscale mode toggle (CSS filter effect)
- [ ] Hidden apps management
- [ ] Notification filter settings page
- [ ] 12h/24h clock format toggle
- [ ] Animations & transitions (screen transitions, dialog overlays)
- [ ] AsyncStorage persistence for settings (backup Convex)
- [ ] Gesture support (swipe up for apps drawer)

---

## Notes for Next Agent
- Convex URL is in `.env.local` (port 3210)
- Convex dev server runs in the `convex` terminal session
- TypeScript: `npx tsc --noEmit` passes cleanly
- Seed apps: `npx convex run apps:seedApps` (already seeded)
- New screens: `app/app-list.tsx` (main functional screen)
- Tab layout: Home + Focus tabs
- Git remote uses PAT authentication (stored in remote URL)
- The app **cannot actually block native Android apps** from React Native - it's a conceptual blocker that shows restrictions UI