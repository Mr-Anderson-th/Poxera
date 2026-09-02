// Poxera Club Detail — ตาม Ref - Club.png (hero, info, map placeholder, CTA, action row)
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import {
  ChevronLeft,
  Share2,
  Bell,
  Heart,
  Phone,
  Star,
  MapPin,
  Users,
  Clock,
  Wallet,
  Check,
  Hourglass,
} from "lucide-react-native";
import { C, R, S } from "@/theme/tokens";
import { f } from "@/theme/typography";
import { usePoxera } from "@/features/poxera-store";

export default function ClubDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const club = usePoxera((s) => s.clubs.find((c) => c.id === id));
  const requestJoin = usePoxera((s) => s.requestJoin);
  const toggleLike = usePoxera((s) => s.toggleLike);

  if (!club) {
    return (
      <SafeAreaView style={styles.safe}>
        <Text style={styles.notFound}>ไม่พบคลับนี้</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <ScrollView contentContainerStyle={{ paddingBottom: S.xl * 3 }}>
        {/* hero */}
        <View style={[styles.hero, { backgroundColor: club.color }]}>
          <View style={styles.heroTop}>
            <Pressable
              onPress={() => (router.canDismiss() ? router.back() : router.replace("/clubs"))}
              style={({ pressed }) => [styles.circleBtn, pressed && { opacity: 0.8 }]}
              accessibilityRole="button"
              accessibilityLabel="ย้อนกลับ"
            >
              <ChevronLeft size={20} color={C.white} strokeWidth={2.5} />
            </Pressable>
            <View style={{ flexDirection: "row", gap: S.sm }}>
              <Pressable
                style={({ pressed }) => [styles.circleBtn, pressed && { opacity: 0.8 }]}
                accessibilityRole="button"
                accessibilityLabel="แชร์คลับ"
              >
                <Share2 size={17} color={C.white} strokeWidth={2} />
              </Pressable>
              <Pressable
                style={({ pressed }) => [styles.circleBtn, pressed && { opacity: 0.8 }]}
                accessibilityRole="button"
                accessibilityLabel="แจ้งเตือนกิจกรรมคลับ"
              >
                <Bell size={17} color={C.white} strokeWidth={2} />
              </Pressable>
            </View>
          </View>
          <Text style={styles.heroTitle}>{club.name}</Text>
          <View style={styles.heroRow}>
            <Star size={13} color="#FFD166" strokeWidth={2.5} fill="#FFD166" />
            <Text style={styles.heroMeta}>
              {club.rating.toFixed(1)} ({club.ratingCount} รีวิว)
            </Text>
            <Clock size={13} color={C.white} strokeWidth={2.5} />
            <Text style={styles.heroMeta}> {club.openHour}</Text>
          </View>
        </View>

        <View style={{ padding: S.lg, gap: S.lg }}>
          {/* info rows */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>รายละเอียด</Text>
            <Text style={styles.desc}>{club.description}</Text>
            <View style={styles.factRow}>
              <Wallet size={14} color={C.org} strokeWidth={2} />
              <Text style={styles.factText}>บายอินขั้นต่ำ ฿{club.minBuyIn}</Text>
            </View>
            <View style={styles.factRow}>
              <Users size={14} color={C.tx2} strokeWidth={2} />
              <Text style={styles.factText}>สมาชิก {club.memberCount} คน</Text>
            </View>
            <View style={styles.factRow}>
              <MapPin size={14} color={C.tx2} strokeWidth={2} />
              <Text style={styles.factText}>ห่างจากคุณ {club.distanceKm} กม.</Text>
            </View>
          </View>

          {/* map placeholder */}
          <View style={styles.map}>
            <MapPin size={22} color={C.org} strokeWidth={2} />
            <Text style={styles.mapText}>แผนที่ (จะเชื่อม Google Maps ในเวอร์ชันถัดไป)</Text>
          </View>

          {/* amenities */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>สิ่งอำนวยความสะดวก</Text>
            <View style={styles.tagWrap}>
              {club.amenities.map((a) => (
                <View key={a} style={styles.tag}>
                  <Check size={11} color={C.gn} strokeWidth={3} />
                  <Text style={styles.tagText}>{a}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* bottom action bar — safe area aware */}
      <View style={styles.bottomBar}>
        <Pressable
          onPress={() => toggleLike(club.id)}
          style={({ pressed }) => [styles.barBtn, pressed && { opacity: 0.7 }]}
          accessibilityRole="button"
          accessibilityLabel={club.liked ? "เลิกถูกใจคลับ" : "ถูกใจคลับ"}
          accessibilityState={{ selected: club.liked }}
        >
          {club.liked ? (
            <Heart size={19} color={C.rd} fill={C.rd} strokeWidth={2} />
          ) : (
            <Heart size={19} color={C.tx2} strokeWidth={2} />
          )}
        </Pressable>
        <Pressable
          style={({ pressed }) => [styles.barBtn, pressed && { opacity: 0.7 }]}
          accessibilityRole="button"
          accessibilityLabel="โทรสอบถามคลับ"
        >
          <Phone size={18} color={C.tx2} strokeWidth={2} />
        </Pressable>
        {club.isMember ? (
          <View style={[styles.cta, { backgroundColor: C.gnSoft, borderWidth: 1, borderColor: C.gn }]}>
            <Check size={18} color={C.gn} strokeWidth={3} />
            <Text style={[styles.ctaText, { color: C.gn }]}>คุณเป็นสมาชิกแล้ว</Text>
          </View>
        ) : club.joinPending ? (
          <View style={[styles.cta, { backgroundColor: C.goldSoft, borderWidth: 1, borderColor: C.gold }]}>
            <Hourglass size={17} color={C.gold} strokeWidth={2.5} />
            <Text style={[styles.ctaText, { color: C.gold }]}>รอเจ้าของคลับอนุมัติ</Text>
          </View>
        ) : (
          <Pressable
            onPress={() => requestJoin(club.id)}
            style={({ pressed }) => [styles.cta, { backgroundColor: C.org }, pressed && { opacity: 0.85 }]}
            accessibilityRole="button"
            accessibilityLabel="ขอเข้าร่วมคลับ"
          >
            <Text style={[styles.ctaText, { color: C.white }]}>ขอเข้าร่วมคลับ</Text>
          </Pressable>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.linen },
  notFound: { ...f("medium"), fontSize: 14, color: C.tx2, textAlign: "center", marginTop: S.xl * 3 },
  hero: {
    height: 210,
    padding: S.lg,
    justifyContent: "space-between",
  },
  heroTop: { flexDirection: "row", justifyContent: "space-between" },
  circleBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.28)",
    alignItems: "center",
    justifyContent: "center",
  },
  heroTitle: { ...f("extrabold"), fontSize: 26, color: C.white },
  heroRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  heroMeta: { ...f("semibold"), fontSize: 12, color: C.white, marginRight: S.sm },
  section: {
    backgroundColor: C.paper,
    borderRadius: R.lg,
    borderWidth: 1,
    borderColor: C.line,
    padding: S.lg,
  },
  sectionTitle: { ...f("bold"), fontSize: 15, color: C.ink, marginBottom: S.sm },
  desc: { ...f("regular"), fontSize: 13.5, color: C.tx2, lineHeight: 21, marginBottom: S.md },
  factRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 7 },
  factText: { ...f("medium"), fontSize: 13, color: C.tx2 },
  map: {
    height: 110,
    borderRadius: R.lg,
    backgroundColor: C.paper,
    borderWidth: 1,
    borderColor: C.line,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  mapText: { ...f("medium"), fontSize: 11.5, color: C.tx3 },
  tagWrap: { flexDirection: "row", flexWrap: "wrap", gap: 7 },
  tag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: C.gnSoft,
    borderRadius: 999,
    paddingHorizontal: 11,
    paddingVertical: 6,
  },
  tagText: { ...f("medium"), fontSize: 11, color: C.gn },
  bottomBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: "row",
    gap: S.sm,
    padding: S.md,
    paddingBottom: S.md + 10,
    backgroundColor: C.paper,
    borderTopWidth: 1,
    borderTopColor: C.line,
  },
  barBtn: {
    width: 48,
    height: 48,
    borderRadius: R.md,
    backgroundColor: C.linen,
    borderWidth: 1,
    borderColor: C.line,
    alignItems: "center",
    justifyContent: "center",
  },
  cta: {
    flex: 1,
    flexDirection: "row",
    borderRadius: R.md,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    minHeight: 48,
  },
  ctaText: { ...f("bold"), fontSize: 14.5 },
});
