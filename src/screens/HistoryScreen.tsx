import { useState } from 'react';
import type { WorkoutSession, Screen } from '../types';

interface Props {
  history: WorkoutSession[];
  completedSession: WorkoutSession | null;
  setScreen: (screen: Screen) => void;
  deleteSession: (id: string) => void;
}

const DAYS_KR = ['일', '월', '화', '수', '목', '금', '토'];

function fmtDur(s: number): string {
  if (!s || s <= 0) return '-';
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
  if (h > 0) return `${h}시간 ${m}분`;
  if (m > 0) return `${m}분 ${sec}초`;
  return `${sec}초`;
}

function SessionCard({ session, onDelete }: { session: WorkoutSession; onDelete: () => void }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [y, m, d] = session.date.split('-').map(Number);
  const dow = DAYS_KR[new Date(y, m - 1, d).getDay()];
  const vol = session.exercises.reduce((sum, e) => sum + (e.weight || 0) * (e.sets || 0) * (e.repsPerSet || 0), 0);

  return (
    <div className="card" style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-2)', marginBottom: 4 }}>
            {y}년 {m}월 {d}일 ({dow})
          </div>
          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
            {session.bodyParts.map(p => <span key={p} className="pill pill-lime" style={{ fontSize: 11 }}>{p}</span>)}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span className="pill pill-dark">{fmtDur(session.totalDuration)}</span>
          {!isDeleting ? (
            <button className="btn-icon" onClick={() => setIsDeleting(true)}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                <path d="M10 11v6M14 11v6"/>
                <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
              </svg>
            </button>
          ) : (
            <div style={{ display: 'flex', gap: 4 }}>
              <button className="btn btn-sm btn-ghost" onClick={() => setIsDeleting(false)}>취소</button>
              <button className="btn btn-sm btn-red" onClick={onDelete}>삭제</button>
            </div>
          )}
        </div>
      </div>

      {/* 운동 태그 */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
        {session.exercises.filter(e => e.name).map(e => (
          <span key={e.id} className="pill pill-dark" style={{ fontSize: 11 }}>
            {e.name} {e.weight > 0 ? `${e.weight}kg` : ''} {e.sets}×{e.repsPerSet}
          </span>
        ))}
      </div>

      {/* 통계 */}
      <div style={{ paddingTop: 8, borderTop: '1px solid var(--border-2)', display: 'flex', gap: 12, alignItems: 'center' }}>
        <span style={{ fontSize: 12, color: 'var(--text-3)' }}>
          휴식 {session.lapLog ? session.lapLog.filter(l => l.type === 'rest_start').length : 0}회
        </span>
        {session.avgWorkTime > 0 && (
          <span style={{ fontSize: 12, color: 'var(--text-3)' }}>평균 운동 {fmtDur(session.avgWorkTime)}</span>
        )}
        {session.avgRestTime > 0 && (
          <span style={{ fontSize: 12, color: 'var(--text-3)' }}>평균 휴식 {fmtDur(session.avgRestTime)}</span>
        )}
        {vol > 0 && (
          <span style={{ fontSize: 13, color: 'var(--lime)', fontWeight: 700, marginLeft: 'auto' }}>
            {vol.toLocaleString('ko-KR')}kg
          </span>
        )}
      </div>
    </div>
  );
}

export default function HistoryScreen({ history, completedSession, setScreen, deleteSession }: Props) {
  const sorted = [...history].sort((a, b) => b.date.localeCompare(a.date));

  const handleBack = () => {
    if (completedSession) setScreen('summary');
    else setScreen('home');
  };

  return (
    <div className="fade-up" style={{ display: 'flex', flexDirection: 'column', minHeight: 'calc(100dvh - var(--nav-h) - env(safe-area-inset-bottom, 0px))' }}>
      <div style={{ padding: '20px 20px 0' }}>
        <div className="hdr">
          <button className="btn-icon" onClick={handleBack}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"/>
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
          sorted.map(s => (
            <SessionCard
              key={s.id}
              session={s}
              onDelete={() => deleteSession(s.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}
