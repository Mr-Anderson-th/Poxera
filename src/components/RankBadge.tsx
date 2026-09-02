import { Image, StyleSheet, Text, View } from "react-native";
import { RANKS, UNRANKED_KEY } from "@/features/mmr/ranks";

const ASSETS: Record<string, number> = {
  "high-card": require("../../assets/ranks/high-card.png"),
  "one-pair": require("../../assets/ranks/one-pair.png"),
  "two-pair": require("../../assets/ranks/two-pair.png"),
  "three-of-a-kind": require("../../assets/ranks/three-of-a-kind.png"),
  straight: require("../../assets/ranks/straight.png"),
  flush: require("../../assets/ranks/flush.png"),
  "full-house": require("../../assets/ranks/full-house.png"),
  "four-of-a-kind": require("../../assets/ranks/four-of-a-kind.png"),
  "straight-flush": require("../../assets/ranks/straight-flush.png"),
  "royal-flush": require("../../assets/ranks/royal-flush.png"),
  unranked: require("../../assets/ranks/unranked.jpg"),
};

export function rankAsset(key: string) {
  return ASSETS[key] ?? ASSETS[UNRANKED_KEY];
}

export function rankLabel(key: string): string {
  return RANKS.find((r) => r.key === key)?.label ?? "UNRANKED";
}

/** Poker Rank shield — ใช้ asset ต้นฉบับของผู้ใช้เสมอ ห้ามวาดเอง */
export function RankBadge({ rankKey, size = 40 }: { rankKey: string; size?: number }) {
  return (
    <Image
      source={rankAsset(rankKey)}
      resizeMode="contain"
      style={{ width: size, height: size }}
      accessibilityLabel={rankLabel(rankKey)}
    />
  );
}

/** ป้ายชื่อ rank ใต้/ข้าง shield */
export function RankTag({ label, color }: { label: string; color: string }) {
  return (
    <View style={styles.tag}>
      <Text style={[styles.tagText, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tag: {
    backgroundColor: "#F7F6F3",
    borderWidth: 1,
    borderColor: "#E8E7E2",
    borderRadius: 4,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  tagText: { fontSize: 9, fontWeight: "800", letterSpacing: 0.8 },
});
