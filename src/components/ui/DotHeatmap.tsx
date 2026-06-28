import { motion } from "framer-motion";
import { useMemo } from "react";
import type { Session } from "../../lib/types";
import { todayKey } from "../../lib/utils";

interface Props {
  sessions: Session[];
  months?: number; // how many recent months to show
}

/** The dot-grid activity heatmap (Jan / Feb / Mar style). */
export default function DotHeatmap({ sessions, months = 3 }: Props) {
  const data = useMemo(() => {
    const byDay = new Map<string, number>();
    sessions.forEach((s) => {
      const k = todayKey(new Date(s.date));
      byDay.set(k, (byDay.get(k) ?? 0) + s.volume);
    });

    const now = new Date();
    const cols: { label: string; days: { key: string; v: number }[] }[] = [];
    for (let m = months - 1; m >= 0; m--) {
      const ref = new Date(now.getFullYear(), now.getMonth() - m, 1);
      const label = ref.toLocaleDateString("fr-FR", { month: "short" });
      const daysInMonth = new Date(
        ref.getFullYear(),
        ref.getMonth() + 1,
        0
      ).getDate();
      const days: { key: string; v: number }[] = [];
      for (let d = 1; d <= daysInMonth; d++) {
        const key = todayKey(new Date(ref.getFullYear(), ref.getMonth(), d));
        days.push({ key, v: byDay.get(key) ?? 0 });
      }
      cols.push({ label: label.charAt(0).toUpperCase() + label.slice(1, 3), days });
    }
    const max = Math.max(1, ...sessions.map((s) => s.volume));
    return { cols, max };
  }, [sessions, months]);

  return (
    <div className="flex justify-between gap-3">
      {data.cols.map((col) => (
        <div key={col.label} className="flex-1">
          <div className="mb-3 text-center text-[15px] font-semibold text-white/90">
            {col.label}
          </div>
          <div className="mx-auto grid w-fit grid-flow-col grid-rows-5 gap-[5px]">
            {col.days.map((d, i) => {
              const intensity = d.v / data.max;
              const lit = d.v > 0;
              return (
                <motion.span
                  key={d.key}
                  initial={{ opacity: 0, scale: 0.4 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.004, duration: 0.3 }}
                  className="h-[6px] w-[6px] rounded-full"
                  style={{
                    background: lit
                      ? `rgba(255,255,255,${0.35 + intensity * 0.65})`
                      : "rgba(255,255,255,0.10)",
                    boxShadow: intensity > 0.7 ? "0 0 6px rgba(255,255,255,0.6)" : "none",
                  }}
                />
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
