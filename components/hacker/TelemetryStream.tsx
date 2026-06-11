import React, { useEffect, useState } from "react";
import { View, Text, ScrollView } from "react-native";

interface TelemetryStreamProps {
  color: string;
}

function randomBetween(min: number, max: number, decimals = 0) {
  const val = Math.random() * (max - min) + min;
  return decimals > 0 ? parseFloat(val.toFixed(decimals)) : Math.floor(val);
}

function bar(pct: number, width = 12) {
  const filled = Math.round((pct / 100) * width);
  return "[" + "█".repeat(filled) + "░".repeat(width - filled) + "]";
}

export function TelemetryStream({ color }: TelemetryStreamProps) {
  const [data, setData] = useState({
    ramUsed: 6.8, ramTotal: 12, cpu: 24, cpuFreq: 2.4,
    batt: 78, battTemp: 31, battVolt: 3.87,
    net: "192.168.1.100", ping: 12, pkts: 1482,
    uptime: "3d 14h 22m", threads: 847, iops: 320,
    gpu: 18, temp: 38,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setData(prev => ({
        ...prev,
        ramUsed: parseFloat((prev.ramUsed + (Math.random() - 0.5) * 0.2).toFixed(1)),
        cpu: Math.max(5, Math.min(95, prev.cpu + Math.floor((Math.random() - 0.5) * 8))),
        cpuFreq: parseFloat((prev.cpuFreq + (Math.random() - 0.5) * 0.3).toFixed(1)),
        batt: Math.max(1, prev.batt - (Math.random() > 0.9 ? 1 : 0)),
        battTemp: parseFloat((prev.battTemp + (Math.random() - 0.5) * 0.5).toFixed(1)),
        ping: Math.max(1, Math.floor(prev.ping + (Math.random() - 0.5) * 4)),
        pkts: prev.pkts + Math.floor(Math.random() * 30),
        threads: Math.max(600, Math.min(1200, prev.threads + Math.floor((Math.random() - 0.5) * 10))),
        iops: Math.max(50, Math.min(800, prev.iops + Math.floor((Math.random() - 0.5) * 40))),
        gpu: Math.max(0, Math.min(100, prev.gpu + Math.floor((Math.random() - 0.5) * 6))),
        temp: parseFloat((prev.temp + (Math.random() - 0.5) * 1).toFixed(1)),
      }));
    }, 1200);
    return () => clearInterval(interval);
  }, []);

  const dim = `${color}CC`;
  const faint = `${color}88`;

  const Line = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <View className="flex-row items-center" style={{ marginBottom: 2 }}>
      <Text style={{ color: faint, fontFamily: "monospace", fontSize: 10, width: 36 }}>{label}</Text>
      <Text style={{ color: dim, fontFamily: "monospace", fontSize: 10 }}>{children}</Text>
    </View>
  );

  const ramPct = Math.round((data.ramUsed / data.ramTotal) * 100);

  return (
    <View
      className="rounded-xl p-3 mb-4"
      style={{
        borderColor: `${color}40`,
        borderWidth: 1,
        backgroundColor: `${color}08`,
      }}
    >
      <Text style={{ color, fontFamily: "monospace", fontSize: 10, letterSpacing: 1, marginBottom: 8 }}>
        ╔══ SYSTEM TELEMETRY ═══════════════╗
      </Text>

      <Line label="MEM">
        <Text style={{ color }}>{bar(ramPct)}</Text>
        <Text style={{ color: dim }}>{` ${data.ramUsed}GB / ${data.ramTotal}GB (${ramPct}%)`}</Text>
      </Line>

      <Line label="CPU">
        <Text style={{ color }}>{bar(data.cpu)}</Text>
        <Text style={{ color: dim }}>{` ${data.cpu}% @ ${data.cpuFreq}GHz · ${data.threads} threads`}</Text>
      </Line>

      <Line label="GPU">
        <Text style={{ color }}>{bar(data.gpu)}</Text>
        <Text style={{ color: dim }}>{` ${data.gpu}% · TEMP ${data.temp}°C`}</Text>
      </Line>

      <Line label="BAT">
        <Text style={{ color }}>{bar(data.batt)}</Text>
        <Text style={{ color: dim }}>{` ${data.batt}% ${data.battVolt}V · ${data.battTemp}°C`}</Text>
      </Line>

      <Line label="NET">
        <Text style={{ color }}>eth0 {data.net}</Text>
        <Text style={{ color: dim }}>{` PING ${data.ping}ms · ${data.pkts.toLocaleString()} pkts`}</Text>
      </Line>

      <Line label="SYS">
        <Text style={{ color }}>{`IOPS:${data.iops}`}</Text>
        <Text style={{ color: dim }}>{` UP:${data.uptime}`}</Text>
      </Line>

      <Text style={{ color: `${color}60`, fontFamily: "monospace", fontSize: 10, marginTop: 4 }}>
        ╚════════════════════════════════════╝
      </Text>
    </View>
  );
}