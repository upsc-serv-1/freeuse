import { useState } from "react";
import { SafeAreaView, Text, View, ScrollView, Input } from "@/components/ui";
import { Search, ArrowLeft, Globe, Clock, Star } from "lucide-react-native";
import { Pressable } from "react-native";
import { useRouter } from "expo-router";

const allApps = [
  { name: "Phone", icon: "📞", category: "Communication" },
  { name: "Messages", icon: "💬", category: "Communication" },
  { name: "Camera", icon: "📷", category: "Tools" },
  { name: "Music", icon: "🎵", category: "Media" },
  { name: "Browser", icon: "🌐", category: "Tools" },
  { name: "Calendar", icon: "📅", category: "Productivity" },
  { name: "Notes", icon: "📝", category: "Productivity" },
  { name: "Files", icon: "📁", category: "Tools" },
  { name: "Settings", icon: "⚙️", category: "System" },
  { name: "Clock", icon: "⏰", category: "Tools" },
  { name: "Calculator", icon: "🔢", category: "Tools" },
  { name: "Gallery", icon: "🖼️", category: "Media" },
  { name: "Maps", icon: "🗺️", category: "Navigation" },
  { name: "Weather", icon: "🌤️", category: "Tools" },
  { name: "Mail", icon: "✉️", category: "Communication" },
  { name: "Contacts", icon: "👤", category: "Communication" },
];

export default function SearchScreen() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const filtered = query
    ? allApps.filter((a) => a.name.toLowerCase().includes(query.toLowerCase()))
    : allApps;

  // Group by category
  const grouped = filtered.reduce<Record<string, typeof allApps>>((acc, app) => {
    if (!acc[app.category]) acc[app.category] = [];
    acc[app.category].push(app);
    return acc;
  }, {});

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-background">
      {/* Search Header */}
      <View className="flex-row items-center px-5 py-2 mb-2">
        <Pressable
          onPress={() => router.back()}
          className="p-2 -ml-2 rounded-full active:opacity-50"
        >
          <ArrowLeft className="text-foreground" size={24} />
        </Pressable>
        <View className="flex-1 flex-row items-center bg-muted rounded-2xl px-4 py-3 ml-2">
          <Search className="text-muted-foreground mr-3" size={18} />
          <Input
            placeholder="Search apps, contacts, or web..."
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
          <>
            {/* Web search suggestion */}
            <Pressable className="flex-row items-center bg-muted rounded-2xl px-4 py-3.5 mb-3 active:opacity-70">
              <Globe className="text-muted-foreground mr-3" size={18} />
              <Text className="text-foreground flex-1">Search the web...</Text>
              <Text className="text-muted-foreground text-xs">Google</Text>
            </Pressable>

            {/* Favorites */}
            <Text className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3 mt-4 ml-1">
              Favorites
            </Text>
            <View className="flex-row flex-wrap gap-3 mb-6">
              {["Phone", "Messages", "Browser", "Camera", "Music", "Calendar"].map((name) => {
                const app = allApps.find((a) => a.name === name)!;
                return (
                  <Pressable
                    key={name}
                    className="flex-row items-center bg-muted rounded-xl px-4 py-2.5 active:opacity-70"
                  >
                    <Text className="text-lg mr-2">{app.icon}</Text>
                    <Text className="text-foreground text-sm">{name}</Text>
                  </Pressable>
                );
              })}
            </View>
          </>
        )}

        {/* Results */}
        {Object.entries(grouped).map(([category, apps]) => (
          <View key={category} className="mb-5">
            <Text className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3 ml-1">
              {category}
            </Text>
            {apps.map((app) => (
              <Pressable
                key={app.name}
                className="flex-row items-center px-3 py-3.5 rounded-2xl active:bg-muted"
              >
                <View className="w-11 h-11 rounded-xl bg-muted items-center justify-center mr-3.5">
                  <Text className="text-xl">{app.icon}</Text>
                </View>
                <Text className="text-foreground text-base">{app.name}</Text>
              </Pressable>
            ))}
          </View>
        ))}

        {query && filtered.length === 0 && (
          <View className="items-center py-12">
            <Search className="text-muted-foreground mb-3" size={32} />
            <Text className="text-muted-foreground">No results for "{query}"</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}