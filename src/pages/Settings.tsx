import { motion } from "framer-motion";
import { useStore } from "../store/useStore";
import PageHeader from "../components/PageHeader";
import { toUnit } from "../lib/utils";

function Row({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between border-b border-white/[0.05] py-4 last:border-0">
      {children}
    </div>
  );
}

export default function Settings() {
  const { profile, setUnit, updateProfile, setWaterGoal, sessions } = useStore();

  return (
    <>
      <PageHeader title="Réglages" subtitle="Profil & préférences" />

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="card grain p-6">
          <div className="mb-2 text-sm font-semibold text-mute-soft">PROFIL</div>
          <Row>
            <span className="text-mute">Nom</span>
            <input
              value={profile.name}
              onChange={(e) => updateProfile({ name: e.target.value })}
              className="w-40 rounded-xl bg-ink-750 px-3 py-2 text-right outline-none ring-1 ring-white/[0.06] focus:ring-accent/50"
            />
          </Row>
          <Row>
            <span className="text-mute">Taille (cm)</span>
            <input
              type="number"
              value={profile.height}
              onChange={(e) => updateProfile({ height: Number(e.target.value) })}
              className="num w-28 rounded-xl bg-ink-750 px-3 py-2 text-right outline-none ring-1 ring-white/[0.06] focus:ring-accent/50"
            />
          </Row>
          <Row>
            <span className="text-mute">Poids ({profile.unit})</span>
            <input
              type="number"
              step="0.1"
              value={Math.round(toUnit(profile.bodyWeight, profile.unit) * 10) / 10}
              onChange={(e) => {
                const kg =
                  profile.unit === "lbs"
                    ? Number(e.target.value) / 2.20462
                    : Number(e.target.value);
                updateProfile({ bodyWeight: Math.round(kg * 10) / 10 });
              }}
              className="num w-28 rounded-xl bg-ink-750 px-3 py-2 text-right outline-none ring-1 ring-white/[0.06] focus:ring-accent/50"
            />
          </Row>
        </div>

        <div className="card grain p-6">
          <div className="mb-2 text-sm font-semibold text-mute-soft">PRÉFÉRENCES</div>
          <Row>
            <span className="text-mute">Unité</span>
            <div className="flex rounded-pill border border-white/[0.07] bg-ink-850 p-1">
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
          <Row>
            <span className="text-mute">Objectif d'eau (ml)</span>
            <input
              type="number"
              step="50"
              value={profile.waterGoalMl}
              onChange={(e) => setWaterGoal(Number(e.target.value))}
              className="num w-28 rounded-xl bg-ink-750 px-3 py-2 text-right outline-none ring-1 ring-white/[0.06] focus:ring-accent/50"
            />
          </Row>
          <Row>
            <span className="text-mute">Séances enregistrées</span>
            <span className="num font-semibold">{sessions.length}</span>
          </Row>
        </div>

        <div className="card grain p-6 lg:col-span-2">
          <div className="mb-3 text-sm font-semibold text-mute-soft">DONNÉES</div>
          <button
            onClick={() => {
              if (confirm("Réinitialiser toutes les données ? Cette action est irréversible.")) {
                localStorage.removeItem("forge-fitness-v1");
                location.reload();
              }
            }}
            className="w-full rounded-2xl border border-red-500/20 bg-red-500/10 py-3 font-semibold text-red-400 transition-colors hover:bg-red-500/20"
          >
            Réinitialiser les données
          </button>
          <p className="mt-3 text-center text-xs text-mute-soft">
            Forge · Fitness OS — tes données restent sur cet appareil.
          </p>
        </div>
      </div>
    </>
  );
}
