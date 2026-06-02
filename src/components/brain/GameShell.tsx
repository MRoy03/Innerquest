"use client";

import { Card } from "@/components/ui/Card";
import { GridGame } from "./GridGame";
import { SequenceGame } from "./SequenceGame";
import { TapTargetGame } from "./TapTargetGame";
import { IdentifyGame } from "./IdentifyGame";
import { ConstraintGame } from "./ConstraintGame";

const GAMES: Record<string, React.ComponentType> = {
  grid: GridGame,
  sequence: SequenceGame,
  "tap-target": TapTargetGame,
  identify: IdentifyGame,
  constraint: ConstraintGame,
};

export function GameShell({ gameSlug }: { gameSlug: string }) {
  const Game = GAMES[gameSlug];

  if (!Game) {
    return (
      <Card className="min-h-[400px] flex items-center justify-center text-text-muted text-sm">
        Game not found
      </Card>
    );
  }

  return (
    <Card className="min-h-[420px] flex flex-col justify-center">
      <Game />
    </Card>
  );
}
