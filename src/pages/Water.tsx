import { useMemo } from "react";
import { motion } from "framer-motion";
import { useStore } from "../store/useStore";
import PageHeader from "../components/PageHeader";
import CountUp from "../components/ui/CountUp";
import { Bars } from "../components/ui/Charts";
import { Droplet, Plus, Minus, Settings } from "../components/Icons";
import { waterToday, waterSeries } from "../lib/selectors";

const QUICK = [
  { label: "Verre", ml: 250 },
  { label: "Bouteille", ml: 500 },
  { label: "Gourde", ml: 750 },
];

export default function Water() {
  const { water, profile, addWater, setWaterGoal } = useStore();
  const today = waterToday(water);
  const pct = Math.min(1, today / profile.waterGoalMl);
  const series = useMemo(() => waterSeries(water, 7), [water]);
  const avg =
    series.reduce((t, d) => t + d.v, 0) / Math.max(1, series.filter((d) => d.v > 0).length);

  return (
    <>
      <PageHeader
        title="Hydratation"
        subtitle="Aujourd'hui"
        actions={
          <button
            onClick={() => {
              const v = prompt(
                "Objectif quotidien (ml)",
                String(profile.waterGoalMl)
              );
              if (v && Number(v) > 0) setWaterGoal(Number(v));
            }}
            className="pill-btn h-11 w-11"
          >
            <Settings size={18} />
          </button>
        }
      />

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Big fill visual */}
        <div className="card grain relative flex flex-col items-center overflow-hidden p-7">
          <div className="relative h-60 w-60">
            {/* glass ring */}
            <svg className="absolute inset-0 h-full w-full -rotate-90">
              <circle cx="120" cy="120" r="110" fill="none" stroke="rgba(57,182,255,0.12)" strokeWidth="10" />
              <motion.circle
                cx="120"
                cy="120"
                r="110"
                fill="none"
                stroke="#39b6ff"
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 110}
                initial={{ strokeDashoffset: 2 * Math.PI * 110 }}
                animate={{ strokeDashoffset: 2 * Math.PI * 110 * (1 - pct) }}
                transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                style={{ filter: "drop-shadow(0 0 10px rgba(57,182,255,0.6))" }}
              />
            </svg>
            {/* animated liquid fill */}
            <div className="absolute inset-[18px] overflow-hidden rounded-full bg-ink-900">
              <motion.div
                className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-accent-water/80 to-accent-water/30"
                initial={{ height: 0 }}
                animate={{ height: `${pct * 100}%` }}
                transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="absolute -top-3 left-0 h-6 w-[200%] animate-[shimmer_3s_linear_infinite] rounded-[50%] bg-accent-water/40 blur-[2px]" />
              </motion.div>
              <div className="absolute inset-0 grid place-items-center">
                <div className="text-center">
                  <Droplet size={26} className="mx-auto mb-1 text-accent-water" />
                  <div className="num text-4xl font-extrabold">
                    <CountUp value={today / 1000} decimals={2} />
                    <span className="text-lg text-mute"> L</span>
                  </div>
                  <div className="text-sm text-mute">
                    sur {(profile.waterGoalMl / 1000).toFixed(1)} L · {Math.round(pct * 100)}%
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-7 grid w-full grid-cols-3 gap-2.5">
            {QUICK.map((q) => (
              <motion.button
                key={q.ml}
                whileTap={{ scale: 0.94 }}
                onClick={() => addWater(q.ml)}
                className="flex flex-col items-center gap-1 rounded-2xl border border-white/[0.06] bg-white/[0.03] py-3 transition-colors hover:bg-accent-water/10"
              >
                <Droplet size={18} className="text-accent-water" />
                <span className="text-sm font-semibold">+{q.ml}</span>
                <span className="text-[11px] text-mute-soft">{q.label}</span>
              </motion.button>
            ))}
          </div>
          <div className="mt-2.5 flex w-full gap-2.5">
            <button
              onClick={() => addWater(-250)}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-2xl border border-white/[0.06] bg-white/[0.02] py-2.5 text-sm text-mute transition-colors hover:text-white"
            >
              <Minus size={16} /> Retirer
            </button>
            <button
              onClick={() => addWater(100)}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-2xl border border-white/[0.06] bg-white/[0.02] py-2.5 text-sm text-mute transition-colors hover:text-white"
            >
              <Plus size={16} /> 100 ml
            </button>
          </div>
        </div>

        {/* Stats + weekly chart */}
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="card grain p-5">
              <div className="text-sm text-mute">Moyenne 7 j</div>
              <div className="num mt-2 text-3xl font-extrabold">
                <CountUp value={avg} decimals={2} /> <span className="text-base text-mute">L</span>
              </div>
            </div>
            <div className="card grain p-5">
              <div className="text-sm text-mute">Objectif</div>
              <div className="num mt-2 text-3xl font-extrabold">
                {(profile.waterGoalMl / 1000).toFixed(1)}{" "}
                <span className="text-base text-mute">L</span>
              </div>
            </div>
          </div>

          <div className="card grain flex-1 p-5">
            <div className="mb-1 flex items-center justify-between">
              <div className="font-bold">7 derniers jours</div>
              <div className="chip">Litres</div>
            </div>
            <Bars data={series} color="#39b6ff" height={220} unit=" L" />
          </div>
        </div>
      </div>
    </>
  );
}
