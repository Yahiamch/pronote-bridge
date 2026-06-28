import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Modal from "./ui/Modal";
import { Activity, Check, AlertCircle, Link as LinkIcon } from "./Icons";
import { bfStatus, bfConnect, bfSync, bfDisconnect, type BfStatus } from "../lib/integrations";
import { useAuth } from "../lib/auth";
import { pullCloud } from "../lib/sync";
import { relativeTime } from "../lib/utils";

export default function BasicFitCard() {
  const { user, mode } = useAuth();
  const [status, setStatus] = useState<BfStatus | null>(null);
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const cloud = mode === "cloud";

  const refresh = () => {
    if (!cloud) return;
    bfStatus().then(setStatus).catch(() => setStatus({ connected: false }));
  };
  useEffect(refresh, [cloud]);

  const connect = async () => {
    setBusy(true);
    setMsg(null);
    try {
      const r = await bfConnect(email, password);
      if (r?.warning) {
        setMsg({ ok: false, text: `Connecté, mais la récupération a échoué : ${r.warning}` });
      } else {
        setMsg({ ok: true, text: `${r?.imported ?? 0} donnée(s) importée(s).` });
        if (user) await pullCloud(user.id);
      }
      setPassword("");
      refresh();
    } catch (e: any) {
      setMsg({ ok: false, text: e?.message || "Échec de la connexion." });
    } finally {
      setBusy(false);
    }
  };

  const sync = async () => {
    setBusy(true);
    setMsg(null);
    try {
      const r = await bfSync();
      setMsg({ ok: true, text: `${r?.imported ?? 0} donnée(s) synchronisée(s).` });
      if (user) await pullCloud(user.id);
      refresh();
    } catch (e: any) {
      setMsg({ ok: false, text: e?.message || "Échec de la synchro." });
    } finally {
      setBusy(false);
    }
  };

  const disconnect = async () => {
    setBusy(true);
    try {
      await bfDisconnect();
      setStatus({ connected: false });
      setMsg(null);
    } finally {
      setBusy(false);
    }
  };

  const connected = status?.connected;

  return (
    <>
      <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-4">
        <div className="flex items-center gap-4">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-white/[0.08] text-white/80">
            <Activity size={20} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold">Basic-Fit</span>
              {connected && (
                <span className="rounded-full bg-white/[0.1] px-2 py-0.5 text-[11px] text-white/80">
                  Connecté
                </span>
              )}
            </div>
            <div className="mt-0.5 truncate text-[13px] text-mute">
              {connected
                ? status?.last_sync
                  ? `Dernière synchro ${relativeTime(status.last_sync)}`
                  : "En attente de synchro"
                : "Connexion auto (expérimentale) · sinon import manuel"}
            </div>
          </div>
          {!connected ? (
            <button
              onClick={() => {
                setMsg(null);
                setOpen(true);
              }}
              disabled={!cloud}
              className="shrink-0 rounded-pill bg-white px-4 py-2 text-sm font-bold text-black transition-transform active:scale-95 disabled:opacity-40"
            >
              Connecter
            </button>
          ) : (
            <button
              onClick={sync}
              disabled={busy}
              className="shrink-0 rounded-pill border border-white/[0.12] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/[0.05] disabled:opacity-50"
            >
              {busy ? "…" : "Synchro"}
            </button>
          )}
        </div>

        {!cloud && (
          <p className="mt-3 text-[12px] text-mute-soft">
            Connecte-toi à ton compte Forge pour activer la synchronisation Basic-Fit.
          </p>
        )}

        {connected && status?.last_error && (
          <div className="mt-3 flex items-start gap-2 rounded-xl bg-red-500/10 px-3 py-2.5 text-[12px] text-red-400">
            <AlertCircle size={13} className="mt-0.5 shrink-0" />
            <span>{status.last_error}</span>
          </div>
        )}

        {connected && (
          <button onClick={disconnect} disabled={busy} className="mt-3 text-[12px] text-mute underline">
            Déconnecter Basic-Fit
          </button>
        )}
      </div>

      <Modal open={open} onClose={() => !busy && setOpen(false)} title="Connecter Basic-Fit">
        <div className="flex flex-col gap-3">
          <p className="text-[13px] leading-relaxed text-mute">
            Saisis les identifiants de ton espace membre Basic-Fit. Ils sont chiffrés (AES-GCM) et
            stockés de façon sécurisée pour tenter une synchro quotidienne de tes visites.
          </p>
          <div className="rounded-xl bg-white/[0.04] px-3.5 py-3 text-[12px] leading-relaxed text-mute-soft">
            ⚠️ Basic-Fit protège son espace membre par un pare-feu anti-robots (Akamai) qui bloque
            les serveurs. La connexion automatique peut donc échouer. Dans ce cas, utilise l'import
            de fichier (Apple Health / CSV) ci-dessous — c'est la méthode la plus fiable.
          </div>
          <input
            type="email"
            placeholder="Email Basic-Fit"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-2xl bg-ink-700 px-4 py-3.5 text-base outline-none ring-1 ring-white/10 focus:ring-white/25"
          />
          <input
            type="password"
            placeholder="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-2xl bg-ink-700 px-4 py-3.5 text-base outline-none ring-1 ring-white/10 focus:ring-white/25"
          />

          {msg && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex items-start gap-2 rounded-xl px-3.5 py-3 text-[13px] ${
                msg.ok ? "bg-white/[0.07] text-white" : "bg-red-500/10 text-red-400"
              }`}
            >
              {msg.ok ? (
                <Check size={15} className="mt-0.5 shrink-0" />
              ) : (
                <AlertCircle size={15} className="mt-0.5 shrink-0" />
              )}
              <span>{msg.text}</span>
            </motion.div>
          )}

          <button
            onClick={connect}
            disabled={busy || !email || !password}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-white py-3.5 font-bold text-black transition-transform active:scale-[0.98] disabled:opacity-50"
          >
            {busy ? "Connexion…" : <><LinkIcon size={17} /> Connecter & synchroniser</>}
          </button>
          <p className="text-center text-[11px] text-mute-soft">
            Basic-Fit ne fournit pas d'API officielle — connexion non affiliée, à usage personnel.
          </p>
        </div>
      </Modal>
    </>
  );
}
