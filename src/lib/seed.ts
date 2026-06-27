import type { Folder, Routine, Session, WaterLog, WeightLog, Program, Profile, Exercise } from "./types";
import { uid } from "./utils";

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

const mkEx = (key: keyof typeof EX, sets: { reps: number; weight: number }[]): Exercise => ({
  id: uid(),
  name: EX[key].name,
  muscle: EX[key].muscle,
  sets: sets.map((s) => ({ ...s, done: false })),
});

export function buildSeed() {
  const folders: Folder[] = [
    { id: "f-summer", name: "Summer" },
    { id: "f-routine", name: "Routine" },
  ];

  const routines: Routine[] = [
    {
      id: "r-chest",
      name: "Chest + Triceps",
      folderId: "f-routine",
      schedule: "Samedi",
      exercises: [
        mkEx("bench", [{ reps: 10, weight: 60 }, { reps: 8, weight: 70 }, { reps: 6, weight: 80 }]),
        mkEx("incline", [{ reps: 10, weight: 50 }, { reps: 10, weight: 50 }]),
        mkEx("fly", [{ reps: 12, weight: 20 }, { reps: 12, weight: 20 }]),
        mkEx("pushdown", [{ reps: 15, weight: 25 }, { reps: 12, weight: 30 }]),
      ],
    },
    {
      id: "r-back",
      name: "Back + Biceps + Legs",
      folderId: "f-routine",
      schedule: "Lundi",
      exercises: [
        mkEx("pullup", [{ reps: 8, weight: 0 }, { reps: 8, weight: 0 }]),
        mkEx("row", [{ reps: 10, weight: 60 }, { reps: 8, weight: 70 }]),
        mkEx("squat", [{ reps: 8, weight: 90 }, { reps: 6, weight: 100 }]),
        mkEx("curl", [{ reps: 12, weight: 15 }, { reps: 10, weight: 17.5 }]),
      ],
    },
    {
      id: "r-legs",
      name: "Legs focus",
      folderId: "f-routine",
      schedule: "Mercredi",
      exercises: [
        mkEx("squat", [{ reps: 8, weight: 100 }, { reps: 6, weight: 110 }]),
        mkEx("legpress", [{ reps: 12, weight: 160 }, { reps: 10, weight: 180 }]),
        mkEx("rdl", [{ reps: 10, weight: 80 }, { reps: 8, weight: 90 }]),
      ],
    },
    {
      id: "r-cardio",
      name: "Cardio 365",
      folderId: null,
      schedule: "Tous les 4 jours",
      exercises: [],
    },
    {
      id: "r-shoulders",
      name: "Shoulders + Abs",
      folderId: "f-routine",
      schedule: "Vendredi",
      exercises: [
        mkEx("ohp", [{ reps: 10, weight: 40 }, { reps: 8, weight: 45 }]),
        mkEx("lateral", [{ reps: 15, weight: 10 }, { reps: 15, weight: 10 }]),
      ],
    },
  ];

  const sessions: Session[] = [];
  const water: WaterLog[] = [];
  const weight: WeightLog[] = [];

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
        i === 0 ? "Fat Shredding Start"
        : i % 7 === 0 ? "Active Recovery"
        : i % 3 === 0 ? "HIIT Burn"
        : "Strength Flow",
      kcal: 220 + Math.round(Math.random() * 160),
      minutes: 16,
      done: false,
    })),
  };

  const profile: Profile = {
    name: "",
    unit: "kg",
    waterGoalMl: 2500,
    bodyWeight: 75,
    height: 175,
    streak: 0,
  };

  return { folders, routines, sessions, water, weight, program, profile };
}
