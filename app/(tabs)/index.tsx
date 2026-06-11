import { useEffect, useState } from "react";
import { SafeAreaView, Text, View } from "@/components/ui";
import { StatusBar } from "expo-status-bar";
import { Search, Settings } from "lucide-react-native";
import { Pressable } from "react-native";
import { useRouter } from "expo-router";

function useTime() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  return time;
}

function formatTime(date: Date): string {
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes}`;
}

function formatDate(date: Date): string {
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  return `${days[date.getDay()]}, ${months[date.getMonth()]} ${date.getDate()}`;
}

const quickApps = [
  { name: "Phone", icon: "📞", color: "#4CAF50" },
  { name: "Messages", icon: "💬", color: "#2196F3" },
  { name: "Camera", icon: "📷", color: "#FF9800" },
  { name: "Music", icon: "🎵", color: "#E91E63" },
];

export default function HomeScreen() {
  const time = useTime();
  const router = useRouter();

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-background">
      <StatusBar style="auto" />

      {/* Top bar with settings */}
      <View className="flex-row justify-end px-6 pt-2">
        <Pressable
          onPress={() => router.push("/settings" as any)}
          className="p-2 rounded-full active:opacity-50"
        >
          <Settings className="text-muted-foreground" size={22} />
        </Pressable>
      </View>

      {/* Main content - centered clock and date */}
      <View className="flex-1 justify-center items-center px-6">
        {/* Big Clock */}
        <Text className="text-7xl font-light tracking-wider text-foreground mb-2">
          {formatTime(time)}
        </Text>

        {/* Date below clock */}
        <Text className="text-lg text-muted-foreground tracking-wide mb-12">
          {formatDate(time)}
        </Text>

        {/* Search Bar */}
        <Pressable
          onPress={() => router.push("/search" as any)}
          className="flex-row items-center w-full max-w-sm bg-muted rounded-2xl px-5 py-4 mb-8 active:opacity-70"
        >
          <Search className="text-muted-foreground mr-3" size={18} />
          <Text className="text-muted-foreground text-base">
            Search apps or type a URL...
          </Text>
        </Pressable>

        {/* Quick Apps - Minimalist grid */}
        <View className="flex-row flex-wrap justify-center gap-6 w-full max-w-sm">
          {quickApps.map((app) => (
            <Pressable
              key={app.name}
              className="items-center active:opacity-50"
            >
              <View className="w-14 h-14 rounded-2xl items-center justify-center mb-1.5" style={{ backgroundColor: app.color + "20" }}>
                <Text className="text-2xl">{app.icon}</Text>
              </View>
              <Text className="text-xs text-muted-foreground">{app.name}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Bottom hint */}
      <View className="pb-6 items-center">
        <Text className="text-xs text-muted-foreground/50 tracking-widest uppercase">
          Swipe up for apps
        </Text>
      </View>
    </SafeAreaView>
  );
}