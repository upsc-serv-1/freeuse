import { useEffect, useState, useRef, useCallback } from "react";
import { SafeAreaView, Text, View, Input } from "@/components/ui";
import { StatusBar } from "expo-status-bar";
import {
  Settings, Star, Ban, Edit3, EyeOff, Trash2, Info,
  Search, Clock, AlertTriangle, Calendar
} from "lucide-react-native";
import { Pressable, ScrollView, Modal, Dimensions, Animated } from "react-native";
import { useRouter } from "expo-router";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const TIME_OPTS = [1, 5, 15, 30, 60];
const BLOCK_DAYS = [1, 3, 7, 30];
const DISTRACTING = ["Social", "Entertainment", "Messaging", "Shopping", "Music"];

// ═══ Helpers ═══
function useTime() {
  const [t, s] = useState(new Date());
  useEffect(() => { const i = setInterval(() => s(new Date()), 1000); return () => clearInterval(i); }, []);
  return t;
}
function fmtTime(d: Date) {
  return `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
}
function fmtDate(d: Date) {
  const days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  const mos = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  return `${days[d.getDay()]}, ${mos[d.getMonth()]} ${d.getDate()}`;
}
function today() {
  const d = new Date();
  return `${d.getFullYear()}-${(d.getMonth()+1).toString().padStart(2,"0")}-${d.getDate().toString().padStart(2,"0")}`;
}
function formatExpiry(ts: number): string {
  const d = new Date(ts);
  const days = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  const mos = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return `${days[d.getDay()]}, ${mos[d.getMonth()]} ${d.getDate()}`;
}

export default function HomeScreen() {
  const time = useTime();
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);
  const [page, setPage] = useState(0);

  // ═══ Convex data ═══
  const allApps = useQuery(api.apps.getAllApps);
  const blocklist = useQuery(api.apps.getBlocklist);
  const renames = useQuery(api.apps.getAppRenames);
  const hidden = useQuery(api.apps.getHiddenApps);
  const favs = useQuery(api.apps.getFavorites);
  const uninstalled = useQuery(api.apps.getUninstalledApps);
  const usage = useQuery(api.apps.getTodaysUsage, { date: today() });

  // ═══ Mutations ═══
  const toggleBlock = useMutation(api.apps.toggleBlockApp);
  const blockForDays = useMutation(api.apps.blockAppForDays);
  const setLimit = useMutation(api.apps.setTimeLimit);
  const renameApp = useMutation(api.apps.renameApp);
  const toggleHidden = useMutation(api.apps.toggleHiddenApp);
  const toggleFav = useMutation(api.apps.toggleFavorite);
  const toggleUninstall = useMutation(api.apps.toggleUninstall);
  const recordUsage = useMutation(api.apps.recordAppUsage);

  // ═══ State ═══
  const [ctxApp, setCtxApp] = useState<{ name: string; packageName: string; category: string } | null>(null);
  const [showRename, setShowRename] = useState(false);
  const [renameVal, setRenameVal] = useState("");
  const [promptApp, setPromptApp] = useState<{ name: string; packageName: string; category: string } | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [searchQ, setSearchQ] = useState("");

  // ═══ Scroll reminder ═══
  const [scrollCount, setScrollCount] = useState(0);
  const [showScrollReminder, setShowScrollReminder] = useState(false);
  const lastScrollWarn = useRef(0);

  // ═══ Derived ═══
  const visibleApps = (allApps ?? []).filter(a => {
    if (hidden?.find(h => h.packageName === a.packageName)) return false;
    if (uninstalled?.find(u => u.packageName === a.packageName)) return false;
    return true;
  });

  const filteredApps = visibleApps.filter(a =>
    a.name.toLowerCase().includes(searchQ.toLowerCase())
  );

  const isBlocked = (pkg: string) => {
    const entry = blocklist?.find(b => b.packageName === pkg);
    if (!entry) return false;
    if (entry.blockExpiresAt && entry.blockExpiresAt < Date.now()) return false; // expired
    return entry.blocked;
  };
  const getBlockExpiry = (pkg: string) => blocklist?.find(b => b.packageName === pkg)?.blockExpiresAt;
  const getLimit = (pkg: string) => blocklist?.find(b => b.packageName === pkg)?.dailyTimeLimitMinutes;
  const getAlias = (pkg: string) => renames?.find(r => r.packageName === pkg)?.aliasName;
  const isFav = (pkg: string) => favs?.find(f => f.packageName === pkg);
  const isHidden = (pkg: string) => hidden?.find(h => h.packageName === pkg);
  const isUninstalled = (pkg: string) => uninstalled?.find(u => u.packageName === pkg);
  const getUsed = (pkg: string) => usage?.find(u => u.packageName === pkg)?.minutesUsed ?? 0;

  const restricted = (blocklist ?? []).filter(b => {
    if (b.blockExpiresAt && b.blockExpiresAt < Date.now()) return false;
    return b.blocked || (b.dailyTimeLimitMinutes ?? 0) > 0;
  });
  const favoriteApps = visibleApps.filter(a => isFav(a.packageName));

  function showToast(msg: string) {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2000);
  }
  function closeCtx() { setCtxApp(null); setShowRename(false); }

  // ═══ TAP TO OPEN ═══
  function tapOpen(app: { name: string; packageName: string; category: string }) {
    const blocked = isBlocked(app.packageName);
    const limit = getLimit(app.packageName);
    const used = getUsed(app.packageName);
    const isDistracting = DISTRACTING.includes(app.category);

    if (blocked) {
      const expiry = getBlockExpiry(app.packageName);
      const msg = expiry ? `Blocked until ${formatExpiry(expiry)}` : `"${getAlias(app.packageName) || app.name}" is blocked`;
      showToast(msg);
      return;
    }
    if (isDistracting && !limit) {
      setPromptApp(app);
      return;
    }
    if (limit && used >= limit) {
      showToast(`Time's up — ${used}/${limit}m used today`);
      return;
    }
    recordUsage({ packageName: app.packageName, date: today() });
    showToast(`Opening ${getAlias(app.packageName) || app.name}...`);
  }

  // ═══ SCROLL REMINDER ═══
  const handleScroll = useCallback((e: any) => {
    if (page !== 1) return;
    const now = Date.now();
    if (now - lastScrollWarn.current < 8000) return;
    setScrollCount(c => {
      const nc = c + 1;
      if (nc >= 3 && !showScrollReminder) {
        lastScrollWarn.current = now;
        setShowScrollReminder(true);
        setTimeout(() => setShowScrollReminder(false), 3000);
        return 0;
      }
      return nc;
    });
  }, [page, showScrollReminder]);

  function resetScrollReminder() {
    setScrollCount(0);
    setShowScrollReminder(false);
    lastScrollWarn.current = Date.now();
  }

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-background">
      <StatusBar style="auto" />

      {/* ═══ Toast ═══ */}
      {toastMsg && (
        <View className="absolute top-20 left-5 right-5 z-50 bg-foreground/90 rounded-2xl px-5 py-3.5 items-center shadow-lg">
          <Text className="text-background text-sm font-medium">{toastMsg}</Text>
        </View>
      )}

      {/* Scroll reminder */}
      {showScrollReminder && (
        <View className="absolute top-32 left-5 right-5 z-50 bg-amber-500/90 rounded-2xl px-5 py-4 items-center shadow-lg">
          <AlertTriangle className="text-white mb-1" size={20} />
          <Text className="text-white text-sm font-medium text-center">
            You've been scrolling for a while. Remember why you opened the app.
          </Text>
          <Pressable onPress={() => setShowScrollReminder(false)} className="mt-2 px-4 py-1.5 rounded-lg bg-white/20">
            <Text className="text-white text-xs font-medium">Dismiss</Text>
          </Pressable>
        </View>
      )}

      {/* ═══════════════════════════════════════ */}
      {/* SWIPEABLE PAGES                       */}
      {/* ═══════════════════════════════════════ */}
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        onMomentumScrollEnd={(e) => {
          const p = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
          setPage(p);
          if (p === 0) resetScrollReminder();
        }}
        className="flex-1"
      >
        {/* ══════ PAGE 0: HOME ══════ */}
        <View style={{ width: SCREEN_WIDTH }} className="flex-1">
          {/* Clean top bar */}
          <View className="flex-row justify-between items-center px-6 pt-3 pb-1">
            <Pressable onPress={() => router.push("/settings" as any)} className="p-2 -ml-2 rounded-full active:opacity-50">
              <Settings className="text-muted-foreground" size={20} />
            </Pressable>
            <Text className="text-xs text-muted-foreground tracking-widest uppercase">
              {favoriteApps.length > 0 ? `${favoriteApps.length} favorites` : 'minimal'}
            </Text>
            <View style={{ width: 36 }} />
          </View>

          {/* Clock & Date - centered hero */}
          <View className="flex-1 items-center justify-center px-6 -mt-10">
            <Text className="text-7xl font-extralight text-foreground tracking-wider mb-2">
              {fmtTime(time)}
            </Text>
            <Text className="text-base text-muted-foreground tracking-wide mb-6">
              {fmtDate(time)}
            </Text>

            {/* Search bar */}
            <Pressable
              onPress={() => { setPage(1); setSearchQ(""); }}
              className="flex-row items-center w-full max-w-xs bg-muted rounded-full px-5 py-3.5 mb-8 active:opacity-70"
            >
              <Search className="text-muted-foreground mr-3" size={16} />
              <Text className="text-muted-foreground text-sm">Search apps...</Text>
            </Pressable>

            {/* Quick favorites row */}
            {favoriteApps.length > 0 && (
              <View className="flex-row flex-wrap justify-center gap-3 w-full max-w-sm">
                {favoriteApps.slice(0, 6).map(a => (
                  <Pressable
                    key={a.packageName}
                    onPress={() => tapOpen(a)}
                    onLongPress={() => { setCtxApp(a); setRenameVal(getAlias(a.packageName)||""); }}
                    className="bg-muted rounded-xl px-4 py-2.5 active:opacity-70"
                  >
                    <Text className="text-foreground text-sm">{getAlias(a.packageName) || a.name}</Text>
                  </Pressable>
                ))}
              </View>
            )}
          </View>

          {/* Bottom hint */}
          <View className="items-center pb-4">
            <Text className="text-xs text-muted-foreground/50 tracking-widest uppercase">Swipe left for apps</Text>
            <View className="flex-row mt-2 gap-1.5">
              {[0,1].map(i => (
                <View key={i} className={`w-1.5 h-1.5 rounded-full ${page===i?'bg-foreground':'bg-muted-foreground/30'}`} />
              ))}
            </View>
          </View>
        </View>

        {/* ══════ PAGE 1: APP LIST ══════ */}
        <View style={{ width: SCREEN_WIDTH }} className="flex-1">
          {/* Header with search */}
          <View className="px-5 pt-3 pb-2">
            <View className="flex-row items-center bg-muted rounded-full px-4 py-3 mb-2">
              <Search className="text-muted-foreground mr-3" size={16} />
              <Input
                placeholder="Search apps..."
                value={searchQ}
                onChangeText={(t) => { setSearchQ(t); resetScrollReminder(); }}
                className="flex-1 bg-transparent border-0 p-0 text-sm text-foreground"
                placeholderTextColor="#9BA1A6"
              />
            </View>
            <Text className="text-xs text-muted-foreground ml-1">
              {searchQ ? `${filteredApps.length} results` : `${visibleApps.length} apps • Tap to open • Long press for options`}
            </Text>
          </View>

          {/* App list */}
          <ScrollView
            className="flex-1 px-5"
            contentContainerClassName="pb-8"
            onScroll={handleScroll}
            scrollEventThrottle={16}
          >
            {filteredApps.length === 0 && (
              <View className="items-center py-16">
                <Search className="text-muted-foreground mb-3" size={28} />
                <Text className="text-muted-foreground text-sm">No apps found</Text>
              </View>
            )}
            {filteredApps.map((app) => {
              const alias = getAlias(app.packageName);
              const display = alias || app.name;
              const blocked = isBlocked(app.packageName);
              const favorite = isFav(app.packageName);
              const limit = getLimit(app.packageName);
              const used = getUsed(app.packageName);
              const expiry = getBlockExpiry(app.packageName);
              const isDistracting = DISTRACTING.includes(app.category);

              return (
                <Pressable
                  key={app.packageName}
                  onPress={() => tapOpen(app)}
                  onLongPress={() => { setCtxApp(app); setRenameVal(alias||""); }}
                  className="flex-row items-center py-3.5 border-b border-border/60 active:bg-muted/30"
                >
                  <View className="flex-1">
                    <Text className={`text-base ${blocked ? 'text-destructive line-through' : 'text-foreground'}`} numberOfLines={1}>
                      {display}
                    </Text>
                    <Text className="text-muted-foreground text-xs mt-0.5">
                      {app.category}
                      {blocked && expiry ? ` • Blocked till ${formatExpiry(expiry)}` : ''}
                      {blocked && !expiry ? ' • BLOCKED' : ''}
                      {isDistracting && !blocked && !limit ? ' • Set limit on tap' : ''}
                      {limit ? ` • ${used}/${limit}m` : ''}
                    </Text>
                  </View>
                  {favorite && <Star className="text-amber-400 ml-2" size={12} />}
                </Pressable>
              );
            })}
          </ScrollView>

          {/* Page dots */}
          <View className="flex-row justify-center pb-2 gap-1.5">
            {[0,1].map(i => (
              <View key={i} className={`w-1.5 h-1.5 rounded-full ${page===i?'bg-foreground':'bg-muted-foreground/30'}`} />
            ))}
          </View>
        </View>
      </ScrollView>

      {/* ═══════ TIME LIMIT PROMPT ═══════ */}
      <Modal visible={!!promptApp} transparent animationType="fade" onRequestClose={() => setPromptApp(null)}>
        <Pressable className="flex-1 bg-black/50 justify-center px-8" onPress={() => setPromptApp(null)}>
          <Pressable className="bg-background rounded-3xl p-6" onPress={(e) => e.stopPropagation()}>
            <Text className="text-lg font-semibold text-foreground text-center mb-1">
              {getAlias(promptApp?.packageName||"") || promptApp?.name}
            </Text>
            <Text className="text-sm text-muted-foreground text-center mb-6">
              This can be distracting. Set a daily time limit?
            </Text>
            <View className="flex-row flex-wrap justify-center gap-3 mb-6">
              {TIME_OPTS.map(m => (
                <Pressable key={m}
                  onPress={() => {
                    if (promptApp) {
                      setLimit({ packageName: promptApp.packageName, minutes: m });
                      recordUsage({ packageName: promptApp.packageName, date: today() });
                      showToast(`Opening (${m} min limit)`);
                      setPromptApp(null);
                    }
                  }}
                  className="px-6 py-3.5 rounded-2xl bg-muted active:opacity-70"
                >
                  <Text className="text-foreground text-base font-medium">{m} min</Text>
                </Pressable>
              ))}
            </View>
            <View className="flex-row gap-3">
              <Pressable
                onPress={() => {
                  if (promptApp) {
                    recordUsage({ packageName: promptApp.packageName, date: today() });
                    showToast(`Opening...`);
                    setPromptApp(null);
                  }
                }}
                className="flex-1 px-4 py-3.5 rounded-2xl bg-muted active:opacity-70"
              >
                <Text className="text-foreground text-center font-medium">Open Anyway</Text>
              </Pressable>
              <Pressable
                onPress={() => setPromptApp(null)}
                className="flex-1 px-4 py-3.5 rounded-2xl bg-destructive/20 active:opacity-70"
              >
                <Text className="text-destructive text-center font-medium">Cancel</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* ═══════ CONTEXT MENU ═══════ */}
      <Modal visible={!!ctxApp} transparent animationType="fade" onRequestClose={closeCtx}>
        <Pressable className="flex-1 bg-black/40 justify-center px-8" onPress={closeCtx}>
          <Pressable className="bg-background rounded-3xl overflow-hidden" onPress={(e) => e.stopPropagation()}>
            {ctxApp && (
              <View className="px-6 pt-6 pb-4 border-b border-border">
                <Text className="text-lg font-semibold text-foreground">{getAlias(ctxApp.packageName) || ctxApp.name}</Text>
                <Text className="text-xs text-muted-foreground mt-0.5">{ctxApp.category} • {ctxApp.packageName}</Text>
              </View>
            )}

            {ctxApp && (
              <View className="py-1">
                {/* Favorite */}
                <CtxItem icon={Star} label={isFav(ctxApp.packageName) ? "Remove from Favorites" : "Add to Favorites"} color="text-amber-400"
                  onPress={() => { toggleFav({ packageName: ctxApp.packageName }); closeCtx(); }} />

                {/* Block */}
                <CtxItem icon={Ban} label={isBlocked(ctxApp.packageName) ? "Unblock App" : "Block App"} color="text-destructive"
                  onPress={() => { toggleBlock({ appName: ctxApp.name, packageName: ctxApp.packageName, blocked: !isBlocked(ctxApp.packageName) }); closeCtx(); }} />

                {/* Block for days */}
                <View className="px-6 py-2">
                  <Text className="text-xs text-muted-foreground font-medium mb-2 ml-1">Block for:</Text>
                  <View className="flex-row flex-wrap gap-2">
                    {BLOCK_DAYS.map(d => (
                      <Pressable key={d}
                        onPress={() => { blockForDays({ appName: ctxApp.name, packageName: ctxApp.packageName, days: d }); closeCtx(); }}
                        className="px-4 py-2 rounded-xl bg-muted active:opacity-70"
                      >
                        <Text className="text-foreground text-sm">{d} {d===1?'day':'days'}</Text>
                      </Pressable>
                    ))}
                  </View>
                </View>

                {/* Rename */}
                <CtxItem icon={Edit3} label="Rename App" color="text-foreground"
                  onPress={() => setShowRename(true)} />
                {showRename ? (
                  <View className="flex-row items-center px-6 py-3 gap-2">
                    <Input value={renameVal} onChangeText={setRenameVal} placeholder="New name..."
                      className="flex-1 bg-muted rounded-xl px-4 py-2.5 text-foreground text-sm" placeholderTextColor="#9BA1A6" autoFocus />
                    <Pressable onPress={() => { if (renameVal.trim() && ctxApp) { renameApp({ packageName: ctxApp.packageName, aliasName: renameVal.trim() }); } closeCtx(); }}
                      className="px-4 py-2.5 rounded-xl bg-primary">
                      <Text className="text-primary-foreground text-sm font-medium">Save</Text>
                    </Pressable>
                  </View>
                ) : null}

                {/* Hide */}
                <CtxItem icon={EyeOff} label={isHidden(ctxApp.packageName) ? "Show App" : "Hide App"} color="text-foreground"
                  onPress={() => { toggleHidden({ packageName: ctxApp.packageName, hidden: !isHidden(ctxApp.packageName) }); closeCtx(); }} />

                {/* Uninstall */}
                <CtxItem icon={Trash2} label={isUninstalled(ctxApp.packageName) ? "Reinstall App" : "Uninstall App"} color="text-destructive"
                  onPress={() => { toggleUninstall({ packageName: ctxApp.packageName }); closeCtx(); }} />

                {/* App Info */}
                <CtxItem icon={Info} label="App Info" color="text-foreground"
                  onPress={() => { showToast(`${ctxApp.name} • ${ctxApp.packageName}`); closeCtx(); }} />
              </View>
            )}
            <Pressable onPress={closeCtx} className="border-t border-border px-6 py-4 active:bg-muted">
              <Text className="text-center text-foreground font-medium">Cancel</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

function CtxItem({ icon: Icon, label, color, onPress }: { icon: any; label: string; color: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} className="flex-row items-center px-6 py-3.5 active:bg-muted">
      <Icon className={`${color} mr-4`} size={20} />
      <Text className={`text-base ${color}`}>{label}</Text>
    </Pressable>
  );
}