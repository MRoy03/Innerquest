-- ============================================================
-- InnerQuest — Supabase PostgreSQL Schema
-- Run this in: Supabase Dashboard → SQL Editor → New query
-- ============================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_cron";

-- ============================================================
-- PROFILES
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  username        TEXT,
  avatar_url      TEXT,
  fitness_level   INT DEFAULT 1 CHECK (fitness_level BETWEEN 1 AND 3),
  weight_kg       NUMERIC(5,2),
  height_cm       NUMERIC(5,1),
  age             INT,
  gender          TEXT,
  primary_goal    TEXT,
  budget_tier     TEXT DEFAULT 'free',
  daily_time_min  INT DEFAULT 30,
  avatar_style    TEXT DEFAULT 'warrior',
  xp_cron_jobs    JSONB DEFAULT '{}',
  last_active_date DATE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- USER STATS
-- ============================================================
CREATE TABLE IF NOT EXISTS user_stats (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  xp              INT DEFAULT 0,
  level           INT DEFAULT 1,
  total_calories  NUMERIC DEFAULT 0,
  strength        INT DEFAULT 0 CHECK (strength BETWEEN 0 AND 100),
  energy          INT DEFAULT 0 CHECK (energy BETWEEN 0 AND 100),
  discipline      INT DEFAULT 0 CHECK (discipline BETWEEN 0 AND 100),
  mood_score      NUMERIC(3,1) DEFAULT 5.0 CHECK (mood_score BETWEEN 0 AND 10),
  streak_days     INT DEFAULT 0,
  last_active_date DATE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- QUESTS
-- ============================================================
CREATE TABLE IF NOT EXISTS quests (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title       TEXT NOT NULL,
  description TEXT,
  difficulty  INT DEFAULT 1 CHECK (difficulty BETWEEN 1 AND 10),
  xp_reward   INT NOT NULL DEFAULT 50,
  category    TEXT NOT NULL CHECK (category IN ('brain','fitness','nutrition','mental','boss')),
  quest_type  TEXT NOT NULL CHECK (quest_type IN ('daily','weekly','boss')),
  base_xp     INT DEFAULT 50,
  frequency   TEXT DEFAULT 'daily',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- USER QUESTS (junction — assigned quests per user per day)
-- ============================================================
CREATE TABLE IF NOT EXISTS user_quests (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  quest_id      UUID REFERENCES quests(id) ON DELETE CASCADE,
  completed     BOOLEAN DEFAULT FALSE,
  completed_at  TIMESTAMPTZ,
  assigned_date DATE DEFAULT CURRENT_DATE,
  progress      INT DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, quest_id, assigned_date)
);

-- ============================================================
-- BRAIN SESSIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS brain_sessions (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id        UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  game_name      TEXT NOT NULL,
  score          INT DEFAULT 0,
  accuracy_pct   NUMERIC(5,2) DEFAULT 0,
  duration_secs  INT DEFAULT 0,
  played_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- NUTRITION LOGS
-- ============================================================
CREATE TABLE IF NOT EXISTS nutrition_logs (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  meal_name  TEXT NOT NULL,
  calories   NUMERIC(7,2) DEFAULT 0,
  protein_g  NUMERIC(6,2) DEFAULT 0,
  carbs_g    NUMERIC(6,2) DEFAULT 0,
  fat_g      NUMERIC(6,2) DEFAULT 0,
  logged_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- WORKOUT LOGS
-- ============================================================
CREATE TABLE IF NOT EXISTS workout_logs (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id          UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  workout_name     TEXT NOT NULL,
  duration_mins    INT DEFAULT 0,
  calories_burned  NUMERIC(6,2) DEFAULT 0,
  logged_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- BADGES
-- ============================================================
CREATE TABLE IF NOT EXISTS badges (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  badge_key   TEXT UNIQUE NOT NULL,
  name        TEXT NOT NULL,
  description TEXT NOT NULL,
  badge_type  TEXT NOT NULL CHECK (badge_type IN ('streak','milestone','achievement','special')),
  icon        TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- USER BADGES
-- ============================================================
CREATE TABLE IF NOT EXISTS user_badges (
  id        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id   UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_id  UUID REFERENCES badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);

-- ============================================================
-- MOOD LOGS
-- ============================================================
CREATE TABLE IF NOT EXISTS mood_logs (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  score       INT NOT NULL CHECK (score BETWEEN 1 AND 10),
  note        TEXT CHECK (char_length(note) <= 200),
  entry_date  DATE DEFAULT CURRENT_DATE,
  UNIQUE(user_id, entry_date)
);

-- ============================================================
-- UPDATED_AT TRIGGER
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER user_stats_updated_at BEFORE UPDATE ON user_stats
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- AUTO-CREATE PROFILE + STATS ON SIGN UP
-- ============================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (user_id) VALUES (NEW.id) ON CONFLICT DO NOTHING;
  INSERT INTO user_stats (user_id) VALUES (NEW.id) ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- XP AWARD FUNCTION
-- ============================================================
CREATE OR REPLACE FUNCTION award_xp(p_user_id UUID, p_amount INT)
RETURNS VOID AS $$
DECLARE
  v_new_xp INT;
  v_new_level INT;
BEGIN
  UPDATE user_stats
  SET xp = xp + p_amount,
      updated_at = NOW()
  WHERE user_id = p_user_id
  RETURNING xp INTO v_new_xp;

  v_new_level := FLOOR(SQRT(v_new_xp::FLOAT / 100));

  UPDATE user_stats
  SET level = GREATEST(level, v_new_level)
  WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- RLS — Row Level Security
-- ============================================================
ALTER TABLE profiles      ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_stats    ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_quests   ENABLE ROW LEVEL SECURITY;
ALTER TABLE brain_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE nutrition_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_logs   ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges    ENABLE ROW LEVEL SECURITY;
ALTER TABLE mood_logs      ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE POLICY "Users can view own profile"  ON profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = user_id);

-- User stats
CREATE POLICY "Users can view own stats"   ON user_stats FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own stats" ON user_stats FOR UPDATE USING (auth.uid() = user_id);

-- User quests
CREATE POLICY "Users can view own quests"   ON user_quests FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own quests" ON user_quests FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own quests" ON user_quests FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Brain sessions
CREATE POLICY "Users can view own sessions"   ON brain_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own sessions" ON brain_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Nutrition logs
CREATE POLICY "Users can manage own nutrition" ON nutrition_logs FOR ALL USING (auth.uid() = user_id);

-- Workout logs
CREATE POLICY "Users can manage own workouts"  ON workout_logs FOR ALL USING (auth.uid() = user_id);

-- User badges
CREATE POLICY "Users can view own badges"   ON user_badges FOR SELECT USING (auth.uid() = user_id);

-- Mood logs
CREATE POLICY "Users can manage own mood"   ON mood_logs FOR ALL USING (auth.uid() = user_id);

-- Quests + badges are public read
ALTER TABLE quests ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Quests are public read" ON quests FOR SELECT USING (true);
CREATE POLICY "Badges are public read" ON badges FOR SELECT USING (true);

-- ============================================================
-- SEED DATA — Badges
-- ============================================================
INSERT INTO badges (badge_key, name, description, badge_type, icon) VALUES
  ('first_quest',       'First Quest',      'Completed your very first quest',         'milestone', '⚔️'),
  ('on_fire',           'On Fire',          '3-day quest streak',                      'streak',    '🔥'),
  ('unstoppable',       'Unstoppable',       '7-day streak',                           'streak',    '🌟'),
  ('brain_master',      'Brain Master',     'Played all 5 brain games in one day',     'achievement','🧠'),
  ('iron_will',         'Iron Will',        '100 physical quests completed',           'milestone', '💪'),
  ('zen_mode',          'Zen Mode',         '30 mental wellness sessions',             'achievement','🧘'),
  ('nutrition_pro',     'Nutrition Pro',    'Logged all meals for 7 days straight',    'milestone', '🥗'),
  ('century_club',      'Century Club',     'Reached Level 10',                        'milestone', '🏆'),
  ('legend',            'Legend',           'Reached Level 50',                        'special',   '👑')
ON CONFLICT (badge_key) DO NOTHING;

-- ============================================================
-- SEED DATA — Quests
-- ============================================================
INSERT INTO quests (title, description, difficulty, xp_reward, category, quest_type, base_xp, frequency) VALUES
  ('Morning Meditation',        '5 minutes of mindful breathing',         2, 50,  'mental',    'daily',  50,  'daily'),
  ('10-min Walk',               'Go for a brisk 10-minute walk',          1, 40,  'fitness',   'daily',  40,  'daily'),
  ('Brain Grid',                'Complete one Brain Grid game session',    3, 60,  'brain',     'daily',  60,  'daily'),
  ('Log Breakfast',             'Log your breakfast meal',                 1, 30,  'nutrition', 'daily',  30,  'daily'),
  ('Log All 3 Meals',           'Log breakfast, lunch, and dinner',        2, 70,  'nutrition', 'daily',  70,  'daily'),
  ('30-min Cardio',             '30 minutes of cardiovascular exercise',   4, 100, 'fitness',   'daily',  100, 'daily'),
  ('Mood Check-in',             'Log your daily mood score (1-10)',        1, 20,  'mental',    'daily',  20,  'daily'),
  ('Breathing Exercise',        '4-7-8 breathing technique, 3 rounds',    2, 40,  'mental',    'daily',  40,  'daily'),
  ('Strength Training',         '45-min resistance training session',      5, 120, 'fitness',   'daily',  120, 'daily'),
  ('5 Brain Games',             'Complete all 5 brain training games',     5, 200, 'brain',     'daily',  200, 'daily'),
  ('7-Day Streak Challenge',    'Complete daily quests for 7 days',        6, 300, 'fitness',   'weekly', 300, 'weekly'),
  ('Weekly Nutrition Target',   'Hit macro goals for 5 of 7 days',         5, 250, 'nutrition', 'weekly', 250, 'weekly'),
  ('Boss: Iron Will Trial',     'Complete 10 fitness quests in one week',  9, 500, 'boss',      'boss',   500, 'weekly')
ON CONFLICT DO NOTHING;

-- ============================================================
-- pg_cron — Daily quest reset at midnight UTC
-- ============================================================
-- Uncomment after enabling pg_cron in Supabase extensions:
--
-- SELECT cron.schedule(
--   'daily-quest-reset',
--   '0 0 * * *',
--   $$
--     INSERT INTO user_quests (user_id, quest_id, assigned_date)
--     SELECT DISTINCT uq.user_id, q.id, CURRENT_DATE
--     FROM user_quests uq
--     CROSS JOIN quests q
--     WHERE q.quest_type = 'daily'
--     ON CONFLICT (user_id, quest_id, assigned_date) DO NOTHING;
--   $$
-- );
