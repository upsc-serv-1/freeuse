import { useState } from "react";
import { SafeAreaView, Text, View, ScrollView, Input } from "@/components/ui";
import { ArrowLeft, Search, Ban, Edit3, X } from "lucide-react-native";
import { Pressable, Modal } from "react-native";
import { useRouter } from "expo-router";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

const TIME_OPTIONS = [1, 5, 15, 30, 60];

export default function AppListScreen() {
  const router = useRouter();
  const [search, setSearch] = useState("");

  const allApps = useQuery(api.apps.getAllApps);
  const blocklist = useQuery(api.apps.getBlocklist);
  const renames = useQuery(api.apps.getAppRenames);
  const toggleBlock = useMutation(api.apps.toggleBlockApp);
  const setLimit = useMutation(api.apps.setTimeLimit);
  const renameApp = useMutation(api.apps.renameApp);

  // Modal state
  const [selectedApp, setSelectedApp] = useState<{ name: string; packageName: string } | null>(null);
  const [showRename, setShowRename] = useState(false);
  const [renameValue, setRenameValue] = useState("");

  const filtered = (allApps ?? []).filter(a =>
    a.name.toLowerCase().includes(search.toLowerCase())
  );

  const isBlocked = (pkg: string) => blocklist?.find(b => b.packageName === pkg)?.blocked ?? false;
  const getLimit = (pkg: string) => blocklist?.find(b => b.packageName === pkg)?.dailyTimeLimitMinutes;
  const getAlias = (pkg: string) => renames?.find(r => r.packageName === pkg)?.aliasName;

  function closeModal() {
    setSelectedApp(null);
    setShowRename(false);
  }

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-background">
      {/* Header */}
      <View className="flex-row items-center px-5 py-3">
        <Pressable onPress={() => router.back()} className="p-2 -ml-2 rounded-full active:opacity-50">
          <ArrowLeft className="text-foreground" size={24} />
        </Pressable>
        <Text variant="h3" className="text-foreground ml-2 flex-1">All Apps</Text>
        <Text className="text-muted-foreground text-xs">{allApps?.length ?? 0} apps</Text>
      </View>

      {/* Search */}
      <View className="flex-row items-center bg-muted rounded-2xl mx-5 px-4 py-3 mb-4">
        <Search className="text-muted-foreground mr-3" size={18} />
        <Input
          placeholder="Search app names..."
          value={search}
          onChangeText={setSearch}
          className="flex-1 bg-transparent border-0 p-0 text-base text-foreground"
          placeholderTextColor="#9BA1A6"
        />
      </View>

      {/* App list - names only, no icons */}
      <ScrollView className="flex-1" contentContainerClassName="px-5 pb-8">
        {filtered.length === 0 && (
          <View className="items-center py-12">
            <Text className="text-muted-foreground">No apps found</Text>
          </View>
        )}
        {filtered.map((app) => {
          const blocked = isBlocked(app.packageName);
          const limit = getLimit(app.packageName);
          const alias = getAlias(app.packageName);
          const displayName = alias || app.name;

          return (
            <View key={app.packageName} className="flex-row items-center py-3.5 border-b border-border">
              {/* App name only - text, no icons */}
              <Pressable
                className="flex-1 active:opacity-50"
                onPress={() => {
                  setSelectedApp(app);
                  setShowRename(false);
                  setRenameValue(alias || "");
                }}
              >
                <Text className="text-foreground text-base" numberOfLines={1}>{displayName}</Text>
                <Text className="text-muted-foreground text-xs mt-0.5">
                  {app.category}
                  {blocked && " • BLOCKED"}
                  {limit ? ` • ${limit} min/day` : ""}
                </Text>
              </Pressable>

              {/* Block button */}
              <Pressable
                onPress={() => toggleBlock({ appName: app.name, packageName: app.packageName, blocked: !blocked })}
                className={`px-3 py-1.5 rounded-lg ${blocked ? 'bg-destructive/20' : 'bg-muted'} active:opacity-70 ml-2`}
              >
                <Text className={`text-xs font-medium ${blocked ? 'text-destructive' : 'text-muted-foreground'}`}>
                  {blocked ? 'Unblock' : 'Block'}
                </Text>
              </Pressable>

              {/* Time limit chips */}
              {[1, 5, 15].map(m => (
                <Pressable
                  key={m}
                  onPress={() => setLimit({ packageName: app.packageName, minutes: limit === m ? 0 : m })}
                  className={`px-2 py-1.5 rounded-lg ml-1.5 ${limit === m ? 'bg-primary' : 'bg-muted'} active:opacity-70`}
                >
                  <Text className={`text-xs ${limit === m ? 'text-primary-foreground font-medium' : 'text-muted-foreground'}`}>{m}m</Text>
                </Pressable>
              ))}
            </View>
          );
        })}
      </ScrollView>

      {/* Action Modal */}
      <Modal visible={!!selectedApp} transparent animationType="slide" onRequestClose={closeModal}>
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-background rounded-t-3xl p-6 pb-10">
            {/* Header */}
            <View className="flex-row items-center justify-between mb-6">
              <View>
                <Text className="text-xl font-semibold text-foreground">
                  {getAlias(selectedApp?.packageName || "") || selectedApp?.name}
                </Text>
                <Text className="text-sm text-muted-foreground mt-0.5">{selectedApp?.packageName}</Text>
              </View>
              <Pressable onPress={closeModal} className="p-2 rounded-full bg-muted">
                <X className="text-foreground" size={20} />
              </Pressable>
            </View>

            {/* Block toggle */}
            {selectedApp && (
              <Pressable
                onPress={() => {
                  toggleBlock({ appName: selectedApp.name, packageName: selectedApp.packageName, blocked: !isBlocked(selectedApp.packageName) });
                  closeModal();
                }}
                className="flex-row items-center bg-muted rounded-2xl p-4 mb-4 active:opacity-70"
              >
                <Ban className={`mr-4 ${isBlocked(selectedApp.packageName) ? 'text-destructive' : 'text-foreground'}`} size={20} />
                <Text className="text-foreground text-base">
                  {isBlocked(selectedApp.packageName) ? "Unblock App" : "Block App"}
                </Text>
              </Pressable>
            )}

            {/* Time limits */}
            <Text className="text-sm font-medium text-foreground mb-3 ml-1">Daily Time Limit</Text>
            <View className="flex-row flex-wrap gap-2 mb-5">
              {TIME_OPTIONS.map(m => (
                <Pressable
                  key={m}
                  onPress={() => {
                    if (selectedApp) {
                      setLimit({ packageName: selectedApp.packageName, minutes: getLimit(selectedApp.packageName) === m ? 0 : m });
                      closeModal();
                    }
                  }}
                  className={`px-5 py-3 rounded-xl ${selectedApp && getLimit(selectedApp.packageName) === m ? 'bg-primary' : 'bg-muted'} active:opacity-70`}
                >
                  <Text className={`text-sm ${selectedApp && getLimit(selectedApp.packageName) === m ? 'text-primary-foreground font-medium' : 'text-foreground'}`}>
                    {m} min
                  </Text>
                </Pressable>
              ))}
              {selectedApp && getLimit(selectedApp.packageName) && (
                <Pressable
                  onPress={() => {
                    setLimit({ packageName: selectedApp.packageName, minutes: 0 });
                    closeModal();
                  }}
                  className="px-5 py-3 rounded-xl bg-destructive/20 active:opacity-70"
                >
                  <Text className="text-sm text-destructive">Remove</Text>
                </Pressable>
              )}
            </View>

            {/* Rename */}
            {showRename ? (
              <View className="flex-row items-center gap-2">
                <Input
                  value={renameValue}
                  onChangeText={setRenameValue}
                  placeholder="New name..."
                  className="flex-1 bg-muted rounded-xl px-4 py-3 text-foreground"
                />
                <Pressable
                  onPress={() => {
                    if (renameValue.trim() && selectedApp) {
                      renameApp({ packageName: selectedApp.packageName, aliasName: renameValue.trim() });
                    }
                    closeModal();
                  }}
                  className="px-5 py-3 rounded-xl bg-primary"
                >
                  <Text className="text-primary-foreground text-sm font-medium">Save</Text>
                </Pressable>
              </View>
            ) : (
              <Pressable
                onPress={() => setShowRename(true)}
                className="flex-row items-center bg-muted rounded-2xl p-4 active:opacity-70"
              >
                <Edit3 className="text-foreground mr-4" size={20} />
                <View className="flex-1">
                  <Text className="text-foreground text-base">Rename App</Text>
                  <Text className="text-muted-foreground text-xs mt-0.5">
                    {selectedApp && getAlias(selectedApp.packageName) ? `Current: ${getAlias(selectedApp.packageName)}` : "Set a custom name"}
                  </Text>
                </View>
              </Pressable>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}