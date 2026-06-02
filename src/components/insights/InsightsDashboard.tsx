"use client";

import { useState, useEffect, useTransition } from "react";
import { BarChart3, TrendingUp, Brain, Heart, Flame, Zap, Loader2 } from "lucide-react";
import { Card, CardTitle, CardDescription } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";
import { logMood } from "@/app/actions/user";
import { useUserStore } from "@/lib/store/userStore";
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function InsightsDashboard() {
  const { stats, profile } = useUserStore();
  const [moodHistory, setMoodHistory] = useState<{ day: string; score: number }[]>([]);
  const [xpHistory, setXpHistory] = useState<{ week: string; xp: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [moodValue, setMoodValue] = useState(7);
  const [moodNote, setMoodNote] = useState("");
  const [moodSaved, setMoodSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      // Last 7 mood logs
      const { data: moods } = await supabase
        .from("mood_logs")
        .select("score, entry_date")
        .eq("user_id", user.id)
        .order("entry_date", { ascending: false })
        .limit(7);

      if (moods) {
        const mapped = moods.reverse().map((m) => ({
          day: DAYS[new Date(m.entry_date).getDay()],
          score: m.score,
        }));
        setMoodHistory(mapped);
      }

      // XP per quest completions — group into 4 weeks
      const { data: quests } = await supabase
        .from("user_quests")
        .select("completed_at, quests(xp_reward)")
        .eq("user_id", user.id)
        .eq("completed", true)
        .not("completed_at", "is", null)
        .order("completed_at", { ascending: false })
        .limit(200);

      if (quests) {
        const weekMap: Record<string, number> = {};
        quests.forEach((q) => {
          const d = new Date(q.completed_at!);
          const weekNum = Math.floor((Date.now() - d.getTime()) / (7 * 86400000));
          if (weekNum < 4) {
            const key = `W${4 - weekNum}`;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const xp = ((q.quests as unknown) as { xp_reward: number } | null)?.xp_reward ?? 0;
            weekMap[key] = (weekMap[key] ?? 0) + xp;
          }
        });
        setXpHistory(
          ["W1", "W2", "W3", "W4"].map((w) => ({ week: w, xp: weekMap[w] ?? 0 }))
        );
      }

      setLoading(false);
    }
    load();
  }, []);

  function handleLogMood() {
    startTransition(async () => {
      await logMood(moodValue, moodNote);
      setMoodSaved(true);
      setMoodNote("");
      // Refresh mood chart
      setMoodHistory((prev) => [
        ...prev.slice(-6),
        { day: DAYS[new Date().getDay()], score: moodValue },
      ]);
    });
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="w-8 h-8 text-primary animate-spin" />
    </div>
  );

  const wellnessScore = stats
    ? Math.min(100, Math.round(
        (stats.moodScore / 10) * 30 +
        (stats.streakDays / 30) * 30 +
        (stats.level / 50) * 40
      ))
    : 0;

  const insights = [
    stats && stats.streakDays >= 3 && { text: `${stats.streakDays}-day streak — you're on fire! 🔥`, positive: true },
    stats && stats.moodScore >= 7 && { text: `Mood average ${stats.moodScore}/10 — above baseline`, positive: true },
    stats && stats.moodScore < 5 && { text: `Mood dipped below 5 — consider a rest day`, positive: false },
    moodHistory.length < 3 && { text: "Log mood daily for better behavioral insights", positive: false },
  ].filter(Boolean);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-display font-bold text-text flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-primary" />
          Insights & Analytics
        </h1>
        <p className="text-text-muted text-sm mt-1">
          {profile?.username ?? "Hero"}'s wellness trends
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <div className="flex items-center gap-2 mb-2"><Heart className="w-4 h-4 text-[#BC8CFF]" /><span className="text-xs text-text-muted">Wellness</span></div>
          <p className="text-2xl font-display font-bold text-text mb-2">{wellnessScore}<span className="text-sm text-text-muted">/100</span></p>
          <Badge variant={wellnessScore >= 70 ? "epic" : wellnessScore >= 50 ? "rare" : "common"} size="sm">
            {wellnessScore >= 70 ? "Great" : wellnessScore >= 50 ? "Good" : "Building"}
          </Badge>
        </Card>
        <Card>
          <div className="flex items-center gap-2 mb-2"><Brain className="w-4 h-4 text-primary" /><span className="text-xs text-text-muted">Avg Mood</span></div>
          <p className="text-2xl font-display font-bold text-text mb-2">{stats?.moodScore ?? "—"}<span className="text-sm text-text-muted">/10</span></p>
          <Badge variant="uncommon" size="sm">7-day avg</Badge>
        </Card>
        <Card>
          <div className="flex items-center gap-2 mb-2"><Flame className="w-4 h-4 text-danger" /><span className="text-xs text-text-muted">Streak</span></div>
          <p className="text-2xl font-display font-bold text-text mb-2">{stats?.streakDays ?? 0}<span className="text-sm text-text-muted"> days</span></p>
          <Badge variant={stats && stats.streakDays >= 7 ? "legendary" : "uncommon"} size="sm">
            {stats && stats.streakDays >= 7 ? "On Fire" : "Active"}
          </Badge>
        </Card>
        <Card>
          <div className="flex items-center gap-2 mb-2"><Zap className="w-4 h-4 text-gold" /><span className="text-xs text-text-muted">Level</span></div>
          <p className="text-2xl font-display font-bold text-text mb-2">{stats?.level ?? 1}</p>
          <Badge variant="rare" size="sm">{stats?.xp ?? 0} XP total</Badge>
        </Card>
      </div>

      {/* Mood check-in */}
      <Card className={moodSaved ? "border-success/30" : ""}>
        <CardTitle className="mb-1">Today's Mood Check-in</CardTitle>
        <CardDescription className="mb-4">How are you feeling right now? (1–10)</CardDescription>
        {moodSaved ? (
          <div className="text-center py-4">
            <p className="text-success font-semibold">Mood logged ✓ ({moodValue}/10)</p>
            <button className="text-xs text-text-muted mt-2 hover:text-text" onClick={() => setMoodSaved(false)}>Update</button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-text-muted">Mood score</span>
                <span className="text-primary font-bold">{moodValue}/10</span>
              </div>
              <input
                type="range" min={1} max={10} value={moodValue}
                onChange={(e) => setMoodValue(Number(e.target.value))}
                className="w-full accent-primary"
              />
              <div className="flex justify-between text-xs text-text-subtle">
                <span>😔 Low</span><span>😊 Great</span>
              </div>
            </div>
            <textarea
              placeholder="Optional note..."
              value={moodNote}
              onChange={(e) => setMoodNote(e.target.value)}
              maxLength={200}
              rows={2}
              className="w-full bg-bg-elevated border border-border rounded-xl px-4 py-2.5 text-text placeholder:text-text-subtle focus:outline-none focus:border-primary text-sm resize-none"
            />
            <Button variant="primary" size="sm" onClick={handleLogMood} loading={isPending}>
              Log Mood
            </Button>
          </div>
        )}
      </Card>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <div className="mb-4">
            <CardTitle>Mood (7-day)</CardTitle>
            <CardDescription>Daily score (1–10)</CardDescription>
          </div>
          {moodHistory.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={moodHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#21262D" />
                <XAxis dataKey="day" tick={{ fill: "#8B949E", fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 10]} tick={{ fill: "#8B949E", fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "#161B22", border: "1px solid #30363D", borderRadius: 8 }} labelStyle={{ color: "#E6EDF3" }} />
                <Line type="monotone" dataKey="score" stroke="#4ECDC4" strokeWidth={2.5} dot={{ fill: "#4ECDC4", r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-text-muted text-sm">
              Log your mood daily to see the chart
            </div>
          )}
        </Card>

        <Card>
          <div className="mb-4">
            <CardTitle>XP Earned (4 weeks)</CardTitle>
            <CardDescription>From completed quests</CardDescription>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={xpHistory}>
              <CartesianGrid strokeDasharray="3 3" stroke="#21262D" />
              <XAxis dataKey="week" tick={{ fill: "#8B949E", fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#8B949E", fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "#161B22", border: "1px solid #30363D", borderRadius: 8 }} labelStyle={{ color: "#E6EDF3" }} />
              <Bar dataKey="xp" fill="#FFD700" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Insights */}
      {insights.length > 0 && (
        <Card>
          <CardTitle className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-primary" /> Behavioral Insights
          </CardTitle>
          <div className="space-y-3">
            {insights.map((insight, i) => insight && (
              <div key={i} className={`flex items-start gap-3 p-3 rounded-lg border ${insight.positive ? "bg-success/5 border-success/20" : "bg-warning/5 border-warning/20"}`}>
                <span className={`text-lg leading-none ${insight.positive ? "text-success" : "text-warning"}`}>
                  {insight.positive ? "↑" : "↓"}
                </span>
                <p className="text-sm text-text">{insight.text}</p>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
