// Poxera Play — setup: club dropdown → เลือกผู้เล่น (แถว avatars "เล่นด้วยล่าสุด" แบบ Messenger + ช่องค้นหา) → clock
import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { QrCode, Check, ChevronDown, Search, X, UserPlus } from "lucide-react-native";
import { C, S, R } from "@/theme/tokens";
import { f } from "@/theme/typography";
import { usePoxera } from "@/features/poxera-store";

const ALL_FRIENDS = ["นน", "นาย", "ฮฮอล", "บอส", "เม", "แจ็ค", "ปอนด์", "กอล์ฟ", "เจมส์", "แพร"];
const RECENT = ["นน", "นาย", "ฮฮอล", "บอส", "เม"];
const AVATAR_COLORS = ["#FC5200", "#1D4ED8", "#15803D", "#B8912F", "#DC2626", "#7C3AED", "#0E7490", "#BE185D", "#4D7C0F", "#B45309"];
const colorOf = (name: string) => AVATAR_COLORS[ALL_FRIENDS.indexOf(name) % AVATAR_COLORS.length] ?? C.tx2;

function AvatarChip({
  name, selected, onPress,
}: { name: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.avItem, pressed && { opacity: 0.8 }]}
      accessibilityRole="button"
      accessibilityLabel={`เลือกผู้เล่น ${name}`}
      accessibilityState={{ selected }}
    >
      <View style={[styles.avRing, selected && styles.avRingActive]}>
        <View style={[styles.avCircle, { backgroundColor: colorOf(name) }]}>
          {selected ? (
            <Check size={18} color={C.white} strokeWidth={3} />
          ) : (
            <Text style={styles.avInitial}>{name.slice(0, 1)}</Text>
          )}
        </View>
      </View>
      <Text style={[styles.avName, selected && { color: C.org }]} numberOfLines={1}>
        {name}
      </Text>
    </Pressable>
  );
}

