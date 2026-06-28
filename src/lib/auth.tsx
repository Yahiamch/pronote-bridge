import { createContext, useContext, useEffect, useState } from "react";
import {
  supabase,
  SUPABASE_CONFIGURED,
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
} from "./supabase";

export type AppUser = { id: string; email: string };

interface AuthCtx {
  user: AppUser | null;
  loading: boolean;
  mode: "cloud" | "local";
  signIn: (email: string, password: string) => Promise<string | null>;
  signUp: (email: string, password: string) => Promise<string | null>;
  signOut: () => Promise<void>;
}

const Ctx = createContext<AuthCtx | null>(null);

// ── Local fallback (no Supabase env) ───────────────────────────
const LOCAL_KEY = "forge-local-user";
const SESSION_KEY = "forge-local-session";

function localSignIn(email: string, password: string) {
  const stored = localStorage.getItem(LOCAL_KEY);
  if (!stored) return { user: null, error: "Aucun compte trouvé. Crée un compte d'abord." };
  const saved = JSON.parse(stored) as { email: string; password: string; id: string };
  if (saved.email !== email || saved.password !== password)
    return { user: null, error: "Email ou mot de passe incorrect." };
  return { user: { id: saved.id, email: saved.email } as AppUser, error: null };
}
function localSignUp(email: string, password: string) {
  const id = crypto.randomUUID();
  localStorage.setItem(LOCAL_KEY, JSON.stringify({ email, password, id }));
  return { user: { id, email } as AppUser, error: null };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const mode: "cloud" | "local" = SUPABASE_CONFIGURED ? "cloud" : "local";

  useEffect(() => {
    if (supabase) {
      supabase.auth.getSession().then(({ data }) => {
        const u = data.session?.user;
        setUser(u ? { id: u.id, email: u.email! } : null);
        setLoading(false);
      });
      const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
        const u = session?.user;
        setUser(u ? { id: u.id, email: u.email! } : null);
      });
      return () => sub.subscription.unsubscribe();
    }
    const s = localStorage.getItem(SESSION_KEY);
    setUser(s ? JSON.parse(s) : null);
    setLoading(false);
  }, []);

  const signIn = async (email: string, password: string) => {
    if (supabase) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      return error ? translate(error.message) : null;
    }
    const { user: u, error } = localSignIn(email, password);
    if (u) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(u));
      setUser(u);
    }
    return error;
  };

  const signUp = async (email: string, password: string) => {
    if (supabase) {
      // Instant, confirmed signup via edge function (no email verification step).
      try {
        const res = await fetch(`${SUPABASE_URL}/functions/v1/auth-signup`, {
          method: "POST",
          headers: {
            "content-type": "application/json",
            apikey: SUPABASE_ANON_KEY,
            Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({ email, password }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) return translate(data?.error || "Inscription impossible.");
      } catch {
        // Fallback to standard signup if the function is unreachable
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) return translate(error.message);
      }
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      return error ? translate(error.message) : null;
    }
    const { user: u } = localSignUp(email, password);
    localStorage.setItem(SESSION_KEY, JSON.stringify(u));
    setUser(u);
    return null;
  };

  const signOut = async () => {
    if (supabase) await supabase.auth.signOut();
    else localStorage.removeItem(SESSION_KEY);
    setUser(null);
  };

  return (
    <Ctx.Provider value={{ user, loading, mode, signIn, signUp, signOut }}>
      {children}
    </Ctx.Provider>
  );
}

function translate(msg: string): string {
  if (/invalid login credentials/i.test(msg)) return "Email ou mot de passe incorrect.";
  if (/already|exist/i.test(msg)) return "Un compte existe déjà avec cet email.";
  if (/rate limit/i.test(msg)) return "Trop de tentatives, réessaie dans un instant.";
  return msg;
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
}
