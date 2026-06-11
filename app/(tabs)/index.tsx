import { useEffect, useState, useRef } from "react";
import { SafeAreaView, Text, View, Input } from "@/components/ui";
import { StatusBar } from "expo-status-bar";
import { Settings, Star, Ban, Edit3, EyeOff, Trash2, Info, Search, ChevronRight, Heart } from "lucide-react-native";
import { Pressable, ScrollView, Modal, Dimensions, PanResponder, Animated } from "react-native";
import { useRouter } from "expo-router";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// ─── Time helpers ───
function useTime() {
  const [time, setTime] = useState(new Date());
  useEffect(() => { const i = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(i); }, []);
  return time;
}
function fmtTime(d: Date) { return `${d.getHours().toString().padStart(2,"0")}:${d.getMinutes().toString().padStart(2,"0")}`; }
function fmtDate(d: Date) {
  const days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  const mos = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  return `${days[d.getDay()]}, ${mos[d.getMonth()]} ${d.getDate()}`;
}
function today() { const d=new Date(); return `${d.getFullYear()}-${(d.getMonth()+1).toString().padStart(2,"0")}-${d.getDate().toString().padStart(2,"0")}`; }

export default function HomeScreen() {
  const time = useTime();
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);
  const [page, setPage] = useState(0);

  // Data
  const allApps = useQuery(api.apps.getAllApps);
  const blocklist = useQuery(api.apps.getBlocklist);
  const renames = useQuery(api.apps.getAppRenames);
  const hidden = useQuery(api.apps.getHiddenApps);
  const favs = useQuery(api.apps.getFavorites);
  const uninstalled = useQuery(api.apps.getUninstalledApps);
  const usage = useQuery(api.apps.getTodaysUsage, { date: today() });

  // Mutations
  const toggleBlock = useMutation(api.apps.toggleBlockApp);
  const renameApp = useMutation(api.apps.renameApp);
  const toggleHidden = useMutation(api.apps.toggleHiddenApp);
  const toggleFav = useMutation(api.apps.toggleFavorite);
  const toggleUninstall = useMutation(api.apps.toggleUninstall);

  // Context menu state
  const [ctxApp, setCtxApp] = useState<{ name: string; packageName: string; category: string } | null>(null);
  const [showRename, setShowRename] = useState(false);
  const [renameVal, setRenameVal] = useState("");

  // Visible apps (exclude hidden + uninstalled)
  const visibleApps = (allApps ?? []).filter(a => {
    if (hidden?.find(h => h.packageName === a.packageName)) return false;
    if (uninstalled?.find(u => u.packageName === a.packageName)) return false;
    return true;
  });

  const isBlocked = (pkg: string) => blocklist?.find(b => b.packageName === pkg)?.blocked ?? false;
  const getLimit = (pkg: string) => blocklist?.find(b => b.packageName === pkg)?.dailyTimeLimitMinutes;
  const getAlias = (pkg: string) => renames?.find(r => r.packageName === pkg)?.aliasName;
  const isFav = (pkg: string) => favs?.find(f => f.packageName === pkg);
  const isHidden = (pkg: string) => hidden?.find(h => h.packageName === pkg);
  const isUninstalled = (pkg: string) => uninstalled?.find(u => u.packageName === pkg);
  const getUsed = (pkg: string) => usage?.find(u => u.packageName === pkg)?.minutesUsed ?? 0;

  const restricted = (blocklist ?? []).filter(b => b.blocked || (b.dailyTimeLimitMinutes ?? 0) > 0);
  const favoriteApps = visibleApps.filter(a => isFav(a.packageName));

  function closeCtx() { setCtxApp(null); setShowRename(false); }

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-background">
      <StatusBar style="auto" />

      {/* ─── Swipeable Pages ─── */}
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        onMomentumScrollEnd={(e) => setPage(Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH))}
        className="flex-1"
      >
        {/* ══════ PAGE 0: HOME ══════ */}
        <View style={{ width: SCREEN_WIDTH }} className="flex-1">
          {/* Top bar */}
          <View className="flex-row justify-between items-center px-6 pt-2 pb-2">
            <View>
              <Text className="text-2xl font-light text-foreground tracking-wider">{fmtTime(time)}</Text>
              <Text className="text-sm text-muted-foreground">{fmtDate(time)}</Text>
            </View>
            <Pressable onPress={() => router.push("/settings" as any)} className="p-2 rounded-full active:opacity-50">
              <Settings className="text-muted-foreground" size={22} />
            </Pressable>
          </View>

          {/* Restrictions */}
          {restricted.length > 0 && (
            <View className="mx-5 mb-3 bg-muted rounded-2xl p-3.5">
              <Text className="text-xs font-semibold text-foreground mb-2">Today's Restrictions</Text>
              {restricted.slice(0, 4).map(item => {
                const alias = getAlias(item.packageName);
                const nm = alias || item.appName || item.packageName;
                const used = getUsed(item.packageName);
                const max = item.dailyTimeLimitMinutes ?? 0;
                return (
                  <View key={item.packageName} className="flex-row items-center justify-between py-1">
                    <Text className="text-sm text-foreground flex-1" numberOfLines={1}>{nm}</Text>
                    {item.blocked ? <Text className="text-xs text-destructive font-semibold">BLOCKED</Text>
                    : max > 0 ? <Text className={`text-xs ${used>=max?'text-destructive':'text-muted-foreground'}`}>{used}/{max}m</Text>
                    : null}
                  </View>
                );
              })}
              {restricted.length>4 && <Text className="text-xs text-muted-foreground mt-1">+{restricted.length-4} more</Text>}
            </View>
          )}

          {/* Favorites */}
          {favoriteApps.length > 0 && (
            <View className="mx-5 mb-3">
              <Text className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2">Favorites</Text>
              <View className="flex-row flex-wrap gap-2">
                {favoriteApps.slice(0, 8).map(a => (
                  <Pressable
                    key={a.packageName}
                    onLongPress={() => { setCtxApp(a); setRenameVal(getAlias(a.packageName)||""); }}
                    className="bg-muted rounded-xl px-4 py-2.5 active:opacity-70"
                  >
                    <Text className="text-foreground text-sm">{getAlias(a.packageName) || a.name}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          )}

          {/* Big clock tap to search */}
          <Pressable onPress={() => router.push("/search" as any)} className="flex-1 items-center justify-center active:opacity-70">
            <Text className="text-7xl font-thin text-foreground tracking-wider mb-2">{fmtTime(time)}</Text>
            <Text className="text-sm text-muted-foreground">Tap to search • Swipe left for apps</Text>
          </Pressable>

          {/* Page dots */}
          <View className="flex-row justify-center pb-2 gap-1.5">
            {[0,1].map(i => <View key={i} className={`w-1.5 h-1.5 rounded-full ${page===i?'bg-foreground':'bg-muted-foreground/30'}`} />)}
          </View>
        </View>

        {/* ══════ PAGE 1: APP LIST ══════ */}
        <View style={{ width: SCREEN_WIDTH }} className="flex-1">
          <View className="px-5 pt-2 pb-2">
            <Text className="text-xl font-light text-foreground">All Apps</Text>
            <Text className="text-xs text-muted-foreground mt-0.5">{visibleApps.length} apps • Long press for options</Text>
          </View>

          <ScrollView className="flex-1 px-5" contentContainerClassName="pb-8">
            {visibleApps.map((app) => {
              const alias = getAlias(app.packageName);
              const display = alias || app.name;
              const blocked = isBlocked(app.packageName);
              const favorite = isFav(app.packageName);
              return (
                <Pressable
                  key={app.packageName}
                  onLongPress={() => { setCtxApp(app); setRenameVal(alias||""); }}
                  className="flex-row items-center py-3.5 border-b border-border active:bg-muted/50"
                >
                  {/* Simple text-only row */}
                  <View className="flex-1">
                    <Text className="text-foreground text-base" numberOfLines={1}>{display}</Text>
                    <Text className="text-muted-foreground text-xs mt-0.5">
                      {app.category}
                      {blocked && " • BLOCKED"}
                      {isHidden(app.packageName) && " • Hidden"}
                    </Text>
                  </View>
                  {favorite && <Star className="text-amber-400 ml-2" size={14} />}
                </Pressable>
              );
            })}
          </ScrollView>

          {/* Page dots */}
          <View className="flex-row justify-center pb-2 gap-1.5">
            {[0,1].map(i => <View key={i} className={`w-1.5 h-1.5 rounded-full ${page===i?'bg-foreground':'bg-muted-foreground/30'}`} />)}
          </View>
        </View>
      </ScrollView>

      {/* ═══════ CONTEXT MENU MODAL ═══════ */}
      <Modal visible={!!ctxApp} transparent animationType="fade" onRequestClose={closeCtx}>
        <Pressable className="flex-1 bg-black/40 justify-center px-8" onPress={closeCtx}>
          <Pressable className="bg-background rounded-3xl overflow-hidden" onPress={(e) => e.stopPropagation()}>
            {/* App name header */}
            {ctxApp && (
              <View className="px-6 pt-6 pb-4 border-b border-border">
                <Text className="text-lg font-semibold text-foreground">{getAlias(ctxApp.packageName) || ctxApp.name}</Text>
                <Text className="text-xs text-muted-foreground mt-0.5">{ctxApp.packageName}</Text>
              </View>
            )}

            {/* Menu items */}
            {ctxApp && (
              <View className="py-1">
                <CtxItem icon={Star} label={isFav(ctxApp.packageName) ? "Remove from Favorites" : "Add to Favorites"} color="text-amber-400"
                  onPress={() => { toggleFav({ packageName: ctxApp.packageName }); closeCtx(); }} />

                <CtxItem icon={Ban} label={isBlocked(ctxApp.packageName) ? "Unblock App" : "Block App"} color="text-destructive"
                  onPress={() => { toggleBlock({ appName: ctxApp.name, packageName: ctxApp.packageName, blocked: !isBlocked(ctxApp.packageName) }); closeCtx(); }} />

                <CtxItem icon={Edit3} label="Rename App" color="text-foreground"
                  onPress={() => setShowRename(true)} />

                {showRename ? (
                  <View className="flex-row items-center px-6 py-3 gap-2">
                    <Input
                      value={renameVal}
                      onChangeText={setRenameVal}
                      placeholder="New name..."
                      className="flex-1 bg-muted rounded-xl px-4 py-2.5 text-foreground text-sm"
                      placeholderTextColor="#9BA1A6"
                      autoFocus
                    />
                    <Pressable
                      onPress={() => { if (renameVal.trim() && ctxApp) { renameApp({ packageName: ctxApp.packageName, aliasName: renameVal.trim() }); } closeCtx(); }}
                      className="px-4 py-2.5 rounded-xl bg-primary"
                    >
                      <Text className="text-primary-foreground text-sm font-medium">Save</Text>
                    </Pressable>
                  </View>
                ) : null}

                <CtxItem icon={EyeOff} label={isHidden(ctxApp.packageName) ? "Show App" : "Hide App"} color="text-foreground"
                  onPress={() => { toggleHidden({ packageName: ctxApp.packageName, hidden: !isHidden(ctxApp.packageName) }); closeCtx(); }} />

                <CtxItem icon={Trash2} label={isUninstalled(ctxApp.packageName) ? "Reinstall App" : "Uninstall App"} color="text-destructive"
                  onPress={() => { toggleUninstall({ packageName: ctxApp.packageName }); closeCtx(); }} />

                <CtxItem icon={Info} label="App Info" color="text-foreground"
                  onPress={() => { closeCtx(); }} />
              </View>
            )}

            {/* Close button */}
            <Pressable onPress={closeCtx} className="border-t border-border px-6 py-4 active:bg-muted">
              <Text className="text-center text-foreground font-medium">Cancel</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

// ─── Context Menu Item ───
function CtxItem({ icon: Icon, label, color, onPress }: { icon: any; label: string; color: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} className="flex-row items-center px-6 py-3.5 active:bg-muted">
      <Icon className={`${color} mr-4`} size={20} />
      <Text className={`text-base ${color}`}>{label}</Text>
    </Pressable>
  );
}