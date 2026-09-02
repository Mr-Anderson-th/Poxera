import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { C, S, R } from "@/theme/tokens";
import { f } from "@/theme/typography";
import { usePlayers, useResults, useRounds } from "@/lib/queries";

const money = (n: number) => `฿${Math.round(n).toLocaleString()}`;

/** Round detail — parity กับเว็บ /rounds/$id (podium + full results) */
export default function RoundDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: players = [] } = usePlayers();
  const { data: rounds = [] } = useRounds();
  const { data: results = [] } = useResults();

  const round = rounds.find((r) => r.id === id);
  if (!round) {
    return (
      <View style={styles.safe}>
        <Text style={styles.empty}>ไม่พบรอบแข่ง</Text>
      </View>
    );
  }

  const rows = results
    .filter((r) => r.round_id === id)
    .sort((a, b) => a.finish_position - b.finish_position);

  return (
    <ScrollView style={styles.safe} contentContainerStyle={{ paddingBottom: 60 }}>
      <View style={styles.hero}>
        <Text style={styles.title}>{round.name}</Text>
        <Text style={styles.meta}>
          {new Date(round.played_at).toLocaleDateString("th-TH", { day: "numeric", month: "long", year: "numeric" })}
          {" · "}
          {round.total_players} คน · {round.total_rebuys} re-buys · {money(Number(round.total_pot))}
        </Text>
      </View>

      {/* podium */}
      <View style={styles.podiumRow}>
        {[1, 2, 3].map((pos) => {
          const r = rows.find((x) => x.finish_position === pos);
          const name = players.find((p) => p.id === r?.player_id)?.name ?? "—";
          const heights = [72, 54, 42];
          const colors = [C.gold, "#9CA3AF", "#C07A35"];
          return (
            <View key={pos} style={styles.podiumCol}>
              <Text style={styles.podiumName} numberOfLines={1}>{name}</Text>
              <Text style={[styles.podiumNet, { color: Number(r?.net_amount) >= 0 ? C.gn : C.rd }]}>
                {money(Number(r?.net_amount ?? 0))}
              </Text>
              <View style={[styles.podiumBar, { height: heights[pos - 1], backgroundColor: colors[pos - 1] }]}>
                <Text style={styles.podiumPos}>{pos}</Text>
              </View>
            </View>
          );
        })}
      </View>

      <Text style={styles.section}>FULL RESULTS</Text>
      <View style={styles.listCard}>
        {rows.map((r) => {
          const p = players.find((pl) => pl.id === r.player_id);
          return (
            <View key={r.id} style={styles.row}>
              <Text style={styles.pos}>{r.finish_position}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.rowName}>{p?.name ?? r.player_id.slice(0, 8)}</Text>
                <Text style={styles.rowMeta}>
                  {r.rebuys > 0 ? `${r.rebuys} re-buy · ` : ""}
                  {r.points_awarded} pts
                  {r.bust_level ? ` · out L${r.bust_level}` : ""}
                </Text>
              </View>
              <Text style={[styles.rowNet, { color: Number(r.net_amount) >= 0 ? C.gn : C.rd }]}>
                {money(Number(r.net_amount))}
              </Text>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.linen },
  hero: { backgroundColor: C.paper, borderBottomWidth: 1, borderBottomColor: C.line, paddingVertical: 20, paddingHorizontal: S.lg, alignItems: "center" },
  title: { ...f("extrabold"), fontSize: 19, color: C.ink, textTransform: "uppercase", textAlign: "center" },
  meta: { fontSize: 12, color: C.tx2, marginTop: 4 },
  podiumRow: { flexDirection: "row", alignItems: "flex-end", justifyContent: "center", gap: 14, paddingTop: 28 },
  podiumCol: { alignItems: "center", width: 92 },
  podiumName: { ...f("bold"), fontSize: 12.5, color: C.ink, maxWidth: 90 },
  podiumNet: { fontSize: 11, fontWeight: "800", marginVertical: 2, fontVariant: ["tabular-nums"] },
  podiumBar: { width: "100%", borderTopLeftRadius: 8, borderTopRightRadius: 8, alignItems: "center", justifyContent: "center" },
  podiumPos: { color: C.white, ...f("extrabold"), fontSize: 18 },
  section: { paddingHorizontal: S.lg, paddingTop: S.lg, paddingBottom: 8, ...f("extrabold"), fontSize: 13, letterSpacing: 1, color: C.tx2 },
  listCard: { backgroundColor: C.paper, borderWidth: 1, borderColor: C.line, borderRadius: R.lg, marginHorizontal: S.lg },
  row: { flexDirection: "row", alignItems: "center", gap: 11, padding: S.md, borderBottomWidth: 1, borderBottomColor: C.linen },
  pos: { ...f("extrabold"), width: 20, textAlign: "center", color: C.tx3 },
  rowName: { ...f("bold"), fontSize: 13.5, color: C.ink },
  rowMeta: { fontSize: 10.5, color: C.tx3, marginTop: 1, fontVariant: ["tabular-nums"] },
  rowNet: { ...f("extrabold"), fontSize: 14, fontVariant: ["tabular-nums"] },
  empty: { marginTop: 60, textAlign: "center", color: C.tx2 },
});
