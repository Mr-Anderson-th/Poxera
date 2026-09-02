// Poxera History — ตาราง session + filter ตามคลับ (ข้อมูลจากเว็บถ้ามี Supabase)
import { useMemo, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { ChevronRight, CalendarDays } from "lucide-react-native";
import { C, R, S } from "@/theme/tokens";
import { f } from "@/theme/typography";
import { usePoxera } from "@/features/poxera-store";
import { useRounds, useResults, useList, type Round, type RoundResult } from "@/lib/queries";

const money = (n: number) => `฿${Math.round(n).toLocaleString()}`;

type Row = {
  round: Round;
  pot: number;
  winner: string;
  myPlace: number | null;
};

function SessionRow({ row, clubName }: { row: Row; clubName: string }) {
  return (
    <Pressable
      onPress={() => router.push(`/rounds/${row.round.id}`)}
      style={({ pressed }) => [styles.row, pressed && { opacity: 0.85 }]}
      accessibilityRole="button"
      accessibilityLabel={`เปิด session ${row.round.name}`}
    >
      <View style={styles.dateCol}>
        <CalendarDays size={13} color={C.tx3} strokeWidth={2} />
        <Text style={styles.date}>
          {new Date(row.round.played_at).toLocaleDateString("th-TH", {
            day: "numeric",
            month: "short",
          })}
        </Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.name} numberOfLines={1}>
          {row.round.name}
        </Text>
        <Text style={styles.sub}>{clubName}</Text>
      </View>
      <View style={styles.rightCol}>
        <Text style={styles.pot}>{money(row.pot)}</Text>
        <Text style={styles.winner}>ชนะ: {row.winner}</Text>
      </View>
      <ChevronRight size={16} color={C.line2} strokeWidth={2.5} />
    </Pressable>
  );
}

export default function HistoryScreen() {
  const clubs = usePoxera((s) => s.clubs);
  const { data: rounds } = useList(useRounds());
  const { data: results } = useList(useResults());

  const [filter, setFilter] = useState<string | "all">("all");

  const rows = useMemo<Row[]>(() => {
    return rounds
      .filter((r) => filter === "all" || (filter === "ppch" && r.name.toLowerCase().includes("ppch")))
      .sort((a, b) => +new Date(b.played_at) - +new Date(a.played_at))
      .map((round) => {
        const rs = results.filter((x: RoundResult) => x.round_id === round.id);
        const pot = round.buy_in * rs.length + (round.rebuy_amount ?? 0);
        const w = rs.find((x) => x.finish_position === 1);
        return { round, pot, winner: w?.player_id?.slice(0, 4) ?? "—", myPlace: null };
      });
  }, [rounds, results, filter]);

  const filters: { key: string; label: string }[] = [
    { key: "all", label: "ทั้งหมด" },
    ...clubs
      .filter((c) => c.isMember)
      .map((c) => ({ key: c.id === "c1" ? "ppch" : c.id, label: c.name })),
  ];

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.logo}>POXERA</Text>
        <Text style={styles.subtitle}>History Sessions</Text>
      </View>

      {/* filter chips */}
      <View style={styles.filterRow}>
        {filters.map((ft) => (
          <Pressable
            key={ft.key}
            onPress={() => setFilter(ft.key)}
            style={({ pressed }) => [
              styles.filterChip,
              filter === ft.key && styles.filterChipActive,
              pressed && { opacity: 0.85 },
            ]}
            accessibilityRole="button"
            accessibilityLabel={`กรอง: ${ft.label}`}
            accessibilityState={{ selected: filter === ft.key }}
          >
            <Text
              style={[styles.filterText, filter === ft.key && { color: C.white }]}
            >
              {ft.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <FlatList
        data={rows}
        keyExtractor={(r) => r.round.id}
        contentContainerStyle={{ paddingHorizontal: S.md, paddingBottom: S.xl * 2 }}
        renderItem={({ item }) => (
          <SessionRow row={item} clubName={filter === "ppch" ? "PPCH Poker Club" : "ทั้งหมด"} />
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>ไม่มี session ในตัวกรองนี้</Text>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.linen },
  header: {
    paddingHorizontal: S.lg,
    paddingTop: S.md,
    paddingBottom: S.sm,
    flexDirection: "row",
    alignItems: "baseline",
    gap: S.sm,
  },
  logo: { ...f("extrabold"), fontSize: 20, letterSpacing: 2, color: C.ink },
  subtitle: { ...f("semibold"), fontSize: 13, color: C.tx3 },
  filterRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: S.sm,
    paddingHorizontal: S.md,
    marginBottom: S.md,
  },
  filterChip: {
    backgroundColor: C.paper,
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: 999,
    paddingHorizontal: S.md,
    paddingVertical: 9,
    minHeight: 38,
    justifyContent: "center",
  },
  filterChipActive: { backgroundColor: C.ink, borderColor: C.ink },
  filterText: { ...f("semibold"), fontSize: 12, color: C.tx2 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.paper,
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: R.lg,
    padding: S.md,
    marginBottom: S.sm,
    gap: S.md,
    minHeight: 64,
  },
  dateCol: { alignItems: "center", width: 44, gap: 3 },
  date: { ...f("semibold"), fontSize: 10.5, color: C.tx2 },
  name: { ...f("bold"), fontSize: 14, color: C.ink },
  sub: { ...f("regular"), fontSize: 11, color: C.tx3, marginTop: 2 },
  rightCol: { alignItems: "flex-end" },
  pot: { ...f("extrabold"), fontSize: 14, color: C.org, fontVariant: ["tabular-nums"] },
  winner: { ...f("regular"), fontSize: 10.5, color: C.tx3, marginTop: 2 },
  empty: { ...f("medium"), fontSize: 13, color: C.tx3, textAlign: "center", marginTop: S.xl * 2 },
});
