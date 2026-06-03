"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardTitle, CardDescription } from "@/components/ui/Card";
import { WorkoutTimer } from "./WorkoutTimer";
import { generateWorkout, type WorkoutPlan } from "@/lib/data/exercises";
import { logWorkout } from "@/app/actions/user";
import { Dumbbell, Flame, Timer, Zap, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const GOALS = [
  { id: "cardio",     label: "Cardio",          desc: "Heart health & endurance",   icon: "❤️" },
  { id: "strength",   label: "Strength",         desc: "Build muscle & tone",        icon: "💪" },
  { id: "hiit",       label: "HIIT",             desc: "Max burn in less time",      icon: "🔥" },
  { id: "flexibility",label: "Flexibility",      desc: "Mobility & stress relief",   icon: "🧘" },
  { id: "full_body",  label: "Full Body",        desc: "Balanced all-over workout",  icon: "⚡" },
];
const DURATIONS = [15, 20, 30, 45, 60];
const LEVELS = [
  { id: "beginner",     label: "Beginner",     desc: "New to exercise" },
  { id: "intermediate", label: "Intermediate", desc: "Active 2–3×/week" },
  { id: "advanced",     label: "Advanced",     desc: "Daily training" },
];
const EQUIPMENT = [
  { id: "none", label: "No Equipment", desc: "Bodyweight only" },
  { id: "home", label: "Home",         desc: "Chair, resistance band" },
  { id: "gym",  label: "Gym",          desc: "Full equipment" },
];

export function WorkoutPlanner({ onQuestComplete }: { onQuestComplete?: (cal: number) => void }) {
  const [goal, setGoal] = useState("full_body");
  const [duration, setDuration] = useState(30);
  const [level, setLevel] = useState<"beginner"|"intermediate"|"advanced">("beginner");
  const [equipment, setEquipment] = useState<"none"|"home"|"gym">("none");
  const [plan, setPlan] = useState<WorkoutPlan | null>(null);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  function generate() {
    const p = generateWorkout({
      goal: goal as "cardio"|"strength"|"flexibility"|"hiit"|"full_body",
      durationMins: duration,
      level,
      equipment,
    });
    setPlan(p);
  }

  async function handleComplete(calories: number) {
    setSaving(true);
    await logWorkout({
      workoutName: plan!.name,
      durationMins: plan!.totalMins,
      caloriesBurned: calories,
    });
    setSaving(false);
    setDone(true);
    onQuestComplete?.(calories);
  }

  if (done) {
    return (
      <div className="text-center py-8 space-y-4">
        <div className="text-5xl">🏆</div>
        <p className="text-xl font-display font-bold text-text">Workout Logged!</p>
        <p className="text-text-muted text-sm">Great work! Come back tomorrow for your next session.</p>
        <Button variant="primary" onClick={() => { setPlan(null); setDone(false); }}>
          Plan Another Workout
        </Button>
      </div>
    );
  }

  if (plan) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-display font-bold text-text">{plan.name}</h3>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-xs text-text-muted flex items-center gap-1">
                <Timer className="w-3 h-3" />{plan.totalMins} min
              </span>
              <span className="text-xs text-text-muted flex items-center gap-1">
                <Flame className="w-3 h-3 text-danger" />~{plan.estimatedCalories} cal
              </span>
              <span className="text-xs text-text-muted flex items-center gap-1">
                <Dumbbell className="w-3 h-3" />{plan.exercises.length} exercises
              </span>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setPlan(null)}>Change</Button>
        </div>

        {/* Exercise preview */}
        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
          {plan.exercises.map((ex, i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-bg-elevated rounded-xl border border-border">
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-bold flex items-center justify-center">
                  {i + 1}
                </span>
                <div>
                  <p className="text-sm font-medium text-text">{ex.name}</p>
                  <p className="text-xs text-text-muted">{ex.muscles[0]} · {ex.reps || `${ex.durationSecs}s`}</p>
                </div>
              </div>
              <Badge variant="common" size="sm">{ex.type}</Badge>
            </div>
          ))}
        </div>

        <WorkoutTimer
          plan={plan}
          onComplete={handleComplete}
          onCancel={() => setPlan(null)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Goal */}
      <div>
        <p className="text-sm font-semibold text-text mb-2">Workout Goal</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {GOALS.map((g) => (
            <button
              key={g.id}
              onClick={() => setGoal(g.id)}
              className={cn(
                "flex items-center gap-2 p-3 rounded-xl border text-left transition-all",
                goal === g.id ? "border-primary bg-primary/10" : "border-border bg-bg-elevated hover:border-primary/30"
              )}
            >
              <span className="text-xl">{g.icon}</span>
              <div>
                <p className={cn("text-sm font-semibold", goal === g.id ? "text-primary" : "text-text")}>{g.label}</p>
                <p className="text-xs text-text-muted">{g.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Duration */}
      <div>
        <p className="text-sm font-semibold text-text mb-2">Duration</p>
        <div className="flex gap-2 flex-wrap">
          {DURATIONS.map((d) => (
            <button
              key={d}
              onClick={() => setDuration(d)}
              className={cn(
                "px-4 py-2 rounded-xl border text-sm font-medium transition-all",
                duration === d ? "border-primary bg-primary/10 text-primary" : "border-border bg-bg-elevated text-text-muted hover:border-primary/30"
              )}
            >
              {d} min
            </button>
          ))}
        </div>
      </div>

      {/* Level */}
      <div>
        <p className="text-sm font-semibold text-text mb-2">Your Level</p>
        <div className="grid grid-cols-3 gap-2">
          {LEVELS.map((l) => (
            <button
              key={l.id}
              onClick={() => setLevel(l.id as "beginner"|"intermediate"|"advanced")}
              className={cn(
                "p-3 rounded-xl border text-center transition-all",
                level === l.id ? "border-primary bg-primary/10" : "border-border bg-bg-elevated hover:border-primary/30"
              )}
            >
              <p className={cn("text-sm font-semibold", level === l.id ? "text-primary" : "text-text")}>{l.label}</p>
              <p className="text-xs text-text-muted">{l.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Equipment */}
      <div>
        <p className="text-sm font-semibold text-text mb-2">Equipment Available</p>
        <div className="grid grid-cols-3 gap-2">
          {EQUIPMENT.map((e) => (
            <button
              key={e.id}
              onClick={() => setEquipment(e.id as "none"|"home"|"gym")}
              className={cn(
                "p-3 rounded-xl border text-center transition-all",
                equipment === e.id ? "border-primary bg-primary/10" : "border-border bg-bg-elevated hover:border-primary/30"
              )}
            >
              <p className={cn("text-sm font-semibold", equipment === e.id ? "text-primary" : "text-text")}>{e.label}</p>
              <p className="text-xs text-text-muted">{e.desc}</p>
            </button>
          ))}
        </div>
      </div>

      <Button variant="primary" fullWidth size="lg" onClick={generate}>
        <Zap className="w-4 h-4" /> Generate My Workout
      </Button>
    </div>
  );
}
