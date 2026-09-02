// Poxera game setup — ค่าจากหน้า Play ก่อนเข้า clock (ผู้เล่นที่เลือก + settings แบบเว็บหลัก)
import { create } from "zustand";
import { PAYOUT_PRESETS } from "@/lib/poker";

export type GameSetup = {
  clubId: string | null; // null = ไม่ผูกคลับ
  clubName: string | null;
  playerNames: { id: string; name: string }[];
  buyIn: number;
  rebuyAmount: number;
  levelMinutes: number;
  startSb: number;
  startBb: number;
  multiplier: number;
  blindMode: "wsop" | "hyper" | "custom";
  payoutStructureName: string;
  payoutStructure: number[];
  customPayout: string; // "60,30,10" — ผู้ใช้กรอกเอง
};

type SetupState = GameSetup & {
  setSetup: (patch: Partial<GameSetup>) => void;
  setPayoutPreset: (name: string) => void;
  reset: () => void;
};

const DEFAULTS: GameSetup = {
  clubId: null,
  clubName: null,
  playerNames: [],
  buyIn: 100,
  rebuyAmount: 100,
  levelMinutes: 15,
  startSb: 25,
  startBb: 50,
  multiplier: 1.5,
  blindMode: "custom",
  payoutStructureName: "50 / 30 / 20",
  payoutStructure: PAYOUT_PRESETS["50 / 30 / 20"],
  customPayout: "",
};

export const useGameSetup = create<SetupState>((set) => ({
  ...DEFAULTS,
  setSetup: (patch) => set(patch),
  setPayoutPreset: (name) =>
    set({ payoutStructureName: name, payoutStructure: PAYOUT_PRESETS[name] ?? PAYOUT_PRESETS["50 / 30 / 20"] }),
  reset: () => set({ ...DEFAULTS }),
}));
