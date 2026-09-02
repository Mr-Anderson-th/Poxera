# Poxera — Process Log

## 2026-09-02 · Poxera v1 (rebrand + 5-tab app)

**Base:** ppch-mobile (Phases 1–4: clock, game-summary, review queue, points logic port, tokens v3 White Premium × Strava, Noto Sans Thai, 17 tests).

**New in Poxera:**
- Rebrand: name Poxera, scheme `poxera`, bundle `com.poxera.app` (iOS + Android เปลี่ยนชื่อตาม)
- Auth gate `app/_gate.tsx`: ไม่ login → `/auth`, ไม่ onboard → `/onboarding`
- `/auth`: email + Google (demo, ไม่ยิง API), validation inline
- `/onboarding`: 5 สไลด์แนะนำแท็บ (ข้ามได้)
- 5 แท็บใหม่: Feed · Clubs · Play · History · You (แทน Home/Stats/Rank/Me — ไฟล์เก่าเก็บเป็น .bak แล้วลบ)
- Feed (`index.tsx`): post card สไตล์ Strava, kudos toggle, comments (เพิ่มได้), suggested friends
- Clubs (`clubs.tsx` + `club/[id].tsx`): card ตาม Ref - List Club (cover/รีวิว/เวลา/แท็ก/buy-in), detail ตาม Ref - Club (hero, gallery placeholder, map placeholder, สิ่งอำนวยความสะดวก, CTA ขอเข้าร่วม → รออนุมัติ, ถูกใจ, โทร)
- Play (`play.tsx`): setup 2 ขั้น (คลับที่เป็นสมาชิก → เลือกเพื่อน ≥2 คน หรือ QR) → start bar, disabled จนครบ
- History (`history.tsx`): session list จาก Supabase (read-only) + filter ตามคลับ
- You (`you.tsx`): profile, stats grid, skill axes (computePlayerAxes จริง), privacy toggle (Switch), logout
- Game-summary: **Transfer Summary** — greedy net settling (คนติดลบ→คนบวก, minimal transfers) + ปุ่ม Share (Share API)
- Store: `src/features/poxera-store.ts` (zustand — auth/onboarding/clubs/feed mock)

**UX compliance (ui-ux-pro-max pro-rules):** 56 accessibilityRole/Label, touch targets ≥44pt, pressed feedback ทุกปุ่ม, safe-area ครบ (tab bar, bottom CTA bars), ไม่ใช้ emoji เป็น icon (lucide-react-native ทั้งหมด), semantic tokens จาก theme/tokens, ไม่ hardcode สีนอก tokens

**Hard gates ยังไม่แตะ:** Supabase write · MMR algorithm · iOS EAS build

**Verified:** tsc 0 error · vitest 17/17 · expo export web ✓

**Run:** `cd D:\Code_SavvyApp\Poxera && npm start`
