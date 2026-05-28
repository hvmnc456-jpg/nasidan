import { useState } from 'react';
import type { WorkoutSession, Screen } from '../types';
import { formatDuration, formatDateFull } from '../utils/time';

interface Props {
  history: WorkoutSession[];
  completedSession: WorkoutSession | null;
  setScreen: (screen: Screen) => void;
  deleteSession: (id: string) => void;
}

export default function HistoryScreen({ history, completedSession, setScreen, deleteSession }: Props) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const sorted = [...history].sort((a, b) => b.date.localeCompare(a.date));

  const handleBack = () => {
    if (completedSession) setScreen('summary');
    else setScreen('home');
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ padding: '20px 20px 0' }}>
        <div className="hdr">
          <button className="btn-icon" onClick={handleBack}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <span className="hdr-title">운동 기록</span>
          <span className="pill pill-dark">{history.length}개</span>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '0 20px 24px' }}>
        {sorted.length === 0 ? (
          <div style={{ textAlign: 'center', paddingTop: 60 }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>💪</div>
            <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 6 }}>아직 운동 기록이 없어요</div>
            <div style={{ fontSize: 15, color: 'var(--text-3)' }}>첫 운동을 시작해보세요!</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {sorted.map(s => {
              const vol = s.exercises.reduce(
                (sum, e) => sum + (e.weight || 0) * (e.sets || 0) * (e.repsPerSet || 0),
                0,
              );
              const isDeleting = deletingId === s.id;
              return (
                <div key={s.id} className="card">
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-2)', marginBottom: 4 }}>
                        {formatDateFull(s.date)}
                      </div>
                      <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                        {s.bodyParts.map(p => (
                          <span key={p} className="pill pill-lime" style={{ fontSize: 11 }}>{p}</span>
                        ))}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span className="pill pill-dark">{formatDuration(s.totalDuration)}</span>
                      {!isDeleting ? (
                        <button className="btn-icon" onClick={() => setDeletingId(s.id)}>
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                            <path d="M10 11v6M14 11v6" />
                            <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                          </svg>
                        </button>
                      ) : (
                        <div style={{ display: 'flex', gap: 4 }}>
                          <button className="btn btn-sm btn-ghost" onClick={() => setDeletingId(null)}>취소</button>
                          <button className="btn btn-sm btn-red" onClick={() => { deleteSession(s.id); setDeletingId(null); }}>삭제</button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
                    {s.exercises.filter(e => e.name).map(e => (
                      <span key={e.id} className="pill pill-dark" style={{ fontSize: 11 }}>
                        {e.name}{e.weight > 0 ? ` ${e.weight}kg` : ''} {e.sets}×{e.repsPerSet}
                      </span>
                    ))}
                  </div>

                  <div style={{ paddingTop: 8, borderTop: '1px solid var(--border-2)', display: 'flex', gap: 12, alignItems: 'center' }}>
                    <span style={{ fontSize: 11, color: 'var(--text-3)' }}>
                      휴식 {s.lapLog ? s.lapLog.filter(l => l.type === 'rest_start').length : 0}회
                    </span>
                    {s.avgWorkTime > 0 && (
                      <span style={{ fontSize: 12, color: 'var(--text-3)' }}>평균 운동 {formatDuration(s.avgWorkTime)}</span>
                    )}
                    {s.avgRestTime > 0 && (
                      <span style={{ fontSize: 12, color: 'var(--text-3)' }}>평균 휴식 {formatDuration(s.avgRestTime)}</span>
                    )}
                    {vol > 0 && (
                      <span style={{ fontSize: 13, color: 'var(--lime)', fontWeight: 700, marginLeft: 'auto' }}>
                        {vol.toLocaleString()}kg
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
