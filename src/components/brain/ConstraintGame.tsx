"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { saveBrainSession } from "@/app/actions/user";
import { cn } from "@/lib/utils";

const ROUNDS = 3;

interface Puzzle {
  question: string;
  options: string[];
  answer: string;
  explanation: string;
}

const PUZZLES: Puzzle[] = [
  {
    question: "You have 3 boxes: one has apples, one has oranges, one has both. All labels are wrong. You can pick ONE fruit from ONE box. Which box do you pick from to label all correctly?",
    options: ["Apples box", "Oranges box", "Mixed box", "Any box"],
    answer: "Mixed box",
    explanation: "The 'Mixed' label is wrong, so it's either apples or oranges. That one fruit tells you what it really is — then you can deduce the others.",
  },
  {
    question: "A farmer has 17 sheep. All but 9 die. How many are left?",
    options: ["8", "9", "17", "0"],
    answer: "9",
    explanation: "'All but 9' means 9 survive.",
  },
  {
    question: "You're in a dark room with one match. You have a candle, oil lamp, and fireplace. What do you light first?",
    options: ["Candle", "Oil lamp", "Fireplace", "The match"],
    answer: "The match",
    explanation: "You must light the match first before anything else.",
  },
  {
    question: "What can travel around the world while staying in a corner?",
    options: ["A shadow", "A stamp", "Wi-Fi signal", "A thought"],
    answer: "A stamp",
    explanation: "A stamp stays in the corner of an envelope that travels the world.",
  },
  {
    question: "Two fathers and two sons go fishing. Each catches one fish. They bring home 3 fish. Why?",
    options: ["One fish escaped", "One is a grandfather", "They shared", "Trick question"],
    answer: "One is a grandfather",
    explanation: "Grandfather, father, and son = 3 people. The 'father' is both a son and a father.",
  },
  {
    question: "If you overtake the person in 2nd place in a race, what position are you in?",
    options: ["1st", "2nd", "3rd", "4th"],
    answer: "2nd",
    explanation: "You take 2nd place — you can't overtake 1st unless they're behind you.",
  },
  {
    question: "A doctor gives you 3 pills and says take one every half hour. How long do the pills last?",
    options: ["1.5 hours", "1 hour", "2 hours", "30 minutes"],
    answer: "1 hour",
    explanation: "Pill 1 at 0min, pill 2 at 30min, pill 3 at 60min = 1 hour.",
  },
  {
    question: "Which weighs more: a ton of feathers or a ton of bricks?",
    options: ["Feathers", "Bricks", "Same weight", "Depends on size"],
    answer: "Same weight",
    explanation: "Both weigh a ton — the material doesn't matter.",
  },
];

function getRoundPuzzles(): Puzzle[] {
  const shuffled = [...PUZZLES].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, ROUNDS);
}

export function ConstraintGame() {
  const [phase, setPhase] = useState<"idle" | "playing" | "done">("idle");
  const [puzzles, setPuzzles] = useState<Puzzle[]>([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<boolean[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [xpResult, setXpResult] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  function start() {
    setPuzzles(getRoundPuzzles());
    setCurrent(0);
    setAnswers([]);
    setSelected(null);
    setShowExplanation(false);
    setPhase("playing");
  }

  function pick(opt: string) {
    if (selected) return;
    setSelected(opt);
    setShowExplanation(true);
    const correct = opt === puzzles[current].answer;
    setAnswers((prev) => [...prev, correct]);
  }

  function nextPuzzle() {
    const newAnswers = answers;
    if (current + 1 >= ROUNDS) {
      finishGame(newAnswers);
    } else {
      setCurrent((c) => c + 1);
      setSelected(null);
      setShowExplanation(false);
    }
  }

  async function finishGame(finalAnswers: boolean[]) {
    setPhase("done");
    const correct = finalAnswers.filter(Boolean).length;
    const pct = Math.round((correct / ROUNDS) * 100);
    const xp = 40 + (pct === 100 ? 20 : pct >= 67 ? 10 : 0);
    setSaving(true);
    await saveBrainSession({ gameName: "constraint", score: correct, accuracyPct: pct, durationSecs: ROUNDS * 15, xpEarned: xp });
    setSaving(false);
    setXpResult(xp);
  }

  if (phase === "idle") return (
    <div className="flex flex-col items-center gap-6 py-8 text-center">
      <p className="text-text-muted text-sm max-w-xs">Logic puzzles and lateral thinking challenges. Read carefully.</p>
      <Badge variant="default">{ROUNDS} puzzles</Badge>
      <Button variant="primary" size="lg" onClick={start}>Start</Button>
    </div>
  );

  if (phase === "done") {
    const correct = answers.filter(Boolean).length;
    const grade = correct === ROUNDS ? "A+" : correct === 2 ? "A" : "B";
    return (
      <div className="flex flex-col items-center gap-6 py-8 text-center">
        <div className="text-5xl">🧩</div>
        <p className="text-2xl font-display font-bold text-text">Puzzles solved!</p>
        <p className="text-text-muted">{correct}/{ROUNDS} correct</p>
        <div className="flex items-center gap-4">
          <Badge variant={grade === "A+" ? "legendary" : "epic"}>{grade}</Badge>
          <span className="text-gold font-bold">+{xpResult ?? "…"} XP {saving ? "(saving…)" : ""}</span>
        </div>
        <Button variant="primary" onClick={() => { setPhase("idle"); setXpResult(null); }}>Play Again</Button>
      </div>
    );
  }

  const puzzle = puzzles[current];
  if (!puzzle) return null;

  return (
    <div className="flex flex-col gap-6 max-w-lg mx-auto">
      <div className="flex items-center gap-3">
        <Badge variant="rare">Puzzle {current + 1}/{ROUNDS}</Badge>
        <span className="text-xs text-text-muted">{answers.filter(Boolean).length} correct so far</span>
      </div>

      <div className="bg-bg-elevated border border-border rounded-xl p-5">
        <p className="text-text font-medium leading-relaxed">{puzzle.question}</p>
      </div>

      <div className="grid grid-cols-1 gap-2">
        {puzzle.options.map((opt) => (
          <button
            key={opt}
            onClick={() => pick(opt)}
            disabled={!!selected}
            className={cn(
              "px-4 py-3 rounded-xl border-2 text-sm text-left font-medium transition-all",
              !selected && "bg-bg-elevated border-border hover:border-primary hover:bg-primary/10 text-text",
              selected && opt === puzzle.answer && "bg-success/15 border-success text-success",
              selected && opt !== puzzle.answer && opt === selected && "bg-danger/15 border-danger text-danger",
              selected && opt !== puzzle.answer && opt !== selected && "bg-bg-elevated border-border text-text-muted opacity-40",
            )}
          >
            {opt}
          </button>
        ))}
      </div>

      {showExplanation && (
        <div className="bg-info/10 border border-info/20 rounded-xl p-4">
          <p className="text-xs text-info font-semibold mb-1">Explanation</p>
          <p className="text-sm text-text">{puzzle.explanation}</p>
        </div>
      )}

      {selected && (
        <Button variant="primary" onClick={nextPuzzle}>
          {current + 1 >= ROUNDS ? "See Results" : "Next Puzzle →"}
        </Button>
      )}
    </div>
  );
}
