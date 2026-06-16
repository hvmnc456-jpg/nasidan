import { useState, useMemo } from 'react';
import type { WorkoutSession } from '../types';

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'] as const;

interface Props {
  history: WorkoutSession[];
  deleteSession: (id: string) => void;
}

function toDateStr(y: number, m: number, d: number): string {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

function SessionCard({ session, onDelete }: { session: WorkoutSession; onDelete: (id: string) => void }) {
  const [confirming, setConfirming] = useState(false);
  const totalVol = session.exercises.reduce((sum, e) => sum + e.sets.reduce((s2, s) => s2 + (s.weight || 0) * (s.reps || 0), 0), 0);

  return (
    <div className="card slide-down" style={{ marginBottom: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {session.bodyParts.map(p => (
            <span key={p} className="pill pill-lime">{p}</span>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {!confirming ? (
            <button className="btn-icon" onClick={() => setConfirming(true)}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                <path d="M10 11v6M14 11v6"/>
                <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
              </svg>
            </button>
          ) : (
            <div style={{ display: 'flex', gap: 4 }}>
              <button className="btn btn-sm btn-ghost" onClick={() => setConfirming(false)}>취소</button>
              <button className="btn btn-sm btn-red" onClick={() => onDelete(session.id)}>삭제</button>
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {session.exercises.map(e => (
          <div key={e.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)' }}>{e.name || '이름 없음'}</span>
            <span className="pill pill-dark">{e.sets.length}세트</span>
          </div>
        ))}
      </div>

      {totalVol > 0 && (
        <div style={{ marginTop: 12, paddingTop: 10, borderTop: '1px solid var(--border-2)', display: 'flex' }}>
          <span style={{ fontSize: 13, color: 'var(--lime)', fontWeight: 700, marginLeft: 'auto' }}>
            {totalVol.toLocaleString('ko-KR')}kg
          </span>
        </div>
      )}
    </div>
  );
}

export default function Calendar({ history, deleteSession }: Props) {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const sessionsByDate = useMemo(() => {
    const map = new Map<string, WorkoutSession[]>();
    for (const s of history) {
      const arr = map.get(s.date) ?? [];
      arr.push(s);
      map.set(s.date, arr);
    }
    return map;
  }, [history]);

  const monthlyCount = useMemo(() => {
    const prefix = `${year}-${String(month + 1).padStart(2, '0')}`;
    const seen = new Set<string>();
    history.forEach(s => { if (s.date.startsWith(prefix)) seen.add(s.date); });
    return seen.size;
  }, [history, year, month]);

  const firstDow = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array<null>(firstDow).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

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
    const ds = toDateStr(year, month, day);
    if (!sessionsByDate.has(ds)) return;
    setSelectedDate(prev => prev === ds ? null : ds);
  };

  const selectedSessions = selectedDate ? (sessionsByDate.get(selectedDate) ?? []) : [];

  return (
    <div>
      {/* 캘린더 카드 */}
      <div className="card" style={{ marginBottom: 12 }}>
        {/* 월 네비게이션 */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <button className="btn-icon" onClick={goToPrev} aria-label="이전 달">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontWeight: 700, fontSize: 15 }}>{year}년 {month + 1}월</span>
            {monthlyCount > 0 && <span className="pill pill-lime">{monthlyCount}회</span>}
          </div>
          <button className="btn-icon" onClick={goToNext} aria-label="다음 달">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </button>
        </div>

        {/* 요일 헤더 */}
        <div className="cal-grid" style={{ marginBottom: 4 }}>
          {WEEKDAYS.map((d, i) => (
            <div key={d} className="cal-head-cell" style={{
              color: i === 0 ? '#f87171' : i === 6 ? '#93c5fd' : 'var(--text-3)',
            }}>
              {d}
            </div>
          ))}
        </div>

        {/* 날짜 그리드 */}
        <div className="cal-grid">
          {cells.map((day, idx) => {
            if (!day) return <div key={`e-${idx}`} />;
            const ds = toDateStr(year, month, day);
            const isToday = ds === todayStr;
            const hasWorkout = sessionsByDate.has(ds);
            const isSelected = ds === selectedDate;
            return (
              <div
                key={day}
                className={[
                  'cal-cell',
                  hasWorkout ? 'has-workout' : '',
                  isToday ? 'is-today' : '',
                  isSelected && !isToday ? 'is-selected' : '',
                ].filter(Boolean).join(' ')}
                onClick={() => handleDayClick(day)}
              >
                <span style={{ fontSize: 14, fontWeight: isToday ? 700 : hasWorkout ? 600 : 400 }}>{day}</span>
                {hasWorkout && !isToday && <div className="dot" />}
              </div>
            );
          })}
        </div>
      </div>

      {/* 날짜 상세 드로워 */}
      {selectedDate && selectedSessions.length > 0 && (
        <div key={selectedDate} style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-2)', marginBottom: 10, paddingLeft: 2 }}>
            {(() => {
              const [y, m, d] = selectedDate.split('-').map(Number);
              const dow = WEEKDAYS[new Date(y, m - 1, d).getDay()];
              return `${y}년 ${m}월 ${d}일 (${dow})`;
            })()}
          </div>
          {selectedSessions.map(s => (
            <SessionCard
              key={s.id}
              session={s}
              onDelete={(id) => { deleteSession(id); setSelectedDate(null); }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
