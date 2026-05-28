import type { WorkoutSession, Screen } from '../types';
import { formatDuration, formatDateShort } from '../utils/time';

interface Props {
  session: WorkoutSession;
  resetWorkout: () => void;
  setScreen: (screen: Screen) => void;
}

export default function SummaryScreen({ session, resetWorkout, setScreen }: Props) {
  const totalVol = session.exercises.reduce(
    (sum, e) => sum + (e.weight || 0) * (e.sets || 0) * (e.repsPerSet || 0),
    0,
  );

  const grouped = session.bodyParts.reduce<Record<string, typeof session.exercises>>(
    (acc, part) => {
      acc[part] = session.exercises.filter(ex => ex.bodyPart === part);
      return acc;
    },
    {},
  );

  return (
    <div className="screen animate-fade-in">
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 13, color: 'var(--text-3)', marginBottom: 6 }}>{formatDateShort(session.date)}</div>
        <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 10 }}>운동 완료 🎉</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {session.bodyParts.map(p => <span key={p} className="pill pill-lime">{p}</span>)}
        </div>
      </div>

      {/* Stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 24 }}>
        <div className="stat-card">
          <div className="stat-val">{formatDuration(session.totalDuration)}</div>
          <div className="stat-lbl">총 운동 시간</div>
        </div>
        <div className="stat-card">
          <div className="stat-val">{session.restCount ?? 0}회</div>
          <div className="stat-lbl">휴식 횟수</div>
        </div>
        <div className="stat-card">
          <div className="stat-val">{formatDuration(session.avgWorkTime)}</div>
          <div className="stat-lbl">평균 운동 구간</div>
        </div>
        <div className="stat-card">
          <div className="stat-val">{formatDuration(session.avgRestTime)}</div>
          <div className="stat-lbl">평균 휴식 구간</div>
        </div>
      </div>

      {/* Session volume */}
      {totalVol > 0 && (
        <div className="card" style={{ marginBottom: 24, textAlign: 'center' }}>
          <div style={{ fontSize: 13, color: 'var(--text-3)', marginBottom: 6 }}>이번 세션 볼륨</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 28, fontWeight: 700, color: 'var(--lime)', letterSpacing: '-0.03em' }}>
            {totalVol.toLocaleString()}<span style={{ fontSize: 18 }}>kg</span>
          </div>
        </div>
      )}

      {/* Exercise breakdown */}
      <div style={{ marginBottom: 28 }}>
        <div className="section-label">운동 내역</div>
        {Object.entries(grouped).map(([part, exs]) => {
          if (exs.length === 0) return null;
          return (
            <div key={part} style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--lime)', marginBottom: 8 }}>{part}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {exs.map(e => (
                  <div key={e.id} className="card-inner" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 15, fontWeight: 600 }}>{e.name || '이름 없음'}</span>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <span style={{ fontSize: 13, color: 'var(--text-2)' }}>{e.sets}×{e.repsPerSet}</span>
                      {e.weight > 0 && <span className="pill pill-dark">{e.weight}kg</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Buttons */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <button className="btn btn-full btn-lime" onClick={resetWorkout}>새 운동 시작</button>
        <button className="btn btn-full btn-dark" onClick={() => setScreen('history')}>기록 보기</button>
      </div>
    </div>
  );
}
