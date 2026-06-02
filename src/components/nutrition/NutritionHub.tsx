"use client";

import { useState, useEffect, useTransition } from "react";
import { Apple, Flame, Dumbbell, Wheat, Droplets, Plus, X, Loader2 } from "lucide-react";
import { Card, CardTitle, CardDescription } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";
import { logMeal } from "@/app/actions/user";
import { useUserStore } from "@/lib/store/userStore";

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

export function NutritionHub() {
  const [logs, setLogs] = useState<MealLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState({ mealName: "", calories: "", proteinG: "", carbsG: "", fatG: "" });
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
      protein: acc.protein + Number(l.protein_g),
      carbs: acc.carbs + Number(l.carbs_g),
      fat: acc.fat + Number(l.fat_g),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  function handleSubmit() {
    if (!form.mealName) { setFormError("Meal name is required"); return; }
    setFormError("");
    startTransition(async () => {
      const result = await logMeal({
        mealName: form.mealName,
        calories: Number(form.calories) || 0,
        proteinG: Number(form.proteinG) || 0,
        carbsG: Number(form.carbsG) || 0,
        fatG: Number(form.fatG) || 0,
      });
      if (!result.error) {
        setForm({ mealName: "", calories: "", proteinG: "", carbsG: "", fatG: "" });
        setShowForm(false);
        fetchLogs();
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
            Hey {profile?.username ?? "Hero"} — track today's meals
          </p>
        </div>
        <Button variant="primary" size="sm" onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4" /> Log Meal
        </Button>
      </div>

      {/* Macro cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MacroCard label="Calories" icon={<Flame className="w-5 h-5 text-danger" />} current={Math.round(totals.calories)} goal={GOALS.calories} unit="kcal" color="danger" />
        <MacroCard label="Protein"  icon={<Dumbbell className="w-5 h-5 text-success" />} current={Math.round(totals.protein)} goal={GOALS.protein} unit="g" color="success" />
        <MacroCard label="Carbs"    icon={<Wheat className="w-5 h-5 text-gold" />} current={Math.round(totals.carbs)} goal={GOALS.carbs} unit="g" color="gold" />
        <MacroCard label="Fat"      icon={<Droplets className="w-5 h-5 text-info" />} current={Math.round(totals.fat)} goal={GOALS.fat} unit="g" color="primary" />
      </div>

      {/* Log meal form */}
      {showForm && (
        <Card className="border-primary/30">
          <div className="flex items-center justify-between mb-4">
            <CardTitle>Log a Meal</CardTitle>
            <button onClick={() => setShowForm(false)}><X className="w-4 h-4 text-text-muted hover:text-text" /></button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <input
                placeholder="Meal name (e.g. Grilled chicken + rice)"
                value={form.mealName}
                onChange={(e) => setForm({ ...form, mealName: e.target.value })}
                className="w-full bg-bg-elevated border border-border rounded-xl px-4 py-2.5 text-text placeholder:text-text-subtle focus:outline-none focus:border-primary text-sm"
              />
            </div>
            {[
              { key: "calories", label: "Calories (kcal)" },
              { key: "proteinG", label: "Protein (g)" },
              { key: "carbsG", label: "Carbs (g)" },
              { key: "fatG", label: "Fat (g)" },
            ].map(({ key, label }) => (
              <input
                key={key}
                type="number"
                placeholder={label}
                value={form[key as keyof typeof form]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                className="w-full bg-bg-elevated border border-border rounded-xl px-4 py-2.5 text-text placeholder:text-text-subtle focus:outline-none focus:border-primary text-sm"
              />
            ))}
          </div>
          {formError && <p className="text-xs text-danger mt-2">{formError}</p>}
          <div className="flex gap-2 mt-4">
            <Button variant="primary" size="sm" onClick={handleSubmit} loading={isPending}>Save Meal</Button>
            <Button variant="ghost" size="sm" onClick={() => setShowForm(false)}>Cancel</Button>
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
            <p className="text-text-muted text-sm">No meals logged today. Hit + to add your first meal.</p>
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
                    <p className="text-sm font-bold text-text">{log.calories}</p>
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
