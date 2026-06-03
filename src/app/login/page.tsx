"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import {
  Zap, Eye, EyeOff, Swords, Brain, Apple, Heart, BarChart3, Shield,
} from "lucide-react";
import Link from "next/link";

const FEATURES = [
  { icon: Swords,   color: "text-primary",    label: "Quest System",       desc: "Daily & weekly quests with boss challenges" },
  { icon: Brain,    color: "text-info",        label: "Brain Training",     desc: "5 cognitive games to sharpen your mind" },
  { icon: Apple,    color: "text-gold",        label: "Nutrition Hub",      desc: "Macro tracking with smart meal plans" },
  { icon: Heart,    color: "text-[#BC8CFF]",   label: "Mental Wellness",    desc: "Mood tracking, breathing, journaling" },
  { icon: BarChart3,color: "text-success",     label: "Insights",           desc: "Behavioral analytics & weekly reports" },
  { icon: Shield,   color: "text-danger",      label: "RPG Progression",    desc: "Level up, earn badges, build streaks" },
];

type Tab = "signin" | "signup";

function AuthForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const t = searchParams.get("tab");
    if (t === "signup") setTab("signup");
    const err = searchParams.get("error");
    if (err === "link_expired") setError("That confirmation link has expired. Sign in below.");
  }, [searchParams]);

  function resetForm() {
    setError("");
    setSuccess("");
    setPassword("");
    setConfirmPassword("");
  }

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) { setError("Please fill in all fields."); return; }
    setLoading(true);
    setError("");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      if (error.message.includes("Invalid login")) {
        setError("Incorrect email or password.");
      } else if (error.message.includes("Email not confirmed")) {
        setError("Please confirm your email first — check your inbox.");
      } else {
        setError(error.message);
      }
    } else {
      router.push("/quests");
    }
  }

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password || !confirmPassword) { setError("Please fill in all fields."); return; }
    if (password.length < 8) { setError("Password must be at least 8 characters."); return; }
    if (password !== confirmPassword) { setError("Passwords don't match."); return; }
    setLoading(true);
    setError("");
    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    setLoading(false);
    if (error) {
      if (error.message.includes("already registered")) {
        setError("An account with this email already exists. Sign in instead.");
      } else {
        setError(error.message);
      }
    } else if (data.session) {
      // Email confirmation disabled — directly signed in
      router.push("/onboarding");
    } else {
      // Email confirmation enabled — ask user to check inbox
      setSuccess(`We sent a confirmation link to ${email}. Click it to activate your account.`);
    }
  }

  return (
    <div className="w-full">
      {/* Tabs */}
      <div className="flex bg-bg-elevated rounded-xl p-1 mb-6">
        {(["signin", "signup"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => { setTab(t); resetForm(); }}
            className={cn(
              "flex-1 py-2 text-sm font-semibold rounded-lg transition-all duration-200",
              tab === t
                ? "bg-primary text-bg shadow"
                : "text-text-muted hover:text-text"
            )}
          >
            {t === "signin" ? "Sign In" : "Create Account"}
          </button>
        ))}
      </div>

      {/* Success state */}
      {success ? (
        <div className="text-center space-y-4 py-4">
          <div className="text-5xl">📬</div>
          <h2 className="text-lg font-display font-bold text-text">Check your email</h2>
          <p className="text-text-muted text-sm leading-relaxed">{success}</p>
          <p className="text-xs text-text-subtle">No email? Check spam, or try again.</p>
          <Button variant="ghost" size="sm" onClick={() => setSuccess("")}>
            Back
          </Button>
        </div>
      ) : tab === "signin" ? (
        <form onSubmit={handleSignIn} className="space-y-4">
          <EmailField email={email} setEmail={setEmail} />
          <PasswordField
            label="Password"
            value={password}
            onChange={setPassword}
            show={showPassword}
            toggle={() => setShowPassword((v) => !v)}
          />
          {error && <ErrorBox message={error} />}
          <Button type="submit" variant="primary" fullWidth size="lg" loading={loading}>
            Sign In
          </Button>
          <p className="text-center text-xs text-text-muted">
            No account?{" "}
            <button type="button" onClick={() => { setTab("signup"); resetForm(); }} className="text-primary hover:underline font-medium">
              Create one free
            </button>
          </p>
        </form>
      ) : (
        <form onSubmit={handleSignUp} className="space-y-4">
          <EmailField email={email} setEmail={setEmail} />
          <PasswordField
            label="Password"
            value={password}
            onChange={setPassword}
            show={showPassword}
            toggle={() => setShowPassword((v) => !v)}
            hint="Minimum 8 characters"
          />
          <PasswordField
            label="Confirm Password"
            value={confirmPassword}
            onChange={setConfirmPassword}
            show={showPassword}
            toggle={() => setShowPassword((v) => !v)}
          />
          {error && <ErrorBox message={error} />}
          <Button type="submit" variant="primary" fullWidth size="lg" loading={loading}>
            Create Account
          </Button>
          <p className="text-center text-xs text-text-muted">
            Already have an account?{" "}
            <button type="button" onClick={() => { setTab("signin"); resetForm(); }} className="text-primary hover:underline font-medium">
              Sign in
            </button>
          </p>
        </form>
      )}
    </div>
  );
}

