import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { C, S, R } from "@/theme/tokens";
import { f } from "@/theme/typography";
import { usePlayers, useResults, useRounds } from "@/lib/queries";
import { computePlayerAxes, hourlyRate } from "@/lib/poker";

const money = (n: number) => `฿${Math.round(n).toLocaleString()}`;

/** Player detail — analytics parity กับเว็บ /players/$id (axes radar data + hourly + trend) */
export default function PlayerDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: players = [] } = usePlayers();
  const { data: rounds = [] } = useRounds();
  const { data: results = [] } = useResults();

  const player = players.find((p) => p.id === id);
  const mine = results.filter((r) => r.player_id === id);

  if (!player) {
    return (
      <View style={styles.safe}>
        <Text style={styles.emptySmall}>ไม่พบผู้เล่น</Text>
      </View>
    );
  }

  const axes = computePlayerAxes(id, rounds, mine);
  const hr = hourlyRate(id, rounds, mine);
  const net = mine.reduce((a, r) => a + Number(r.net_amount), 0);
  const wins = mine.filter((r) => r.finish_position === 1).length;

  return (
    <ScrollView style={styles.safe} contentContainerStyle={{ paddingBottom: 60 }}>
      <View style={styles.hero}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{(player.name ?? "?").slice(0, 1)}</Text>
        </View>
        <Text style={styles.name}>{player.name}</Text>
        {player.nickname ? <Text style={styles.nick}>“{player.nickname}”</Text> : null}
      </View>

      <View style={styles.kpiRow}>
        <View style={styles.kpi}>
          <Text style={styles.kpiLabel}>NET</Text>
          <Text style={[styles.kpiValue, { color: net >= 0 ? C.gn : C.rd }]}>{money(net)}</Text>
        </View>
        <View style={styles.kpi}>
          <Text style={styles.kpiLabel}>SESSIONS</Text>
          <Text style={styles.kpiValue}>{mine.length}</Text>
        </View>
        <View style={styles.kpi}>
          <Text style={styles.kpiLabel}>WINS</Text>
          <Text style={styles.kpiValue}>{wins}</Text>
        </View>
      </View>

      <Text style={styles.section}>SKILL AXES (0–10)</Text>
      <View style={[styles.listCard, { padding: S.lg, gap: 10 }]}>
        {(
          [
            ["Survival", axes.survival],
            ["Discipline", axes.discipline],
            ["Cash Rate", axes.cashRate],
            ["Earning Power", axes.earningPower],
            ["Consistency", axes.consistency],
          ] as Array<[string, number]>
        ).map(([label, v]) => (
          <View key={label}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 4 }}>
              <Text style={styles.axisLabel}>{label}</Text>
              <Text style={styles.axisValue}>{v.toFixed(1)}</Text>
            </View>
            <View style={styles.barBg}>
              <View style={[styles.barFill, { width: `${(v / 10) * 100}%` }]} />
            </View>
          </View>
        ))}
      </View>

      <Text style={styles.section}>HOURLY RATE</Text>
      <View style={[styles.listCard, styles.pad]}>
        <Text style={styles.hrValue}>
          {money(hr.rate)}<Text style={styles.hrUnit}> /ชม.</Text>
        </Text>
        <Text style={styles.hrMeta}>
          {hr.hours.toFixed(1)} ชม. · net {money(hr.net)}
        </Text>
      </View>

      <Text style={styles.section}>SESSION HISTORY</Text>
      <View style={styles.listCard}>
        {mine.map((r) => {
          const round = rounds.find((rd) => rd.id === r.round_id);
          return (
            <View key={r.id} style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.rowName}>{round?.name ?? r.round_id.slice(0, 8)}</Text>
                <Text style={styles.rowMeta}>
                  {round ? new Date(round.played_at).toLocaleDateString("th-TH") : ""} · pos {r.finish_position}/
                  {round?.total_players ?? "?"}
                </Text>
              </View>
              <Text style={[styles.rowNet, { color: Number(r.net_amount) >= 0 ? C.gn : C.rd }]}>
                {money(Number(r.net_amount))}
              </Text>
            </View>
          );
        })}
        {mine.length === 0 ? <Text style={styles.emptySmall}>ยังไม่มี session</Text> : null}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.linen },
  hero: { backgroundColor: C.paper, borderBottomWidth: 1, borderBottomColor: C.line, alignItems: "center", paddingTop: 56, paddingBottom: 20 },
  avatar: { width: 64, height: 64, borderRadius: 32, backgroundColor: C.org, alignItems: "center", justifyContent: "center" },
  avatarText: { color: C.white, ...f("extrabold"), fontSize: 24 },
  name: { ...f("extrabold"), fontSize: 19, color: C.ink, marginTop: 8, textTransform: "uppercase" },
  nick: { fontSize: 12.5, color: C.tx3, marginTop: 2 },
  kpiRow: { flexDirection: "row", gap: 9, padding: S.lg },
  kpi: { flex: 1, backgroundColor: C.paper, borderWidth: 1, borderColor: C.line, borderRadius: R.md, padding: S.md, alignItems: "center" },
  kpiLabel: { fontSize: 9.5, letterSpacing: 1, color: C.tx3, fontWeight: "700" },
  kpiValue: { ...f("extrabold"), fontSize: 17, color: C.ink, marginTop: 3, fontVariant: ["tabular-nums"] },
  section: { paddingHorizontal: S.lg, paddingTop: S.sm, paddingBottom: 8, ...f("extrabold"), fontSize: 13, letterSpacing: 1, color: C.tx2 },
  listCard: { backgroundColor: C.paper, borderWidth: 1, borderColor: C.line, borderRadius: R.lg, marginHorizontal: S.lg },
  pad: { padding: S.lg },
  axisLabel: { fontSize: 12, color: C.tx2, fontWeight: "600" },
  axisValue: { fontSize: 12, color: C.ink, fontWeight: "800", fontVariant: ["tabular-nums"] },
  barBg: { height: 7, backgroundColor: C.linen, borderRadius: 99, borderWidth: 1, borderColor: C.line, overflow: "hidden" },
  barFill: { height: "100%", backgroundColor: C.org, borderRadius: 99 },
  hrValue: { ...f("extrabold"), fontSize: 24, color: C.ink, fontVariant: ["tabular-nums"] },
  hrUnit: { fontSize: 13, color: C.tx3 },
  hrMeta: { fontSize: 11.5, color: C.tx3, marginTop: 3 },
  row: { flexDirection: "row", alignItems: "center", padding: S.md, borderBottomWidth: 1, borderBottomColor: C.linen },
  rowName: { ...f("bold"), fontSize: 13, color: C.ink },
  rowMeta: { fontSize: 10.5, color: C.tx3, marginTop: 1, fontVariant: ["tabular-nums"] },
  rowNet: { ...f("extrabold"), fontSize: 14, fontVariant: ["tabular-nums"] },
  emptySmall: { padding: S.lg, color: C.tx3, textAlign: "center" },
});
