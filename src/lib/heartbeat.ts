import { supabase } from './supabaseClient';

// ── Heartbeat Service ──────────────────────────────────────────────────────
// Supabase free tier pauses after 7 days of inactivity.
// This sends a lightweight ping every 23 hours to keep the project alive.

const HEARTBEAT_INTERVAL_MS = 23 * 60 * 60 * 1000; // 23 hours
const HEARTBEAT_KEY = 'supabase_last_heartbeat';

async function ping(): Promise<void> {
  try {
    // A lightweight read query — just fetches 1 row from any public table
    await supabase.from('content_keys').select('key').limit(1);
    const now = new Date().toISOString();
    localStorage.setItem(HEARTBEAT_KEY, now);
    console.log(`[Heartbeat] Supabase pinged at ${now}`);
  } catch (err) {
    console.warn('[Heartbeat] Ping failed (project may be paused):', err);
  }
}

export function startHeartbeat(): () => void {
  // Check if we need to ping immediately (hasn't been pinged in 23h)
  const last = localStorage.getItem(HEARTBEAT_KEY);
  const now = Date.now();
  const shouldPingNow = !last || now - new Date(last).getTime() > HEARTBEAT_INTERVAL_MS;

  if (shouldPingNow) {
    ping(); // Immediate ping on app load
  }

  // Schedule recurring pings every 23 hours
  const interval = setInterval(ping, HEARTBEAT_INTERVAL_MS);

  // Return a cleanup function to stop it when the app unmounts
  return () => clearInterval(interval);
}
