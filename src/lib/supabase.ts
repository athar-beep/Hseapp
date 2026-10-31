import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();

/**
 * Public client only. The anon key is designed for client use when RLS is
 * configured correctly. Never put a service-role key in VITE_* variables.
 */
export const supabase =
  supabaseUrl && supabaseAnonKey && !supabaseUrl.includes('your-project-id')
    ? createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
      })
    : null;

export const isCloudAuthConfigured = Boolean(supabase);
