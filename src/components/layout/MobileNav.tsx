"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Swords, Brain, Dumbbell, Apple, Scale, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";

// Show most important 6 items; Settings accessible via Insights → sidebar on desktop
const NAV = [
  { href: "/quests",    label: "Quests",  icon: Swords },
  { href: "/brain",     label: "Brain",   icon: Brain },
  { href: "/fitness",   label: "Fitness", icon: Dumbbell },
  { href: "/bmi",       label: "BMI",     icon: Scale },
  { href: "/nutrition", label: "Food",    icon: Apple },
  { href: "/insights",  label: "Insights",icon: BarChart3 },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-bg-card/95 backdrop-blur-md border-t border-border safe-area-bottom">
      <div className="flex items-center justify-around px-1 py-2">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center gap-0.5 px-1.5 py-1.5 rounded-xl transition-all min-w-0 flex-1",
                active ? "text-primary" : "text-text-subtle"
              )}
            >
              <Icon className={cn("w-5 h-5 shrink-0", active && "drop-shadow-[0_0_6px_rgba(78,205,196,0.8)]")} />
              <span className={cn("text-[9px] font-medium leading-none truncate", active ? "text-primary" : "text-text-subtle")}>
                {label}
              </span>
              {active && <span className="w-1 h-1 rounded-full bg-primary mt-0.5" />}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
