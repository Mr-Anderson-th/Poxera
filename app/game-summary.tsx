import { useState } from "react";
import { Pressable, ScrollView, Share, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { C, S, R } from "@/theme/tokens";
import { f } from "@/theme/typography";
import { useClockStore } from "@/features/clock/clock-store";
import { useSubmissionStore } from "@/features/submission/submission-store";
import { useGameSetup } from "@/features/game-setup-store";
import { distributePot } from "@/lib/poker";
import { Share2 } from "lucide-react-native";

const money = (n: number) => `฿${Math.round(n).toLocaleString()}`;
const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

/** สรุปผลจบเกม — payout จาก distributePot (logic เดียวกับเว็บ) + submit เข้า review queue */
export default function GameSummaryScreen() {
  const clock = useClockStore();
  const submit = useSubmissionStore((s) => s.submit);
  const setup = useGameSetup();
  const [showTransfers, setShowTransfers] = useState(false); // ซ่อนไว้ กดค่อยแสดง

  if (clock.blinds.length === 0) {
    return (
      <SafeAreaView style={styles.safe}>
        <Text style={styles.emptyText}>ยังไม่มีเกมที่จบ — เริ่มเกมจากแท็บ Play</Text>
      </SafeAreaView>
    );
  }

  // finish position: คนที่ยังอยู่ = อันดับหน้า, คน out ถอยหลังตามเวลาที่ตกรอบ
  const outs = clock.players
    .filter((p) => p.knockedOutBy)
    .sort((a, b) => (b.outAtSeconds ?? 0) - (a.outAtSeconds ?? 0));
  const ordered = [...clock.activePlayers(), ...outs];

  const pot = clock.pot();
  // payout จากที่ user ตั้งใน SET (โครงสร้างเดียวกับเว็บหลัก) — ตัดให้พอดีจำนวนคนจ่าย
  const structure = setup.payoutStructure.slice(
    0,
    Math.min(setup.payoutStructure.length, Math.max(1, Math.ceil(ordered.length / 3))),
  );
  const payouts = distributePot(pot, structure);

  const rows = ordered.map((p, i) => {
    const payout = payouts[i] ?? 0;
    const spent = clock.buyIn + (p.buyIns - 1) * clock.rebuyAmount;
    return {
      playerId: p.playerId,
      name: p.name,
      finishPosition: i + 1,
      rebuys: p.buyIns - 1,
      payout,
      net: payout - spent,
    };
  });

  // settlements: greedy net settling — คนติดลบโอนให้คนบวก (minimal transfers)
  const debtors = rows.filter((r) => r.net < 0).map((r) => ({ name: r.name, amt: -r.net }));
  const creditors = rows.filter((r) => r.net > 0).map((r) => ({ name: r.name, amt: r.net }));
  const transfers: { from: string; to: string; amount: number }[] = [];
  let di = 0;
  let ci = 0;
  while (di < debtors.length && ci < creditors.length) {
    const pay = Math.min(debtors[di].amt, creditors[ci].amt);
    transfers.push({ from: debtors[di].name, to: creditors[ci].name, amount: pay });
    debtors[di].amt -= pay;
    creditors[ci].amt -= pay;
    if (debtors[di].amt === 0) di++;
    if (creditors[ci].amt === 0) ci++;
  }

  const shareTransfers = () => {
    const lines = [
      `Poxera — สรุปการโอนเงิน (${money(pot)})`,
      ...transfers.map((t) => `${t.from} → โอน ${money(t.amount)} → ${t.to}`),
    ];
    Share.share({ message: lines.join("\n") }).catch(() => {});
  };

  const onSubmit = () => {
    submit({
      roundName: `Live Game — ${new Date().toLocaleDateString("th-TH")}`,
      playedAt: new Date().toISOString(),
      submittedBy: "host",
      clubId: setup.clubId,
      clubName: setup.clubName,
      buyIn: clock.buyIn,
      rebuyAmount: clock.rebuyAmount,
      pot,
      durationSeconds: clock.elapsed,
      players: rows,
      events: clock.events.map((e) => ({
        type: e.type,
        atSeconds: e.atSeconds,
        level: e.level,
        label: `${e.type === "rebuy" ? "re-buy" : "KO"} L${e.level} @ ${Math.floor(e.atSeconds / 60)}:${String(e.atSeconds % 60).padStart(2, "0")}`,
      })),
    });
    useGameSetup.getState().reset();
    router.replace("/"); // กลับหน้าหลัก (Feed) — review อยู่ที่เจ้าของคลับ
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Pressable accessibilityLabel="Back" onPress={() => (router.canDismiss() ? router.back() : router.replace("/play"))}>
          <Text style={styles.backText}>‹ CLOCK</Text>
        </Pressable>
        <Text style={styles.logo}>GAME SUMMARY</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: S.lg, paddingBottom: 40 }}>
        <View style={styles.kpiRow}>
          <View style={styles.kpi}>
            <Text style={styles.kpiLabel}>POT</Text>
            <Text style={[styles.kpiValue, { color: C.org }]}>{money(pot)}</Text>
          </View>
          <View style={styles.kpi}>
            <Text style={styles.kpiLabel}>PLAYERS</Text>
            <Text style={styles.kpiValue}>{ordered.length}</Text>
          </View>
          <View style={styles.kpi}>
            <Text style={styles.kpiLabel}>DURATION</Text>
            <Text style={styles.kpiValue}>{fmt(clock.elapsed)}</Text>
          </View>
        </View>

        <Text style={styles.section}>
          FINAL STANDINGS · {setup.payoutStructureName}
          {setup.clubName ? ` · ${setup.clubName}` : ""}
        </Text>
        <View style={styles.listCard}>
          {rows.map((r) => (
            <View key={r.playerId} style={styles.row}>
              <Text style={[styles.pos, r.finishPosition === 1 && { color: C.gold }]}>{r.finishPosition}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{r.name}</Text>
                <Text style={styles.sub}>
                  payout {money(r.payout)} · spent {money(clock.buyIn + r.rebuys * clock.rebuyAmount)}
                  {r.rebuys > 0 ? ` (${r.rebuys} re-buy)` : ""}
                </Text>
              </View>
              <Text style={[styles.net, { color: r.net >= 0 ? C.gn : C.rd }]}>{money(r.net)}</Text>
            </View>
          ))}
        </View>

        <Text
          style={styles.submitBtn}
          onPress={onSubmit}
          accessibilityRole="button"
          accessibilityLabel="จบเกมและส่งอนุมัติ"
        >
          ✓ END &amp; SUBMIT FOR APPROVAL
        </Text>

        {/* Transfer summary — ซ่อนไว้ กดปุ่มค่อยแสดง */}
        {transfers.length > 0 ? (
          <View style={styles.transferCard}>
            <Pressable
              onPress={() => setShowTransfers(!showTransfers)}
              style={({ pressed }) => [styles.transferToggle, pressed && { opacity: 0.8 }]}
              accessibilityRole="button"
              accessibilityLabel="แสดงหรือซ่อนสรุปการโอนเงิน"
              accessibilityState={{ expanded: showTransfers }}
            >
              <Text style={styles.transferTitle}>สรุปการโอนเงิน ({transfers.length} รายการ)</Text>
              <Text style={styles.transferChevron}>{showTransfers ? "▾" : "▸"}</Text>
            </Pressable>
            {showTransfers ? (
              <>
                {transfers.map((t, i) => (
                  <View key={i} style={styles.transferRow}>
                    <Text style={styles.transferFrom}>{t.from}</Text>
                    <Text style={styles.transferArrow}>→ โอน {money(t.amount)} →</Text>
                    <Text style={styles.transferTo}>{t.to}</Text>
                  </View>
                ))}
                <Pressable
                  onPress={shareTransfers}
                  style={({ pressed }) => [styles.shareBtn, pressed && { opacity: 0.85 }]}
                  accessibilityRole="button"
                  accessibilityLabel="แชร์สรุปการโอนเงิน"
                >
                  <Share2 size={15} color={C.white} strokeWidth={2.5} />
                  <Text style={styles.shareText}>แชร์สรุปการโอน</Text>
                </Pressable>
              </>
            ) : null}
          </View>
        ) : null}

        <Text style={styles.note}>ส่งเข้า Review Queue — Host/Admin ต้องอนุมัติก่อนจึงจะถือเป็นผลทางการ</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.linen },
  header: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: S.lg, paddingVertical: 10 },
  backText: { color: C.tx2, fontSize: 12, fontWeight: "800", letterSpacing: 0.5 },
  logo: { ...f("extrabold"), fontSize: 17, color: C.ink, letterSpacing: 0.5 },
  kpiRow: { flexDirection: "row", gap: 9 },
  kpi: { flex: 1, backgroundColor: C.paper, borderWidth: 1, borderColor: C.line, borderRadius: R.md, padding: S.md, alignItems: "center" },
  kpiLabel: { fontSize: 9.5, letterSpacing: 1, color: C.tx3, fontWeight: "700" },
  kpiValue: { ...f("extrabold"), fontSize: 18, color: C.ink, marginTop: 3, fontVariant: ["tabular-nums"] },
  section: { ...f("extrabold"), fontSize: 13, letterSpacing: 1, color: C.tx2, marginVertical: S.md },
  listCard: { backgroundColor: C.paper, borderWidth: 1, borderColor: C.line, borderRadius: R.lg },
  row: { flexDirection: "row", alignItems: "center", gap: 11, padding: S.md, borderBottomWidth: 1, borderBottomColor: C.linen },
  pos: { ...f("extrabold"), width: 18, textAlign: "center", color: C.tx3, fontSize: 15 },
  name: { ...f("bold"), fontSize: 13.5, color: C.ink },
  sub: { fontSize: 10.5, color: C.tx3, marginTop: 1, fontVariant: ["tabular-nums"] },
  net: { ...f("extrabold"), fontSize: 14.5, fontVariant: ["tabular-nums"] },
  submitBtn: { backgroundColor: C.gn, color: C.white, textAlign: "center", fontWeight: "800", fontSize: 14, letterSpacing: 0.5, paddingVertical: 14, borderRadius: R.md, marginTop: S.lg, overflow: "hidden" },
  note: { fontSize: 11, color: C.tx3, textAlign: "center", marginTop: 8, lineHeight: 16 },
  emptyText: { marginTop: 60, textAlign: "center", color: C.tx2 },
  transferCard: {
    backgroundColor: C.paper,
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: R.lg,
    padding: S.lg,
    marginTop: S.lg,
  },
  transferToggle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 44,
  },
  transferChevron: { ...f("extrabold"), fontSize: 14, color: C.tx3 },
  transferTitle: { ...f("bold"), fontSize: 14, color: C.ink },
  transferRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 7,
    borderBottomWidth: 1,
    borderBottomColor: C.linen,
  },
  transferFrom: { ...f("bold"), fontSize: 13, color: C.rd, flex: 1 },
  transferArrow: { ...f("semibold"), fontSize: 12, color: C.tx2, fontVariant: ["tabular-nums"] },
  transferTo: { ...f("bold"), fontSize: 13, color: C.gn, flex: 1, textAlign: "right" },
  shareBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: C.ink,
    borderRadius: R.md,
    paddingVertical: 12,
    marginTop: S.md,
    minHeight: 44,
  },
  shareText: { ...f("bold"), fontSize: 13.5, color: C.white },
});
