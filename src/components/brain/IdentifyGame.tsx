"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { saveBrainSession } from "@/app/actions/user";
import { cn } from "@/lib/utils";

const ROUNDS = 5;

type PatternType = "numeric" | "color" | "shape";

interface Round {
  sequence: string[];
  options: string[];
  answer: string;
  type: PatternType;
}

const COLORS = ["🔴", "🟢", "🔵", "🟡", "🟣", "🟠"];
const SHAPES = ["●", "■", "▲", "◆", "★", "✦"];

function generateRound(): Round {
  const type: PatternType = (["numeric", "color", "shape"] as PatternType[])[
    Math.floor(Math.random() * 3)
  ];

  if (type === "numeric") {
    const start = Math.floor(Math.random() * 5) + 1;
    const step = Math.floor(Math.random() * 4) + 1;
    const seq = Array.from({ length: 4 }, (_, i) => String(start + i * step));
    const answer = String(start + 4 * step);
    const wrong = Array.from({ length: 3 }, (_, i) => String(start + (4 + i + 1) * step + Math.floor(Math.random() * 3) - 1)).filter((v) => v !== answer);
    const opts = [answer, ...wrong.slice(0, 3)].sort(() => Math.random() - 0.5);
    return { sequence: seq, options: opts, answer, type };
  }

  if (type === "color") {
    const pool = [...COLORS];
    const picked = pool.sort(() => Math.random() - 0.5).slice(0, 4);
    const seq = picked.slice(0, 3);
    const answer = picked[3];
    const wrong = pool.filter((c) => !picked.includes(c)).slice(0, 3);
    const opts = [answer, ...wrong].sort(() => Math.random() - 0.5);
    return { sequence: seq, options: opts, answer, type };
  }

  // shape
  const pool = [...SHAPES];
  const pattern = pool[Math.floor(Math.random() * pool.length)];
  const distractors = pool.filter((s) => s !== pattern);
  const seq = [pattern, distractors[0], pattern, distractors[1]];
  const answer = pattern;
  const opts = [answer, ...distractors.slice(0, 3)].sort(() => Math.random() - 0.5);
  return { sequence: seq, options: opts, answer, type };
}

export function IdentifyGame() {
  const [phase, setPhase] = useState<"idle" | "playing" | "done">("idle");
  const [rounds, setRounds] = useState<Round[]>([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<boolean[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [xpResult, setXpResult] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  function start() {
    const rs = Array.from({ length: ROUNDS }, generateRound);
    setRounds(rs);
    setCurrent(0);
    setAnswers([]);
    setSelected(null);
    setPhase("playing");
  }

  function pick(opt: string) {
    if (selected) return;
    setSelected(opt);
    const correct = opt === rounds[current].answer;
    const newAnswers = [...answers, correct];
    setAnswers(newAnswers);
    setTimeout(() => {
      if (newAnswers.length >= ROUNDS) {
        finishGame(newAnswers);
      } else {
        setCurrent((c) => c + 1);
        setSelected(null);
      }
    }, 800);
  }

  async function finishGame(finalAnswers: boolean[]) {
    setPhase("done");
    const correct = finalAnswers.filter(Boolean).length;
    const pct = Math.round((correct / ROUNDS) * 100);
    const xp = 40 + (pct === 100 ? 20 : pct >= 80 ? 10 : 0);
    setSaving(true);
    await saveBrainSession({ gameName: "identify", score: correct, accuracyPct: pct, durationSecs: ROUNDS * 5, xpEarned: xp });
    setSaving(false);
    setXpResult(xp);
  }

  if (phase === "idle") return (
    <div className="flex flex-col items-center gap-6 py-8 text-center">
      <p className="text-text-muted text-sm max-w-xs">Identify the next item in each pattern sequence.</p>
      <Badge variant="default">{ROUNDS} rounds</Badge>
      <Button variant="primary" size="lg" onClick={start}>Start</Button>
    </div>
  );

  if (phase === "done") {
    const correct = answers.filter(Boolean).length;
    const grade = correct === ROUNDS ? "A+" : correct >= 4 ? "A" : correct >= 3 ? "B" : "C";
    return (
      <div className="flex flex-col items-center gap-6 py-8 text-center">
        <div className="text-5xl">🔍</div>
        <p className="text-2xl font-display font-bold text-text">Done!</p>
        <p className="text-text-muted">{correct}/{ROUNDS} correct</p>
        <div className="flex items-center gap-4">
          <Badge variant={grade === "A+" ? "legendary" : "epic"}>{grade}</Badge>
          <span className="text-gold font-bold">+{xpResult ?? "…"} XP {saving ? "(saving…)" : ""}</span>
        </div>
        <Button variant="primary" onClick={() => { setPhase("idle"); setXpResult(null); }}>Play Again</Button>
      </div>
    );
  }

  const r = rounds[current];
  if (!r) return null;

  return (
    <div className="flex flex-col items-center gap-6 py-4 text-center">
      <Badge variant="rare">Round {current + 1}/{ROUNDS}</Badge>
      <p className="text-text-muted text-sm">What comes next?</p>

      <div className="flex items-center gap-3">
        {r.sequence.map((item, i) => (
          <div key={i} className="w-12 h-12 rounded-xl bg-bg-elevated border border-border flex items-center justify-center text-xl">
            {item}
          </div>
        ))}
        <div className="w-12 h-12 rounded-xl border-2 border-dashed border-primary flex items-center justify-center text-primary font-bold text-xl">
          ?
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 w-64">
        {r.options.map((opt) => (
          <button
            key={opt}
            onClick={() => pick(opt)}
            disabled={!!selected}
            className={cn(
              "h-14 rounded-xl border-2 text-xl font-bold transition-all",
              !selected && "bg-bg-elevated border-border hover:border-primary hover:bg-primary/10",
              selected && opt === r.answer && "bg-success/20 border-success",
              selected && opt !== r.answer && opt === selected && "bg-danger/20 border-danger",
              selected && opt !== r.answer && opt !== selected && "bg-bg-elevated border-border opacity-40",
            )}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}
