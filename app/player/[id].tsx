// Poxera player profile — โชว์ตาม privacy ของเจ้าตัว
// เปิด: สถิติครบ (เกม, ชนะ, net) · ปิด: ชื่อ + จำนวนเกมเท่านั้น + ข้อความว่าซ่อนสถิติ
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { ChevronLeft, EyeOff, Trophy } from "lucide-react-native";
import { C, R, S } from "@/theme/tokens";
import { f } from "@/theme/typography";
import { usePoxera } from "@/features/poxera-store";

export default function PlayerProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const player = usePoxera((s) => s.players.find((p) => p.id === id));

  if (!player) {
    return (
      <SafeAreaView style={styles.safe}>
        <Pressable
          onPress={() => (router.canDismiss() ? router.back() : router.replace("/"))}
          style={styles.backBtn}
          accessibilityRole="button"
          accessibilityLabel="ย้อนกลับ"
        >
          <ChevronLeft size={20} color={C.ink} strokeWidth={2.5} />
        </Pressable>
        <Text style={styles.notFound}>ไม่พบผู้เล่นนี้</Text>
      </SafeAreaView>
    );
  }

  const open = player.privacyPublic;

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <Pressable
        onPress={() => (router.canDismiss() ? router.back() : router.replace("/"))}
        style={styles.backBtn}
        accessibilityRole="button"
        accessibilityLabel="ย้อนกลับ"
      >
        <ChevronLeft size={20} color={C.ink} strokeWidth={2.5} />
        <Text style={styles.backText}>ย้อนกลับ</Text>
      </Pressable>

      <ScrollView contentContainerStyle={{ padding: S.lg }}>
        <View style={styles.profileCard}>
          <View style={[styles.avatar, { backgroundColor: player.color }]}>
            <Text style={styles.avatarText}>{player.name.slice(0, 1)}</Text>
          </View>
          <Text style={styles.name}>{player.name}</Text>
          <Text style={styles.sub}>{player.games} sessions</Text>
        </View>

        {open ? (
          <View style={styles.grid}>
            <View style={styles.stat}>
              <Text style={styles.statVal}>{player.games}</Text>
              <Text style={styles.statLbl}>SESSIONS</Text>
            </View>
            <View style={styles.stat}>
              <Trophy size={20} color={C.gold} strokeWidth={2} />
              <Text style={styles.statLbl}>ดูผลแบบละเอียดที่ History</Text>
            </View>
          </View>
        ) : (
          <View style={[styles.card, styles.privateCard]}>
            <EyeOff size={22} color={C.tx3} strokeWidth={2} />
            <Text style={styles.privateTitle}>ผู้เล่นคนนี้ปิดสถิติ</Text>
            <Text style={styles.privateSub}>
              เขาเลือกไม่ให้คนอื่นเห็นผลการเล่น — เห็นเฉพาะชื่อและจำนวนเกมเท่านั้น
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.linen },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: S.lg,
    paddingVertical: S.md,
    minHeight: 44,
  },
  backText: { ...f("semibold"), fontSize: 13, color: C.ink },
  notFound: { ...f("medium"), fontSize: 14, color: C.tx2, textAlign: "center", marginTop: S.xl * 3 },
  profileCard: {
    backgroundColor: C.paper,
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: R.lg,
    padding: S.xl,
    alignItems: "center",
  },
  avatar: {
    width: 76,
    height: 76,
    borderRadius: 38,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: S.md,
  },
  avatarText: { ...f("extrabold"), fontSize: 30, color: C.white },
  name: { ...f("extrabold"), fontSize: 20, color: C.ink },
  sub: { ...f("regular"), fontSize: 12.5, color: C.tx3, marginTop: 3 },
  grid: { flexDirection: "row", gap: S.sm, marginTop: S.md },
  stat: {
    flex: 1,
    backgroundColor: C.paper,
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: R.lg,
    alignItems: "center",
    paddingVertical: S.lg,
    gap: 6,
  },
  statVal: { ...f("extrabold"), fontSize: 20, color: C.ink, fontVariant: ["tabular-nums"] },
  statLbl: {
    ...f("semibold"),
    fontSize: 9.5,
    color: C.tx3,
    letterSpacing: 1,
    textAlign: "center",
    paddingHorizontal: 8,
  },
  card: {
    backgroundColor: C.paper,
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: R.lg,
    padding: S.xl,
    marginTop: S.md,
    alignItems: "center",
  },
  privateCard: { gap: S.sm },
  privateTitle: { ...f("bold"), fontSize: 15, color: C.ink },
  privateSub: {
    ...f("regular"),
    fontSize: 12.5,
    color: C.tx2,
    textAlign: "center",
    lineHeight: 19,
  },
});
