import { useRef, useEffect } from 'react';
import type { LapEntry, WorkoutStatus, Exercise } from '../types';
import { formatTime } from '../utils/time';

interface Props {
  elapsedSeconds: number;
  status: WorkoutStatus;
  lapLog: LapEntry[];
  selectedBodyParts: string[];
  exercises: Exercise[];
  startRest: () => void;
  resumeWorkout: () => void;
  completeWorkout: () => void;
}

const LAP_LABELS: Record<LapEntry['type'], { label: string; color: string }> = {
  workout_start:  { label: '운동 시작', color: 'var(--lime)'   },
  rest_start:     { label: '휴식 시작', color: 'var(--amber)'  },
  workout_resume: { label: '운동 재개', color: 'var(--lime)'   },
  complete:       { label: '운동 완료', color: 'var(--text-2)' },
};

function formatDurShort(secs: number): string {
  if (secs <= 0) return '0초';
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  if (m > 0) return `${m}분 ${s}초`;
  return `${s}초`;
}

export default function TimerScreen({
  elapsedSeconds,
  status,
  lapLog,
  selectedBodyParts,
  exercises,
  startRest,
  resumeWorkout,
  completeWorkout,
}: Props) {
  const lapScrollRef = useRef<HTMLDivElement>(null);
  const isWorking = status === 'working';

  useEffect(() => {
    if (lapScrollRef.current) {
      lapScrollRef.current.scrollTop = lapScrollRef.current.scrollHeight;
    }
  }, [lapLog.length, elapsedSeconds]);

  const namedExercises = exercises.filter(e => e.name);

  return (
    <div className="screen animate-fade-in" style={{ display: 'flex', flexDirection: 'column', minHeight: '100%', paddingBottom: 16 }}>

      {/* Status badge + body parts */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 32, flexWrap: 'wrap' }}>
        <div
          className="blink"
          style={{ width: 8, height: 8, borderRadius: '50%', background: isWorking ? 'var(--lime)' : 'var(--amber)', flexShrink: 0 }}
        />
        <span className={`pill ${isWorking ? 'pill-lime' : 'pill-amber'}`} style={{ fontSize: 14 }}>
          {isWorking ? '운동 중' : '휴식 중'}
        </span>
        {selectedBodyParts.map(p => (
          <span key={p} className="pill pill-dark" style={{ fontSize: 12 }}>{p}</span>
        ))}
      </div>

      {/* Timer display */}
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <div className={`timer-display ${isWorking ? 'timer-working' : 'timer-resting'}`}>
          {formatTime(elapsedSeconds)}
        </div>
      </div>

      {/* Lap log */}
      <div
        ref={lapScrollRef}
        className="card"
        style={{ flex: 1, minHeight: 160, maxHeight: 220, overflowY: 'auto', marginBottom: 20, padding: '8px 16px' }}
      >
        {lapLog.map((entry, i) => {
          const next = lapLog[i + 1];
          const dur = next
            ? next.timestamp - entry.timestamp
            : elapsedSeconds - entry.timestamp;
          const meta = LAP_LABELS[entry.type] ?? { label: entry.type, color: 'var(--text-2)' };
          return (
            <div key={i} className="lap-row">
              <span className="lap-ts">{formatTime(entry.timestamp)}</span>
              <span className="lap-type" style={{ color: meta.color }}>{meta.label}</span>
              {i > 0 && <span className="lap-dur">+{formatDurShort(dur)}</span>}
            </div>
          );
        })}
        {/* Live current interval */}
        <div className="lap-row" style={{ opacity: 0.4, borderBottom: 'none' }}>
          <span className="lap-ts" style={{ color: isWorking ? 'var(--lime)' : 'var(--amber)' }}>
            {formatTime(elapsedSeconds)}
          </span>
          <span className="lap-type" style={{ color: isWorking ? 'var(--lime)' : 'var(--amber)', fontStyle: 'italic' }}>
            {isWorking ? '운동 중...' : '휴식 중...'}
          </span>
        </div>
      </div>

      {/* Today's exercises */}
      {namedExercises.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <div className="section-label">오늘의 운동</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {namedExercises.map(e => (
              <span key={e.id} className="pill pill-dark" style={{ fontSize: 13 }}>
                {e.name}{e.weight > 0 ? ` ${e.weight}kg` : ''} {e.sets}×{e.repsPerSet}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {isWorking ? (
          <button className="btn btn-full btn-dark" onClick={startRest} style={{ fontSize: 16 }}>
            휴식
          </button>
        ) : (
          <button className="btn btn-full btn-amber" onClick={resumeWorkout} style={{ fontSize: 16 }}>
            운동 재개
          </button>
        )}
        <button className="btn btn-full btn-lime" onClick={completeWorkout}>
          운동 완료
        </button>
      </div>
    </div>
  );
}
