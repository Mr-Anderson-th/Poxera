// Poxera Game Setup — ตั้งค่าก่อนเริ่มเกม (parity กับเว็บหลัก):
// buy-in · re-buy · blind mode (wsop/hyper/custom) · starting SB/BB · level minutes · payout preset
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { ChevronLeft, Check } from "lucide-react-native";
import { C, R, S } from "@/theme/tokens";
import { f } from "@/theme/typography";
import { useGameSetup } from "@/features/game-setup-store";
import { PAYOUT_PRESETS } from "@/lib/poker";

const BLIND_MODES: { key: "custom" | "wsop" | "hyper"; label: string; sub: string }[] = [
  { key: "custom", label: "Custom", sub: "ระบุเอง — ทบตาม multiplier" },
  { key: "wsop", label: "WSOP", sub: "มาตรฐานทัวร์นาเมนต์" },
  { key: "hyper", label: "Hyper", sub: "เร็ว — เหมาะโต๊ะเล็ก" },
];

const PRESET_NAMES = Object.keys(PAYOUT_PRESETS);

function Stepper({
  label, value, onChange, step = 25, min = 0, suffix,
}: { label: string; value: number; onChange: (v: number) => void; step?: number; min?: number; suffix?: string }) {
  return (
    <View style={styles.stepperRow}>
      <Text style={styles.stepperLbl}>{label}</Text>
      <View style={styles.stepperCtl}>
        <Pressable
          onPress={() => onChange(Math.max(min, value - step))}
          style={({ pressed }) => [styles.stepBtn, pressed && { opacity: 0.7 }]}
          accessibilityRole="button"
          accessibilityLabel={`ลด ${label}`}
        >
          <Text style={styles.stepBtnText}>−</Text>
        </Pressable>
        <Text style={styles.stepVal}>
          {value}
          {suffix ? ` ${suffix}` : ""}
        </Text>
        <Pressable
          onPress={() => onChange(value + step)}
          style={({ pressed }) => [styles.stepBtn, pressed && { opacity: 0.7 }]}
          accessibilityRole="button"
          accessibilityLabel={`เพิ่ม ${label}`}
        >
          <Text style={styles.stepBtnText}>+</Text>
        </Pressable>
      </View>
    </View>
  );
}

