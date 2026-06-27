import type { Unit } from "./types";

export const uid = () => Math.random().toString(36).slice(2, 10);

export const todayKey = (d: Date = new Date()) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

export const dayKeyOffset = (offset: number) => {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return todayKey(d);
};

export const KG_TO_LBS = 2.20462;

export const toUnit = (kg: number, unit: Unit) =>
  unit === "lbs" ? kg * KG_TO_LBS : kg;

export const fromUnit = (val: number, unit: Unit) =>
  unit === "lbs" ? val / KG_TO_LBS : val;

export const fmtWeight = (kg: number, unit: Unit, digits = 0) =>
  `${toUnit(kg, unit).toFixed(digits)}`;

export const fmtVolume = (kg: number, unit: Unit) => {
  const v = toUnit(kg, unit);
  if (v >= 1000) return `${(v / 1000).toFixed(1).replace(".0", "")}k`;
  return Math.round(v).toLocaleString("fr-FR");
};

export const fmtDuration = (sec: number) => {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = Math.floor(sec % 60);
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
};

export const fmtClock = (sec: number) => {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
};

export const relativeTime = (iso: string) => {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "à l'instant";
  if (min < 60) return `il y a ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `il y a ${h} h`;
  const d = Math.floor(h / 24);
  if (d === 1) return "hier";
  if (d < 7) return `il y a ${d} j`;
  return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
};

export const weekdayShort = (iso: string) =>
  new Date(iso).toLocaleDateString("fr-FR", { weekday: "long" });

export const clamp = (v: number, min: number, max: number) =>
  Math.max(min, Math.min(max, v));

export const sessionVolume = (ex: { sets: { reps: number; weight: number; done: boolean }[] }[]) =>
  ex.reduce(
    (t, e) =>
      t + e.sets.reduce((s, set) => s + (set.done ? set.reps * set.weight : 0), 0),
    0
  );
