import { describe, expect, it } from "vitest";
import {
  buildBlindLevels,
  computePlayerAxes,
  distributePot,
  hourlyRate,
  pointsForFinish,
  roundChip,
} from "./poker";
import { RANKS, resolveRank } from "@/features/mmr/ranks";

describe("pointsForFinish", () => {
  it("1st = 100, 2nd = 75 with default system", () => {
    expect(pointsForFinish(1)).toBe(100);
    expect(pointsForFinish(2)).toBe(75);
  });
  it("beyond table = 0, invalid position = 0", () => {
    expect(pointsForFinish(11)).toBe(0);
    expect(pointsForFinish(0)).toBe(0);
  });
  it("custom system", () => {
    expect(pointsForFinish(1, [50])).toBe(50);
  });
});

describe("roundChip", () => {
  it("rounds up to chip step", () => {
    expect(roundChip(33)).toBe(50);
    expect(roundChip(50)).toBe(50);
    expect(roundChip(51, 100)).toBe(100);
  });
});

describe("buildBlindLevels", () => {
  it("custom mode multiplies each level", () => {
    const lv = buildBlindLevels(25, 50, 2, 4, "custom");
    expect(lv[0]).toMatchObject({ level: 1, sb: 25, bb: 50, ante: 0 });
    expect(lv[1].sb).toBe(50);
    expect(lv[2].sb).toBe(100);
    expect(lv[2].ante).toBe(0); // ante เริ่ม level 4
    expect(lv[3].ante).toBe(100); // ante = roundChip(sb/2) = roundChip(200/2)
  });
  it("hyper mode doubles", () => {
    const lv = buildBlindLevels(25, 50, 1.5, 2, "hyper");
    expect(lv[1].sb).toBe(50);
  });
  it("wsop mode scales from 25 base", () => {
    const lv = buildBlindLevels(25, 50, 1.5, 5, "wsop");
    expect(lv[0]).toMatchObject({ sb: 25, bb: 50 });
    expect(lv[2].ante).toBe(25);
    expect(lv[4]).toMatchObject({ sb: 150, bb: 300, ante: 50 });
  });
});

describe("distributePot", () => {
  it("50/30/20 of 10000", () => {
    expect(distributePot(10000, [50, 30, 20])).toEqual([5000, 3000, 2000]);
  });
  it("sums to pot for uneven split", () => {
    const out = distributePot(1000, [33, 33, 34]);
    expect(out.reduce((a, b) => a + b, 0)).toBe(1000);
  });
});

describe("resolveRank (MMR handoff spec)", () => {
  it("0 games = UNRANKED", () => {
    expect(resolveRank(1800, 0).status).toBe("unranked");
  });
  it("<5 games = PROVISIONAL regardless of MMR", () => {
    const r = resolveRank(1700, 3);
    expect(r.status).toBe("provisional");
  });
  it("band reached but min-games not met → show highest unlocked", () => {
    // 1560 MMR ถึง Full House (1550) แต่ต้องการ 10 เกม, มี 7 เกม → Flush (1525, minGames 7)
    const r = resolveRank(1560, 7);
    expect(r.rankKey).toBe("flush");
  });
  it("full house at 1562/12 games", () => {
    const r = resolveRank(1562, 12);
    expect(r.rankKey).toBe("full-house");
    expect(r.nextRank?.key).toBe("four-of-a-kind");
  });
  it("royal flush at 1700+ with 20 games", () => {
    const r = resolveRank(1720, 25);
    expect(r.rankKey).toBe("royal-flush");
    expect(r.nextRank?.key).toBe("royal-flush"); // rank สูงสุด — progress = full
  });
  it("rank table has 10 entries with handoff thresholds", () => {
    expect(RANKS.length).toBe(10);
    expect(RANKS[0]).toMatchObject({ key: "high-card", minMmr: 0, minGames: 5 });
    expect(RANKS[9]).toMatchObject({ key: "royal-flush", minMmr: 1700, minGames: 20 });
  });
});

describe("computePlayerAxes / hourlyRate", () => {
  const rounds = [
    { id: "r1", duration_seconds: 14400, total_players: 10, total_pot: 5000 },
    { id: "r2", duration_seconds: 10800, total_players: 8, total_pot: 4000 },
  ];
  const results = [
    { round_id: "r1", player_id: "p1", finish_position: 1, rebuys: 0, bust_sb: null, bust_bb: null, bust_level: null, bust_time_seconds: 14400, rebuy_times: [], payout: 2500, net_amount: 1500, points_awarded: 100 },
    { round_id: "r2", player_id: "p1", finish_position: 8, rebuys: 2, bust_sb: 100, bust_bb: 200, bust_level: 4, bust_time_seconds: 5400, rebuy_times: [3600, 4000], payout: 0, net_amount: -1500, points_awarded: 10 },
    { round_id: "r1", player_id: "p2", finish_position: 2, rebuys: 0, bust_sb: null, bust_bb: null, bust_level: null, bust_time_seconds: 13000, rebuy_times: [], payout: 1500, net_amount: 500, points_awarded: 75 },
  ];

  it("hourly rate uses bust time fallback", () => {
    const h = hourlyRate("p1", rounds, results);
    expect(h.hours).toBeCloseTo((14400 + 5400) / 3600);
    expect(h.net).toBe(0);
  });
  it("axes clamped 0..10 and cashRate = 0.5*10", () => {
    const ax = computePlayerAxes("p1", rounds, results);
    for (const v of Object.values(ax)) {
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThanOrEqual(10);
    }
    expect(ax.cashRate).toBeCloseTo(5);
  });
});
