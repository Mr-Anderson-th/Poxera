// Poxera app state — auth, onboarding, clubs, feed (local demo layer)
// หมายเหตุ: Auth/Clubs/Feed ตอนนี้เป็น local demo (mock) — ไม่แตะ Supabase production
import { create } from "zustand";

export type ClubAmenity = string;

export type Club = {
  id: string;
  name: string;
  description: string;
  rating: number;
  ratingCount: number;
  openHour: string;
  minBuyIn: number;
  memberCount: number;
  distanceKm: number;
  amenities: ClubAmenity[];
  color: string;
  isMember: boolean;
  isOwner: boolean;
  joinCode: string;
  joinPending: boolean;
  liked: boolean;
};

export type FeedPost = {
  id: string;
  playerId: string;
  playerName: string;
  playerColor: string;
  clubName: string;
  timeAgo: string;
  headline: string;
  points: number;
  position: number;
  entries: number;
  kudos: number;
  comments: { name: string; text: string }[];
  kudosGiven: boolean;
  durationMins: number;
  achievements: number;
  achievementText: string;
  photos: string[];
};

type PoxeraState = {
  onboarded: boolean;
  loggedIn: boolean;
  userName: string;
  email: string;
  privacyPublic: boolean;
  players: { id: string; name: string; color: string; games: number; hours: number; privacyPublic: boolean }[];
  clubs: Club[];
  feed: FeedPost[];
  login: (email: string, name?: string) => void;
  completeOnboarding: () => void;
  setPrivacy: (v: boolean) => void;
  requestJoin: (clubId: string) => void;
  toggleLike: (clubId: string) => void;
  toggleKudos: (postId: string) => void;
  addComment: (postId: string, text: string) => void;
  logout: () => void;
  createClub: (name: string, description: string, minBuyIn: number) => void;
  joinByCode: (code: string) => { ok: boolean; message: string };
  updateClub: (clubId: string, patch: Partial<Pick<Club, "name" | "description" | "minBuyIn" | "openHour" | "amenities">>) => void;
  addMember: (clubId: string) => void;
  removeMember: (clubId: string) => void;
};

const seedClubs: Club[] = [
  {
    id: "c1",
    name: "PPCH Poker Club",
    description: "Home game รายสัปดาห์ บรรยากาศเป็นกันเอง มีดีลเลอร์ประจำ",
    rating: 4.8,
    ratingCount: 132,
    openHour: "18:00 - 02:00",
    minBuyIn: 300,
    memberCount: 19,
    distanceKm: 2.4,
    amenities: ["มีที่จอดรถ", "Wi-Fi", "ขนม+เครื่องดื่ม", "โซนแอร์"],
    color: "#FC5200",
    isMember: true,
    isOwner: true,
    joinCode: "PPCH24",
    joinPending: false,
    liked: true,
  },
  {
    id: "c2",
    name: "River Kings",
    description: "ทีมโป๊กเกอร์ย่านเมือง จัดทุกคืนศุกร์ โปรโมชั่น rebuy ครึ่งราคา",
    rating: 4.6,
    ratingCount: 89,
    openHour: "19:00 - 03:00",
    minBuyIn: 500,
    memberCount: 34,
    distanceKm: 5.1,
    amenities: ["มีที่จอดรถ", "อาหาร", "มุมสูบบุหรี่"],
    color: "#1D4ED8",
    isMember: false,
    isOwner: false,
    joinCode: "RVK751",
    joinPending: false,
    liked: false,
  },
  {
    id: "c3",
    name: "Ace Lounge",
    description: "คลับสไตล์ lounge ชิล ๆ เหมาะมือใหม่ มีสอนเทคนิคพื้นฐาน",
    rating: 4.4,
    ratingCount: 61,
    openHour: "17:00 - 00:00",
    minBuyIn: 200,
    memberCount: 22,
    distanceKm: 7.8,
    amenities: ["Wi-Fi", "กาแฟ", "โซนเงียบ"],
    color: "#15803D",
    isMember: false,
    isOwner: false,
    joinCode: "ACE310",
    joinPending: false,
    liked: false,
  },
  {
    id: "c4",
    name: "Bangkok Bluff Society",
    description: "คลับสายโปร ทัวร์นาเมนต์ใหญ่ทุกเดือน มีค่ายืนพื้นสูง",
    rating: 4.9,
    ratingCount: 210,
    openHour: "20:00 - 04:00",
    minBuyIn: 1000,
    memberCount: 48,
    distanceKm: 12.3,
    amenities: ["มีที่จอดรถ", "ห้อง VIP", "กล้องวงจรปิด", "พนักงานรักษาความปลอดภัย"],
    color: "#B8912F",
    isMember: false,
    isOwner: false,
    joinCode: "BBS888",
    joinPending: true,
    liked: false,
  },
];

