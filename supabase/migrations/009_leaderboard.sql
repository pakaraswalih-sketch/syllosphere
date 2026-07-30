-- ============================================================
-- SYLLOSPHERE — Leaderboard Migration
-- ============================================================

-- 1. Add current_streak to user_progress
ALTER TABLE user_progress ADD COLUMN IF NOT EXISTS current_streak INTEGER DEFAULT 0;

-- 2. Create get_leaderboard function bypassing RLS
CREATE OR REPLACE FUNCTION get_leaderboard()
RETURNS TABLE (
  user_id UUID,
  user_name TEXT,
  completed_count INT,
  xp INT,
  current_streak INT,
  current_level TEXT,
  updated_at TIMESTAMPTZ
)
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    up.user_id,
    up.user_name,
    jsonb_array_length(CASE WHEN jsonb_typeof(up.completed_lessons) = 'array' THEN up.completed_lessons ELSE '[]'::jsonb END)::INT as completed_count,
    jsonb_array_length(CASE WHEN jsonb_typeof(up.completed_lessons) = 'array' THEN up.completed_lessons ELSE '[]'::jsonb END)::INT * 10 as xp,
    COALESCE(up.current_streak, 0) as current_streak,
    CASE 
      WHEN jsonb_array_length(CASE WHEN jsonb_typeof(up.completed_lessons) = 'array' THEN up.completed_lessons ELSE '[]'::jsonb END)::INT >= 54 THEN 'Master'
      WHEN jsonb_array_length(CASE WHEN jsonb_typeof(up.completed_lessons) = 'array' THEN up.completed_lessons ELSE '[]'::jsonb END)::INT >= 36 THEN 'Advanced'
      WHEN jsonb_array_length(CASE WHEN jsonb_typeof(up.completed_lessons) = 'array' THEN up.completed_lessons ELSE '[]'::jsonb END)::INT >= 18 THEN 'Intermediate'
      ELSE 'Beginner'
    END as current_level,
    up.updated_at
  FROM user_progress up
  ORDER BY xp DESC, completed_count DESC, up.user_name ASC;
END;
$$;
