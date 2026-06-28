import type { Session, WeightLog } from "./types";
import { uid, todayKey } from "./utils";
import { parseCsv } from "./importers";

export interface ParsedImport {
  sessions: Session[];
  weights: WeightLog[];
  summary: string;
}

const DATE_RE = /(\d{1,2})[/.](\d{1,2})[/.](\d{4})(?:[ T,]+(\d{1,2}):(\d{2}))?|(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{1,2}):(\d{2}))?/;

/** Heuristic: does this pasted blob look like importable data (not a question)? */
export function looksLikeData(text: string): boolean {
  const t = text.trim();
  if (!t) return false;
  if (t.startsWith("[") || t.startsWith("{")) {
    try {
      JSON.parse(t);
      return true;
    } catch {
      /* not json */
    }
  }
  const lines = t.split(/\r?\n/).filter((l) => l.trim());
  const dated = lines.filter((l) => DATE_RE.test(l)).length;
  if (dated >= 2) return true;
  // CSV header + at least one row
  if (lines.length >= 2 && /[,;]/.test(lines[0]) && /date|jour|nom|name|poids|weight|workout/i.test(lines[0]))
    return true;
  return false;
}

function buildDate(m: RegExpMatchArray): Date | null {
  let y: number, mo: number, d: number, hh = 12, mm = 0;
  if (m[1]) {
    // DD/MM/YYYY [HH:MM]
    d = +m[1];
    mo = +m[2];
    y = +m[3];
    if (m[4]) {
      hh = +m[4];
      mm = +m[5];
    }
  } else {
    // YYYY-MM-DD [HH:MM]
    y = +m[6];
    mo = +m[7];
    d = +m[8];
    if (m[9]) {
      hh = +m[9];
      mm = +m[10];
    }
  }
  const dt = new Date(y, mo - 1, d, hh, mm);
  return isNaN(+dt) ? null : dt;
}

function cleanName(raw: string): string {
  const n = raw
    .replace(/\t+/g, " ")
    .replace(/\s{2,}/g, " ")
    .replace(/[;,|]+$/, "")
    .trim();
  return n || "Séance";
}

/** Parse pasted lines like "Basic-Fit Lille Rue du Molinel<TAB>27/06/2026 19:44". */
function parseLines(text: string): Session[] {
  // group by calendar day → one session per day (collapses duplicate scans)
  const byDay = new Map<string, { date: Date; name: string }>();
  for (const line of text.split(/\r?\n/)) {
    if (!line.trim()) continue;
    const m = line.match(DATE_RE);
    if (!m) continue;
    const dt = buildDate(m);
    if (!dt) continue;
    const before = line.slice(0, m.index).trim();
    const name = cleanName(before || "Séance");
    const key = todayKey(dt);
    const prev = byDay.get(key);
    // keep the earliest scan of the day
    if (!prev || +dt < +prev.date) byDay.set(key, { date: dt, name });
  }
  return [...byDay.entries()].map(([day, { date, name }]) => ({
    id: "imp-" + day + "-" + name.toLowerCase().replace(/\W+/g, "").slice(0, 8),
    name,
    date: date.toISOString(),
    durationSec: 0,
    volume: 0,
    calories: 0,
    exercises: [],
  }));
}

function parseJson(text: string): ParsedImport {
  const data = JSON.parse(text);
  const arr: any[] = Array.isArray(data) ? data : data.sessions ?? data.checkins ?? data.data ?? [];
  const sessions: Session[] = [];
  const weights: WeightLog[] = [];
  for (const it of arr) {
    const rawDate = it.date ?? it.occurred_at ?? it.checkInDate ?? it.timestamp ?? it.day;
    if (!rawDate) continue;
    const dt = new Date(rawDate);
    if (isNaN(+dt)) continue;
    if (it.weight ?? it.poids ?? it.bodyWeight) {
      const v = Number(it.weight ?? it.poids ?? it.bodyWeight);
      if (v > 0) weights.push({ date: todayKey(dt), value: Math.round(v * 10) / 10 });
    }
    const name = cleanName(String(it.name ?? it.club ?? it.location ?? it.title ?? "Séance"));
    sessions.push({
      id: "imp-" + todayKey(dt) + "-" + name.toLowerCase().replace(/\W+/g, "").slice(0, 8),
      name,
      date: dt.toISOString(),
      durationSec: Math.round((Number(it.duration ?? it.minutes) || 0) * 60),
      volume: Number(it.volume) || 0,
      calories: Math.round(Number(it.calories ?? it.kcal) || 0),
      exercises: [],
    });
  }
  // dedupe by id
  const seen = new Set<string>();
  const dedup = sessions.filter((s) => (seen.has(s.id) ? false : (seen.add(s.id), true)));
  return { sessions: dedup, weights, summary: summarize(dedup, weights) };
}

function summarize(sessions: Session[], weights: WeightLog[]): string {
  if (!sessions.length && !weights.length) return "Aucune donnée exploitable trouvée.";
  const dates = sessions.map((s) => new Date(s.date)).sort((a, b) => +a - +b);
  const range =
    dates.length >= 2
      ? ` (du ${dates[0].toLocaleDateString("fr-FR")} au ${dates.at(-1)!.toLocaleDateString("fr-FR")})`
      : "";
  const parts: string[] = [];
  if (sessions.length) parts.push(`${sessions.length} séance(s)${range}`);
  if (weights.length) parts.push(`${weights.length} mesure(s) de poids`);
  return parts.join(" et ");
}

export function parsePasted(text: string): ParsedImport {
  const t = text.trim();
  if (t.startsWith("[") || t.startsWith("{")) {
    try {
      return parseJson(t);
    } catch {
      /* fall through */
    }
  }
  // CSV (header with commas/semicolons)
  const lines = t.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length >= 2 && /[,;]/.test(lines[0]) && /date|jour|nom|name|poids|weight|workout/i.test(lines[0])) {
    const r = parseCsv(t);
    return { sessions: r.sessions, weights: r.weights, summary: summarize(r.sessions, r.weights) };
  }
  // Freeform dated lines (Basic-Fit check-ins, etc.)
  const sessions = parseLines(t);
  return { sessions, weights: [], summary: summarize(sessions, []) };
}
