export type { Database } from "./database";

export interface UserProfile {
  id: string;
  username: string;
  avatarUrl: string | null;
  fitnessLevel: number;
  primaryGoal: string | null;
}

export interface UserStats {
  xp: number;
  level: number;
  strength: number;
  energy: number;
  discipline: number;
  moodScore: number;
  streakDays: number;
}

export interface Quest {
  id: string;
  title: string;
  description: string | null;
  difficulty: number;
  xpReward: number;
  category: "brain" | "fitness" | "nutrition" | "mental" | "boss";
  questType: "daily" | "weekly" | "boss";
  frequency: string;
}

export interface UserQuest extends Quest {
  userQuestId: string;
  completed: boolean;
  completedAt: string | null;
  progress: number;
  assignedDate: string;
}

export interface BrainGame {
  id: string;
  name: string;
  slug: string;
  description: string;
  mechanic: string;
  difficulty: "easy" | "medium" | "hard";
  maxRounds: number;
}

export interface Badge {
  id: string;
  badgeKey: string;
  name: string;
  description: string;
  badgeType: string;
  icon: string | null;
  earnedAt?: string;
}

export type Rarity = "common" | "uncommon" | "rare" | "epic" | "legendary";
