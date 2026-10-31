import { createClient, type SupabaseClient } from '@supabase/supabase-js';

function cleanEnvValue(value: string | undefined): string {
  if (!value) return '';
  let v = value.trim();
  // Config values sometimes arrive wrapped in literal quote characters (for
  // example when a quoted .env line is copied into CI variables). Strip one
  // pair of wrapping quotes so a valid URL doesn't silently become invalid.
  if (
    v.length >= 2 &&
    ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'")))
  ) {
    v = v.slice(1, -1).trim();
  }
  return v;
}

const supabaseUrl = cleanEnvValue(import.meta.env.VITE_SUPABASE_URL);
const supabaseAnonKey = cleanEnvValue(import.meta.env.VITE_SUPABASE_ANON_KEY);

/**
 * Public client only. The anon key is designed for client use when RLS is
 * configured correctly. Never put a service-role key in VITE_* variables.
 */
function createPublicClient(): SupabaseClient | null {
  if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('your-project-id')) {
    return null;
  }
  try {
    return createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  } catch {
    // A malformed URL/key must never take the whole app down with a blank
    // screen — degrade to honest local demo mode instead.
    return null;
  }
}

export const supabase = createPublicClient();

export const isCloudAuthConfigured = Boolean(supabase);
