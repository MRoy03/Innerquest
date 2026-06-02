"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function saveOnboarding(formData: {
  username: string;
  goal: string;
  fitnessLevel: number;
  dailyTimeMins: number;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  await supabase
    .from("profiles")
    .update({
      username: formData.username || (user.email?.split("@")[0] ?? "Hero"),
      primary_goal: formData.goal,
      fitness_level: formData.fitnessLevel,
      daily_time_min: formData.dailyTimeMins,
      last_active_date: new Date().toISOString().split("T")[0],
    })
    .eq("user_id", user.id);

  redirect("/quests");
}

export async function logMood(score: number, note: string = "") {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const today = new Date().toISOString().split("T")[0];

  const { error } = await supabase.from("mood_logs").upsert(
    { user_id: user.id, score, note: note || null, entry_date: today },
    { onConflict: "user_id,entry_date" }
  );

  // Update rolling mood average in user_stats
  const { data: last7 } = await supabase
    .from("mood_logs")
    .select("score")
    .eq("user_id", user.id)
    .order("entry_date", { ascending: false })
    .limit(7);

  if (last7?.length) {
    const avg = last7.reduce((sum, r) => sum + r.score, 0) / last7.length;
    await supabase
      .from("user_stats")
      .update({ mood_score: Math.round(avg * 10) / 10 })
      .eq("user_id", user.id);
  }

  return { error: error?.message ?? null };
}

export async function logWorkout(data: {
  workoutName: string;
  durationMins: number;
  caloriesBurned: number;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase.from("workout_logs").insert({
    user_id: user.id,
    workout_name: data.workoutName,
    duration_mins: data.durationMins,
    calories_burned: data.caloriesBurned,
  });

  // Increment strength stat
  const boost = Math.min(5, Math.floor(data.durationMins / 10));
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase as any).rpc("award_xp", { p_user_id: user.id, p_amount: boost * 10 });
  await supabase
    .from("user_stats")
    .update({ strength: Math.min(100, boost) })
    .eq("user_id", user.id);

  return { error: error?.message ?? null };
}

export async function logMeal(data: {
  mealName: string;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase.from("nutrition_logs").insert({
    user_id: user.id,
    meal_name: data.mealName,
    calories: data.calories,
    protein_g: data.proteinG,
    carbs_g: data.carbsG,
    fat_g: data.fatG,
  });

  return { error: error?.message ?? null };
}

export async function saveBrainSession(data: {
  gameName: string;
  score: number;
  accuracyPct: number;
  durationSecs: number;
  xpEarned: number;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  await supabase.from("brain_sessions").insert({
    user_id: user.id,
    game_name: data.gameName,
    score: data.score,
    accuracy_pct: data.accuracyPct,
    duration_secs: data.durationSecs,
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase as any).rpc("award_xp", { p_user_id: user.id, p_amount: data.xpEarned });

  // Check brain_master badge: all 5 games in one day
  const today = new Date().toISOString().split("T")[0];
  const { data: todaySessions } = await supabase
    .from("brain_sessions")
    .select("game_name")
    .eq("user_id", user.id)
    .gte("played_at", `${today}T00:00:00Z`);

  const uniqueGames = new Set(todaySessions?.map((s) => s.game_name));
  if (uniqueGames.size >= 5) {
    const { data: badge } = await supabase
      .from("badges")
      .select("id")
      .eq("badge_key", "brain_master")
      .single();

    if (badge) {
      await supabase.from("user_badges").upsert(
        { user_id: user.id, badge_id: badge.id },
        { onConflict: "user_id,badge_id" }
      );
      // +100 XP all-5-in-one-day bonus
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase as any).rpc("award_xp", { p_user_id: user.id, p_amount: 100 });
    }
  }

  return { error: null, xpAwarded: data.xpEarned };
}
