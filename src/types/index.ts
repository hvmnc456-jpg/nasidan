export interface SetEntry {
  weight: number;
  reps: number;
}

export interface Exercise {
  id: string;
  bodyPart: string;
  name: string;
  sets: SetEntry[];
  timerDuration?: number;   // 운동 완료 후 측정된 시간(초)
  timerLapLog?: LapEntry[]; // 운동 완료 후 랩 로그
}

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

export interface LapEntry {
  timestamp: number;
  type: 'workout_start' | 'rest_start' | 'workout_resume' | 'complete';
}

export type ExerciseTimerStatus = 'idle' | 'working' | 'resting' | 'completed';
export type Screen = 'home' | 'exercises' | 'summary' | 'history';
export type AppTab = 'home' | 'workout' | 'diet' | 'records' | 'settings';
