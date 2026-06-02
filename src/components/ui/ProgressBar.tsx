"use client";

import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number;
  max?: number;
  label?: string;
  showPercent?: boolean;
  color?: "primary" | "gold" | "success" | "danger" | "epic";
  size?: "sm" | "md" | "lg";
  animated?: boolean;
  className?: string;
}

const colorMap = {
  primary: "bg-primary",
  gold: "bg-gold",
  success: "bg-success",
  danger: "bg-danger",
  epic: "bg-[#BC8CFF]",
};

const sizeMap = {
  sm: "h-1.5",
  md: "h-2.5",
  lg: "h-4",
};

export function ProgressBar({
  value,
  max = 100,
  label,
  showPercent = false,
  color = "primary",
  size = "md",
  animated = false,
  className,
}: ProgressBarProps) {
  const percent = Math.min(100, Math.round((value / max) * 100));

  return (
    <div className={cn("w-full", className)}>
      {(label || showPercent) && (
        <div className="flex justify-between items-center mb-1.5">
          {label && <span className="text-xs text-text-muted font-medium">{label}</span>}
          {showPercent && (
            <span className="text-xs text-text-subtle">{percent}%</span>
          )}
        </div>
      )}
      <div className={cn("w-full bg-bg-elevated rounded-full overflow-hidden", sizeMap[size])}>
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500",
            colorMap[color],
            animated && "animate-pulse"
          )}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
