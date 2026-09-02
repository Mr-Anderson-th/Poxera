// Types + query hooks — mirror จากเว็บหลัก src/lib/queries.ts (read-only)
import { useEffect, useState } from "react";
import { supabase, supabaseReady } from "./supabase";

export type Player = {
  id: string;
  name: string;
  nickname: string | null;
  avatar_color: string | null;
  avatar_url: string | null;
  active: boolean;
  created_at: string;
};

export type Round = {
  id: string;
  name: string;
  played_at: string;
  buy_in: number;
  rebuy_amount: number;
  payout_structure: number[];
  level_minutes: number;
  blind_multiplier: number;
  starting_sb: number;
  starting_bb: number;
  total_players: number;
  total_rebuys: number;
  total_pot: number;
  duration_seconds: number;
  notes: string | null;
  season_id: string | null;
  created_at: string;
};

export type RoundResult = {
  id: string;
  round_id: string;
  player_id: string;
  finish_position: number;
  rebuys: number;
  bust_sb: number | null;
  bust_bb: number | null;
  bust_level: number | null;
  bust_time_seconds: number | null;
  rebuy_times: number[];
  payout: number;
  net_amount: number;
  points_awarded: number;
};

export type Settings = {
  id: number;
  point_system: number[];
  default_buy_in: number;
  default_rebuy: number;
  default_level_minutes: number;
  default_starting_sb: number;
  default_starting_bb: number;
  default_blind_multiplier: number;
  currency: string;
};

export type Season = {
  id: string;
  name: string;
  started_at: string;
  ended_at: string | null;
  created_at: string;
};

export type SeasonStanding = {
  id: string;
  season_id: string;
  player_id: string;
  total_points: number;
  rounds_played: number;
  total_net: number;
};

type State<T> = { data: T; loading: boolean; error: string | null };

function useQueryState<T>(fetcher: () => Promise<T>, deps: unknown[] = []): State<T> {
  const [state, setState] = useState<State<T>>({ data: null as T, loading: true, error: null });
  useEffect(() => {
    let alive = true;
    if (!supabaseReady) {
      setState({ data: null as T, loading: false, error: "Supabase env not configured" });
      return () => {};
    }
    setState((s) => ({ ...s, loading: true, error: null }));
    fetcher()
      .then((data) => alive && setState({ data, loading: false, error: null }))
      .catch((e: Error) => alive && setState({ data: null as T, loading: false, error: e.message }));
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return state;
}

/** กัน null จาก state เริ่มต้น/error — hook list ทุกตัวไม่มีทางคืน null */
export function useList<T>(state: State<T[] | null>): { data: T[]; loading: boolean; error: string | null } {
  return { ...state, data: state.data ?? [] };
}

export function usePlayers() {
  return useList(useQueryState<Player[]>(async () => {
    const { data, error } = await supabase.from("players").select("*").order("name");
    if (error) throw error;
    return data ?? [];
  }));
}

export function useRounds() {
  return useList(useQueryState<Round[]>(async () => {
    const { data, error } = await supabase.from("rounds").select("*").order("played_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  }));
}

export function useResults() {
  return useList(useQueryState<RoundResult[]>(async () => {
    const { data, error } = await supabase.from("round_results").select("*");
    if (error) throw error;
    return data ?? [];
  }));
}

export function useSettings() {
  return useQueryState<Settings | null>(async () => {
    const { data, error } = await supabase.from("settings").select("id,point_system,default_buy_in,default_rebuy,default_level_minutes,default_starting_sb,default_starting_bb,default_blind_multiplier,currency").eq("id", 1).maybeSingle();
    if (error) throw error;
    return data;
  });
}

export function useSeasons() {
  return useList(useQueryState<Season[]>(async () => {
    const { data, error } = await supabase.from("seasons").select("*").order("started_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  }));
}

export function useSeasonStandings(seasonId: string | null) {
  return useList(useQueryState<SeasonStanding[]>(
    async () => {
      const { data, error } = await supabase.from("season_standings").select("*").eq("season_id", seasonId!);
      if (error) throw error;
      return data ?? [];
    },
    [seasonId],
    ));
  }

/** คำนวณ season summary ฝั่ง client (เหมือนเว็บ) — ไม่แตะตารางเพิ่ม */
export function seasonSummary(rounds: Round[], results: RoundResult[]) {
  const roundIds = new Set(rounds.map((r) => r.id));
  const scoped = results.filter((r) => roundIds.has(r.round_id));
  const pot = rounds.reduce((a, r) => a + Number(r.total_pot), 0);
  const players = new Set(scoped.map((r) => r.player_id)).size;
  const avgBuyIn = rounds.length ? rounds.reduce((a, r) => a + Number(r.buy_in), 0) / rounds.length : 0;
  return { pot, rounds: rounds.length, players, avgBuyIn };
}
