/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

// Function to create a dummy chainable object to mock Supabase database operations
const createMockQueryBuilder = () => {
  const builder: any = {
    select: () => builder,
    insert: () => builder,
    update: () => builder,
    delete: () => builder,
    upsert: () => builder,
    eq: () => builder,
    order: () => builder,
    limit: () => builder,
    single: async () => ({ data: null, error: null }),
    maybeSingle: async () => ({ data: null, error: null }),
    then: (resolve: any) => resolve({ data: null, error: null })
  };
  return builder;
};

// Mock Supabase Client if credentials are not provided
const createMockSupabase = () => {
  console.warn(
    '[Supabase] Warning: VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY is missing. ' +
    'The app will run in local/offline fallback mode.'
  );

  let currentSession: any = null;
  const listeners = new Set<(event: string, session: any) => void>();

  return {
    auth: {
      getSession: async () => ({ data: { session: currentSession }, error: null }),
      getUser: async () => ({ data: { user: currentSession?.user || null }, error: null }),
      signUp: async ({ email }: { email: string }) => {
        const user = { id: 'mock-user-id', email };
        currentSession = { user, access_token: 'mock-token' };
        listeners.forEach(cb => cb('SIGNED_IN', currentSession));
        return { data: { user, session: currentSession }, error: null };
      },
      signInWithPassword: async ({ email }: { email: string }) => {
        const user = { id: 'mock-user-id', email };
        currentSession = { user, access_token: 'mock-token' };
        listeners.forEach(cb => cb('SIGNED_IN', currentSession));
        return { data: { user, session: currentSession }, error: null };
      },
      signOut: async () => {
        currentSession = null;
        listeners.forEach(cb => cb('SIGNED_OUT', null));
        return { error: null };
      },
      onAuthStateChange: (callback: (event: string, session: any) => void) => {
        listeners.add(callback);
        // Invoke immediately with current state
        callback('INITIAL_SESSION', currentSession);
        return {
          data: {
            subscription: {
              unsubscribe: () => {
                listeners.delete(callback);
              }
            }
          }
        };
      },
      resend: async () => ({ error: null }),
      resetPasswordForEmail: async () => ({ data: {}, error: null }),
      updateUser: async () => ({ data: { user: null }, error: null }),
      verifyOtp: async () => ({ data: { user: null, session: null }, error: null }),
      signInWithOAuth: async () => ({ data: { provider: '', url: '' }, error: null })
    },
    from: () => createMockQueryBuilder(),
    channel: () => ({
      on: () => ({
        subscribe: () => ({})
      })
    }),
    removeChannel: () => {}
  } as any;
};

export const supabase = (supabaseUrl && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createMockSupabase();

