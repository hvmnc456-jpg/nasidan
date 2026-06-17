export interface SetEntry {
  weight: number;
  reps: number;
}

export interface Exercise {
  id: string;
  bodyPart: string;
  name: string;
  sets: SetEntry[];
  expanded?: boolean; // 카드 펼침 여부 (기본 true) — 탭/앱 전환에도 유지
  done?: boolean;     // 운동 완료 여부 — 완료 시 펼치지 않음
}

export interface WorkoutSession {
  id: string;
  date: string;
  bodyParts: string[];
  exercises: Exercise[];
}

export type Screen = 'home' | 'exercises' | 'summary' | 'history';
export type AppTab = 'home' | 'workout' | 'diet' | 'records' | 'settings';
