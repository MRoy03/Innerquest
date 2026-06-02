import { create } from "zustand";
import type { UserProfile, UserStats } from "@/types";

interface UserStore {
  profile: UserProfile | null;
  stats: UserStats | null;
  isLoading: boolean;
  setProfile: (profile: UserProfile | null) => void;
  setStats: (stats: UserStats | null) => void;
  setLoading: (loading: boolean) => void;
  addXp: (amount: number) => void;
  reset: () => void;
}

export const useUserStore = create<UserStore>((set) => ({
  profile: null,
  stats: null,
  isLoading: false,
  setProfile: (profile) => set({ profile }),
  setStats: (stats) => set({ stats }),
  setLoading: (isLoading) => set({ isLoading }),
  addXp: (amount) =>
    set((state) => {
      if (!state.stats) return {};
      const newXp = state.stats.xp + amount;
      const newLevel = Math.floor(Math.sqrt(newXp / 100));
      return {
        stats: { ...state.stats, xp: newXp, level: Math.max(state.stats.level, newLevel) },
      };
    }),
  reset: () => set({ profile: null, stats: null, isLoading: false }),
}));
