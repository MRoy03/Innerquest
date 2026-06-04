"use client";

import Link from "next/link";
import { Zap } from "lucide-react";
import { useUserStore } from "@/lib/store/userStore";
import { XpBar } from "@/components/ui/XpBar";

export function MobileHeader() {
  const { profile, stats } = useUserStore();

  return (
    <header className="lg:hidden sticky top-0 z-30 bg-bg-card/95 backdrop-blur-md border-b border-border px-4 py-3">
      <div className="flex items-center justify-between">
        <Link href="/quests" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center">
            <Zap className="w-3.5 h-3.5 text-primary" />
          </div>
          <span className="font-display font-bold text-base text-text">
            Inner<span className="text-primary">Quest</span>
          </span>
        </Link>

        <div className="flex items-center gap-3">
          {stats && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-text-muted">Lv.{stats.level}</span>
              <div className="w-20 h-1.5 bg-bg-elevated rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary to-gold rounded-full"
                  style={{
                    width: `${Math.min(100, Math.round((stats.xp / (Math.pow(stats.level + 1, 2) * 100)) * 100))}%`,
                  }}
                />
              </div>
              <span className="text-xs text-gold font-bold">{stats.xp.toLocaleString()} XP</span>
            </div>
          )}
          {profile && (
            <div className="w-7 h-7 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary text-xs font-bold">
              {profile.username?.[0]?.toUpperCase() ?? "?"}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
