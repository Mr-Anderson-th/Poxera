// Poxera Feed — กิจกรรมเพื่อนแบบ Strava: kudos + comment + suggested friends
import { useMemo, useState } from "react";
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ThumbsUp, MessageCircle, UserPlus, Clock } from "lucide-react-native";
import { C, R, S } from "@/theme/tokens";
import { f } from "@/theme/typography";
import { usePoxera, type FeedPost } from "@/features/poxera-store";

function Avatar({ name, color, size = 40 }: { name: string; color: string; size?: number }) {
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

  return (
    <View style={styles.card}>
      <View style={styles.head}>
        <Avatar name={post.playerName} color={post.playerColor} />
        <View style={{ flex: 1, marginLeft: S.md }}>
          <Text style={styles.name}>{post.playerName}</Text>
          <View style={styles.metaRow}>
            <Clock size={11} color={C.tx3} strokeWidth={2} />
            <Text style={styles.meta}>
              {" "}
              {post.timeAgo} · {post.clubName}
            </Text>
          </View>
        </View>
        <View style={[styles.posChip, { backgroundColor: win ? C.goldSoft : C.linen }]}>
          <Text style={[styles.posText, { color: win ? C.gold : C.tx2 }]}>
            #{post.position}
          </Text>
        </View>
      </View>

      <Text style={styles.headline}>{post.headline}</Text>

      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={styles.statVal}>+{post.points}</Text>
          <Text style={styles.statLbl}>PTS</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statVal}>{post.entries}</Text>
          <Text style={styles.statLbl}>PLAYERS</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statVal}>฿{post.points * 30}</Text>
          <Text style={styles.statLbl}>PAYOUT</Text>
        </View>
      </View>

      <View style={styles.actions}>
        <Pressable
          onPress={() => toggleKudos(post.id)}
          style={({ pressed }) => [styles.actionBtn, pressed && { opacity: 0.7 }]}
          accessibilityRole="button"
          accessibilityLabel={`ให้ kudos โพสต์ของ ${post.playerName}`}
          accessibilityState={{ selected: post.kudosGiven }}
        >
          <ThumbsUp
            size={16}
            color={post.kudosGiven ? C.org : C.tx2}
            strokeWidth={2}
            fill={post.kudosGiven ? C.orgSoft : "transparent"}
          />
          <Text style={[styles.actionText, post.kudosGiven && { color: C.org }]}>
            {post.kudos}
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setShowInput(!showInput)}
          style={({ pressed }) => [styles.actionBtn, pressed && { opacity: 0.7 }]}
          accessibilityRole="button"
          accessibilityLabel={`คอมเมนต์โพสต์ของ ${post.playerName}`}
        >
          <MessageCircle size={16} color={C.tx2} strokeWidth={2} />
          <Text style={styles.actionText}>{post.comments.length}</Text>
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
  const suggested = useMemo(() => ["เม", "แจ็ค", "ปอนด์"], []);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.logo}>POXERA</Text>
        <Text style={styles.subtitle}>Feed</Text>
      </View>

      <View style={styles.suggestWrap}>
        <Text style={styles.suggestTitle}>แนะนำเพื่อน</Text>
        <View style={styles.suggestRow}>
          {suggested.map((n) => (
            <View key={n} style={styles.suggestChip}>
              <UserPlus size={13} color={C.tx2} strokeWidth={2} />
              <Text style={styles.suggestText}>{n}</Text>
            </View>
          ))}
        </View>
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
  suggestWrap: { paddingHorizontal: S.md, marginBottom: S.md },
  suggestTitle: { ...f("semibold"), fontSize: 12, color: C.tx3, marginBottom: S.sm },
  suggestRow: { flexDirection: "row", gap: S.sm },
  suggestChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: C.paper,
    borderColor: C.line,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: S.md,
    paddingVertical: 7,
  },
  suggestText: { ...f("medium"), fontSize: 12, color: C.tx2 },
  card: {
    backgroundColor: C.paper,
    borderRadius: R.lg,
    padding: S.lg,
    marginBottom: S.md,
    borderWidth: 1,
    borderColor: C.line,
  },
  head: { flexDirection: "row", alignItems: "center" },
  name: { ...f("bold"), fontSize: 14, color: C.ink },
  metaRow: { flexDirection: "row", alignItems: "center" },
  meta: { ...f("regular"), fontSize: 11, color: C.tx3 },
  posChip: {
    paddingHorizontal: S.sm + 2,
    paddingVertical: 4,
    borderRadius: R.sm,
  },
  posText: { ...f("extrabold"), fontSize: 13 },
  headline: {
    ...f("semibold"),
    fontSize: 15,
    color: C.ink,
    marginTop: S.md,
    lineHeight: 22,
  },
  statsRow: {
    flexDirection: "row",
    backgroundColor: C.linen,
    borderRadius: R.md,
    marginTop: S.md,
    paddingVertical: S.sm + 2,
  },
  stat: { flex: 1, alignItems: "center" },
  statVal: { ...f("extrabold"), fontSize: 16, color: C.ink, fontVariant: ["tabular-nums"] },
  statLbl: { ...f("medium"), fontSize: 9, color: C.tx3, letterSpacing: 1, marginTop: 1 },
  actions: { flexDirection: "row", gap: S.md, marginTop: S.md },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: S.md,
    paddingVertical: 8,
    borderRadius: R.md,
    backgroundColor: C.linen,
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
