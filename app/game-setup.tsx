// Poxera Game Setup — ตั้งค่าก่อนเริ่มเกม (parity กับเว็บหลัก):
// เงินพิมพ์เองได้ · blind modes พร้อมคำอธิบายชัด · เวลา 5/10/15... (+/−5 ไม่มีบั๊ก) · payout presets พร้อมคำแนะนำจำนวนคน + custom %
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { ChevronLeft, Check } from "lucide-react-native";
import { C, R, S } from "@/theme/tokens";
import { f } from "@/theme/typography";
import { useGameSetup } from "@/features/game-setup-store";
import { PAYOUT_PRESETS } from "@/lib/poker";

type BlindMode = "wsop" | "hyper" | "custom";

const BLIND_MODES: { key: BlindMode; label: string; desc: string }[] = [
  {
    key: "wsop",
    label: "Standard Tournament",
    desc: "ระดับ blind เพิ่มช้า ๆ ตามมาตรฐานทัวร์นาเมนต์จริง — เหมาะเกมยาว 1-2 ชม. ขึ้นไป",
  },
  {
    key: "hyper",
    label: "Hyper Turbo",
    desc: "blind เพิ่มเร็วมาก (ทบ 2 เท่าทุกรอบ) — เหมาะเกมสั้น จบไว ตัดสินกันไว",
  },
  {
    key: "custom",
    label: "Custom",
    desc: "ระบุ blind เริ่มต้นเอง แล้วทบตาม multiplier ที่กำหนด — ยืดหยุ่นที่สุด",
  },
];

const PAYOUT_PRESET_INFO: { name: string; desc: string }[] = [
  { name: "Winner Take All", desc: "ผู้ชนะกินทั้งหมด — เหมาะโต๊ะเล็ก ไม่เกิน 4 คน" },
  { name: "50 / 30 / 20", desc: "มาตรฐานยอดนิยม — เหมาะ 5-8 คน" },
  { name: "50 / 25 / 15 / 10", desc: "แจกลึกขึ้น — เหมาะ 9-15 คน" },
  { name: "40 / 25 / 20 / 10 / 5", desc: "แจกหลายอันดับ — เหมาะ 16+ คน หรืออยากให้หลายคนได้เงิน" },
];

