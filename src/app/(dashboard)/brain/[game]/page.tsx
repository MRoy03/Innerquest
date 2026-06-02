import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { GameShell } from "@/components/brain/GameShell";

const VALID_GAMES = ["grid", "sequence", "tap-target", "identify", "constraint"];

const GAME_META: Record<string, { name: string; description: string }> = {
  grid: { name: "Brain Grid", description: "Memorize the 4x4 pattern and recreate it." },
  sequence: { name: "Memorize Sequence", description: "Repeat the sequence backwards, ASAP." },
  "tap-target": { name: "Tap Target ASAP", description: "Tap when the target appears." },
  identify: { name: "Identify Next Item", description: "Predict the next item in the pattern." },
  constraint: { name: "Constraint Puzzle", description: "Solve the logic puzzle." },
};

export function generateStaticParams() {
  return VALID_GAMES.map((game) => ({ game }));
}

export default async function GamePage({ params }: { params: Promise<{ game: string }> }) {
  const { game } = await params;
  if (!VALID_GAMES.includes(game)) notFound();
  const meta = GAME_META[game];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/brain"
          className="text-text-muted hover:text-text transition-colors flex items-center gap-1.5 text-sm"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>
        <div>
          <h1 className="text-xl font-display font-bold text-text">{meta.name}</h1>
          <p className="text-text-muted text-sm">{meta.description}</p>
        </div>
      </div>
      <GameShell gameSlug={game} />
    </div>
  );
}
