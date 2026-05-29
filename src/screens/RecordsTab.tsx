import { useState, useMemo } from 'react';
import type { WorkoutSession } from '../types';
import { BODY_PARTS } from '../constants';

interface Props {
  history: WorkoutSession[];
}

interface ExerciseStat {
  name: string;
  sessionCount: number;   // 수행 횟수 (세션 기준)
  totalSets: number;      // 누적 세트 수
  totalReps: number;      // 누적 횟수 (rep 합산)
  minWeight: number | null;
  maxWeight: number | null;
  lastDate: string;
}

function computeStats(
  history: WorkoutSession[],
  bodyPart: string,
): ExerciseStat[] {
  const map = new Map<string, ExerciseStat>();

  for (const session of history) {
    for (const ex of session.exercises) {
      if (ex.bodyPart !== bodyPart || !ex.name.trim()) continue;

      if (!map.has(ex.name)) {
        map.set(ex.name, {
          name: ex.name,
          sessionCount: 0,
          totalSets: 0,
          totalReps: 0,
          minWeight: null,
          maxWeight: null,
          lastDate: session.date,
        });
      }

      const stat = map.get(ex.name)!;
      stat.sessionCount += 1;
      stat.totalSets += ex.sets.length;

      for (const s of ex.sets) {
        stat.totalReps += s.reps || 0;
        if (s.weight > 0) {
          if (stat.minWeight === null || s.weight < stat.minWeight) stat.minWeight = s.weight;
          if (stat.maxWeight === null || s.weight > stat.maxWeight) stat.maxWeight = s.weight;
        }
      }

      if (session.date > stat.lastDate) stat.lastDate = session.date;
    }
  }

  // 수행 횟수 내림차순 정렬
  return [...map.values()].sort((a, b) => b.sessionCount - a.sessionCount);
}

function formatDateShort(dateStr: string): string {
  const [, m, d] = dateStr.split('-').map(Number);
  return `${m}월 ${d}일`;
}

export default function RecordsTab({ history }: Props) {
  const [activeTab, setActiveTab] = useState<string>(BODY_PARTS[0]);

  const stats = useMemo(
    () => computeStats(history, activeTab),
    [history, activeTab],
  );

  // 해당 부위 기록이 있는지 표시용
  const partHasRecord = useMemo(() => {
    const set = new Set<string>();
    history.forEach(s =>
      s.exercises.forEach(e => { if (e.name.trim()) set.add(e.bodyPart); })
    );
    return set;
  }, [history]);

  return (
    <div className="fade-up" style={{ paddingBottom: 'calc(var(--nav-h) + env(safe-area-inset-bottom, 0px) + 16px)' }}>
      {/* 헤더 */}
      <div style={{ padding: '24px 20px 0' }}>
        <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-3)', marginBottom: 4 }}>통계</div>
        <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 20 }}>운동 기록</div>
      </div>

      {/* 부위 탭바 */}
      <div style={{
        display: 'flex', gap: 8, overflowX: 'auto',
        padding: '0 20px 16px', scrollbarWidth: 'none',
      }}>
        {BODY_PARTS.map(part => (
          <button
            key={part}
            className={`part-tab${activeTab === part ? ' active' : ''}`}
            onClick={() => setActiveTab(part)}
            style={{ position: 'relative' }}
          >
            {part}
            {/* 기록 있는 부위에 점 표시 */}
            {partHasRecord.has(part) && activeTab !== part && (
              <span style={{
                position: 'absolute', top: 6, right: 6,
                width: 5, height: 5, borderRadius: '50%',
                background: 'var(--lime)',
              }} />
            )}
          </button>
        ))}
      </div>

      {/* 운동별 카드 목록 */}
      <div style={{ padding: '0 20px' }}>
        {stats.length === 0 ? (
          <div style={{ textAlign: 'center', paddingTop: 60 }}>
            <div style={{ fontSize: 36, marginBottom: 12, opacity: 0.3 }}>📋</div>
            <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-3)', marginBottom: 6 }}>
              {activeTab} 기록이 없어요
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-3)' }}>
              운동을 완료하면 여기에 기록이 쌓여요
            </div>
          </div>
        ) : (
          stats.map(stat => (
            <div key={stat.name} className="card" style={{ marginBottom: 12 }}>
              {/* 카드 헤더 */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
                <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', flex: 1 }}>
                  {stat.name}
                </span>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 3, flexShrink: 0, marginLeft: 8 }}>
                  <span className="pill pill-lime" style={{ fontSize: 11 }}>
                    {stat.sessionCount}회 수행
                  </span>
                  <span style={{ fontSize: 11, color: 'var(--text-3)' }}>
                    마지막 {formatDateShort(stat.lastDate)}
                  </span>
                </div>
              </div>

              {/* 통계 그리드 */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <StatBox label="누적 세트" value={`${stat.totalSets}세트`} />
                <StatBox label="누적 횟수" value={`${stat.totalReps.toLocaleString('ko-KR')}회`} />
                <StatBox
                  label="최소 무게"
                  value={stat.minWeight !== null ? `${stat.minWeight}kg` : '—'}
                  dim={stat.minWeight === null}
                />
                <StatBox
                  label="최대 무게"
                  value={stat.maxWeight !== null ? `${stat.maxWeight}kg` : '—'}
                  highlight={stat.maxWeight !== null}
                  dim={stat.maxWeight === null}
                />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function StatBox({
  label, value, highlight = false, dim = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
  dim?: boolean;
}) {
  return (
    <div style={{
      background: 'var(--surface-2)',
      borderRadius: 12,
      padding: '12px 14px',
    }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-3)', marginBottom: 4, letterSpacing: '0.04em' }}>
        {label}
      </div>
      <div style={{
        fontSize: 17, fontWeight: 700, letterSpacing: '-0.01em',
        color: dim ? 'var(--text-3)' : highlight ? 'var(--lime)' : 'var(--text)',
      }}>
        {value}
      </div>
    </div>
  );
}
