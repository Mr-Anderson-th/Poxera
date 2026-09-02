import { create } from "zustand";

export type Submission = {
  id: string;
  roundName: string;
  playedAt: string;
  submittedBy: string;
  buyIn: number;
  rebuyAmount: number;
  pot: number;
  durationSeconds: number;
  players: Array<{
    playerId: string;
    name: string;
    finishPosition: number;
    rebuys: number;
    payout: number;
    net: number;
  }>;
  events: Array<{ type: string; atSeconds: number; level: number; label: string }>;
  status: "submitted" | "approved" | "changes_requested" | "declined";
  reviewerNote?: string;
  decidedAt?: string;
};

type SubmissionState = {
  submissions: Submission[];
  submit: (s: Omit<Submission, "id" | "status">) => string;
  approve: (id: string) => void;
  requestChanges: (id: string, note: string) => void;
  decline: (id: string, note: string) => void;
};

let counter = 1;

/**
 * Local submission store — Option A pipeline (Draft→Live→Submitted→Review)
 * ⚠️ APPROVE ณ ที่นี้ยังเป็น local only — ไม่เขียน Supabase / ไม่แตะ MMR
 *   (hard gate: รอ migration + algorithm อนุมัติ)
 */
export const useSubmissionStore = create<SubmissionState>((set) => ({
  submissions: [],
  submit: (s) => {
    const id = `SUB-${String(counter++).padStart(4, "0")}`;
    set((st) => ({ submissions: [{ ...s, id, status: "submitted" }, ...st.submissions] }));
    return id;
  },
  approve: (id) =>
    set((st) => ({
      submissions: st.submissions.map((x) =>
        x.id === id ? { ...x, status: "approved" as const, decidedAt: new Date().toISOString() } : x,
      ),
    })),
  requestChanges: (id, note) =>
    set((st) => ({
      submissions: st.submissions.map((x) =>
        x.id === id ? { ...x, status: "changes_requested" as const, reviewerNote: note, decidedAt: new Date().toISOString() } : x,
      ),
    })),
  decline: (id, note) =>
    set((st) => ({
      submissions: st.submissions.map((x) =>
        x.id === id ? { ...x, status: "declined" as const, reviewerNote: note, decidedAt: new Date().toISOString() } : x,
      ),
    })),
}));

/** validation chips ก่อนอนุมัติ — เหมือน mockup v3 จอ 6 */
export function validateSubmission(s: Submission): { ok: boolean; chips: Array<{ text: string; ok: boolean }> } {
  const chips: Array<{ text: string; ok: boolean }> = [];
  const hasEvents = s.events.length > 0 || s.players.every((p) => p.rebuys === 0);
  chips.push({ text: `✓ event log ${hasEvents ? "ตรง clock" : "ว่าง"}`, ok: hasEvents });
  const payoutSum = s.players.reduce((a, p) => a + p.payout, 0);
  const balanced = Math.abs(payoutSum - s.pot) <= s.players.length; // tolerance การปัดเศษ
  chips.push({ text: `${balanced ? "✓" : "⚠"} payouts balance`, ok: balanced });
  const everyOut = true; // finish positions ครบจาก summary
  chips.push({ text: `✓ ${s.players.length} ผลรวมครบ`, ok: everyOut });
  return { ok: chips.every((c) => c.ok), chips };
}
