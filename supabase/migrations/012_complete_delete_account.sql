-- ============================================================
-- SYLLOSPHERE — Complete & Safe Student Account Deletion RPC
-- Run this in your Supabase SQL Editor if using RPC fallback
-- ============================================================

CREATE OR REPLACE FUNCTION public.delete_user_account()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, storage
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_email TEXT;
  v_tbl TEXT;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT LOWER(TRIM(email)) INTO v_email
  FROM auth.users
  WHERE id = v_user_id;

  IF v_email IS NULL THEN
    RAISE EXCEPTION 'Authenticated user record not found';
  END IF;

  -- Protect admin accounts unconditionally
  IF v_email IN ('pakaraswalih@gmail.com', 'admin@syllosphere.com') THEN
    RAISE EXCEPTION 'Admin accounts cannot be deleted';
  END IF;

  -- Remove user storage objects so FK constraints never block auth.users deletion
  DELETE FROM storage.objects
  WHERE owner = v_user_id
     OR (bucket_id = 'avatars' AND name LIKE v_user_id::text || '/%');

  -- Remove consult messages & threads
  IF to_regclass('public.consult_messages') IS NOT NULL AND to_regclass('public.consult_threads') IS NOT NULL THEN
    DELETE FROM public.consult_messages
    WHERE thread_id IN (SELECT id FROM public.consult_threads WHERE user_id = v_user_id);
  END IF;

  IF to_regclass('public.consult_threads') IS NOT NULL THEN
    DELETE FROM public.consult_threads WHERE user_id = v_user_id;
  END IF;

  -- Clean up optional user-scoped tables if present in schema
  FOREACH v_tbl IN ARRAY ARRAY[
    'practice_answers',
    'practice_sessions',
    'bookmarks',
    'certificates',
    'leaderboard',
    'activity_logs',
    'user_progress'
  ]
  LOOP
    IF to_regclass('public.' || v_tbl) IS NOT NULL THEN
      EXECUTE format('DELETE FROM public.%I WHERE user_id = $1', v_tbl) USING v_user_id;
    END IF;
  END LOOP;

  IF to_regclass('public.profiles') IS NOT NULL THEN
    DELETE FROM public.profiles WHERE id = v_user_id;
  END IF;

  -- Permanently delete the user from Supabase Auth (cascades sessions, identities, refresh_tokens)
  DELETE FROM auth.users WHERE id = v_user_id;
END;
$$;

REVOKE ALL ON FUNCTION public.delete_user_account() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.delete_user_account() TO authenticated;
