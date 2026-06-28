import { useMemo } from "react";
import { motion } from "framer-motion";
import { useStore } from "../store/useStore";
import PageHeader from "../components/PageHeader";
import CountUp from "../components/ui/CountUp";
import { Bars } from "../components/ui/Charts";
import { Droplet, Plus, Minus, Settings } from "../components/Icons";
import { waterToday, waterSeries } from "../lib/selectors";
import Modal from "../components/ui/Modal";
import { useState } from "react";

const QUICK = [
  { label: "Verre", ml: 250 },
  { label: "Bouteille", ml: 500 },
  { label: "Gourde", ml: 750 },
];

export default function Water() {
  const { water, profile, addWater, setWaterGoal } = useStore();
  const [goalModal, setGoalModal] = useState(false);
  const [goalInput, setGoalInput] = useState(String(profile.waterGoalMl));

  const today = waterToday(water);
  const pct = Math.min(1, today / profile.waterGoalMl);
  const series = useMemo(() => waterSeries(water, 7), [water]);
  const avg =
    series.reduce((t, d) => t + d.v, 0) / Math.max(1, series.filter((d) => d.v > 0).length);

  const C = 110;
  const R = 110;
  const circ = 2 * Math.PI * R;

  return (
    <>
      <PageHeader
        title="Hydratation"
        actions={
          <button onClick={() => setGoalModal(true)} className="pill-btn h-11 w-11">
            <Settings size={17} />
          </button>
        }
      />

      <div className="grid gap-3.5 lg:grid-cols-2">
        {/* Ring visual */}
        <div className="card flex flex-col items-center p-7">
          <div className="relative h-56 w-56">
            <svg className="absolute inset-0 h-full w-full -rotate-90">
              <circle cx={C} cy={C} r={R} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="9" />
              <motion.circle
                cx={C}
                cy={C}
                r={R}
                fill="none"
                stroke="white"
                strokeWidth="9"
                strokeLinecap="round"
                strokeDasharray={circ}
                initial={{ strokeDashoffset: circ }}
                animate={{ strokeDashoffset: circ * (1 - pct) }}
                transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <Droplet size={24} className="mb-1 text-white/50" />
              <div className="num text-4xl font-extrabold">
                <CountUp value={today / 1000} decimals={2} />
                <span className="text-lg text-mute"> L</span>
              </div>
              <div className="text-sm text-mute">
                / {(profile.waterGoalMl / 1000).toFixed(1)} L · {Math.round(pct * 100)}%
              </div>
            </div>
          </div>

          <div className="mt-6 grid w-full grid-cols-3 gap-2">
            {QUICK.map((q) => (
              <motion.button
                key={q.ml}
                whileTap={{ scale: 0.94 }}
                onClick={() => addWater(q.ml)}
                className="flex flex-col items-center gap-1.5 rounded-2xl border border-white/[0.07] bg-white/[0.04] py-3.5 transition-colors hover:bg-white/[0.08]"
              >
                <Droplet size={16} className="text-white/60" />
                <span className="text-sm font-semibold">+{q.ml}</span>
                <span className="text-[11px] text-mute">{q.label}</span>
              </motion.button>
            ))}
          </div>

          <div className="mt-2.5 flex w-full gap-2.5">
            <button
              onClick={() => addWater(-250)}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-2xl border border-white/[0.07] bg-white/[0.03] py-3 text-sm text-mute transition-colors hover:text-white"
            >
              <Minus size={15} /> −250 ml
            </button>
            <button
              onClick={() => addWater(100)}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-2xl border border-white/[0.07] bg-white/[0.03] py-3 text-sm text-mute transition-colors hover:text-white"
            >
              <Plus size={15} /> +100 ml
            </button>
          </div>
        </div>

        {/* Stats + chart */}
        <div className="flex flex-col gap-3.5">
          <div className="grid grid-cols-2 gap-3.5">
            <div className="card p-5">
              <div className="text-[13px] text-mute">Moyenne 7 j</div>
              <div className="num mt-2 text-3xl font-extrabold">
                <CountUp value={avg / 1000} decimals={2} />
                <span className="text-base text-mute"> L</span>
              </div>
            </div>
            <div className="card p-5">
              <div className="text-[13px] text-mute">Objectif</div>
              <div className="num mt-2 text-3xl font-extrabold">
                {(profile.waterGoalMl / 1000).toFixed(1)}
                <span className="text-base text-mute"> L</span>
              </div>
            </div>
          </div>

          <div className="card flex-1 p-5">
            <div className="mb-3 flex items-center justify-between">
              <div className="font-bold">7 derniers jours</div>
              <div className="chip">Litres</div>
            </div>
            {series.some((d) => d.v > 0) ? (
              <Bars data={series} color="#fff" height={200} unit=" L" />
            ) : (
              <div className="flex h-40 items-center justify-center text-sm text-mute">
                Aucune donnée
              </div>
            )}
          </div>
        </div>
      </div>

      <Modal open={goalModal} onClose={() => setGoalModal(false)} title="Objectif journalier">
        <div className="flex items-center justify-center gap-2 py-2">
          <input
            type="number"
            step="50"
            value={goalInput}
            onChange={(e) => setGoalInput(e.target.value)}
            className="num w-36 rounded-2xl bg-ink-700 px-4 py-4 text-center text-3xl font-bold outline-none ring-1 ring-white/10 focus:ring-white/25"
          />
          <span className="text-lg text-mute">ml</span>
        </div>
        <button
          onClick={() => {
            const v = Number(goalInput);
            if (v > 0) setWaterGoal(v);
            setGoalModal(false);
          }}
          className="mt-4 w-full rounded-2xl bg-white py-3.5 font-bold text-black transition-transform active:scale-[0.98]"
        >
          Enregistrer
        </button>
      </Modal>
    </>
  );
}
