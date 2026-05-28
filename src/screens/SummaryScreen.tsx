import type { WorkoutSession, Screen } from '../types';
import { formatTime, formatDateShort } from '../utils/time';

interface Props {
  session: WorkoutSession;
  resetWorkout: () => void;
  setScreen: (screen: Screen) => void;
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800/60">
      <p className="text-zinc-500 text-xs font-sans mb-1">{label}</p>
      <p className="text-zinc-50 text-xl font-bold font-mono leading-none">{value}</p>
    </div>
  );
}

export default function SummaryScreen({ session, resetWorkout, setScreen }: Props) {
  const restCount = session.lapLog.filter(l => l.type === 'rest_start').length;

  const grouped = session.bodyParts.reduce<Record<string, typeof session.exercises>>(
    (acc, part) => {
      acc[part] = session.exercises.filter(ex => ex.bodyPart === part);
      return acc;
    },
    {},
  );

  return (
    <div className="flex flex-col min-h-full">
      <div className="flex-1 overflow-y-auto px-5 pt-14 pb-4">
        <p className="text-zinc-500 text-sm font-sans">{formatDateShort(session.date)}</p>
        <h1 className="text-zinc-50 text-2xl font-bold font-sans mt-1 mb-2">운동 완료</h1>
        <div className="flex gap-1 flex-wrap mb-6">
          {session.bodyParts.map(p => (
            <span key={p} className="text-xs bg-lime-400/10 text-lime-400 px-2 py-0.5 rounded-full font-sans">
              {p}
            </span>
          ))}
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <StatCard label="총 운동 시간" value={formatTime(session.totalDuration)} />
          <StatCard label="휴식 전환 횟수" value={`${restCount}회`} />
          <StatCard label="평균 운동 구간" value={formatTime(session.avgWorkTime)} />
          <StatCard label="평균 휴식 구간" value={formatTime(session.avgRestTime)} />
        </div>

        {/* Exercise list */}
        <h2 className="text-zinc-300 text-sm font-semibold font-sans mb-3">운동 내역</h2>
        {session.bodyParts.map(part => {
          const exList = grouped[part] ?? [];
          if (exList.length === 0) return null;
          return (
            <div key={part} className="mb-4">
              <p className="text-lime-400 text-xs font-semibold font-sans mb-2 uppercase tracking-wide">
                {part}
              </p>
              {exList.map(ex => (
                <div key={ex.id} className="bg-zinc-900 rounded-xl p-3 mb-2 flex justify-between items-center border border-zinc-800/60">
                  <div>
                    <p className="text-zinc-50 text-sm font-sans font-medium">
                      {ex.name || '이름 없음'}
                    </p>
                    <p className="text-zinc-500 text-xs font-sans mt-0.5">
                      {ex.sets}세트 × {ex.repsPerSet}회
                    </p>
                  </div>
                  <span className="text-zinc-400 text-sm font-mono bg-zinc-800 px-2 py-1 rounded-lg">
                    {ex.weight}kg
                  </span>
                </div>
              ))}
            </div>
          );
        })}
      </div>

      {/* Action buttons */}
      <div className="px-5 pb-10 pt-3 border-t border-zinc-800/60 space-y-3">
        <button
          onClick={resetWorkout}
          className="w-full h-14 rounded-2xl bg-lime-400 text-zinc-950 text-base font-bold font-sans active:scale-95 transition-all shadow-lg shadow-lime-400/20"
        >
          새 운동 시작
        </button>
        <button
          onClick={() => setScreen('history')}
          className="w-full h-14 rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-300 text-base font-bold font-sans active:scale-95 transition-all"
        >
          기록 보기
        </button>
      </div>
    </div>
  );
}
