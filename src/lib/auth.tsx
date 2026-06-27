import { createContext, useContext, useEffect, useState } from "react";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const HAS_SUPABASE = !!(SUPABASE_URL && SUPABASE_KEY);

type SupabaseUser = { id: string; email: string };

interface AuthCtx {
  user: SupabaseUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<string | null>;
  signUp: (email: string, password: string) => Promise<string | null>;
  signOut: () => Promise<void>;
}

const Ctx = createContext<AuthCtx | null>(null);

// ──────────────────────────────────────────────
// Supabase-backed auth (when env vars present)
// ──────────────────────────────────────────────
async function supabaseSignIn(email: string, password: string): Promise<{ user: SupabaseUser | null; error: string | null }> {
  const { createClient } = await import("@supabase/supabase-js");
  const sb = createClient(SUPABASE_URL, SUPABASE_KEY);
  const { data, error } = await sb.auth.signInWithPassword({ email, password });
  if (error) return { user: null, error: error.message };
  return { user: { id: data.user!.id, email: data.user!.email! }, error: null };
}

async function supabaseSignUp(email: string, password: string): Promise<{ error: string | null }> {
  const { createClient } = await import("@supabase/supabase-js");
  const sb = createClient(SUPABASE_URL, SUPABASE_KEY);
  const { error } = await sb.auth.signUp({ email, password });
  return { error: error?.message ?? null };
}

async function supabaseSignOut(): Promise<void> {
  const { createClient } = await import("@supabase/supabase-js");
  const sb = createClient(SUPABASE_URL, SUPABASE_KEY);
  await sb.auth.signOut();
}

async function supabaseGetSession(): Promise<SupabaseUser | null> {
  const { createClient } = await import("@supabase/supabase-js");
  const sb = createClient(SUPABASE_URL, SUPABASE_KEY);
  const { data } = await sb.auth.getSession();
  const u = data.session?.user;
  return u ? { id: u.id, email: u.email! } : null;
}

// ──────────────────────────────────────────────
// Local-storage fallback auth (no Supabase)
// ──────────────────────────────────────────────
const LOCAL_KEY = "forge-local-user";

function localSignIn(email: string, password: string): { user: SupabaseUser | null; error: string | null } {
  const stored = localStorage.getItem(LOCAL_KEY);
  if (!stored) return { user: null, error: "Aucun compte trouvé. Crée un compte d'abord." };
  const saved = JSON.parse(stored) as { email: string; password: string; id: string };
  if (saved.email !== email || saved.password !== password) {
    return { user: null, error: "Email ou mot de passe incorrect." };
  }
  return { user: { id: saved.id, email: saved.email }, error: null };
}

function localSignUp(email: string, password: string): { error: string | null } {
  const id = crypto.randomUUID();
  localStorage.setItem(LOCAL_KEY, JSON.stringify({ email, password, id }));
  return { error: null };
}

function localGetUser(): SupabaseUser | null {
  const stored = localStorage.getItem("forge-local-session");
  return stored ? JSON.parse(stored) : null;
}

function localSetSession(user: SupabaseUser | null) {
  if (user) localStorage.setItem("forge-local-session", JSON.stringify(user));
  else localStorage.removeItem("forge-local-session");
}

// ──────────────────────────────────────────────
// Provider
// ──────────────────────────────────────────────
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (HAS_SUPABASE) {
      supabaseGetSession().then((u) => { setUser(u); setLoading(false); });
    } else {
      setUser(localGetUser());
      setLoading(false);
    }
  }, []);

  const signIn = async (email: string, password: string) => {
    if (HAS_SUPABASE) {
      const { user: u, error } = await supabaseSignIn(email, password);
      if (u) setUser(u);
      return error;
    } else {
      const { user: u, error } = localSignIn(email, password);
      if (u) { localSetSession(u); setUser(u); }
      return error;
    }
  };

  const signUp = async (email: string, password: string) => {
    if (HAS_SUPABASE) {
      const { error } = await supabaseSignUp(email, password);
      return error;
    } else {
      const { error } = localSignUp(email, password);
      if (!error) {
        const { user: u } = localSignIn(email, password);
        if (u) { localSetSession(u); setUser(u); }
      }
      return error;
    }
  };

  const signOut = async () => {
    if (HAS_SUPABASE) await supabaseSignOut();
    else localSetSession(null);
    setUser(null);
  };

  return (
    <Ctx.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
}
