// Poxera Clubs — list คลับใกล้ฉัน (card style ตาม Ref - List Club.png)
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Star, Clock, Navigation, Users } from "lucide-react-native";
import { C, R, S } from "@/theme/tokens";
import { f } from "@/theme/typography";
import { usePoxera } from "@/features/poxera-store";
import { Heart, HeartOff, ChevronRight } from "lucide-react-native";

function ClubCard({ id }: { id: string }) {
  const club = usePoxera((s) => s.clubs.find((c) => c.id === id))!;
  const toggleLike = usePoxera((s) => s.toggleLike);

  return (
    <View style={styles.card}>
      {/* cover */}
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
            <Text style={styles.pillText}>
              {club.rating.toFixed(1)} ({club.ratingCount})
            </Text>
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

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.logo}>POXERA</Text>
        <Text style={styles.subtitle}>คลับใกล้ฉัน</Text>
      </View>
      <FlatList
        data={clubs}
        keyExtractor={(c) => c.id}
        contentContainerStyle={{ paddingHorizontal: S.md, paddingBottom: S.xl * 2 }}
        renderItem={({ item }) => <ClubCard id={item.id} />}
      />
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
  card: {
    backgroundColor: C.paper,
    borderRadius: R.lg,
    marginBottom: S.md,
    borderWidth: 1,
    borderColor: C.line,
    overflow: "hidden",
  },
  cover: {
    height: 110,
    padding: S.lg,
    justifyContent: "space-between",
  },
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
  infoRow: {
    flexDirection: "row",
    padding: S.md,
    gap: S.md,
  },
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
});
