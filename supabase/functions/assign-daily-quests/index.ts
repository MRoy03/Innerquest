import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Runs via pg_cron at midnight UTC or on-demand via POST
Deno.serve(async (req) => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const today = new Date().toISOString().split("T")[0];

  // Get all users
  const { data: users, error: usersError } = await supabase
    .from("profiles")
    .select("user_id");

  if (usersError) {
    return new Response(JSON.stringify({ error: usersError.message }), { status: 500 });
  }

  // Get all quests to assign
  const { data: quests } = await supabase
    .from("quests")
    .select("id, quest_type")
    .in("quest_type", ["daily", "weekly", "boss"]);

  if (!quests?.length) {
    return new Response(JSON.stringify({ message: "No quests to assign" }), { status: 200 });
  }

  let assigned = 0;

  for (const user of users ?? []) {
    const toInsert = quests.map((q) => ({
      user_id: user.user_id,
      quest_id: q.id,
      assigned_date: today,
      completed: false,
      progress: 0,
    }));

    const { error } = await supabase
      .from("user_quests")
      .upsert(toInsert, { onConflict: "user_id,quest_id,assigned_date" });

    if (!error) assigned += toInsert.length;
  }

  return new Response(
    JSON.stringify({ message: `Assigned quests to ${users?.length ?? 0} users`, total: assigned }),
    { headers: { "Content-Type": "application/json" }, status: 200 }
  );
});
