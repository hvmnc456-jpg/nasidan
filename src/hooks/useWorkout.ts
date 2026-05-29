import { useState, useCallback } from 'react';
import type { Screen, Exercise, SetEntry, LapEntry, WorkoutSession } from '../types';
import { todayString } from '../utils/time';

function genId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function defaultSets(count = 3): SetEntry[] {
  return Array.from({ length: count }, () => ({ weight: 0, reps: 10 }));
}

function migrateExercise(raw: Record<string, unknown>): Exercise {
  if (typeof raw.sets === 'number') {
    const count = raw.sets as number;
    const w = (raw.weight as number) || 0;
    const r = (raw.repsPerSet as number) || 0;
    return {
      id: raw.id as string,
      bodyPart: raw.bodyPart as string,
      name: (raw.name as string) || '',
      sets: Array.from({ length: count }, () => ({ weight: w, reps: r })),
    };
  }
  return raw as unknown as Exercise;
}

function loadHistory(): WorkoutSession[] {
  try {
    const raw = localStorage.getItem('workout-history');
    if (!raw) return [];
    const sessions = JSON.parse(raw) as WorkoutSession[];
    return sessions.map(s => ({
      ...s,
      exercises: s.exercises.map(e => migrateExercise(e as unknown as Record<string, unknown>)),
    }));
  } catch {
    return [];
  }
}

function saveSession(session: WorkoutSession): void {
  const history = loadHistory();
  localStorage.setItem('workout-history', JSON.stringify([session, ...history]));
}

function calcStats(lapLog: LapEntry[]): { avgWorkTime: number; avgRestTime: number } {
  let totalWork = 0, totalRest = 0, workCount = 0, restCount = 0;
  for (let i = 0; i < lapLog.length - 1; i++) {
    const cur = lapLog[i], next = lapLog[i + 1];
    if (!cur || !next) continue;
    const dur = next.timestamp - cur.timestamp;
    if (cur.type === 'workout_start' || cur.type === 'workout_resume') { totalWork += dur; workCount++; }
    else if (cur.type === 'rest_start') { totalRest += dur; restCount++; }
  }
  return {
    avgWorkTime: workCount > 0 ? Math.round(totalWork / workCount) : 0,
    avgRestTime: restCount > 0 ? Math.round(totalRest / restCount) : 0,
  };
}

export function useWorkout() {
  const [screen, setScreen] = useState<Screen>('home');
  const [selectedBodyParts, setSelectedBodyParts] = useState<string[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [completedSession, setCompletedSession] = useState<WorkoutSession | null>(null);
  const [history, setHistory] = useState<WorkoutSession[]>(() => loadHistory());

  const toggleBodyPart = useCallback((part: string) => {
    setSelectedBodyParts(prev =>
      prev.includes(part) ? prev.filter(p => p !== part) : [...prev, part]
    );
  }, []);

  const goToExercises = useCallback(() => setScreen('exercises'), []);

  const addExercise = useCallback((bodyPart: string) => {
    setExercises(prev => [
      ...prev,
      { id: genId(), bodyPart, name: '', sets: defaultSets(3) },
    ]);
  }, []);

  const updateExerciseName = useCallback((id: string, name: string) => {
    setExercises(prev => prev.map(ex => ex.id === id ? { ...ex, name } : ex));
  }, []);

  const removeExercise = useCallback((id: string) => {
    setExercises(prev => prev.filter(ex => ex.id !== id));
  }, []);

  const addSet = useCallback((exerciseId: string) => {
    setExercises(prev => prev.map(ex => {
      if (ex.id !== exerciseId) return ex;
      const last = ex.sets[ex.sets.length - 1];
      return { ...ex, sets: [...ex.sets, { weight: last?.weight ?? 0, reps: last?.reps ?? 10 }] };
    }));
  }, []);

  const removeSet = useCallback((exerciseId: string, setIndex: number) => {
    setExercises(prev => prev.map(ex => {
      if (ex.id !== exerciseId || ex.sets.length <= 1) return ex;
      return { ...ex, sets: ex.sets.filter((_, i) => i !== setIndex) };
    }));
  }, []);

  const updateSet = useCallback((exerciseId: string, setIndex: number, field: 'weight' | 'reps', value: number) => {
    setExercises(prev => prev.map(ex => {
      if (ex.id !== exerciseId) return ex;
      return { ...ex, sets: ex.sets.map((s, i) => i === setIndex ? { ...s, [field]: value } : s) };
    }));
  }, []);

  // 운동별 타이머 완료 시 호출 → exercise에 시간/랩 저장
  const updateExerciseTimer = useCallback((id: string, duration: number, lapLog: LapEntry[]) => {
    setExercises(prev => prev.map(ex =>
      ex.id === id ? { ...ex, timerDuration: duration, timerLapLog: lapLog } : ex
    ));
  }, []);

  // 전체 운동 완료 — 각 운동의 타이머 데이터를 집계해 세션 저장
  const completeWorkout = useCallback(() => {
    const allLapLogs: LapEntry[] = [];
    exercises.forEach(e => { if (e.timerLapLog?.length) allLapLogs.push(...e.timerLapLog); });

    const totalDuration = exercises.reduce((sum, e) => sum + (e.timerDuration ?? 0), 0);
    const stats = calcStats(allLapLogs);

    const session: WorkoutSession = {
      id: genId(),
      date: todayString(),
      bodyParts: selectedBodyParts,
      exercises,
      lapLog: allLapLogs,
      totalDuration,
      avgWorkTime: stats.avgWorkTime,
      avgRestTime: stats.avgRestTime,
    };

    saveSession(session);
    setCompletedSession(session);
    setHistory(loadHistory());
    setScreen('summary');
  }, [selectedBodyParts, exercises]);

  const resetWorkout = useCallback(() => {
    setScreen('home');
    setSelectedBodyParts([]);
    setExercises([]);
    setCompletedSession(null);
  }, []);

  const deleteSession = useCallback((id: string) => {
    const updated = loadHistory().filter(s => s.id !== id);
    localStorage.setItem('workout-history', JSON.stringify(updated));
    setHistory(updated);
    setCompletedSession(prev => (prev?.id === id ? null : prev));
  }, []);

  return {
    screen, setScreen,
    selectedBodyParts, toggleBodyPart,
    exercises,
    addExercise, updateExerciseName, removeExercise,
    addSet, removeSet, updateSet,
    updateExerciseTimer,
    completedSession, history,
    goToExercises, completeWorkout,
    resetWorkout, deleteSession,
  };
}