function EmailField({ email, setEmail }: { email: string; setEmail: (v: string) => void }) {
  return (
    <div>
      <label className="block text-sm font-medium text-text-muted mb-1.5">Email address</label>
      <input
        type="email"
        required
        autoComplete="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="hero@example.com"
        className="w-full bg-bg-elevated border border-border rounded-xl px-4 py-3 text-text placeholder:text-text-subtle focus:outline-none focus:border-primary text-sm transition-colors"
      />
    </div>
  );
}

function PasswordField({
  label, value, onChange, show, toggle, hint,
}: {
  label: string; value: string; onChange: (v: string) => void;
  show: boolean; toggle: () => void; hint?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-text-muted mb-1.5">{label}</label>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          required
          autoComplete={label === "Password" ? "current-password" : "new-password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="••••••••"
          className="w-full bg-bg-elevated border border-border rounded-xl px-4 py-3 pr-11 text-text placeholder:text-text-subtle focus:outline-none focus:border-primary text-sm transition-colors"
        />
        <button
          type="button"
          onClick={toggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text transition-colors"
        >
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
      {hint && <p className="text-xs text-text-subtle mt-1">{hint}</p>}
    </div>
  );
}

function ErrorBox({ message }: { message: string }) {
  return (
    <div className="text-sm text-danger bg-danger/10 border border-danger/20 rounded-xl px-4 py-3">
      {message}
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-bg flex">
      {/* ── Left panel — brand + features ── */}
      <div className="hidden lg:flex flex-col justify-between w-[52%] bg-bg-card border-r border-border p-12">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center">
            <Zap className="w-5 h-5 text-primary" />
          </div>
          <span className="font-display font-bold text-xl text-text">
            Inner<span className="text-primary">Quest</span>
          </span>
        </Link>

        {/* Hero copy */}
        <div className="space-y-8">
          <div>
            <h1 className="text-4xl font-display font-extrabold text-text leading-tight mb-4">
              Turn your daily habits into an{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-gold">
                epic adventure
              </span>
            </h1>
            <p className="text-text-muted text-lg leading-relaxed">
              Complete quests, train your brain, track nutrition, and level up your life — all in one gamified wellness platform.
            </p>
          </div>

          {/* Feature list */}
          <div className="grid grid-cols-2 gap-3">
            {FEATURES.map(({ icon: Icon, color, label, desc }) => (
              <div key={label} className="flex items-start gap-3 p-3 rounded-xl bg-bg-elevated border border-border">
                <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${color}`} />
                <div>
                  <p className="text-xs font-semibold text-text">{label}</p>
                  <p className="text-xs text-text-subtle mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer note */}
        <p className="text-xs text-text-subtle">
          Free forever · No credit card · Your data stays yours
        </p>
      </div>

      {/* ── Right panel — auth form ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        {/* Mobile logo */}
        <Link href="/" className="flex items-center gap-2 mb-10 lg:hidden">
          <div className="w-8 h-8 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center">
            <Zap className="w-4 h-4 text-primary" />
          </div>
          <span className="font-display font-bold text-lg text-text">
            Inner<span className="text-primary">Quest</span>
          </span>
        </Link>

        <div className="w-full max-w-sm">
          <div className="mb-7 lg:mb-8">
            <h2 className="text-2xl font-display font-bold text-text">Welcome back</h2>
            <p className="text-text-muted text-sm mt-1">Sign in to continue your quest</p>
          </div>

          <div className="bg-bg-card border border-border rounded-2xl p-6">
            <Suspense fallback={<div className="h-48 animate-pulse" />}>
              <AuthForm />
            </Suspense>
          </div>

          <p className="text-center text-xs text-text-subtle mt-6">
            By continuing you agree to our{" "}
            <span className="text-text-muted cursor-pointer hover:text-primary transition-colors">Terms</span>{" "}
            &{" "}
            <span className="text-text-muted cursor-pointer hover:text-primary transition-colors">Privacy Policy</span>
          </p>
        </div>
      </div>
    </div>
  );
}
