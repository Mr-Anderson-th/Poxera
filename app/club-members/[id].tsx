// Poxera Club Members — list สมาชิกในคลับ: ชื่อ · จำนวนเล่น · ชั่วโมงเล่น → กดไปโปรไฟล์
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { ChevronLeft, ChevronRight, EyeOff } from "lucide-react-native";
import { C, R, S } from "@/theme/tokens";
import { f } from "@/theme/typography";
import { usePoxera } from "@/features/poxera-store";

type Member = { id: string; name: string; color: string; games: number; hours: number; privacyPublic: boolean };

function MemberRow({ m }: { m: Member }) {
  return (
    <Pressable
      onPress={() => router.push(`/player/${m.id}`)}
      style={({ pressed }) => [styles.row, pressed && { opacity: 0.8 }]}
      accessibilityRole="button"
      accessibilityLabel={`ดูโปรไฟล์ ${m.name}`}
    >
      <View style={[styles.avatar, { backgroundColor: m.color }]}>
        <Text style={styles.avText}>{m.name.slice(0, 1)}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <View style={styles.nameRow}>
          <Text style={styles.name}>{m.name}</Text>
          {!m.privacyPublic ? (
            <EyeOff size={12} color={C.tx3} strokeWidth={2} />
          ) : null}
        </View>
        <Text style={styles.sub}>{m.hours.toFixed(1)} ชม. เล่น</Text>
      </View>
      <View style={styles.gamesCol}>
        <Text style={styles.games}>{m.games}</Text>
        <Text style={styles.gamesLbl}>GAMES</Text>
      </View>
      <ChevronRight size={16} color={C.line2} strokeWidth={2.5} />
    </Pressable>
  );
}

export default function ClubMembersScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const club = usePoxera((s) => s.clubs.find((c) => c.id === id));
  const players = usePoxera((s) => s.players);

  if (!club) {
    return (
      <SafeAreaView style={styles.safe}>
        <Text style={styles.notFound}>ไม่พบคลับนี้</Text>
      </SafeAreaView>
    );
  }

  // demo: ใช้ players ในระบบเป็นสมาชิก — เมื่อเชื่อม DB จะดึงตาม club_members
  const members = players;

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <Pressable
          onPress={() => (router.canDismiss() ? router.back() : router.replace("/clubs"))}
          style={styles.backBtn}
          accessibilityRole="button"
          accessibilityLabel="ย้อนกลับ"
        >
          <ChevronLeft size={20} color={C.ink} strokeWidth={2.5} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>สมาชิกคลับ</Text>
          <Text style={styles.subtitle}>{club.name} · {club.memberCount} คน</Text>
        </View>
      </View>

      <FlatList
        data={members}
        keyExtractor={(m) => m.id}
        contentContainerStyle={{ padding: S.lg, paddingBottom: S.xl * 2 }}
        renderItem={({ item }) => <MemberRow m={item} />}
        ListEmptyComponent={<Text style={styles.notFound}>ยังไม่มีสมาชิก</Text>}
      />
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
  subtitle: { ...f("regular"), fontSize: 12, color: C.tx3, marginTop: 1 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: S.md,
    backgroundColor: C.paper,
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: R.lg,
    padding: S.md,
    marginBottom: S.sm,
    minHeight: 64,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
  },
  avText: { ...f("bold"), fontSize: 17, color: C.white },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  name: { ...f("bold"), fontSize: 14.5, color: C.ink },
  sub: { ...f("regular"), fontSize: 11.5, color: C.tx3, marginTop: 2 },
  gamesCol: { alignItems: "flex-end" },
  games: { ...f("extrabold"), fontSize: 16, color: C.org, fontVariant: ["tabular-nums"] },
  gamesLbl: { ...f("semibold"), fontSize: 8.5, color: C.tx3, letterSpacing: 1 },
  notFound: { ...f("medium"), fontSize: 13, color: C.tx3, textAlign: "center", marginTop: S.xl * 2 },
});
