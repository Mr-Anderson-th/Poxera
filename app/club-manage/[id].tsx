// Poxera Club Manage (owner only) — รูปบนสุด → ข้อมูลคลับ → สมาชิก (ล่างสุด, กดเข้า list)
// Note: การอัปโหลดรูปจริง = รอ storage (ดู process_log note)
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import {
  ChevronLeft, Check, KeyRound, Wallet, Clock, Copy, Users, ChevronRight, Plus,
} from "lucide-react-native";
import { C, R, S } from "@/theme/tokens";
import { f } from "@/theme/typography";
import { usePoxera } from "@/features/poxera-store";

export default function ClubManageScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const club = usePoxera((s) => s.clubs.find((c) => c.id === id));
  const updateClub = usePoxera((s) => s.updateClub);

  const [name, setName] = useState(club?.name ?? "");
  const [desc, setDesc] = useState(club?.description ?? "");
  const [buyIn, setBuyIn] = useState(String(club?.minBuyIn ?? ""));
  const [hours, setHours] = useState(club?.openHour ?? "");
  const [saved, setSaved] = useState(false);

  if (!club || !club.isOwner) {
    return (
      <SafeAreaView style={styles.safe}>
        <Text style={styles.notFound}>เฉพาะเจ้าของคลับเท่านั้น</Text>
      </SafeAreaView>
    );
  }

  const save = () => {
    updateClub(club.id, {
      name: name.trim() || club.name,
      description: desc.trim(),
      minBuyIn: Number(buyIn) || club.minBuyIn,
      openHour: hours.trim() || club.openHour,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <Pressable
          onPress={() => (router.canDismiss() ? router.back() : router.replace("/clubs"))}
          style={styles.backBtn}
          accessibilityRole="button"
          accessibilityLabel="ย้อนกลับ"
        >
          <ChevronLeft size={20} color={C.ink} strokeWidth={2.5} />
        </Pressable>
        <Text style={styles.title}>จัดการคลับ</Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: S.xl * 3 }}>
        {/* 1 · รูปคลับ (บนสุด) — อัปโหลดจริงรอ storage */}
        <View style={[styles.cover, { backgroundColor: club.color }]}>
          <Pressable
            style={styles.coverAdd}
            accessibilityRole="button"
            accessibilityLabel="เปลี่ยนรูปคลับ (เร็ว ๆ นี้)"
          >
            <Plus size={22} color="rgba(255,255,255,0.85)" strokeWidth={2} />
            <Text style={styles.coverAddText}>เปลี่ยนรูปคลับ — เร็ว ๆ นี้</Text>
          </Pressable>
        </View>

        <View style={{ padding: S.lg, gap: S.md }}>
          {/* 2 · รหัสเข้าร่วม */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>รหัสเข้าร่วม</Text>
            <View style={styles.codeRow}>
              <KeyRound size={16} color={C.org} strokeWidth={2.5} />
              <Text style={styles.code}>{club.joinCode}</Text>
              <Pressable
                onPress={() => {}}
                style={({ pressed }) => [styles.copyBtn, pressed && { opacity: 0.7 }]}
                accessibilityRole="button"
                accessibilityLabel="คัดลอกรหัส"
              >
                <Copy size={14} color={C.tx2} strokeWidth={2} />
              </Pressable>
            </View>
            <Text style={styles.hint}>ส่งรหัสนี้ให้เพื่อนเพื่อขอเข้าร่วมคลับ</Text>
          </View>

          {/* 3 · ข้อมูลคลับ */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>ข้อมูลคลับ</Text>

            <Text style={styles.label}>ชื่อคลับ</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              accessibilityLabel="ชื่อคลับ"
            />

            <Text style={styles.label}>คำอธิบาย</Text>
            <TextInput
              style={[styles.input, styles.inputMulti]}
              value={desc}
              onChangeText={setDesc}
              multiline
              accessibilityLabel="คำอธิบายคลับ"
            />

            <View style={styles.row2}>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>
                  <Wallet size={12} color={C.tx2} strokeWidth={2} /> บายอินขั้นต่ำ (฿)
                </Text>
                <TextInput
                  style={styles.input}
                  value={buyIn}
                  onChangeText={setBuyIn}
                  keyboardType="number-pad"
                  accessibilityLabel="บายอินขั้นต่ำ"
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>
                  <Clock size={12} color={C.tx2} strokeWidth={2} /> เวลาเปิด-ปิด
                </Text>
                <TextInput
                  style={styles.input}
                  value={hours}
                  onChangeText={setHours}
                  accessibilityLabel="เวลาเปิดปิด"
                />
              </View>
            </View>

            <Pressable
              onPress={save}
              style={({ pressed }) => [styles.saveBtn, pressed && { opacity: 0.85 }]}
              accessibilityRole="button"
              accessibilityLabel="บันทึกการแก้ไข"
            >
              {saved ? <Check size={16} color={C.white} strokeWidth={3} /> : null}
              <Text style={styles.saveText}>{saved ? "บันทึกแล้ว" : "บันทึกการแก้ไข"}</Text>
            </Pressable>
          </View>

          {/* 3 · สมาชิก (ล่างสุด) — กดเข้า list */}
          <Pressable
            onPress={() => router.push(`/club-members/${club.id}`)}
            style={({ pressed }) => [styles.card, styles.memberCard, pressed && { opacity: 0.85 }]}
            accessibilityRole="button"
            accessibilityLabel={`ดูรายชื่อสมาชิก ${club.memberCount} คน`}
          >
            <View style={styles.memberLeft}>
              <Users size={17} color={C.tx2} strokeWidth={2} />
              <View>
                <Text style={styles.cardTitle}>สมาชิกคลับ</Text>
                <Text style={styles.memberSub}>{club.memberCount} คน · ชื่อ, จำนวนเล่น, ชั่วโมงเล่น</Text>
              </View>
            </View>
            <ChevronRight size={18} color={C.line2} strokeWidth={2.5} />
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.linen },
  notFound: { ...f("medium"), fontSize: 14, color: C.tx2, textAlign: "center", marginTop: S.xl * 3 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: S.md,
    paddingVertical: S.sm,
    backgroundColor: C.paper,
    borderBottomWidth: 1,
    borderBottomColor: C.line,
  },
  backBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  title: { ...f("extrabold"), fontSize: 16, color: C.ink },
  cover: { height: 140, alignItems: "center", justifyContent: "center" },
  coverAdd: { alignItems: "center", gap: 6, padding: S.xl },
  coverAddText: { ...f("semibold"), fontSize: 12, color: "rgba(255,255,255,0.85)" },
  card: {
    backgroundColor: C.paper,
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: R.lg,
    padding: S.lg,
  },
  memberCard: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", minHeight: 68 },
  memberLeft: { flexDirection: "row", alignItems: "center", gap: 9, flex: 1 },
  memberSub: { ...f("regular"), fontSize: 11.5, color: C.tx3, marginTop: 2 },
  cardTitle: { ...f("bold"), fontSize: 14.5, color: C.ink },
  codeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: C.orgSoft,
    borderRadius: R.md,
    padding: S.md,
    marginTop: S.sm,
  },
  code: { ...f("extrabold"), fontSize: 22, letterSpacing: 6, color: C.org, flex: 1 },
  copyBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  hint: { ...f("regular"), fontSize: 11.5, color: C.tx3, marginTop: 8, lineHeight: 17 },
  label: { ...f("semibold"), fontSize: 12.5, color: C.ink, marginTop: S.md, marginBottom: S.sm },
  input: {
    backgroundColor: C.linen,
    borderRadius: R.md,
    borderWidth: 1,
    borderColor: C.line,
    paddingHorizontal: S.md,
    fontSize: 14,
    color: C.ink,
    minHeight: 46,
  },
  inputMulti: { minHeight: 76, paddingTop: S.md, textAlignVertical: "top" },
  row2: { flexDirection: "row", gap: S.sm },
  saveBtn: {
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
  saveText: { ...f("bold"), fontSize: 14.5, color: C.white },
});
