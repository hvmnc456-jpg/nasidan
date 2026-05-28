export interface WorkoutSession {
  id: string;
  date: string;
  bodyParts: string[];
  exercises: Exercise[];
  lapLog: LapEntry[];
  totalDuration: number;
  avgWorkTime: number;
  avgRestTime: number;
}

export interface Exercise {
  id: string;
  bodyPart: string;
  name: string;
  weight: number;
  sets: number;
  repsPerSet: number;
}

export interface LapEntry {
  timestamp: number;
  type: 'workout_start' | 'rest_start' | 'workout_resume' | 'complete';
}

export type Screen = 'home' | 'exercises' | 'timer' | 'summary' | 'history';
export type WorkoutStatus = 'idle' | 'working' | 'resting' | 'completed';
export type AppTab = 'home' | 'workout' | 'diet';
