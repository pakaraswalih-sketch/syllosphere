import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const PROTECTED_ADMIN_EMAILS = new Set([
  'pakaraswalih@gmail.com',
  'admin@syllosphere.com',
]);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

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

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const authHeader = req.headers.get('Authorization') ?? '';

    if (!supabaseUrl || !serviceRoleKey) {
      return new Response(JSON.stringify({ error: 'Server configuration error.' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!authHeader.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const token = authHeader.slice('Bearer '.length).trim();
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid or expired session.' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const email = (user.email ?? '').trim().toLowerCase();
    const appRole = String(user.app_metadata?.role ?? '').toLowerCase();
    const userRole = String(user.user_metadata?.role ?? '').toLowerCase();

    if (PROTECTED_ADMIN_EMAILS.has(email) || appRole === 'admin' || userRole === 'admin') {
      return new Response(JSON.stringify({ error: 'Admin accounts are protected and cannot be deleted.' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const userId = user.id;

    // Storage cleanup
    try {
      const { data: folderFiles } = await supabaseAdmin.storage.from('avatars').list(userId, { limit: 100 });
      if (folderFiles && folderFiles.length > 0) {
        await supabaseAdmin.storage.from('avatars').remove(folderFiles.map((f) => `${userId}/${f.name}`));
      }
      const { data: rootFiles } = await supabaseAdmin.storage.from('avatars').list('', { limit: 100, search: userId });
      if (rootFiles && rootFiles.length > 0) {
        const rootMatches = rootFiles.filter((f) => f.name.startsWith(userId)).map((f) => f.name);
        if (rootMatches.length > 0) {
          await supabaseAdmin.storage.from('avatars').remove(rootMatches);
        }
      }
    } catch (_) {}

    const safeDelete = async (table: string, column = 'user_id') => {
      const { error } = await supabaseAdmin.from(table).delete().eq(column, userId);
      if (error && !isMissingRelationError(error)) {
        throw new Error(`Failed cleaning ${table}: ${error.message}`);
      }
    };

    const { data: threads, error: threadsErr } = await supabaseAdmin
      .from('consult_threads')
      .select('id')
      .eq('user_id', userId);
    if (threadsErr && !isMissingRelationError(threadsErr)) {
      throw new Error(threadsErr.message);
    }
    if (threads && threads.length > 0) {
      const { error: msgErr } = await supabaseAdmin
        .from('consult_messages')
        .delete()
        .in('thread_id', threads.map((t) => t.id));
      if (msgErr && !isMissingRelationError(msgErr)) {
        throw new Error(msgErr.message);
      }
    }

    await safeDelete('consult_threads');
    await safeDelete('practice_answers');
    await safeDelete('practice_sessions');
    await safeDelete('bookmarks');
    await safeDelete('certificates');
    await safeDelete('leaderboard');
    await safeDelete('activity_logs');
    await safeDelete('profiles', 'id');
    await safeDelete('profiles', 'user_id');
    await safeDelete('user_progress');

    const { error: deleteErr } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (deleteErr) {
      return new Response(JSON.stringify({ error: deleteErr.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Account permanently deleted.' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err?.message ?? 'Account deletion failed.' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
