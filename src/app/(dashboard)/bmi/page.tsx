import { Scale } from "lucide-react";
import { BmiCalculator } from "@/components/bmi/BmiCalculator";

export default function BmiPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-text flex items-center gap-2">
          <Scale className="w-6 h-6 text-primary" />
          Advanced BMI Calculator
        </h1>
        <p className="text-text-muted text-sm mt-1">
          Get your actual + ideal BMI, personalized meal plan, and custom exercise recommendations
        </p>
      </div>
      <BmiCalculator />
    </div>
  );
}
