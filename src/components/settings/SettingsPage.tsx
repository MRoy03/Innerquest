"use client";

import { useState, useTransition } from "react";
import { Settings, User, Lock, Target, Dumbbell, LogOut, Loader2, CheckCircle2 } from "lucide-react";
import { Card, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { useUserStore } from "@/lib/store/userStore";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

const GOALS = [
  { id: "weight_loss",   label: "Lose Weight" },
  { id: "muscle_gain",   label: "Build Muscle" },
  { id: "mental_health", label: "Mental Wellness" },
  { id: "cognitive",     label: "Sharpen Mind" },
  { id: "nutrition",     label: "Eat Better" },
  { id: "overall",       label: "Overall Fitness" },
];

const FITNESS_LEVELS = [
  { id: 1, label: "Beginner" },
  { id: 2, label: "Intermediate" },
  { id: 3, label: "Advanced" },
];

type Section = "profile" | "goals" | "password";

export function SettingsPage() {
  const { profile, stats } = useUserStore();
  const router = useRouter();
  const [activeSection, setActiveSection] = useState<Section>("profile");

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-display font-bold text-text flex items-center gap-2">
          <Settings className="w-6 h-6 text-primary" />
          Settings
        </h1>
        <p className="text-text-muted text-sm mt-1">Manage your account and preferences</p>
      </div>

      {/* Section tabs */}
      <div className="flex gap-2 flex-wrap">
        {([
          { id: "profile",  label: "Profile",  icon: User },
          { id: "goals",    label: "Goals",    icon: Target },
          { id: "password", label: "Password", icon: Lock },
        ] as { id: Section; label: string; icon: React.ComponentType<{ className?: string }> }[]).map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveSection(id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-all",
              activeSection === id
                ? "bg-primary/15 border-primary/30 text-primary"
                : "bg-bg-card border-border text-text-muted hover:text-text hover:border-primary/20"
            )}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Sections */}
      {activeSection === "profile" && <ProfileSection profile={profile} stats={stats} />}
      {activeSection === "goals"   && <GoalsSection profile={profile} />}
      {activeSection === "password" && <PasswordSection />}

      {/* Sign out */}
      <Card className="border-danger/20">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base text-danger">Sign Out</CardTitle>
            <CardDescription>Sign out of your account on this device</CardDescription>
          </div>
          <Button
            variant="danger"
            size="sm"
            onClick={async () => {
              const supabase = createClient();
              await supabase.auth.signOut();
              router.push("/");
            }}
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </Button>
        </div>
      </Card>
    </div>
  );
}

