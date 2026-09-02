// Poxera Clubs — 3 ช่องทาง: สร้างคลับของตัวเอง · Join (รหัส/ชื่อ) · ค้นหาคลับใกล้ฉัน
import { useState } from "react";
import { FlatList, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import {
  Star, Clock, Navigation, Users, Plus, KeyRound, Search, Heart,
  ChevronRight, Check, X, Settings,
} from "lucide-react-native";
import { C, R, S } from "@/theme/tokens";
import { f } from "@/theme/typography";
import { usePoxera } from "@/features/poxera-store";

function ClubCard({ id }: { id: string }) {
  const club = usePoxera((s) => s.clubs.find((c) => c.id === id))!;
  const toggleLike = usePoxera((s) => s.toggleLike);

  return (
    <View style={styles.card}>
      <Pressable
        onPress={() => router.push(`/club/${club.id}`)}
        accessibilityRole="button"
        accessibilityLabel={`เปิดหน้าคลับ ${club.name}`}
        style={({ pressed }) => [styles.cover, { backgroundColor: club.color }, pressed && { opacity: 0.9 }]}
      >
        <Text style={styles.coverText}>{club.name}</Text>
        <View style={styles.coverRow}>
          <View style={styles.pill}>
            <Star size={11} color={C.gold} strokeWidth={2.5} fill={C.gold} />
            <Text style={styles.pillText}>{club.rating.toFixed(1)} ({club.ratingCount})</Text>
          </View>
          <View style={styles.pill}>
            <Clock size={11} color={C.white} strokeWidth={2.5} />
            <Text style={styles.pillText}>{club.openHour}</Text>
          </View>
        </View>
      </Pressable>

      <View style={styles.infoRow}>
        <View style={styles.metaCol}>
          <View style={styles.metaItem}>
            <Navigation size={12} color={C.tx3} strokeWidth={2} />
            <Text style={styles.metaText}>{club.distanceKm} กม.</Text>
          </View>
          <View style={styles.metaItem}>
            <Users size={12} color={C.tx3} strokeWidth={2} />
            <Text style={styles.metaText}>{club.memberCount} คน</Text>
          </View>
          <Text style={styles.buyIn}>฿{club.minBuyIn}+</Text>
        </View>
        <View style={styles.tagWrap}>
          {club.amenities.slice(0, 3).map((a) => (
            <View key={a} style={styles.tag}>
              <Text style={styles.tagText}>{a}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.cardActions}>
        <Pressable
          onPress={() => toggleLike(club.id)}
          style={({ pressed }) => [styles.likeBtn, pressed && { opacity: 0.7 }]}
          accessibilityRole="button"
          accessibilityLabel={club.liked ? `เลิกถูกใจ ${club.name}` : `ถูกใจ ${club.name}`}
          accessibilityState={{ selected: club.liked }}
        >
          {club.liked ? (
            <Heart size={16} color={C.rd} fill={C.rd} strokeWidth={2} />
          ) : (
            <Heart size={16} color={C.tx3} strokeWidth={2} />
          )}
        </Pressable>
        <Pressable
          onPress={() => router.push(`/club/${club.id}`)}
          style={({ pressed }) => [styles.openBtn, pressed && { opacity: 0.85 }]}
          accessibilityRole="button"
          accessibilityLabel={`ดูรายละเอียด ${club.name}`}
        >
          <Text style={styles.openText}>ดูรายละเอียด</Text>
          <ChevronRight size={14} color={C.white} strokeWidth={2.5} />
        </Pressable>
      </View>
    </View>
  );
}

export default function ClubsScreen() {
  const clubs = usePoxera((s) => s.clubs);
  const createClub = usePoxera((s) => s.createClub);
  const joinByCode = usePoxera((s) => s.joinByCode);

  const [mode, setMode] = useState<"browse" | "create" | "join">("browse");
  const [query, setQuery] = useState("");

  // create form
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newBuyIn, setNewBuyIn] = useState("");
  const [nameErr, setNameErr] = useState("");

  // join form
  const [code, setCode] = useState("");
  const [joinErr, setJoinErr] = useState("");
  const [joinOk, setJoinOk] = useState("");

  const filtered = clubs.filter(
    (c) =>
      query.trim() === "" ||
      c.name.toLowerCase().includes(query.trim().toLowerCase()) ||
      c.description.toLowerCase().includes(query.trim().toLowerCase()),
  );

  const onCreate = () => {
    if (newName.trim().length < 3) {
      setNameErr("ชื่อคลับต้องยาวอย่างน้อย 3 ตัวอักษร");
      return;
    }
    createClub(newName.trim(), newDesc.trim(), Number(newBuyIn) || 200);
    setNewName(""); setNewDesc(""); setNewBuyIn(""); setNameErr("");
    setMode("browse");
  };

  const onJoin = () => {
    const res = joinByCode(code.trim());
    if (res.ok) {
      setJoinOk(res.message); setJoinErr(""); setCode("");
      setTimeout(() => { setJoinOk(""); setMode("browse"); }, 1200);
    } else {
      setJoinErr(res.message); setJoinOk("");
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.logo}>POXERA</Text>
        <Text style={styles.subtitle}>Clubs</Text>
      </View>

      {/* segmented control: ค้นหา · สร้าง · Join */}
      <View style={styles.segmentRow}>
        {([
          { key: "browse", label: "ค้นหาคลับ", icon: Search },
          { key: "create", label: "สร้างคลับ", icon: Plus },
          { key: "join", label: "เข้าร่วม", icon: KeyRound },
        ] as const).map((t) => {
          const Icon = t.icon;
          return (
            <Pressable
              key={t.key}
              onPress={() => setMode(t.key)}
              style={({ pressed }) => [
                styles.segment,
                mode === t.key && styles.segmentActive,
                pressed && { opacity: 0.85 },
              ]}
              accessibilityRole="tab"
              accessibilityLabel={t.label}
              accessibilityState={{ selected: mode === t.key }}
            >
              <Icon size={15} color={mode === t.key ? C.white : C.tx2} strokeWidth={2.2} />
              <Text style={[styles.segmentText, mode === t.key && { color: C.white }]}>
                {t.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {mode === "browse" ? (
        <>
          <View style={styles.searchWrap}>
            <Search size={16} color={C.tx3} strokeWidth={2} />
            <TextInput
              style={styles.searchInput}
              value={query}
              onChangeText={setQuery}
              placeholder="ค้นหาชื่อคลับ…"
              placeholderTextColor={C.tx3}
              accessibilityLabel="ค้นหาคลับ"
            />
            {query ? (
              <Pressable onPress={() => setQuery("")} accessibilityRole="button" accessibilityLabel="ล้างคำค้นหา">
                <X size={15} color={C.tx3} strokeWidth={2.5} />
              </Pressable>
            ) : null}
          </View>
          <FlatList
            data={filtered}
            keyExtractor={(c) => c.id}
            contentContainerStyle={{ paddingHorizontal: S.md, paddingBottom: S.xl * 2 }}
            renderItem={({ item }) => <ClubCard id={item.id} />}
            ListEmptyComponent={
              <Text style={styles.empty}>ไม่พบคลับที่ค้นหา</Text>
            }
          />
        </>
      ) : null}

      {mode === "create" ? (
        <ScrollView contentContainerStyle={styles.formWrap} keyboardShouldPersistTaps="handled">
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>สร้างคลับของคุณ</Text>
            <Text style={styles.formNote}>
              คุณจะเป็นเจ้าของคลับ — จัดการข้อมูล รูป และสมาชิกได้ที่หน้าคลับ
            </Text>

            <Text style={styles.label}>ชื่อคลับ *</Text>
            <TextInput
              style={styles.input}
              value={newName}
              onChangeText={(t) => { setNewName(t); if (nameErr) setNameErr(""); }}
              placeholder="เช่น Friday Chip Leaders"
              placeholderTextColor={C.tx3}
              accessibilityLabel="ชื่อคลับ"
            />
            {nameErr ? <Text style={styles.err}>{nameErr}</Text> : null}

            <Text style={styles.label}>คำอธิบาย</Text>
            <TextInput
              style={[styles.input, styles.inputMulti]}
              value={newDesc}
              onChangeText={setNewDesc}
              placeholder="บรรยากาศ กติกา จุดเด่นของโต๊ะ…"
              placeholderTextColor={C.tx3}
              multiline
              accessibilityLabel="คำอธิบายคลับ"
            />

            <Text style={styles.label}>บายอินขั้นต่ำ (฿)</Text>
            <TextInput
              style={styles.input}
              value={newBuyIn}
              onChangeText={setNewBuyIn}
              placeholder="300"
              placeholderTextColor={C.tx3}
              keyboardType="number-pad"
              accessibilityLabel="บายอินขั้นต่ำ"
            />

            <Pressable
              onPress={onCreate}
              style={({ pressed }) => [styles.cta, pressed && { opacity: 0.85 }]}
              accessibilityRole="button"
              accessibilityLabel="สร้างคลับ"
            >
              <Plus size={16} color={C.white} strokeWidth={2.5} />
              <Text style={styles.ctaText}>สร้างคลับ</Text>
            </Pressable>
          </View>
        </ScrollView>
      ) : null}

      {mode === "join" ? (
        <ScrollView contentContainerStyle={styles.formWrap} keyboardShouldPersistTaps="handled">
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>เข้าร่วมคลับ</Text>
            <Text style={styles.formNote}>
              กรอกรหัสคลับ (6 ตัว) ที่เจ้าของคลับให้มา หรือค้นหาจากชื่อในแท็บ "ค้นหาคลับ"
            </Text>

            <Text style={styles.label}>รหัสคลับ</Text>
            <TextInput
              style={[styles.input, styles.codeInput]}
              value={code}
              onChangeText={(t) => { setCode(t.toUpperCase()); if (joinErr) setJoinErr(""); }}
              placeholder="ABC123"
              placeholderTextColor={C.tx3}
              autoCapitalize="characters"
              maxLength={6}
              accessibilityLabel="รหัสคลับ"
            />
            {joinErr ? <Text style={styles.err}>{joinErr}</Text> : null}
            {joinOk ? (
              <View style={styles.okRow}>
                <Check size={15} color={C.gn} strokeWidth={3} />
                <Text style={styles.okText}>{joinOk}</Text>
              </View>
            ) : null}

            <Pressable
              onPress={onJoin}
              style={({ pressed }) => [styles.cta, pressed && { opacity: 0.85 }]}
              accessibilityRole="button"
              accessibilityLabel="ส่งคำขอเข้าร่วม"
            >
              <KeyRound size={16} color={C.white} strokeWidth={2.5} />
              <Text style={styles.ctaText}>ส่งคำขอเข้าร่วม</Text>
            </Pressable>
          </View>
        </ScrollView>
      ) : null}
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
  segmentRow: {
    flexDirection: "row",
    gap: S.sm,
    paddingHorizontal: S.md,
    marginBottom: S.md,
  },
  segment: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: C.paper,
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: R.md,
    paddingVertical: 10,
    minHeight: 44,
  },
  segmentActive: { backgroundColor: C.ink, borderColor: C.ink },
  segmentText: { ...f("semibold"), fontSize: 12, color: C.tx2 },
  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: S.sm,
    backgroundColor: C.paper,
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: R.md,
    paddingHorizontal: S.md,
    marginHorizontal: S.md,
    marginBottom: S.md,
    minHeight: 44,
  },
  searchInput: { flex: 1, fontSize: 14, color: C.ink, paddingVertical: 10 },
  card: {
    backgroundColor: C.paper,
    borderRadius: R.lg,
    marginBottom: S.md,
    borderWidth: 1,
    borderColor: C.line,
    overflow: "hidden",
  },
  cover: { height: 110, padding: S.lg, justifyContent: "space-between" },
  coverText: { ...f("extrabold"), fontSize: 20, color: C.white, letterSpacing: 0.5 },
  coverRow: { flexDirection: "row", gap: S.sm },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(0,0,0,0.28)",
    borderRadius: 999,
    paddingHorizontal: S.sm + 2,
    paddingVertical: 4,
  },
  pillText: { ...f("semibold"), fontSize: 10, color: C.white },
  infoRow: { flexDirection: "row", padding: S.md, gap: S.md },
  metaCol: { width: 92, gap: 6 },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 5 },
  metaText: { ...f("regular"), fontSize: 11, color: C.tx2 },
  buyIn: { ...f("extrabold"), fontSize: 15, color: C.org },
  tagWrap: { flex: 1, flexDirection: "row", flexWrap: "wrap", gap: 6 },
  tag: {
    backgroundColor: C.linen,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: C.line,
  },
  tagText: { ...f("medium"), fontSize: 10, color: C.tx2 },
  cardActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: S.sm,
    paddingHorizontal: S.md,
    paddingBottom: S.md,
  },
  likeBtn: {
    width: 44,
    height: 44,
    borderRadius: R.md,
    backgroundColor: C.linen,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: C.line,
  },
  openBtn: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: C.ink,
    borderRadius: R.md,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    minHeight: 44,
  },
  openText: { ...f("bold"), fontSize: 13, color: C.white },
  formWrap: { padding: S.lg },
  formCard: {
    backgroundColor: C.paper,
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: R.lg,
    padding: S.lg,
  },
  formTitle: { ...f("extrabold"), fontSize: 17, color: C.ink },
  formNote: { ...f("regular"), fontSize: 12, color: C.tx2, marginTop: 5, lineHeight: 18, marginBottom: S.md },
  label: { ...f("semibold"), fontSize: 13, color: C.ink, marginTop: S.md, marginBottom: S.sm },
  input: {
    backgroundColor: C.linen,
    borderRadius: R.md,
    borderWidth: 1,
    borderColor: C.line,
    paddingHorizontal: S.md,
    fontSize: 14.5,
    color: C.ink,
    minHeight: 48,
  },
  inputMulti: { minHeight: 84, paddingTop: S.md, textAlignVertical: "top" },
  codeInput: { letterSpacing: 6, textAlign: "center", ...f("extrabold"), fontSize: 20 },
  err: { ...f("medium"), fontSize: 12, color: C.rd, marginTop: S.sm },
  okRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: S.sm },
  okText: { ...f("semibold"), fontSize: 12.5, color: C.gn },
  cta: {
    flexDirection: "row",
    backgroundColor: C.org,
    borderRadius: R.md,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    marginTop: S.lg,
    minHeight: 48,
  },
  ctaText: { ...f("bold"), fontSize: 15, color: C.white },
  empty: { ...f("medium"), fontSize: 13, color: C.tx3, textAlign: "center", marginTop: S.xl * 2 },
});
