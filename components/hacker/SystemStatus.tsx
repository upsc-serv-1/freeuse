import React, { useEffect, useState } from "react";
import { View, Text } from "react-native";
import { Cpu, HardDrive, Wifi } from "lucide-react-native";

interface SystemStatusProps {
  color: string;
}

const ICON_SIZE = 18;

export function SystemStatus({ color }: SystemStatusProps) {
  const [cpu, setCpu] = useState(42);
  const [storage, setStorage] = useState(78);

  useEffect(() => {
    const interval = setInterval(() => {
      setCpu(Math.floor(Math.random() * 40 + 20));
      setStorage(75 + Math.floor(Math.random() * 10));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const stats = [
    { icon: Cpu, label: "CPU", value: `${cpu}%` },
    { icon: HardDrive, label: "STORAGE", value: `${storage}%` },
    { icon: Wifi, label: "NETWORK", value: "ONLINE" },
  ];

  return (
    <View className="flex-row gap-2 mb-4">
      {stats.map((stat) => (
        <View
          key={stat.label}
          className="flex-1 p-3 rounded-xl items-center"
          style={{
            borderColor: `${color}40`,
            borderWidth: 1,
            backgroundColor: `${color}08`,
          }}
        >
          <stat.icon size={ICON_SIZE} color={color} style={{ marginBottom: 6 }} />
          <Text style={{ color: `${color}AA`, fontFamily: "monospace", fontSize: 10, marginBottom: 2 }}>
            {stat.label}
          </Text>
          <Text style={{ color, fontFamily: "monospace", fontSize: 14, fontWeight: "700" }}>
            {stat.value}
          </Text>
        </View>
      ))}
    </View>
  );
}