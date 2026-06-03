"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

const TECHNIQUES = [
  {
    id: "478",
    name: "4-7-8 Breathing",
    desc: "Reduces anxiety, promotes sleep",
    rounds: 4,
    phases: [
      { label: "Inhale", secs: 4,  color: "bg-primary",  instruction: "Breathe in slowly through your nose" },
      { label: "Hold",   secs: 7,  color: "bg-gold",     instruction: "Hold your breath gently" },
      { label: "Exhale", secs: 8,  color: "bg-[#BC8CFF]",instruction: "Exhale completely through your mouth" },
    ],
  },
  {
    id: "box",
    name: "Box Breathing",
    desc: "Improves focus, reduces stress",
    rounds: 5,
    phases: [
      { label: "Inhale", secs: 4, color: "bg-primary",  instruction: "Inhale through nose for 4 seconds" },
      { label: "Hold",   secs: 4, color: "bg-gold",     instruction: "Hold at the top" },
      { label: "Exhale", secs: 4, color: "bg-[#BC8CFF]",instruction: "Exhale through mouth for 4 seconds" },
      { label: "Hold",   secs: 4, color: "bg-success",  instruction: "Hold at the bottom" },
    ],
  },
  {
    id: "deep",
    name: "Deep Relaxation",
    desc: "Calm the nervous system",
    rounds: 6,
    phases: [
      { label: "Inhale", secs: 5, color: "bg-primary",  instruction: "Breathe deep into your belly" },
      { label: "Exhale", secs: 7, color: "bg-[#BC8CFF]",instruction: "Release slowly, let go of tension" },
    ],
  },
];

interface Props {
  onComplete?: (xpEarned: number) => void;
}

