import { useState, useEffect, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

// ═══ Types ═══
export interface AppInfo {
  _id: string;
  _creationTime: number;
  name: string;
  packageName: string;
  category: string;
}

export interface BlockEntry {
  _id: string;
  _creationTime: number;
  appName: string;
  packageName: string;
  blocked: boolean;
  dailyTimeLimitMinutes?: number;
  blockExpiresAt?: number;
  createdAt: number;
}

export interface AppRename {
  _id: string;
  _creationTime: number;
  packageName: string;
  aliasName: string;
}

export interface FocusSession {
  _id: string;
  _creationTime: number;
  packageName: string;
  date: string;
  minutesUsed: number;
  lastOpened?: number;
}

export interface HiddenApp {
  _id: string;
  _creationTime: number;
  packageName: string;
}

export interface Favorite {
  _id: string;
  _creationTime: number;
  packageName: string;
  position: number;
}

export interface UninstalledApp {
  _id: string;
  _creationTime: number;
  packageName: string;
}

// ═══ Default seed data ═══
const SEED_APPS: AppInfo[] = [
  { name: "Instagram", packageName: "com.instagram.android", category: "Social", _id: "app1", _creationTime: Date.now() },
  { name: "TikTok", packageName: "com.zhiliaoapp.musically", category: "Social", _id: "app2", _creationTime: Date.now() },
  { name: "Twitter X", packageName: "com.twitter.android", category: "Social", _id: "app3", _creationTime: Date.now() },
  { name: "Facebook", packageName: "com.facebook.katana", category: "Social", _id: "app4", _creationTime: Date.now() },
  { name: "YouTube", packageName: "com.google.android.youtube", category: "Entertainment", _id: "app5", _creationTime: Date.now() },
  { name: "Snapchat", packageName: "com.snapchat.android", category: "Social", _id: "app6", _creationTime: Date.now() },
  { name: "WhatsApp", packageName: "com.whatsapp", category: "Messaging", _id: "app7", _creationTime: Date.now() },
  { name: "Telegram", packageName: "org.telegram.messenger", category: "Messaging", _id: "app8", _creationTime: Date.now() },
  { name: "Reddit", packageName: "com.reddit.frontpage", category: "Social", _id: "app9", _creationTime: Date.now() },
  { name: "LinkedIn", packageName: "com.linkedin.android", category: "Professional", _id: "app10", _creationTime: Date.now() },
  { name: "Netflix", packageName: "com.netflix.mediaclient", category: "Entertainment", _id: "app11", _creationTime: Date.now() },
  { name: "Spotify", packageName: "com.spotify.music", category: "Music", _id: "app12", _creationTime: Date.now() },
  { name: "Pinterest", packageName: "com.pinterest", category: "Social", _id: "app13", _creationTime: Date.now() },
  { name: "Amazon", packageName: "com.amazon.mShop.android.shopping", category: "Shopping", _id: "app14", _creationTime: Date.now() },
  { name: "Flipkart", packageName: "com.flipkart.android", category: "Shopping", _id: "app15", _creationTime: Date.now() },
  { name: "Chrome", packageName: "com.android.chrome", category: "Browser", _id: "app16", _creationTime: Date.now() },
  { name: "Gmail", packageName: "com.google.android.gm", category: "Productivity", _id: "app17", _creationTime: Date.now() },
  { name: "Maps", packageName: "com.google.android.apps.maps", category: "Navigation", _id: "app18", _creationTime: Date.now() },
  { name: "Phone", packageName: "com.android.dialer", category: "System", _id: "app19", _creationTime: Date.now() },
  { name: "Messages", packageName: "com.android.mms", category: "Messaging", _id: "app20", _creationTime: Date.now() },
];

const KEYS = {
  apps: "@minimalist/apps",
  blocklist: "@minimalist/blocklist",
  renames: "@minimalist/renames",
  hidden: "@minimalist/hidden",
  favorites: "@minimalist/favorites",
  usage: "@minimalist/usage",
  uninstalled: "@minimalist/uninstalled",
};

// ═══ Generic helpers ═══
async function getData<T>(key: string, fallback: T[]): Promise<T[]> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (raw) return JSON.parse(raw);
    return fallback;
  } catch { return fallback; }
}

async function setData<T>(key: string, data: T[]): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(data));
}

// ═══ Initialize seed data ═══
export async function ensureSeeded(): Promise<void> {
  const existing = await AsyncStorage.getItem(KEYS.apps);
  if (!existing) {
    await AsyncStorage.setItem(KEYS.apps, JSON.stringify(SEED_APPS));
  }
}

