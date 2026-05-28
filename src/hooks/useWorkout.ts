import { useState, useEffect, useCallback, useRef } from 'react';
import type { Screen, Exercise, LapEntry, WorkoutSession, WorkoutStatus } from '../types';
import { todayString } from '../utils/time';

function genId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function loadHistory(): WorkoutSession[] {
  try {
    const raw = localStorage.getItem('workout-history');
    return raw ? (JSON.parse(raw) as WorkoutSession[]) : [];
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
    const cur = lapLog[i];
    const next = lapLog[i + 1];
    if (!cur || !next) continue;
    const dur = next.timestamp - cur.timestamp;
    if (cur.type === 'workout_start' || cur.type === 'workout_resume') {
      totalWork += dur;
      workCount++;
    } else if (cur.type === 'rest_start') {
      totalRest += dur;
      restCount++;
    }
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
  const [lapLog, setLapLog] = useState<LapEntry[]>([]);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [status, setStatus] = useState<WorkoutStatus>('idle');
  const [completedSession, setCompletedSession] = useState<WorkoutSession | null>(null);
  const [history, setHistory] = useState<WorkoutSession[]>(() => loadHistory());

  const startTimeRef = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lapLogRef = useRef<LapEntry[]>([]);

  useEffect(() => {
    if (status === 'working' || status === 'resting') {
      intervalRef.current = setInterval(() => {
        setElapsedSeconds(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }, 100);
    } else {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [status]);

  const toggleBodyPart = useCallback((part: string) => {
    setSelectedBodyParts(prev =>
      prev.includes(part) ? prev.filter(p => p !== part) : [...prev, part]
    );
  }, []);

  const goToExercises = useCallback(() => setScreen('exercises'), []);

  const addExercise = useCallback((bodyPart: string) => {
    setExercises(prev => [
      ...prev,
      { id: genId(), bodyPart, name: '', weight: 0, sets: 3, repsPerSet: 10 },
    ]);
  }, []);

  const updateExercise = useCallback((
    id: string,
    field: 'name' | 'weight' | 'sets' | 'repsPerSet',
    value: string | number,
  ) => {
    setExercises(prev =>
      prev.map(ex => ex.id === id ? { ...ex, [field]: value } : ex)
    );
  }, []);

  const removeExercise = useCallback((id: string) => {
    setExercises(prev => prev.filter(ex => ex.id !== id));
  }, []);

  const startWorkout = useCallback(() => {
    startTimeRef.current = Date.now();
    setElapsedSeconds(0);
    const initial: LapEntry[] = [{ timestamp: 0, type: 'workout_start' }];
    lapLogRef.current = initial;
    setLapLog(initial);
    setStatus('working');
    setScreen('timer');
  }, []);

  const startRest = useCallback(() => {
    const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
    const entry: LapEntry = { timestamp: elapsed, type: 'rest_start' };
    const updated = [...lapLogRef.current, entry];
    lapLogRef.current = updated;
    setLapLog(updated);
    setStatus('resting');
  }, []);

  const resumeWorkout = useCallback(() => {
    const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
    const entry: LapEntry = { timestamp: elapsed, type: 'workout_resume' };
    const updated = [...lapLogRef.current, entry];
    lapLogRef.current = updated;
    setLapLog(updated);
    setStatus('working');
  }, []);

  const completeWorkout = useCallback(() => {
    const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
    const entry: LapEntry = { timestamp: elapsed, type: 'complete' };
    const finalLog = [...lapLogRef.current, entry];
    lapLogRef.current = finalLog;
    setLapLog(finalLog);

    const stats = calcStats(finalLog);
    const session: WorkoutSession = {
      id: genId(),
      date: todayString(),
      bodyParts: selectedBodyParts,
      exercises,
      lapLog: finalLog,
      totalDuration: elapsed,
      avgWorkTime: stats.avgWorkTime,
      avgRestTime: stats.avgRestTime,
    };

    saveSession(session);
    setCompletedSession(session);
    setHistory(loadHistory());
    setElapsedSeconds(elapsed);
    setStatus('completed');
    setScreen('summary');
  }, [selectedBodyParts, exercises]);

  const resetWorkout = useCallback(() => {
    lapLogRef.current = [];
    setScreen('home');
    setSelectedBodyParts([]);
    setExercises([]);
    setLapLog([]);
    setElapsedSeconds(0);
    setStatus('idle');
    setCompletedSession(null);
  }, []);

  const deleteSession = useCallback((id: string) => {
    const updated = loadHistory().filter(s => s.id !== id);
    localStorage.setItem('workout-history', JSON.stringify(updated));
    setHistory(updated);
    // 방금 완료한 운동이 삭제된 경우 요약 상태도 초기화
    setCompletedSession(prev => (prev?.id === id ? null : prev));
  }, []);

  return {
    screen, setScreen,
    selectedBodyParts, toggleBodyPart,
    exercises, addExercise, updateExercise, removeExercise,
    lapLog, elapsedSeconds, status,
    completedSession, history,
    goToExercises, startWorkout,
    startRest, resumeWorkout, completeWorkout,
    resetWorkout, deleteSession,
  };
}
