// Poxera Feed — activity post สไตล์ Strava:
// avatar+username / เวลา·สถานที่ → title → สถิติ (PLAYERS/POT/TIME/ACHIEVEMENTS) → achievement banner → รูปเลื่อนได้ → kudos/comments
import { useState } from "react";
import {
  Dimensions,
  Share as RNShare,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { ThumbsUp, MessageCircle, Clock, Trophy, Share as ShareIcon } from "lucide-react-native";
import { C, R, S } from "@/theme/tokens";
import { f } from "@/theme/typography";
import { usePoxera, type FeedPost } from "@/features/poxera-store";

const SCREEN_W = Dimensions.get("window").width;
const PHOTO_W = SCREEN_W - S.lg * 2;
const PHOTO_H = 170;

function Avatar({ name, color, size = 44 }: { name: string; color: string; size?: number }) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color,
        alignItems: "center",
        justifyContent: "center",
      }}
      accessibilityElementsHidden
    >
      <Text style={{ ...f("bold"), fontSize: size * 0.4, color: C.white }}>{name.slice(0, 1)}</Text>
    </View>
  );
}

function PostCard({ post }: { post: FeedPost }) {
  const toggleKudos = usePoxera((s) => s.toggleKudos);
  const addComment = usePoxera((s) => s.addComment);
  const [showInput, setShowInput] = useState(false);
  const [draft, setDraft] = useState("");

  const win = post.position === 1;
  const hours = Math.floor(post.durationMins / 60);
  const mins = post.durationMins % 60;

  const sharePost = () => {
    const lines = [
      `${post.playerName} ${post.headline}`,
      `${post.entries} players · ฿${(post.points * 30).toLocaleString()} pot · ${hours}h ${mins}m`,
      "— จาก Poxera",
    ];
    RNShare.share({ message: lines.join("\n") }).catch(() => {});
  };

  return (
    <View style={styles.card}>
      {/* header: avatar + username / time · place */}
      <View style={styles.head}>
        <Pressable
          onPress={() => router.push(`/player/${post.playerId}`)}
          accessibilityRole="button"
          accessibilityLabel={`ดูโปรไฟล์ ${post.playerName}`}
        >
          <Avatar name={post.playerName} color={post.playerColor} />
        </Pressable>
        <View style={{ flex: 1, marginLeft: S.md }}>
          <View style={styles.nameRow}>
            <Pressable onPress={() => router.push(`/player/${post.playerId}`)}>
              <Text style={styles.name}>{post.playerName}</Text>
            </Pressable>
            {win ? (
              <View style={styles.proBadge}>
                <Text style={styles.proText}>CHAMP</Text>
              </View>
            ) : null}
          </View>
          <View style={styles.metaRow}>
            <Clock size={11} color={C.tx3} strokeWidth={2} />
            <Text style={styles.meta}>
              {" "}
              {post.timeAgo} · {post.clubName}
            </Text>
          </View>
        </View>
        <Text style={styles.menu}>•••</Text>
      </View>

      {/* title (highlight) */}
      <Text style={styles.title}>{post.headline}</Text>
      <Text style={styles.caption}>
        จบอันดับ #{post.position} จาก {post.entries} คน — +{post.points} แต้ม
      </Text>

      {/* race stats row */}
      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={styles.statLbl}>Players</Text>
          <Text style={styles.statVal}>{post.entries}</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statLbl}>Total Pot</Text>
          <Text style={styles.statVal}>฿{(post.points * 30).toLocaleString()}</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statLbl}>Time</Text>
          <Text style={styles.statVal}>
            {hours}h {mins}m
          </Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statLbl}>Achievements</Text>
          <View style={styles.achCell}>
            <Trophy size={15} color={C.gold} strokeWidth={2.2} fill={C.goldSoft} />
            <Text style={[styles.statVal, { color: C.gold, marginLeft: 4 }]}>{post.achievements}</Text>
          </View>
        </View>
      </View>

      {/* achievement banner */}
      {post.achievementText ? (
        <View style={styles.achBanner}>
          <Trophy size={20} color={C.gold} strokeWidth={2.2} fill={C.gold} />
          <Text style={styles.achText}>{post.achievementText}</Text>
        </View>
      ) : null}

      {/* swipeable photos */}
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        style={styles.photoScroller}
      >
        {post.photos.map((color, i) => (
          <View
            key={i}
            style={[styles.photo, { backgroundColor: color, width: PHOTO_W }]}
          >
            <Text style={styles.photoLabel}>รูป {i + 1}/{post.photos.length}</Text>
          </View>
        ))}
      </ScrollView>

      {/* kudos + comments counts */}
      <View style={styles.countsRow}>
        <Text style={styles.countText}>{post.kudos} gave kudos</Text>
        <Text style={styles.countText}>{post.comments.length} comments</Text>
      </View>

      {/* actions */}
      <View style={styles.actions}>
        <Pressable
          onPress={() => toggleKudos(post.id)}
          style={({ pressed }) => [styles.actionBtn, pressed && { opacity: 0.7 }]}
          accessibilityRole="button"
          accessibilityLabel={`ให้ kudos โพสต์ของ ${post.playerName}`}
          accessibilityState={{ selected: post.kudosGiven }}
        >
          <ThumbsUp
            size={17}
            color={post.kudosGiven ? C.org : C.tx2}
            strokeWidth={2}
            fill={post.kudosGiven ? C.orgSoft : "transparent"}
          />
          <Text style={[styles.actionText, post.kudosGiven && { color: C.org }]}>Kudos</Text>
        </Pressable>
        <Pressable
          onPress={() => setShowInput(!showInput)}
          style={({ pressed }) => [styles.actionBtn, pressed && { opacity: 0.7 }]}
          accessibilityRole="button"
          accessibilityLabel={`คอมเมนต์โพสต์ของ ${post.playerName}`}
        >
          <MessageCircle size={17} color={C.tx2} strokeWidth={2} />
          <Text style={styles.actionText}>Comment</Text>
        </Pressable>
        <Pressable
          onPress={sharePost}
          style={({ pressed }) => [styles.actionBtn, pressed && { opacity: 0.7 }]}
          accessibilityRole="button"
          accessibilityLabel="แชร์โพสต์"
        >
          <ShareIcon size={16} color={C.tx2} strokeWidth={2} />
          <Text style={styles.actionText}>Share</Text>
        </Pressable>
      </View>

      {post.comments.map((c, i) => (
        <View key={i} style={styles.comment}>
          <Text style={styles.commentName}>{c.name}</Text>
          <Text style={styles.commentText}>{c.text}</Text>
        </View>
      ))}

      {showInput ? (
        <View style={styles.commentInputRow}>
          <TextInput
            style={styles.commentInput}
            value={draft}
            onChangeText={setDraft}
            placeholder="เขียนคอมเมนต์…"
            placeholderTextColor={C.tx3}
            onSubmitEditing={() => {
              if (draft.trim()) {
                addComment(post.id, draft.trim());
                setDraft("");
                setShowInput(false);
              }
            }}
          />
          <Pressable
            onPress={() => {
              if (draft.trim()) {
                addComment(post.id, draft.trim());
                setDraft("");
                setShowInput(false);
              }
            }}
            style={({ pressed }) => [styles.sendBtn, pressed && { opacity: 0.7 }]}
            accessibilityRole="button"
            accessibilityLabel="ส่งคอมเมนต์"
          >
            <Text style={styles.sendText}>ส่ง</Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

export default function FeedScreen() {
  const feed = usePoxera((s) => s.feed);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.logo}>POXERA</Text>
        <Text style={styles.subtitle}>Feed</Text>
      </View>

      <FlatList
        data={feed}
        keyExtractor={(p) => p.id}
        contentContainerStyle={{ paddingHorizontal: S.md, paddingBottom: S.xl * 2 }}
        renderItem={({ item }) => <PostCard post={item} />}
        ListEmptyComponent={
          <Text style={styles.empty}>ยังไม่มีกิจกรรม — เริ่มเกมแรกจากแท็บ Play</Text>
        }
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
    padding: S.lg,
    marginBottom: S.md,
    borderWidth: 1,
    borderColor: C.line,
  },
  head: { flexDirection: "row", alignItems: "center" },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 7 },
  name: { ...f("bold"), fontSize: 14.5, color: C.ink },
  proBadge: {
    backgroundColor: C.ink,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  proText: { ...f("extrabold"), fontSize: 8.5, color: C.white, letterSpacing: 0.5 },
  metaRow: { flexDirection: "row", alignItems: "center" },
  meta: { ...f("regular"), fontSize: 11.5, color: C.tx3 },
  menu: { ...f("extrabold"), fontSize: 14, color: C.tx3, letterSpacing: 2 },
  title: { ...f("extrabold"), fontSize: 17, color: C.ink, marginTop: S.md, lineHeight: 25 },
  caption: { ...f("regular"), fontSize: 13, color: C.tx2, marginTop: 4 },
  statsRow: {
    flexDirection: "row",
    marginTop: S.md,
    paddingTop: S.md,
    borderTopWidth: 1,
    borderTopColor: C.line,
  },
  stat: { flex: 1 },
  statLbl: { ...f("regular"), fontSize: 10, color: C.tx3 },
  statVal: { ...f("extrabold"), fontSize: 14.5, color: C.ink, marginTop: 2, fontVariant: ["tabular-nums"] },
  achCell: { flexDirection: "row", alignItems: "center", marginTop: 2 },
  achBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    backgroundColor: C.goldSoft,
    borderRadius: R.md,
    padding: S.md,
    marginTop: S.md,
  },
  achText: { ...f("semibold"), fontSize: 12.5, color: C.gold, flex: 1 },
  photoScroller: { marginTop: S.md, marginHorizontal: -S.lg },
  photo: {
    height: PHOTO_H,
    alignItems: "center",
    justifyContent: "flex-end",
    padding: S.md,
  },
  photoLabel: { ...f("medium"), fontSize: 10, color: "rgba(255,255,255,0.8)" },
  countsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: S.md,
  },
  countText: { ...f("regular"), fontSize: 11.5, color: C.tx3 },
  actions: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: S.sm,
    paddingTop: S.sm,
    borderTopWidth: 1,
    borderTopColor: C.line,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    paddingHorizontal: S.lg,
    paddingVertical: 10,
    borderRadius: R.md,
    minHeight: 44,
  },
  actionText: { ...f("semibold"), fontSize: 13, color: C.tx2 },
  comment: {
    backgroundColor: C.linen,
    borderRadius: R.md,
    paddingHorizontal: S.md,
    paddingVertical: S.sm + 2,
    marginTop: S.sm,
  },
  commentName: { ...f("bold"), fontSize: 12, color: C.ink },
  commentText: { ...f("regular"), fontSize: 13, color: C.tx2, marginTop: 2 },
  commentInputRow: { flexDirection: "row", gap: S.sm, marginTop: S.md },
  commentInput: {
    flex: 1,
    backgroundColor: C.linen,
    borderRadius: R.md,
    paddingHorizontal: S.md,
    fontSize: 14,
    color: C.ink,
    minHeight: 44,
  },
  sendBtn: {
    backgroundColor: C.org,
    borderRadius: R.md,
    paddingHorizontal: S.lg,
    justifyContent: "center",
    minHeight: 44,
  },
  sendText: { ...f("bold"), fontSize: 13, color: C.white },
  empty: { ...f("medium"), fontSize: 13, color: C.tx3, textAlign: "center", marginTop: S.xl * 2 },
});
