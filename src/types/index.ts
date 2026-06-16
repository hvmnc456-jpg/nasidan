export interface SetEntry {
  weight: number;
  reps: number;
}

export interface Exercise {
  id: string;
  bodyPart: string;
  name: string;
  sets: SetEntry[];
}

export interface WorkoutSession {
  id: string;
  date: string;
  bodyParts: string[];
  exercises: Exercise[];
}

export type Screen = 'home' | 'exercises' | 'summary' | 'history';
export type AppTab = 'home' | 'workout' | 'diet' | 'records' | 'settings';
