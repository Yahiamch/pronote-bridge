import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useStore } from "../store/useStore";
import PageHeader from "../components/PageHeader";
import { ChevronRight, Dumbbell, Flame, Clock } from "../components/Icons";
import { todayKey, fmtDuration, fmtVolume } from "../lib/utils";

const WD = ["L", "M", "M", "J", "V", "S", "D"];

export default function CalendarPage() {
  const { sessions, profile } = useStore();
  const [cursor, setCursor] = useState(() => {
    const d = new Date();
    return { y: d.getFullYear(), m: d.getMonth() };
  });
  const [selected, setSelected] = useState(todayKey());

  const byDay = useMemo(() => {
    const map = new Map<string, { count: number; volume: number; cals: number }>();
    sessions.forEach((s) => {
      const k = todayKey(new Date(s.date));
      const cur = map.get(k) ?? { count: 0, volume: 0, cals: 0 };
      cur.count++;
      cur.volume += s.volume;
      cur.cals += s.calories;
      map.set(k, cur);
    });
    return map;
  }, [sessions]);

  const maxVol = Math.max(1, ...[...byDay.values()].map((v) => v.volume));

  const grid = useMemo(() => {
    const first = new Date(cursor.y, cursor.m, 1);
    const startDow = (first.getDay() + 6) % 7;
    const days = new Date(cursor.y, cursor.m + 1, 0).getDate();
    const cells: (string | null)[] = [];
    for (let i = 0; i < startDow; i++) cells.push(null);
    for (let d = 1; d <= days; d++) cells.push(todayKey(new Date(cursor.y, cursor.m, d)));
    return cells;
  }, [cursor]);

  const selectedSessions = sessions
    .filter((s) => todayKey(new Date(s.date)) === selected)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const monthLabel = new Date(cursor.y, cursor.m, 1).toLocaleDateString("fr-FR", {
    month: "long",
    year: "numeric",
  });

  const shift = (delta: number) =>
    setCursor((c) => {
      const d = new Date(c.y, c.m + delta, 1);
      return { y: d.getFullYear(), m: d.getMonth() };
    });

  return (
    <>
      <PageHeader title="Calendrier" subtitle="Ton historique" />

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="card grain p-5">
          <div className="mb-4 flex items-center justify-between">
            <button
              onClick={() => shift(-1)}
              className="pill-btn h-9 w-9 rotate-180 text-mute"
            >
              <ChevronRight size={18} />
            </button>
            <div className="font-bold capitalize">{monthLabel}</div>
            <button onClick={() => shift(1)} className="pill-btn h-9 w-9 text-mute">
              <ChevronRight size={18} />
            </button>
          </div>

          <div className="mb-2 grid grid-cols-7 gap-1.5 text-center text-xs text-mute-soft">
            {WD.map((d, i) => (
              <div key={i}>{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1.5">
            {grid.map((key, i) => {
              if (!key) return <div key={i} />;
              const data = byDay.get(key);
              const isToday = key === todayKey();
              const isSel = key === selected;
              const intensity = data ? 0.25 + (data.volume / maxVol) * 0.75 : 0;
              const dayNum = Number(key.slice(-2));
              return (
                <motion.button
                  key={key}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setSelected(key)}
                  className={`relative aspect-square rounded-xl text-sm font-medium transition-all ${
                    isSel ? "ring-2 ring-accent" : "ring-1 ring-white/[0.04]"
                  }`}
                  style={{
                    background: data
                      ? `rgba(90,209,200,${intensity * 0.5})`
                      : "rgba(255,255,255,0.02)",
                  }}
                >
                  <span className={isToday ? "text-accent" : data ? "text-white" : "text-mute"}>
                    {dayNum}
                  </span>
                  {data && (
                    <span className="absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-accent" />
                  )}
                </motion.button>
              );
            })}
          </div>

          <div className="mt-4 flex items-center justify-center gap-2 text-xs text-mute-soft">
            <span>Moins</span>
            {[0.1, 0.3, 0.5, 0.8].map((o) => (
              <span
                key={o}
                className="h-3 w-3 rounded"
                style={{ background: `rgba(90,209,200,${o})` }}
              />
            ))}
            <span>Plus</span>
          </div>
        </div>

        {/* Selected day detail */}
        <div className="card grain p-5">
          <div className="mb-4 font-bold capitalize">
            {new Date(selected + "T12:00").toLocaleDateString("fr-FR", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </div>
          {selectedSessions.length === 0 ? (
            <div className="grid h-48 place-items-center text-center text-mute-soft">
              <div>
                <Dumbbell size={28} className="mx-auto mb-2 opacity-40" />
                Aucune séance ce jour
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-2.5">
              {selectedSessions.map((s, i) => (
                <motion.div
                  key={s.id}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="rounded-2xl border border-white/[0.05] bg-white/[0.02] p-4"
                >
                  <div className="mb-2 font-semibold">{s.name}</div>
                  <div className="flex flex-wrap gap-2 text-xs text-mute">
                    <span className="chip">
                      <Dumbbell size={13} /> {fmtVolume(s.volume, profile.unit)} {profile.unit}
                    </span>
                    <span className="chip">
                      <Clock size={13} /> {fmtDuration(s.durationSec)}
                    </span>
                    <span className="chip">
                      <Flame size={13} /> {s.calories} kcal
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
