import React, { useEffect, useRef, useState } from "react";
import { View, Text, ScrollView, Dimensions } from "react-native";

interface HackLogProps {
  color: string;
}

const LOG_TEMPLATES = [
  "Bypassing proxy node {N}... [OK]",
  "Decryption key brute-force in progress... [{P}%]",
  "Packet loss detected on eth{N}. Rerouting...",
  "Auth handshake with {IP} complete [OK]",
  "Injecting payload into kernel module... [DONE]",
  "Firewall rule {N} bypassed. Escalating...",
  "SSH tunnel established → {IP}:{PORT}",
  "Memory dump at 0x{HEX}... [SCANNING]",
  "ASLR bypass successful. Stack smash pending...",
  "ARP spoofing {IP} → MITM active [OK]",
  "TLS 1.2 downgrade attack... [{P}%]",
  "Root shell obtained on node {N} [OK]",
  "Exfiltrating /etc/shadow... [{P}%]",
  "C2 beacon to {IP}:{PORT} [ACTIVE]",
  "Polymorphic shellcode injected... [OK]",
  "DNS poisoning {IP} → rerouted [OK]",
  "Kernel exploit CVE-{YEAR}-{N} loaded...",
  "Privilege escalation: uid=0(root) [OK]",
  "Zero-day in libssl triggered at 0x{HEX}",
  "Lateral movement via SMB to {IP}... [OK]",
  "Cryptographic nonce collision found [{P}%]",
  "Buffer overflow at 0x{HEX} confirmed",
  "Data stream encrypted with AES-256 [OK]",
  "Obfuscation layer {N} deployed... [DONE]",
  "Anti-forensics routine executed [OK]",
];

function fill(tpl: string) {
  const randOctet = () => Math.floor(Math.random() * 256);
  return tpl
    .replace(/{N}/g, () => String(Math.floor(Math.random() * 256)))
    .replace(/{P}/g, () => String(Math.floor(Math.random() * 100)))
    .replace(/{IP}/g, () => `${randOctet()}.${randOctet()}.${randOctet()}.${randOctet()}`)
    .replace(/{PORT}/g, () => String(Math.floor(Math.random() * 65535)))
    .replace(/{HEX}/g, () => Math.floor(Math.random() * 0xFFFFFF).toString(16).toUpperCase().padStart(6, "0"))
    .replace(/{YEAR}/g, () => String(2019 + Math.floor(Math.random() * 7)));
}

function randomString(len: number) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  return Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

function toHexDump(str: string): string[] {
  const lines: string[] = [];
  for (let i = 0; i < str.length; i += 16) {
    const chunk = str.slice(i, i + 16);
    const hex = Array.from(chunk).map(c => c.charCodeAt(0).toString(16).padStart(2, "0")).join(" ");
    const ascii = Array.from(chunk).map(c => (c.charCodeAt(0) >= 32 && c.charCodeAt(0) < 127) ? c : ".").join("");
    const addr = i.toString(16).padStart(8, "0").toUpperCase();
    lines.push(`${addr}  ${hex.padEnd(47)}  |${ascii}|`);
  }
  return lines;
}

export function HackLog({ color }: HackLogProps) {
  const [logLines, setLogLines] = useState<string[]>([]);
  const [hexLines, setHexLines] = useState<string[]>([]);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    const initial = Array.from({ length: 20 }, () => fill(LOG_TEMPLATES[Math.floor(Math.random() * LOG_TEMPLATES.length)]));
    setLogLines(initial);
    setHexLines(toHexDump(randomString(64)));
  }, []);

  useEffect(() => {
    const logInterval = setInterval(() => {
      setLogLines(prev => {
        const next = [...prev, fill(LOG_TEMPLATES[Math.floor(Math.random() * LOG_TEMPLATES.length)])];
        return next.slice(-60);
      });
    }, 600 + Math.random() * 800);

    const hexInterval = setInterval(() => {
      setHexLines(toHexDump(randomString(64)));
    }, 2000);

    return () => { clearInterval(logInterval); clearInterval(hexInterval); };
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 50);
    }
  }, [logLines]);

  const dim = `${color}CC`;
  const faint = `${color}70`;

  return (
    <View className="mb-4">
      {/* Hack Log Panel */}
      <View
        className="rounded-xl overflow-hidden mb-2"
        style={{
          borderColor: `${color}40`,
          borderWidth: 1,
          backgroundColor: `${color}08`,
        }}
      >
        <View
          className="px-3 py-1"
          style={{
            borderBottomWidth: 1,
            borderBottomColor: `${color}30`,
            backgroundColor: `${color}15`,
          }}
        >
          <Text style={{ color, fontFamily: "monospace", fontSize: 10, letterSpacing: 1 }}>
            ▸ INTERCEPT LOG ─────────────────
          </Text>
        </View>
        <ScrollView
          ref={scrollRef}
          style={{ height: 120, paddingHorizontal: 8, paddingVertical: 4 }}
        >
          {logLines.map((line, i) => {
            const isOk = line.includes("[OK]") || line.includes("[DONE]") || line.includes("[ACTIVE]");
            const isErr = line.includes("[ERR") || line.includes("[FAIL");
            const lineColor = isOk ? color : isErr ? "#ff4444" : dim;
            return (
              <Text
                key={i}
                style={{ color: lineColor, fontFamily: "monospace", fontSize: 9, lineHeight: 14 }}
                numberOfLines={1}
              >
                <Text style={{ color: faint }}>{String(i).padStart(4, "0")} </Text>
                {line}
              </Text>
            );
          })}
        </ScrollView>
      </View>

      {/* Hex Dump Panel */}
      <View
        className="rounded-xl overflow-hidden"
        style={{
          borderColor: `${color}40`,
          borderWidth: 1,
          backgroundColor: `${color}08`,
        }}
      >
        <View
          className="px-3 py-1"
          style={{
            borderBottomWidth: 1,
            borderBottomColor: `${color}30`,
            backgroundColor: `${color}15`,
          }}
        >
          <Text style={{ color, fontFamily: "monospace", fontSize: 10, letterSpacing: 1 }}>
            ▸ HEX DUMP ─────────────────────
          </Text>
        </View>
        <ScrollView style={{ height: 80, paddingHorizontal: 8, paddingVertical: 4 }}>
          {hexLines.map((line, i) => (
            <Text key={i} style={{ fontFamily: "monospace", fontSize: 8, lineHeight: 12 }}>
              <Text style={{ color: faint }}>{line.slice(0, 8)}</Text>
              <Text style={{ color }}> {line.slice(10, 57)}</Text>
              <Text style={{ color: faint }}> {line.slice(57)}</Text>
            </Text>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}