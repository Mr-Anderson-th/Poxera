import { useEffect, useMemo, useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Line, Circle } from "react-native-svg";
import { ChevronLeft, ChevronRight, Pause, Play, Settings, Volume2, X } from "lucide-react-native";
import { router } from "expo-router";
import { C, R, S } from "@/theme/tokens";
import { f } from "@/theme/typography";
import { formatClock, useClockStore } from "@/features/clock/clock-store";
import { useGameSetup } from "@/features/game-setup-store";
import { buildBlindLevels } from "@/lib/poker";

const money = (n: number) => `฿${Math.round(n).toLocaleString()}`;

function Dial({ fraction }: { fraction: number }) {
  const ticks = useMemo(() => {
    const arr: { x1: number; y1: number; x2: number; y2: number; lit: boolean }[] = [];
    for (let i = 0; i < 60; i++) {
      const a = (i * 6 * Math.PI) / 180;
      const lit = i <= Math.round(fraction * 60);
      arr.push({
        x1: 140 + 126 * Math.cos(a),
        y1: 140 + 126 * Math.sin(a),
        x2: 140 + 138 * Math.cos(a),
        y2: 140 + 138 * Math.sin(a),
        lit,
      });
    }
    return arr;
  }, [fraction]);

  return (
    <Svg width={280} height={280} style={{ transform: [{ rotate: "-90deg" }] }}>
      {ticks.map((t, i) => (
        <Line
          key={i}
          x1={t.x1}
          y1={t.y1}
          x2={t.x2}
          y2={t.y2}
          stroke={t.lit ? C.org : "#2B2B31"}
          strokeWidth={7}
          strokeLinecap="round"
        />
      ))}
      <Circle cx={140} cy={140} r={118} fill="none" stroke="#1C1C22" strokeWidth={3} />
    </Svg>
  );
}

