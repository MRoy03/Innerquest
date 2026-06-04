import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Zap, Brain, Swords, Apple, Heart, BarChart3, Shield, Trophy, Star } from "lucide-react";

const FEATURES = [
  { icon: Swords,    color: "text-primary",   bg: "bg-primary/10 border-primary/20",     title: "Quest System",        desc: "Daily & weekly quests with boss challenges." },
  { icon: Brain,     color: "text-info",      bg: "bg-info/10 border-info/20",           title: "Brain Training",      desc: "5 cognitive games to sharpen your mind." },
  { icon: Apple,     color: "text-gold",      bg: "bg-gold/10 border-gold/20",           title: "Nutrition Hub",       desc: "Macro tracking with auto-calculate from meal name." },
  { icon: Heart,     color: "text-[#BC8CFF]", bg: "bg-[#BC8CFF]/10 border-[#BC8CFF]/20",title: "Mental Wellness",     desc: "Guided breathing, mood journal, stress tracking." },
  { icon: BarChart3, color: "text-success",   bg: "bg-success/10 border-success/20",     title: "Insights",            desc: "Behavioral analytics and weekly performance reports." },
  { icon: Shield,    color: "text-danger",    bg: "bg-danger/10 border-danger/20",       title: "RPG Progression",     desc: "Level up, earn badges, build streaks." },
];

const BADGES = [
  { label: "First Quest", variant: "uncommon" as const },
  { label: "7-Day Streak", variant: "rare" as const },
  { label: "Brain Master", variant: "epic" as const },
  { label: "Iron Will",    variant: "legendary" as const },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-bg">
      {/* Nav */}
      <nav className="border-b border-border px-4 sm:px-6 py-4 flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center">
            <Zap className="w-4 h-4 text-primary" />
          </div>
          <span className="font-display font-bold text-base sm:text-lg text-text">
            Inner<span className="text-primary">Quest</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/login">
            <Button variant="ghost" size="sm">Sign In</Button>
          </Link>
          <Link href="/login?tab=signup">
            <Button variant="primary" size="sm">Get Started</Button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-14 sm:py-24 text-center">
        <Badge variant="rare" className="mb-5 sm:mb-6">
          <Star className="w-3 h-3" /> Free to play · No credit card
        </Badge>
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-display font-extrabold text-text leading-tight mb-4 sm:mb-6">
          Level Up Your{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-gold">
            Real Life
          </span>
        </h1>
        <p className="text-base sm:text-xl text-text-muted max-w-2xl mx-auto mb-8 sm:mb-10 leading-relaxed">
          InnerQuest turns brain training, fitness, nutrition, and mental wellness into an RPG adventure.
          Complete daily quests, earn XP, and become the best version of yourself.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
          <Link href="/login?tab=signup" className="w-full sm:w-auto">
            <Button variant="primary" size="lg" fullWidth>
              <Swords className="w-5 h-5" /> Begin Your Quest
            </Button>
          </Link>
          <Link href="/login" className="w-full sm:w-auto">
            <Button variant="secondary" size="lg" fullWidth>Sign In</Button>
          </Link>
        </div>

        {/* Badge teasers */}
        <div className="flex items-center justify-center gap-2 mt-8 sm:mt-10 flex-wrap">
          {BADGES.map((b) => (
            <Badge key={b.label} variant={b.variant}>
              <Trophy className="w-3 h-3" /> {b.label}
            </Badge>
          ))}
        </div>
      </section>

      {/* Features grid */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-16 sm:pb-24">
        <h2 className="text-xl sm:text-2xl font-display font-bold text-text text-center mb-8 sm:mb-12">
          Everything you need to level up
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map(({ icon: Icon, color, bg, title, desc }) => (
            <div
              key={title}
              className="bg-bg-card border border-border rounded-2xl p-5 hover:border-primary/30 transition-all duration-200"
            >
              <div className={`w-10 h-10 rounded-xl border flex items-center justify-center mb-3 ${bg}`}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <h3 className="font-display font-semibold text-text mb-1.5">{title}</h3>
              <p className="text-text-muted text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border py-14 sm:py-20 text-center px-4 sm:px-6">
        <h2 className="text-2xl sm:text-3xl font-display font-bold text-text mb-3 sm:mb-4">
          Your adventure starts now
        </h2>
        <p className="text-text-muted mb-6 sm:mb-8 max-w-md mx-auto text-sm sm:text-base">
          Join thousands of heroes on a journey to a better mind, body, and life.
        </p>
        <Link href="/login?tab=signup">
          <Button variant="primary" size="lg">
            <Zap className="w-5 h-5" /> Start for Free
          </Button>
        </Link>
      </section>

      <footer className="border-t border-border px-4 py-5 text-center text-text-subtle text-xs">
        © 2026 InnerQuest · Built with Next.js + Supabase · Free tier, always.
      </footer>
    </div>
  );
}
