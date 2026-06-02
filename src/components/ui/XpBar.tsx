"use client";

import { cn } from "@/lib/utils";
import { calcNextLevelXp, calcXpPercent } from "@/lib/utils";

interface XpBarProps {
  xp: number;
  level: number;
  className?: string;
  compact?: boolean;
}

export function XpBar({ xp, level, className, compact = false }: XpBarProps) {
  const nextLevelXp = calcNextLevelXp(level);
  const currentLevelXp = calcNextLevelXp(level - 1);
  const xpInLevel = xp - currentLevelXp;
  const xpNeeded = nextLevelXp - currentLevelXp;
  const percent = calcXpPercent(xpInLevel, xpNeeded);

  if (compact) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <span className="text-xs font-bold text-primary">Lv.{level}</span>
        <div className="flex-1 h-1.5 bg-bg-elevated rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary to-gold rounded-full transition-all duration-700"
            style={{ width: `${percent}%` }}
          />
        </div>
        <span className="text-xs text-text-subtle">{xpInLevel}/{xpNeeded}</span>
      </div>
    );
  }

  return (
    <div className={cn("space-y-1.5", className)}>
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-primary font-display">Level {level}</span>
          <span className="text-xs text-text-subtle">{percent}%</span>
        </div>
        <span className="text-xs text-text-muted">{xpInLevel.toLocaleString()} / {xpNeeded.toLocaleString()} XP</span>
      </div>
      <div className="h-3 bg-bg-elevated rounded-full overflow-hidden border border-border">
        <div
          className="h-full bg-gradient-to-r from-primary via-primary to-gold rounded-full transition-all duration-700 shadow-[0_0_8px_rgba(78,205,196,0.4)]"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
