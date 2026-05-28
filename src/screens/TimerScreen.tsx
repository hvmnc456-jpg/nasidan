import { useRef, useEffect } from 'react';
import type { LapEntry, WorkoutStatus } from '../types';
import { formatTime } from '../utils/time';

interface Props {
  elapsedSeconds: number;
  status: WorkoutStatus;
  lapLog: LapEntry[];
  startRest: () => void;
  resumeWorkout: () => void;
  completeWorkout: () => void;
}

const LAP_LABELS: Record<LapEntry['type'], string> = {
  workout_start: '운동 시작',
  rest_start: '휴식 시작',
  workout_resume: '운동 재개',
  complete: '운동 완료',
};

const PREV_SEGMENT_LABEL: Partial<Record<LapEntry['type'], string>> = {
  rest_start: '운동 ',
  workout_resume: '휴식 ',
  complete: '운동 ',
};

export default function TimerScreen({ elapsedSeconds, status, lapLog, startRest, resumeWorkout, completeWorkout }: Props) {
  const logRef = useRef<HTMLDivElement>(null);
  const isWorking = status === 'working';

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [lapLog.length]);

  return (
    <div className="flex flex-col min-h-full p-5 pb-8">
      {/* Status badge */}
      <div className="pt-14 flex justify-center">
        <span
          className={[
            'inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold font-sans',
            isWorking
              ? 'bg-lime-400/10 text-lime-400'
              : 'bg-amber-400/10 text-amber-400',
          ].join(' ')}
        >
          <span
            className={[
              'w-2 h-2 rounded-full animate-pulse',
              isWorking ? 'bg-lime-400' : 'bg-amber-400',
            ].join(' ')}
          />
          {isWorking ? '운동 중' : '휴식 중'}
        </span>
      </div>

      {/* Timer display */}
      <div className="flex-1 flex items-center justify-center">
        <span
          className={[
            'font-mono font-bold tracking-tighter leading-none',
            'text-[clamp(56px,16vw,80px)]',
            isWorking ? 'text-lime-400' : 'text-amber-400',
          ].join(' ')}
        >
          {formatTime(elapsedSeconds)}
        </span>
      </div>

      {/* Lap log */}
      <div ref={logRef} className="h-44 overflow-y-auto mb-5">
        {lapLog.map((entry, i) => {
          const prev = i > 0 ? lapLog[i - 1] : null;
          const duration = prev ? entry.timestamp - prev.timestamp : null;
          const segLabel = prev ? PREV_SEGMENT_LABEL[entry.type] : null;
          const isRest = entry.type === 'rest_start';

          return (
            <div
              key={i}
              className="flex items-center gap-2 py-1.5 border-b border-zinc-800/50 last:border-0"
            >
              <span className="font-mono text-zinc-600 text-xs w-20 shrink-0">
                {formatTime(entry.timestamp)}
              </span>
              <span
                className={[
                  'text-xs font-sans flex-1',
                  isRest ? 'text-amber-400' : 'text-lime-400',
                ].join(' ')}
              >
                {LAP_LABELS[entry.type]}
              </span>
              {duration !== null && segLabel != null && (
                <span className="font-mono text-zinc-600 text-xs shrink-0">
                  ({segLabel}{formatTime(duration)})
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Buttons */}
      <div className="space-y-3">
        {isWorking ? (
          <button
            onClick={startRest}
            className="w-full h-14 rounded-2xl bg-zinc-800 text-zinc-50 text-base font-bold font-sans active:scale-95 transition-all"
          >
            휴식
          </button>
        ) : (
          <button
            onClick={resumeWorkout}
            className="w-full h-14 rounded-2xl bg-amber-400 text-zinc-950 text-base font-bold font-sans active:scale-95 transition-all shadow-lg shadow-amber-400/20"
          >
            운동 재개
          </button>
        )}
        <button
          onClick={completeWorkout}
          className="w-full h-14 rounded-2xl bg-lime-400 text-zinc-950 text-base font-bold font-sans active:scale-95 transition-all shadow-lg shadow-lime-400/20"
        >
          운동 완료
        </button>
      </div>
    </div>
  );
}
