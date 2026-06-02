"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { saveBrainSession } from "@/app/actions/user";
import { cn } from "@/lib/utils";

const GRID_SIZE = 4;
const TOTAL_CELLS = GRID_SIZE * GRID_SIZE;
const ACTIVE_CELLS = 5;
const SHOW_MS = 1800;
const ROUNDS = 3;

type Phase = "idle" | "showing" | "input" | "result" | "done";

function randomPattern(): number[] {
  const all = Array.from({ length: TOTAL_CELLS }, (_, i) => i);
  for (let i = all.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [all[i], all[j]] = [all[j], all[i]];
  }
  return all.slice(0, ACTIVE_CELLS);
}

export function GridGame() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [round, setRound] = useState(0);
  const [pattern, setPattern] = useState<number[]>([]);
  const [userInput, setUserInput] = useState<number[]>([]);
  const [scores, setScores] = useState<number[]>([]);
  const [timer, setTimer] = useState(SHOW_MS / 1000);
  const [saving, setSaving] = useState(false);
  const [xpResult, setXpResult] = useState<number | null>(null);

  const startRound = useCallback(() => {
    const p = randomPattern();
    setPattern(p);
    setUserInput([]);
    setTimer(SHOW_MS / 1000);
    setPhase("showing");
  }, []);

  useEffect(() => {
    if (phase !== "showing") return;
    const timeout = setTimeout(() => setPhase("input"), SHOW_MS);
    const interval = setInterval(() => setTimer((t) => Math.max(0, t - 0.1)), 100);
    return () => { clearTimeout(timeout); clearInterval(interval); };
  }, [phase]);

  function handleCellClick(idx: number) {
    if (phase !== "input") return;
    if (userInput.includes(idx)) {
      setUserInput((prev) => prev.filter((i) => i !== idx));
    } else if (userInput.length < ACTIVE_CELLS) {
      const next = [...userInput, idx];
      setUserInput(next);
      if (next.length === ACTIVE_CELLS) evaluate(next);
    }
  }

  function evaluate(input: number[]) {
    const correct = input.filter((i) => pattern.includes(i)).length;
    const pct = Math.round((correct / ACTIVE_CELLS) * 100);
    const newScores = [...scores, pct];
    setScores(newScores);
    setPhase("result");
    if (newScores.length >= ROUNDS) {
      setTimeout(() => finish(newScores), 1200);
    } else {
      setTimeout(() => { setRound((r) => r + 1); startRound(); }, 1200);
    }
  }

  async function finish(finalScores: number[]) {
    setPhase("done");
    const avg = Math.round(finalScores.reduce((a, b) => a + b, 0) / finalScores.length);
    const xp = 40 + (avg >= 90 ? 20 : avg >= 70 ? 10 : 0);
    setSaving(true);
    await saveBrainSession({ gameName: "grid", score: avg, accuracyPct: avg, durationSecs: ROUNDS * 3, xpEarned: xp });
    setSaving(false);
    setXpResult(xp);
  }

  function reset() {
    setPhase("idle"); setRound(0); setPattern([]); setUserInput([]); setScores([]); setXpResult(null);
  }

  if (phase === "done" || xpResult !== null) {
    const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    const grade = avg >= 90 ? "A+" : avg >= 70 ? "A" : avg >= 50 ? "B" : "C";
    return (
      <div className="flex flex-col items-center gap-6 py-8 text-center">
        <div className="text-5xl">🧠</div>
        <div>
          <p className="text-2xl font-display font-bold text-text mb-1">Round Complete!</p>
          <p className="text-text-muted text-sm">Average accuracy: {avg}%</p>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant={grade === "A+" ? "legendary" : grade === "A" ? "epic" : "rare"} size="md">
            Grade {grade}
          </Badge>
          <span className="text-gold font-bold">+{xpResult ?? "…"} XP {saving ? "(saving…)" : "earned"}</span>
        </div>
        <Button variant="primary" onClick={reset}>Play Again</Button>
      </div>
    );
  }

  if (phase === "idle") {
    return (
      <div className="flex flex-col items-center gap-6 py-8 text-center">
        <p className="text-text-muted text-sm max-w-xs">
          A 4×4 grid will light up {ACTIVE_CELLS} cells for {SHOW_MS / 1000}s. Memorize and tap them after.
        </p>
        <Badge variant="default">{ROUNDS} rounds</Badge>
        <Button variant="primary" size="lg" onClick={() => { setRound(1); startRound(); }}>
          Start
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex items-center gap-4">
        <Badge variant="rare">Round {round}/{ROUNDS}</Badge>
        {phase === "showing" && (
          <span className="text-xs text-primary font-semibold animate-pulse">
            Memorize! ({timer.toFixed(1)}s)
          </span>
        )}
        {phase === "input" && (
          <span className="text-xs text-gold font-semibold">
            Tap {ACTIVE_CELLS - userInput.length} more cells
          </span>
        )}
        {phase === "result" && (
          <span className="text-xs text-success font-semibold">
            {scores[scores.length - 1]}% correct
          </span>
        )}
      </div>

      <div className="grid grid-cols-4 gap-2">
        {Array.from({ length: TOTAL_CELLS }, (_, i) => {
          const isActive = pattern.includes(i);
          const isSelected = userInput.includes(i);
          const isCorrect = phase === "result" && isSelected && isActive;
          const isWrong = phase === "result" && isSelected && !isActive;
          const isMissed = phase === "result" && !isSelected && isActive;

          return (
            <button
              key={i}
              onClick={() => handleCellClick(i)}
              disabled={phase !== "input"}
              className={cn(
                "w-14 h-14 rounded-xl border-2 transition-all duration-150",
                phase === "showing" && isActive && "bg-primary border-primary shadow-[0_0_12px_rgba(78,205,196,0.5)]",
                phase === "showing" && !isActive && "bg-bg-elevated border-border",
                phase === "input" && isSelected && "bg-primary/30 border-primary",
                phase === "input" && !isSelected && "bg-bg-elevated border-border hover:border-primary/50",
                isCorrect && "bg-success/30 border-success",
                isWrong && "bg-danger/30 border-danger",
                isMissed && "bg-primary/20 border-primary/50",
                phase === "result" && !isCorrect && !isWrong && !isMissed && "bg-bg-elevated border-border",
              )}
            />
          );
        })}
      </div>
    </div>
  );
}
