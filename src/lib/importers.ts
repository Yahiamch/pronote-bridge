import { unzipSync, strFromU8 } from "fflate";
import type { Session, WeightLog } from "./types";
import { uid, todayKey } from "./utils";

export interface ImportResult {
  sessions: Session[];
  weights: WeightLog[];
}

/** Apple exports dates like "2024-01-01 08:00:00 +0100". */
function parseAppleDate(s: string): Date {
  return new Date(s.trim().replace(" ", "T").replace(/\s(?=[+-]\d{4}$)/, ""));
}

function attrs(tag: string): Record<string, string> {
  const out: Record<string, string> = {};
  const re = /([\w:]+)="([^"]*)"/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(tag))) out[m[1]] = m[2];
  return out;
}

function prettyActivity(t: string): string {
  const base = t.replace("HKWorkoutActivityType", "");
  const map: Record<string, string> = {
    TraditionalStrengthTraining: "Musculation",
    FunctionalStrengthTraining: "Renforcement",
    Running: "Course à pied",
    Walking: "Marche",
    Cycling: "Vélo",
    HighIntensityIntervalTraining: "HIIT",
    CoreTraining: "Gainage",
    Yoga: "Yoga",
    Swimming: "Natation",
    Elliptical: "Elliptique",
    Rowing: "Rameur",
    Hiking: "Randonnée",
    StairClimbing: "Escaliers",
    Pilates: "Pilates",
    Cooldown: "Récupération",
    MixedCardio: "Cardio",
  };
  return (
    map[base] ||
    base.replace(/([A-Z])/g, " $1").trim() ||
    "Séance"
  );
}

/** Parse an Apple Health `export.xml` string into sessions + weight logs. */
export function parseAppleHealthXml(xml: string): ImportResult {
  const sessions: Session[] = [];
  const weights: WeightLog[] = [];

  // Workouts
  const wre = /<Workout\b[^>]*>/g;
  let m: RegExpExecArray | null;
  while ((m = wre.exec(xml))) {
    const a = attrs(m[0]);
    if (!a.startDate) continue;
    const start = parseAppleDate(a.startDate);
    if (isNaN(+start)) continue;
    const durMin = Number(a.duration) || 0;
    const cals = Math.round(Number(a.totalEnergyBurned) || 0);
    sessions.push({
      id: "ah-" + a.startDate.replace(/\W/g, "").slice(0, 14) + "-" + uid().slice(0, 4),
      name: prettyActivity(a.workoutActivityType || "Workout"),
      date: start.toISOString(),
      durationSec: Math.round(durMin * 60),
      volume: 0,
      calories: cals,
      exercises: [],
    });
  }

  // Body mass records → one per day (latest wins)
  const bre = /<Record\b[^>]*type="HKQuantityTypeIdentifierBodyMass"[^>]*>/g;
  const byDay = new Map<string, { value: number; t: number }>();
  while ((m = bre.exec(xml))) {
    const a = attrs(m[0]);
    if (!a.startDate || !a.value) continue;
    const d = parseAppleDate(a.startDate);
    if (isNaN(+d)) continue;
    let val = Number(a.value);
    if (!val) continue;
    if ((a.unit || "").toLowerCase().includes("lb")) val = val / 2.20462;
    const key = todayKey(d);
    const prev = byDay.get(key);
    if (!prev || +d > prev.t) byDay.set(key, { value: Math.round(val * 10) / 10, t: +d });
  }
  for (const [date, { value }] of byDay) weights.push({ date, value });

  return { sessions, weights };
}

function splitCsv(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let q = false;
  for (const ch of line) {
    if (ch === '"') q = !q;
    else if ((ch === "," || ch === ";") && !q) {
      out.push(cur);
      cur = "";
    } else cur += ch;
  }
  out.push(cur);
  return out.map((s) => s.trim().replace(/^"|"$/g, ""));
}

/** Parse a generic CSV export (dates + workouts and/or body weight). */
export function parseCsv(text: string): ImportResult {
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return { sessions: [], weights: [] };
  const header = splitCsv(lines[0]).map((h) => h.toLowerCase());
  const idx = (names: string[]) => header.findIndex((h) => names.some((n) => h.includes(n)));
  const di = idx(["date", "jour"]);
  const ni = idx(["name", "nom", "séance", "seance", "workout", "exercice", "activity", "activité"]);
  const vi = idx(["volume", "tonnage"]);
  const ci = idx(["calorie", "kcal", "cals"]);
  const dui = idx(["duration", "durée", "duree", "minute", "temps"]);
  const wi = idx(["bodyweight", "poids corporel", "poids", "weight"]);

  const sessions: Session[] = [];
  const weights: WeightLog[] = [];
  for (let i = 1; i < lines.length; i++) {
    const c = splitCsv(lines[i]);
    const dateRaw = di >= 0 ? c[di] : "";
    const d = dateRaw ? new Date(dateRaw) : null;
    if (!d || isNaN(+d)) continue;

    if (wi >= 0 && c[wi]) {
      const v = Number(c[wi].replace(",", "."));
      if (v > 0) weights.push({ date: todayKey(d), value: Math.round(v * 10) / 10 });
    }
    if (ni >= 0 && c[ni]) {
      const durMin = dui >= 0 ? Number(String(c[dui]).replace(",", ".")) || 0 : 0;
      sessions.push({
        id: "csv-" + uid(),
        name: c[ni] || "Séance importée",
        date: d.toISOString(),
        durationSec: Math.round(durMin * 60),
        volume: vi >= 0 ? Number(String(c[vi] || "0").replace(",", ".")) || 0 : 0,
        calories: ci >= 0 ? Math.round(Number(c[ci]) || 0) : 0,
        exercises: [],
      });
    }
  }
  return { sessions, weights };
}

/** Detect file type (Apple zip / xml / csv) and parse accordingly. */
export async function parseHealthFile(file: File): Promise<ImportResult> {
  const name = file.name.toLowerCase();
  if (name.endsWith(".zip")) {
    const buf = new Uint8Array(await file.arrayBuffer());
    const files = unzipSync(buf);
    const key = Object.keys(files).find((k) => /export\.xml$/i.test(k));
    if (!key) throw new Error("Aucun export.xml trouvé dans l'archive. Exporte tes données depuis l'app Santé.");
    return parseAppleHealthXml(strFromU8(files[key]));
  }
  const text = await file.text();
  if (name.endsWith(".xml") || text.includes("<HealthData")) return parseAppleHealthXml(text);
  return parseCsv(text);
}
