"use client";

import { useState, useEffect, useTransition } from "react";
import { Apple, Flame, Dumbbell, Wheat, Droplets, Plus, X, Loader2, Sparkles } from "lucide-react";
import { Card, CardTitle, CardDescription } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { createClient } from "@/lib/supabase/client";
import { logMeal } from "@/app/actions/user";
import { useUserStore } from "@/lib/store/userStore";
import { estimateNutrition, parseQuantity } from "@/lib/data/foods";

interface MealLog {
  id: string;
  meal_name: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  logged_at: string;
}

const GOALS = { calories: 2200, protein: 150, carbs: 250, fat: 70 };

export function NutritionHub({ onQuestComplete }: { onQuestComplete?: () => void }) {
  const [logs, setLogs] = useState<MealLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [mealInput, setMealInput] = useState("");   // e.g. "150g chicken breast"
  const [form, setForm] = useState({ mealName: "", calories: "", proteinG: "", carbsG: "", fatG: "" });
  const [autoFilled, setAutoFilled] = useState(false);
  const [confidence, setConfidence] = useState<"exact"|"estimated"|null>(null);
  const [formError, setFormError] = useState("");
  const { profile } = useUserStore();

  async function fetchLogs() {
    const supabase = createClient();
    const today = new Date().toISOString().split("T")[0];
    const { data } = await supabase
      .from("nutrition_logs")
      .select("*")
      .gte("logged_at", `${today}T00:00:00Z`)
      .order("logged_at", { ascending: false });
    setLogs((data as MealLog[]) ?? []);
    setLoading(false);
  }

  useEffect(() => { fetchLogs(); }, []);

  const totals = logs.reduce(
    (acc, l) => ({
      calories: acc.calories + Number(l.calories),
      protein:  acc.protein  + Number(l.protein_g),
      carbs:    acc.carbs    + Number(l.carbs_g),
      fat:      acc.fat      + Number(l.fat_g),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  // Auto-calculate nutrition from meal description
  function handleAutoCalc() {
    if (!mealInput.trim()) return;
    const { food, grams } = parseQuantity(mealInput.trim());
    const est = estimateNutrition(food, grams);
    setForm({
      mealName: mealInput.trim(),
      calories: String(est.calories),
      proteinG: String(est.protein),
      carbsG:   String(est.carbs),
      fatG:     String(est.fat),
    });
    setAutoFilled(true);
    setConfidence(est.confidence);
  }

  function handleMealInputKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") { e.preventDefault(); handleAutoCalc(); }
  }

  function handleSubmit() {
    if (!form.mealName) { setFormError("Meal name is required"); return; }
    setFormError("");
    startTransition(async () => {
      const result = await logMeal({
        mealName:  form.mealName,
        calories:  Number(form.calories) || 0,
        proteinG:  Number(form.proteinG) || 0,
        carbsG:    Number(form.carbsG)   || 0,
        fatG:      Number(form.fatG)     || 0,
      });
      if (!result.error) {
        setForm({ mealName: "", calories: "", proteinG: "", carbsG: "", fatG: "" });
        setMealInput("");
        setAutoFilled(false);
        setConfidence(null);
        setShowForm(false);
        fetchLogs();
        onQuestComplete?.();
      }
    });
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="w-8 h-8 text-primary animate-spin" />
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-text flex items-center gap-2">
            <Apple className="w-6 h-6 text-primary" />
            Nutrition Hub
          </h1>
          <p className="text-text-muted text-sm mt-1">
            {profile?.username ?? "Hero"} — track today's meals
          </p>
        </div>
        <Button variant="primary" size="sm" onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4" /> Log Meal
        </Button>
      </div>

      {/* Macro cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MacroCard label="Calories" icon={<Flame className="w-5 h-5 text-danger" />}   current={Math.round(totals.calories)} goal={GOALS.calories} unit="kcal" color="danger" />
        <MacroCard label="Protein"  icon={<Dumbbell className="w-5 h-5 text-success" />} current={Math.round(totals.protein)}  goal={GOALS.protein}  unit="g"    color="success" />
        <MacroCard label="Carbs"    icon={<Wheat className="w-5 h-5 text-gold" />}      current={Math.round(totals.carbs)}    goal={GOALS.carbs}    unit="g"    color="gold" />
        <MacroCard label="Fat"      icon={<Droplets className="w-5 h-5 text-info" />}   current={Math.round(totals.fat)}      goal={GOALS.fat}      unit="g"    color="primary" />
      </div>

      {/* Log meal form */}
      {showForm && (
        <Card className="border-primary/30">
          <div className="flex items-center justify-between mb-4">
            <CardTitle>Log a Meal</CardTitle>
            <button onClick={() => { setShowForm(false); setAutoFilled(false); setConfidence(null); }}>
              <X className="w-4 h-4 text-text-muted hover:text-text" />
            </button>
          </div>

          {/* Smart input row */}
          <div className="mb-4">
            <label className="block text-xs font-medium text-text-muted mb-1.5">
              Describe your meal <span className="text-text-subtle">(e.g. "150g chicken breast", "2 cups rice", "1 banana")</span>
            </label>
            <div className="flex gap-2">
              <input
                value={mealInput}
                onChange={(e) => { setMealInput(e.target.value); setAutoFilled(false); }}
                onKeyDown={handleMealInputKeyDown}
                placeholder="150g chicken breast + 1 cup rice..."
                className="flex-1 bg-bg-elevated border border-border rounded-xl px-4 py-2.5 text-text placeholder:text-text-subtle focus:outline-none focus:border-primary text-sm"
              />
              <Button variant="secondary" size="sm" onClick={handleAutoCalc} disabled={!mealInput.trim()}>
                <Sparkles className="w-4 h-4 text-gold" /> Auto-fill
              </Button>
            </div>
            {confidence && (
              <div className="flex items-center gap-2 mt-2">
                <Badge variant={confidence === "exact" ? "uncommon" : "common"} size="sm">
                  {confidence === "exact" ? "✓ Exact match" : "~ Estimated"}
                </Badge>
                <span className="text-xs text-text-subtle">
                  {confidence === "estimated" ? "Values are approximate. Edit if needed." : "Values from nutrition database."}
                </span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <input
                placeholder="Meal name *"
                value={form.mealName}
                onChange={(e) => setForm({ ...form, mealName: e.target.value })}
                className="w-full bg-bg-elevated border border-border rounded-xl px-4 py-2.5 text-text placeholder:text-text-subtle focus:outline-none focus:border-primary text-sm"
              />
            </div>
            {[
              { key: "calories", label: "Calories (kcal)" },
              { key: "proteinG", label: "Protein (g)" },
              { key: "carbsG",   label: "Carbs (g)" },
              { key: "fatG",     label: "Fat (g)" },
            ].map(({ key, label }) => (
              <input
                key={key}
                type="number"
                placeholder={label}
                value={form[key as keyof typeof form]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                className={`w-full bg-bg-elevated border rounded-xl px-4 py-2.5 text-text placeholder:text-text-subtle focus:outline-none focus:border-primary text-sm ${
                  autoFilled && form[key as keyof typeof form] ? "border-primary/40" : "border-border"
                }`}
              />
            ))}
          </div>
          {formError && <p className="text-xs text-danger mt-2">{formError}</p>}
          <div className="flex gap-2 mt-4">
            <Button variant="primary" size="sm" onClick={handleSubmit} loading={isPending}>Save Meal</Button>
            <Button variant="ghost" size="sm" onClick={() => { setShowForm(false); setAutoFilled(false); }}>Cancel</Button>
          </div>
        </Card>
      )}

      {/* Today's logs */}
      <section>
        <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-3">
          Today's Meals ({logs.length})
        </h2>
        {logs.length === 0 ? (
          <Card className="text-center py-10">
            <p className="text-text-muted text-sm">No meals logged today.</p>
            <p className="text-text-subtle text-xs mt-1">Hit + to add your first meal. Try typing "2 eggs + toast" and clicking Auto-fill.</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {logs.map((log) => (
              <Card key={log.id} hoverable>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <CardTitle className="text-base">{log.meal_name}</CardTitle>
                    <CardDescription>
                      P: {log.protein_g}g · C: {log.carbs_g}g · F: {log.fat_g}g
                    </CardDescription>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-text">{Math.round(Number(log.calories))}</p>
                    <p className="text-xs text-text-muted">kcal</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function MacroCard({ label, icon, current, goal, unit, color }: {
  label: string; icon: React.ReactNode; current: number; goal: number;
  unit: string; color: "primary" | "gold" | "success" | "danger" | "epic";
}) {
  const over = current > goal;
  return (
    <Card className={over ? "border-danger/30" : ""}>
      <div className="flex items-center gap-2 mb-3">{icon}<span className="text-sm font-medium text-text-muted">{label}</span></div>
      <p className="text-2xl font-display font-bold text-text mb-1">
        {current}<span className="text-sm text-text-muted font-normal ml-1">{unit}</span>
      </p>
      <p className="text-xs text-text-subtle mb-2">Goal: {goal}{unit}</p>
      <ProgressBar value={current} max={goal} color={over ? "danger" : color} size="sm" />
    </Card>
  );
}
