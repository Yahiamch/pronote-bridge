import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { useStore } from "../store/useStore";
import { useAuth } from "../lib/auth";
import PageHeader from "../components/PageHeader";
import Modal from "../components/ui/Modal";
import { toUnit } from "../lib/utils";
import { parseHealthFile } from "../lib/importers";
import BasicFitCard from "../components/BasicFitCard";
import {
  Apple,
  Upload,
  LogOut,
  ChevronRight,
  Check,
  AlertCircle,
} from "../components/Icons";

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between border-b border-white/[0.05] py-3.5 last:border-0">
      <span className="text-[15px] text-mute">{label}</span>
      {children}
    </div>
  );
}

type Provider = "apple" | "csv";

const PROVIDERS: Record<
  Provider,
  { name: string; accept: string; how: string; note?: string }
> = {
  apple: {
    name: "Apple Health",
    accept: ".zip,.xml",
    how: "Sur iPhone : app Santé → ta photo de profil (en haut) → « Exporter toutes les données de santé ». Tu obtiens un fichier export.zip — importe-le ici.",
    note: "Importe tes entraînements (musculation, course, vélo…) et ton poids. Tout reste sur ton appareil.",
  },
  csv: {
    name: "Import CSV",
    accept: ".csv,.txt",
    how: "Importe un CSV depuis n'importe quelle app (Strong, Hevy, FitNotes…). Colonnes reconnues : date, nom, durée, volume, calories, poids.",
  },
};

