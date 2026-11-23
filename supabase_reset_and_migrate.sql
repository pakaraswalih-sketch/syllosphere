-- ============================================================
-- SylloSphere: Complete Student Data Reset + Admin Migration
-- ============================================================
-- SAFE TO RUN: Preserves admin account, lessons, content_keys
-- Deletes all OTHER student data cleanly.
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- ============================================================

-- ─────────────────────────────────────────────────────────────
-- SECTION 1: STUDENT DATA RESET
-- ─────────────────────────────────────────────────────────────

-- Step 1A: Store admin user_id for safety checks
DO $$
DECLARE
  admin_user_id uuid;
BEGIN
  SELECT id INTO admin_user_id FROM auth.users WHERE email = 'pakaraswalih@gmail.com';
  RAISE NOTICE 'Admin user_id: %', admin_user_id;
END $$;

-- Step 1B: Delete all consult messages (child of threads, delete first)
DELETE FROM consult_messages;

-- Step 1C: Delete all consult threads
DELETE FROM consult_threads;

-- Step 1D: Delete all activity logs (not lesson-related)
DELETE FROM activity_logs;

-- Step 1E: Delete user_progress for all NON-admin users
-- (admin user has no meaningful progress to keep anyway, but safety first)
DELETE FROM user_progress
WHERE user_id != (
  SELECT id FROM auth.users WHERE email = 'pakaraswalih@gmail.com' LIMIT 1
);

-- Step 1F: Delete all auth users except admin
-- This permanently removes their login accounts from Supabase Auth
DELETE FROM auth.users
WHERE email != 'pakaraswalih@gmail.com';

-- Verification: Show remaining users
SELECT id, email, created_at FROM auth.users;

-- Verification: Show remaining progress rows
SELECT user_id, completed_lessons FROM user_progress;

-- ─────────────────────────────────────────────────────────────
-- SECTION 2: CREATE admin_students TABLE for manual management
-- ─────────────────────────────────────────────────────────────
-- Note: Students are stored in auth.users + user_progress.
-- This view gives admin a unified read access.

-- Step 2A: Create a secure admin_students view (read-only union)
CREATE OR REPLACE VIEW admin_student_view AS
SELECT
  u.id,
  u.email,
  u.created_at,
  u.last_sign_in_at,
  u.confirmed_at,
  u.banned_until,
  COALESCE(up.user_name, split_part(u.email, '@', 1)) AS display_name,
  up.completed_lessons,
  COALESCE(array_length(up.completed_lessons, 1), 0) AS lessons_completed,
  up.certificate_unlocked,
  up.certificate_id,
  up.updated_at AS last_active
FROM auth.users u
LEFT JOIN user_progress up ON up.user_id = u.id
WHERE u.email != 'pakaraswalih@gmail.com'
ORDER BY u.created_at DESC;

-- ─────────────────────────────────────────────────────────────
-- SECTION 3: UPGRADE consult_threads & consult_messages
-- Add unread tracking and direct messaging support
-- ─────────────────────────────────────────────────────────────

-- Step 3A: Add unread_count column to consult_threads (if not exists)
ALTER TABLE consult_threads
  ADD COLUMN IF NOT EXISTS unread_count integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_message_preview text DEFAULT '',
  ADD COLUMN IF NOT EXISTS last_message_at timestamptz DEFAULT now();

-- Step 3B: Add is_read column to consult_messages (if not exists)
ALTER TABLE consult_messages
  ADD COLUMN IF NOT EXISTS is_read boolean DEFAULT false;

-- Step 3C: Add user_email column to consult_threads for display
ALTER TABLE consult_threads
  ADD COLUMN IF NOT EXISTS user_email text DEFAULT '';

-- ─────────────────────────────────────────────────────────────
-- SECTION 4: RLS POLICIES
-- ─────────────────────────────────────────────────────────────

-- Enable RLS on user_progress (if not already enabled)
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

-- Students can only read/write their own progress
DROP POLICY IF EXISTS "student_own_progress" ON user_progress;
CREATE POLICY "student_own_progress" ON user_progress
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Admin can read ALL progress rows
DROP POLICY IF EXISTS "admin_read_all_progress" ON user_progress;
CREATE POLICY "admin_read_all_progress" ON user_progress
  FOR SELECT
  USING (
    (SELECT email FROM auth.users WHERE id = auth.uid()) = 'pakaraswalih@gmail.com'
  );

-- Enable RLS on consult_threads
ALTER TABLE consult_threads ENABLE ROW LEVEL SECURITY;

-- Students see only their own threads
DROP POLICY IF EXISTS "student_own_threads" ON consult_threads;
CREATE POLICY "student_own_threads" ON consult_threads
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Admin sees all threads
DROP POLICY IF EXISTS "admin_all_threads" ON consult_threads;
CREATE POLICY "admin_all_threads" ON consult_threads
  FOR ALL
  USING (
    (SELECT email FROM auth.users WHERE id = auth.uid()) = 'pakaraswalih@gmail.com'
  );

-- Enable RLS on consult_messages
ALTER TABLE consult_messages ENABLE ROW LEVEL SECURITY;

-- Students see only messages in their own threads
DROP POLICY IF EXISTS "student_own_messages" ON consult_messages;
CREATE POLICY "student_own_messages" ON consult_messages
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM consult_threads t
      WHERE t.id = thread_id AND t.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM consult_threads t
      WHERE t.id = thread_id AND t.user_id = auth.uid()
    )
  );

-- Admin sees all messages
DROP POLICY IF EXISTS "admin_all_messages" ON consult_messages;
CREATE POLICY "admin_all_messages" ON consult_messages
  FOR ALL
  USING (
    (SELECT email FROM auth.users WHERE id = auth.uid()) = 'pakaraswalih@gmail.com'
  );

-- ─────────────────────────────────────────────────────────────
-- SECTION 5: FUNCTION to auto-update thread metadata on new message
-- ─────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION update_thread_on_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE consult_threads
  SET
    last_message_preview = LEFT(NEW.message, 100),
    last_message_at = NEW.created_at,
    updated_at = NEW.created_at,
    -- Only increment unread if student sent the message (admin hasn't read it yet)
    unread_count = CASE
      WHEN NEW.sender_role = 'student' THEN unread_count + 1
      ELSE unread_count
    END
  WHERE id = NEW.thread_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_update_thread_on_message ON consult_messages;
CREATE TRIGGER trigger_update_thread_on_message
AFTER INSERT ON consult_messages
FOR EACH ROW EXECUTE FUNCTION update_thread_on_message();

-- ─────────────────────────────────────────────────────────────
-- SECTION 6: FUNCTION to reset unread count when admin reads thread
-- ─────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION mark_thread_read(p_thread_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE consult_threads
  SET unread_count = 0
  WHERE id = p_thread_id;
  
  UPDATE consult_messages
  SET is_read = true
  WHERE thread_id = p_thread_id AND sender_role = 'student';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execution to authenticated users (admin will call this)
GRANT EXECUTE ON FUNCTION mark_thread_read(uuid) TO authenticated;

-- ─────────────────────────────────────────────────────────────
-- FINAL VERIFICATION
-- ─────────────────────────────────────────────────────────────
SELECT 'lessons' AS tbl, count(*) FROM lessons
UNION ALL SELECT 'content_keys', count(*) FROM content_keys
UNION ALL SELECT 'user_progress', count(*) FROM user_progress
UNION ALL SELECT 'consult_threads', count(*) FROM consult_threads
UNION ALL SELECT 'consult_messages', count(*) FROM consult_messages
UNION ALL SELECT 'auth_users', count(*) FROM auth.users;
