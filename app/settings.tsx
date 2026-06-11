import { SafeAreaView, Text, View, ScrollView } from "@/components/ui";
import { ArrowLeft, Moon, Sun, Clock, Palette, Shield, Eye, Type, Bell, Info } from "lucide-react-native";
import { Pressable } from "react-native";
import { useRouter } from "expo-router";

const settingsSections = [
  {
    title: "Display",
    items: [
      { icon: Moon, label: "Dark Mode", description: "Toggle dark/light theme" },
      { icon: Palette, label: "Grayscale Mode", description: "Monochrome display for less distraction" },
      { icon: Clock, label: "Clock Format", description: "12h / 24h" },
    ],
  },
  {
    title: "Focus",
    items: [
      { icon: Shield, label: "Blocklist", description: "Manage blocked apps" },
      { icon: Bell, label: "App Timers", description: "Set time limits per app" },
    ],
  },
  {
    title: "Privacy",
    items: [
      { icon: Eye, label: "Hidden Apps", description: "Apps hidden from launcher" },
      { icon: Type, label: "App Renaming", description: "Custom names for apps" },
    ],
  },
  {
    title: "About",
    items: [
      { icon: Info, label: "About Minimalist", description: "Version 1.0.0 - Premium" },
    ],
  },
];

export default function SettingsScreen() {
  const router = useRouter();

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-background">
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
        {settingsSections.map((section) => (
          <View key={section.title} className="mb-8">
            <Text className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3 ml-1">
              {section.title}
            </Text>
            <View className="bg-muted rounded-2xl overflow-hidden">
              {section.items.map((item, index) => (
                <Pressable
                  key={item.label}
                  className={`flex-row items-center px-4 py-4 active:opacity-70 ${
                    index < section.items.length - 1 ? "border-b border-border" : ""
                  }`}
                >
                  <View className="w-9 h-9 rounded-xl bg-background items-center justify-center mr-3.5">
                    <item.icon className="text-foreground" size={18} />
                  </View>
                  <View className="flex-1">
                    <Text className="text-foreground text-base">{item.label}</Text>
                    <Text className="text-muted-foreground text-xs mt-0.5">{item.description}</Text>
                  </View>
                  <Text className="text-muted-foreground text-lg">›</Text>
                </Pressable>
              ))}
            </View>
          </View>
        ))}

        {/* Premium badge */}
        <View className="bg-primary/10 rounded-2xl px-5 py-4 items-center mt-2">
          <Text className="text-primary font-semibold text-sm">✦ Premium Unlocked</Text>
          <Text className="text-muted-foreground text-xs mt-1">All features are available</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}