-- ============================================================
-- SYLLOSPHERE — User Progress RLS Migration
-- Run this in your Supabase SQL Editor
-- ============================================================

-- 1. Create user_progress table if it doesn't exist
CREATE TABLE IF NOT EXISTS user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  user_name TEXT,
  completed_lessons JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Add user_id column if table already exists but column doesn't
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_progress' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE user_progress ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END
$$;

-- 3. Create unique constraint on user_id (remove old user_name unique if exists)
DO $$
BEGIN
  -- Drop old unique constraint on user_name if it exists
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'user_progress_user_name_key'
  ) THEN
    ALTER TABLE user_progress DROP CONSTRAINT user_progress_user_name_key;
  END IF;

  -- Add unique constraint on user_id if not exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'user_progress_user_id_key'
  ) THEN
    ALTER TABLE user_progress ADD CONSTRAINT user_progress_user_id_key UNIQUE (user_id);
  END IF;
END
$$;

-- 4. Enable RLS
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

-- 5. Drop old policies if they exist
DROP POLICY IF EXISTS "Users can view own progress" ON user_progress;
DROP POLICY IF EXISTS "Users can insert own progress" ON user_progress;
DROP POLICY IF EXISTS "Users can update own progress" ON user_progress;
DROP POLICY IF EXISTS "Users can delete own progress" ON user_progress;
DROP POLICY IF EXISTS "Admins can do everything on user_progress" ON user_progress;

-- 6. Create RLS policies — each user sees ONLY their own data
CREATE POLICY "Users can view own progress"
  ON user_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress"
  ON user_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress"
  ON user_progress FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own progress"
  ON user_progress FOR DELETE
  USING (auth.uid() = user_id);

-- 7. Update trigger for updated_at
CREATE OR REPLACE FUNCTION update_user_progress_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_user_progress_updated ON user_progress;
CREATE TRIGGER trg_user_progress_updated BEFORE UPDATE ON user_progress
  FOR EACH ROW EXECUTE FUNCTION update_user_progress_updated_at();

-- ============================================================
-- DONE! Each user can now only see/edit their own progress row.
-- ============================================================