// ─── Profile Section ────────────────────────────────────────────────────────
function ProfileSection({
  profile,
  stats,
}: {
  profile: import("@/types").UserProfile | null;
  stats: import("@/types").UserStats | null;
}) {
  const { setProfile } = useUserStore();
  const [username, setUsername] = useState(profile?.username ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  async function handleSave() {
    if (!username.trim()) { setError("Username cannot be empty."); return; }
    setSaving(true);
    setError("");
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setSaving(false); return; }

    const { error } = await supabase
      .from("profiles")
      .update({ username: username.trim() })
      .eq("user_id", user.id);

    setSaving(false);
    if (error) {
      setError(error.message);
    } else {
      if (profile) setProfile({ ...profile, username: username.trim() });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    }
  }

  return (
    <Card>
      <CardTitle className="mb-1">Profile</CardTitle>
      <CardDescription className="mb-5">Your public hero name and account info</CardDescription>

      {/* Avatar placeholder */}
      <div className="flex items-center gap-4 mb-6">
        <div className="w-16 h-16 rounded-2xl bg-primary/20 border-2 border-primary/30 flex items-center justify-center text-2xl font-display font-bold text-primary">
          {username?.[0]?.toUpperCase() ?? "?"}
        </div>
        <div>
          <p className="text-sm font-semibold text-text">{username || "Hero"}</p>
          {stats && (
            <p className="text-xs text-text-muted mt-0.5">Level {stats.level} · {stats.xp.toLocaleString()} XP</p>
          )}
        </div>
      </div>

      {/* XP bar */}
      {stats && (
        <div className="mb-6">
          <ProgressBar
            value={stats.xp}
            max={Math.pow(stats.level + 1, 2) * 100}
            label={`Level ${stats.level} progress`}
            showPercent
            color="primary"
          />
        </div>
      )}

      {/* Username field */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-text-muted mb-1.5">Hero Name</label>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            maxLength={30}
            placeholder="Your hero name"
            className="w-full bg-bg-elevated border border-border rounded-xl px-4 py-3 text-text placeholder:text-text-subtle focus:outline-none focus:border-primary text-sm"
          />
        </div>

        {error && <p className="text-sm text-danger">{error}</p>}

        <Button
          variant={saved ? "secondary" : "primary"}
          size="sm"
          onClick={handleSave}
          loading={saving}
          disabled={saved}
        >
          {saved ? <><CheckCircle2 className="w-4 h-4 text-success" /> Saved!</> : "Save Changes"}
        </Button>
      </div>
    </Card>
  );
}

// ─── Goals Section ───────────────────────────────────────────────────────────
function GoalsSection({ profile }: { profile: import("@/types").UserProfile | null }) {
  const { setProfile } = useUserStore();
  const [goal, setGoal] = useState(profile?.primaryGoal ?? "");
  const [fitnessLevel, setFitnessLevel] = useState(profile?.fitnessLevel ?? 1);
  const [dailyTime, setDailyTime] = useState(30);
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  function handleSave() {
    setError("");
    startTransition(async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from("profiles")
        .update({
          primary_goal: goal || null,
          fitness_level: fitnessLevel,
          daily_time_min: dailyTime,
        })
        .eq("user_id", user.id);

      if (error) {
        setError(error.message);
      } else {
        if (profile) setProfile({ ...profile, primaryGoal: goal, fitnessLevel });
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      }
    });
  }

  return (
    <Card>
      <CardTitle className="mb-1">Goals & Preferences</CardTitle>
      <CardDescription className="mb-5">Adjust your fitness goal and daily commitment</CardDescription>

      <div className="space-y-6">
        {/* Primary goal */}
        <div>
          <label className="block text-sm font-medium text-text-muted mb-2">Primary Goal</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {GOALS.map(({ id, label }) => (
              <button
                key={id}
                onClick={() => setGoal(id)}
                className={cn(
                  "px-3 py-2.5 rounded-xl border text-sm font-medium text-left transition-all",
                  goal === id
                    ? "border-primary bg-primary/15 text-primary"
                    : "border-border bg-bg-elevated text-text-muted hover:border-primary/30 hover:text-text"
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Fitness level */}
        <div>
          <label className="block text-sm font-medium text-text-muted mb-2">Fitness Level</label>
          <div className="flex gap-2">
            {FITNESS_LEVELS.map(({ id, label }) => (
              <button
                key={id}
                onClick={() => setFitnessLevel(id)}
                className={cn(
                  "flex-1 py-2.5 rounded-xl border text-sm font-medium transition-all",
                  fitnessLevel === id
                    ? "border-primary bg-primary/15 text-primary"
                    : "border-border bg-bg-elevated text-text-muted hover:border-primary/30 hover:text-text"
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Daily time */}
        <div>
          <div className="flex justify-between text-sm mb-2">
            <label className="font-medium text-text-muted">Daily Time Available</label>
            <span className="text-primary font-bold">{dailyTime} min</span>
          </div>
          <input
            type="range"
            min={10}
            max={120}
            step={5}
            value={dailyTime}
            onChange={(e) => setDailyTime(Number(e.target.value))}
            className="w-full accent-primary"
          />
          <div className="flex justify-between text-xs text-text-subtle mt-1">
            <span>10 min</span>
            <span>120 min</span>
          </div>
        </div>

        {error && <p className="text-sm text-danger">{error}</p>}

        <Button
          variant={saved ? "secondary" : "primary"}
          size="sm"
          onClick={handleSave}
          loading={isPending}
          disabled={saved}
        >
          {saved ? <><CheckCircle2 className="w-4 h-4 text-success" /> Saved!</> : "Save Preferences"}
        </Button>
      </div>
    </Card>
  );
}

// ─── Password Section ────────────────────────────────────────────────────────
function PasswordSection() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleChange(e: React.FormEvent) {
    e.preventDefault();
    if (!newPassword || !confirmPassword) { setError("Fill in all fields."); return; }
    if (newPassword.length < 8) { setError("New password must be at least 8 characters."); return; }
    if (newPassword !== confirmPassword) { setError("Passwords don't match."); return; }

    setLoading(true);
    setError("");
    const supabase = createClient();

    // Re-authenticate first with current password
    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.email) { setError("Could not verify your account."); setLoading(false); return; }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: currentPassword,
    });

    if (signInError) {
      setError("Current password is incorrect.");
      setLoading(false);
      return;
    }

    const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
    setLoading(false);

    if (updateError) {
      setError(updateError.message);
    } else {
      setSuccess("Password updated successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setSuccess(""), 4000);
    }
  }

  return (
    <Card>
      <CardTitle className="mb-1">Change Password</CardTitle>
      <CardDescription className="mb-5">Update your account password</CardDescription>

      <form onSubmit={handleChange} className="space-y-4">
        {[
          { label: "Current Password", value: currentPassword, set: setCurrentPassword, auto: "current-password" },
          { label: "New Password",     value: newPassword,     set: setNewPassword,     auto: "new-password", hint: "Minimum 8 characters" },
          { label: "Confirm New Password", value: confirmPassword, set: setConfirmPassword, auto: "new-password" },
        ].map(({ label, value, set, auto, hint }) => (
          <div key={label}>
            <label className="block text-sm font-medium text-text-muted mb-1.5">{label}</label>
            <input
              type="password"
              autoComplete={auto}
              required
              value={value}
              onChange={(e) => set(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-bg-elevated border border-border rounded-xl px-4 py-3 text-text placeholder:text-text-subtle focus:outline-none focus:border-primary text-sm"
            />
            {hint && <p className="text-xs text-text-subtle mt-1">{hint}</p>}
          </div>
        ))}

        {error   && <p className="text-sm text-danger bg-danger/10 border border-danger/20 rounded-xl px-4 py-3">{error}</p>}
        {success && <p className="text-sm text-success bg-success/10 border border-success/20 rounded-xl px-4 py-3">{success}</p>}

        <Button type="submit" variant="primary" size="sm" loading={loading}>
          <Lock className="w-4 h-4" /> Update Password
        </Button>
      </form>
    </Card>
  );
}
