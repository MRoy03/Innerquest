"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Brain,
  Swords,
  Apple,
  BarChart3,
  Settings,
  LogOut,
  Zap,
  Dumbbell,
  Heart,
} from "lucide-react";
import { useUserStore } from "@/lib/store/userStore";
import { XpBar } from "@/components/ui/XpBar";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const navItems = [
  { href: "/quests",   label: "Quest Board",    icon: Swords },
  { href: "/brain",    label: "Brain Training", icon: Brain },
  { href: "/fitness",  label: "Fitness",        icon: Dumbbell },
  { href: "/nutrition",label: "Nutrition",      icon: Apple },
  { href: "/insights", label: "Insights",       icon: BarChart3 },
  { href: "/settings", label: "Settings",       icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { profile, stats } = useUserStore();
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
  }

  return (
    <aside className="w-64 h-screen fixed left-0 top-0 flex flex-col bg-bg-card border-r border-border z-40">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-border">
        <Link href="/quests" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center">
            <Zap className="w-4 h-4 text-primary" />
          </div>
          <span className="font-display font-bold text-lg text-text">
            Inner<span className="text-primary">Quest</span>
          </span>
        </Link>
      </div>

      {/* User XP */}
      {stats && (
        <div className="px-5 py-4 border-b border-border">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary font-bold text-sm">
              {profile?.username?.[0]?.toUpperCase() ?? "?"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-text truncate">
                {profile?.username ?? "Hero"}
              </p>
              <p className="text-xs text-text-muted">
                {stats.streakDays} day streak 🔥
              </p>
            </div>
          </div>
          <XpBar xp={stats.xp} level={stats.level} compact />
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
                active
                  ? "bg-primary/15 text-primary border border-primary/25"
                  : "text-text-muted hover:text-text hover:bg-bg-elevated"
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-3 pb-4 border-t border-border pt-3">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-text-muted hover:text-danger hover:bg-danger/10 transition-all w-full"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
