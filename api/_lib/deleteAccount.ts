import { createClient } from '@supabase/supabase-js';

export const PROTECTED_ADMIN_EMAILS = new Set([
  'pakaraswalih@gmail.com',
  'admin@syllosphere.com',
]);

export interface DeleteAccountResult {
  status: number;
  body: {
    success?: boolean;
    message?: string;
    error?: string;
    code?: string;
  };
}

function isMissingRelationError(error: any): boolean {
  const msg = String(error?.message || '').toLowerCase();
  const code = String(error?.code || '');
  return (
    code === '42P01' ||
    code === '42703' ||
    code === 'PGRST205' ||
    msg.includes('does not exist') ||
    msg.includes('could not find the table') ||
    msg.includes('schema cache')
  );
}

/**
 * Verifies caller JWT, enforces admin protection, removes user-owned storage
 * and database rows, and permanently deletes the user from Supabase Auth.
 */
export async function executeAccountDeletion(authHeader?: string): Promise<DeleteAccountResult> {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return {
      status: 501,
      body: {
        error: 'Server account deletion is not configured (missing SUPABASE_SERVICE_ROLE_KEY).',
        code: 'MISSING_SERVICE_ROLE_KEY',
      },
    };
  }

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return {
      status: 401,
      body: { error: 'Missing or invalid authorization token.' },
    };
  }

  const accessToken = authHeader.slice('Bearer '.length).trim();
  if (!accessToken) {
    return {
      status: 401,
      body: { error: 'Authorization token is empty.' },
    };
  }

  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  // 1. Verify the caller's identity strictly from their JWT
  const {
    data: { user },
    error: authError,
  } = await supabaseAdmin.auth.getUser(accessToken);

  if (authError || !user) {
    return {
      status: 401,
      body: { error: 'Session expired or invalid. Please log in again before deleting your account.' },
    };
  }

  // 2. Protect admin accounts unconditionally
  const normalizedEmail = (user.email || '').trim().toLowerCase();
  const appRole = String(user.app_metadata?.role || '').toLowerCase();
  const userRole = String(user.user_metadata?.role || '').toLowerCase();

  if (
    PROTECTED_ADMIN_EMAILS.has(normalizedEmail) ||
    appRole === 'admin' ||
    userRole === 'admin'
  ) {
    return {
      status: 403,
      body: { error: 'Admin accounts are protected and cannot be deleted.' },
    };
  }

  const userId = user.id;

  // 3. Remove user files from Supabase Storage (avatars bucket)
  try {
    const { data: folderFiles } = await supabaseAdmin.storage
      .from('avatars')
      .list(userId, { limit: 100 });

    if (folderFiles && folderFiles.length > 0) {
      const paths = folderFiles.map((f) => `${userId}/${f.name}`);
      await supabaseAdmin.storage.from('avatars').remove(paths);
    }

    const { data: rootFiles } = await supabaseAdmin.storage
      .from('avatars')
      .list('', { limit: 100, search: userId });

    if (rootFiles && rootFiles.length > 0) {
      const matchingRootPaths = rootFiles
        .filter((f) => f.name.startsWith(userId))
        .map((f) => f.name);
      if (matchingRootPaths.length > 0) {
        await supabaseAdmin.storage.from('avatars').remove(matchingRootPaths);
      }
    }
  } catch (storageErr) {
    console.warn('[deleteAccount] Storage cleanup warning:', storageErr);
  }

  // Helper to delete rows for this user safely without failing if an optional table is absent
  const safeDelete = async (table: string, column = 'user_id') => {
    const { error } = await supabaseAdmin.from(table).delete().eq(column, userId);
    if (error && !isMissingRelationError(error)) {
      throw new Error(`Failed to clean up ${table}: ${error.message}`);
    }
  };

  try {
    // 4. Delete consult messages belonging to this student's threads, then delete threads
    const { data: threads, error: threadsFetchErr } = await supabaseAdmin
      .from('consult_threads')
      .select('id')
      .eq('user_id', userId);

    if (threadsFetchErr && !isMissingRelationError(threadsFetchErr)) {
      throw new Error(`Failed to query consult_threads: ${threadsFetchErr.message}`);
    }

    if (threads && threads.length > 0) {
      const threadIds = threads.map((t: { id: string }) => t.id);
      const { error: msgErr } = await supabaseAdmin
        .from('consult_messages')
        .delete()
        .in('thread_id', threadIds);
      if (msgErr && !isMissingRelationError(msgErr)) {
        throw new Error(`Failed to clean up consult_messages: ${msgErr.message}`);
      }
    }

    await safeDelete('consult_threads');

    // 5. Delete personal records across all known/optional user-scoped tables
    await safeDelete('practice_answers');
    await safeDelete('practice_sessions');
    await safeDelete('bookmarks');
    await safeDelete('certificates');
    await safeDelete('leaderboard');
    await safeDelete('activity_logs');
    await safeDelete('profiles', 'id');
    await safeDelete('profiles', 'user_id');
    await safeDelete('user_progress');

    // 6. Permanently delete the user from Supabase Auth (auth.users)
    const { error: deleteAuthError } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (deleteAuthError) {
      return {
        status: 500,
        body: { error: `Failed to delete authentication account: ${deleteAuthError.message}` },
      };
    }

    return {
      status: 200,
      body: {
        success: true,
        message: 'Your account and all associated personal data have been permanently deleted.',
      },
    };
  } catch (err: any) {
    return {
      status: 500,
      body: { error: err?.message || 'Failed to delete user data.' },
    };
  }
}
