"use client";

import { useState, useRef, useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { cn } from "@/lib/utils";
import {
  BODY_TYPES, ACTIVITY_LEVELS, CONDITIONS, HEALTH_GOALS,
  calculateBmi,
  type BmiInput, type BmiResult,
  type Gender, type ActivityLevel, type BodyType, type Condition, type HealthGoal,
} from "@/lib/data/bmi";
import { analyzeBodyImage, saveBmiRecord } from "@/app/actions/bmi";
import { BmiResults } from "./BmiResults";
import { Upload, Camera, CheckCircle2, Sparkles, ChevronRight, ChevronLeft, X } from "lucide-react";

const STEPS = ["Measurements", "Body Type", "Lifestyle", "Goal", "Results"];

export function BmiCalculator() {
  const [step, setStep] = useState(0);
  const [result, setResult] = useState<BmiResult | null>(null);
  const [isPending, startTransition] = useTransition();

  // Form state
  const [weight, setWeight]     = useState("");
  const [height, setHeight]     = useState("");
  const [age, setAge]           = useState("");
  const [gender, setGender]     = useState<Gender>("male");
  const [bodyType, setBodyType] = useState<BodyType>("mesomorph");
  const [activity, setActivity] = useState<ActivityLevel>("moderate");
  const [conditions, setConditions] = useState<Condition[]>(["none"]);
  const [goal, setGoal]         = useState<HealthGoal>("lose_weight");

  // Image analysis
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageBase64, setImageBase64]   = useState<string | null>(null);
  const [imageMime, setImageMime]       = useState<string>("image/jpeg");
  const [analyzing, setAnalyzing]       = useState(false);
  const [analysisNotes, setAnalysisNotes] = useState("");
  const [analysisConfidence, setAnalysisConfidence] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const progress = ((step + 1) / STEPS.length) * 100;

  function toggleCondition(c: Condition) {
    if (c === "none") { setConditions(["none"]); return; }
    setConditions((prev) => {
      const withoutNone = prev.filter((x) => x !== "none");
      return withoutNone.includes(c) ? withoutNone.filter((x) => x !== c) || ["none"] : [...withoutNone, c];
    });
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { alert("Image must be under 5MB."); return; }

    const mime = file.type as string;
    setImageMime(mime);

    const reader = new FileReader();
    reader.onload = async (ev) => {
      const dataUrl = ev.target?.result as string;
      setImagePreview(dataUrl);
      const base64 = dataUrl.split(",")[1];
      setImageBase64(base64);

      // Auto-analyze
      setAnalyzing(true);
      const analysis = await analyzeBodyImage(base64, mime);
      setAnalyzing(false);

      if (!analysis.error && analysis.bodyType) {
        setBodyType(analysis.bodyType as BodyType);
        setAnalysisNotes(analysis.notes);
        setAnalysisConfidence(analysis.confidence);
      } else {
        setAnalysisNotes(analysis.error ?? "");
      }
    };
    reader.readAsDataURL(file);
  }

  function handleCalculate() {
    const input: BmiInput = {
      weightKg:      parseFloat(weight),
      heightCm:      parseFloat(height),
      age:           parseInt(age),
      gender,
      activityLevel: activity,
      bodyType,
      conditions:    conditions.includes("none") ? [] : conditions,
      goal,
    };
    const res = calculateBmi(input);
    setResult(res);
    setStep(4);

    startTransition(async () => {
      await saveBmiRecord({
        bmi:            res.bmi,
        weightKg:       input.weightKg,
        heightCm:       input.heightCm,
        bodyType:       input.bodyType,
        goal:           input.goal,
        targetCalories: res.targetCalories,
      });
    });
  }

  function reset() {
    setStep(0); setResult(null);
    setWeight(""); setHeight(""); setAge("");
    setGender("male"); setBodyType("mesomorph");
    setActivity("moderate"); setConditions(["none"]); setGoal("lose_weight");
    setImagePreview(null); setImageBase64(null);
    setAnalysisNotes(""); setAnalysisConfidence("");
  }

  if (step === 4 && result) {
    return <BmiResults result={result} onReset={reset} />;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Progress */}
      <div>
        <div className="flex justify-between text-xs text-text-muted mb-2">
          <span>Step {step + 1} of {STEPS.length - 1}</span>
          <span className="text-primary font-medium">{STEPS[step]}</span>
        </div>
        <ProgressBar value={(step / 3) * 100} color="primary" size="sm" />
        <div className="flex justify-between mt-2">
          {STEPS.slice(0, 4).map((s, i) => (
            <span key={s} className={cn("text-xs", i === step ? "text-primary font-semibold" : i < step ? "text-success" : "text-text-subtle")}>
              {i < step ? "✓" : s}
            </span>
          ))}
        </div>
      </div>

      {/* ── Step 0: Measurements ── */}
      {step === 0 && (
        <div className="space-y-5">
          <h2 className="text-xl font-display font-bold text-text">Your Measurements</h2>

          <div className="grid grid-cols-2 gap-4">
            <NumberField label="Weight (kg)" value={weight} onChange={setWeight} placeholder="70" min={20} max={300} />
            <NumberField label="Height (cm)" value={height} onChange={setHeight} placeholder="170" min={100} max={250} />
            <NumberField label="Age" value={age} onChange={setAge} placeholder="25" min={10} max={100} />
            <div>
              <label className="block text-sm font-medium text-text-muted mb-1.5">Gender</label>
              <div className="flex gap-2">
                {(["male","female","other"] as Gender[]).map((g) => (
                  <button
                    key={g}
                    onClick={() => setGender(g)}
                    className={cn(
                      "flex-1 py-2.5 rounded-xl border text-sm font-medium capitalize transition-all",
                      gender === g ? "border-primary bg-primary/10 text-primary" : "border-border bg-bg-elevated text-text-muted hover:border-primary/30"
                    )}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <StepNav
            onNext={() => setStep(1)}
            canNext={!!weight && !!height && !!age}
          />
        </div>
      )}

      {/* ── Step 1: Body Type ── */}
      {step === 1 && (
        <div className="space-y-5">
          <div>
            <h2 className="text-xl font-display font-bold text-text">Body Type</h2>
            <p className="text-text-muted text-sm mt-1">Select your body type — or upload a photo and we'll detect it automatically (optional).</p>
          </div>

          {/* Image upload — optional */}
          <div className="bg-bg-elevated border border-dashed border-border rounded-2xl p-4">
            <div className="flex items-start gap-4">
              {imagePreview ? (
                <div className="relative shrink-0">
                  <img src={imagePreview} alt="Body" className="w-20 h-28 object-cover rounded-xl border border-border" />
                  <button
                    onClick={() => { setImagePreview(null); setImageBase64(null); setAnalysisNotes(""); }}
                    className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-danger text-white flex items-center justify-center"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <div className="w-20 h-28 rounded-xl border-2 border-dashed border-border flex items-center justify-center shrink-0">
                  <Camera className="w-6 h-6 text-text-subtle" />
                </div>
              )}
              <div className="flex-1 space-y-2">
                <p className="text-sm font-medium text-text">Upload full-body photo <Badge variant="common" size="sm">Optional</Badge></p>
                <p className="text-xs text-text-muted">AI will analyze your body type automatically. Photo is processed securely and never stored.</p>
                {analyzing && <p className="text-xs text-primary animate-pulse flex items-center gap-1"><Sparkles className="w-3 h-3" /> Analyzing body type…</p>}
                {analysisNotes && !analyzing && (
                  <div className={cn("text-xs rounded-lg px-3 py-2", analysisConfidence === "high" || analysisConfidence === "medium" ? "bg-success/10 text-success" : "bg-warning/10 text-warning")}>
                    {analysisConfidence && analysisConfidence !== "none" && (
                      <span className="font-semibold capitalize">{analysisConfidence} confidence · </span>
                    )}
                    {analysisNotes}
                  </div>
                )}
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                <Button variant="secondary" size="sm" onClick={() => fileRef.current?.click()}>
                  <Upload className="w-3.5 h-3.5" />
                  {imagePreview ? "Change Photo" : "Upload Photo"}
                </Button>
              </div>
            </div>
          </div>

          {/* Body type selector */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-text-muted">Select or confirm your body type:</p>
            {BODY_TYPES.map((bt) => (
              <button
                key={bt.id}
                onClick={() => setBodyType(bt.id)}
                className={cn(
                  "w-full flex items-start gap-3 p-3.5 rounded-xl border text-left transition-all",
                  bodyType === bt.id ? "border-primary bg-primary/10" : "border-border bg-bg-elevated hover:border-primary/30"
                )}
              >
                <div className={cn("w-5 h-5 rounded-full border-2 shrink-0 mt-0.5 flex items-center justify-center", bodyType === bt.id ? "border-primary bg-primary" : "border-border")}>
                  {bodyType === bt.id && <CheckCircle2 className="w-3 h-3 text-bg" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={cn("text-sm font-semibold", bodyType === bt.id ? "text-primary" : "text-text")}>{bt.label}</span>
                    <span className="text-xs text-text-muted">{bt.desc}</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {bt.traits.map((t) => <span key={t} className="text-xs bg-bg-surface px-2 py-0.5 rounded-full text-text-subtle border border-border">{t}</span>)}
                  </div>
                </div>
              </button>
            ))}
          </div>

          <StepNav onBack={() => setStep(0)} onNext={() => setStep(2)} canNext />
        </div>
      )}

      {/* ── Step 2: Lifestyle ── */}
      {step === 2 && (
        <div className="space-y-5">
          <h2 className="text-xl font-display font-bold text-text">Lifestyle & Health</h2>

          {/* Activity level */}
          <div>
            <p className="text-sm font-medium text-text-muted mb-2">Activity Level</p>
            <div className="space-y-2">
              {ACTIVITY_LEVELS.map((al) => (
                <button
                  key={al.id}
                  onClick={() => setActivity(al.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all",
                    activity === al.id ? "border-primary bg-primary/10" : "border-border bg-bg-elevated hover:border-primary/30"
                  )}
                >
                  <div className={cn("w-4 h-4 rounded-full border-2 shrink-0", activity === al.id ? "border-primary bg-primary" : "border-border")} />
                  <div>
                    <span className={cn("text-sm font-semibold", activity === al.id ? "text-primary" : "text-text")}>{al.label}</span>
                    <span className="text-text-muted text-xs ml-2">{al.desc}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Health conditions */}
          <div>
            <p className="text-sm font-medium text-text-muted mb-2">Health Conditions <span className="text-text-subtle font-normal">(select all that apply)</span></p>
            <div className="grid grid-cols-2 gap-2">
              {CONDITIONS.map((c) => (
                <button
                  key={c.id}
                  onClick={() => toggleCondition(c.id)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium text-left transition-all",
                    conditions.includes(c.id) ? "border-primary bg-primary/10 text-primary" : "border-border bg-bg-elevated text-text-muted hover:border-primary/30 hover:text-text"
                  )}
                >
                  <span className={cn("w-4 h-4 rounded border shrink-0 flex items-center justify-center text-xs", conditions.includes(c.id) ? "bg-primary border-primary text-bg" : "border-border")}>
                    {conditions.includes(c.id) && "✓"}
                  </span>
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          <StepNav onBack={() => setStep(1)} onNext={() => setStep(3)} canNext />
        </div>
      )}

      {/* ── Step 3: Goal ── */}
      {step === 3 && (
        <div className="space-y-5">
          <h2 className="text-xl font-display font-bold text-text">Your Health Goal</h2>
          <div className="space-y-2">
            {HEALTH_GOALS.map((g) => (
              <button
                key={g.id}
                onClick={() => setGoal(g.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-4 rounded-xl border text-left transition-all",
                  goal === g.id ? "border-primary bg-primary/10" : "border-border bg-bg-elevated hover:border-primary/30"
                )}
              >
                <div className={cn("w-4 h-4 rounded-full border-2 shrink-0", goal === g.id ? "border-primary bg-primary" : "border-border")} />
                <div>
                  <p className={cn("text-sm font-semibold", goal === g.id ? "text-primary" : "text-text")}>{g.label}</p>
                  <p className="text-xs text-text-muted">{g.desc}</p>
                </div>
              </button>
            ))}
          </div>

          <StepNav onBack={() => setStep(2)} onNext={handleCalculate} nextLabel="Calculate BMI →" canNext />
        </div>
      )}
    </div>
  );
}

function NumberField({ label, value, onChange, placeholder, min, max }: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder: string; min: number; max: number;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-text-muted mb-1.5">{label}</label>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        min={min}
        max={max}
        className="w-full bg-bg-elevated border border-border rounded-xl px-4 py-3 text-text placeholder:text-text-subtle focus:outline-none focus:border-primary text-sm"
      />
    </div>
  );
}

function StepNav({ onBack, onNext, canNext, nextLabel = "Continue →" }: {
  onBack?: () => void; onNext: () => void; canNext: boolean; nextLabel?: string;
}) {
  return (
    <div className="flex items-center justify-between pt-2">
      {onBack ? (
        <Button variant="ghost" onClick={onBack}>
          <ChevronLeft className="w-4 h-4" /> Back
        </Button>
      ) : <div />}
      <Button variant="primary" onClick={onNext} disabled={!canNext}>
        {nextLabel} <ChevronRight className="w-4 h-4" />
      </Button>
    </div>
  );
}
