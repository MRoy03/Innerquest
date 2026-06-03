"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Badge } from "@/components/ui/Badge";
import type { Exercise, WorkoutPlan } from "@/lib/data/exercises";
import { CheckCircle2, ChevronRight, Play, Pause, SkipForward, Flame } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  plan: WorkoutPlan;
  onComplete: (caloriesBurned: number) => void;
  onCancel: () => void;
}

type TimerPhase = "work" | "rest" | "done";

export function WorkoutTimer({ plan, onComplete, onCancel }: Props) {
  const [exIdx, setExIdx] = useState(0);
  const [timerPhase, setTimerPhase] = useState<TimerPhase>("work");
  const [timeLeft, setTimeLeft] = useState(plan.exercises[0]?.durationSecs ?? 0);
  const [paused, setPaused] = useState(false);
  const [completedIds, setCompletedIds] = useState<number[]>([]);
  const [showInstructions, setShowInstructions] = useState(true);

  const exercise: Exercise | undefined = plan.exercises[exIdx];
  const isLastExercise = exIdx >= plan.exercises.length - 1;
  const totalExercises = plan.exercises.length;
  const overallProgress = Math.round(((exIdx + (timerPhase === "rest" ? 1 : 0)) / totalExercises) * 100);

  useEffect(() => {
    if (paused || timerPhase === "done" || !exercise) return;
    if (timeLeft <= 0) {
      if (timerPhase === "work") {
        setCompletedIds((prev) => [...prev, exIdx]);
        if (isLastExercise) {
          setTimerPhase("done");
        } else {
          setTimerPhase("rest");
          setTimeLeft(exercise.restSecs);
        }
      } else {
        // rest over — next exercise
        const next = exIdx + 1;
        setExIdx(next);
        setTimerPhase("work");
        setTimeLeft(plan.exercises[next]?.durationSecs ?? 0);
        setShowInstructions(true);
      }
      return;
    }
    const t = setTimeout(() => setTimeLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, paused, timerPhase, exIdx, isLastExercise, exercise, plan.exercises]);

  function skipRest() {
    if (timerPhase !== "rest") return;
    const next = exIdx + 1;
    setExIdx(next);
    setTimerPhase("work");
    setTimeLeft(plan.exercises[next]?.durationSecs ?? 0);
    setShowInstructions(true);
  }

  if (timerPhase === "done") {
    const calories = plan.estimatedCalories;
    return (
      <div className="flex flex-col items-center gap-6 py-6 text-center">
        <div className="text-5xl">🏆</div>
        <div>
          <p className="text-2xl font-display font-bold text-text">Workout Complete!</p>
          <p className="text-text-muted mt-1">{plan.name}</p>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-center">
            <p className="text-2xl font-bold text-gold">{totalExercises}</p>
            <p className="text-xs text-text-muted">exercises</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-danger">{calories}</p>
            <p className="text-xs text-text-muted">cal burned</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">{plan.totalMins}</p>
            <p className="text-xs text-text-muted">minutes</p>
          </div>
        </div>
        <Button variant="primary" onClick={() => onComplete(calories)}>
          Log Workout & Earn XP
        </Button>
      </div>
    );
  }

  if (!exercise) return null;

  const totalTime = timerPhase === "work" ? exercise.durationSecs : exercise.restSecs;
  const progress = Math.round(((totalTime - timeLeft) / totalTime) * 100);

  return (
    <div className="space-y-5">
      {/* Overall progress */}
      <div>
        <div className="flex justify-between text-xs text-text-muted mb-1.5">
          <span>Exercise {exIdx + 1} / {totalExercises}</span>
          <span>{overallProgress}% complete</span>
        </div>
        <ProgressBar value={overallProgress} color="primary" size="sm" />
      </div>

      {/* Exercise list mini */}
      <div className="flex gap-1.5 flex-wrap">
        {plan.exercises.map((ex, i) => (
          <div
            key={i}
            className={cn(
              "w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold border transition-all",
              completedIds.includes(i) ? "bg-success/20 border-success text-success" :
              i === exIdx ? "bg-primary/20 border-primary text-primary" :
              "bg-bg-elevated border-border text-text-subtle"
            )}
          >
            {completedIds.includes(i) ? "✓" : i + 1}
          </div>
        ))}
      </div>

      {/* Timer + exercise */}
      <div className={cn(
        "rounded-2xl border p-6 text-center",
        timerPhase === "rest" ? "bg-bg-elevated border-border" : "bg-bg-card border-primary/20"
      )}>
        {timerPhase === "rest" ? (
          <>
            <p className="text-sm font-semibold text-text-muted mb-2">REST</p>
            <p className="text-6xl font-display font-bold text-gold mb-2">{timeLeft}s</p>
            <p className="text-text-muted text-sm mb-4">Next: {plan.exercises[exIdx + 1]?.name}</p>
            <ProgressBar value={progress} color="gold" size="md" />
            <Button variant="ghost" size="sm" className="mt-3" onClick={skipRest}>
              Skip Rest <SkipForward className="w-3.5 h-3.5" />
            </Button>
          </>
        ) : (
          <>
            <Badge variant="rare" className="mb-3">{exercise.type.toUpperCase()}</Badge>
            <p className="text-xl font-display font-bold text-text mb-1">{exercise.name}</p>
            {exercise.reps && <p className="text-xs text-text-muted mb-2">{exercise.reps}</p>}
            <p className="text-6xl font-display font-bold text-primary my-4">{timeLeft}s</p>
            <ProgressBar value={progress} color="primary" size="md" />
            <div className="flex items-center justify-center gap-2 mt-2 text-xs text-text-muted">
              <Flame className="w-3 h-3 text-danger" />
              <span>{exercise.caloriesPerMin} cal/min · {exercise.muscles.join(", ")}</span>
            </div>
          </>
        )}
      </div>

      {/* Instructions toggle */}
      {timerPhase === "work" && (
        <div>
          <button
            onClick={() => setShowInstructions((v) => !v)}
            className="flex items-center gap-1.5 text-xs text-primary hover:text-primary-dark font-medium mb-2"
          >
            <ChevronRight className={cn("w-3.5 h-3.5 transition-transform", showInstructions && "rotate-90")} />
            How to do it
          </button>
          {showInstructions && (
            <div className="bg-bg-elevated border border-border rounded-xl p-4 space-y-2">
              {exercise.instructions.map((step, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-primary/20 text-primary text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <p className="text-sm text-text">{step}</p>
                </div>
              ))}
              {exercise.tip && (
                <div className="mt-2 pt-2 border-t border-border flex items-start gap-2">
                  <span className="text-gold text-xs">💡</span>
                  <p className="text-xs text-text-muted italic">{exercise.tip}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center gap-3">
        <Button
          variant={paused ? "primary" : "secondary"}
          onClick={() => setPaused((v) => !v)}
          fullWidth
        >
          {paused ? <><Play className="w-4 h-4" /> Resume</> : <><Pause className="w-4 h-4" /> Pause</>}
        </Button>
        <Button variant="ghost" size="sm" onClick={onCancel}>Quit</Button>
      </div>
    </div>
  );
}
