"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useUserStore } from "@/lib/store/userStore";
import type { UserProfile, UserStats } from "@/types";

export function useUser() {
  const { profile, stats, isLoading, setProfile, setStats, setLoading, reset } =
    useUserStore();

  useEffect(() => {
    const supabase = createClient();
    let mounted = true;

    async function loadUser() {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !mounted) { setLoading(false); return; }

      const [{ data: profileData }, { data: statsData }] = await Promise.all([
        supabase.from("profiles").select("*").eq("user_id", user.id).single(),
        supabase.from("user_stats").select("*").eq("user_id", user.id).single(),
      ]);

      if (!mounted) return;

      if (profileData) {
        const p: UserProfile = {
          id: profileData.id,
          username: profileData.username ?? user.email?.split("@")[0] ?? "Hero",
          avatarUrl: profileData.avatar_url,
          fitnessLevel: profileData.fitness_level,
          primaryGoal: profileData.primary_goal,
        };
        setProfile(p);
      }

      if (statsData) {
        const s: UserStats = {
          xp: statsData.xp,
          level: statsData.level,
          strength: statsData.strength,
          energy: statsData.energy,
          discipline: statsData.discipline,
          moodScore: Number(statsData.mood_score),
          streakDays: statsData.streak_days,
        };
        setStats(s);
      }

      setLoading(false);
    }

    loadUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event) => {
        if (event === "SIGNED_OUT") reset();
        if (event === "SIGNED_IN") loadUser();
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { profile, stats, isLoading };
}
