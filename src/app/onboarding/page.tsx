"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Zap, Target, Dumbbell, Brain, Heart, Apple, Flame } from "lucide-react";
import { cn } from "@/lib/utils";
import { saveOnboarding } from "@/app/actions/user";

const GOALS = [
  { id: "weight_loss", label: "Lose Weight", icon: Flame, color: "text-danger" },
  { id: "muscle_gain", label: "Build Muscle", icon: Dumbbell, color: "text-success" },
  { id: "mental_health", label: "Mental Wellness", icon: Heart, color: "text-[#BC8CFF]" },
  { id: "cognitive", label: "Sharpen Mind", icon: Brain, color: "text-info" },
  { id: "nutrition", label: "Eat Better", icon: Apple, color: "text-gold" },
  { id: "overall", label: "Overall Fitness", icon: Target, color: "text-primary" },
];

const FITNESS_LEVELS = [
  { id: 1, label: "Beginner", description: "Little to no exercise routine" },
  { id: 2, label: "Intermediate", description: "Exercise 2–3x per week" },
  { id: 3, label: "Advanced", description: "Daily training, athletic background" },
];

const STEPS = ["Welcome", "Your Goal", "Fitness Level", "Daily Time", "All Set!"];

export default function OnboardingPage() {
  const [step, setStep] = useState(0);
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState({
    username: "",
    goal: "",
    fitnessLevel: 1,
    dailyTimeMins: 30,
  });

  const progress = ((step + 1) / STEPS.length) * 100;

  function next() {
    if (step < STEPS.length - 1) setStep((s) => s + 1);
  }
  function back() {
    if (step > 0) setStep((s) => s - 1);
  }

  function finish() {
    startTransition(() => saveOnboarding(form));
  }

  return (
    <div className="min-h-screen bg-bg flex items-start sm:items-center justify-center px-4 py-6 sm:py-0">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center">
            <Zap className="w-4 h-4 text-primary" />
          </div>
          <span className="font-display font-bold text-xl text-text">
            Inner<span className="text-primary">Quest</span>
          </span>
        </div>

        {/* Progress */}
        <div className="mb-6">
          <div className="flex justify-between text-xs text-text-muted mb-2">
            <span>Step {step + 1} of {STEPS.length}</span>
            <span>{STEPS[step]}</span>
          </div>
          <ProgressBar value={progress} />
        </div>

        {/* Card */}
        <div className="bg-bg-card border border-border rounded-2xl p-8">
          {/* Step 0: Welcome */}
          {step === 0 && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center mx-auto">
                <Zap className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-2xl font-display font-bold text-text">Welcome, Hero!</h1>
              <p className="text-text-muted text-sm leading-relaxed">
                InnerQuest turns your daily wellness habits into an epic RPG adventure. Complete quests, earn XP, level up your life.
              </p>
              <input
                type="text"
                placeholder="Choose your hero name..."
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                className="w-full bg-bg-elevated border border-border rounded-xl px-4 py-3 text-text placeholder:text-text-subtle focus:outline-none focus:border-primary text-sm mt-2"
              />
            </div>
          )}

          {/* Step 1: Goal */}
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-xl font-display font-bold text-text">What's your main goal?</h2>
              <div className="grid grid-cols-2 gap-3">
                {GOALS.map(({ id, label, icon: Icon, color }) => (
                  <button
                    key={id}
                    onClick={() => setForm({ ...form, goal: id })}
                    className={cn(
                      "flex items-center gap-2.5 px-4 py-3 rounded-xl border text-sm font-medium transition-all",
                      form.goal === id
                        ? "border-primary bg-primary/15 text-primary"
                        : "border-border bg-bg-elevated text-text-muted hover:border-border hover:text-text"
                    )}
                  >
                    <Icon className={`w-4 h-4 ${form.goal === id ? "text-primary" : color}`} />
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Fitness Level */}
          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-xl font-display font-bold text-text">Current fitness level?</h2>
              <div className="space-y-3">
                {FITNESS_LEVELS.map(({ id, label, description }) => (
                  <button
                    key={id}
                    onClick={() => setForm({ ...form, fitnessLevel: id })}
                    className={cn(
                      "w-full flex items-start gap-3 px-4 py-3.5 rounded-xl border text-left transition-all",
                      form.fitnessLevel === id
                        ? "border-primary bg-primary/15"
                        : "border-border bg-bg-elevated hover:border-primary/40"
                    )}
                  >
                    <span
                      className={cn(
                        "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5",
                        form.fitnessLevel === id
                          ? "border-primary bg-primary"
                          : "border-border"
                      )}
                    >
                      {form.fitnessLevel === id && (
                        <span className="w-2 h-2 rounded-full bg-bg" />
                      )}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-text">{label}</p>
                      <p className="text-xs text-text-muted mt-0.5">{description}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Daily Time */}
          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-xl font-display font-bold text-text">Daily time available?</h2>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-text-muted">Minutes per day</span>
                  <span className="text-primary font-bold">{form.dailyTimeMins} min</span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={120}
                  step={5}
                  value={form.dailyTimeMins}
                  onChange={(e) => setForm({ ...form, dailyTimeMins: Number(e.target.value) })}
                  className="w-full accent-primary"
                />
                <div className="flex justify-between text-xs text-text-subtle">
                  <span>10 min</span>
                  <span>120 min</span>
                </div>
              </div>
              <p className="text-sm text-text-muted bg-bg-elevated border border-border rounded-lg px-4 py-3">
                We'll generate quests and a workout plan that fits your schedule.
              </p>
            </div>
          )}

          {/* Step 4: Done */}
          {step === 4 && (
            <div className="text-center space-y-4">
              <div className="text-5xl mb-2">🎉</div>
              <h2 className="text-2xl font-display font-bold text-text">You're ready, {form.username || "Hero"}!</h2>
              <p className="text-text-muted text-sm">Your adventure begins now. Daily quests have been generated. Go earn some XP!</p>
              <div className="bg-bg-elevated border border-border rounded-xl p-4 text-left space-y-2">
                <p className="text-xs text-text-muted"><span className="text-text font-medium">Goal:</span> {form.goal}</p>
                <p className="text-xs text-text-muted"><span className="text-text font-medium">Level:</span> {FITNESS_LEVELS[form.fitnessLevel - 1]?.label}</p>
                <p className="text-xs text-text-muted"><span className="text-text font-medium">Daily time:</span> {form.dailyTimeMins} min</p>
              </div>
            </div>
          )}
        </div>

        {/* Nav buttons */}
        <div className="flex items-center justify-between mt-6">
          <Button variant="ghost" onClick={back} disabled={step === 0}>
            Back
          </Button>
          {step < STEPS.length - 1 ? (
            <Button variant="primary" onClick={next}>
              Continue →
            </Button>
          ) : (
            <Button variant="gold" onClick={finish} loading={isPending}>
              Start My Quest!
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
