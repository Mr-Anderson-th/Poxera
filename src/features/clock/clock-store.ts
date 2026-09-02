import { create } from "zustand";
import { buildBlindLevels } from "@/lib/poker";

export type ClockPlayer = {
  playerId: string;
  name: string;
  buyIns: number; // จำนวน buy-in (1 = initial)
  rebuyTimes: number[]; // elapsed seconds ของแต่ละ re-buy
  knockedOutBy: string | null; // playerId ของคนกำจัด
  outAtSeconds: number | null;
  outLevel: number | null;
};

export type ClockEvent =
  | { type: "rebuy"; playerId: string; atSeconds: number; level: number }
  | { type: "ko"; knockedOut: string; by: string; atSeconds: number; level: number };

type ClockState = {
  running: boolean;
  levelIndex: number;
  secondsLeft: number;
  levelMinutes: number;
  blinds: Array<{ level: number; sb: number; bb: number; ante: number }>;
  players: ClockPlayer[];
  events: ClockEvent[];
  buyIn: number;
  rebuyAmount: number;
  elapsed: number;
  // actions
  start: (opts: { playerNames: { id: string; name: string }[]; buyIn: number; rebuyAmount: number; levelMinutes: number; startSb: number; startBb: number; multiplier: number }) => void;
  tick: () => void;
  togglePause: () => void;
  nextLevel: () => void;
  prevLevel: () => void;
  rebuy: (playerId: string) => void;
  knockOut: (playerId: string, byPlayerId: string) => void;
  activePlayers: () => ClockPlayer[];
  pot: () => number;
};

export const useClockStore = create<ClockState>((set, get) => ({
  running: false,
  levelIndex: 0,
  secondsLeft: 0,
  levelMinutes: 15,
  blinds: [],
  players: [],
  events: [],
  buyIn: 500,
  rebuyAmount: 500,
  elapsed: 0,

  start: ({ playerNames, buyIn, rebuyAmount, levelMinutes, startSb, startBb, multiplier }) =>
    set({
      running: true,
      levelIndex: 0,
      secondsLeft: levelMinutes * 60,
      levelMinutes,
      blinds: buildBlindLevels(startSb, startBb, multiplier, 30, "custom"),
      players: playerNames.map((p) => ({
        playerId: p.id,
        name: p.name,
        buyIns: 1,
        rebuyTimes: [],
        knockedOutBy: null,
        outAtSeconds: null,
        outLevel: null,
      })),
      events: [],
      buyIn,
      rebuyAmount,
      elapsed: 0,
    }),

  tick: () => {
    const s = get();
    if (!s.running) return;
    if (s.secondsLeft <= 1) {
      const next = Math.min(s.blinds.length - 1, s.levelIndex + 1);
      set({ levelIndex: next, secondsLeft: s.levelMinutes * 60, elapsed: s.elapsed + 1 });
      return;
    }
    set({ secondsLeft: s.secondsLeft - 1, elapsed: s.elapsed + 1 });
  },

  togglePause: () => set((s) => ({ running: !s.running })),
  nextLevel: () =>
    set((s) => ({ levelIndex: Math.min(s.blinds.length - 1, s.levelIndex + 1), secondsLeft: s.levelMinutes * 60 })),
  prevLevel: () => set((s) => ({ levelIndex: Math.max(0, s.levelIndex - 1), secondsLeft: s.levelMinutes * 60 })),

  rebuy: (playerId) => {
    const s = get();
    if (s.players.find((p) => p.playerId === playerId)?.knockedOutBy) return;
    set({
      players: s.players.map((p) =>
        p.playerId === playerId
          ? { ...p, buyIns: p.buyIns + 1, rebuyTimes: [...p.rebuyTimes, s.elapsed] }
          : p,
      ),
      events: [...s.events, { type: "rebuy", playerId, atSeconds: s.elapsed, level: s.blinds[s.levelIndex]?.level ?? 1 }],
    });
  },

  knockOut: (playerId, byPlayerId) => {
    const s = get();
    const target = s.players.find((p) => p.playerId === playerId);
    if (!target || target.knockedOutBy) return;
    set({
      players: s.players.map((p) =>
        p.playerId === playerId ? { ...p, knockedOutBy: byPlayerId, outAtSeconds: s.elapsed, outLevel: s.blinds[s.levelIndex]?.level ?? 1 } : p,
      ),
      events: [...s.events, { type: "ko", knockedOut: playerId, by: byPlayerId, atSeconds: s.elapsed, level: s.blinds[s.levelIndex]?.level ?? 1 }],
    });
  },

  activePlayers: () => get().players.filter((p) => !p.knockedOutBy),
  pot: () => {
    const s = get();
    return s.players.reduce((sum, p) => sum + (p.buyIns === 1 ? s.buyIn : s.buyIn + p.buyIns * s.rebuyAmount - s.buyIn + s.rebuyAmount), 0);
  },
}));

export function formatClock(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const sec = totalSeconds % 60;
  return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}
