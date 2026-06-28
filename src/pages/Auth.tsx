import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../lib/auth";
import Logo from "../components/Logo";

type Mode = "login" | "register";

export default function Auth() {
  const { signIn, signUp, mode: authMode } = useAuth();
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const err = mode === "login" ? await signIn(email, password) : await signUp(email, password);
    setLoading(false);
    if (err) setError(err);
    // On success the auth state updates and this screen unmounts automatically.
  };

  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-black px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-sm"
      >
        <div className="mb-10 flex flex-col items-center gap-4">
          <motion.div
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 220, damping: 16 }}
            className="grid h-16 w-16 place-items-center rounded-3xl bg-white/[0.06] border border-white/[0.1]"
          >
            <Logo size={34} className="text-white" />
          </motion.div>
          <div className="text-center">
            <div className="text-3xl font-extrabold tracking-tight">Forge</div>
            <div className="mt-1 text-sm text-mute">Ton OS Fitness personnel</div>
          </div>
        </div>

        <div className="mb-6 flex rounded-2xl border border-white/[0.08] bg-white/[0.04] p-1">
          {(["login", "register"] as const).map((m) => (
            <button
              key={m}
              onClick={() => {
                setMode(m);
                setError(null);
              }}
              className={`relative flex-1 rounded-xl py-2.5 text-sm font-semibold transition-colors ${
                mode === m ? "text-black" : "text-mute"
              }`}
            >
              {mode === m && (
                <motion.span
                  layoutId="auth-tab"
                  className="absolute inset-0 rounded-xl bg-white"
                  transition={{ type: "spring", stiffness: 400, damping: 32 }}
                />
              )}
              <span className="relative z-10">{m === "login" ? "Connexion" : "Inscription"}</span>
            </button>
          ))}
        </div>

        <form onSubmit={submit} className="flex flex-col gap-3">
          <input
            type="email"
            placeholder="Email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-2xl border border-white/[0.08] bg-white/[0.05] px-4 py-4 text-base outline-none transition-colors placeholder:text-mute focus:border-white/20 focus:bg-white/[0.07]"
          />
          <input
            type="password"
            placeholder="Mot de passe"
            required
            minLength={6}
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-2xl border border-white/[0.08] bg-white/[0.05] px-4 py-4 text-base outline-none transition-colors placeholder:text-mute focus:border-white/20 focus:bg-white/[0.07]"
          />

          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-400"
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>

          <motion.button
            type="submit"
            disabled={loading}
            whileTap={{ scale: 0.98 }}
            className="mt-1 flex w-full items-center justify-center rounded-2xl bg-white py-4 font-bold text-black transition-opacity disabled:opacity-60"
          >
            {loading ? (
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-black/20 border-t-black" />
            ) : mode === "login" ? (
              "Se connecter"
            ) : (
              "Créer un compte"
            )}
          </motion.button>
        </form>

        <p className="mt-8 text-center text-xs text-mute">
          {authMode === "cloud"
            ? "Tes données sont synchronisées et sécurisées dans le cloud."
            : "Mode local — données stockées sur cet appareil."}
        </p>
      </motion.div>
    </div>
  );
}
