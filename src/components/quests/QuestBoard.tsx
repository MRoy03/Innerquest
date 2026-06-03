"use client";

import { useEffect, useState, useTransition } from "react";
import { Swords, Trophy, Star, Zap, CheckCircle2, Circle, Loader2, X, Play } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Button } from "@/components/ui/Button";
import { getOrAssignTodayQuests, completeQuest } from "@/app/actions/quests";
import { useUserStore } from "@/lib/store/userStore";
import { cn } from "@/lib/utils";
import { BreathingTimer } from "@/components/mental/BreathingTimer";
import { WorkoutPlanner } from "@/components/fitness/WorkoutPlanner";
import { NutritionHub } from "@/components/nutrition/NutritionHub";

type RawQuest = {
  id: string;
  completed: boolean;
  completed_at: string | null;
  progress: number;
  assigned_date: string;
  quests: {
    id: string;
    title: string;
    description: string | null;
    difficulty: number;
    xp_reward: number;
    category: string;
    quest_type: string;
  } | null;
};

const categoryColor: Record<string, string> = {
  brain: "text-info",
  fitness: "text-success",
  nutrition: "text-gold",
  mental: "text-[#BC8CFF]",
  boss: "text-danger",
};

const categoryBadge: Record<string, "default"|"rare"|"uncommon"|"epic"|"legendary"> = {
  brain: "rare", fitness: "uncommon", nutrition: "legendary", mental: "epic", boss: "legendary",
};

