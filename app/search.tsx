import { useState } from "react";
import { SafeAreaView, Text, View, ScrollView, Input } from "@/components/ui";
import { Search, ArrowLeft, Ban, Clock } from "lucide-react-native";
import { Pressable } from "react-native";
import { useRouter } from "expo-router";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function SearchScreen() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const allApps = useQuery(api.apps.getAllApps);
  const blocklist = useQuery(api.apps.getBlocklist);
  const toggleBlock = useMutation(api.apps.toggleBlockApp);
  const setLimit = useMutation(api.apps.setTimeLimit);

  const isBlocked = (pkg: string) => blocklist?.find(b => b.packageName === pkg)?.blocked ?? false;
  const getLimit = (pkg: string) => blocklist?.find(b => b.packageName === pkg)?.dailyTimeLimitMinutes;

  const filtered = query
    ? (allApps ?? []).filter(a =>
        a.name.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-background">
      {/* Search Header */}
      <View className="flex-row items-center px-5 py-2 mb-2">
        <Pressable onPress={() => router.back()} className="p-2 -ml-2 rounded-full active:opacity-50">
          <ArrowLeft className="text-foreground" size={24} />
        </Pressable>
        <View className="flex-1 flex-row items-center bg-muted rounded-2xl px-4 py-3 ml-2">
          <Search className="text-muted-foreground mr-3" size={18} />
          <Input
            placeholder="Search apps by name..."
            value={query}
            onChangeText={setQuery}
            className="flex-1 bg-transparent border-0 p-0 text-base text-foreground"
            placeholderTextColor="#9BA1A6"
            autoFocus
          />
        </View>
      </View>

      <ScrollView className="flex-1" contentContainerClassName="px-5 pb-12">
        {!query && (
          <View className="items-center py-16">
            <Text className="text-6xl font-thin text-foreground mb-3">
              {new Date().getHours().toString().padStart(2, "0")}:{new Date().getMinutes().toString().padStart(2, "0")}
            </Text>
            <Text className="text-muted-foreground">Type an app name to search</Text>
            <Pressable
              onPress={() => router.push("/app-list" as any)}
              className="mt-6 px-6 py-3 rounded-2xl bg-muted active:opacity-70"
            >
              <Text className="text-foreground">Browse all apps</Text>
            </Pressable>
          </View>
        )}

        {filtered.map((app) => {
          const blocked = isBlocked(app.packageName);
          const limit = getLimit(app.packageName);
          return (
            <View key={app.packageName} className="flex-row items-center border-b border-border py-3.5 px-1">
              {/* Name only - no icons */}
              <View className="flex-1">
                <Text className="text-foreground text-base">{app.name}</Text>
                <Text className="text-muted-foreground text-xs mt-0.5">{app.category}</Text>
              </View>
              <View className="flex-row gap-1.5">
                <Pressable
                  onPress={() => toggleBlock({ appName: app.name, packageName: app.packageName, blocked: !blocked })}
                  className={`px-3 py-1.5 rounded-lg ${blocked ? 'bg-destructive/20' : 'bg-muted'} active:opacity-70`}
                >
                  <Text className={`text-xs font-medium ${blocked ? 'text-destructive' : 'text-muted-foreground'}`}>
                    {blocked ? 'Blocked' : 'Block'}
                  </Text>
                </Pressable>
                {[1, 5, 15].map(m => (
                  <Pressable
                    key={m}
                    onPress={() => setLimit({ packageName: app.packageName, minutes: limit === m ? 0 : m })}
                    className={`px-2.5 py-1.5 rounded-lg ${limit === m ? 'bg-primary' : 'bg-muted'} active:opacity-70`}
                  >
                    <Text className={`text-xs ${limit === m ? 'text-primary-foreground font-medium' : 'text-muted-foreground'}`}>
                      {m}m
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          );
        })}

        {query && filtered.length === 0 && (
          <View className="items-center py-12">
            <Search className="text-muted-foreground mb-3" size={32} />
            <Text className="text-muted-foreground">No apps found</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}