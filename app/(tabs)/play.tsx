// Poxera Play — setup เกมใหม่: เลือกคลับ → เลือกผู้เล่น (เพื่อน/QR) → เริ่ม clock
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { QrCode, Check, Users, ChevronRight } from "lucide-react-native";
import { C, S, R } from "@/theme/tokens";
import { f } from "@/theme/typography";
import { usePoxera } from "@/features/poxera-store";

const FRIENDS = ["นน", "นาย", "ฮฮอล", "บอส", "เม", "แจ็ค", "ปอนด์", "กอล์ฟ"];

export default function PlayScreen() {
  const clubs = usePoxera((s) => s.clubs.filter((c) => c.isMember));
  const [clubId, setClubId] = useState<string | null>(null);
  const [picked, setPicked] = useState<string[]>([]);

  const toggle = (n: string) =>
    setPicked((p) => (p.includes(n) ? p.filter((x) => x !== n) : [...p, n]));

  const start = () => router.push("/clock");

  return (
    <SafeAreaView style={styles.screen} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.logo}>PLAY</Text>
        <Text style={styles.sub}>ตั้งค่าเกมแล้วเริ่มนาฬิกา</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: S.lg, paddingBottom: 130 }}>
        {/* 1. club */}
        <Text style={styles.stepTitle}>1 · เลือกคลับ</Text>
        <View style={styles.clubRow}>
          {clubs.map((c) => (
            <Pressable
              key={c.id}
              onPress={() => setClubId(c.id)}
              style={({ pressed }) => [
                styles.clubChip,
                clubId === c.id && styles.clubChipActive,
                pressed && { opacity: 0.85 },
              ]}
              accessibilityRole="button"
              accessibilityLabel={`เลือกคลับ ${c.name}`}
              accessibilityState={{ selected: clubId === c.id }}
            >
              {clubId === c.id ? (
                <Check size={14} color={C.white} strokeWidth={3} />
              ) : (
                <Users size={14} color={C.tx2} strokeWidth={2} />
              )}
              <Text style={[styles.clubText, clubId === c.id && { color: C.white }]}>
                {c.name}
              </Text>
            </Pressable>
          ))}
          {clubs.length === 0 ? (
            <Text style={styles.hint}>คุณยังไม่ได้เป็นสมาชิกคลับ — สมัครจากแท็บ Clubs</Text>
          ) : null}
        </View>

        {/* 2. players */}
        <Text style={styles.stepTitle}>2 · เลือกผู้เล่น ({picked.length} คน)</Text>
        <View style={styles.playerWrap}>
          {FRIENDS.map((n) => (
            <Pressable
              key={n}
              onPress={() => toggle(n)}
              style={({ pressed }) => [
                styles.playerChip,
                picked.includes(n) && styles.playerChipActive,
                pressed && { opacity: 0.85 },
              ]}
              accessibilityRole="button"
              accessibilityLabel={`เลือกผู้เล่น ${n}`}
              accessibilityState={{ selected: picked.includes(n) }}
            >
              {picked.includes(n) ? (
                <Check size={13} color={C.white} strokeWidth={3} />
              ) : null}
              <Text
                style={[styles.playerText, picked.includes(n) && { color: C.white }]}
              >
                {n}
              </Text>
            </Pressable>
          ))}
        </View>

        <Pressable
          style={({ pressed }) => [styles.qrBtn, pressed && { opacity: 0.85 }]}
          accessibilityRole="button"
          accessibilityLabel="สแกน QR code เพื่อเชิญผู้เล่น"
        >
          <QrCode size={18} color={C.ink} strokeWidth={2} />
          <Text style={styles.qrText}>สแกน QR เพื่อเชิญเพื่อนเข้าโต๊ะ</Text>
        </Pressable>

        {/* review queue (host) */}
        <Pressable
          style={({ pressed }) => [styles.reviewCard, pressed && { opacity: 0.85 }]}
          onPress={() => router.push("/review")}
          accessibilityRole="button"
          accessibilityLabel="เปิดคิวตรวจสอบ session"
        >
          <View style={{ flex: 1 }}>
            <Text style={styles.reviewTitle}>REVIEW QUEUE</Text>
            <Text style={styles.reviewSub}>อนุมัติ session ที่ส่งเข้ามา (Host/Admin)</Text>
          </View>
          <ChevronRight size={18} color={C.tx3} strokeWidth={2.5} />
        </Pressable>
      </ScrollView>

      {/* start bar */}
      <View style={styles.startBar}>
        <Pressable
          onPress={start}
          disabled={picked.length < 2}
          style={({ pressed }) => [
            styles.startBtn,
            picked.length < 2 && { backgroundColor: C.line2 },
            pressed && picked.length >= 2 && { opacity: 0.85 },
          ]}
          accessibilityRole="button"
          accessibilityLabel="เริ่มนาฬิกาทัวร์นาเมนต์"
          accessibilityState={{ disabled: picked.length < 2 }}
        >
          <Text style={styles.startText}>
            {picked.length < 2 ? "เลือกผู้เล่นอย่างน้อย 2 คน" : "START CLOCK"}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.linen },
  header: {
    backgroundColor: C.paper,
    paddingHorizontal: S.lg,
    paddingTop: S.lg,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: C.line,
  },
  logo: { ...f("extrabold"), fontSize: 19, color: C.ink, letterSpacing: 0.6 },
  sub: { ...f("regular"), fontSize: 12, color: C.tx3, marginTop: 2 },
  stepTitle: { ...f("bold"), fontSize: 13.5, color: C.ink, marginBottom: S.sm, marginTop: S.lg },
  clubRow: { flexDirection: "row", flexWrap: "wrap", gap: S.sm },
  clubChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    backgroundColor: C.paper,
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: R.md,
    paddingHorizontal: S.md,
    paddingVertical: 11,
    minHeight: 44,
  },
  clubChipActive: { backgroundColor: C.ink, borderColor: C.ink },
  clubText: { ...f("semibold"), fontSize: 13, color: C.tx2 },
  playerWrap: { flexDirection: "row", flexWrap: "wrap", gap: S.sm },
  playerChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: C.paper,
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: 999,
    paddingHorizontal: S.md,
    paddingVertical: 10,
    minHeight: 44,
  },
  playerChipActive: { backgroundColor: C.org, borderColor: C.org },
  playerText: { ...f("semibold"), fontSize: 13, color: C.tx2 },
  qrBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
    backgroundColor: C.paper,
    borderWidth: 1.5,
    borderColor: C.line2,
    borderStyle: "dashed",
    borderRadius: R.md,
    paddingVertical: 13,
    marginTop: S.lg,
    minHeight: 48,
  },
  qrText: { ...f("semibold"), fontSize: 13, color: C.ink },
  reviewCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.paper,
    borderWidth: 1,
    borderColor: C.line2,
    borderRadius: R.lg,
    padding: S.lg,
    marginTop: S.lg,
    minHeight: 48,
  },
  reviewTitle: { ...f("extrabold"), fontSize: 14, color: C.ink, letterSpacing: 0.5 },
  reviewSub: { ...f("regular"), fontSize: 12, color: C.tx2, marginTop: 3 },
  startBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    padding: S.md,
    paddingBottom: S.md + 10,
    backgroundColor: C.paper,
    borderTopWidth: 1,
    borderTopColor: C.line,
  },
  startBtn: {
    backgroundColor: C.org,
    borderRadius: R.md,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 50,
  },
  hint: { ...f("medium"), fontSize: 12.5, color: C.tx3, lineHeight: 20 },
  startText: { ...f("extrabold"), fontSize: 14.5, color: C.white, letterSpacing: 1 },
});
