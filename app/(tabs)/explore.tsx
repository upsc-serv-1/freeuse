import { useState } from "react";
import { SafeAreaView, Text, View, ScrollView, Input } from "@/components/ui";
import { Search, Clock, Shield, Palette, Eye, EyeOff, Bell, Type, Grid3X3 } from "lucide-react-native";
import { Pressable } from "react-native";
import { useRouter } from "expo-router";

const appList = [
  { name: "Phone", icon: "📞", installed: true },
  { name: "Messages", icon: "💬", installed: true },
  { name: "Camera", icon: "📷", installed: true },
  { name: "Music", icon: "🎵", installed: true },
  { name: "Browser", icon: "🌐", installed: true },
  { name: "Calendar", icon: "📅", installed: true },
  { name: "Notes", icon: "📝", installed: true },
  { name: "Files", icon: "📁", installed: true },
  { name: "Settings", icon: "⚙️", installed: true },
  { name: "Clock", icon: "⏰", installed: true },
  { name: "Calculator", icon: "🔢", installed: true },
  { name: "Gallery", icon: "🖼️", installed: true },
];

export default function ExploreScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredApps = appList.filter((app) =>
    app.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-background">
      <ScrollView className="flex-1" contentContainerClassName="px-5 pb-8">
        {/* Header */}
        <Text variant="h2" className="text-foreground mb-1">
          All Apps
        </Text>
        <Text variant="muted" className="mb-5">
          {appList.length} apps installed
        </Text>

        {/* Search */}
        <View className="flex-row items-center bg-muted rounded-2xl px-4 py-3.5 mb-6">
          <Search className="text-muted-foreground mr-3" size={18} />
          <Input
            placeholder="Search apps..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            className="flex-1 bg-transparent border-0 p-0 text-base text-foreground"
            placeholderTextColor="#9BA1A6"
          />
        </View>

        {/* App Grid */}
        <View className="flex-row flex-wrap">
          {filteredApps.map((app) => (
            <Pressable
              key={app.name}
              className="w-1/4 items-center mb-6 active:opacity-50"
            >
              <View className="w-16 h-16 rounded-2xl items-center justify-center mb-2 bg-muted">
                <Text className="text-3xl">{app.icon}</Text>
              </View>
              <Text className="text-xs text-foreground text-center" numberOfLines={1}>
                {app.name}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Tools Section */}
        <Text variant="h3" className="text-foreground mt-6 mb-4">
          Focus Tools
        </Text>
        <View className="gap-3">
          <ToolCard
            icon={Clock}
            title="App Timers"
            description="Set time limits for distracting apps"
            onPress={() => {}}
          />
          <ToolCard
            icon={Shield}
            title="Blocklist"
            description="Block apps during focus sessions"
            onPress={() => {}}
          />
          <ToolCard
            icon={Palette}
            title="Grayscale Mode"
            description="Toggle monochrome display"
            onPress={() => {}}
          />
          <ToolCard
            icon={Eye}
            title="Hidden Apps"
            description="Hide apps from your home screen"
            onPress={() => {}}
          />
          <ToolCard
            icon={Type}
            title="App Renaming"
            description="Rename apps to reduce temptation"
            onPress={() => {}}
          />
          <ToolCard
            icon={Bell}
            title="Notification Filter"
            description="Filter notifications from distracting apps"
            onPress={() => {}}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function ToolCard({
  icon: Icon,
  title,
  description,
  onPress,
}: {
  icon: any;
  title: string;
  description: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center bg-muted rounded-2xl p-4 active:opacity-70"
    >
      <View className="w-10 h-10 rounded-xl bg-background items-center justify-center mr-4">
        <Icon className="text-foreground" size={20} />
      </View>
      <View className="flex-1">
        <Text className="text-foreground font-medium text-sm">{title}</Text>
        <Text className="text-muted-foreground text-xs mt-0.5">{description}</Text>
      </View>
    </Pressable>
  );
}