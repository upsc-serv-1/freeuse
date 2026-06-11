import { useEffect, useRef, useState, useCallback } from "react";
import { SafeAreaView, Text, View, Input } from "@/components/ui";
import { StatusBar } from "expo-status-bar";
import {
  Settings, Star, Ban, Edit3, EyeOff, Trash2, Info,
  Search, Clock, AlertTriangle, Phone, Camera, ArrowRight
} from "lucide-react-native";
import { Pressable, ScrollView, Modal, Dimensions, Animated, PanResponder } from "react-native";
import { useRouter } from "expo-router";
import { useLocalApps, ensureSeeded } from "@/hooks/useLocalStorage";
import { usePermissions } from "@/app/_layout";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const TIME_OPTS = [1, 5, 15, 30, 60];
const BLOCK_DAYS_OPTS = [1, 3, 7, 30];
const DISTRACTING = ["Social", "Entertainment", "Messaging", "Shopping", "Music"];

function useTime() {
  const ref = useRef({ interval: null as any });
  const now = new Date();
  const [t, s] = [now, (_: Date) => {}];
  // Simplified - just return current time
  return new Date();
}

function fmtTime(d: Date) {
  return `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
}

function fmtDate(d: Date) {
  const days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  const mos = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  return `${days[d.getDay()]}, ${d.getDate()}${getOrdinal(d.getDate())} ${mos[d.getMonth()]}`;
}

function getOrdinal(n: number) {
  if (n > 3 && n < 21) return "th";
  switch (n % 10) { case 1: return "st"; case 2: return "nd"; case 3: return "rd"; default: return "th"; }
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

function fmtMins(m: number): string {
  if (m < 60) return `${Math.round(m)} min`;
  const h = Math.floor(m / 60);
  const mins = Math.round(m % 60);
  return `${h} h ${mins > 0 ? mins + ' min' : ''}`.trim();
}

const ALPHA = "#ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

export default function HomeScreen() {
  const router = useRouter();
  const listScrollRef = useRef<ScrollView>(null);
  const [page, setPage] = useState(0);
  const [time, setTime] = useState(new Date());

  // ═══ Local Storage Data ═══
  const {
    loaded, apps, blocklist, renames, hidden, favorites, uninstalled, usage,
    toggleBlock, blockForDays, setTimeLimit, renameApp, toggleHidden,
    toggleFavorite, toggleUninstall, recordUsage, refresh
  } = useLocalApps();

  // Seed data on first load
  useEffect(() => { ensureSeeded().then(() => refresh()); }, []);

  // Update clock
  useEffect(() => {
    const i = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(i);
  }, []);

  // ═══ Permissions check ═══
  const { perms, checkPermissions, openAccessibility, openUsageStats, openBatteryOpt } = usePermissions();
  const [showPermModal, setShowPermModal] = useState(false);

  useEffect(() => {
    if (!perms.checking) {
      if (!perms.accessibilityEnabled || !perms.usageAccessGranted) {
        // Delay showing the modal slightly so the UI renders first
        const t = setTimeout(() => setShowPermModal(true), 500);
        return () => clearTimeout(t);
      }
    }
  }, [perms.checking, perms.accessibilityEnabled, perms.usageAccessGranted]);

  // ═══ UI State ═══
  const [ctxApp, setCtxApp] = useState<any>(null);
  const [showRename, setShowRename] = useState(false);
  const [renameVal, setRenameVal] = useState("");
  const [promptApp, setPromptApp] = useState<any>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [searchQ, setSearchQ] = useState("");
  const [blockDaysApp, setBlockDaysApp] = useState<any>(null);
  const [blockDaysVal, setBlockDaysVal] = useState(7);
  const [slideBlocked, setSlideBlocked] = useState(false);
  const [expiredApp, setExpiredApp] = useState<any>(null);
  const [spentToday, setSpentToday] = useState(0);
  const [spentWeek, setSpentWeek] = useState(0);
  const [showScrollReminder, setShowScrollReminder] = useState(false);
  const scrollEvents = useRef(0);
  const lastScrollTime = useRef(0);

  // Google Search Swipe Up
  const [showGoogleSearch, setShowGoogleSearch] = useState(false);
  const [googleQuery, setGoogleQuery] = useState("");
  const swipeStartY = useRef(0);
  const swipeUpPan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gs) => Math.abs(gs.dy) > 10 && Math.abs(gs.dx) < 20,
      onPanResponderGrant: (_, gs) => { swipeStartY.current = gs.y0; },
      onPanResponderRelease: (_, gs) => {
        if (swipeStartY.current - gs.moveY > 80) {
          setGoogleQuery("");
          setShowGoogleSearch(true);
        }
      },
    })
  ).current;

  // Derived data
  const visibleApps = (apps ?? []).filter(a => {
    if (hidden?.find(h => h.packageName === a.packageName)) return false;
    if (uninstalled?.find(u => u.packageName === a.packageName)) return false;
    return true;
  });
  const filteredApps = visibleApps.filter(a =>
    a.name.toLowerCase().includes(searchQ.toLowerCase())
  );
  const sortedApps = [...filteredApps].sort((a, b) => a.name.localeCompare(b.name));

  const isBlocked = (pkg: string) => {
    const entry = blocklist?.find(b => b.packageName === pkg);
    if (!entry) return false;
    if (entry.blockExpiresAt && entry.blockExpiresAt < Date.now()) return false;
    return entry.blocked;
  };
  const getBlockExpiry = (pkg: string) => blocklist?.find(b => b.packageName === pkg)?.blockExpiresAt;
  const getLimit = (pkg: string) => blocklist?.find(b => b.packageName === pkg)?.dailyTimeLimitMinutes;
  const getAlias = (pkg: string) => renames?.find(r => r.packageName === pkg)?.aliasName;
  const isFav = (pkg: string) => favorites?.find(f => f.packageName === pkg);
  const isHidden = (pkg: string) => hidden?.find(h => h.packageName === pkg);
  const getUsed = (pkg: string) => usage?.find(u => u.packageName === pkg && u.date === today())?.minutesUsed ?? 0;

  const favoriteApps = visibleApps.filter(a => isFav(a.packageName));

  function showToast(msg: string) {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2000);
  }
  function closeCtx() { setCtxApp(null); setShowRename(false); }

  function tapOpen(app: any) {
    const blocked = isBlocked(app.packageName);
    const limit = getLimit(app.packageName);
    const used = getUsed(app.packageName);
    const isDistracting = DISTRACTING.includes(app.category);

    if (blocked) {
      const expiry = getBlockExpiry(app.packageName);
      showToast(expiry ? `Blocked until ${formatExpiry(expiry)}` : `"${getAlias(app.packageName) || app.name}" is blocked`);
      return;
    }
    if (isDistracting && !limit) {
      setPromptApp(app);
      return;
    }
    if (limit && used >= limit) {
      setSpentToday(used);
      setSpentWeek(Math.round(used * 3.5));
      setExpiredApp(app);
      return;
    }
    recordUsage(app.packageName, today());
    showToast(`Opening ${getAlias(app.packageName) || app.name}...`);
  }

  function scrollToLetter(letter: string) {
    const idx = sortedApps.findIndex(a => {
      const first = a.name.charAt(0).toUpperCase();
      if (letter === "#") return first < "A" || !isNaN(Number(first));
      return first === letter;
    });
    if (idx >= 0 && listScrollRef.current) {
      listScrollRef.current.scrollTo({ y: idx * 52, animated: true });
    }
  }

  const handleListScroll = useCallback((e: any) => {
    if (page !== 1) return;
    const now = Date.now();
    scrollEvents.current += 1;
    if (now - lastScrollTime.current > 8000) scrollEvents.current = 0;
    lastScrollTime.current = now;
    if (scrollEvents.current >= 4 && !showScrollReminder) {
      setShowScrollReminder(true);
      setTimeout(() => setShowScrollReminder(false), 3500);
      scrollEvents.current = 0;
    }
  }, [page, showScrollReminder]);

  const slideAnim = useRef(new Animated.Value(0)).current;
  const slidePan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: Animated.event([null, { dx: slideAnim }], { useNativeDriver: false }),
      onPanResponderRelease: (_, gs) => {
        if (gs.dx > 200) {
          setSlideBlocked(true);
          setTimeout(() => {
            if (blockDaysApp) {
              blockForDays(blockDaysApp.name, blockDaysApp.packageName, blockDaysVal);
              showToast(`Blocked for ${blockDaysVal} days`);
            }
            setBlockDaysApp(null);
            setSlideBlocked(false);
            slideAnim.setValue(0);
          }, 300);
        } else {
          Animated.spring(slideAnim, { toValue: 0, useNativeDriver: false }).start();
        }
      },
    })
  ).current;

  return (
    <SafeAreaView edges={["top"]} className="flex-1" style={{ backgroundColor: "#000" }}>
      <StatusBar style="light" />

      {toastMsg && (
        <View className="absolute top-16 left-5 right-5 z-50 bg-white/10 backdrop-blur rounded-2xl px-5 py-3.5 items-center border border-white/20">
          <Text className="text-white text-sm font-medium">{toastMsg}</Text>
        </View>
      )}

      {showScrollReminder && (
        <View className="absolute top-28 left-5 right-5 z-50 bg-white/10 backdrop-blur rounded-2xl px-5 py-4 items-center border border-white/20">
          <AlertTriangle className="text-white mb-1" size={18} />
          <Text className="text-white/80 text-xs text-center">You've been scrolling for a while. Remember why you opened this.</Text>
        </View>
      )}

      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        onMomentumScrollEnd={(e) => setPage(Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH))}
        className="flex-1"
      >
        {/* PAGE 0: HOME */}
        <View style={{ width: SCREEN_WIDTH, backgroundColor: "#000" }} className="flex-1 px-5">
          <View className="items-center pt-6 pb-4">
            <View className="w-40 h-40 rounded-full border border-white/30 items-center justify-center">
              <Text className="text-5xl font-light text-white tracking-wider" style={{ fontFamily: 'System', fontWeight: '200', letterSpacing: 4 }}>
                {fmtTime(time)}
              </Text>
              <Text className="text-xs text-white/60 mt-1 tracking-wide">
                {fmtDate(time)}
              </Text>
            </View>
          </View>

          <View className="flex-1 pt-2" {...swipeUpPan.panHandlers}>
            {favoriteApps.length === 0 ? (
              <View className="items-center justify-center flex-1">
                <Text className="text-white/30 text-sm">No favorites yet</Text>
                <Text className="text-white/20 text-xs mt-2">Long press apps to add to favorites</Text>
              </View>
            ) : (
              <ScrollView className="flex-1" contentContainerClassName="pb-4">
                {favoriteApps.map((a, i) => (
                  <Pressable
                    key={a.packageName}
                    onPress={() => tapOpen(a)}
                    onLongPress={() => { setCtxApp(a); setRenameVal(getAlias(a.packageName)||""); }}
                    className="py-2.5 active:opacity-50"
                  >
                    <Text className="text-white text-lg font-light tracking-wide">
                      {getAlias(a.packageName) || a.name}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            )}
          </View>

          <View className="flex-row justify-between items-center pb-5 px-1">
            <Phone className="text-white/40" size={20} />
            <View className="flex-row gap-1.5">
              {[0,1].map(i => (
                <View key={i} className={`w-1 h-1 rounded-full ${page===i?'bg-white':'bg-white/20'}`} />
              ))}
            </View>
            <Camera className="text-white/40" size={20} />
          </View>
        </View>

        {/* PAGE 1: APP DRAWER */}
        <View style={{ width: SCREEN_WIDTH, backgroundColor: "#000" }} className="flex-1">
          <View className="flex-row items-center px-5 pt-3 pb-1">
            <View className="flex-1 flex-row items-center bg-white/10 rounded-full px-4 py-3 mr-3">
              <Search className="text-white/50 mr-3" size={16} />
              <Input
                placeholder="Search apps..."
                value={searchQ}
                onChangeText={setSearchQ}
                className="flex-1 bg-transparent border-0 p-0 text-sm text-white"
                placeholderTextColor="#ffffff50"
              />
            </View>
            <Pressable onPress={() => router.push("/settings" as any)} className="p-2 active:opacity-50">
              <Settings className="text-white/50" size={20} />
            </Pressable>
          </View>

          <View className="flex-1 flex-row">
            <ScrollView
              ref={listScrollRef}
              className="flex-1 px-5"
              contentContainerClassName="pb-8"
              onScroll={handleListScroll}
              scrollEventThrottle={16}
            >
              {sortedApps.length === 0 && (
                <View className="items-center py-16">
                  <Search className="text-white/30 mb-3" size={28} />
                  <Text className="text-white/40 text-sm">No apps found</Text>
                </View>
              )}
              {sortedApps.map((app) => {
                const alias = getAlias(app.packageName);
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
                    className="py-3 border-b border-white/10 active:opacity-50"
                  >
                    <View className="flex-row items-center">
                      <View className="flex-1">
                        <Text className={`text-base font-light ${blocked ? 'text-white/40 line-through' : 'text-white'}`}>
                          {alias || app.name}
                        </Text>
                        {(blocked || limit || isDistracting) && (
                          <Text className="text-white/30 text-xs mt-0.5">
                            {blocked && expiry ? `Blocked till ${formatExpiry(expiry)}` : ''}
                            {blocked && !expiry ? 'Blocked' : ''}
                            {limit ? `${used}/${limit}m` : ''}
                            {isDistracting && !blocked && !limit ? 'Set limit' : ''}
                          </Text>
                        )}
                      </View>
                      {favorite && <Text className="text-white/40 text-xs">★</Text>}
                    </View>
                  </Pressable>
                );
              })}
            </ScrollView>

            <View className="w-7 justify-center pr-1">
              {ALPHA.map(letter => (
                <Pressable
                  key={letter}
                  onPress={() => scrollToLetter(letter)}
                  className="py-0.5 items-center active:opacity-50"
                >
                  <Text className="text-white/40 text-[10px] leading-3 font-light">{letter}</Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View className="items-center pb-3">
            <View className="flex-row gap-1.5">
              {[0,1].map(i => (
                <View key={i} className={`w-1 h-1 rounded-full ${page===i?'bg-white':'bg-white/20'}`} />
              ))}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* TIME LIMIT PROMPT */}
      <Modal visible={!!promptApp} transparent animationType="fade" onRequestClose={() => setPromptApp(null)}>
        <Pressable className="flex-1 justify-center px-6" style={{ backgroundColor: "#00000080" }} onPress={() => setPromptApp(null)}>
          <Pressable className="bg-black rounded-3xl p-6 border border-white/20" onPress={e => e.stopPropagation()}>
            <Text className="text-white text-base text-center mb-1">{promptApp?.name}</Text>
            <Text className="text-white/50 text-xs text-center mb-6">This app can be distracting. Set a daily limit?</Text>
            <View className="flex-row justify-center gap-3 mb-6">
              {TIME_OPTS.map(m => (
                <Pressable key={m}
                  onPress={() => {
                    if (promptApp) {
                      setTimeLimit(promptApp.packageName, m);
                      recordUsage(promptApp.packageName, today(), 0);
                      showToast(`${m} min limit set`);
                      setPromptApp(null);
                    }
                  }}
                  className="px-5 py-3 rounded-2xl bg-white/10 active:opacity-70"
                >
                  <Text className="text-white text-sm">{m} min</Text>
                </Pressable>
              ))}
            </View>
            <Pressable
              onPress={() => { setPromptApp(null); }}
              className="py-3 rounded-2xl bg-white/10 items-center active:opacity-70"
            >
              <Text className="text-white/70 text-sm">Skip</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>

      {/* GOOGLE SEARCH */}
      <Modal visible={showGoogleSearch} transparent animationType="slide" onRequestClose={() => setShowGoogleSearch(false)}>
        <View style={{ backgroundColor: "#000" }} className="flex-1 pt-16 px-5">
          <View className="flex-row items-center bg-white/10 rounded-full px-5 py-3.5 mb-6">
            <Search className="text-white/50 mr-3" size={18} />
            <Input
              placeholder="Search Google..."
              value={googleQuery}
              onChangeText={setGoogleQuery}
              className="flex-1 bg-transparent border-0 p-0 text-base text-white"
              placeholderTextColor="#ffffff50"
              autoFocus
              autoCorrect={false} // avoid TS issues
            />
            <Pressable onPress={() => setShowGoogleSearch(false)} className="p-2 active:opacity-50">
              <Text className="text-white/50 text-sm">Cancel</Text>
            </Pressable>
          </View>

          {googleQuery.length > 0 && (
            <Pressable
              onPress={() => {
                showToast(`Searching Google for "${googleQuery}"`);
                setShowGoogleSearch(false);
              }}
              className="flex-row items-center bg-white/10 rounded-2xl p-4 active:opacity-70"
            >
              <Search className="text-white/50 mr-3" size={18} />
              <Text className="text-white text-base flex-1">Search "{googleQuery}"</Text>
              <Text className="text-white/30 text-xs">Google</Text>
            </Pressable>
          )}

          <View className="flex-1 justify-center items-center">
            <Search className="text-white/20 mb-4" size={48} />
            <Text className="text-white/30 text-sm">Swipe up from home screen</Text>
            <Text className="text-white/20 text-xs mt-1">to search Google instantly</Text>
          </View>
        </View>
      </Modal>

      {/* BLOCK FOR DAYS */}
      <Modal visible={!!blockDaysApp} transparent animationType="fade" onRequestClose={() => setBlockDaysApp(null)}>
        <Pressable className="flex-1 justify-center px-6" style={{ backgroundColor: "#00000080" }} onPress={() => setBlockDaysApp(null)}>
          <Pressable className="bg-black rounded-3xl p-6 border border-white/20" onPress={e => e.stopPropagation()}>
            <Text className="text-white text-base text-center">Block {blockDaysApp?.name} for</Text>
            <Text className="text-white text-3xl font-bold text-center my-4">{blockDaysVal} {blockDaysVal === 1 ? 'day' : 'days'}</Text>
            <View className="h-10 justify-center mb-6">
              <View className="h-1 bg-white/20 rounded-full mx-2">
                <Animated.View
                  className="h-1 bg-white rounded-full"
                  style={{ width: slideAnim.interpolate({ inputRange: [0, 260], outputRange: ["0%", "100%"], extrapolate: "clamp" }) }}
                />
              </View>
              <View className="flex-row justify-between px-2 -mt-2">
                {["4h","1d","3d","7d","14d","30d"].map((label, i) => (
                  <Pressable key={label} onPress={() => {
                    const vals = [0.16, 1, 3, 7, 14, 30];
                    setBlockDaysVal(vals[i]);
                  }}>
                    <Text className={`text-xs ${blockDaysVal === [0.16,1,3,7,14,30][i] ? 'text-white' : 'text-white/30'}`}>{label}</Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <View className="h-14 bg-white/10 rounded-full justify-center overflow-hidden">
              <Animated.View
                {...slidePan.panHandlers}
                style={{
                  transform: [{ translateX: slideAnim.interpolate({ inputRange: [0, 260], outputRange: [0, 220], extrapolate: "clamp" }) }]
                }}
                className="w-12 h-12 bg-white rounded-full items-center justify-center ml-1"
              >
                <ArrowRight className="text-black" size={18} />
              </Animated.View>
              <Text className="absolute text-white/40 text-xs self-center tracking-widest uppercase">Slide to block</Text>
            </View>

            {slideBlocked && (
              <Text className="text-white/60 text-xs text-center mt-3">Blocked!</Text>
            )}
          </Pressable>
        </Pressable>
      </Modal>

      {/* TIME EXPIRED OVERLAY */}
      <Modal visible={!!expiredApp} transparent animationType="fade" onRequestClose={() => setExpiredApp(null)}>
        <Pressable className="flex-1 justify-center px-6" style={{ backgroundColor: "#00000080" }} onPress={() => {}}>
          <Pressable className="bg-black rounded-3xl p-6 border border-white/20" onPress={e => e.stopPropagation()}>
            <Text className="text-white text-sm text-center leading-5 mb-6">
              The time you have decided to spend on <Text className="font-bold">{expiredApp?.name}</Text> has run out.
            </Text>

            <View className="flex-row justify-center gap-8 mb-6">
              <View className="items-center">
                <Text className="text-white text-xl font-bold">{fmtMins(spentToday)}</Text>
                <Text className="text-white/40 text-xs mt-1">Spent today</Text>
              </View>
              <View className="w-px bg-white/20" />
              <View className="items-center">
                <Text className="text-white text-xl font-bold">{fmtMins(spentWeek)}</Text>
                <Text className="text-white/40 text-xs mt-1">Last 7 days</Text>
              </View>
            </View>

            <Pressable
              onPress={() => { showToast("Closing app..."); setExpiredApp(null); }}
              className="bg-white rounded-full py-4 items-center mb-4 active:opacity-80"
            >
              <Text className="text-black font-bold text-sm tracking-widest">TAKE ME OUT OF HERE</Text>
            </Pressable>

            <Text className="text-white/40 text-xs text-center mb-3">Add more time</Text>
            <View className="flex-row justify-center gap-3">
              {[15, 5, 1].map(m => (
                <Pressable key={m}
                  onPress={() => {
                    if (expiredApp) {
                      recordUsage(expiredApp.packageName, today(), 0);
                      showToast(`Added ${m} min`);
                      setExpiredApp(null);
                    }
                  }}
                  className={`px-5 py-2.5 rounded-full ${m === 5 ? 'border border-white/50' : 'bg-white/10'} active:opacity-70`}
                >
                  <Text className={`text-sm ${m === 5 ? 'text-white' : 'text-white/60'}`}>{m} min</Text>
                </Pressable>
              ))}
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* CONTEXT MENU */}
      <Modal visible={!!ctxApp} transparent animationType="fade" onRequestClose={closeCtx}>
        <Pressable className="flex-1 justify-center px-6" style={{ backgroundColor: "#00000080" }} onPress={closeCtx}>
          <Pressable className="bg-black rounded-3xl overflow-hidden border border-white/20" onPress={e => e.stopPropagation()}>
            {ctxApp && (
              <View className="px-6 pt-6 pb-4 border-b border-white/10">
                <Text className="text-lg font-medium text-white">{getAlias(ctxApp.packageName) || ctxApp.name}</Text>
                <Text className="text-white/40 text-xs mt-1">{ctxApp.packageName}</Text>
              </View>
            )}
            {ctxApp && (
              <View className="py-1">
                <CtxItem icon={Star} label={isFav(ctxApp.packageName) ? "Remove from Favorites" : "Add to Favorites"} color="text-white"
                  onPress={() => { toggleFavorite(ctxApp.packageName); closeCtx(); }} />
                <CtxItem icon={Ban} label="Block for Days" color="text-white"
                  onPress={() => { setBlockDaysApp(ctxApp); setBlockDaysVal(7); closeCtx(); }} />
                <CtxItem icon={Edit3} label="Rename App" color="text-white"
                  onPress={() => setShowRename(true)} />
                {showRename ? (
                  <View className="flex-row items-center px-6 py-3 gap-2">
                    <Input value={renameVal} onChangeText={setRenameVal} placeholder="New name..."
                      className="flex-1 bg-white/10 rounded-xl px-4 py-2.5 text-white text-sm" placeholderTextColor="#ffffff50" autoFocus />
                    <Pressable onPress={() => { if (renameVal.trim() && ctxApp) { renameApp(ctxApp.packageName, renameVal.trim()); } closeCtx(); }}
                      className="px-4 py-2.5 rounded-xl bg-white">
                      <Text className="text-black text-sm font-medium">Save</Text>
                    </Pressable>
                  </View>
                ) : null}
                <CtxItem icon={EyeOff} label={isHidden(ctxApp.packageName) ? "Show App" : "Hide App"} color="text-white"
                  onPress={() => { toggleHidden(ctxApp.packageName, !isHidden(ctxApp.packageName)); closeCtx(); }} />
                <CtxItem icon={Trash2} label="Uninstall App" color="text-white/60"
                  onPress={() => { toggleUninstall(ctxApp.packageName); closeCtx(); showToast(`${ctxApp.name} uninstalled`); }} />
                <CtxItem icon={Info} label="App Info" color="text-white/60"
                  onPress={() => { showToast(`${ctxApp.name} • ${ctxApp.packageName}`); closeCtx(); }} />
              </View>
            )}
            <Pressable onPress={closeCtx} className="border-t border-white/10 px-6 py-4 active:opacity-70">
              <Text className="text-center text-white/60 font-medium">Cancel</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>

      {/* ═══════ PERMISSIONS MODAL ═══════ */}
      <Modal visible={showPermModal} transparent animationType="fade" onRequestClose={() => setShowPermModal(false)}>
        <Pressable className="flex-1 justify-center px-5" style={{ backgroundColor: "#000000CC" }}>
          <Pressable className="bg-black rounded-3xl overflow-hidden border border-white/20" onPress={e => e.stopPropagation()}>
            <View className="px-6 pt-8 pb-6">
              <Text className="text-white text-xl font-bold text-center mb-2">Permissions Required</Text>
              <Text className="text-white/50 text-xs text-center mb-6 leading-5">
                To block distracting apps, Minimalist needs two special permissions.
                Please grant them below — your data stays on-device.
              </Text>

              {/* Usage Access */}
              <View className="flex-row items-center mb-4 bg-white/5 rounded-2xl p-4">
                <View className="w-10 h-10 rounded-full bg-white/10 items-center justify-center mr-4">
                  <Text className="text-white font-bold">1</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-white text-sm font-medium">Usage Access</Text>
                  <Text className="text-white/40 text-xs mt-0.5">Lets us detect which app is in the foreground</Text>
                </View>
              </View>

              {/* Accessibility */}
              <View className="flex-row items-center mb-6 bg-white/5 rounded-2xl p-4">
                <View className="w-10 h-10 rounded-full bg-white/10 items-center justify-center mr-4">
                  <Text className="text-white font-bold">2</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-white text-sm font-medium">Accessibility Service</Text>
                  <Text className="text-white/40 text-xs mt-0.5">Real-time detection when you open an app</Text>
                </View>
              </View>

              {/* Open settings buttons */}
              <Pressable
                onPress={() => { openUsageStats(); }}
                className="bg-white/10 rounded-full py-3.5 items-center mb-3 active:opacity-70"
              >
                <Text className="text-white text-sm font-medium">Open Usage Access Settings</Text>
              </Pressable>

              <Pressable
                onPress={() => { openAccessibility(); }}
                className="bg-white/10 rounded-full py-3.5 items-center mb-3 active:opacity-70"
              >
                <Text className="text-white text-sm font-medium">Open Accessibility Settings</Text>
              </Pressable>

              <Pressable
                onPress={() => { openBatteryOpt(); }}
                className="bg-white/10 rounded-full py-3.5 items-center mb-6 active:opacity-70"
              >
                <Text className="text-white text-sm font-medium">Disable Battery Optimization</Text>
              </Pressable>

              {/* Recheck */}
              <Pressable
                onPress={() => {
                  checkPermissions().then(() => {
                    setShowPermModal(false);
                  });
                }}
                className="bg-white rounded-full py-3.5 items-center active:opacity-80"
              >
                <Text className="text-black font-bold text-sm">I've Granted Permissions — Check</Text>
              </Pressable>

              <Pressable
                onPress={() => setShowPermModal(false)}
                className="py-3 items-center mt-2 active:opacity-50"
              >
                <Text className="text-white/40 text-xs">Skip for now</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

    </SafeAreaView>
  );
}

function CtxItem({ icon: Icon, label, color, onPress }: { icon: any; label: string; color: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} className="flex-row items-center px-6 py-3.5 active:opacity-50">
      <Icon className={`${color} mr-4`} size={18} />
      <Text className={`text-base ${color}`}>{label}</Text>
    </Pressable>
  );
}