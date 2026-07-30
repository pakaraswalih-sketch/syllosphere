-- ============================================================
-- SYLLOSPHERE — Consult Q&A System Migration
-- Run this in your Supabase SQL Editor
-- ============================================================

-- 1. Create threads table
CREATE TABLE IF NOT EXISTS consult_threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  lesson_id INTEGER NOT NULL,
  status TEXT DEFAULT 'open', -- 'open' | 'resolved'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, lesson_id)
);

-- 2. Create messages table
CREATE TABLE IF NOT EXISTS consult_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID REFERENCES consult_threads(id) ON DELETE CASCADE,
  sender_role TEXT NOT NULL, -- 'student' | 'admin'
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Enable RLS
ALTER TABLE consult_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE consult_messages ENABLE ROW LEVEL SECURITY;

-- 4. Policies for Threads
DROP POLICY IF EXISTS "Users can view own threads" ON consult_threads;
DROP POLICY IF EXISTS "Users can insert own threads" ON consult_threads;
DROP POLICY IF EXISTS "Users can update own threads" ON consult_threads;
DROP POLICY IF EXISTS "Admins can view all threads" ON consult_threads;
DROP POLICY IF EXISTS "Admins can update all threads" ON consult_threads;

CREATE POLICY "Users can view own threads"
  ON consult_threads FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own threads"
  ON consult_threads FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own threads"
  ON consult_threads FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all threads"
  ON consult_threads FOR SELECT
  USING (
    auth.jwt() ->> 'email' IN ('pakaraswalih@gmail.com')
  );

CREATE POLICY "Admins can update all threads"
  ON consult_threads FOR UPDATE
  USING (
    auth.jwt() ->> 'email' IN ('pakaraswalih@gmail.com')
  )
  WITH CHECK (
    auth.jwt() ->> 'email' IN ('pakaraswalih@gmail.com')
  );

-- 5. Policies for Messages
DROP POLICY IF EXISTS "Users can view messages in own threads" ON consult_messages;
DROP POLICY IF EXISTS "Users can insert messages in own threads" ON consult_messages;
DROP POLICY IF EXISTS "Admins can view all messages" ON consult_messages;
DROP POLICY IF EXISTS "Admins can insert any message" ON consult_messages;

-- Users can only SELECT messages where the thread belongs to them
CREATE POLICY "Users can view messages in own threads"
  ON consult_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM consult_threads
      WHERE consult_threads.id = consult_messages.thread_id
      AND consult_threads.user_id = auth.uid()
    )
  );

-- Users can only INSERT messages into their own threads
CREATE POLICY "Users can insert messages in own threads"
  ON consult_messages FOR INSERT
  WITH CHECK (
    sender_role = 'student' AND
    EXISTS (
      SELECT 1 FROM consult_threads
      WHERE consult_threads.id = consult_messages.thread_id
      AND consult_threads.user_id = auth.uid()
    )
  );

-- Admins can SELECT all messages
CREATE POLICY "Admins can view all messages"
  ON consult_messages FOR SELECT
  USING (
    auth.jwt() ->> 'email' IN ('pakaraswalih@gmail.com')
  );

-- Admins can INSERT messages anywhere
CREATE POLICY "Admins can insert any message"
  ON consult_messages FOR INSERT
  WITH CHECK (
    auth.jwt() ->> 'email' IN ('pakaraswalih@gmail.com') AND
    sender_role = 'admin'
  );

-- 6. Trigger to auto-update 'updated_at' on consult_threads
CREATE OR REPLACE FUNCTION update_consult_threads_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_consult_threads_updated ON consult_threads;
CREATE TRIGGER trg_consult_threads_updated BEFORE UPDATE ON consult_threads
  FOR EACH ROW EXECUTE FUNCTION update_consult_threads_updated_at();

-- 7. Trigger to auto-update thread 'updated_at' when a new message is inserted
CREATE OR REPLACE FUNCTION bump_thread_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE consult_threads SET updated_at = NOW() WHERE id = NEW.thread_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_bump_thread_updated ON consult_messages;
CREATE TRIGGER trg_bump_thread_updated AFTER INSERT ON consult_messages
  FOR EACH ROW EXECUTE FUNCTION bump_thread_updated_at();

-- ============================================================
-- DONE! Q&A system tables are ready with RLS enforced.
-- ============================================================
