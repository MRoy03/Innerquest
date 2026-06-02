import Link from "next/link";
import { Brain, Grid3X3, Hash, Target, Cpu, Puzzle } from "lucide-react";
import { Card, CardTitle, CardDescription } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

const GAMES = [
  {
    slug: "grid",
    name: "Brain Grid",
    description: "Memorize and recreate a 4x4 pattern before the timer runs out.",
    mechanic: "Memory",
    icon: Grid3X3,
    difficulty: "Medium",
    rounds: 3,
    xpPerRound: 20,
    color: "text-info",
  },
  {
    slug: "sequence",
    name: "Memorize Sequence",
    description: "Watch a number sequence and repeat it backwards — ASAP.",
    mechanic: "Memory + Speed",
    icon: Hash,
    difficulty: "Medium",
    rounds: 3,
    xpPerRound: 20,
    color: "text-[#BC8CFF]",
  },
  {
    slug: "tap-target",
    name: "Tap Target ASAP",
    description: "Tap the target the instant it appears. Reaction time is everything.",
    mechanic: "Reaction",
    icon: Target,
    difficulty: "Easy",
    rounds: 3,
    xpPerRound: 15,
    color: "text-success",
  },
  {
    slug: "identify",
    name: "Identify Next Item",
    description: "Predict what comes next in the pattern sequence.",
    mechanic: "Pattern Recognition",
    icon: Cpu,
    difficulty: "Hard",
    rounds: 3,
    xpPerRound: 25,
    color: "text-gold",
  },
  {
    slug: "constraint",
    name: "Constraint Puzzle",
    description: "Solve a logic puzzle under strict rules and limited moves.",
    mechanic: "Logic",
    icon: Puzzle,
    difficulty: "Hard",
    rounds: 3,
    xpPerRound: 25,
    color: "text-danger",
  },
];

const difficultyVariant: Record<string, "common" | "uncommon" | "rare" | "epic" | "legendary"> = {
  Easy: "uncommon",
  Medium: "rare",
  Hard: "epic",
};

export default function BrainPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-display font-bold text-text flex items-center gap-2">
          <Brain className="w-6 h-6 text-primary" />
          Brain Training
        </h1>
        <p className="text-text-muted text-sm mt-1">
          Play all 5 games in a day for a +100 XP bonus. A+ grade adds +20 XP per game.
        </p>
      </div>

      {/* Bonus notice */}
      <div className="bg-primary/10 border border-primary/20 rounded-xl px-5 py-4 flex items-center gap-3">
        <Brain className="w-5 h-5 text-primary shrink-0" />
        <p className="text-sm text-text">
          <span className="font-semibold text-primary">Brain XP Formula:</span>{" "}
          base +40XP · A+ grade +20XP · All 5 in one day +100XP
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {GAMES.map((game) => {
          const Icon = game.icon;
          return (
            <Link key={game.slug} href={`/brain/${game.slug}`}>
              <Card hoverable className="h-full flex flex-col">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-bg-elevated border border-border flex items-center justify-center shrink-0">
                    <Icon className={`w-5 h-5 ${game.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base">{game.name}</CardTitle>
                    <span className="text-xs text-text-subtle">{game.mechanic}</span>
                  </div>
                </div>
                <CardDescription className="flex-1 mb-4">{game.description}</CardDescription>
                <div className="flex items-center justify-between mt-auto">
                  <Badge variant={difficultyVariant[game.difficulty]}>{game.difficulty}</Badge>
                  <span className="text-xs font-semibold text-gold">
                    +{game.xpPerRound * game.rounds} XP max
                  </span>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
