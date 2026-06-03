import { WorkoutPlanner } from "@/components/fitness/WorkoutPlanner";
import { Dumbbell } from "lucide-react";

export default function FitnessPage() {
  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-display font-bold text-text flex items-center gap-2">
          <Dumbbell className="w-6 h-6 text-primary" />
          Fitness Planner
        </h1>
        <p className="text-text-muted text-sm mt-1">
          Generate a custom workout, follow step-by-step instructions, and track your time
        </p>
      </div>
      <WorkoutPlanner />
    </div>
  );
}
