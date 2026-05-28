import { useMemo } from 'react';
import type { WorkoutSession } from '../types';
import { CUMULATIVE_PARTS } from '../constants';
import { formatDate } from '../utils/time';
import Calendar from '../components/Calendar';

interface Props {
  history: WorkoutSession[];
  deleteSession: (id: string) => void;
}

function formatVolume(kg: number): string {
  if (kg === 0) return '-';
  return `${kg.toLocaleString('ko-KR')}kg`;
}

function CumulativeBoard({ history }: { history: WorkoutSession[] }) {
  const volumes = useMemo(() => {
    const map: Record<string, number> = {};
    for (const session of history) {
      for (const ex of session.exercises) {
        if (ex.weight > 0) {
          map[ex.bodyPart] = (map[ex.bodyPart] ?? 0) + ex.weight * ex.sets * ex.repsPerSet;
        }
      }
    }
    return map;
  }, [history]);

  const total = CUMULATIVE_PARTS.reduce((sum, p) => sum + (volumes[p] ?? 0), 0);

  return (
    <div>
      {/* 전체 합계 */}
      <div className="flex items-baseline gap-2 mb-3">
        <span className="text-zinc-50 text-2xl font-bold font-mono leading-none">
          {formatVolume(total)}
        </span>
        <span className="text-zinc-500 text-xs font-sans">전체 누적 볼륨</span>
      </div>

      {/* 부위별 그리드 */}
      <div className="grid grid-cols-3 gap-2">
        {CUMULATIVE_PARTS.map(part => {
          const vol = volumes[part] ?? 0;
          return (
            <div
              key={part}
              className="bg-zinc-900 border border-zinc-800/60 rounded-2xl p-3"
            >
              <p className="text-zinc-500 text-xs font-sans mb-1.5">{part}</p>
              <p className={[
                'font-mono font-bold text-sm leading-none',
                vol > 0 ? 'text-zinc-50' : 'text-zinc-700',
              ].join(' ')}>
                {formatVolume(vol)}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function HomeTab({ history, deleteSession }: Props) {
  const today = new Date();

  return (
    <div className="flex flex-col min-h-full">
      {/* 날짜 헤더 */}
      <div className="px-5 pt-10 pb-4">
        <p className="text-zinc-500 text-xs font-sans mb-0.5">오늘</p>
        <h1 className="text-zinc-50 text-xl font-bold font-sans leading-tight">
          {formatDate(today)}
        </h1>
      </div>

      {/* 캘린더 */}
      <div className="px-4 pb-5">
        <Calendar history={history} deleteSession={deleteSession} />
      </div>

      {/* 구분선 */}
      <div className="mx-5 border-t border-zinc-800/60 mb-5" />

      {/* 누적 kg 보드 */}
      <div className="px-5 pb-10">
        <div className="flex items-center gap-2 mb-4">
          <p className="text-zinc-400 text-xs font-sans uppercase tracking-wide font-semibold">
            누적 kg
          </p>
          <span className="text-zinc-700 text-xs font-sans">
            (무게 × 세트 × 횟수)
          </span>
        </div>
        {history.length === 0 ? (
          <div className="bg-zinc-900 border border-zinc-800/60 rounded-2xl p-6 text-center">
            <p className="text-zinc-600 text-sm font-sans">
              운동을 완료하면 볼륨이 쌓여요
            </p>
          </div>
        ) : (
          <CumulativeBoard history={history} />
        )}
      </div>
    </div>
  );
}
