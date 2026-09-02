// Poxera onboarding — แสดงครั้งแรกครั้งเดียวหลัง login
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { C, R, S } from "@/theme/tokens";
import { f } from "@/theme/typography";
import { usePoxera } from "@/features/poxera-store";
import { Rss, MapPin, Play, History, User } from "lucide-react-native";

const STEPS = [
  {
    icon: Rss,
    title: "Feed",
    body: "ดูเพื่อนเล่น ชนะ อะไรบ้าง — กด kudos และคอมเมนต์ได้เหมือน Strava",
  },
  {
    icon: MapPin,
    title: "Clubs",
    body: "หาคลับใกล้คุณ ดูรีวิว บายอิน ขอเข้าร่วมคลับ รอเจ้าของอนุมัติ",
  },
  {
    icon: Play,
    title: "Play",
    body: "เริ่มเกม เลือกเพื่อนหรือสแกน QR — มีนาฬิกา blind และบันทึก re-buy/knockout",
  },
  {
    icon: History,
    title: "History",
    body: "ดูย้อนทุก session ที่เล่น พร้อม filter ตามคลับ",
  },
  {
    icon: User,
    title: "You",
    body: "สถิติของคุณ และเลือกได้ว่าจะให้คนอื่นเห็นข้อมูลไหม",
  },
] as const;

export default function OnboardingScreen() {
  const completeOnboarding = usePoxera((s) => s.completeOnboarding);
  const [step, setStep] = useState(0);
  const s = STEPS[step];
  const Icon = s.icon;
  const last = step === STEPS.length - 1;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.body}>
        <View style={styles.dotsRow}>
          {STEPS.map((_, i) => (
            <View key={i} style={[styles.dot, i === step && styles.dotActive]} />
          ))}
        </View>

        <View style={styles.hero}>
          <View style={styles.iconWrap}>
            <Icon size={34} color={C.org} strokeWidth={2} />
          </View>
          <Text style={styles.title}>{s.title}</Text>
          <Text style={styles.bodyText}>{s.body}</Text>
        </View>

        <Pressable
          onPress={() => (last ? (completeOnboarding(), router.replace("/")) : setStep(step + 1))}
          style={({ pressed }) => [styles.btn, pressed && { opacity: 0.85 }]}
          accessibilityRole="button"
          accessibilityLabel={last ? "เริ่มใช้งาน" : "ถัดไป"}
        >
          <Text style={styles.btnText}>{last ? "เริ่มใช้งาน" : "ถัดไป"}</Text>
        </Pressable>
        {!last ? (
          <Pressable
            onPress={() => (completeOnboarding(), router.replace("/"))}
            accessibilityRole="button"
            accessibilityLabel="ข้าม"
          >
            <Text style={styles.skip}>ข้ามทั้งหมด</Text>
          </Pressable>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.paper },
  body: { flex: 1, padding: S.xl, justifyContent: "space-between" },
  dotsRow: { flexDirection: "row", gap: S.sm, justifyContent: "center", paddingTop: S.lg },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: C.line2 },
  dotActive: { backgroundColor: C.org, width: 20 },
  hero: { alignItems: "center", flex: 1, justifyContent: "center" },
  iconWrap: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: C.orgSoft,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: S.xl,
  },
  title: { ...f("extrabold"), fontSize: 26, color: C.ink, marginBottom: S.md },
  bodyText: {
    ...f("regular"),
    fontSize: 15,
    color: C.tx2,
    textAlign: "center",
    lineHeight: 24,
    paddingHorizontal: S.lg,
  },
  btn: {
    backgroundColor: C.org,
    borderRadius: R.md,
    alignItems: "center",
    paddingVertical: 15,
    minHeight: 48,
    justifyContent: "center",
  },
  btnText: { ...f("bold"), fontSize: 15, color: C.white },
  skip: {
    ...f("semibold"),
    fontSize: 13,
    color: C.tx3,
    textAlign: "center",
    marginTop: S.md,
    minHeight: 44,
    textAlignVertical: "center",
  },
});