export default function GameSetupScreen() {
  const setup = useGameSetup();
  const [buyIn, setBuyIn] = useState(String(setup.buyIn));
  const [rebuy, setRebuy] = useState(String(setup.rebuyAmount));
  const [mins, setMins] = useState(String(setup.levelMinutes));
  const [sb, setSb] = useState(String(setup.startSb));
  const [bb, setBb] = useState(String(setup.startBb));

  const num = (s: string, fb: number) => (Number(s) > 0 ? Number(s) : fb);

  const save = () => {
    setup.setSetup({
      buyIn: num(buyIn, 500),
      rebuyAmount: num(rebuy, 500),
      levelMinutes: num(mins, 15),
      startSb: num(sb, 25),
      startBb: num(bb, 50),
    });
    router.back();
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={styles.backBtn}
          accessibilityRole="button"
          accessibilityLabel="ย้อนกลับ"
        >
          <ChevronLeft size={20} color={C.ink} strokeWidth={2.5} />
        </Pressable>
        <Text style={styles.title}>SET — ตั้งค่าการเล่น</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: S.lg, paddingBottom: S.xl * 3 }}>
        {/* money */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>เงิน</Text>
          <Stepper label="บายอิน" value={num(buyIn, 500)} onChange={(v) => setBuyIn(String(v))} step={100} suffix="฿" />
          <Stepper label="ราคา re-buy" value={num(rebuy, 500)} onChange={(v) => setRebuy(String(v))} step={100} suffix="฿" />
        </View>

        {/* blinds */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Blind Structure</Text>
          <View style={styles.modeRow}>
            {BLIND_MODES.map((m) => (
              <Pressable
                key={m.key}
                onPress={() => setup.setSetup({ blindMode: m.key })}
                style={({ pressed }) => [
                  styles.modeChip,
                  setup.blindMode === m.key && styles.modeChipActive,
                  pressed && { opacity: 0.85 },
                ]}
                accessibilityRole="button"
                accessibilityLabel={`โหมด ${m.label}`}
                accessibilityState={{ selected: setup.blindMode === m.key }}
              >
                {setup.blindMode === m.key ? <Check size={13} color={C.white} strokeWidth={3} /> : null}
                <Text style={[styles.modeText, setup.blindMode === m.key && { color: C.white }]}>
                  {m.label}
                </Text>
              </Pressable>
            ))}
          </View>
          <Text style={styles.hint}>{BLIND_MODES.find((m) => m.key === setup.blindMode)?.sub}</Text>

          <View style={styles.row2}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Starting SB</Text>
              <TextInput
                style={styles.input}
                value={sb}
                onChangeText={setSb}
                keyboardType="number-pad"
                accessibilityLabel="Starting small blind"
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Starting BB</Text>
              <TextInput
                style={styles.input}
                value={bb}
                onChangeText={setBb}
                keyboardType="number-pad"
                accessibilityLabel="Starting big blind"
              />
            </View>
          </View>
        </View>

        {/* time */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>เวลา</Text>
          <Stepper label="นาทีต่อรอบ" value={num(mins, 15)} onChange={(v) => setMins(String(v))} step={5} min={1} suffix="นาที" />
        </View>

        {/* payout */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Payout Structure</Text>
          {PRESET_NAMES.map((name) => (
            <Pressable
              key={name}
              onPress={() => setup.setPayoutPreset(name)}
              style={({ pressed }) => [
                styles.payoutRow,
                setup.payoutStructureName === name && styles.payoutRowActive,
                pressed && { opacity: 0.8 },
              ]}
              accessibilityRole="radio"
              accessibilityLabel={`payout ${name}`}
              accessibilityState={{ selected: setup.payoutStructureName === name }}
            >
              <Text style={[styles.payoutText, setup.payoutStructureName === name && { color: C.org }]}>
                {name}
              </Text>
              {setup.payoutStructureName === name ? (
                <Check size={16} color={C.org} strokeWidth={3} />
              ) : null}
            </Pressable>
          ))}
        </View>

        <Pressable
          onPress={save}
          style={({ pressed }) => [styles.saveBtn, pressed && { opacity: 0.85 }]}
          accessibilityRole="button"
          accessibilityLabel="บันทึกการตั้งค่า"
        >
          <Check size={17} color={C.white} strokeWidth={3} />
          <Text style={styles.saveText}>บันทึกการตั้งค่า</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.linen },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: S.md,
    paddingVertical: S.sm,
    backgroundColor: C.paper,
    borderBottomWidth: 1,
    borderBottomColor: C.line,
  },
  backBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  title: { ...f("extrabold"), fontSize: 16, color: C.ink },
  card: {
    backgroundColor: C.paper,
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: R.lg,
    padding: S.lg,
    marginBottom: S.md,
  },
  cardTitle: { ...f("bold"), fontSize: 14.5, color: C.ink, marginBottom: S.sm },
  stepperRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 9,
  },
  stepperLbl: { ...f("medium"), fontSize: 13.5, color: C.tx2 },
  stepperCtl: { flexDirection: "row", alignItems: "center", gap: S.md },
  stepBtn: {
    width: 40,
    height: 40,
    borderRadius: R.md,
    backgroundColor: C.linen,
    borderWidth: 1,
    borderColor: C.line,
    alignItems: "center",
    justifyContent: "center",
  },
  stepBtnText: { ...f("extrabold"), fontSize: 18, color: C.ink },
  stepVal: { ...f("extrabold"), fontSize: 16, color: C.ink, minWidth: 70, textAlign: "center", fontVariant: ["tabular-nums"] },
  modeRow: { flexDirection: "row", gap: S.sm },
  modeChip: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    backgroundColor: C.linen,
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: R.md,
    paddingVertical: 10,
    minHeight: 44,
  },
  modeChipActive: { backgroundColor: C.ink, borderColor: C.ink },
  modeText: { ...f("semibold"), fontSize: 12.5, color: C.tx2 },
  hint: { ...f("regular"), fontSize: 11.5, color: C.tx3, marginTop: 8 },
  label: { ...f("semibold"), fontSize: 12.5, color: C.ink, marginTop: S.md, marginBottom: S.sm },
  input: {
    backgroundColor: C.linen,
    borderRadius: R.md,
    borderWidth: 1,
    borderColor: C.line,
    paddingHorizontal: S.md,
    fontSize: 14,
    color: C.ink,
    minHeight: 46,
  },
  row2: { flexDirection: "row", gap: S.sm },
  payoutRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: S.sm,
    borderRadius: R.md,
    minHeight: 44,
  },
  payoutRowActive: { backgroundColor: C.orgSoft },
  payoutText: { ...f("semibold"), fontSize: 13.5, color: C.tx2 },
  saveBtn: {
    flexDirection: "row",
    backgroundColor: C.org,
    borderRadius: R.md,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 15,
    minHeight: 50,
  },
  saveText: { ...f("bold"), fontSize: 15, color: C.white },
});
