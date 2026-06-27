import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  Folder,
  Routine,
  Session,
  WaterLog,
  WeightLog,
  Program,
  Profile,
  ActiveWorkout,
  Exercise,
} from "../lib/types";
import { buildSeed } from "../lib/seed";
import { uid, todayKey, sessionVolume } from "../lib/utils";

interface State {
  folders: Folder[];
  routines: Routine[];
  sessions: Session[];
  water: WaterLog[];
  weight: WeightLog[];
  program: Program;
  profile: Profile;
  active: ActiveWorkout | null;

  // actions
  addWater: (ml: number) => void;
  setWaterGoal: (ml: number) => void;
  logWeight: (value: number) => void;
  setUnit: (unit: "kg" | "lbs") => void;
  updateProfile: (p: Partial<Profile>) => void;

  addFolder: (name: string) => void;
  addRoutine: (name: string, folderId?: string | null) => string;
  deleteRoutine: (id: string) => void;

  startWorkout: (routineId?: string, name?: string) => void;
  toggleSet: (exId: string, setIdx: number) => void;
  updateSet: (
    exId: string,
    setIdx: number,
    patch: Partial<{ reps: number; weight: number }>
  ) => void;
  addSet: (exId: string) => void;
  finishWorkout: () => void;
  cancelWorkout: () => void;

  toggleProgramDay: (day: number) => void;
}

const seed = buildSeed();

export const useStore = create<State>()(
  persist(
    (set, get) => ({
      ...seed,
      active: null,

      addWater: (ml) =>
        set((s) => {
          const key = todayKey();
          const exists = s.water.find((w) => w.date === key);
          const water = exists
            ? s.water.map((w) =>
                w.date === key ? { ...w, ml: Math.max(0, w.ml + ml) } : w
              )
            : [...s.water, { date: key, ml: Math.max(0, ml) }];
          return { water };
        }),

      setWaterGoal: (ml) =>
        set((s) => ({ profile: { ...s.profile, waterGoalMl: ml } })),

      logWeight: (value) =>
        set((s) => {
          const key = todayKey();
          const exists = s.weight.find((w) => w.date === key);
          const weight = exists
            ? s.weight.map((w) => (w.date === key ? { ...w, value } : w))
            : [...s.weight, { date: key, value }];
          return { weight, profile: { ...s.profile, bodyWeight: value } };
        }),

      setUnit: (unit) => set((s) => ({ profile: { ...s.profile, unit } })),
      updateProfile: (p) => set((s) => ({ profile: { ...s.profile, ...p } })),

      addFolder: (name) =>
        set((s) => ({
          folders: [...s.folders, { id: uid(), name, color: "#5ad1c8" }],
        })),

      addRoutine: (name, folderId = null) => {
        const id = uid();
        set((s) => ({
          routines: [
            ...s.routines,
            { id, name, folderId, exercises: [], schedule: "Flexible" },
          ],
        }));
        return id;
      },

      deleteRoutine: (id) =>
        set((s) => ({ routines: s.routines.filter((r) => r.id !== id) })),

      startWorkout: (routineId, name) =>
        set((s) => {
          const routine = s.routines.find((r) => r.id === routineId);
          const exercises: Exercise[] = (routine?.exercises ?? []).map((e) => ({
            ...e,
            id: uid(),
            sets: e.sets.map((st) => ({ ...st, done: false })),
          }));
          return {
            active: {
              routineId,
              name: name ?? routine?.name ?? "Séance libre",
              focus: routine?.exercises[0]?.muscle ?? "Full body",
              startedAt: Date.now(),
              exercises,
            },
          };
        }),

      toggleSet: (exId, setIdx) =>
        set((s) => {
          if (!s.active) return {};
          const exercises = s.active.exercises.map((e) =>
            e.id === exId
              ? {
                  ...e,
                  sets: e.sets.map((st, i) =>
                    i === setIdx ? { ...st, done: !st.done } : st
                  ),
                }
              : e
          );
          return { active: { ...s.active, exercises } };
        }),

      updateSet: (exId, setIdx, patch) =>
        set((s) => {
          if (!s.active) return {};
          const exercises = s.active.exercises.map((e) =>
            e.id === exId
              ? {
                  ...e,
                  sets: e.sets.map((st, i) =>
                    i === setIdx ? { ...st, ...patch } : st
                  ),
                }
              : e
          );
          return { active: { ...s.active, exercises } };
        }),

      addSet: (exId) =>
        set((s) => {
          if (!s.active) return {};
          const exercises = s.active.exercises.map((e) =>
            e.id === exId
              ? {
                  ...e,
                  sets: [
                    ...e.sets,
                    {
                      reps: e.sets.at(-1)?.reps ?? 10,
                      weight: e.sets.at(-1)?.weight ?? 20,
                      done: false,
                    },
                  ],
                }
              : e
          );
          return { active: { ...s.active, exercises } };
        }),

      finishWorkout: () =>
        set((s) => {
          if (!s.active) return {};
          const durationSec = Math.floor((Date.now() - s.active.startedAt) / 1000);
          const volume = sessionVolume(s.active.exercises);
          const session: Session = {
            id: uid(),
            routineId: s.active.routineId,
            name: s.active.name,
            date: new Date().toISOString(),
            durationSec,
            volume,
            calories: Math.round((durationSec / 60) * 7 + volume * 0.01),
            exercises: s.active.exercises,
          };
          return {
            sessions: [...s.sessions, session],
            active: null,
            profile: { ...s.profile, streak: s.profile.streak + 1 },
          };
        }),

      cancelWorkout: () => set({ active: null }),

      toggleProgramDay: (day) =>
        set((s) => ({
          program: {
            ...s.program,
            days: s.program.days.map((d) =>
              d.day === day ? { ...d, done: !d.done } : d
            ),
          },
        })),
    }),
    {
      name: "forge-fitness-v1",
      version: 1,
    }
  )
);
