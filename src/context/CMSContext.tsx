import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient';

interface ContentKey {
  key: string;
  value: string;
}

interface CMSContextType {
  get: (key: string, fallback?: string) => string;
  updateContent: (key: string, value: string) => Promise<void>;
  loading: boolean;
  isAdmin: boolean;
  data: Record<string, string>;
}

const CMSContext = createContext<CMSContextType | undefined>(undefined);

export function CMSProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);

  const adminEmails = ['pakaraswalih@gmail.com'];
  const isAdmin = session?.user?.email ? adminEmails.includes(session.user.email) : false;

  useEffect(() => {
    let authSubscription: any;
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);

      const { data } = supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session);
      });
      authSubscription = data.subscription;
    };
    checkSession();

    // 2. Fetch all public content keys
    const fetchContent = async () => {
      try {
        const { data: rows, error } = await supabase
          .from('content_keys')
          .select('key, value');

        if (error) throw error;

        const map: Record<string, string> = {};
        (rows as ContentKey[]).forEach(({ key, value }) => {
          map[key] = value;
        });
        setData(map);
      } catch (err) {
        console.warn('[CMSProvider] Failed to fetch content:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchContent();

    const channel = supabase.channel('content_keys_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'content_keys' }, (payload) => {
        if (payload.new) {
           const newRecord = payload.new as any;
           if (newRecord.key && newRecord.value !== undefined) {
             setData(prev => ({ ...prev, [newRecord.key]: newRecord.value }));
           }
        }
      })
      .subscribe();

    return () => {
      if (authSubscription) {
        authSubscription.unsubscribe();
      }
      supabase.removeChannel(channel);
    };
  }, []);

  const get = (key: string, fallback = ''): string =>
    data[key] !== undefined ? data[key] : fallback;

  const updateContent = async (key: string, value: string) => {
    // Optimistic UI update
    setData(prev => ({ ...prev, [key]: value }));

    try {
      // Check if the key exists first
      const { data: existingData } = await supabase
        .from('content_keys')
        .select('id')
        .eq('key', key)
        .maybeSingle();

      let opError;
      if (existingData) {
        // Update existing row
        const { error } = await supabase
          .from('content_keys')
          .update({ value })
          .eq('id', existingData.id);
        opError = error;
      } else {
        // Insert new row
        const { error } = await supabase
          .from('content_keys')
          .insert({ key, value, type: 'html' });
        opError = error;
      }

      if (opError) throw opError;
    } catch (err) {
      console.error('Failed to update CMS content:', err);
      // Revert could be handled here if needed
    }
  };

  return (
    <CMSContext.Provider value={{ get, updateContent, loading, isAdmin, data }}>
      {children}
    </CMSContext.Provider>
  );
}

export function useCMS() {
  const context = useContext(CMSContext);
  if (context === undefined) {
    throw new Error('useCMS must be used within a CMSProvider');
  }
  return context;
}