export function BreathingTimer({ onComplete }: Props) {
  const [selected, setSelected] = useState(TECHNIQUES[0]);
  const [phase, setPhase] = useState<"idle" | "running" | "done">("idle");
  const [currentRound, setCurrentRound] = useState(0);
  const [currentPhaseIdx, setCurrentPhaseIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [totalRoundsLeft, setTotalRoundsLeft] = useState(0);

  const currentPhase = selected.phases[currentPhaseIdx];
  const totalPhases = selected.phases.length;
  const totalSecsPerRound = selected.phases.reduce((s, p) => s + p.secs, 0);
  const totalSecs = totalSecsPerRound * selected.rounds;
  const elapsed =
    (selected.rounds - totalRoundsLeft) * totalSecsPerRound +
    selected.phases.slice(0, currentPhaseIdx).reduce((s, p) => s + p.secs, 0) +
    (currentPhase ? currentPhase.secs - timeLeft : 0);
  const overallProgress = totalSecs > 0 ? Math.round((elapsed / totalSecs) * 100) : 0;

  const start = useCallback(() => {
    setCurrentRound(1);
    setCurrentPhaseIdx(0);
    setTotalRoundsLeft(selected.rounds);
    setTimeLeft(selected.phases[0].secs);
    setPhase("running");
  }, [selected]);

  useEffect(() => {
    if (phase !== "running") return;
    if (timeLeft <= 0) {
      // advance phase
      const nextPhaseIdx = (currentPhaseIdx + 1) % totalPhases;
      if (nextPhaseIdx === 0) {
        // completed one round
        if (totalRoundsLeft <= 1) {
          setPhase("done");
          return;
        }
        setTotalRoundsLeft((r) => r - 1);
        setCurrentRound((r) => r + 1);
      }
      setCurrentPhaseIdx(nextPhaseIdx);
      setTimeLeft(selected.phases[nextPhaseIdx].secs);
      return;
    }
    const t = setTimeout(() => setTimeLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, timeLeft, currentPhaseIdx, totalPhases, totalRoundsLeft, selected.phases]);

  function reset() {
    setPhase("idle");
    setCurrentRound(0);
    setCurrentPhaseIdx(0);
    setTimeLeft(0);
    setTotalRoundsLeft(0);
  }

  if (phase === "done") {
    const xp = 40;
    return (
      <div className="flex flex-col items-center gap-5 py-6 text-center">
        <div className="text-5xl">🧘</div>
        <div>
          <p className="text-xl font-display font-bold text-text">Session Complete!</p>
          <p className="text-text-muted text-sm mt-1">{selected.rounds} rounds of {selected.name}</p>
        </div>
        <p className="text-sm text-success font-semibold">+{xp} XP earned</p>
        <div className="flex gap-3">
          <Button variant="primary" onClick={() => { reset(); onComplete?.(xp); }}>
            Mark Quest Done
          </Button>
          <Button variant="ghost" onClick={reset}>Again</Button>
        </div>
      </div>
    );
  }

  if (phase === "idle") {
    return (
      <div className="space-y-5">
        <div className="grid grid-cols-1 gap-2">
          {TECHNIQUES.map((t) => (
            <button
              key={t.id}
              onClick={() => setSelected(t)}
              className={cn(
                "flex items-start gap-3 p-3 rounded-xl border text-left transition-all",
                selected.id === t.id
                  ? "border-primary bg-primary/10"
                  : "border-border bg-bg-elevated hover:border-primary/30"
              )}
            >
              <div className="mt-0.5">
                <div className={cn("w-3 h-3 rounded-full border-2", selected.id === t.id ? "border-primary bg-primary" : "border-border")} />
              </div>
              <div>
                <p className="text-sm font-semibold text-text">{t.name}</p>
                <p className="text-xs text-text-muted">{t.desc} · {t.rounds} rounds · {Math.round(t.rounds * t.phases.reduce((s, p) => s + p.secs, 0) / 60)} min</p>
              </div>
            </button>
          ))}
        </div>
        <Button variant="primary" fullWidth size="lg" onClick={start}>
          Start Breathing Exercise
        </Button>
      </div>
    );
  }

  // Running
  const circleSize = 160;
  const progress = currentPhase ? ((currentPhase.secs - timeLeft) / currentPhase.secs) * 100 : 0;
  const phaseColorClass = currentPhase?.color ?? "bg-primary";

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex items-center gap-3 text-sm text-text-muted">
        <span>Round {currentRound}/{selected.rounds}</span>
        <span>·</span>
        <span>{overallProgress}% complete</span>
      </div>

      {/* Animated breathing circle */}
      <div className="relative flex items-center justify-center" style={{ width: circleSize * 1.4, height: circleSize * 1.4 }}>
        {/* Pulse ring */}
        <div
          className={cn("absolute rounded-full opacity-20 transition-all duration-1000", phaseColorClass)}
          style={{
            width: currentPhase?.label === "Inhale" ? circleSize * 1.35 : circleSize * 0.95,
            height: currentPhase?.label === "Inhale" ? circleSize * 1.35 : circleSize * 0.95,
          }}
        />
        {/* Main circle */}
        <div
          className={cn("rounded-full flex flex-col items-center justify-center transition-all duration-1000 border-4", phaseColorClass, "border-white/20")}
          style={{
            width: currentPhase?.label === "Inhale" ? circleSize : currentPhase?.label === "Exhale" ? circleSize * 0.75 : circleSize * 0.9,
            height: currentPhase?.label === "Inhale" ? circleSize : currentPhase?.label === "Exhale" ? circleSize * 0.75 : circleSize * 0.9,
          }}
        >
          <span className="text-4xl font-display font-bold text-white">{timeLeft}</span>
          <span className="text-sm font-semibold text-white/80">{currentPhase?.label}</span>
        </div>
      </div>

      {/* Instruction */}
      <div className="text-center">
        <p className="text-text font-medium">{currentPhase?.instruction}</p>
        <p className="text-xs text-text-muted mt-1">
          Phase {currentPhaseIdx + 1}/{totalPhases} · {selected.name}
        </p>
      </div>

      {/* Phase indicators */}
      <div className="flex gap-2">
        {selected.phases.map((p, i) => (
          <div
            key={i}
            className={cn(
              "h-1.5 rounded-full transition-all",
              i === currentPhaseIdx ? `${phaseColorClass} w-8` : "bg-border w-4"
            )}
          />
        ))}
      </div>

      <Button variant="ghost" size="sm" onClick={reset}>Stop</Button>
    </div>
  );
}
