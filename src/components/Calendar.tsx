import { useState, useMemo } from 'react';
import type { WorkoutSession } from '../types';
import { formatTime } from '../utils/time';

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'] as const;

interface Props {
  history: WorkoutSession[];
  deleteSession: (id: string) => void;
}

function toDateStr(y: number, m: number, d: number): string {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

export default function Calendar({ history, deleteSession }: Props) {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  // date → sessions 맵
  const sessionsByDate = useMemo(() => {
    const map = new Map<string, WorkoutSession[]>();
    for (const s of history) {
      const arr = map.get(s.date) ?? [];
      arr.push(s);
      map.set(s.date, arr);
    }
    return map;
  }, [history]);

  // 이번 달 운동 횟수
  const monthlyCount = useMemo(() => {
    const prefix = `${year}-${String(month + 1).padStart(2, '0')}`;
    return history.filter(s => s.date.startsWith(prefix)).length;
  }, [history, year, month]);

  // 달력 그리드 생성
  const firstDow = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array<null>(firstDow).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const todayStr = toDateStr(now.getFullYear(), now.getMonth(), now.getDate());

  const goToPrev = () => {
    setSelectedDate(null);
    if (month === 0) { setYear(y => y - 1); setMonth(11); }
    else setMonth(m => m - 1);
  };
  const goToNext = () => {
    setSelectedDate(null);
    if (month === 11) { setYear(y => y + 1); setMonth(0); }
    else setMonth(m => m + 1);
  };

  const handleDayClick = (day: number) => {
    const dateStr = toDateStr(year, month, day);
    if (!sessionsByDate.has(dateStr)) return;
    setSelectedDate(prev => prev === dateStr ? null : dateStr);
  };

  const selectedSessions = selectedDate ? (sessionsByDate.get(selectedDate) ?? []) : [];

  return (
    <div>
      {/* 월 네비게이션 */}
      <div className="flex items-center gap-2 mb-3">
        <button
          onClick={goToPrev}
          className="w-8 h-8 flex items-center justify-center text-zinc-500 hover:text-zinc-50 transition-colors rounded-lg"
          aria-label="이전 달"
        >
          ←
        </button>
        <span className="flex-1 text-center text-zinc-50 font-semibold font-sans text-sm">
          {year}년 {month + 1}월
        </span>
        {monthlyCount > 0 && (
          <span className="text-xs text-lime-400 bg-lime-400/10 px-2 py-0.5 rounded-full font-sans shrink-0">
            {monthlyCount}회
          </span>
        )}
        <button
          onClick={goToNext}
          className="w-8 h-8 flex items-center justify-center text-zinc-500 hover:text-zinc-50 transition-colors rounded-lg"
          aria-label="다음 달"
        >
          →
        </button>
      </div>

      {/* 요일 헤더 */}
      <div className="grid grid-cols-7 mb-1">
        {WEEKDAYS.map((d, i) => (
          <p
            key={d}
            className={[
              'text-center text-xs py-1 font-sans font-medium',
              i === 0 ? 'text-red-400' : i === 6 ? 'text-blue-400' : 'text-zinc-600',
            ].join(' ')}
          >
            {d}
          </p>
        ))}
      </div>

      {/* 날짜 그리드 */}
      <div className="grid grid-cols-7 gap-y-0.5">
        {cells.map((day, idx) => {
          if (!day) return <div key={idx} className="h-10" />;

          const dateStr = toDateStr(year, month, day);
          const isToday = dateStr === todayStr;
          const hasWorkout = sessionsByDate.has(dateStr);
          const isSelected = selectedDate === dateStr;
          const dow = idx % 7;

          return (
            <button
              key={idx}
              onClick={() => handleDayClick(day)}
              disabled={!hasWorkout}
              className={[
                'relative flex flex-col items-center justify-center h-10 rounded-xl transition-all duration-150',
                isSelected ? 'bg-lime-400/15' : '',
                hasWorkout && !isSelected ? 'active:bg-zinc-800' : '',
              ].filter(Boolean).join(' ')}
            >
              {/* 날짜 숫자 */}
              {isToday ? (
                <span className="w-7 h-7 flex items-center justify-center rounded-full bg-lime-400 text-zinc-950 font-bold text-sm font-sans leading-none">
                  {day}
                </span>
              ) : (
                <span
                  className={[
                    'text-sm font-sans leading-none',
                    hasWorkout ? 'text-zinc-50 font-medium' : '',
                    !hasWorkout && dow === 0 ? 'text-red-400/40' : '',
                    !hasWorkout && dow === 6 ? 'text-blue-400/40' : '',
                    !hasWorkout && dow !== 0 && dow !== 6 ? 'text-zinc-700' : '',
                  ].filter(Boolean).join(' ')}
                >
                  {day}
                </span>
              )}

              {/* 운동한 날 라임 점 */}
              {hasWorkout && !isToday && (
                <span className="absolute bottom-1 w-1 h-1 rounded-full bg-lime-400" />
              )}
              {/* 오늘이 운동한 날이면 어두운 점 */}
              {hasWorkout && isToday && (
                <span className="absolute bottom-1 w-1 h-1 rounded-full bg-zinc-950" />
              )}
            </button>
          );
        })}
      </div>

      {/* 선택한 날 운동 내역 */}
      {selectedSessions.length > 0 && (
        <div className="mt-3 bg-zinc-900/80 border border-zinc-800/60 rounded-2xl overflow-hidden">
          {selectedSessions.map((session, si) => (
            <div
              key={session.id}
              className={[
                'p-4',
                si > 0 ? 'border-t border-zinc-800' : '',
              ].join(' ')}
            >
              {/* 부위 뱃지 + 시간 + 삭제 */}
              <div className="flex items-start gap-2 mb-2.5">
                <div className="flex gap-1 flex-wrap flex-1 min-w-0">
                  {session.bodyParts.map(p => (
                    <span
                      key={p}
                      className="text-xs bg-lime-400/10 text-lime-400 px-2 py-0.5 rounded-full font-sans shrink-0"
                    >
                      {p}
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-zinc-400 font-mono text-xs">
                    {formatTime(session.totalDuration)}
                  </span>
                  {/* 삭제 버튼 / 확인 */}
                  {confirmingId !== session.id ? (
                    <button
                      onClick={() => setConfirmingId(session.id)}
                      className="w-6 h-6 flex items-center justify-center text-zinc-600 hover:text-red-400 transition-colors rounded"
                      aria-label="삭제"
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
                        <path d="M10 11v6M14 11v6" />
                        <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
                      </svg>
                    </button>
                  ) : (
                    <div className="flex gap-1">
                      <button
                        onClick={() => setConfirmingId(null)}
                        className="text-zinc-500 text-xs font-sans px-2 py-0.5 rounded bg-zinc-800"
                      >
                        취소
                      </button>
                      <button
                        onClick={() => {
                          deleteSession(session.id);
                          setSelectedDate(null);
                          setConfirmingId(null);
                        }}
                        className="text-red-400 text-xs font-sans px-2 py-0.5 rounded bg-red-400/10"
                      >
                        삭제
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* 운동 목록 */}
              <div className="space-y-1.5">
                {session.exercises.map(ex => (
                  <div key={ex.id} className="flex items-baseline justify-between gap-2">
                    <span className="text-zinc-300 text-xs font-sans truncate">
                      {ex.name || '이름 없음'}
                    </span>
                    <span className="text-zinc-500 text-xs font-mono shrink-0">
                      {ex.weight > 0 ? `${ex.weight}kg  ` : ''}{ex.sets}×{ex.repsPerSet}
                    </span>
                  </div>
                ))}
                {session.exercises.length === 0 && (
                  <p className="text-zinc-600 text-xs font-sans">기록된 운동 없음</p>
                )}
              </div>

              {/* 간단 통계 */}
              {session.lapLog.filter(l => l.type === 'rest_start').length > 0 && (
                <div className="flex gap-3 mt-2.5 pt-2.5 border-t border-zinc-800">
                  <span className="text-zinc-600 text-xs font-sans">
                    휴식 {session.lapLog.filter(l => l.type === 'rest_start').length}회
                  </span>
                  <span className="text-zinc-600 text-xs font-sans">
                    평균운동 {formatTime(session.avgWorkTime)}
                  </span>
                  <span className="text-zinc-600 text-xs font-sans">
                    평균휴식 {formatTime(session.avgRestTime)}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