function ActivityModal({
  uq,
  onClose,
  onComplete,
}: {
  uq: RawQuest;
  onClose: () => void;
  onComplete: (id: string) => void;
}) {
  const q = uq.quests;
  if (!q) return null;

  const category = q.category;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
        {/* Modal header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div>
            <h2 className="font-display font-bold text-text text-lg">{q.title}</h2>
            <div className="flex items-center gap-2 mt-0.5">
              <Badge variant={categoryBadge[category]} size="sm">
                <span className={categoryColor[category]}>{category}</span>
              </Badge>
              <span className="text-xs text-gold font-semibold">+{q.xp_reward} XP on completion</span>
            </div>
          </div>
          <button onClick={onClose} className="text-text-muted hover:text-text transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal body */}
        <div className="p-5 max-h-[75vh] overflow-y-auto">
          {category === "mental" && (
            <BreathingTimer
              onComplete={(xp) => {
                onComplete(uq.id);
                onClose();
              }}
            />
          )}

          {category === "fitness" && (
            <WorkoutPlanner
              onQuestComplete={() => {
                onComplete(uq.id);
                onClose();
              }}
            />
          )}

          {category === "nutrition" && (
            <NutritionHub
              onQuestComplete={() => {
                onComplete(uq.id);
                onClose();
              }}
            />
          )}

          {category === "brain" && (
            <div className="text-center py-6 space-y-4">
              <div className="text-4xl">🧠</div>
              <p className="text-text font-medium">{q.title}</p>
              <p className="text-text-muted text-sm">{q.description ?? "Complete a brain training game to earn XP."}</p>
              <div className="flex gap-3 justify-center">
                <Button
                  variant="primary"
                  onClick={() => { window.location.href = "/brain"; }}
                >
                  Go to Brain Training
                </Button>
                <Button variant="ghost" onClick={() => { onComplete(uq.id); onClose(); }}>
                  Mark as Done
                </Button>
              </div>
            </div>
          )}

          {category === "boss" && (
            <div className="space-y-4">
              <div className="bg-danger/10 border border-danger/20 rounded-xl p-4 text-center">
                <p className="text-danger font-bold text-lg mb-1">⚔️ Boss Challenge</p>
                <p className="text-text-muted text-sm">{q.description ?? "Complete this boss challenge to earn massive XP."}</p>
              </div>
              <div className="text-center space-y-2">
                <p className="text-sm text-text-muted">This challenge requires completing multiple activities across the week.</p>
                <Button variant="gold" onClick={() => { onComplete(uq.id); onClose(); }}>
                  Mark Challenge Complete
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function QuestBoard() {
  const [quests, setQuests] = useState<RawQuest[]>([]);
  const [loading, setLoading] = useState(true);
  const [flashId, setFlashId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [activeQuest, setActiveQuest] = useState<RawQuest | null>(null);
  const { addXp, stats } = useUserStore();

  useEffect(() => {
    getOrAssignTodayQuests().then(({ data }) => {
      setQuests(((data as unknown) as RawQuest[]) ?? []);
      setLoading(false);
    });
  }, []);

  function handleComplete(userQuestId: string) {
    startTransition(async () => {
      const result = await completeQuest(userQuestId);
      if (!result.error) {
        setQuests((prev) =>
          prev.map((q) =>
            q.id === userQuestId
              ? { ...q, completed: true, progress: 100, completed_at: new Date().toISOString() }
              : q
          )
        );
        setFlashId(userQuestId);
        if (result.xpAwarded) addXp(result.xpAwarded);
        setTimeout(() => setFlashId(null), 2000);
      }
    });
  }

  const daily = quests.filter((q) => q.quests?.quest_type === "daily");
  const weekly = quests.filter((q) => q.quests?.quest_type === "weekly");
  const boss   = quests.filter((q) => q.quests?.quest_type === "boss");
  const completedToday = quests.filter((q) => q.completed).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <>
      {activeQuest && (
        <ActivityModal
          uq={activeQuest}
          onClose={() => setActiveQuest(null)}
          onComplete={handleComplete}
        />
      )}

      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold text-text flex items-center gap-2">
              <Swords className="w-6 h-6 text-primary" />
              Quest Board
            </h1>
            <p className="text-text-muted text-sm mt-1">
              Tap a quest to start the activity · Level {stats?.level ?? 1}
            </p>
          </div>
          <div className="flex items-center gap-2 bg-bg-card border border-border rounded-xl px-4 py-2">
            <Zap className="w-4 h-4 text-gold" />
            <span className="text-sm font-semibold text-gold">
              {completedToday}/{quests.length} today
            </span>
          </div>
        </div>

        {daily.length > 0 && (
          <section>
            <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-3 flex items-center gap-2">
              <Star className="w-4 h-4" /> Daily Quests
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {daily.map((uq) => (
                <QuestCard
                  key={uq.id}
                  uq={uq}
                  flash={flashId === uq.id}
                  onStart={() => !uq.completed && setActiveQuest(uq)}
                  onComplete={handleComplete}
                  pending={isPending}
                />
              ))}
            </div>
          </section>
        )}

        {weekly.length > 0 && (
          <section>
            <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-3 flex items-center gap-2">
              <Trophy className="w-4 h-4" /> Weekly Challenges
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {weekly.map((uq) => (
                <QuestCard
                  key={uq.id}
                  uq={uq}
                  flash={flashId === uq.id}
                  onStart={() => !uq.completed && setActiveQuest(uq)}
                  onComplete={handleComplete}
                  pending={isPending}
                />
              ))}
            </div>
          </section>
        )}

        {boss.length > 0 && (
          <section>
            <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-3 flex items-center gap-2">
              <Swords className="w-4 h-4 text-danger" /> Boss Challenge
            </h2>
            <div className="grid grid-cols-1 gap-3">
              {boss.map((uq) => (
                <QuestCard
                  key={uq.id}
                  uq={uq}
                  isBoss
                  flash={flashId === uq.id}
                  onStart={() => !uq.completed && setActiveQuest(uq)}
                  onComplete={handleComplete}
                  pending={isPending}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}

function QuestCard({
  uq, isBoss = false, flash, onStart, onComplete, pending,
}: {
  uq: RawQuest;
  isBoss?: boolean;
  flash: boolean;
  onStart: () => void;
  onComplete: (id: string) => void;
  pending: boolean;
}) {
  const q = uq.quests;
  if (!q) return null;

  return (
    <Card
      glow={flash ? "primary" : isBoss ? "gold" : "none"}
      className={cn("transition-all duration-300", uq.completed && "opacity-60", flash && "scale-[1.01]")}
    >
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-2.5 flex-1 min-w-0">
            <button
              onClick={() => !uq.completed && onComplete(uq.id)}
              disabled={uq.completed || pending}
              className="mt-0.5 shrink-0 cursor-pointer disabled:cursor-default"
            >
              {uq.completed ? (
                <CheckCircle2 className="w-5 h-5 text-success" />
              ) : (
                <Circle className="w-5 h-5 text-text-muted hover:text-primary transition-colors" />
              )}
            </button>
            <div className="flex-1 min-w-0">
              <CardTitle className={cn("text-base", uq.completed && "line-through text-text-muted")}>
                {q.title}
              </CardTitle>
              {q.description && (
                <CardDescription className="mt-0.5 text-xs">{q.description}</CardDescription>
              )}
              <div className="flex items-center gap-2 mt-2">
                <Badge variant={categoryBadge[q.category]} size="sm">
                  <span className={categoryColor[q.category]}>{q.category}</span>
                </Badge>
                <span className="text-xs text-text-subtle">Diff {q.difficulty}/10</span>
              </div>
            </div>
          </div>
          <div className="text-right shrink-0 flex flex-col items-end gap-1.5">
            <span className="text-sm font-bold text-gold">+{q.xp_reward} XP</span>
            {uq.completed ? (
              <span className="text-xs text-success">Done ✓</span>
            ) : (
              <button
                onClick={onStart}
                className="flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary-dark border border-primary/30 hover:border-primary rounded-lg px-2 py-1 transition-all"
              >
                <Play className="w-3 h-3" /> Start
              </button>
            )}
          </div>
        </div>
      </CardHeader>
      <ProgressBar
        value={uq.progress}
        max={100}
        color={uq.completed ? "success" : isBoss ? "gold" : "primary"}
        size="sm"
        showPercent={uq.progress > 0 && !uq.completed}
      />
      {flash && (
        <div className="mt-3 text-center">
          <span className="text-xs font-bold text-primary animate-pulse">
            +{q.xp_reward} XP earned! 🎉
          </span>
        </div>
      )}
    </Card>
  );
}