export default function PlayScreen() {
  const allClubs = usePoxera((s) => s.clubs);
  const myClubs = useMemo(() => allClubs.filter((c) => c.isMember), [allClubs]);
  const [clubId, setClubId] = useState<string | null>(null);
  const [dropOpen, setDropOpen] = useState(false);
  const [picked, setPicked] = useState<string[]>([]);
  const [query, setQuery] = useState("");

  const selectedClub = allClubs.find((c) => c.id === clubId);
  const searching = query.trim().length > 0;
  const searchResults = ALL_FRIENDS.filter(
    (n) => n.includes(query.trim()) && !picked.includes(n),
  );

  const toggle = (n: string) =>
    setPicked((p) => (p.includes(n) ? p.filter((x) => x !== n) : [...p, n]));

  const start = () => router.push("/clock");

  return (
    <SafeAreaView style={styles.screen} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.logo}>PLAY</Text>
        <Text style={styles.sub}>ตั้งค่าเกมแล้วเริ่มนาฬิกา</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: S.lg, paddingBottom: 130 }} keyboardShouldPersistTaps="handled">
        {/* 1 · club dropdown */}
        <Text style={styles.stepTitle}>1 · เลือกคลับ</Text>
        <Pressable
          onPress={() => setDropOpen(!dropOpen)}
          style={({ pressed }) => [styles.dropdown, pressed && { opacity: 0.85 }]}
          accessibilityRole="button"
          accessibilityLabel="เลือกคลับ"
          accessibilityState={{ expanded: dropOpen }}
        >
          <Text style={[styles.dropdownText, !selectedClub && { color: C.tx3 }]}>
            {selectedClub ? selectedClub.name : "เลือกคลับของคุณ"}
          </Text>
          <ChevronDown
            size={17}
            color={C.tx2}
            strokeWidth={2.5}
            style={dropOpen ? { transform: [{ rotate: "180deg" }] } : undefined}
          />
        </Pressable>
        {dropOpen ? (
          <View style={styles.dropList}>
            {myClubs.length === 0 ? (
              <Text style={styles.dropEmpty}>ยังไม่มีคลับ — สมัครจากแท็บ Clubs</Text>
            ) : (
              myClubs.map((c) => (
                <Pressable
                  key={c.id}
                  onPress={() => { setClubId(c.id); setDropOpen(false); }}
                  style={({ pressed }) => [
                   styles.dropItem, clubId === c.id && styles.dropItemActive, pressed && { opacity: 0.8 },
                  ]}
                  accessibilityRole="menuitem"
                  accessibilityLabel={`เลือกคลับ ${c.name}`}
                >
                  <View style={[styles.dropDot, { backgroundColor: c.color }]} />
                  <Text style={[styles.dropItemText, clubId === c.id && { color: C.org }]}>
                    {c.name}
                  </Text>
                  {clubId === c.id ? <Check size={15} color={C.org} strokeWidth={3} /> : null}
                </Pressable>
              ))
            )}
          </View>
        ) : null}

        {/* 2 · players — recent avatars (Messenger style) */}
        <Text style={styles.stepTitle}>เล่นด้วยล่าสุด · เลือกแล้ว {picked.length} คน</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.avRow}
        >
          {RECENT.map((n) => (
            <AvatarChip key={n} name={n} selected={picked.includes(n)} onPress={() => toggle(n)} />
          ))}
          {/* add-friend trigger scrolls to search */}
          <Pressable
            onPress={() => setQuery(" ")}
            style={({ pressed }) => [styles.avItem, pressed && { opacity: 0.8 }]}
            accessibilityRole="button"
            accessibilityLabel="ค้นหาผู้เล่นเพิ่ม"
          >
            <View style={styles.avRing}>
              <View style={[styles.avCircle, styles.avAdd]}>
                <UserPlus size={18} color={C.tx2} strokeWidth={2} />
              </View>
            </View>
            <Text style={styles.avName}>เพิ่ม</Text>
          </Pressable>
        </ScrollView>

        {/* search box */}
        <View style={styles.searchWrap}>
          <Search size={15} color={C.tx3} strokeWidth={2} />
          <TextInput
            style={styles.searchInput}
            value={query}
            onChangeText={setQuery}
            placeholder="ค้นหาชื่อผู้เล่น…"
            placeholderTextColor={C.tx3}
            accessibilityLabel="ค้นหาผู้เล่น"
          />
          {searching ? (
            <Pressable onPress={() => setQuery("")} accessibilityRole="button" accessibilityLabel="ล้างคำค้นหา">
              <X size={14} color={C.tx3} strokeWidth={2.5} />
            </Pressable>
          ) : null}
        </View>
        {searching ? (
          <View style={styles.searchResults}>
            {searchResults.length === 0 ? (
              <Text style={styles.dropEmpty}>ไม่พบผู้เล่น</Text>
            ) : (
              searchResults.map((n) => (
                <Pressable
                  key={n}
                  onPress={() => { toggle(n); setQuery(""); }}
                  style={({ pressed }) => [styles.resultRow, pressed && { opacity: 0.8 }]}
                  accessibilityRole="button"
                  accessibilityLabel={`เลือกผู้เล่น ${n}`}
                >
                  <View style={[styles.resultAvatar, { backgroundColor: colorOf(n) }]}>
                    <Text style={styles.avInitial}>{n.slice(0, 1)}</Text>
                  </View>
                  <Text style={styles.resultName}>{n}</Text>
                  <UserPlus size={15} color={C.org} strokeWidth={2.5} />
                </Pressable>
              ))
            )}
          </View>
        ) : null}

        {/* picked summary */}
        {picked.length > 0 ? (
          <View style={styles.pickedBox}>
            <Text style={styles.pickedText}>
              โต๊ะนี้: {picked.join(", ")} {selectedClub ? `· ที่ ${selectedClub.name}` : ""}
            </Text>
          </View>
        ) : null}

        <Pressable
          style={({ pressed }) => [styles.qrBtn, pressed && { opacity: 0.85 }]}
          accessibilityRole="button"
          accessibilityLabel="สแกน QR code เพื่อเชิญผู้เล่น"
        >
          <QrCode size={18} color={C.ink} strokeWidth={2} />
          <Text style={styles.qrText}>สแกน QR เพื่อเชิญเพื่อนเข้าโต๊ะ</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [styles.reviewCard, pressed && { opacity: 0.85 }]}
          onPress={() => router.push("/review")}
          accessibilityRole="button"
          accessibilityLabel="เปิดคิวตรวจสอบ session"
        >
          <View style={{ flex: 1 }}>
            <Text style={styles.reviewTitle}>REVIEW QUEUE</Text>
            <Text style={styles.reviewSub}>อนุมัติ session ที่ส่งเข้ามา (Host/Admin)</Text>
          </View>
        </Pressable>
      </ScrollView>

      {/* start bar */}
      <View style={styles.startBar}>
        <Pressable
          onPress={start}
          disabled={picked.length < 2}
          style={({ pressed }) => [
            styles.startBtn,
            picked.length < 2 && { backgroundColor: C.line2 },
            pressed && picked.length >= 2 && { opacity: 0.85 },
          ]}
          accessibilityRole="button"
          accessibilityLabel="เริ่มนาฬิกาทัวร์นาเมนต์"
          accessibilityState={{ disabled: picked.length < 2 }}
        >
          <Text style={styles.startText}>
            {picked.length < 2 ? "เลือกผู้เล่นอย่างน้อย 2 คน" : "START CLOCK"}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.linen },
  header: {
    backgroundColor: C.paper,
    paddingHorizontal: S.lg,
    paddingTop: S.lg,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: C.line,
  },
  logo: { ...f("extrabold"), fontSize: 19, color: C.ink, letterSpacing: 0.6 },
  sub: { ...f("regular"), fontSize: 12, color: C.tx3, marginTop: 2 },
  stepTitle: { ...f("bold"), fontSize: 13.5, color: C.ink, marginBottom: S.sm, marginTop: S.lg },
  dropdown: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: C.paper,
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: R.md,
    paddingHorizontal: S.md,
    minHeight: 48,
  },
  dropdownText: { ...f("semibold"), fontSize: 14.5, color: C.ink },
  dropList: {
    backgroundColor: C.paper,
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: R.md,
    marginTop: S.sm,
    overflow: "hidden",
  },
  dropItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    paddingHorizontal: S.md,
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: C.linen,
    minHeight: 44,
  },
  dropItemActive: { backgroundColor: C.orgSoft },
  dropItemText: { ...f("semibold"), fontSize: 13.5, color: C.tx2, flex: 1 },
  dropDot: { width: 10, height: 10, borderRadius: 5 },
  dropEmpty: { ...f("medium"), fontSize: 12.5, color: C.tx3, padding: S.md },
  avRow: { gap: S.lg, paddingRight: S.lg, paddingVertical: 4 },
  avItem: { alignItems: "center", width: 64 },
  avRing: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
  },
  avRingActive: { borderColor: C.org, borderStyle: "solid" },
  avCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
  },
  avAdd: { backgroundColor: C.paper, borderWidth: 1.5, borderColor: C.line2, borderStyle: "dashed" },
  avInitial: { ...f("bold"), fontSize: 20, color: C.white },
  avName: { ...f("medium"), fontSize: 11, color: C.tx2, marginTop: 5 },
  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: S.sm,
    backgroundColor: C.paper,
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: R.md,
    paddingHorizontal: S.md,
    marginTop: S.lg,
    minHeight: 44,
  },
  searchInput: { flex: 1, fontSize: 14, color: C.ink, paddingVertical: 10 },
  searchResults: {
    backgroundColor: C.paper,
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: R.md,
    marginTop: S.sm,
    overflow: "hidden",
  },
  resultRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: S.md,
    paddingHorizontal: S.md,
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: C.linen,
    minHeight: 48,
  },
  resultAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  resultName: { ...f("semibold"), fontSize: 14, color: C.ink, flex: 1 },
  pickedBox: {
    backgroundColor: C.orgSoft,
    borderRadius: R.md,
    paddingHorizontal: S.md,
    paddingVertical: 10,
    marginTop: S.md,
  },
  pickedText: { ...f("medium"), fontSize: 12.5, color: C.org },
  qrBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
    backgroundColor: C.paper,
    borderWidth: 1.5,
    borderColor: C.line2,
    borderStyle: "dashed",
    borderRadius: R.md,
    paddingVertical: 13,
    marginTop: S.lg,
    minHeight: 48,
  },
  qrText: { ...f("semibold"), fontSize: 13, color: C.ink },
  reviewCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.paper,
    borderWidth: 1,
    borderColor: C.line2,
    borderRadius: R.lg,
    padding: S.lg,
    marginTop: S.lg,
    minHeight: 48,
  },
  reviewTitle: { ...f("extrabold"), fontSize: 14, color: C.ink, letterSpacing: 0.5 },
  reviewSub: { ...f("regular"), fontSize: 12, color: C.tx2, marginTop: 3 },
  startBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    padding: S.md,
    paddingBottom: S.md + 10,
    backgroundColor: C.paper,
    borderTopWidth: 1,
    borderTopColor: C.line,
  },
  startBtn: {
    backgroundColor: C.org,
    borderRadius: R.md,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 50,
  },
  startText: { ...f("extrabold"), fontSize: 14.5, color: C.white, letterSpacing: 1 },
});