export default function Settings() {
  const { profile, setUnit, updateProfile, setWaterGoal, sessions, importData } = useStore();
  const { user, signOut } = useAuth();

  const fileRef = useRef<HTMLInputElement>(null);
  const [provider, setProvider] = useState<Provider | null>(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; msg: string } | null>(null);

  const pick = () => {
    setResult(null);
    fileRef.current?.click();
  };

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setBusy(true);
    setResult(null);
    try {
      const data = await parseHealthFile(file);
      const added = importData({ sessions: data.sessions, weights: data.weights });
      if (added.sessions === 0 && added.weights === 0) {
        setResult({
          ok: false,
          msg: "Aucune nouvelle donnée trouvée (déjà importée ou format non reconnu).",
        });
      } else {
        setResult({
          ok: true,
          msg: `${added.sessions} séance(s) et ${added.weights} mesure(s) de poids importées 🎉`,
        });
      }
    } catch (err: any) {
      setResult({ ok: false, msg: err?.message || "Échec de l'import du fichier." });
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <PageHeader title="Réglages" />

      <input
        ref={fileRef}
        type="file"
        accept={provider ? PROVIDERS[provider].accept : ".zip,.xml,.csv"}
        className="hidden"
        onChange={onFile}
      />

      <div className="grid gap-3.5 lg:grid-cols-2">
        {/* Profil */}
        <div className="card p-6">
          <div className="section-label">Profil</div>
          {user?.email && (
            <div className="mb-3 rounded-xl bg-white/[0.04] px-3 py-2.5">
              <div className="text-[13px] text-mute">Connecté en tant que</div>
              <div className="mt-0.5 text-sm font-medium">{user.email}</div>
            </div>
          )}
          <Row label="Nom">
            <input
              value={profile.name}
              onChange={(e) => updateProfile({ name: e.target.value })}
              placeholder="Ton prénom"
              className="w-40 rounded-xl bg-ink-700 px-3 py-2 text-right text-sm outline-none ring-1 ring-white/[0.07] focus:ring-white/20"
            />
          </Row>
          <Row label="Taille (cm)">
            <input
              type="number"
              value={profile.height}
              onChange={(e) => updateProfile({ height: Number(e.target.value) })}
              className="num w-24 rounded-xl bg-ink-700 px-3 py-2 text-right text-sm outline-none ring-1 ring-white/[0.07] focus:ring-white/20"
            />
          </Row>
          <Row label={`Poids (${profile.unit})`}>
            <input
              type="number"
              step="0.1"
              value={Math.round(toUnit(profile.bodyWeight, profile.unit) * 10) / 10}
              onChange={(e) => {
                const kg = profile.unit === "lbs" ? Number(e.target.value) / 2.20462 : Number(e.target.value);
                updateProfile({ bodyWeight: Math.round(kg * 10) / 10 });
              }}
              className="num w-24 rounded-xl bg-ink-700 px-3 py-2 text-right text-sm outline-none ring-1 ring-white/[0.07] focus:ring-white/20"
            />
          </Row>
        </div>

        {/* Préférences */}
        <div className="card p-6">
          <div className="section-label">Préférences</div>
          <Row label="Unité">
            <div className="flex rounded-pill border border-white/[0.07] bg-ink-800 p-1">
              {(["kg", "lbs"] as const).map((u) => (
                <button
                  key={u}
                  onClick={() => setUnit(u)}
                  className={`relative rounded-pill px-4 py-1.5 text-sm font-medium transition-colors ${
                    profile.unit === u ? "text-black" : "text-mute"
                  }`}
                >
                  {profile.unit === u && (
                    <motion.span
                      layoutId="unit-pill"
                      className="absolute inset-0 rounded-pill bg-white"
                      transition={{ type: "spring", stiffness: 400, damping: 32 }}
                    />
                  )}
                  <span className="relative z-10">{u}</span>
                </button>
              ))}
            </div>
          </Row>
          <Row label="Objectif d'eau (ml)">
            <input
              type="number"
              step="50"
              value={profile.waterGoalMl}
              onChange={(e) => setWaterGoal(Number(e.target.value))}
              className="num w-24 rounded-xl bg-ink-700 px-3 py-2 text-right text-sm outline-none ring-1 ring-white/[0.07] focus:ring-white/20"
            />
          </Row>
          <Row label="Séances enregistrées">
            <span className="num font-semibold">{sessions.length}</span>
          </Row>
        </div>

        {/* Intégrations */}
        <div className="card p-6 lg:col-span-2">
          <div className="section-label">Connecter mes données</div>
          <div className="flex flex-col gap-3">
            <BasicFitCard />
            <IntegrationRow
              icon={<Apple size={20} />}
              name="Apple Health"
              description="Importe tes entraînements et ton poids depuis l'app Santé"
              onClick={() => { setProvider("apple"); setResult(null); }}
            />
            <IntegrationRow
              icon={<Upload size={20} />}
              name="Import CSV"
              description="Strong, Hevy, FitNotes ou ton propre tableur"
              onClick={() => { setProvider("csv"); setResult(null); }}
            />
          </div>
          <p className="mt-4 text-[12px] leading-relaxed text-mute-soft">
            Tout l'import se fait localement dans ton navigateur — aucune donnée n'est envoyée à un serveur.
          </p>
        </div>

        {/* Données & compte */}
        <div className="card p-6 lg:col-span-2">
          <div className="section-label">Données & compte</div>
          <div className="flex flex-col gap-2.5">
            <button
              onClick={() => {
                if (confirm("Réinitialiser toutes les données ? Cette action est irréversible.")) {
                  localStorage.removeItem("forge-fitness-v1");
                  location.reload();
                }
              }}
              className="w-full rounded-2xl border border-red-500/20 bg-red-500/[0.08] py-3.5 text-sm font-semibold text-red-400 transition-colors hover:bg-red-500/15"
            >
              Réinitialiser les données
            </button>
            <button
              onClick={() => signOut()}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/[0.07] bg-white/[0.04] py-3.5 text-sm font-semibold text-mute transition-colors hover:text-white"
            >
              <LogOut size={16} />
              Se déconnecter
            </button>
          </div>
        </div>
      </div>

      {/* Import modal */}
      <Modal
        open={provider !== null}
        onClose={() => { if (!busy) { setProvider(null); setResult(null); } }}
        title={provider ? PROVIDERS[provider].name : ""}
      >
        {provider && (
          <div className="flex flex-col gap-4">
            <p className="text-[13px] leading-relaxed text-mute">{PROVIDERS[provider].how}</p>
            {PROVIDERS[provider].note && (
              <div className="rounded-xl bg-white/[0.04] px-3.5 py-3 text-[12px] leading-relaxed text-mute-soft">
                {PROVIDERS[provider].note}
              </div>
            )}

            {result && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex items-start gap-2 rounded-xl px-3.5 py-3 text-[13px] ${
                  result.ok ? "bg-white/[0.07] text-white" : "bg-red-500/10 text-red-400"
                }`}
              >
                {result.ok ? (
                  <Check size={15} className="mt-0.5 shrink-0" />
                ) : (
                  <AlertCircle size={15} className="mt-0.5 shrink-0" />
                )}
                <span>{result.msg}</span>
              </motion.div>
            )}

            <button
              onClick={pick}
              disabled={busy}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-white py-3.5 font-bold text-black transition-transform active:scale-[0.98] disabled:opacity-60"
            >
              {busy ? (
                "Analyse en cours…"
              ) : (
                <>
                  <Upload size={17} /> Choisir un fichier
                </>
              )}
            </button>
          </div>
        )}
      </Modal>
    </>
  );
}

function IntegrationRow({
  icon,
  name,
  description,
  onClick,
}: {
  icon: React.ReactNode;
  name: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.98 }}
      className="flex w-full items-center gap-4 rounded-2xl border border-white/[0.07] bg-white/[0.03] p-4 text-left transition-colors hover:bg-white/[0.05]"
    >
      <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-white/[0.08] text-white/80">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <div className="font-semibold">{name}</div>
        <div className="mt-0.5 text-[13px] text-mute">{description}</div>
      </div>
      <ChevronRight size={16} className="shrink-0 text-mute-soft" />
    </motion.button>
  );
}
