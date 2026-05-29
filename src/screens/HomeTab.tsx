import { useState, useMemo } from 'react';
import type { WorkoutSession } from '../types';
import { CUMULATIVE_PARTS } from '../constants';
import Calendar from '../components/Calendar';
import ChangelogSheet from '../components/ChangelogSheet';

interface Props {
  history: WorkoutSession[];
  deleteSession: (id: string) => void;
}

const DAYS_KR = ['일', '월', '화', '수', '목', '금', '토'];

export default function HomeTab({ history, deleteSession }: Props) {
  const today = new Date();
  const [showChangelog, setShowChangelog] = useState(false);

  const stats = useMemo(() => {
    // 누적 볼륨 (부위별)
    const parts: Record<string, number> = {};
    // 부위별 운동 횟수 (세션 수 기준)
    const partSessions: Record<string, number> = {};
    CUMULATIVE_PARTS.forEach(p => { parts[p] = 0; partSessions[p] = 0; });

    let total = 0;
    // 운동일 수 (중복 제거)
    const workoutDays = new Set<string>();

    history.forEach(s => {
      workoutDays.add(s.date);

      // 해당 세션에서 등장한 부위 (중복 없이)
      const seenParts = new Set<string>();

      s.exercises.forEach(e => {
        const vol = e.sets.reduce((acc, set) => acc + (set.weight || 0) * (set.reps || 0), 0);
        total += vol;

        if ((CUMULATIVE_PARTS as readonly string[]).includes(e.bodyPart)) {
          parts[e.bodyPart] += vol;
          if (!seenParts.has(e.bodyPart)) {
            partSessions[e.bodyPart] += 1;
            seenParts.add(e.bodyPart);
          }
        }
      });
    });

    return { total, parts, partSessions, workoutDays: workoutDays.size };
  }, [history]);

  return (
    <div className="screen fade-up">
      {/* 날짜 헤더 */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-3)', marginBottom: 5 }}>오늘</div>
          <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.02em' }}>
            {`${today.getFullYear()}년 ${today.getMonth() + 1}월 ${today.getDate()}일 (${DAYS_KR[today.getDay()]})`}
          </div>
        </div>
        <button
          onClick={() => setShowChangelog(true)}
          style={{
            display: 'flex', alignItems: 'center', gap: 5,
            background: 'var(--surface-2)',
            border: '1px solid var(--border)',
            borderRadius: 20,
            padding: '6px 12px',
            cursor: 'pointer',
            flexShrink: 0,
            marginTop: 2,
          }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--lime)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-2)' }}>업데이트</span>
        </button>
      </div>

      {showChangelog && <ChangelogSheet onClose={() => setShowChangelog(false)} />}

      {/* 캘린더 */}
      <Calendar history={history} deleteSession={deleteSession} />

      {/* 구분선 */}
      <div className="divider" />

      {/* 누적 보드 */}
      <div style={{ marginBottom: 8 }}>
        {/* 섹션 헤더 — 레이블 + 누적 운동일수 */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div className="section-label" style={{ marginBottom: 0 }}>누적 kg</div>
          {stats.workoutDays > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--text-3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="3"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-2)' }}>
                누적 운동일수
              </span>
              <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--lime)', fontFamily: 'var(--ff-mono)' }}>
                {stats.workoutDays}일
              </span>
            </div>
          )}
        </div>

        {history.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-3)', fontSize: 14 }}>
            운동을 완료하면 볼륨이 쌓여요
          </div>
        ) : (
          <>
            {/* 전체 누적 볼륨 */}
            <div style={{ marginBottom: 20 }}>
              <div className="vol-total">
                {stats.total.toLocaleString('ko-KR')}
                <span style={{ fontSize: 22, marginLeft: 2, fontWeight: 500 }}>kg</span>
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-3)', marginTop: 6 }}>전체 누적 볼륨</div>
            </div>

            {/* 부위별 그리드 */}
            <div className="vol-grid">
              {CUMULATIVE_PARTS.map(p => {
                const vol = stats.parts[p] ?? 0;
                const cnt = stats.partSessions[p] ?? 0;
                return (
                  <div key={p} className="vol-part">
                    <div className="vol-part-name">{p}</div>
                    <div className={`vol-part-val${vol > 0 ? ' active' : ''}`}>
                      {vol > 0 ? vol.toLocaleString('ko-KR') : '—'}
                    </div>
                    {vol > 0 ? (
                      <div style={{ fontSize: 11, color: 'var(--text-3)' }}>kg</div>
                    ) : null}
                    {/* 운동 횟수 */}
                    {cnt > 0 && (
                      <div style={{ fontSize: 10, color: 'var(--lime)', fontWeight: 600, marginTop: 2 }}>
                        {cnt}회
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
