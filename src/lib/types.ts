export type Unit = "kg" | "lbs";

export interface ExerciseSet {
  reps: number;
  weight: number;
  done: boolean;
}

export interface Exercise {
  id: string;
  name: string;
  muscle: string;
  sets: ExerciseSet[];
}

export interface Routine {
  id: string;
  name: string;
  emoji?: string;
  folderId?: string | null;
  exercises: Exercise[];
  schedule?: string; // e.g. "Every 4 days", "Monday"
}

export interface Folder {
  id: string;
  name: string;
  color?: string;
}

export interface Session {
  id: string;
  routineId?: string;
  name: string;
  date: string; // ISO
  durationSec: number;
  volume: number; // total kg lifted
  calories: number;
  exercises: Exercise[];
}

export interface WaterLog {
  date: string; // YYYY-MM-DD
  ml: number;
}

export interface WeightLog {
  date: string; // YYYY-MM-DD
  value: number;
}

export interface ProgramDay {
  day: number;
  title: string;
  kcal: number;
  minutes: number;
  done: boolean;
}

export interface Program {
  id: string;
  title: string;
  tags: string[];
  level: string;
  totalKcal: number;
  totalTime: string;
  days: ProgramDay[];
}

export interface ActiveWorkout {
  routineId?: string;
  name: string;
  startedAt: number; // epoch ms
  focus: string;
  exercises: Exercise[];
}

export interface Profile {
  name: string;
  unit: Unit;
  waterGoalMl: number;
  bodyWeight: number;
  height: number;
  streak: number;
}
