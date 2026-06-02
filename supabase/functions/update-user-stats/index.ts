import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// POST body: { user_id: string, stat: "strength" | "energy" | "discipline", delta: number }
Deno.serve(async (req) => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const { user_id, stat, delta } = await req.json();

  if (!user_id || !stat || delta === undefined) {
    return new Response(JSON.stringify({ error: "Missing fields" }), { status: 400 });
  }

  const { data: current } = await supabase
    .from("user_stats")
    .select(stat)
    .eq("user_id", user_id)
    .single();

  if (!current) return new Response(JSON.stringify({ error: "User not found" }), { status: 404 });

  const newValue = Math.min(100, Math.max(0, (current[stat] as number) + delta));

  await supabase
    .from("user_stats")
    .update({ [stat]: newValue })
    .eq("user_id", user_id);

  return new Response(
    JSON.stringify({ stat, old: current[stat], new: newValue }),
    { headers: { "Content-Type": "application/json" }, status: 200 }
  );
});
