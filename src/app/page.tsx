import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  Zap,
  Brain,
  Swords,
  Apple,
  Heart,
  BarChart3,
  Shield,
  Trophy,
  Star,
} from "lucide-react";

const FEATURES = [
  {
    icon: Swords,
    color: "text-primary",
    bg: "bg-primary/10 border-primary/20",
    title: "Quest System",
    desc: "Daily & weekly quests with boss challenges. Complete goals to earn XP and unlock rewards.",
  },
  {
    icon: Brain,
    color: "text-info",
    bg: "bg-info/10 border-info/20",
    title: "Brain Training",
    desc: "5 cognitive games: grid memory, sequences, reaction time, pattern recognition, and logic puzzles.",
  },
  {
    icon: Apple,
    color: "text-gold",
    bg: "bg-gold/10 border-gold/20",
    title: "Nutrition Hub",
    desc: "Personalized meal plans with macro tracking. Goals adjust dynamically to your fitness level.",
  },
  {
    icon: Heart,
    color: "text-[#BC8CFF]",
    bg: "bg-[#BC8CFF]/10 border-[#BC8CFF]/20",
    title: "Mental Wellness",
    desc: "Daily check-ins, mood journal, breathing exercises, and stress tracking.",
  },
  {
    icon: BarChart3,
    color: "text-success",
    bg: "bg-success/10 border-success/20",
    title: "Insights & Analytics",
    desc: "Behavioral pattern detection, wellness scoring, and weekly performance reports.",
  },
  {
    icon: Shield,
    color: "text-danger",
    bg: "bg-danger/10 border-danger/20",
    title: "RPG Progression",
    desc: "Level system, stat points (Strength, Energy, Discipline), badges, and streaks.",
  },
];

const BADGES = [
  { label: "First Quest", variant: "uncommon" as const },
  { label: "7-Day Streak", variant: "rare" as const },
  { label: "Brain Master", variant: "epic" as const },
  { label: "Iron Will", variant: "legendary" as const },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-bg">
      {/* Nav */}
      <nav className="border-b border-border px-6 py-4 flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center">
            <Zap className="w-4 h-4 text-primary" />
          </div>
          <span className="font-display font-bold text-lg text-text">
            Inner<span className="text-primary">Quest</span>
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login">
            <Button variant="ghost" size="sm">Sign In</Button>
          </Link>
          <Link href="/login?tab=signup">
            <Button variant="primary" size="sm">Get Started</Button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 py-24 text-center">
        <Badge variant="rare" className="mb-6">
          <Star className="w-3 h-3" /> Free to play · No credit card
        </Badge>
        <h1 className="text-5xl md:text-6xl font-display font-extrabold text-text leading-tight mb-6">
          Level Up Your{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-gold">
            Real Life
          </span>
        </h1>
        <p className="text-xl text-text-muted max-w-2xl mx-auto mb-10 leading-relaxed">
          InnerQuest turns brain training, fitness, nutrition, and mental wellness into an RPG adventure.
          Complete daily quests, earn XP, and become the best version of yourself.
        </p>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Link href="/login?tab=signup">
            <Button variant="primary" size="lg">
              <Swords className="w-5 h-5" /> Begin Your Quest
            </Button>
          </Link>
          <Link href="/login">
            <Button variant="secondary" size="lg">Sign In</Button>
          </Link>
        </div>

        {/* Badge teasers */}
        <div className="flex items-center justify-center gap-2 mt-10 flex-wrap">
          {BADGES.map((b) => (
            <Badge key={b.label} variant={b.variant}>
              <Trophy className="w-3 h-3" /> {b.label}
            </Badge>
          ))}
        </div>
      </section>

      {/* Features grid */}
      <section className="max-w-6xl mx-auto px-6 pb-24">
        <h2 className="text-2xl font-display font-bold text-text text-center mb-12">
          Everything you need to level up
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map(({ icon: Icon, color, bg, title, desc }) => (
            <div
              key={title}
              className="bg-bg-card border border-border rounded-2xl p-6 hover:border-primary/30 transition-all duration-200"
            >
              <div className={`w-11 h-11 rounded-xl border flex items-center justify-center mb-4 ${bg}`}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <h3 className="font-display font-semibold text-text mb-2">{title}</h3>
              <p className="text-text-muted text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border py-20 text-center px-6">
        <h2 className="text-3xl font-display font-bold text-text mb-4">
          Your adventure starts now
        </h2>
        <p className="text-text-muted mb-8 max-w-md mx-auto">
          Join thousands of heroes on a journey to a better mind, body, and life.
        </p>
        <Link href="/login?tab=signup">
          <Button variant="primary" size="lg">
            <Zap className="w-5 h-5" /> Start for Free
          </Button>
        </Link>
      </section>

      <footer className="border-t border-border px-6 py-6 text-center text-text-subtle text-xs">
        © 2026 InnerQuest · Built with Next.js + Supabase · Free tier, always.
      </footer>
    </div>
  );
}
