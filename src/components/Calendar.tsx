import { useState, useMemo } from 'react';
import type { WorkoutSession } from '../types';
import { formatDuration, formatDateFull } from '../utils/time';

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'] as const;

interface Props {
  history: WorkoutSession[];
  deleteSession: (id: string) => void;
}

function toDateStr(y: number, m: number, d: number): string {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

function SessionCard({ session, onDelete }: { session: WorkoutSession; onDelete: () => void }) {
  const [confirming, setConfirming] = useState(false);
  const totalVol = session.exercises.reduce(
    (sum, e) => sum + (e.weight || 0) * (e.sets || 0) * (e.repsPerSet || 0),
    0,
  );

  return (
    <div className="card slide-down" style={{ marginBottom: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {session.bodyParts.map(p => (
            <span key={p} className="pill pill-lime">{p}</span>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span className="pill pill-dark">{formatDuration(session.totalDuration)}</span>
          {!confirming ? (
            <button className="btn-icon" onClick={() => setConfirming(true)}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                <path d="M10 11v6M14 11v6" />
                <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
              </svg>
            </button>
          ) : (
            <div style={{ display: 'flex', gap: 4 }}>
              <button className="btn btn-sm btn-ghost" onClick={() => setConfirming(false)}>취소</button>
              <button className="btn btn-sm btn-red" onClick={onDelete}>삭제</button>
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {session.exercises.map(e => (
          <div key={e.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)' }}>{e.name || '이름 없음'}</span>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <span style={{ fontSize: 13, color: 'var(--text-3)' }}>{e.sets}×{e.repsPerSet}</span>
              {e.weight > 0 && <span className="pill pill-dark">{e.weight}kg</span>}
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 12, paddingTop: 10, borderTop: '1px solid var(--border-2)', display: 'flex', gap: 12, alignItems: 'center' }}>
        <span style={{ fontSize: 12, color: 'var(--text-3)' }}>
          휴식 {session.lapLog.filter(l => l.type === 'rest_start').length}회
        </span>
        {session.avgWorkTime > 0 && (
          <span style={{ fontSize: 12, color: 'var(--text-3)' }}>
            평균 운동 {formatDuration(session.avgWorkTime)}
          </span>
        )}
        {totalVol > 0 && (
          <span style={{ fontSize: 13, color: 'var(--lime)', fontWeight: 700, marginLeft: 'auto' }}>
            {totalVol.toLocaleString()}kg
          </span>
        )}
      </div>
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
    const dateStr = toDateStr(year, month, day);
    if (!sessionsByDate.has(dateStr)) return;
    setSelectedDate(prev => prev === dateStr ? null : dateStr);
  };

  const selectedSessions = selectedDate ? (sessionsByDate.get(selectedDate) ?? []) : [];

  return (
    <div>
      <div className="card" style={{ marginBottom: 12 }}>
        {/* Month navigation */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <button className="btn-icon" onClick={goToPrev} aria-label="이전 달">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontWeight: 700, fontSize: 15 }}>{year}년 {month + 1}월</span>
            {monthlyCount > 0 && <span className="pill pill-lime">{monthlyCount}회</span>}
          </div>
          <button className="btn-icon" onClick={goToNext} aria-label="다음 달">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>

        {/* Day headers */}
        <div className="cal-grid" style={{ marginBottom: 4 }}>
          {WEEKDAYS.map((d, i) => (
            <div
              key={d}
              className="cal-head-cell"
              style={{ color: i === 0 ? '#f87171' : i === 6 ? '#93c5fd' : 'var(--text-3)' }}
            >
              {d}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div className="cal-grid">
          {cells.map((day, idx) => {
            if (!day) return <div key={`e-${idx}`} />;
            const dateStr = toDateStr(year, month, day);
            const isToday = dateStr === todayStr;
            const hasWorkout = sessionsByDate.has(dateStr);
            const isSelected = selectedDate === dateStr;

            return (
              <div
                key={idx}
                className={[
                  'cal-cell',
                  hasWorkout ? 'has-workout' : '',
                  isToday ? 'is-today' : '',
                  isSelected && !isToday ? 'is-selected' : '',
                ].filter(Boolean).join(' ')}
                onClick={() => handleDayClick(day)}
              >
                <span style={{ fontSize: 14 }}>{day}</span>
                {hasWorkout && !isToday && <div className="dot" />}
              </div>
            );
          })}
        </div>
      </div>

      {/* Date detail */}
      {selectedDate && selectedSessions.length > 0 && (
        <div key={selectedDate}>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-2)', marginBottom: 10, paddingLeft: 2 }}>
            {formatDateFull(selectedDate)}
          </div>
          {selectedSessions.map(s => (
            <SessionCard
              key={s.id}
              session={s}
              onDelete={() => { deleteSession(s.id); setSelectedDate(null); }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
