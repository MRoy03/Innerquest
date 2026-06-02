"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function getOrAssignTodayQuests() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: null, error: "Not authenticated" };

  const today = new Date().toISOString().split("T")[0];

  // Check if today's quests already exist
  const { data: existing } = await supabase
    .from("user_quests")
    .select(`
      id, completed, completed_at, progress, assigned_date,
      quests ( id, title, description, difficulty, xp_reward, category, quest_type )
    `)
    .eq("user_id", user.id)
    .eq("assigned_date", today);

  if (existing && existing.length > 0) return { data: existing, error: null };

  // Assign today's daily + weekly quests
  const { data: allQuests } = await supabase
    .from("quests")
    .select("id, quest_type")
    .in("quest_type", ["daily", "weekly", "boss"]) as { data: { id: string; quest_type: string }[] | null };

  if (!allQuests?.length) return { data: [], error: null };

  const toInsert = allQuests.map((q) => ({
    user_id: user.id,
    quest_id: q.id,
    assigned_date: today,
    completed: false,
    progress: 0,
  }));

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase.from("user_quests") as any).upsert(toInsert, {
    onConflict: "user_id,quest_id,assigned_date",
  });

  // Return fresh
  const { data: fresh, error } = await supabase
    .from("user_quests")
    .select(`
      id, completed, completed_at, progress, assigned_date,
      quests ( id, title, description, difficulty, xp_reward, category, quest_type )
    `)
    .eq("user_id", user.id)
    .eq("assigned_date", today);

  return { data: fresh, error: error?.message ?? null };
}

export async function completeQuest(userQuestId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  // Get quest details
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: uq } = await (supabase as any)
    .from("user_quests")
    .select("completed, quests(xp_reward)")
    .eq("id", userQuestId)
    .eq("user_id", user.id)
    .single() as { data: { completed: boolean; quests: { xp_reward: number } | null } | null };

  if (!uq) return { error: "Quest not found" };
  if (uq.completed) return { error: "Already completed" };

  const xpReward = uq.quests?.xp_reward ?? 50;

  // Mark complete
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase.from("user_quests") as any)
    .update({ completed: true, completed_at: new Date().toISOString(), progress: 100 })
    .eq("id", userQuestId)
    .eq("user_id", user.id);

  // Award XP via stored function
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase as any).rpc("award_xp", { p_user_id: user.id, p_amount: xpReward });

  // Update streak
  await updateStreak(user.id, supabase);

  // Check badges
  await checkAndAwardBadges(user.id, supabase);

  revalidatePath("/quests");
  return { error: null, xpAwarded: xpReward };
}

async function updateStreak(userId: string, supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: stats } = await supabase
    .from("user_stats")
    .select("*")
    .eq("user_id", userId)
    .single() as { data: { streak_days: number; last_active_date: string | null } | null };

  if (!stats) return;

  const today = new Date().toISOString().split("T")[0];
  const lastActive = stats.last_active_date;
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

  const newStreak =
    lastActive === yesterday ? stats.streak_days + 1 :
    lastActive === today ? stats.streak_days : 1;

  await supabase
    .from("user_stats")
    .update({ streak_days: newStreak, last_active_date: today })
    .eq("user_id", userId);
}

async function checkAndAwardBadges(userId: string, supabase: Awaited<ReturnType<typeof createClient>>) {
  const [{ data: stats }, { data: allBadges }, { data: earned }] = await Promise.all([
    supabase.from("user_stats").select("*").eq("user_id", userId).single(),
    supabase.from("badges").select("*"),
    supabase.from("user_badges").select("badge_id").eq("user_id", userId),
  ]);

  if (!stats || !allBadges) return;

  const earnedIds = new Set((earned ?? []).map((e) => e.badge_id));
  const toAward: string[] = [];

  for (const badge of allBadges) {
    if (earnedIds.has(badge.id)) continue;

    const qualifies = (() => {
      switch (badge.badge_key) {
        case "first_quest": return stats.xp > 0;
        case "on_fire": return stats.streak_days >= 3;
        case "unstoppable": return stats.streak_days >= 7;
        case "century_club": return stats.level >= 10;
        case "legend": return stats.level >= 50;
        default: return false;
      }
    })();

    if (qualifies) toAward.push(badge.id);
  }

  if (toAward.length > 0) {
    await supabase.from("user_badges").upsert(
      toAward.map((badge_id) => ({ user_id: userId, badge_id })),
      { onConflict: "user_id,badge_id" }
    );
  }
}