const seedFeed: FeedPost[] = [
  {
    id: "f1",
    playerId: "p1",
    playerName: "นน",
    playerColor: "#FC5200",
    clubName: "PPCH Poker Club",
    timeAgo: "2 ชม.",
    headline: "คว้าอันดับ 1 ซีซัน 2 All in ด้วย 960 แต้ม",
    points: 100,
    position: 1,
    entries: 9,
    durationMins: 214,
    achievements: 2,
    achievementText: "นน ขึ้นอันดับ 1 ของ Season Leaderboard!",
    photos: ["#1D4ED8", "#15803D", "#B8912F"],
    kudos: 14,
    comments: [{ name: "นาย", text: "เล่นวันศุกร์หน้าอีกนะ ขอแชมืดคืน" }],
    kudosGiven: false,
  },
  {
    id: "f2",
    playerId: "p2",
    playerName: "ฮฮอล",
    playerColor: "#1D4ED8",
    clubName: "PPCH Poker Club",
    timeAgo: "5 ชม.",
    headline: "Knockout 3 คนในรอบเดียว — วันเด็ดสุดของซีซัน",
    points: 75,
    position: 2,
    entries: 9,
    durationMins: 186,
    achievements: 1,
    achievementText: "ฮฮอล ทำ Most Knockouts ในคลับ",
    photos: ["#DC2626", "#7C3AED"],
    kudos: 9,
    comments: [],
    kudosGiven: true,
  },
  {
    id: "f3",
    playerId: "p3",
    playerName: "บอส",
    playerColor: "#15803D",
    clubName: "River Kings",
    timeAgo: "เมื่อวาน",
    headline: "เข้ารอบ final table ครั้งแรก 🎉",
    points: 60,
    position: 3,
    entries: 12,
    durationMins: 240,
    achievements: 0,
    achievementText: "",
    photos: ["#0E7490"],
    kudos: 21,
    comments: [{ name: "นน", text: "สุดยอด! ครั้งหน้าเจอกันนะ" }],
    kudosGiven: false,
  },
];

export const usePoxera = create<PoxeraState>((set) => ({
  onboarded: false,
  loggedIn: false,
  userName: "",
  email: "",
  privacyPublic: true,
  players: [
    { id: "p1", name: "นน", color: "#FC5200", games: 12, hours: 34.5, privacyPublic: true },
    { id: "p2", name: "ฮฮอล", color: "#1D4ED8", games: 10, hours: 28.0, privacyPublic: false },
    { id: "p3", name: "บอส", color: "#15803D", games: 8, hours: 19.5, privacyPublic: true },
  ],
  clubs: seedClubs,
  feed: seedFeed,
  login: (email, name) =>
    set({ loggedIn: true, email, userName: name ?? email.split("@")[0] }),
  completeOnboarding: () => set({ onboarded: true }),
  setPrivacy: (v) => set({ privacyPublic: v }),
  requestJoin: (clubId) =>
    set((s) => ({
      clubs: s.clubs.map((c) =>
        c.id === clubId ? { ...c, joinPending: true, liked: true } : c,
      ),
    })),
  toggleLike: (clubId) =>
    set((s) => ({
      clubs: s.clubs.map((c) =>
        c.id === clubId ? { ...c, liked: !c.liked } : c,
      ),
    })),
  toggleKudos: (postId) =>
    set((s) => ({
      feed: s.feed.map((p) =>
        p.id === postId
          ? { ...p, kudosGiven: !p.kudosGiven, kudos: p.kudos + (p.kudosGiven ? -1 : 1) }
          : p,
      ),
    })),
  addComment: (postId, text) =>
    set((s) => ({
      feed: s.feed.map((p) =>
        p.id === postId
          ? { ...p, comments: [...p.comments, { name: s.userName || "คุณ", text }] }
          : p,
      ),
    })),
  logout: () => set({ loggedIn: false, onboarded: false, userName: "", email: "" }),
  createClub: (name, description, minBuyIn) =>
    set((s) => {
      const code = Math.random().toString(36).slice(2, 8).toUpperCase();
      const colors = ["#FC5200", "#1D4ED8", "#15803D", "#B8912F"];
      const club: Club = {
        id: "own" + Date.now().toString(36),
        name,
        description: description || "คลับของฉัน",
        rating: 5,
        ratingCount: 1,
        openHour: "19:00 - 02:00",
        minBuyIn,
        memberCount: 1,
        distanceKm: 0,
        amenities: ["ของเราเอง"],
        color: colors[s.clubs.length % colors.length],
        isMember: true,
        isOwner: true,
        joinCode: code,
        joinPending: false,
        liked: true,
      };
      return { clubs: [club, ...s.clubs] };
    }),
  joinByCode: (code) => {
    const club = usePoxera.getState().clubs.find((c) => c.joinCode === code.toUpperCase());
    if (!club) return { ok: false, message: "ไม่พบรหัสคลับนี้" };
    if (club.isMember) return { ok: false, message: "คุณเป็นสมาชิกคลับนี้อยู่แล้ว" };
    set((s) => ({
      clubs: s.clubs.map((c) =>
        c.id === club.id ? { ...c, joinPending: true, liked: true } : c,
      ),
    }));
    return { ok: true, message: "ส่งคำขอแล้ว — รอเจ้าของคลับอนุมัติ" };
  },
  updateClub: (clubId, patch) =>
    set((s) => ({
      clubs: s.clubs.map((c) => (c.id === clubId ? { ...c, ...patch } : c)),
    })),
  addMember: (clubId) =>
    set((s) => ({
      clubs: s.clubs.map((c) =>
        c.id === clubId ? { ...c, memberCount: c.memberCount + 1 } : c,
      ),
    })),
  removeMember: (clubId) =>
    set((s) => ({
      clubs: s.clubs.map((c: Club) =>
        c.id === clubId && c.memberCount > 1 ? { ...c, memberCount: c.memberCount - 1 } : c,
      ),
    })),
}));