export default function GameSetupScreen() {
  const setup = useGameSetup();
  const [buyIn, setBuyIn] = useState(String(setup.buyIn));
  const [rebuy, setRebuy] = useState(String(setup.rebuyAmount));
  const [sb, setSb] = useState(String(setup.startSb));
  const [bb, setBb] = useState(String(setup.startBb));

  const mins = setup.levelMinutes; // ควบคุมผ่าน store — step 5 เสมอ
  const num = (s: string, fb: number) => (Number(s) > 0 ? Number(s) : fb);

  const setMins = (v: number) => setup.setSetup({ levelMinutes: Math.max(5, v) });

  const applyCustomPayout = (text: string) => {
    setup.setSetup({ customPayout: text });
    const parts = text
      .split(/[,/\s]+/)
      .map((x) => Number(x.trim()))
      .filter((n) => Number.isFinite(n) && n > 0);
    if (parts.length >= 1 && parts.length <= 10) {
      setup.setSetup({
        payoutStructureName: `Custom (${parts.join("/")})`,
        payoutStructure: parts,
      });
    }
  };

  const save = () => {
    setup.setSetup({
      buyIn: num(buyIn, 500),
      rebuyAmount: num(rebuy, 500),
      startSb: num(sb, 25),
      startBb: num(bb, 50),
    });
    router.back();
  };

  const modeDesc = BLIND_MODES.find((m) => m.key === setup.blindMode)?.desc ?? "";

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
        {/* เงิน — พิมพ์เองได้ */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>เงิน</Text>

          <Text style={styles.label}>บายอิน (฿)</Text>
          <TextInput
            style={styles.input}
            value={buyIn}
            onChangeText={setBuyIn}
            keyboardType="number-pad"
            accessibilityLabel="บายอิน"
          />

          <Text style={styles.label}>ราคา re-buy (฿)</Text>
          <TextInput
            style={styles.input}
            value={rebuy}
            onChangeText={setRebuy}
            keyboardType="number-pad"
            accessibilityLabel="ราคา re-buy"
          />
        </View>

        {/* blind structure */}
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
                <Text
                  style={[styles.modeText, setup.blindMode === m.key && { color: C.white }]}
                  numberOfLines={1}
                >
                  {m.label}
                </Text>
              </Pressable>
            ))}
          </View>
          <Text style={styles.modeDesc}>{modeDesc}</Text>

          {setup.blindMode === "custom" ? (
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
          ) : null}
        </View>

        {/* เวลา — เริ่ม 5, บวก/ลดทีละ 5 */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>เวลาต่อรอบ</Text>
          <View style={styles.timeRow}>
            <Pressable
              onPress={() => setMins(mins - 5)}
              disabled={mins <= 5}
              style={({ pressed }) => [
                styles.timeBtn,
                mins <= 5 && { opacity: 0.4 },
                pressed && mins > 5 && { opacity: 0.7 },
              ]}
              accessibilityRole="button"
              accessibilityLabel="ลดเวลา 5 นาที"
            >
              <Text style={styles.timeBtnText}>−5</Text>
            </Pressable>
            <View style={styles.timeValWrap}>
              <Text style={styles.timeVal}>{mins}</Text>
              <Text style={styles.timeUnit}>นาที / รอบ</Text>
            </View>
            <Pressable
              onPress={() => setMins(mins + 5)}
              style={({ pressed }) => [styles.timeBtn, pressed && { opacity: 0.7 }]}
              accessibilityRole="button"
              accessibilityLabel="เพิ่มเวลา 5 นาที"
            >
              <Text style={styles.timeBtnText}>+5</Text>
            </Pressable>
          </View>
          <Text style={styles.hint}>5 · 10 · 15 · 20 … นาที (เริ่มต้น 5 — จบไวเหมาะโต๊ะเพื่อน)</Text>
        </View>

        {/* payout */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Payout Structure</Text>
          <Text style={styles.payoutIntro}>เลือกแบบแจกเงิน — แต่ละแบบเหมาะกับจำนวนผู้เล่นต่างกัน</Text>
          {PAYOUT_PRESET_INFO.map((p) => (
            <Pressable
              key={p.name}
              onPress={() => setup.setPayoutPreset(p.name)}
              style={({ pressed }) => [
                styles.payoutRow,
                setup.payoutStructureName === p.name && styles.payoutRowActive,
                pressed && { opacity: 0.8 },
              ]}
              accessibilityRole="radio"
              accessibilityLabel={`payout ${p.name}`}
              accessibilityState={{ selected: setup.payoutStructureName === p.name }}
            >
              <View style={{ flex: 1 }}>
                <Text style={[styles.payoutName, setup.payoutStructureName === p.name && { color: C.org }]}>
                  {p.name}
                </Text>
                <Text style={styles.payoutDesc}>{p.desc}</Text>
              </View>
              {setup.payoutStructureName === p.name ? (
                <Check size={16} color={C.org} strokeWidth={3} />
              ) : null}
            </Pressable>
          ))}

          {/* custom payout */}
          <Text style={styles.label}>หรือกำหนดเอง (% คั่นด้วยเครื่องหมาย /)</Text>
          <TextInput
            style={styles.input}
            value={setup.customPayout}
            onChangeText={applyCustomPayout}
            placeholder="เช่น 60/25/15"
            placeholderTextColor={C.tx3}
            accessibilityLabel="กำหนด payout เอง"
          />
          <Text style={styles.hint}>
            รวมต้องเท่ากับ 100 — ระบบตัดสัดส่วนตามที่กรอกเมื่อจบเกม
          </Text>
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
  label: { ...f("semibold"), fontSize: 12.5, color: C.ink, marginTop: S.md, marginBottom: S.sm },
  input: {
    backgroundColor: C.linen,
    borderRadius: R.md,
    borderWidth: 1,
    borderColor: C.line,
    paddingHorizontal: S.md,
    fontSize: 15,
    color: C.ink,
    minHeight: 48,
  },
  modeRow: { flexDirection: "row", gap: S.sm },
  modeChip: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    backgroundColor: C.linen,
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: R.md,
    paddingVertical: 10,
    minHeight: 44,
    paddingHorizontal: 4,
  },
  modeChipActive: { backgroundColor: C.ink, borderColor: C.ink },
  modeText: { ...f("semibold"), fontSize: 10.5, color: C.tx2 },
  modeDesc: {
    ...f("regular"),
    fontSize: 12,
    color: C.tx2,
    lineHeight: 18,
    marginTop: S.md,
    backgroundColor: C.linen,
    borderRadius: R.md,
    padding: S.md,
  },
  row2: { flexDirection: "row", gap: S.sm },
  timeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  timeBtn: {
    width: 72,
    height: 48,
    borderRadius: R.md,
    backgroundColor: C.linen,
    borderWidth: 1,
    borderColor: C.line,
    alignItems: "center",
    justifyContent: "center",
  },
  timeBtnText: { ...f("extrabold"), fontSize: 15, color: C.ink },
  timeValWrap: { alignItems: "center" },
  timeVal: { ...f("extrabold"), fontSize: 30, color: C.org, fontVariant: ["tabular-nums"] },
  timeUnit: { ...f("medium"), fontSize: 11, color: C.tx3, marginTop: 2 },
  hint: { ...f("regular"), fontSize: 11.5, color: C.tx3, marginTop: 8, lineHeight: 17 },
  payoutIntro: { ...f("regular"), fontSize: 12, color: C.tx2, marginBottom: S.sm },
  payoutRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    paddingVertical: 10,
    paddingHorizontal: S.sm,
    borderRadius: R.md,
    minHeight: 56,
  },
  payoutRowActive: { backgroundColor: C.orgSoft },
  payoutName: { ...f("bold"), fontSize: 13.5, color: C.tx2 },
  payoutDesc: { ...f("regular"), fontSize: 11, color: C.tx3, marginTop: 2 },
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
