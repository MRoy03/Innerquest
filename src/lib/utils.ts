import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}

export function calcXpPercent(current: number, next: number): number {
  return Math.min(100, Math.round((current / next) * 100));
}

export function calcNextLevelXp(level: number): number {
  return Math.pow(level + 1, 2) * 100;
}

export function getDifficultyColor(difficulty: number): string {
  if (difficulty <= 2) return "#3FB950";
  if (difficulty <= 4) return "#58A6FF";
  if (difficulty <= 6) return "#BC8CFF";
  if (difficulty <= 8) return "#FFD700";
  return "#F85149";
}

export function getRarityColor(rarity: string): string {
  const map: Record<string, string> = {
    common: "#8B949E",
    uncommon: "#3FB950",
    rare: "#58A6FF",
    epic: "#BC8CFF",
    legendary: "#FFD700",
  };
  return map[rarity] ?? "#8B949E";
}

export function relativeTime(date: string | Date): string {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}
