import { SafeAreaView, Text, View, ScrollView } from "@/components/ui";
import { useRouter } from "expo-router";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Ban, Clock, EyeOff, Ban as BlockIcon } from "lucide-react-native";
import { Pressable } from "react-native";

function getTodayDate(): string {
  const d = new Date();
  return `${d.getFullYear()}-${(d.getMonth()+1).toString().padStart(2,"0")}-${d.getDate().toString().padStart(2,"0")}`;
}

export default function FocusScreen() {
  const router = useRouter();
  const today = getTodayDate();

  const blocklist = useQuery(api.apps.getBlocklist);
  const usage = useQuery(api.apps.getTodaysUsage, { date: today });
  const allApps = useQuery(api.apps.getAllApps);
  const renames = useQuery(api.apps.getAppRenames);
  const removeFromBlocklist = useMutation(api.apps.removeFromBlocklist);

  const blocked = (blocklist ?? []).filter(b => b.blocked);
  const limited = (blocklist ?? []).filter(b => (b.dailyTimeLimitMinutes ?? 0) > 0);

  const getAlias = (pkg: string) => renames?.find(r => r.packageName === pkg)?.aliasName;
  const getAppName = (pkg: string) => {
    const a = allApps?.find(a => a.packageName === pkg);
    return getAlias(pkg) || a?.name || pkg;
  };
  const getUsed = (pkg: string) => usage?.find(u => u.packageName === pkg)?.minutesUsed ?? 0;

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-background">
      <ScrollView className="flex-1 px-5" contentContainerClassName="pb-12">
        <Text variant="h2" className="text-foreground mb-1 mt-2">Focus Mode</Text>
        <Text className="text-muted-foreground text-sm mb-6">Manage your distractions</Text>

        {/* Blocked apps */}
        <Text className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">
          Blocked Apps ({blocked.length})
        </Text>
        {blocked.length === 0 ? (
          <View className="bg-muted rounded-2xl p-5 items-center mb-6">
            <Ban className="text-muted-foreground mb-2" size={24} />
            <Text className="text-muted-foreground text-sm text-center">No apps blocked yet</Text>
            <Pressable
              onPress={() => router.push("/app-list" as any)}
              className="mt-3 px-4 py-2 rounded-xl bg-primary"
            >
              <Text className="text-primary-foreground text-sm">Block an app</Text>
            </Pressable>
          </View>
        ) : (
          <View className="bg-muted rounded-2xl overflow-hidden mb-6">
            {blocked.map((item, idx) => (
              <View key={item.packageName} className={`flex-row items-center px-4 py-3.5 ${idx < blocked.length - 1 ? 'border-b border-border' : ''}`}>
                <BlockIcon className="text-destructive mr-3" size={16} />
                <Text className="text-foreground flex-1 text-base">{getAppName(item.packageName)}</Text>
                <Pressable
                  onPress={() => removeFromBlocklist({ id: item._id })}
                  className="px-3 py-1 rounded-lg bg-destructive/20 active:opacity-70"
                >
                  <Text className="text-destructive text-xs font-medium">Unblock</Text>
                </Pressable>
              </View>
            ))}
          </View>
        )}

        {/* Timed apps */}
        <Text className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">
          Time Limits ({limited.length})
        </Text>
        {limited.length === 0 ? (
          <View className="bg-muted rounded-2xl p-5 items-center mb-6">
            <Clock className="text-muted-foreground mb-2" size={24} />
            <Text className="text-muted-foreground text-sm text-center">No time limits set</Text>
            <Pressable
              onPress={() => router.push("/app-list" as any)}
              className="mt-3 px-4 py-2 rounded-xl bg-primary"
            >
              <Text className="text-primary-foreground text-sm">Set a limit</Text>
            </Pressable>
          </View>
        ) : (
          <View className="bg-muted rounded-2xl overflow-hidden mb-6">
            {limited.map((item, idx) => {
              const used = getUsed(item.packageName);
              const max = item.dailyTimeLimitMinutes ?? 0;
              const remaining = Math.max(0, max - used);
              const exhausted = used >= max;
              return (
                <View key={item.packageName} className={`flex-row items-center px-4 py-3.5 ${idx < limited.length - 1 ? 'border-b border-border' : ''}`}>
                  <View className="flex-1">
                    <Text className="text-foreground text-base">{getAppName(item.packageName)}</Text>
                    <View className="flex-row items-center mt-0.5">
                      <View className="h-1.5 flex-1 rounded-full bg-background max-w-[120px] mr-2">
                        <View
                          className={`h-1.5 rounded-full ${exhausted ? 'bg-destructive' : 'bg-primary'}`}
                          style={{ width: `${Math.min(100, (used / max) * 100)}%` }}
                        />
                      </View>
                      <Text className={`text-xs ${exhausted ? 'text-destructive font-semibold' : 'text-muted-foreground'}`}>
                        {exhausted ? "TIME'S UP" : `${remaining}m left`}
                      </Text>
                    </View>
                  </View>
                  <Pressable
                    onPress={() => removeFromBlocklist({ id: item._id })}
                    className="px-3 py-1 rounded-lg bg-destructive/20 active:opacity-70 ml-2"
                  >
                    <Text className="text-destructive text-xs font-medium">Remove</Text>
                  </Pressable>
                </View>
              );
            })}
          </View>
        )}

        {/* Browse all apps */}
        <Pressable
          onPress={() => router.push("/app-list" as any)}
          className="bg-muted rounded-2xl p-5 items-center active:opacity-70"
        >
          <Text className="text-foreground font-semibold text-base">Browse All Apps</Text>
          <Text className="text-muted-foreground text-xs mt-1">{allApps?.length ?? 0} apps available</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}