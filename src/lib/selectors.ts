import type { Session, WaterLog, WeightLog } from "./types";
import { todayKey } from "./utils";

export function volumeLastDays(sessions: Session[], days: number) {
  const cutoff = Date.now() - days * 86400000;
  return sessions
    .filter((s) => new Date(s.date).getTime() >= cutoff)
    .reduce((t, s) => t + s.volume, 0);
}

export function sessionsLastDays(sessions: Session[], days: number) {
  const cutoff = Date.now() - days * 86400000;
  return sessions.filter((s) => new Date(s.date).getTime() >= cutoff).length;
}

/** Weekly volume series for the last `weeks` weeks. */
export function weeklyVolume(sessions: Session[], weeks: number) {
  const out: { label: string; v: number }[] = [];
  const now = new Date();
  for (let w = weeks - 1; w >= 0; w--) {
    const end = new Date(now);
    end.setDate(now.getDate() - w * 7);
    const start = new Date(end);
    start.setDate(end.getDate() - 6);
    const v = sessions
      .filter((s) => {
        const t = new Date(s.date).getTime();
        return t >= start.getTime() && t <= end.getTime() + 86400000;
      })
      .reduce((t, s) => t + s.volume, 0);
    out.push({
      label: start.toLocaleDateString("fr-FR", { day: "numeric", month: "short" }),
      v,
    });
  }
  return out;
}

/** Per-weekday session count this/last weeks aggregated. */
export function sessionsByWeekday(sessions: Session[], days = 56) {
  const labels = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
  const counts = new Array(7).fill(0);
  const cutoff = Date.now() - days * 86400000;
  sessions.forEach((s) => {
    if (new Date(s.date).getTime() < cutoff) return;
    const dow = (new Date(s.date).getDay() + 6) % 7;
    counts[dow]++;
  });
  return labels.map((label, i) => ({ label, v: counts[i] }));
}

export function weightSeries(weight: WeightLog[], points = 30) {
  return weight.slice(-points).map((w) => ({
    label: new Date(w.date).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
    }),
    v: w.value,
  }));
}

export function waterToday(water: WaterLog[]) {
  const k = todayKey();
  return water.find((w) => w.date === k)?.ml ?? 0;
}

export function waterSeries(water: WaterLog[], days = 7) {
  const map = new Map(water.map((w) => [w.date, w.ml]));
  const out: { label: string; v: number }[] = [];
  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    out.push({
      label: d.toLocaleDateString("fr-FR", { weekday: "short" }).slice(0, 3),
      v: Math.round((map.get(todayKey(d)) ?? 0) / 10) / 100,
    });
  }
  return out;
}

export function caloriesSeries(sessions: Session[], days = 14) {
  const out: { label: string; v: number }[] = [];
  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    const key = todayKey(d);
    const v = sessions
      .filter((s) => todayKey(new Date(s.date)) === key)
      .reduce((t, s) => t + s.calories, 0);
    out.push({ label: d.toLocaleDateString("fr-FR", { day: "numeric" }), v });
  }
  return out;
}

export function lastSession(sessions: Session[]) {
  return [...sessions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )[0];
}

export function currentStreak(sessions: Session[]) {
  const set = new Set(sessions.map((s) => todayKey(new Date(s.date))));
  let streak = 0;
  const d = new Date();
  // allow today to be unworked
  if (!set.has(todayKey(d))) d.setDate(d.getDate() - 1);
  while (set.has(todayKey(d))) {
    streak++;
    d.setDate(d.getDate() - 1);
  }
  return streak;
}
