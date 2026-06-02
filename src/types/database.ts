export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string; user_id: string; username: string | null; avatar_url: string | null;
          fitness_level: number; weight_kg: number | null; height_cm: number | null;
          age: number | null; gender: string | null; primary_goal: string | null;
          budget_tier: string | null; daily_time_min: number | null; avatar_style: string | null;
          xp_cron_jobs: Json | null; last_active_date: string | null;
          created_at: string; updated_at: string;
        };
        Insert: {
          id?: string; user_id: string; username?: string | null; avatar_url?: string | null;
          fitness_level?: number; weight_kg?: number | null; height_cm?: number | null;
          age?: number | null; gender?: string | null; primary_goal?: string | null;
          budget_tier?: string | null; daily_time_min?: number | null; avatar_style?: string | null;
          xp_cron_jobs?: Json | null; last_active_date?: string | null;
        };
        Update: {
          username?: string | null; avatar_url?: string | null; fitness_level?: number;
          weight_kg?: number | null; height_cm?: number | null; age?: number | null;
          gender?: string | null; primary_goal?: string | null; budget_tier?: string | null;
          daily_time_min?: number | null; avatar_style?: string | null;
          xp_cron_jobs?: Json | null; last_active_date?: string | null; updated_at?: string;
        };
      };
      user_stats: {
        Row: {
          id: string; user_id: string; xp: number; level: number; total_calories: number;
          strength: number; energy: number; discipline: number; mood_score: number;
          streak_days: number; last_active_date: string | null; created_at: string; updated_at: string;
        };
        Insert: {
          id?: string; user_id: string; xp?: number; level?: number; total_calories?: number;
          strength?: number; energy?: number; discipline?: number; mood_score?: number;
          streak_days?: number; last_active_date?: string | null;
        };
        Update: {
          xp?: number; level?: number; total_calories?: number; strength?: number;
          energy?: number; discipline?: number; mood_score?: number; streak_days?: number;
          last_active_date?: string | null; updated_at?: string;
        };
      };
      quests: {
        Row: {
          id: string; title: string; description: string | null; difficulty: number;
          xp_reward: number; category: string; quest_type: string; base_xp: number;
          frequency: string; created_at: string;
        };
        Insert: {
          id?: string; title: string; description?: string | null; difficulty?: number;
          xp_reward: number; category: string; quest_type: string; base_xp?: number; frequency?: string;
        };
        Update: {
          title?: string; description?: string | null; difficulty?: number; xp_reward?: number;
          category?: string; quest_type?: string; base_xp?: number; frequency?: string;
        };
      };
      user_quests: {
        Row: {
          id: string; user_id: string; quest_id: string; completed: boolean;
          completed_at: string | null; assigned_date: string; progress: number; created_at: string;
        };
        Insert: {
          id?: string; user_id: string; quest_id: string; completed?: boolean;
          completed_at?: string | null; assigned_date?: string; progress?: number;
        };
        Update: {
          completed?: boolean; completed_at?: string | null; progress?: number;
        };
      };
      brain_sessions: {
        Row: {
          id: string; user_id: string; game_name: string; score: number;
          accuracy_pct: number; duration_secs: number; played_at: string;
        };
        Insert: {
          id?: string; user_id: string; game_name: string; score?: number;
          accuracy_pct?: number; duration_secs?: number; played_at?: string;
        };
        Update: { score?: number; accuracy_pct?: number; duration_secs?: number };
      };
      nutrition_logs: {
        Row: {
          id: string; user_id: string; meal_name: string; calories: number;
          protein_g: number; carbs_g: number; fat_g: number; logged_at: string;
        };
        Insert: {
          id?: string; user_id: string; meal_name: string; calories?: number;
          protein_g?: number; carbs_g?: number; fat_g?: number; logged_at?: string;
        };
        Update: {
          meal_name?: string; calories?: number; protein_g?: number; carbs_g?: number; fat_g?: number;
        };
      };
      workout_logs: {
        Row: {
          id: string; user_id: string; workout_name: string;
          duration_mins: number; calories_burned: number; logged_at: string;
        };
        Insert: {
          id?: string; user_id: string; workout_name: string;
          duration_mins?: number; calories_burned?: number; logged_at?: string;
        };
        Update: { workout_name?: string; duration_mins?: number; calories_burned?: number };
      };
      badges: {
        Row: {
          id: string; badge_key: string; name: string; description: string;
          badge_type: string; icon: string | null; created_at: string;
        };
        Insert: {
          id?: string; badge_key: string; name: string; description: string;
          badge_type: string; icon?: string | null;
        };
        Update: { name?: string; description?: string; badge_type?: string; icon?: string | null };
      };
      user_badges: {
        Row: { id: string; user_id: string; badge_id: string; earned_at: string };
        Insert: { id?: string; user_id: string; badge_id: string; earned_at?: string };
        Update: { earned_at?: string };
      };
      mood_logs: {
        Row: { id: string; user_id: string; score: number; note: string | null; entry_date: string };
        Insert: { id?: string; user_id: string; score: number; note?: string | null; entry_date?: string };
        Update: { score?: number; note?: string | null };
      };
    };
    Views: Record<string, never>;
    Functions: {
      award_xp: { Args: { p_user_id: string; p_amount: number }; Returns: void };
    };
    Enums: Record<string, never>;
  };
}
