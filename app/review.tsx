import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChevronLeft } from "lucide-react-native";
import { router } from "expo-router";
import { C, S, R } from "@/theme/tokens";
import { f } from "@/theme/typography";
import { useSubmissionStore, validateSubmission } from "@/features/submission/submission-store";

const money = (n: number) => `฿${Math.round(n).toLocaleString()}`;

export default function ReviewScreen() {
  const { submissions, approve, requestChanges, decline } = useSubmissionStore();
  const pending = submissions.filter((s) => s.status === "submitted");
  const decided = submissions.filter((s) => s.status !== "submitted");

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <ChevronLeft size={22} color={C.ink} strokeWidth={2} onPress={() => router.back()} />
        <Text style={styles.logo}>REVIEW QUEUE</Text>
        <Text style={styles.badge}>{pending.length} PENDING</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: S.lg, paddingBottom: 60 }}>
        {pending.length === 0 ? (
          <Text style={styles.empty}>
            ยังไม่มี submission รออนุมัติ{"\n"}จบเกมจาก Live Clock แล้วกด END &amp; SUBMIT
          </Text>
        ) : (
          pending.map((s) => {
            const v = validateSubmission(s);
            return (
              <View key={s.id} style={styles.card}>
                <View style={styles.cardHead}>
                  <Text style={styles.cardTitle}>{s.roundName}</Text>
                  <Text style={styles.submittedTag}>SUBMITTED</Text>
                </View>
                <Text style={styles.metaLine}>
                  {s.players.length} players · pot {money(s.pot)} ·{" "}
                  {Math.round(s.durationSeconds / 60)} นาที
                </Text>
                <View style={styles.chipRow}>
                  {v.chips.map((c, i) => (
                    <Text key={i} style={[styles.chip, !c.ok && styles.chipBad]}>
                      {c.text}
                    </Text>
                  ))}
                </View>
                <View style={resultsPreview(s).length ? styles.podium : styles.podium}>
                  {resultsPreview(s)}
                </View>
                <View style={styles.btnRow}>
                  <Text
                    style={[styles.btn, styles.btnOk, !v.ok && { opacity: 0.4 }]}
                    onPress={() => v.ok && approve(s.id)}
                  >
                    ✓ APPROVE
                  </Text>
                  <Text
                    style={[styles.btn, styles.btnGhost]}
                    onPress={() => requestChanges(s.id, "โปรดตรวจ event log")}
                  >
                    ✎ CHANGES
                  </Text>
                  <Text style={[styles.btn, styles.btnDecline]} onPress={() => decline(s.id, "declined by reviewer")}>
                    ✕ DECLINE
                  </Text>
                </View>
                {!v.ok ? (
                  <Text style={styles.warnNote}>มี validation ไม่ผ่าน — ควร Request Changes ก่อน approve</Text>
                ) : null}
              </View>
            );
          })
        )}

        {decided.length > 0 ? (
          <>
            <Text style={styles.section}>RECENT DECISIONS</Text>
            {decided.map((s) => (
              <View key={s.id} style={[styles.card, { paddingVertical: 12 }]}>
                <View style={styles.cardHead}>
                  <Text style={styles.cardTitle}>{s.roundName}</Text>
                  <Text
                    style={[
                      styles.submittedTag,
                      s.status === "approved" && { color: C.gn },
                      s.status === "declined" && { color: C.rd },
                    ]}
                  >
                    {s.status.toUpperCase()}
                  </Text>
                </View>
              </View>
            ))}
          </>
        ) : null}

        <Text style={styles.noteLocal}>
          ⚠ Local review — การ approve ณ ที่นี้ยังไม่เขียน Supabase / ไม่คำนวณ MMR (รอ migration + algorithm)
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function resultsPreview(s: ReturnType<typeof useSubmissionStore.getState>["submissions"][number]) {
  return s.players.slice(0, 3).map((p) => (
    <View key={p.playerId} style={styles.podiumRow}>
      <Text style={styles.podiumPos}>{p.finishPosition}</Text>
      <Text style={styles.podiumName}>{p.name}</Text>
      <Text style={[styles.podiumNet, { color: p.net >= 0 ? C.gn : C.rd }]}>{money(p.net)}</Text>
    </View>
  ));
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.linen },
  header: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: S.lg, paddingTop: 8, paddingBottom: 14, backgroundColor: C.paper, borderBottomWidth: 1, borderBottomColor: C.line },
  logo: { ...f("extrabold"), fontSize: 17, color: C.ink, flex: 1, letterSpacing: 0.5 },
  badge: { fontSize: 10, fontWeight: "800", color: "#B45309", backgroundColor: "#FFF7E6", paddingHorizontal: 9, paddingVertical: 3, borderRadius: 4 },
  empty: { color: C.tx2, textAlign: "center", marginTop: 40, lineHeight: 22 },
  card: { backgroundColor: C.paper, borderWidth: 1, borderColor: C.line, borderRadius: R.lg, padding: S.lg, marginBottom: S.md },
  cardHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 },
  cardTitle: { ...f("bold"), fontSize: 14.5, color: C.ink, flex: 1 },
  submittedTag: { fontSize: 9, fontWeight: "800", letterSpacing: 1, color: C.org },
  metaLine: { fontSize: 12, color: C.tx2, fontVariant: ["tabular-nums"], lineHeight: 18 },
  chipRow: { flexDirection: "row", gap: 6, flexWrap: "wrap", marginVertical: 10 },
  chip: { fontSize: 10, fontWeight: "700", color: C.gn, backgroundColor: C.gnSoft, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4, overflow: "hidden" },
  chipBad: { color: C.rd, backgroundColor: C.rdSoft },
  podium: { borderTopWidth: 1, borderTopColor: C.linen, paddingTop: 8 },
  podiumRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 5 },
  podiumPos: { ...f("extrabold"), width: 16, textAlign: "center", color: C.gold },
  podiumName: { flex: 1, ...f("semibold"), fontSize: 13, color: C.ink },
  podiumNet: { ...f("bold"), fontSize: 13, fontVariant: ["tabular-nums"] },
  btnRow: { flexDirection: "row", gap: 8, marginTop: 12 },
  btn: { flex: 1, textAlign: "center", paddingVertical: 11, borderRadius: R.md, fontSize: 12, fontWeight: "800", overflow: "hidden" },
  btnOk: { backgroundColor: C.gn, color: C.white },
  btnGhost: { borderWidth: 1.5, borderColor: C.line2, color: C.tx2 },
  btnDecline: { borderWidth: 1.5, borderColor: "#F3C8C8", color: C.rd },
  warnNote: { fontSize: 11, color: C.rd, marginTop: 8 },
  section: { ...f("extrabold"), fontSize: 13, letterSpacing: 1, color: C.tx2, marginVertical: S.md },
  noteLocal: { fontSize: 11, color: C.tx3, lineHeight: 17, marginTop: 8 },
});
