/**
 * usePublicContent
 * ----------------
 * Fetches ALL content_keys from Supabase (public RLS policy allows this).
 * Returns a simple `get(key, fallback)` helper so any component can read
 * CMS-managed text without knowing anything about the DB structure.
 *
 * Usage:
 *   const { get, loading } = usePublicContent();
 *   <h1>{get('hero.headline', 'Syllosphere')}</h1>
 */

import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

interface ContentKey {
  key: string;
  value: string;
}

interface UsePublicContentResult {
  /** Get a CMS value by key. Returns `fallback` if key missing or still loading. */
  get: (key: string, fallback?: string) => string;
  loading: boolean;
  /** Raw key→value map, useful for debugging */
  data: Record<string, string>;
}

export function usePublicContent(): UsePublicContentResult {
  const [data, setData] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const fetchContent = async () => {
      try {
        const { data: rows, error } = await supabase
          .from('content_keys')
          .select('key, value');

        if (error) throw error;
        if (cancelled) return;

        const map: Record<string, string> = {};
        (rows as ContentKey[]).forEach(({ key, value }) => {
          map[key] = value;
        });
        setData(map);
      } catch (err) {
        console.warn('[usePublicContent] Failed to fetch content:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchContent();
    return () => { cancelled = true; };
  }, []);

  const get = (key: string, fallback = ''): string =>
    data[key] !== undefined ? data[key] : fallback;

  return { get, loading, data };
}
