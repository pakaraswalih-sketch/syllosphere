-- ============================================================
-- SYLLOSPHERE — Settings Page Infrastructure
-- Run this in your Supabase SQL Editor
-- ============================================================

-- 1. RPC to securely delete the authenticated user's account
CREATE OR REPLACE FUNCTION delete_user_account()
RETURNS void AS $$
BEGIN
  -- Deleting from auth.users will automatically cascade to user_progress
  -- and other tables thanks to the ON DELETE CASCADE constraints.
  DELETE FROM auth.users WHERE id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 1.5 Add avatar_url to user_progress for Leaderboard and public access
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_progress' AND column_name = 'avatar_url'
  ) THEN
    ALTER TABLE user_progress ADD COLUMN avatar_url TEXT;
  END IF;
END $$;

-- 2. Create the "avatars" storage bucket for profile photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Set up Storage RLS Policies
-- Allow public access to read avatars
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Avatar images are publicly accessible.' AND tablename = 'objects' AND schemaname = 'storage'
  ) THEN
    CREATE POLICY "Avatar images are publicly accessible." 
    ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
  END IF;
END $$;

-- Allow authenticated users to upload their own avatars
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Users can upload an avatar.' AND tablename = 'objects' AND schemaname = 'storage'
  ) THEN
    CREATE POLICY "Users can upload an avatar." 
    ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');
  END IF;
END $$;

-- Allow users to update their own avatars
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Users can update their own avatar.' AND tablename = 'objects' AND schemaname = 'storage'
  ) THEN
    CREATE POLICY "Users can update their own avatar." 
    ON storage.objects FOR UPDATE WITH CHECK (bucket_id = 'avatars' AND auth.uid() = owner);
  END IF;
END $$;

-- Allow users to delete their own avatars
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Users can delete their own avatar.' AND tablename = 'objects' AND schemaname = 'storage'
  ) THEN
    CREATE POLICY "Users can delete their own avatar." 
    ON storage.objects FOR DELETE USING (bucket_id = 'avatars' AND auth.uid() = owner);
  END IF;
END $$;
