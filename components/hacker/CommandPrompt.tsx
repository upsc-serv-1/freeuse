import React, { useState, useRef, useEffect } from "react";
import { View, Text, TextInput, ScrollView, TouchableOpacity } from "react-native";

interface CommandPromptProps {
  color: string;
}

const APP_MAP: Record<string, string> = {
  messages: "com.android.mms",
  camera: "com.android.camera2",
  mail: "com.google.android.gm",
  music: "com.google.android.music",
  maps: "com.google.android.apps.maps",
  phone: "com.android.dialer",
  browser: "com.android.chrome",
  youtube: "com.google.android.youtube",
  calendar: "com.google.android.calendar",
  files: "com.android.documentsui",
  gallery: "com.google.android.apps.photos",
  settings: "com.android.settings",
};

const BUILTINS: Record<string, (args: string[]) => string[]> = {
  help: () => [
    "Available commands:",
    "  ls [path]         — list directory",
    "  cat [file]        — print file contents",
    "  ps                — process list",
    "  netstat           — network connections",
    "  whoami            — current user",
    "  uname -a          — kernel info",
    "  open [app]        — launch app (messages, camera, mail, ...)",
    "  clear             — clear terminal",
    "  help              — show this help",
  ],
  whoami: () => ["root"],
  "uname": (args) => args.includes("-a")
    ? ["Linux cybernet 5.15.78-android13 #1 SMP PREEMPT Mon Jan 1 00:00:00 UTC 2024 aarch64 GNU/Linux"]
    : ["Linux"],
  ls: (args) => {
    const path = args[0] || "/";
    const dirs: Record<string, string[]> = {
      "/": ["bin/", "data/", "dev/", "etc/", "proc/", "sys/", "system/", "tmp/"],
      "/etc": ["hosts", "passwd", "shadow", "fstab", "resolv.conf"],
      "/bin": ["sh", "ls", "cat", "ps", "netstat", "chmod", "chown"],
      "/proc": ["cpuinfo", "meminfo", "uptime", "version", "net/"],
      "/data": ["app/", "local/", "media/", "misc/"],
    };
    return dirs[path] || [`ls: cannot access '${path}': No such file or directory`];
  },
  cat: (args) => {
    const file = args[0];
    const contents: Record<string, string[]> = {
      "/etc/passwd": ["root:x:0:0:root:/root:/bin/sh", "system:x:1000:1000::/system:/sbin/nologin", "shell:x:2000:2000::/data/local/tmp:/bin/sh"],
      "/etc/hosts": ["127.0.0.1   localhost", "::1         localhost ip6-localhost"],
      "/proc/uptime": ["304622.45 289012.34"],
      "/proc/version": ["Linux version 5.15.78-android13 (gcc version 12.1.0)"],
    };
    if (!file) return ["Usage: cat <file>"];
    return contents[file] || [`cat: ${file}: No such file or directory`];
  },
  ps: () => [
    "  PID TTY     TIME CMD",
    "    1 ?    00:00:02 init",
    "  247 ?    00:12:44 zygote64",
    "  481 ?    00:04:22 system_server",
    "  892 ?    00:00:11 com.android.launcher",
    " 1204 pts/0 00:00:00 sh",
    " 1337 pts/0 00:00:00 ps",
  ],
  netstat: () => [
    "Proto  Local Address         Foreign Address        State",
    "tcp    0.0.0.0:22            0.0.0.0:*              LISTEN",
    "tcp    192.168.1.100:443     34.120.53.188:*        ESTABLISHED",
    "tcp    192.168.1.100:8080    10.0.0.1:55832         ESTABLISHED",
    "udp    0.0.0.0:53            0.0.0.0:*              -",
  ],
  open: (args) => {
    const app = args[0]?.toLowerCase();
    if (!app) return ["Usage: open <appname>"];
    const pkg = APP_MAP[app];
    if (!pkg) return [`open: unknown app '${app}'. Try: ${Object.keys(APP_MAP).join(", ")}`];
    return [`Launching ${app} (${pkg})...`, "am start -n ...", "[OK] Activity started"];
  },
};

