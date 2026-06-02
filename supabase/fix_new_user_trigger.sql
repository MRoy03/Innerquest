-- ============================================================
-- FIX: "Database error saving new user"
-- Run this in Supabase Dashboard → SQL Editor
-- ============================================================

-- Drop old trigger and function first
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

-- Recreate with:
--   1. SET search_path = public  (Supabase requires this on SECURITY DEFINER functions)
--   2. ON CONFLICT (user_id)     (must specify the conflict column explicitly)
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id)
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;

  INSERT INTO public.user_stats (user_id)
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$;

-- Re-attach the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Grant execute permission to the trigger's invoker role
GRANT EXECUTE ON FUNCTION handle_new_user() TO postgres, service_role;
