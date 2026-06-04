"use client";

import { useState } from "react";
import { Card, CardTitle, CardDescription } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import type { BmiResult } from "@/lib/data/bmi";
import {
  Scale, Flame, Dumbbell, Apple, Droplets, AlertTriangle,
  Lightbulb, ChevronDown, ChevronUp, RotateCcw, TrendingDown,
  TrendingUp, Minus, Clock, Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Tab = "overview" | "meals" | "exercise" | "tips";

export function BmiResults({ result, onReset }: { result: BmiResult; onReset: () => void }) {
  const [tab, setTab] = useState<Tab>("overview");
  const [expandedMeal, setExpandedMeal] = useState<number | null>(null);
  const [expandedEx, setExpandedEx] = useState<number | null>(null);

  const bmiPercentOnScale = Math.min(100, Math.max(0, ((result.bmi - 14) / (42 - 14)) * 100));
  const idealMidPercent   = Math.min(100, ((((result.idealBmiMin + result.idealBmiMax) / 2) - 14) / (42 - 14)) * 100);

  const TrendIcon = result.weightToLose > 0.5
    ? TrendingDown
    : result.weightToLose < -0.5
    ? TrendingUp
    : Minus;

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Header summary */}
      <div className="bg-bg-card border rounded-2xl p-5 sm:p-6" style={{ borderColor: result.bmiColor + "40" }}>
        <div className="flex items-start justify-between gap-4 mb-5">
          <div>
            <p className="text-text-muted text-sm mb-1">Your BMI</p>
            <p className="text-5xl font-display font-extrabold" style={{ color: result.bmiColor }}>
              {result.bmi}
            </p>
            <p className="text-sm font-semibold mt-1" style={{ color: result.bmiColor }}>
              {result.bmiCategory}
            </p>
          </div>
          <div className="text-right">
            <p className="text-text-muted text-xs mb-1">Ideal BMI for your body type</p>
            <p className="text-xl font-bold text-success">{result.idealBmiMin}–{result.idealBmiMax}</p>
            <p className="text-xs text-text-muted mt-0.5">
              Ideal weight: {result.idealWeightMin}–{result.idealWeightMax} kg
            </p>
          </div>
        </div>

        {/* BMI scale */}
        <div className="space-y-2 mb-5">
          <div className="relative h-4 rounded-full overflow-hidden" style={{
            background: "linear-gradient(to right, #58A6FF 0%, #3FB950 30%, #3FB950 60%, #D29922 75%, #F85149 100%)"
          }}>
            {/* Ideal zone */}
            <div
              className="absolute top-0 h-full bg-white/20 border-x-2 border-white"
              style={{ left: `${Math.min(100, ((result.idealBmiMin - 14) / 28) * 100)}%`, width: `${((result.idealBmiMax - result.idealBmiMin) / 28) * 100}%` }}
            />
            {/* Current BMI marker */}
            <div
              className="absolute top-0 w-1 h-full bg-white shadow-lg"
              style={{ left: `${bmiPercentOnScale}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-text-muted">
            <span>14</span>
            <span className="text-success font-medium">Ideal zone for you: {result.idealBmiMin}–{result.idealBmiMax}</span>
            <span>42+</span>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatBox label="BMR" value={`${result.bmr} kcal`} icon={<Flame className="w-3.5 h-3.5 text-danger" />} />
          <StatBox label="Daily Calories" value={`${result.targetCalories} kcal`} icon={<Zap className="w-3.5 h-3.5 text-gold" />} color="text-gold" />
          <StatBox label="Body Fat %" value={`~${result.bodyFatEstimate}%`} icon={<Scale className="w-3.5 h-3.5 text-info" />} />
          <StatBox label="Water / Day" value={`${result.waterIntakeLiters}L`} icon={<Droplets className="w-3.5 h-3.5 text-primary" />} color="text-primary" />
        </div>
      </div>

      {/* Weight target */}
      {Math.abs(result.weightToLose) > 0.5 && (
        <div className={cn(
          "flex items-center gap-3 p-4 rounded-xl border",
          result.weightToLose > 0 ? "bg-warning/5 border-warning/30" : "bg-info/5 border-info/30"
        )}>
          <TrendIcon className={cn("w-5 h-5 shrink-0", result.weightToLose > 0 ? "text-warning" : "text-info")} />
          <div>
            <p className="text-sm font-semibold text-text">
              {result.weightToLose > 0
                ? `${result.weightToLose} kg to lose to reach ideal range`
                : `${Math.abs(result.weightToLose)} kg to gain to reach ideal range`}
            </p>
            <p className="text-xs text-text-muted">
              Safe rate: 0.5–1 kg per week · Estimated {Math.ceil(Math.abs(result.weightToLose) / 0.75)} weeks
            </p>
          </div>
        </div>
      )}

      {/* Warnings */}
      {result.warnings.length > 0 && (
        <div className="bg-danger/5 border border-danger/20 rounded-xl p-4 space-y-1.5">
          <p className="text-xs font-bold text-danger flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5" /> Important
          </p>
          {result.warnings.map((w, i) => <p key={i} className="text-sm text-text">{w}</p>)}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-bg-elevated rounded-xl p-1 overflow-x-auto">
        {(["overview","meals","exercise","tips"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "flex-1 min-w-fit py-2 px-3 text-xs sm:text-sm font-semibold rounded-lg transition-all whitespace-nowrap",
              tab === t ? "bg-primary text-bg shadow" : "text-text-muted hover:text-text"
            )}
          >
            {t === "overview" ? "Macros" : t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* ── Overview / Macros ── */}
      {tab === "overview" && (
        <div className="space-y-4">
          <Card>
            <CardTitle className="mb-4">Daily Macro Targets</CardTitle>
            <div className="space-y-3">
              {[
                { label: "Protein",      value: result.macros.protein, unit: "g", cal: result.macros.protein * 4,  color: "success" as const, note: "Muscle preservation and satiety" },
                { label: "Carbohydrates",value: result.macros.carbs,   unit: "g", cal: result.macros.carbs * 4,    color: "gold" as const,    note: "Primary energy source" },
                { label: "Fats",         value: result.macros.fat,     unit: "g", cal: result.macros.fat * 9,      color: "primary" as const, note: "Hormones and fat-soluble vitamins" },
              ].map(({ label, value, unit, cal, color, note }) => (
                <div key={label}>
                  <div className="flex justify-between items-end mb-1.5">
                    <div>
                      <span className="text-sm font-semibold text-text">{label}</span>
                      <span className="text-xs text-text-muted ml-2">{note}</span>
                    </div>
                    <span className="text-sm font-bold text-text">{value}{unit} <span className="text-text-muted font-normal text-xs">({cal} kcal)</span></span>
                  </div>
                  <ProgressBar value={cal} max={result.targetCalories} color={color} size="sm" />
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-border flex justify-between items-center">
              <span className="text-sm text-text-muted">Total Daily Calories</span>
              <span className="text-lg font-display font-bold text-text">{result.targetCalories} kcal</span>
            </div>
          </Card>

          {/* Lean mass */}
          <Card>
            <CardTitle className="mb-3">Body Composition Estimate</CardTitle>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-bg-elevated rounded-xl p-3 text-center">
                <p className="text-2xl font-bold text-primary">{result.leanMass}kg</p>
                <p className="text-xs text-text-muted mt-0.5">Lean Mass</p>
              </div>
              <div className="bg-bg-elevated rounded-xl p-3 text-center">
                <p className="text-2xl font-bold text-gold">{result.bodyFatEstimate}%</p>
                <p className="text-xs text-text-muted mt-0.5">Est. Body Fat</p>
              </div>
            </div>
            <p className="text-xs text-text-subtle mt-3">* Estimate based on BMI formula. DEXA scan gives accurate results.</p>
          </Card>
        </div>
      )}

      {/* ── Meal Plan ── */}
      {tab === "meals" && (
        <div className="space-y-3">
          <p className="text-xs text-text-muted">Personalized for your goal, body type, and health conditions.</p>
          {result.mealPlan.map((meal, i) => (
            <Card key={i} hoverable>
              <button
                className="w-full flex items-center justify-between"
                onClick={() => setExpandedMeal(expandedMeal === i ? null : i)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center shrink-0">
                    <Apple className="w-4 h-4 text-gold" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-text">{meal.meal}</p>
                    <p className="text-xs text-text-muted flex items-center gap-1">
                      <Clock className="w-3 h-3" />{meal.timing} · {meal.calories} kcal
                    </p>
                  </div>
                </div>
                {expandedMeal === i ? <ChevronUp className="w-4 h-4 text-text-muted" /> : <ChevronDown className="w-4 h-4 text-text-muted" />}
              </button>
              {expandedMeal === i && (
                <div className="mt-3 pt-3 border-t border-border space-y-1.5">
                  {meal.foods.map((food, j) => (
                    <div key={j} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                      <span className="text-sm text-text">{food}</span>
                    </div>
                  ))}
                  {meal.notes && (
                    <p className="text-xs text-info bg-info/10 rounded-lg px-3 py-2 mt-2">💡 {meal.notes}</p>
                  )}
                </div>
              )}
            </Card>
          ))}
          <div className="bg-bg-elevated border border-border rounded-xl p-4 text-center">
            <p className="text-xs text-text-muted">Total daily target: <span className="text-text font-semibold">{result.targetCalories} kcal</span></p>
            <p className="text-xs text-text-muted mt-0.5">Protein: {result.macros.protein}g · Carbs: {result.macros.carbs}g · Fat: {result.macros.fat}g</p>
          </div>
        </div>
      )}

      {/* ── Exercise Plan ── */}
      {tab === "exercise" && (
        <div className="space-y-3">
          <p className="text-xs text-text-muted">Tailored to your BMI, goal, activity level, and health conditions.</p>
          {result.exercisePlan.map((ex, i) => (
            <Card key={i} hoverable>
              <button
                className="w-full flex items-start justify-between gap-3"
                onClick={() => setExpandedEx(expandedEx === i ? null : i)}
              >
                <div className="flex items-start gap-3">
                  <div className={cn(
                    "w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 mt-0.5",
                    ex.type === "cardio"      ? "bg-danger/10 border-danger/20" :
                    ex.type === "strength"    ? "bg-success/10 border-success/20" :
                    "bg-[#BC8CFF]/10 border-[#BC8CFF]/20"
                  )}>
                    <Dumbbell className={cn("w-4 h-4",
                      ex.type === "cardio"   ? "text-danger" :
                      ex.type === "strength" ? "text-success" : "text-[#BC8CFF]"
                    )} />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-text">{ex.name}</p>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      <Badge variant={ex.intensity === "high" ? "epic" : ex.intensity === "moderate" ? "rare" : "common"} size="sm">
                        {ex.intensity}
                      </Badge>
                      <span className="text-xs text-text-muted">{ex.frequency} · {ex.duration}</span>
                    </div>
                  </div>
                </div>
                {expandedEx === i ? <ChevronUp className="w-4 h-4 text-text-muted shrink-0" /> : <ChevronDown className="w-4 h-4 text-text-muted shrink-0" />}
              </button>
              {expandedEx === i && (
                <div className="mt-3 pt-3 border-t border-border">
                  <p className="text-sm text-text">{ex.notes}</p>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* ── Tips ── */}
      {tab === "tips" && (
        <div className="space-y-3">
          {result.healthTips.map((tip, i) => (
            <div key={i} className="flex items-start gap-3 p-3.5 bg-bg-elevated border border-border rounded-xl">
              <Lightbulb className="w-4 h-4 text-gold shrink-0 mt-0.5" />
              <p className="text-sm text-text">{tip}</p>
            </div>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <Button variant="ghost" onClick={onReset} fullWidth>
          <RotateCcw className="w-4 h-4" /> Recalculate
        </Button>
        <Button variant="primary" onClick={() => window.location.href = "/fitness"} fullWidth>
          <Dumbbell className="w-4 h-4" /> Start Workout
        </Button>
      </div>
    </div>
  );
}

function StatBox({ label, value, icon, color = "text-text" }: {
  label: string; value: string; icon: React.ReactNode; color?: string;
}) {
  return (
    <div className="bg-bg-elevated border border-border rounded-xl p-3">
      <div className="flex items-center gap-1.5 mb-1">{icon}<span className="text-xs text-text-muted">{label}</span></div>
      <p className={cn("text-base font-bold font-display", color)}>{value}</p>
    </div>
  );
}
