import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const SUPABASE_CONFIGURED = !!(url && key);
export const SUPABASE_URL = url;
export const SUPABASE_ANON_KEY = key;

// Single shared client (null when env vars are absent → local fallback mode).
export const supabase: SupabaseClient | null = SUPABASE_CONFIGURED
  ? createClient(url, key, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
    })
  : null;
