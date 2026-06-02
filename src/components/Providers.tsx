"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useUserStore } from "@/lib/store/userStore";
import type { UserProfile, UserStats } from "@/types";

function UserLoader({ children }: { children: React.ReactNode }) {
  const { setProfile, setStats, setLoading, reset } = useUserStore();

  useEffect(() => {
    const supabase = createClient();
    let mounted = true;

    async function load() {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !mounted) { setLoading(false); return; }

      const [{ data: p }, { data: s }] = await Promise.all([
        supabase.from("profiles").select("*").eq("user_id", user.id).single(),
        supabase.from("user_stats").select("*").eq("user_id", user.id).single(),
      ]);

      if (!mounted) return;

      if (p) setProfile({
        id: p.id,
        username: p.username ?? user.email?.split("@")[0] ?? "Hero",
        avatarUrl: p.avatar_url,
        fitnessLevel: p.fitness_level,
        primaryGoal: p.primary_goal,
      } as UserProfile);

      if (s) setStats({
        xp: s.xp,
        level: s.level,
        strength: s.strength,
        energy: s.energy,
        discipline: s.discipline,
        moodScore: Number(s.mood_score),
        streakDays: s.streak_days,
      } as UserStats);

      setLoading(false);
    }

    load();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") reset();
      if (event === "SIGNED_IN") load();
    });

    return () => { mounted = false; subscription.unsubscribe(); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <>{children}</>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 60 * 1000, refetchOnWindowFocus: false },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <UserLoader>{children}</UserLoader>
    </QueryClientProvider>
  );
}
