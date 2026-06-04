"use server";

import { createClient } from "@/lib/supabase/server";

export async function saveBmiRecord(data: {
  bmi: number;
  weightKg: number;
  heightCm: number;
  bodyType: string;
  goal: string;
  targetCalories: number;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from("bmi_records")
    .insert({
      user_id:          user.id,
      bmi:              data.bmi,
      weight_kg:        data.weightKg,
      height_cm:        data.heightCm,
      body_type:        data.bodyType,
      goal:             data.goal,
      target_calories:  data.targetCalories,
    });

  return { error: error?.message ?? null };
}

export async function getBmiHistory() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: [], error: "Not authenticated" };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from("bmi_records")
    .select("*")
    .eq("user_id", user.id)
    .order("recorded_at", { ascending: false })
    .limit(10);

  return { data: data ?? [], error: error?.message ?? null };
}

// ── Body image analysis via Anthropic API ─────────────────────────────────────
// ANTHROPIC_API_KEY must be set in environment variables
export async function analyzeBodyImage(imageBase64: string, mimeType: string): Promise<{
  bodyType: string | null;
  bodyShape: string | null;
  confidence: string;
  notes: string;
  error: string | null;
}> {
  if (!process.env.ANTHROPIC_API_KEY) {
    return {
      bodyType: null,
      bodyShape: null,
      confidence: "none",
      notes: "",
      error: "ANTHROPIC_API_KEY not configured. Please select body type manually.",
    };
  }

  try {
    const Anthropic = (await import("@anthropic-ai/sdk")).default;
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 400,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: mimeType as "image/jpeg" | "image/png" | "image/gif" | "image/webp",
                data: imageBase64,
              },
            },
            {
              type: "text",
              text: `Analyze this full-body photo purely for body composition assessment. Respond ONLY with a JSON object (no markdown):
{
  "bodyType": "ectomorph|ecto_meso|mesomorph|endo_meso|endomorph",
  "bodyShape": "apple|pear|hourglass|rectangle|inverted_triangle",
  "confidence": "high|medium|low",
  "notes": "one sentence about visible body composition"
}
Base your assessment only on visible body structure, frame, and proportions. If image quality or clothing makes assessment difficult, set confidence to "low".`,
            },
          ],
        },
      ],
    });

    const text = response.content[0].type === "text" ? response.content[0].text : "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON in response");

    const parsed = JSON.parse(jsonMatch[0]);
    return {
      bodyType:   parsed.bodyType   ?? null,
      bodyShape:  parsed.bodyShape  ?? null,
      confidence: parsed.confidence ?? "low",
      notes:      parsed.notes      ?? "",
      error:      null,
    };
  } catch (e) {
    return {
      bodyType: null,
      bodyShape: null,
      confidence: "none",
      notes: "",
      error: "Could not analyze image. Please select body type manually.",
    };
  }
}
