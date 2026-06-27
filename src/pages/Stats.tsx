import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useStore } from "../store/useStore";
import PageHeader from "../components/PageHeader";
import CountUp from "../components/ui/CountUp";
import { AreaFull, Bars, LineMini } from "../components/ui/Charts";
import { TrendUp, Flame, Clock, Dumbbell } from "../components/Icons";
import {
  weeklyVolume,
  sessionsByWeekday,
  weightSeries,
  caloriesSeries,
  volumeLastDays,
  sessionsLastDays,
} from "../lib/selectors";
import { fmtVolume, toUnit } from "../lib/utils";

const RANGES = [
  { label: "4 sem", weeks: 4 },
  { label: "8 sem", weeks: 8 },
  { label: "12 sem", weeks: 12 },
];

function Kpi({
  icon: Icon,
  label,
  value,
  display,
  suffix,
  color,
  delay,
}: {
  icon: any;
  label: string;
  value: number;
  display?: string;
  suffix?: string;
  color: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="card grain p-5"
    >
      <div
        className="mb-3 grid h-10 w-10 place-items-center rounded-xl"
        style={{ background: `${color}22`, color }}
      >
        <Icon size={19} />
      </div>
      <div className="num text-3xl font-extrabold leading-none">
        {display ?? (
          <>
            <CountUp value={value} />
            {suffix && <span className="text-base font-medium text-mute"> {suffix}</span>}
          </>
        )}
        {display && suffix && (
          <span className="text-base font-medium text-mute"> {suffix}</span>
        )}
      </div>
      <div className="mt-1.5 text-sm text-mute">{label}</div>
    </motion.div>
  );
}

export default function Stats() {
  const { sessions, weight, profile } = useStore();
  const [weeks, setWeeks] = useState(8);

  const volSeries = useMemo(
    () =>
      weeklyVolume(sessions, weeks).map((d) => ({
        ...d,
        v: Math.round(toUnit(d.v, profile.unit)),
      })),
    [sessions, weeks, profile.unit]
  );
  const wSeries = useMemo(
    () =>
      weightSeries(weight, 24).map((d) => ({
        ...d,
        v: Math.round(toUnit(d.v, profile.unit) * 10) / 10,
      })),
    [weight, profile.unit]
  );
  const byDay = useMemo(() => sessionsByWeekday(sessions), [sessions]);
  const cals = useMemo(() => caloriesSeries(sessions, 14), [sessions]);

  const totalVol = volumeLastDays(sessions, weeks * 7);
  const sessCount = sessionsLastDays(sessions, weeks * 7);
  const totalCals = sessions
    .filter((s) => Date.now() - new Date(s.date).getTime() < weeks * 7 * 86400000)
    .reduce((t, s) => t + s.calories, 0);
  const avgDur =
    sessions
      .filter((s) => Date.now() - new Date(s.date).getTime() < weeks * 7 * 86400000)
      .reduce((t, s) => t + s.durationSec, 0) /
    Math.max(1, sessCount) /
    60;

  return (
    <>
      <PageHeader
        title="Statistiques"
        subtitle="Performances"
        actions={
          <div className="hidden rounded-pill border border-white/[0.07] bg-ink-850 p-1 sm:flex">
            {RANGES.map((r) => (
              <button
                key={r.weeks}
                onClick={() => setWeeks(r.weeks)}
                className={`relative rounded-pill px-3.5 py-1.5 text-sm font-medium transition-colors ${
                  weeks === r.weeks ? "text-black" : "text-mute hover:text-white"
                }`}
              >
                {weeks === r.weeks && (
                  <motion.span
                    layoutId="range-pill"
                    className="absolute inset-0 rounded-pill bg-white"
                    transition={{ type: "spring", stiffness: 400, damping: 32 }}
                  />
                )}
                <span className="relative z-10">{r.label}</span>
              </button>
            ))}
          </div>
        }
      />

      {/* Mobile range selector */}
      <div className="mb-4 flex rounded-pill border border-white/[0.07] bg-ink-850 p-1 sm:hidden">
        {RANGES.map((r) => (
          <button
            key={r.weeks}
            onClick={() => setWeeks(r.weeks)}
            className={`relative flex-1 rounded-pill py-2 text-sm font-medium transition-colors ${
              weeks === r.weeks ? "text-black" : "text-mute"
            }`}
          >
            {weeks === r.weeks && (
              <motion.span
                layoutId="range-pill-m"
                className="absolute inset-0 rounded-pill bg-white"
                transition={{ type: "spring", stiffness: 400, damping: 32 }}
              />
            )}
            <span className="relative z-10">{r.label}</span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3.5 lg:grid-cols-4 lg:gap-4">
        <Kpi
          icon={Dumbbell}
          label={`Volume (${profile.unit})`}
          value={0}
          display={fmtVolume(totalVol, profile.unit)}
          suffix={profile.unit}
          color="#c6ff5a"
          delay={0.02}
        />
        <Kpi icon={TrendUp} label="Séances" value={sessCount} color="#5ad1c8" delay={0.06} />
        <Kpi icon={Flame} label="Calories" value={totalCals} suffix="kcal" color="#ff7a45" delay={0.1} />
        <Kpi
          icon={Clock}
          label="Durée moy."
          value={Math.round(avgDur)}
          suffix="min"
          color="#9b8cff"
          delay={0.14}
        />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18 }}
          className="card grain p-5 lg:col-span-2"
        >
          <div className="mb-3 flex items-center justify-between">
            <div>
              <div className="font-bold">Volume hebdomadaire</div>
              <div className="text-sm text-mute">{profile.unit} soulevés par semaine</div>
            </div>
            <div className="chip">
              <TrendUp size={13} /> Progression
            </div>
          </div>
          <AreaFull data={volSeries} color="#c6ff5a" height={240} unit={` ${profile.unit}`} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.22 }}
          className="card grain p-5"
        >
          <div className="mb-3 font-bold">Poids de corps</div>
          <LineMini data={wSeries} color="#9b8cff" height={220} unit={` ${profile.unit}`} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.26 }}
          className="card grain p-5"
        >
          <div className="mb-3 font-bold">Séances par jour</div>
          <Bars data={byDay} color="#5ad1c8" height={220} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card grain p-5 lg:col-span-2"
        >
          <div className="mb-3 font-bold">Calories brûlées · 14 jours</div>
          <AreaFull data={cals} color="#ff7a45" height={200} unit=" kcal" />
        </motion.div>
      </div>
    </>
  );
}