export default function ClockScreen() {
  const setup = useGameSetup();
  const store = useClockStore();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [koPickerFor, setKoPickerFor] = useState<string | null>(null);

  const started = store.blinds.length > 0;

  useEffect(() => {
    if (!started && setup.playerNames.length > 0) {
      store.start({
        playerNames: setup.playerNames,
        buyIn: setup.buyIn,
        rebuyAmount: setup.rebuyAmount,
        levelMinutes: setup.levelMinutes,
        startSb: setup.startSb,
        startBb: setup.startBb,
        multiplier: setup.multiplier,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [started, setup.playerNames.length]);

  useEffect(() => {
    const t = setInterval(() => useClockStore.getState().tick(), 1000);
    return () => clearInterval(t);
  }, []);

  const blind = store.blinds[store.levelIndex];
  const nextBlind = store.blinds[store.levelIndex + 1] ?? blind;
  const fraction = store.secondsLeft / (store.levelMinutes * 60);

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.topRow}>
          <Pressable accessibilityLabel="Exit clock" onPress={() => (router.canDismiss() ? router.back() : router.replace("/play"))} style={styles.exitBtn}>
            <ChevronLeft size={16} color="#8A8A92" strokeWidth={2} />
            <Text style={styles.exitText}>Exit</Text>
          </Pressable>
          <View style={styles.recBadge}>
            <Text style={styles.recText}>● LIVE · L{blind?.level ?? 1}</Text>
          </View>
        </View>

        <View style={styles.dialWrap}>
          <View style={styles.sideCircle}>
            <Text style={styles.sideLabel}>BLINDS</Text>
            <Text style={styles.sideValue}>{blind ? `${blind.sb}/${blind.bb}` : "—"}</Text>
            <Text style={styles.sideAnte}>{blind?.ante ? `Ante: ${blind.ante}` : "Ante: –"}</Text>
          </View>

          <View style={styles.dial}>
            <Dial fraction={fraction} />
            <View style={styles.dialCenter}>
              <Text style={styles.levelText}>LEVEL {blind?.level ?? 1}</Text>
              <Text style={styles.timer}>{formatClock(store.secondsLeft)}</Text>
              <Text style={styles.remainingText}>TIME REMAINING</Text>
            </View>
          </View>

          <View style={styles.sideCircle}>
            <Text style={styles.sideLabel}>NEXT BLINDS</Text>
            <Text style={styles.sideValue}>{nextBlind ? `${nextBlind.sb}/${nextBlind.bb}` : "—"}</Text>
            <Text style={styles.sideAnte}>{nextBlind?.ante ? `Ante: ${nextBlind.ante}` : "Ante: –"}</Text>
          </View>
        </View>

        <Text style={styles.subLine}>
          {money(store.pot())} pot · {store.activePlayers().length}/{store.players.length} players ·{" "}
          {store.events.filter((e) => e.type === "rebuy").length} re-buys
        </Text>

        <View style={styles.controls}>
          <Pressable style={styles.ctrlBtn}>
            <Volume2 size={16} color={C.org} strokeWidth={2} />
          </Pressable>
          <Pressable style={styles.ctrlBtn} onPress={store.prevLevel}>
            <ChevronLeft size={16} color={C.org} strokeWidth={2.5} />
          </Pressable>
          <Pressable style={styles.ctrlMain} onPress={store.togglePause}>
            {store.running ? (
              <Pause size={20} color={C.white} strokeWidth={2.5} />
            ) : (
              <Play size={20} color={C.white} strokeWidth={2.5} fill={C.white} />
            )}
          </Pressable>
          <Pressable style={styles.ctrlBtn} onPress={store.nextLevel}>
            <ChevronRight size={16} color={C.org} strokeWidth={2.5} />
          </Pressable>
          <Pressable style={styles.ctrlBtn} onPress={() => setDrawerOpen(true)}>
            <Settings size={16} color={C.org} strokeWidth={2} />
          </Pressable>
        </View>

        <Pressable style={styles.drawerHandle} onPress={() => setDrawerOpen(true)}>
          <Text style={styles.drawerHandleText}>▲ PLAYERS · RE-BUY / KNOCKOUT</Text>
        </Pressable>
        <Pressable style={styles.endBtn} onPress={() => router.push("/game-summary")}>
          <Text style={styles.endBtnText}>✓ END GAME &amp; SUMMARY</Text>
        </Pressable>
      </SafeAreaView>

      <Modal visible={drawerOpen} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setDrawerOpen(false)}>
        <SafeAreaView style={styles.drawerSafe}>
          <View style={styles.drawerHeader}>
            <Text style={styles.drawerTitle}>PLAYERS</Text>
            <Pressable accessibilityLabel="Close players" onPress={() => setDrawerOpen(false)}>
              <X size={20} color={C.tx2} strokeWidth={2} />
            </Pressable>
          </View>
          <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
            {store.players.map((p) => {
              const out = !!p.knockedOutBy;
              return (
                <View key={p.playerId} style={[styles.playerRow, out && { opacity: 0.45 }]}>
                  <View style={styles.pAv}>
                    <Text style={styles.pAvText}>{(p.name ?? "?").slice(0, 1)}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.pName}>{p.name}</Text>
                    <Text style={styles.pMeta}>
                      {p.buyIns > 1 ? `Buy-in + ${p.buyIns - 1} re-buy` : "Buy-in"}
                      {out ? ` · OUT L${p.outLevel}` : ""}
                    </Text>
                  </View>
                  {out ? (
                    <Text style={styles.outBadge}>OUT</Text>
                  ) : (
                    <>
                      <Pressable style={styles.rebuyBtn} onPress={() => store.rebuy(p.playerId)}>
                        <Text style={styles.rebuyText}>↻ RE-BUY</Text>
                      </Pressable>
                      <Pressable style={styles.koBtn} onPress={() => setKoPickerFor(p.playerId)}>
                        <Text style={styles.koText}>KO</Text>
                      </Pressable>
                    </>
                  )}
                </View>
              );
            })}
          </ScrollView>

          <Modal visible={koPickerFor !== null} transparent animationType="fade">
            <View style={styles.koOverlay}>
              <View style={styles.koSheet}>
                <Text style={styles.koTitle}>ใครกำจัด?</Text>
                {store
                  .activePlayers()
                  .filter((p) => p.playerId !== koPickerFor)
                  .map((p) => (
                    <Pressable
                      key={p.playerId}
                      style={styles.koOption}
                      onPress={() => {
                        if (koPickerFor) store.knockOut(koPickerFor, p.playerId);
                        setKoPickerFor(null);
                      }}
                    >
                      <Text style={styles.koOptionText}>{p.name}</Text>
                    </Pressable>
                  ))}
                <Pressable style={styles.koCancel} onPress={() => setKoPickerFor(null)}>
                  <Text style={styles.koCancelText}>ยกเลิก</Text>
                </Pressable>
              </View>
            </View>
          </Modal>
        </SafeAreaView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.coal },
  safe: { flex: 1, alignItems: "center" },
  topRow: { width: "100%", flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: S.lg, paddingTop: S.sm },
  exitBtn: { flexDirection: "row", alignItems: "center", gap: 4 },
  exitText: { color: "#8A8A92", fontSize: 12 },
  recBadge: { backgroundColor: C.rd, borderRadius: 4, paddingHorizontal: 9, paddingVertical: 3 },
  recText: { color: C.white, fontSize: 9, fontWeight: "800", letterSpacing: 1.2 },
  dialWrap: { flexDirection: "row", alignItems: "center", marginTop: 18 },
  dial: { position: "relative", width: 280, height: 280 },
  dialCenter: { position: "absolute", inset: 0, alignItems: "center", justifyContent: "center" },
  levelText: { ...f("extrabold"), color: C.white, fontSize: 24, letterSpacing: 2 },
  timer: { ...f("extrabold"), color: C.white, fontSize: 68, fontVariant: ["tabular-nums"], lineHeight: 76 },
  remainingText: { color: "#8A8A92", fontSize: 10, letterSpacing: 2.4, marginTop: 2 },
  sideCircle: { width: 100, height: 100, borderRadius: 50, borderWidth: 2, borderColor: "#26262C", alignItems: "center", justifyContent: "center", marginHorizontal: 6 },
  sideLabel: { color: "#8A8A92", fontSize: 8.5, letterSpacing: 1.4 },
  sideValue: { ...f("extrabold"), color: C.white, fontSize: 17, fontVariant: ["tabular-nums"], marginVertical: 2 },
  sideAnte: { color: "#8A8A92", fontSize: 9.5 },
  subLine: { color: "#8A8A92", fontSize: 11.5, marginTop: 10, fontVariant: ["tabular-nums"] },
  controls: { flexDirection: "row", alignItems: "center", gap: 14, marginTop: 18 },
  ctrlBtn: { width: 40, height: 40, borderRadius: 20, borderWidth: 1.5, borderColor: C.org, alignItems: "center", justifyContent: "center" },
  ctrlMain: { width: 56, height: 56, borderRadius: 28, backgroundColor: C.org, alignItems: "center", justifyContent: "center" },
  drawerHandle: { position: "absolute", bottom: 24, backgroundColor: C.coalS, borderRadius: R.md, paddingHorizontal: 18, paddingVertical: 10, borderWidth: 1, borderColor: "#2A2A30" },
  drawerHandleText: { color: "#C9C9CF", fontSize: 11, fontWeight: "800", letterSpacing: 1 },
  endBtn: { position: "absolute", bottom: 66, backgroundColor: C.gn, borderRadius: R.md, paddingHorizontal: 18, paddingVertical: 10 },
  endBtnText: { color: C.white, fontSize: 11, fontWeight: "800", letterSpacing: 1 },
  drawerSafe: { flex: 1, backgroundColor: "#161619" },
  drawerHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: S.lg, paddingVertical: 14 },
  drawerTitle: { ...f("extrabold"), color: C.white, fontSize: 16, letterSpacing: 1 },
  playerRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: S.lg, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "#202025" },
  pAv: { width: 30, height: 30, borderRadius: 15, backgroundColor: "#26262C", alignItems: "center", justifyContent: "center" },
  pAvText: { color: C.white, fontSize: 11, fontWeight: "700" },
  pName: { color: C.white, fontSize: 13.5, fontWeight: "600" },
  pMeta: { color: "#8A8A92", fontSize: 10.5, marginTop: 1 },
  outBadge: { color: "#8A8A92", fontSize: 9, fontWeight: "800", borderWidth: 1, borderColor: "#333", borderRadius: 6, paddingHorizontal: 8, paddingVertical: 5 },
  rebuyBtn: { borderWidth: 1.5, borderColor: C.blu, borderRadius: 6, paddingHorizontal: 10, paddingVertical: 6 },
  rebuyText: { color: "#8AB0FF", fontSize: 10, fontWeight: "800" },
  koBtn: { borderWidth: 1.5, borderColor: C.rd, borderRadius: 6, paddingHorizontal: 10, paddingVertical: 6 },
  koText: { color: "#FF8A8A", fontSize: 10, fontWeight: "800" },
  koOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,.6)", alignItems: "center", justifyContent: "center" },
  koSheet: { backgroundColor: "#1E1E23", borderRadius: R.lg, padding: S.xl, width: "80%" },
  koTitle: { color: C.white, ...f("bold"), fontSize: 15, marginBottom: 12 },
  koOption: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#2A2A30" },
  koOptionText: { color: C.white, fontSize: 14 },
  koCancel: { marginTop: 14, alignItems: "center" },
  koCancelText: { color: "#8A8A92", fontSize: 13 },
});
