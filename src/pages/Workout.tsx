import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useStore } from "../store/useStore";
import RingProgress from "../components/ui/RingProgress";
import { Check, Plus, X, Dumbbell, Flame, Clock } from "../components/Icons";
import { fmtDuration, fmtVolume, sessionVolume, toUnit, fromUnit } from "../lib/utils";

export default function Workout() {
  const nav = useNavigate();
  const {
    active, routines, profile,
    startWorkout, toggleSet, updateSet, addSet, finishWorkout, cancelWorkout,
  } = useStore();
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!active) return;
    const t = setInterval(() => setElapsed(Math.floor((Date.now() - active.startedAt) / 1000)), 1000);
    setElapsed(Math.floor((Date.now() - active.startedAt) / 1000));
    return () => clearInterval(t);
  }, [active]);

  if (!active) {
    return (
      <div>
        <h1 className="mb-6 text-3xl font-extrabold">Démarrer une séance</h1>
        <div className="grid gap-3 lg:grid-cols-2">
          {routines.filter((r) => r.exercises.length > 0).map((r, i) => (
            <motion.button
              key={r.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => startWorkout(r.id)}
              className="card flex items-center gap-4 p-5 text-left"
            >
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-white/[0.07] text-lg">
                💪
              </div>
              <div className="flex-1">
                <div className="text-[17px] font-bold">{r.name}</div>
                <div className="text-[13px] text-mute">{r.exercises.length} exercices · {r.schedule}</div>
              </div>
              <Plus size={18} className="text-mute" />
            </motion.button>
          ))}
        </div>
      </div>
    );
  }

  const totalSets = active.exercises.reduce((t, e) => t + e.sets.length, 0);
  const doneSets = active.exercises.reduce((t, e) => t + e.sets.filter((s) => s.done).length, 0);
  const progress = totalSets ? doneSets / totalSets : 0;
  const liveVol = sessionVolume(active.exercises);

  return (
    <div>
      {/* Sticky header */}
      <div className="sticky top-0 z-20 -mx-4 mb-5 border-b border-white/[0.06] bg-black/80 px-4 py-3 backdrop-blur-xl lg:-mx-10 lg:px-10">
        <div className="flex items-center gap-4">
          <button
            onClick={() => { if (confirm("Annuler la séance ?")) { cancelWorkout(); nav("/"); } }}
            className="pill-btn h-10 w-10 text-mute"
          >
            <X size={18} />
          </button>
          <div className="flex-1">
            <div className="text-[13px] text-mute">{active.name}</div>
            <div className="num text-2xl font-extrabold leading-none">{fmtDuration(elapsed)}</div>
          </div>
          <RingProgress value={progress} size={46} stroke={3.5} color="#fff">
            <span className="num text-xs font-bold">{Math.round(progress * 100)}</span>
          </RingProgress>
        </div>
      </div>

      {/* Live stats */}
      <div className="mb-5 grid grid-cols-3 gap-3">
        {[
          { icon: Dumbbell, label: "Volume", value: `${fmtVolume(liveVol, profile.unit)} ${profile.unit}` },
          { icon: Check, label: "Séries", value: `${doneSets}/${totalSets}` },
          { icon: Flame, label: "kcal", value: `${Math.round((elapsed / 60) * 7 + liveVol * 0.01)}` },
        ].map((s) => (
          <div key={s.label} className="card p-4">
            <s.icon size={16} className="text-white/60" />
            <div className="num mt-2 text-xl font-extrabold">{s.value}</div>
            <div className="text-[12px] text-mute">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Exercises */}
      <div className="flex flex-col gap-4">
        {active.exercises.length === 0 && (
          <div className="card grid place-items-center p-10 text-center text-mute">
            <Clock size={28} className="mx-auto mb-2 opacity-30" />
            <span>Séance libre — chronomètre en marche.</span>
          </div>
        )}
        {active.exercises.map((ex, ei) => (
          <motion.div
            key={ex.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: ei * 0.05 }}
            className="card p-5"
          >
            <div className="mb-3">
              <div className="text-[17px] font-bold">{ex.name}</div>
              <div className="text-[13px] text-mute">{ex.muscle}</div>
            </div>

            <div className="mb-2 grid grid-cols-[28px_1fr_1fr_44px] gap-2 px-1 text-xs text-mute-soft">
              <span>#</span><span>Reps</span><span>{profile.unit}</span><span />
            </div>

            <div className="flex flex-col gap-1.5">
              {ex.sets.map((set, si) => (
                <div
                  key={si}
                  className={`grid grid-cols-[28px_1fr_1fr_44px] items-center gap-2 rounded-2xl px-1 py-1.5 transition-colors ${
                    set.done ? "bg-white/[0.08]" : "bg-white/[0.02]"
                  }`}
                >
                  <span className="num text-center text-sm font-semibold text-mute">{si + 1}</span>
                  <input
                    type="number"
                    value={set.reps}
                    onChange={(e) => updateSet(ex.id, si, { reps: Number(e.target.value) })}
                    className="num rounded-xl bg-ink-700 py-2.5 text-center font-semibold outline-none ring-1 ring-white/[0.07] focus:ring-white/20"
                  />
                  <input
                    type="number"
                    step="0.5"
                    value={Math.round(toUnit(set.weight, profile.unit) * 10) / 10}
                    onChange={(e) => updateSet(ex.id, si, { weight: fromUnit(Number(e.target.value), profile.unit) })}
                    className="num rounded-xl bg-ink-700 py-2.5 text-center font-semibold outline-none ring-1 ring-white/[0.07] focus:ring-white/20"
                  />
                  <button
                    onClick={() => toggleSet(ex.id, si)}
                    className={`grid h-9 w-9 place-items-center justify-self-center rounded-xl transition-all ${
                      set.done ? "bg-white text-black" : "border border-white/[0.12] text-mute"
                    }`}
                  >
                    <Check size={15} />
                  </button>
                </div>
              ))}
            </div>

            <button
              onClick={() => addSet(ex.id)}
              className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-2xl border border-dashed border-white/[0.1] py-2.5 text-sm text-mute transition-colors hover:text-white"
            >
              <Plus size={15} /> Ajouter une série
            </button>
          </motion.div>
        ))}
      </div>

      <div className="sticky bottom-24 z-20 mt-6 lg:bottom-6">
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => { finishWorkout(); nav("/"); }}
          className="w-full rounded-pill bg-white py-4 text-[17px] font-bold text-black"
        >
          Terminer la séance
        </motion.button>
      </div>
    </div>
  );
}
