import React, { useEffect, useRef } from "react";
import { View, Animated, Dimensions, StyleSheet, Text } from "react-native";

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");
const FONT_SIZE = 12;
const COLUMNS = Math.floor(SCREEN_W / FONT_SIZE);
const CHARS = "01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン";

/**
 * Matrix Rain – text-based falling animation using react-native-reanimated.
 * Each column has a falling drop that wraps around.
 */
export function MatrixRain({ color = "#00ff41" }: { color: string }) {
  const drops = useRef<number[]>([]);
  const frameId = useRef<number>(0);

  // Initialize drops
  if (drops.current.length === 0) {
    for (let i = 0; i < COLUMNS; i++) {
      drops.current[i] = Math.random() * -100;
    }
  }

  const [rows, setRows] = React.useState<string[]>(() => {
    const rowCount = Math.floor(SCREEN_H / FONT_SIZE);
    return new Array(rowCount).fill(" ".repeat(COLUMNS));
  });

  useEffect(() => {
    let running = true;
    const animate = () => {
      if (!running) return;
      const newRows = [...rows];
      const rowCount = Math.floor(SCREEN_H / FONT_SIZE);

      // For each column, place a char at the drop position
      for (let c = 0; c < COLUMNS; c++) {
        const dropRow = Math.floor(drops.current[c]);
        if (dropRow >= 0 && dropRow < rowCount) {
          const row = newRows[dropRow].split("");
          const char = CHARS[Math.floor(Math.random() * CHARS.length)];
          row[c] = char;
          newRows[dropRow] = row.join("");
        }
        // Advance drop
        drops.current[c]++;
        if (drops.current[c] * FONT_SIZE > SCREEN_H && Math.random() > 0.975) {
          drops.current[c] = 0;
        }
      }
      setRows(newRows);
      frameId.current = requestAnimationFrame(animate);
    };

    frameId.current = requestAnimationFrame(animate);
    return () => {
      running = false;
      cancelAnimationFrame(frameId.current);
    };
  }, [color]);

  return (
    <View style={styles.container} pointerEvents="none">
      {rows.map((row, i) => (
        <Text key={i} style={[styles.text, { color }]} numberOfLines={1}>
          {row}
        </Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.3,
  },
  text: {
    fontFamily: "monospace",
    fontSize: FONT_SIZE,
    lineHeight: FONT_SIZE * 1.15,
    letterSpacing: 1,
  },
});