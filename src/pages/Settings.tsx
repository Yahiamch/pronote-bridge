import { useState } from "react";
import { motion } from "framer-motion";
import { useStore } from "../store/useStore";
import { useAuth } from "../lib/auth";
import PageHeader from "../components/PageHeader";
import { toUnit } from "../lib/utils";
import { Apple, Heart, Link, AlertCircle, LogOut, ChevronRight } from "../components/Icons";

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between border-b border-white/[0.05] py-3.5 last:border-0">
      <span className="text-[15px] text-mute">{label}</span>
      {children}
    </div>
  );
}

interface IntegrationCardProps {
  icon: React.ReactNode;
  name: string;
  description: string;
  badge?: string;
  available?: boolean;
}

function IntegrationCard({ icon, name, description, badge, available = false }: IntegrationCardProps) {
  const [attempted, setAttempted] = useState(false);

  return (
    <motion.button
      type="button"
      onClick={() => !available && setAttempted(true)}
      whileTap={{ scale: 0.98 }}
      className="flex w-full items-center gap-4 rounded-2xl border border-white/[0.07] bg-white/[0.03] p-4 text-left transition-colors hover:bg-white/[0.05]"
    >
      <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-white/[0.08] text-white/80">
        {icon}
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="font-semibold">{name}</span>
          {badge && (
            <span className="rounded-full bg-white/[0.08] px-2 py-0.5 text-[11px] text-mute">
              {badge}
            </span>
          )}
        </div>
        <div className="mt-0.5 text-[13px] text-mute">{description}</div>
        {attempted && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mt-2 flex items-start gap-1.5 text-[12px] text-mute"
          >
            <AlertCircle size={13} className="mt-0.5 shrink-0" />
            <span>Nécessite l'app iOS native pour accéder aux données de santé.</span>
          </motion.div>
        )}
      </div>
      <ChevronRight size={16} className="shrink-0 text-mute-soft" />
    </motion.button>
  );
}

export default function Settings() {
  const { profile, setUnit, updateProfile, setWaterGoal, sessions } = useStore();
  const { user, signOut } = useAuth();

  return (
    <>
      <PageHeader title="Réglages" />

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
          <Row label={`Taille (cm)`}>
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

        {/* Integrations */}
        <div className="card p-6 lg:col-span-2">
          <div className="section-label">Intégrations</div>
          <div className="flex flex-col gap-3">
            <IntegrationCard
              icon={<Apple size={20} />}
              name="Apple Health"
              description="Synchronise tes données de santé et d'activité"
              badge="App iOS requise"
              available={false}
            />
            <IntegrationCard
              icon={<Heart size={20} />}
              name="Basic Fit"
              description="Importe tes entraînements en salle"
              badge="Bientôt disponible"
              available={false}
            />
            <IntegrationCard
              icon={<Link size={20} />}
              name="Import CSV"
              description="Importe tes données depuis une autre app"
              badge="Manuel"
              available={false}
            />
          </div>
          <p className="mt-4 text-center text-[12px] text-mute-soft">
            L'intégration Apple Health nécessite une app iOS native avec HealthKit.
            Basic Fit ne propose pas d'API publique à ce jour.
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
    </>
  );
}
