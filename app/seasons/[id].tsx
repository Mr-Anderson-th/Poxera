import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { C, S, R } from "@/theme/tokens";
import { f } from "@/theme/typography";
import { usePlayers, useRounds, useSeasonStandings } from "@/lib/queries";

const money = (n: number) => `฿${Math.round(n).toLocaleString()}`;

/** Season detail — parity กับเว็บ /seasons/$id (standings) */
export default function SeasonDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: standings = [] } = useSeasonStandings(id ?? null);
  const { data: players = [] } = usePlayers();
  const { data: rounds = [] } = useRounds();

  const seasonRounds = rounds.filter((r) => r.season_id === id);
  const rows = [...standings].sort((a, b) => b.total_points - a.total_points);

  return (
    <ScrollView style={styles.safe} contentContainerStyle={{ paddingBottom: 60 }}>
      <View style={styles.hero}>
        <Text style={styles.title}>{seasonRounds[0]?.season_id ? "SEASON" : "SEASON"}</Text>
        <Text style={styles.meta}>
          {seasonRounds.length} rounds · pot{" "}
          {money(seasonRounds.reduce((a, r) => a + Number(r.total_pot), 0))}
        </Text>
      </View>

      <Text style={styles.section}>STANDINGS</Text>
      <View style={styles.listCard}>
        {rows.map((s, i) => {
          const p = players.find((pl) => pl.id === s.player_id);
          return (
            <View key={s.id} style={styles.row}>
              <Text style={[styles.pos, i === 0 && { color: C.gold }, i === 1 && { color: "#8A8A92" }, i === 2 && { color: "#C07A35" }]}>
                {i + 1}
              </Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.rowName}>{p?.name ?? s.player_id.slice(0, 8)}</Text>
                <Text style={styles.rowMeta}>{s.rounds_played} rounds</Text>
              </View>
              <View style={{ alignItems: "flex-end" }}>
                <Text style={styles.pts}>{s.total_points} pts</Text>
                <Text style={[styles.netSmall, { color: Number(s.total_net) >= 0 ? C.gn : C.rd }]}>
                  {money(Number(s.total_net))}
                </Text>
              </View>
            </View>
          );
        })}
        {rows.length === 0 ? <Text style={styles.empty}>ยังไม่มี standings (ตารางว่าง)</Text> : null}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.linen },
  hero: { backgroundColor: C.paper, borderBottomWidth: 1, borderBottomColor: C.line, paddingVertical: 20, paddingHorizontal: S.lg, alignItems: "center" },
  title: { ...f("extrabold"), fontSize: 19, color: C.ink },
  meta: { fontSize: 12, color: C.tx2, marginTop: 4 },
  section: { paddingHorizontal: S.lg, paddingTop: S.lg, paddingBottom: 8, ...f("extrabold"), fontSize: 13, letterSpacing: 1, color: C.tx2 },
  listCard: { backgroundColor: C.paper, borderWidth: 1, borderColor: C.line, borderRadius: R.lg, marginHorizontal: S.lg },
  row: { flexDirection: "row", alignItems: "center", gap: 11, padding: S.md, borderBottomWidth: 1, borderBottomColor: C.linen },
  pos: { ...f("extrabold"), width: 20, textAlign: "center", color: C.tx3 },
  rowName: { ...f("bold"), fontSize: 13.5, color: C.ink },
  rowMeta: { fontSize: 10.5, color: C.tx3, marginTop: 1 },
  pts: { ...f("extrabold"), fontSize: 14, color: C.ink, fontVariant: ["tabular-nums"] },
  netSmall: { fontSize: 10.5, fontWeight: "700", fontVariant: ["tabular-nums"] },
  empty: { padding: S.lg, color: C.tx3, textAlign: "center" },
});
