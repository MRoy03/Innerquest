"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { saveBrainSession } from "@/app/actions/user";

const ROUNDS = 5;
const MIN_DELAY = 800;
const MAX_DELAY = 3000;

type Phase = "idle" | "waiting" | "ready" | "tapped" | "done";

export function TapTargetGame() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [round, setRound] = useState(0);
  const [reactionTimes, setReactionTimes] = useState<number[]>([]);
  const [startTime, setStartTime] = useState(0);
  const [lastReaction, setLastReaction] = useState(0);
  const [tooEarly, setTooEarly] = useState(false);
  const [xpResult, setXpResult] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  const startRound = useCallback(() => {
    setTooEarly(false);
    setPhase("waiting");
    const delay = MIN_DELAY + Math.random() * (MAX_DELAY - MIN_DELAY);
    setTimeout(() => {
      setStartTime(Date.now());
      setPhase("ready");
    }, delay);
  }, []);

  function handleTap() {
    if (phase === "waiting") {
      setTooEarly(true);
      setPhase("tapped");
      setTimeout(() => {
        if (round < ROUNDS) { setRound((r) => r + 1); startRound(); }
      }, 1000);
      return;
    }
    if (phase !== "ready") return;
    const rt = Date.now() - startTime;
    setLastReaction(rt);
    const newTimes = [...reactionTimes, rt];
    setReactionTimes(newTimes);
    setPhase("tapped");
    if (newTimes.length >= ROUNDS) {
      setTimeout(() => finish(newTimes), 1000);
    } else {
      setTimeout(() => { setRound((r) => r + 1); startRound(); }, 1000);
    }
  }

  async function finish(times: number[]) {
    setPhase("done");
    const avg = Math.round(times.reduce((a, b) => a + b, 0) / times.length);
    const xp = 40 + (avg < 300 ? 20 : avg < 500 ? 10 : 0);
    setSaving(true);
    const accuracy = Math.round(Math.max(0, 100 - (avg - 200) / 10));
    await saveBrainSession({ gameName: "tap-target", score: avg, accuracyPct: accuracy, durationSecs: ROUNDS * 2, xpEarned: xp });
    setSaving(false);
    setXpResult(xp);
  }

  function reset() {
    setPhase("idle"); setRound(0); setReactionTimes([]); setStartTime(0); setLastReaction(0); setXpResult(null);
  }

  useEffect(() => {
    if (phase === "ready") {
      const safety = setTimeout(() => { if (phase === "ready") setPhase("tapped"); }, 5000);
      return () => clearTimeout(safety);
    }
  }, [phase]);

  if (phase === "done" || xpResult !== null) {
    const valid = reactionTimes.filter((_, i) => i < ROUNDS);
    const avg = valid.length ? Math.round(valid.reduce((a, b) => a + b, 0) / valid.length) : 0;
    const grade = avg < 300 ? "A+" : avg < 500 ? "A" : avg < 700 ? "B" : "C";
    return (
      <div className="flex flex-col items-center gap-6 py-8 text-center">
        <div className="text-5xl">⚡</div>
        <p className="text-2xl font-display font-bold text-text">Results</p>
        <p className="text-text-muted">Average reaction: <span className="text-primary font-bold">{avg}ms</span></p>
        <div className="flex items-center gap-4">
          <Badge variant={grade === "A+" ? "legendary" : grade === "A" ? "epic" : "rare"}>{grade}</Badge>
          <span className="text-gold font-bold">+{xpResult ?? "…"} XP {saving ? "(saving…)" : ""}</span>
        </div>
        <Button variant="primary" onClick={reset}>Play Again</Button>
      </div>
    );
  }

  if (phase === "idle") {
    return (
      <div className="flex flex-col items-center gap-6 py-8 text-center">
        <p className="text-text-muted text-sm max-w-xs">
          Tap the target the INSTANT it turns green. React fast!
        </p>
        <Badge variant="default">{ROUNDS} rounds</Badge>
        <Button variant="primary" size="lg" onClick={() => { setRound(1); startRound(); }}>Start</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6 py-4 text-center">
      <div className="flex items-center gap-4">
        <Badge variant="rare">Round {round}/{ROUNDS}</Badge>
        {phase === "tapped" && !tooEarly && lastReaction > 0 && (
          <span className="text-xs text-success font-semibold">{lastReaction}ms</span>
        )}
        {tooEarly && <span className="text-xs text-danger font-semibold">Too early!</span>}
      </div>

      <button
        onClick={handleTap}
        className={`w-40 h-40 rounded-full border-4 text-2xl font-display font-bold transition-all duration-100 select-none
          ${phase === "waiting" ? "bg-bg-elevated border-border text-text-muted cursor-wait" : ""}
          ${phase === "ready" ? "bg-success border-success text-bg shadow-[0_0_40px_rgba(63,185,80,0.6)] scale-110 cursor-pointer animate-pulse" : ""}
          ${phase === "tapped" ? (tooEarly ? "bg-danger/20 border-danger text-danger" : "bg-primary/20 border-primary text-primary") : ""}
        `}
      >
        {phase === "waiting" ? "Wait…" : phase === "ready" ? "TAP!" : tooEarly ? "Early!" : `${lastReaction}ms`}
      </button>

      {phase === "waiting" && (
        <p className="text-xs text-text-subtle">Don't tap yet — wait for green!</p>
      )}
    </div>
  );
}
