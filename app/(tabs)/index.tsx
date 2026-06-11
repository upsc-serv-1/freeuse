import { useEffect, useState } from "react";
import { SafeAreaView, Text, View } from "@/components/ui";
import { StatusBar } from "expo-status-bar";
import { Settings, ChevronRight } from "lucide-react-native";
import { Pressable, FlatList } from "react-native";
import { useRouter } from "expo-router";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

function useTime() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);
  return time;
}

function formatTime(date: Date): string {
  const h = date.getHours().toString().padStart(2, "0");
  const m = date.getMinutes().toString().padStart(2, "0");
  return `${h}:${m}`;
}

function formatDate(date: Date): string {
  const days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  return `${days[date.getDay()]}, ${months[date.getMonth()]} ${date.getDate()}`;
}

function getTodayDate(): string {
  const d = new Date();
  return `${d.getFullYear()}-${(d.getMonth()+1).toString().padStart(2,"0")}-${d.getDate().toString().padStart(2,"0")}`;
}

export default function HomeScreen() {
  const time = useTime();
  const router = useRouter();
  const today = getTodayDate();

  const blocklist = useQuery(api.apps.getBlocklist);
  const allApps = useQuery(api.apps.getAllApps);
  const usage = useQuery(api.apps.getTodaysUsage, { date: today });
  const renames = useQuery(api.apps.getAppRenames);

  // Apps that are blocked OR have a time limit
  const restricted = (blocklist ?? []).filter(b => b.blocked || (b.dailyTimeLimitMinutes ?? 0) > 0);

  function getAlias(pkg: string): string | null {
    if (!renames) return null;
    const r = renames.find(r => r.packageName === pkg);
    return r ? r.aliasName : null;
  }

  function getMinutesUsed(pkg: string): number {
    if (!usage) return 0;
    const u = usage.find(u => u.packageName === pkg);
    return u?.minutesUsed ?? 0;
  }

  function getAppName(pkg: string): string {
    if (!allApps) return pkg;
    const a = allApps.find(a => a.packageName === pkg);
    return a?.name ?? pkg;
  }

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-background">
      <StatusBar style="auto" />

      {/* Top bar */}
      <View className="flex-row justify-between items-center px-6 pt-2 pb-4">
        <View>
          <Text className="text-2xl font-light text-foreground tracking-wider">{formatTime(time)}</Text>
          <Text className="text-sm text-muted-foreground">{formatDate(time)}</Text>
        </View>
        <Pressable onPress={() => router.push("/settings" as any)} className="p-2 rounded-full active:opacity-50">
          <Settings className="text-muted-foreground" size={22} />
        </Pressable>
      </View>

      {/* Restricted apps summary */}
      {restricted.length > 0 && (
        <View className="mx-5 mb-4 bg-muted rounded-2xl p-4">
          <Text className="text-sm font-semibold text-foreground mb-2">Today's Restrictions</Text>
          {restricted.slice(0, 5).map(item => {
            const used = getMinutesUsed(item.packageName);
            const max = item.dailyTimeLimitMinutes ?? 0;
            const alias = getAlias(item.packageName);
            const displayName = alias || getAppName(item.packageName);
            return (
              <View key={item.packageName} className="flex-row items-center justify-between py-1.5">
                <Text className="text-sm text-foreground flex-1">{displayName}</Text>
                {item.blocked ? (
                  <Text className="text-xs text-destructive font-semibold">BLOCKED</Text>
                ) : max > 0 ? (
                  <Text className={`text-xs ${used >= max ? 'text-destructive' : 'text-muted-foreground'}`}>
                    {used}/{max} min
                  </Text>
                ) : null}
              </View>
            );
          })}
          {restricted.length > 5 && (
            <Text className="text-xs text-muted-foreground mt-1">+{restricted.length - 5} more</Text>
          )}
        </View>
      )}

      {/* Main action buttons */}
      <View className="flex-1 justify-center px-6">
        <Pressable
          onPress={() => router.push("/search" as any)}
          className="items-center justify-center py-16 active:opacity-70"
        >
          <Text className="text-6xl font-thin text-foreground tracking-wider mb-4">{formatTime(time)}</Text>
          <Text className="text-base text-muted-foreground">Tap to search apps</Text>
        </Pressable>
      </View>

      {/* Bottom quick actions */}
      <View className="px-6 pb-8 gap-2">
        <Pressable
          onPress={() => router.push("/app-list" as any)}
          className="flex-row items-center bg-muted rounded-2xl p-4 active:opacity-70"
        >
          <View className="flex-1">
            <Text className="text-foreground font-medium">All Apps</Text>
            <Text className="text-muted-foreground text-xs mt-0.5">{allApps?.length ?? 0} apps • Manage blocklist & timers</Text>
          </View>
          <ChevronRight className="text-muted-foreground" size={20} />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}