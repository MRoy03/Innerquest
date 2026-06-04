-- ============================================================
-- Add BMI Records Table
-- Run in: Supabase Dashboard → SQL Editor
-- ============================================================

CREATE TABLE IF NOT EXISTS bmi_records (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id          UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  bmi              NUMERIC(4,1) NOT NULL,
  weight_kg        NUMERIC(5,2) NOT NULL,
  height_cm        NUMERIC(5,1) NOT NULL,
  body_type        TEXT,
  goal             TEXT,
  target_calories  INT,
  recorded_at      TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE bmi_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own BMI records"
  ON bmi_records FOR ALL
  USING (auth.uid() = user_id);