// ═══ Hook ═══
export function useLocalApps() {
  const [apps, setApps] = useState<AppInfo[]>([]);
  const [blocklist, setBlocklist] = useState<BlockEntry[]>([]);
  const [renames, setRenames] = useState<AppRename[]>([]);
  const [hidden, setHidden] = useState<HiddenApp[]>([]);
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [uninstalled, setUninstalled] = useState<UninstalledApp[]>([]);
  const [usage, setUsage] = useState<FocusSession[]>([]);
  const [loaded, setLoaded] = useState(false);

  const refresh = useCallback(async () => {
    const [a, b, r, h, f, u, us] = await Promise.all([
      getData<AppInfo>(KEYS.apps, []),
      getData<BlockEntry>(KEYS.blocklist, []),
      getData<AppRename>(KEYS.renames, []),
      getData<HiddenApp>(KEYS.hidden, []),
      getData<Favorite>(KEYS.favorites, []),
      getData<UninstalledApp>(KEYS.uninstalled, []),
      getData<FocusSession>(KEYS.usage, []),
    ]);
    setApps(a);
    setBlocklist(b);
    setRenames(r);
    setHidden(h);
    setFavorites(f);
    setUninstalled(u);
    setUsage(us);
    setLoaded(true);
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  // Mutations
  const toggleBlock = useCallback(async (appName: string, packageName: string, blocked: boolean) => {
    const list = await getData<BlockEntry>(KEYS.blocklist, []);
    const idx = list.findIndex(e => e.packageName === packageName);
    if (idx >= 0) {
      list[idx] = { ...list[idx], blocked, blockExpiresAt: undefined };
    } else {
      list.push({
        _id: `bl${Date.now()}`,
        _creationTime: Date.now(),
        appName,
        packageName,
        blocked,
        createdAt: Date.now(),
      });
    }
    await setData(KEYS.blocklist, list);
    setBlocklist(list);
  }, []);

  const blockForDays = useCallback(async (appName: string, packageName: string, days: number) => {
    const expiresAt = Date.now() + days * 24 * 60 * 60 * 1000;
    const list = await getData<BlockEntry>(KEYS.blocklist, []);
    const idx = list.findIndex(e => e.packageName === packageName);
    if (idx >= 0) {
      list[idx] = { ...list[idx], blocked: true, blockExpiresAt: expiresAt };
    } else {
      list.push({
        _id: `bl${Date.now()}`,
        _creationTime: Date.now(),
        appName,
        packageName,
        blocked: true,
        blockExpiresAt: expiresAt,
        createdAt: Date.now(),
      });
    }
    await setData(KEYS.blocklist, list);
    setBlocklist(list);
  }, []);

  const setTimeLimit = useCallback(async (packageName: string, minutes: number) => {
    const list = await getData<BlockEntry>(KEYS.blocklist, []);
    const idx = list.findIndex(e => e.packageName === packageName);
    if (idx >= 0) {
      list[idx] = { ...list[idx], dailyTimeLimitMinutes: minutes };
    } else {
      list.push({
        _id: `bl${Date.now()}`,
        _creationTime: Date.now(),
        appName: "",
        packageName,
        blocked: false,
        dailyTimeLimitMinutes: minutes,
        createdAt: Date.now(),
      });
    }
    await setData(KEYS.blocklist, list);
    setBlocklist(list);
  }, []);

  const renameApp = useCallback(async (packageName: string, aliasName: string) => {
    const list = await getData<AppRename>(KEYS.renames, []);
    const idx = list.findIndex(e => e.packageName === packageName);
    if (idx >= 0) {
      list[idx] = { ...list[idx], aliasName };
    } else {
      list.push({
        _id: `rn${Date.now()}`,
        _creationTime: Date.now(),
        packageName,
        aliasName,
      });
    }
    await setData(KEYS.renames, list);
    setRenames(list);
  }, []);

  const toggleHidden = useCallback(async (packageName: string, hiddenState: boolean) => {
    const list = await getData<HiddenApp>(KEYS.hidden, []);
    if (hiddenState && !list.find(e => e.packageName === packageName)) {
      list.push({ _id: `hd${Date.now()}`, _creationTime: Date.now(), packageName });
    } else if (!hiddenState) {
      const filtered = list.filter(e => e.packageName !== packageName);
      await setData(KEYS.hidden, filtered);
      setHidden(filtered);
      return;
    }
    await setData(KEYS.hidden, list);
    setHidden(list);
  }, []);

  const toggleFavorite = useCallback(async (packageName: string) => {
    const list = await getData<Favorite>(KEYS.favorites, []);
    const existing = list.find(e => e.packageName === packageName);
    if (existing) {
      const filtered = list.filter(e => e.packageName !== packageName);
      await setData(KEYS.favorites, filtered);
      setFavorites(filtered);
    } else {
      list.push({ _id: `fv${Date.now()}`, _creationTime: Date.now(), packageName, position: list.length });
      await setData(KEYS.favorites, list);
      setFavorites(list);
    }
  }, []);

  const toggleUninstall = useCallback(async (packageName: string) => {
    const list = await getData<UninstalledApp>(KEYS.uninstalled, []);
    const existing = list.find(e => e.packageName === packageName);
    if (existing) {
      const filtered = list.filter(e => e.packageName !== packageName);
      await setData(KEYS.uninstalled, filtered);
      setUninstalled(filtered);
    } else {
      list.push({ _id: `un${Date.now()}`, _creationTime: Date.now(), packageName });
      await setData(KEYS.uninstalled, list);
      setUninstalled(list);
    }
  }, []);

  const recordUsage = useCallback(async (packageName: string, date: string, minutes?: number) => {
    const list = await getData<FocusSession>(KEYS.usage, []);
    const addMins = minutes ?? 1;
    const idx = list.findIndex(e => e.packageName === packageName && e.date === date);
    if (idx >= 0) {
      list[idx] = { ...list[idx], minutesUsed: list[idx].minutesUsed + addMins, lastOpened: Date.now() };
    } else {
      list.push({
        _id: `us${Date.now()}`,
        _creationTime: Date.now(),
        packageName,
        date,
        minutesUsed: addMins,
        lastOpened: Date.now(),
      });
    }
    await setData(KEYS.usage, list);
    setUsage(list);
  }, []);

  return {
    loaded,
    apps,
    blocklist,
    renames,
    hidden,
    favorites,
    uninstalled,
    usage,
    refresh,
    toggleBlock,
    blockForDays,
    setTimeLimit,
    renameApp,
    toggleHidden,
    toggleFavorite,
    toggleUninstall,
    recordUsage,
  };
}