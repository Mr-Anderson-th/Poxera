export type RankDef = {
  key: string;
  label: string;
  minMmr: number;
  minGames: number;
};

/** ตาราง Poker Rank ตาม MMR_RANKING_AGENT_HANDOFF (spec ฉบับอนุมัติ) */
export const RANKS: RankDef[] = [
  { key: "high-card", label: "High Card", minMmr: 0, minGames: 5 },
  { key: "one-pair", label: "One Pair", minMmr: 1400, minGames: 5 },
  { key: "two-pair", label: "Two Pair", minMmr: 1450, minGames: 5 },
  { key: "three-of-a-kind", label: "Three of a Kind", minMmr: 1475, minGames: 5 },
  { key: "straight", label: "Straight", minMmr: 1500, minGames: 5 },
  { key: "flush", label: "Flush", minMmr: 1525, minGames: 7 },
  { key: "full-house", label: "Full House", minMmr: 1550, minGames: 10 },
  { key: "four-of-a-kind", label: "Four of a Kind", minMmr: 1575, minGames: 10 },
  { key: "straight-flush", label: "Straight Flush", minMmr: 1600, minGames: 15 },
  { key: "royal-flush", label: "Royal Flush", minMmr: 1700, minGames: 20 },
];

export const UNRANKED_KEY = "unranked";

export type RankStatus = {
  rankKey: string;
  label: string;
  status: "unranked" | "provisional" | "ranked";
  nextRank: RankDef | null;
  progressToNext: number; // 0..1
};

/**
 * แปลง MMR (full precision) + จำนวนเกมอนุมัติ → Poker Rank ที่แสดงผลได้
 * กติกา: ถ้ายังไม่ครบ minGames ของ band ปัจจุบัน ให้แสดง band สูงสุดที่ปลดล็อกแล้ว
 * (display rounded, คำนวณด้วย full precision — ตาม handoff)
 */
export function resolveRank(mmr: number, approvedGames: number): RankStatus {
  if (approvedGames <= 0) {
    return { rankKey: UNRANKED_KEY, label: "UNRANKED", status: "unranked", nextRank: RANKS[0], progressToNext: 0 };
  }
  if (approvedGames < 5) {
    return {
      rankKey: UNRANKED_KEY,
      label: "PROVISIONAL",
      status: "provisional",
      nextRank: RANKS[0],
      progressToNext: Math.min(1, approvedGames / 5),
    };
  }

  // band สูงสุดที่ MMR ถึง
  let reached = RANKS[0];
  for (const r of RANKS) if (mmr >= r.minMmr) reached = r;

  // ปลดล็อก = band สูงสุดที่ MMR ถึง "และ" เกมครบ
  let unlocked = RANKS[0];
  for (const r of RANKS) if (mmr >= r.minMmr && approvedGames >= r.minGames) unlocked = r;

  const next = RANKS[Math.min(RANKS.length - 1, RANKS.indexOf(unlocked) + 1)];
  const span = Math.max(1, next.minMmr - unlocked.minMmr);
  const progress = next.minMmr > unlocked.minMmr ? Math.min(1, Math.max(0, (mmr - unlocked.minMmr) / span)) : 0;

  return { rankKey: unlocked.key, label: unlocked.label, status: "ranked", nextRank: next, progressToNext: progress };
}
