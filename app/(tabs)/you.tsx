// Poxera You — สถิติส่วนตัว + privacy toggle (แสดง/ซ่อนต่อคนอื่น)
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Eye, EyeOff, LogOut } from "lucide-react-native";
import { C, R, S } from "@/theme/tokens";
import { f } from "@/theme/typography";
import { usePoxera } from "@/features/poxera-store";
import { usePlayers, useRounds, useResults, useList, type RoundResult } from "@/lib/queries";
import { computePlayerAxes } from "@/lib/poker";

function Stat({ value, label, accent }: { value: string; label: string; accent?: boolean }) {
  return (
    <View style={styles.statCell}>
      <Text style={[styles.statVal, accent && { color: C.org }]}>{value}</Text>
      <Text style={styles.statLbl}>{label}</Text>
    </View>
  );
}

export default function YouScreen() {
  const userName = usePoxera((s) => s.userName);
  const email = usePoxera((s) => s.email);
  const privacyPublic = usePoxera((s) => s.privacyPublic);
  const setPrivacy = usePoxera((s) => s.setPrivacy);
  const { data: players } = useList(usePlayers());
  const { data: rounds } = useList(useRounds());
  const { data: results } = useList(useResults());

  // hero player = คนแรกในระบบ (demo) — ตอน integrate จริงจะใช้ auth user id
  const me = players[0];
  const myResults = results.filter((r: RoundResult) => me && r.player_id === me.id);
  const wins = myResults.filter((r: RoundResult) => r.finish_position === 1).length;
  const totalNet = myResults.reduce((s: number, r: RoundResult) => s + (r.net_amount ?? 0), 0);

  const axisRounds = rounds.map((round) => ({
    id: round.id,
    duration_seconds: round.duration_seconds ?? null,
    total_players: round.total_players ?? 0,
    total_pot: round.total_pot ?? 0,
  }));
  const axisResults = results.map((x: RoundResult) => ({
    round_id: x.round_id,
    player_id: x.player_id ?? "",
    finish_position: x.finish_position ?? 99,
    rebuys: x.rebuys ?? 0,
    bust_sb: x.bust_sb ?? null,
    bust_bb: x.bust_bb ?? null,
    bust_level: x.bust_level ?? null,
    bust_time_seconds: x.bust_time_seconds ?? null,
    rebuy_times: x.rebuy_times ?? [],
    payout: x.payout ?? 0,
    net_amount: x.net_amount ?? 0,
    points_awarded: x.points_awarded ?? 0,
  }));
  const axes = me ? computePlayerAxes(me.id, axisRounds, axisResults) : null;

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView contentContainerStyle={{ padding: S.lg, paddingBottom: S.xl * 3 }}>
        {/* profile header */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{(userName || "P").slice(0, 1)}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.profileName}>{userName || "ผู้เล่น"}</Text>
            <Text style={styles.profileEmail}>{email || "—"}</Text>
          </View>
        </View>

        {/* stats grid */}
        <View style={styles.grid}>
          <Stat value={String(myResults.length)} label="SESSIONS" />
          <Stat value={String(wins)} label="WINS" accent />
          <Stat
            value={`${totalNet >= 0 ? "+" : ""}฿${Math.round(totalNet).toLocaleString()}`}
            label="NET"
          />
        </View>

        {/* skill axes (demo) */}
        {axes ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Skill Profile</Text>
            <View style={styles.axisRow}>
              <Text style={styles.axisLbl}>Survival</Text>
              <View style={styles.axisTrack}>
                <View style={[styles.axisFill, { width: `${axes.survival * 10}%` }]} />
              </View>
            </View>
            <View style={styles.axisRow}>
              <Text style={styles.axisLbl}>Discipline</Text>
              <View style={styles.axisTrack}>
                <View style={[styles.axisFill, { width: `${axes.discipline * 10}%` }]} />
              </View>
            </View>
            <View style={styles.axisRow}>
              <Text style={styles.axisLbl}>Consistency</Text>
              <View style={styles.axisTrack}>
                <View style={[styles.axisFill, { width: `${axes.consistency * 10}%` }]} />
              </View>
            </View>
          </View>
        ) : null}

        {/* privacy */}
        <View style={styles.card}>
          <View style={styles.privacyRow}>
            <View style={{ flex: 1, paddingRight: S.md }}>
              <Text style={styles.cardTitle}>ให้คนอื่นเห็นสถิติของคุณ</Text>
              <Text style={styles.privacySub}>
                {privacyPublic
                  ? "เพื่อนใน Feed เห็นสถิติและผลการเล่นของคุณ"
                  : "สถิติของคุณถูกซ่อนจากผู้อื่น"}
              </Text>
            </View>
            {privacyPublic ? (
              <Eye size={18} color={C.org} strokeWidth={2} />
            ) : (
              <EyeOff size={18} color={C.tx3} strokeWidth={2} />
            )}
            <Switch
              value={privacyPublic}
              onValueChange={setPrivacy}
              trackColor={{ false: C.line2, true: C.org }}
              thumbColor={C.white}
              accessibilityLabel="เปิด/ปิดการแสดงสถิติต่อผู้อื่น"
            />
          </View>
        </View>

        <Pressable
          onPress={() => usePoxera.getState().logout()}
          style={({ pressed }) => [styles.logoutBtn, pressed && { opacity: 0.8 }]}
          accessibilityRole="button"
          accessibilityLabel="ออกจากระบบ"
        >
          <LogOut size={16} color={C.rd} strokeWidth={2} />
          <Text style={styles.logoutText}>ออกจากระบบ</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.linen },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: S.md,
    backgroundColor: C.paper,
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: R.lg,
    padding: S.lg,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: C.org,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { ...f("extrabold"), fontSize: 22, color: C.white },
  profileName: { ...f("extrabold"), fontSize: 17, color: C.ink },
  profileEmail: { ...f("regular"), fontSize: 12, color: C.tx3, marginTop: 2 },
  grid: { flexDirection: "row", gap: S.sm, marginTop: S.md },
  statCell: {
    flex: 1,
    backgroundColor: C.paper,
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: R.lg,
    alignItems: "center",
    paddingVertical: S.lg,
  },
  statVal: { ...f("extrabold"), fontSize: 19, color: C.ink, fontVariant: ["tabular-nums"] },
  statLbl: { ...f("semibold"), fontSize: 9.5, color: C.tx3, letterSpacing: 1, marginTop: 3 },
  card: {
    backgroundColor: C.paper,
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: R.lg,
    padding: S.lg,
    marginTop: S.md,
  },
  cardTitle: { ...f("bold"), fontSize: 14, color: C.ink },
  axisRow: { flexDirection: "row", alignItems: "center", gap: S.md, marginTop: S.md },
  axisLbl: { ...f("medium"), fontSize: 12, color: C.tx2, width: 86 },
  axisTrack: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    backgroundColor: C.linen,
    overflow: "hidden",
  },
  axisFill: { height: 8, borderRadius: 4, backgroundColor: C.org },
  privacyRow: { flexDirection: "row", alignItems: "center", gap: S.md },
  privacySub: { ...f("regular"), fontSize: 12, color: C.tx3, marginTop: 3, lineHeight: 18 },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: S.lg,
    paddingVertical: 13,
    borderRadius: R.md,
    borderWidth: 1,
    borderColor: C.rdSoft,
    backgroundColor: C.rdSoft,
    minHeight: 48,
  },
  logoutText: { ...f("bold"), fontSize: 14, color: C.rd },
});
