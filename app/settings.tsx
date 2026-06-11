import { SafeAreaView, Text, View, ScrollView } from "@/components/ui";
import { ArrowLeft, Moon, Sun, Clock, Palette, Shield, Eye, Type, Bell, Info, Monitor, Terminal } from "lucide-react-native";
import { Pressable } from "react-native";
import { useRouter } from "expo-router";
import { useLocalApps } from "@/hooks/useLocalStorage";

const THEME_OPTIONS = [
  { value: "system" as const, icon: Monitor, label: "System", description: "Follow device settings" },
  { value: "light" as const, icon: Sun, label: "Light", description: "Light background, dark text" },
  { value: "dark" as const, icon: Moon, label: "Dark", description: "Dark background, light text" },
  { value: "hacker" as const, icon: Terminal, label: "Hacker", description: "Neon green on black — for focus" },
];

export default function SettingsScreen() {
  const router = useRouter();
  const { themeMode, setThemeMode } = useLocalApps();

  return (
    <SafeAreaView edges={["top"]} className={`flex-1 bg-background ${themeMode === "hacker" ? "hacker" : ""}`}>
      {/* Header */}
      <View className="flex-row items-center px-5 py-3">
        <Pressable
          onPress={() => router.back()}
          className="p-2 -ml-2 rounded-full active:opacity-50"
        >
          <ArrowLeft className="text-foreground" size={24} />
        </Pressable>
        <Text variant="h3" className="text-foreground ml-2">
          Settings
        </Text>
      </View>

      <ScrollView className="flex-1" contentContainerClassName="px-5 pb-12">
        {/* Theme Section */}
        <View className="mb-8">
          <Text className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3 ml-1">
            Theme
          </Text>
          <View className="bg-muted rounded-2xl overflow-hidden">
            {THEME_OPTIONS.map((opt, index) => {
              const active = themeMode === opt.value;
              return (
                <Pressable
                  key={opt.value}
                  onPress={() => setThemeMode(opt.value)}
                  className={`flex-row items-center px-4 py-4 active:opacity-70 ${
                    index < THEME_OPTIONS.length - 1 ? "border-b border-border" : ""
                  }`}
                >
                  <View className={`w-9 h-9 rounded-xl items-center justify-center mr-3.5 ${
                    active ? "bg-primary" : "bg-background"
                  }`}>
                    <opt.icon className={active ? "text-primary-foreground" : "text-foreground"} size={18} />
                  </View>
                  <View className="flex-1">
                    <Text className={`text-base ${active ? "text-primary font-semibold" : "text-foreground"}`}>
                      {opt.label}
                    </Text>
                    <Text className="text-muted-foreground text-xs mt-0.5">{opt.description}</Text>
                  </View>
                  {active && (
                    <View className="w-5 h-5 rounded-full bg-primary items-center justify-center">
                      <Text className="text-primary-foreground text-xs font-bold">✓</Text>
                    </View>
                  )}
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Display Section */}
        <View className="mb-8">
          <Text className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3 ml-1">
            Display
          </Text>
          <View className="bg-muted rounded-2xl overflow-hidden">
            <SettingsItem icon={Palette} label="Grayscale Mode" description="Monochrome display for less distraction" />
            <SettingsItem icon={Clock} label="Clock Format" description="12h / 24h" isLast />
          </View>
        </View>

        {/* Focus Section */}
        <View className="mb-8">
          <Text className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3 ml-1">
            Focus
          </Text>
          <View className="bg-muted rounded-2xl overflow-hidden">
            <SettingsItem icon={Shield} label="Blocklist" description="Manage blocked apps" />
            <SettingsItem icon={Bell} label="App Timers" description="Set time limits per app" isLast />
          </View>
        </View>

        {/* Privacy Section */}
        <View className="mb-8">
          <Text className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3 ml-1">
            Privacy
          </Text>
          <View className="bg-muted rounded-2xl overflow-hidden">
            <SettingsItem icon={Eye} label="Hidden Apps" description="Apps hidden from launcher" />
            <SettingsItem icon={Type} label="App Renaming" description="Custom names for apps" isLast />
          </View>
        </View>

        {/* About Section */}
        <View className="mb-8">
          <Text className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3 ml-1">
            About
          </Text>
          <View className="bg-muted rounded-2xl overflow-hidden">
            <SettingsItem icon={Info} label="About Minimalist" description="Version 1.0.0 — Premium" isLast />
          </View>
        </View>

        {/* Premium badge */}
        <View className="bg-primary/10 rounded-2xl px-5 py-4 items-center mt-2">
          <Text className="text-primary font-semibold text-sm">✦ Premium Unlocked</Text>
          <Text className="text-muted-foreground text-xs mt-1">All features are available</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function SettingsItem({ icon: Icon, label, description, isLast }: {
  icon: any;
  label: string;
  description: string;
  isLast?: boolean;
}) {
  return (
    <Pressable
      className={`flex-row items-center px-4 py-4 active:opacity-70 ${
        !isLast ? "border-b border-border" : ""
      }`}
    >
      <View className="w-9 h-9 rounded-xl bg-background items-center justify-center mr-3.5">
        <Icon className="text-foreground" size={18} />
      </View>
      <View className="flex-1">
        <Text className="text-foreground text-base">{label}</Text>
        <Text className="text-muted-foreground text-xs mt-0.5">{description}</Text>
      </View>
      <Text className="text-muted-foreground text-lg">›</Text>
    </Pressable>
  );
}