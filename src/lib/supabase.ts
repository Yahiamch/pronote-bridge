// Supabase client is lazy-loaded in auth.tsx to avoid crashing when env vars are absent.
// This file just exports the env var check for other modules if needed.
export const SUPABASE_CONFIGURED = !!(
  import.meta.env.VITE_SUPABASE_URL &&
  import.meta.env.VITE_SUPABASE_ANON_KEY
);
