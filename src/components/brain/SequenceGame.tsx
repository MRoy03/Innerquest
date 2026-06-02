"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { saveBrainSession } from "@/app/actions/user";

const SEQ_LENGTH = 6;
const SHOW_MS = 2500;
const ROUNDS = 3;

function randomSequence() {
  return Array.from({ length: SEQ_LENGTH }, () => Math.floor(Math.random() * 9) + 1);
}

type Phase = "idle" | "showing" | "input" | "result" | "done";

export function SequenceGame() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [round, setRound] = useState(0);
  const [sequence, setSequence] = useState<number[]>([]);
  const [input, setInput] = useState("");
  const [scores, setScores] = useState<number[]>([]);
  const [saving, setSaving] = useState(false);
  const [xpResult, setXpResult] = useState<number | null>(null);

  const startRound = useCallback(() => {
    setSequence(randomSequence());
    setInput("");
    setPhase("showing");
  }, []);

  useEffect(() => {
    if (phase !== "showing") return;
    const t = setTimeout(() => setPhase("input"), SHOW_MS);
    return () => clearTimeout(t);
  }, [phase]);

  function handleSubmit() {
    const reversed = [...sequence].reverse().join("");
    const userTrimmed = input.trim().replace(/\s/g, "");
    const correct = userTrimmed === reversed;
    const newScores = [...scores, correct ? 100 : 0];
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
    const xp = 40 + (avg === 100 ? 20 : avg >= 67 ? 10 : 0);
    setSaving(true);
    await saveBrainSession({ gameName: "sequence", score: avg, accuracyPct: avg, durationSecs: ROUNDS * 4, xpEarned: xp });
    setSaving(false);
    setXpResult(xp);
  }

  function reset() {
    setPhase("idle"); setRound(0); setSequence([]); setInput(""); setScores([]); setXpResult(null);
  }

  if (phase === "done" || xpResult !== null) {
    const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    const grade = avg === 100 ? "A+" : avg >= 67 ? "A" : "B";
    return (
      <div className="flex flex-col items-center gap-6 py-8 text-center">
        <div className="text-5xl">🔢</div>
        <p className="text-2xl font-display font-bold text-text">Done!</p>
        <p className="text-text-muted">{scores.filter((s) => s === 100).length}/{ROUNDS} correct</p>
        <div className="flex items-center gap-4">
          <Badge variant={grade === "A+" ? "legendary" : "epic"}>{grade}</Badge>
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
          A {SEQ_LENGTH}-digit sequence will appear for {SHOW_MS / 1000}s. Type it back in reverse.
        </p>
        <Badge variant="default">{ROUNDS} rounds</Badge>
        <Button variant="primary" size="lg" onClick={() => { setRound(1); startRound(); }}>Start</Button>
      </div>
    );
  }

  if (phase === "showing") {
    return (
      <div className="flex flex-col items-center gap-6 py-8 text-center">
        <Badge variant="rare" className="animate-pulse">Memorize!</Badge>
        <div className="flex gap-3">
          {sequence.map((n, i) => (
            <div
              key={i}
              className="w-12 h-14 rounded-xl bg-primary/20 border-2 border-primary flex items-center justify-center text-2xl font-display font-bold text-primary"
            >
              {n}
            </div>
          ))}
        </div>
        <p className="text-xs text-text-muted">Remember to reverse it!</p>
      </div>
    );
  }

  const reversed = [...sequence].reverse().join("");
  const isCorrect = phase === "result" && input.trim().replace(/\s/g, "") === reversed;

  return (
    <div className="flex flex-col items-center gap-6 py-4 text-center">
      <Badge variant="rare">Round {round}/{ROUNDS}</Badge>

      {phase === "input" && (
        <>
          <p className="text-text-muted text-sm">Type the sequence in reverse:</p>
          <div className="flex gap-2">
            {sequence.map((_, i) => (
              <div key={i} className="w-10 h-12 rounded-lg bg-bg-elevated border border-border flex items-center justify-center text-lg font-bold text-text">
                {input[i] ?? ""}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-2 w-48">
            {[1,2,3,4,5,6,7,8,9].map((n) => (
              <button
                key={n}
                onClick={() => input.length < SEQ_LENGTH && setInput((v) => v + n)}
                className="h-12 rounded-xl bg-bg-elevated border border-border text-text font-bold hover:border-primary hover:bg-primary/10 transition-all"
              >
                {n}
              </button>
            ))}
            <button onClick={() => setInput((v) => v.slice(0, -1))} className="h-12 rounded-xl bg-bg-elevated border border-border text-text-muted hover:border-danger col-span-2 transition-all">
              ⌫
            </button>
            <button
              onClick={handleSubmit}
              disabled={input.length !== SEQ_LENGTH}
              className="h-12 rounded-xl bg-primary text-bg font-bold hover:bg-primary-dark disabled:opacity-40 transition-all"
            >
              ✓
            </button>
          </div>
        </>
      )}

      {phase === "result" && (
        <div className={`text-lg font-bold ${isCorrect ? "text-success" : "text-danger"}`}>
          {isCorrect ? "Correct! ✓" : `Wrong — was ${reversed}`}
        </div>
      )}
    </div>
  );
}
