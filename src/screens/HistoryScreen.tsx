import { useState } from 'react';
import type { WorkoutSession, Screen } from '../types';
import { formatTime, formatDateShort } from '../utils/time';

interface Props {
  history: WorkoutSession[];
  completedSession: WorkoutSession | null;
  setScreen: (screen: Screen) => void;
  deleteSession: (id: string) => void;
}

function TrashIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
    </svg>
  );
}

function SessionCard({
  session,
  onDelete,
}: {
  session: WorkoutSession;
  onDelete: () => void;
}) {
  const [confirming, setConfirming] = useState(false);
  const restCount = session.lapLog.filter(l => l.type === 'rest_start').length;

  return (
    <div className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800/60">
      {/* 헤더 */}
      <div className="flex justify-between items-start mb-3">
        <div>
          <p className="text-zinc-50 font-semibold font-sans text-sm">
            {formatDateShort(session.date)}
          </p>
          <p className="text-zinc-500 text-xs font-sans mt-0.5">
            {session.bodyParts.join(' · ')}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="font-mono text-lime-400 text-sm bg-lime-400/10 px-2 py-1 rounded-lg">
            {formatTime(session.totalDuration)}
          </span>

          {/* 삭제 버튼 / 확인 */}
          {!confirming ? (
            <button
              onClick={() => setConfirming(true)}
              className="w-7 h-7 flex items-center justify-center text-zinc-600 hover:text-red-400 transition-colors rounded-lg hover:bg-red-400/10"
              aria-label="삭제"
            >
              <TrashIcon />
            </button>
          ) : (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setConfirming(false)}
                className="text-zinc-400 text-xs font-sans px-2.5 py-1 rounded-lg bg-zinc-800"
              >
                취소
              </button>
              <button
                onClick={onDelete}
                className="text-red-400 text-xs font-sans px-2.5 py-1 rounded-lg bg-red-400/10 border border-red-400/20"
              >
                삭제
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 운동 태그 */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {session.exercises.map(ex => (
          <span key={ex.id} className="text-xs bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-lg font-sans">
            {ex.name || '이름 없음'} {ex.weight > 0 ? `${ex.weight}kg` : ''} {ex.sets}×{ex.repsPerSet}
          </span>
        ))}
      </div>

      {/* 간단 통계 */}
      <div className="flex gap-4 text-xs text-zinc-600 font-sans">
        <span>휴식 {restCount}회</span>
        <span>평균 운동 {formatTime(session.avgWorkTime)}</span>
        <span>평균 휴식 {formatTime(session.avgRestTime)}</span>
      </div>
    </div>
  );
}

export default function HistoryScreen({
  history,
  completedSession,
  setScreen,
  deleteSession,
}: Props) {
  const handleBack = () => {
    if (completedSession) setScreen('summary');
    else setScreen('home');
  };

  return (
    <div className="flex flex-col min-h-full">
      {/* 헤더 */}
      <div className="px-5 pt-14 pb-4 flex items-center gap-3 border-b border-zinc-800/60">
        <button
          onClick={handleBack}
          className="w-9 h-9 flex items-center justify-center text-zinc-400 hover:text-zinc-50 transition-colors"
        >
          ←
        </button>
        <h1 className="text-zinc-50 text-lg font-bold font-sans">운동 기록</h1>
        <span className="text-zinc-600 text-sm font-sans ml-auto">{history.length}개</span>
      </div>

      {/* 목록 */}
      <div className="flex-1 overflow-y-auto px-5 py-4">
        {history.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-60 text-center">
            <div className="w-16 h-16 rounded-full bg-zinc-900 flex items-center justify-center mb-4 border border-zinc-800">
              <span className="text-2xl text-zinc-700">—</span>
            </div>
            <p className="text-zinc-500 text-sm font-sans">아직 운동 기록이 없어요</p>
            <p className="text-zinc-700 text-xs font-sans mt-1">첫 운동을 시작해보세요!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {history.map(session => (
              <SessionCard
                key={session.id}
                session={session}
                onDelete={() => deleteSession(session.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
