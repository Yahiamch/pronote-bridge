import type {
  Folder,
  Routine,
  Session,
  WaterLog,
  WeightLog,
  Program,
  Profile,
  Exercise,
} from "./types";
import { uid, todayKey } from "./utils";

const EX = {
  bench: { name: "Développé couché", muscle: "Pectoraux" },
  incline: { name: "Développé incliné", muscle: "Pectoraux" },
  fly: { name: "Écarté poulie", muscle: "Pectoraux" },
  pushdown: { name: "Extension triceps", muscle: "Triceps" },
  squat: { name: "Squat", muscle: "Quadriceps" },
  legpress: { name: "Presse à cuisses", muscle: "Quadriceps" },
  rdl: { name: "Soulevé de terre roumain", muscle: "Ischios" },
  pullup: { name: "Tractions", muscle: "Dos" },
  row: { name: "Rowing barre", muscle: "Dos" },
  curl: { name: "Curl biceps", muscle: "Biceps" },
  ohp: { name: "Développé militaire", muscle: "Épaules" },
  lateral: { name: "Élévations latérales", muscle: "Épaules" },
};

const mkEx = (
  key: keyof typeof EX,
  sets: { reps: number; weight: number }[]
): Exercise => ({
  id: uid(),
  name: EX[key].name,
  muscle: EX[key].muscle,
  sets: sets.map((s) => ({ ...s, done: false })),
});

export function buildSeed() {
  const folders: Folder[] = [
    { id: "f-summer", name: "Summer", color: "#5ad1c8" },
    { id: "f-routine", name: "Routine", color: "#9b8cff" },
  ];

  const routines: Routine[] = [
    {
      id: "r-chest",
      name: "Chest + Triceps",
      emoji: "💪",
      folderId: "f-routine",
      schedule: "Samedi",
      exercises: [
        mkEx("bench", [
          { reps: 10, weight: 60 },
          { reps: 8, weight: 70 },
          { reps: 6, weight: 80 },
        ]),
        mkEx("incline", [
          { reps: 10, weight: 50 },
          { reps: 10, weight: 50 },
        ]),
        mkEx("fly", [
          { reps: 12, weight: 20 },
          { reps: 12, weight: 20 },
        ]),
        mkEx("pushdown", [
          { reps: 15, weight: 25 },
          { reps: 12, weight: 30 },
        ]),
      ],
    },
    {
      id: "r-back",
      name: "Back + Biceps + Legs",
      emoji: "🔥",
      folderId: "f-routine",
      schedule: "Lundi",
      exercises: [
        mkEx("pullup", [
          { reps: 8, weight: 0 },
          { reps: 8, weight: 0 },
        ]),
        mkEx("row", [
          { reps: 10, weight: 60 },
          { reps: 8, weight: 70 },
        ]),
        mkEx("squat", [
          { reps: 8, weight: 90 },
          { reps: 6, weight: 100 },
        ]),
        mkEx("curl", [
          { reps: 12, weight: 15 },
          { reps: 10, weight: 17.5 },
        ]),
      ],
    },
    {
      id: "r-legs",
      name: "Legs focus",
      emoji: "🦵",
      folderId: "f-routine",
      schedule: "Mercredi",
      exercises: [
        mkEx("squat", [
          { reps: 8, weight: 100 },
          { reps: 6, weight: 110 },
        ]),
        mkEx("legpress", [
          { reps: 12, weight: 160 },
          { reps: 10, weight: 180 },
        ]),
        mkEx("rdl", [
          { reps: 10, weight: 80 },
          { reps: 8, weight: 90 },
        ]),
      ],
    },
    {
      id: "r-cardio",
      name: "Cardio 365",
      emoji: "🏃",
      folderId: null,
      schedule: "Tous les 4 jours",
      exercises: [],
    },
    {
      id: "r-shoulders",
      name: "Shoulders + Abs",
      emoji: "🎯",
      folderId: "f-routine",
      schedule: "Vendredi",
      exercises: [
        mkEx("ohp", [
          { reps: 10, weight: 40 },
          { reps: 8, weight: 45 },
        ]),
        mkEx("lateral", [
          { reps: 15, weight: 10 },
          { reps: 15, weight: 10 },
        ]),
      ],
    },
  ];

  // Generate ~5 months of realistic sessions for charts
  const sessions: Session[] = [];
  const names = [
    "Chest + Triceps",
    "Back + Biceps + Legs",
    "Legs focus",
    "Shoulders + Abs",
  ];
  const now = new Date();
  for (let i = 150; i >= 1; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    const dow = d.getDay();
    // train Mon/Wed/Fri/Sat-ish with some randomness
    const train = [1, 3, 5, 6].includes(dow) && Math.random() > 0.18;
    if (!train) continue;
    const baseVol = 4200 + Math.random() * 2600;
    const progress = (150 - i) * 6; // slow upward trend
    sessions.push({
      id: uid(),
      name: names[Math.floor(Math.random() * names.length)],
      date: d.toISOString(),
      durationSec: Math.floor(2800 + Math.random() * 2200),
      volume: Math.round(baseVol + progress),
      calories: Math.round(280 + Math.random() * 240),
      exercises: [],
    });
  }

  // Water logs — last 90 days
  const water: WaterLog[] = [];
  for (let i = 90; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    water.push({
      date: todayKey(d),
      ml: Math.round((1400 + Math.random() * 1400) / 50) * 50,
    });
  }
  // today partial
  water[water.length - 1].ml = 1250;

  // Weight logs — last 120 days, slow recomposition
  const weight: WeightLog[] = [];
  let w = 84;
  for (let i = 120; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    w += (Math.random() - 0.55) * 0.18;
    if (i % 3 === 0)
      weight.push({ date: todayKey(d), value: Math.round(w * 10) / 10 });
  }

  const program: Program = {
    id: "p-ignite",
    title: "28-Day Ignite : Home Fitness Fusion",
    tags: ["Perte de poids", "Endurance", "Mobilité"],
    level: "Débutant",
    totalKcal: 12300,
    totalTime: "7h 24m",
    days: Array.from({ length: 28 }, (_, i) => ({
      day: i + 1,
      title:
        i === 0
          ? "Fat Shredding Start"
          : i % 7 === 0
          ? "Active Recovery"
          : i % 3 === 0
          ? "HIIT Burn"
          : "Strength Flow",
      kcal: 220 + Math.round(Math.random() * 160),
      minutes: 16,
      done: i < 1,
    })),
  };

  const profile: Profile = {
    name: "Athlète",
    unit: "kg",
    waterGoalMl: 2500,
    bodyWeight: 90.7, // ~200 lbs
    height: 180,
    streak: 1,
  };

  return { folders, routines, sessions, water, weight, program, profile };
}
