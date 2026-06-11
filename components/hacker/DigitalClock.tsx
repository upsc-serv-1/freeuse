import React, { useEffect, useState } from "react";
import { View, Text } from "react-native";

interface DigitalClockProps {
  color: string;
}

export function DigitalClock({ color }: DigitalClockProps) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const hours = time.getHours().toString().padStart(2, "0");
  const minutes = time.getMinutes().toString().padStart(2, "0");
  const seconds = time.getSeconds().toString().padStart(2, "0");

  const days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
  const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
  const dateStr = `${days[time.getDay()]}, ${months[time.getMonth()]} ${time.getDate()}`;

  return (
    <View className="items-end mb-4">
      <Text
        style={{
          color,
          fontFamily: "monospace",
          fontSize: 18,
          letterSpacing: 2,
          textShadowColor: color,
          textShadowRadius: 8,
        }}
      >
        {hours}:{minutes}:{seconds}
      </Text>
      <Text
        style={{
          color: `${color}AA`,
          fontFamily: "monospace",
          fontSize: 10,
          letterSpacing: 1,
          marginTop: 1,
        }}
      >
        {dateStr}
      </Text>
    </View>
  );
}