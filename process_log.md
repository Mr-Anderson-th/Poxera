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


## 2026-09-02 · Feedback round 2
- club-manage ใหม่: รูปคลับบนสุด (placeholder) → รหัส+ข้อมูล → สมาชิกล่างสุด (กดเข้า /club-members/[id])
- club-members list: ชื่อ · ชม.เล่น · GAMES → กดไป /player/[id] (โชว์ตาม privacy — EyeOff icon)
- **NOTE (ยังไม่ทำ รอ user):** อัปโหลด/เปลี่ยนรูปคลับจริง — ต้องมี storage (Supabase Storage) ใส่ placeholder ไว้แล้ว


## 2026-09-02 · HANDOFF — สถานะปัจจุบัน + แผนต่อ (อ่านก่อนทำงานรอบใหม่)

### เสร็จแล้ว (บน GitHub ล่าสุด 4de0af6)
- 5 tabs: Feed(Strava-style post: header/ชื่อ/เวลา+สถานที่/title/สถิติ Players-Pot-Time-Achievements/แถบทอง achievement/รูปเลื่อนได้/kudos-comment-share)
- Clubs 3 โหมด (ค้นหา/สร้างได้รหัส 6 ตัว+เป็น owner/join รหัส), club detail, club-manage (รูปบนสุด→ข้อมูล→สมาชิกล่าง), club-members list → /player/[id] (privacy-aware)
- Play: club dropdown มี "ไม่มีคลับ", เพิ่ม-เล่นด้วยล่าสุด Messenger-style + search ทำงานจริง, SET screen (buy-in/re-buy 100 พิมพ์เอง, SB/BB แสดงทุกโหมด, blind modes Standard Tournament/Hyper Turbo/Custom พร้อมคำอธิบาย, เวลา 15 นาที step 5 min 5, payout presets มีคำแนะนำจำนวนคน + custom %), validation แดง+shake
- Clock: ใช้ game-setup store (เฉพาะผู้เล่นที่เลือก), KO confirm, transfer summary ยุบได้, END & SUBMIT → กลับหน้าหลัก
- Auth/onboarding gate (demo), router.back มี canDismiss ครบทุกหน้า
- UX: 56 a11y labels, touch ≥44pt, safe-area, ไม่ใช้ emoji เป็น icon
- Verify มาตรฐานทุกรอบ: tsc 0 / vitest 17/17 / expo export ✓

### สรุปประชุม design direction (2026-09-02)
- user ตัดสินใจ: ไม่รีดีไซน์ทั้งหมด — ใช้แนว Sports/Social (ต่อยอด v3 White Premium × Strava)
- อ้างอิง mockup: mockup-sports-social.html (3 จอ: Feed/Season/You+Radar) — user เห็นแล้ว OK
- หลักการ: คงขาว premium + ส้ม #FC5200 + Noto Sans Thai; เพิ่ม gold champion (CHAMP badge, achievement banner), stagger feed animation, tabular-nums; ไม่เอา 3D/WebGL
- ui-ux-pro-max skill ใช้ประจำ: query ก่อนทำหน้าใหม่ เช่น python scripts/search.py "leaderboard" --domain chart (cwd ต้องอยู่ที่ skill dir)

### GAP ANALYSIS vs เว็บหลัก (ppch-poker-tracking-main)
ขาดในแอพ (เว็บมี): Season system (seasons, season_standings), Radar chart เทียบ 5-6 แกน (PlayerRadar + compareAxes), Badge system (badges, player_badges), Admin CRUD, payout ปรับตอนจบเกม, TournamentResults podium
ไม่มีทั้งคู่ (โอกาสใหม่): clock sound, social layer จริง (mock แล้ว), push notification, QR join จริง, offline clock, season auto-rollover
DB ขาด: tables clubs/club_members/feed_posts/notifications + Storage bucket + Auth

### PHASE แผนต่อ
Phase A (ไม่ต้องอนุมัติ — ทำได้เลย): 1) Season screen อ่าน season_standings 2) Radar chart svg + compare 3) payout ปรับตอนจบเกม 4) clock sound (expo-audio) — ทำตาม mockup-sports-social.html
Phase B (hard gate — ต้อง proposal อนุมัติก่อน): Supabase migration auth+clubs+feed+storage → ต่อ Feed/Clubs จริง, enforce approver=club owner
Phase C: offline clock, QR join, push notification, season rollover

### HARD GATES (ยังคงใช้)
1. Supabase write — ต้อง user อนุมัติ migration ก่อน
2. MMR algorithm — ต้อง proposal + อนุมัติ (ตอนนี้ DEMO RATING)
3. iOS EAS build — ต้อง Apple Developer account

### Dev notes
- dev server: npm start (web port 8091) — web reload ระหว่าง dev จะ reset zustand state (เฉพาะ web)
- ทุก fix ผ่าน: tsc 0 / vitest 17/17 / export web ✓
