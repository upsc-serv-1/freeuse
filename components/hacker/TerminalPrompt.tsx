import React, { useEffect, useState } from "react";
import { View, Text } from "react-native";

interface TerminalPromptProps {
  color: string;
}

const MESSAGES = [
  "SYSTEM ACCESS GRANTED",
  "INITIALIZING CYBER INTERFACE",
  "LOADING NEURAL NETWORK",
  "CONNECTION ESTABLISHED",
  "FIREWALL BYPASSED",
];

export function TerminalPrompt({ color }: TerminalPromptProps) {
  const [messageIndex, setMessageIndex] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [charIndex, setCharIndex] = useState(0);
  const [cursorVisible, setCursorVisible] = useState(true);

  useEffect(() => {
    const cursorInt = setInterval(() => setCursorVisible(v => !v), 500);
    return () => clearInterval(cursorInt);
  }, []);

  useEffect(() => {
    if (charIndex < MESSAGES[messageIndex].length) {
      const timeout = setTimeout(() => {
        setDisplayText(MESSAGES[messageIndex].slice(0, charIndex + 1));
        setCharIndex(charIndex + 1);
      }, 50);
      return () => clearTimeout(timeout);
    } else {
      const timeout = setTimeout(() => {
        setCharIndex(0);
        setDisplayText("");
        setMessageIndex((messageIndex + 1) % MESSAGES.length);
      }, 3000);
      return () => clearTimeout(timeout);
    }
  }, [charIndex, messageIndex]);

  return (
    <View
      className="p-3 rounded-xl mb-4"
      style={{
        borderColor: `${color}40`,
        borderWidth: 1,
        backgroundColor: `${color}08`,
      }}
    >
      <Text style={{ color, fontFamily: "monospace", fontSize: 12 }}>
        <Text style={{ opacity: 0.6 }}>{"> "}</Text>
        {displayText}
        {cursorVisible && <Text style={{ color }}>_</Text>}
      </Text>
    </View>
  );
}