export function CommandPrompt({ color }: CommandPromptProps) {
  const [history, setHistory] = useState<{ type: "input" | "output"; text: string }[]>([
    { type: "output", text: "╔════════════════════════════════════════════╗" },
    { type: "output", text: "║  ANDROID CYBERNET TERMINAL v2.6.1          ║" },
    { type: "output", text: '║  Type "help" for available commands         ║' },
    { type: "output", text: "╚════════════════════════════════════════════╝" },
  ]);
  const [input, setInput] = useState("");
  const [cmdHistory, setCmdHistory] = useState<string[]>([]);
  const [histIdx, setHistIdx] = useState(-1);
  const scrollRef = useRef<ScrollView>(null);
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (scrollRef.current) {
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 50);
    }
  }, [history]);

  const runCommand = (raw: string) => {
    const trimmed = raw.trim();
    if (!trimmed) return;

    const inputLine = { type: "input" as const, text: trimmed };
    setCmdHistory(prev => [trimmed, ...prev]);
    setHistIdx(-1);

    if (trimmed === "clear") {
      setHistory([]);
      return;
    }

    const [cmd, ...args] = trimmed.split(/\s+/);
    const handler = BUILTINS[cmd];
    const outputs = handler
      ? handler(args).map(t => ({ type: "output" as const, text: t }))
      : [{ type: "output" as const, text: `bash: ${cmd}: command not found` }];

    setHistory(prev => [...prev, inputLine, ...outputs]);
  };

  const dim = `${color}CC`;
  const faint = `${color}80`;

  return (
    <TouchableOpacity
      activeOpacity={1}
      onPress={() => inputRef.current?.focus()}
      className="rounded-xl overflow-hidden mb-4"
      style={{
        borderColor: `${color}40`,
        borderWidth: 1,
        backgroundColor: `${color}08`,
      }}
    >
      {/* Header */}
      <View
        className="flex-row items-center px-3 py-1"
        style={{
          borderBottomWidth: 1,
          borderBottomColor: `${color}30`,
          backgroundColor: `${color}15`,
        }}
      >
        <View
          style={{
            width: 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: color,
            marginRight: 6,
          }}
        />
        <Text style={{ color, fontFamily: "monospace", fontSize: 10, letterSpacing: 1 }}>
          ▸ TERMINAL ── [root@cybernet ~]
        </Text>
      </View>

      {/* History */}
      <ScrollView ref={scrollRef} style={{ height: 100, paddingHorizontal: 8, paddingVertical: 4 }}>
        {history.map((line, i) => (
          <Text key={i} style={{ fontFamily: "monospace", fontSize: 10, lineHeight: 16 }}>
            {line.type === "input" ? (
              <Text>
                <Text style={{ color }}>[root@cybernet ~]$ </Text>
                <Text style={{ color: dim }}>{line.text}</Text>
              </Text>
            ) : (
              <Text style={{ color: faint }}>{line.text}</Text>
            )}
          </Text>
        ))}
      </ScrollView>

      {/* Input */}
      <View
        className="flex-row items-center px-3 py-2"
        style={{ borderTopWidth: 1, borderTopColor: `${color}30` }}
      >
        <Text style={{ color, fontFamily: "monospace", fontSize: 10 }}>[root@cybernet ~]$ </Text>
        <TextInput
          ref={inputRef}
          value={input}
          onChangeText={setInput}
          onSubmitEditing={() => { runCommand(input); setInput(""); }}
          style={{
            flex: 1,
            color: dim,
            fontFamily: "monospace",
            fontSize: 10,
            padding: 0,
            margin: 0,
          }}
          autoComplete="off"
          autoCapitalize="none"
          autoCorrect={false}
          spellCheck={false}
        />
        <Text style={{ color, fontSize: 14, lineHeight: 14 }}>█</Text>
      </View>
    </TouchableOpacity>
  );
}