import type { WorkoutSession, Screen } from '../types';

interface Props {
  session: WorkoutSession;
  resetWorkout: () => void;
  setScreen: (screen: Screen) => void;
}

const DAYS_KR = ['일', '월', '화', '수', '목', '금', '토'];

function fmtDur(s: number): string {
  if (!s || s <= 0) return '-';
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
  if (h > 0) return `${h}시간 ${m}분`;
  if (m > 0) return `${m}분 ${sec}초`;
  return `${sec}초`;
}

export default function SummaryScreen({ session, resetWorkout, setScreen }: Props) {
  const [y, m, d] = session.date.split('-').map(Number);
  const dow = DAYS_KR[new Date(y, m - 1, d).getDay()];
  const dateShort = `${m}월 ${d}일 (${dow})`;
  const restCount = session.lapLog.filter(l => l.type === 'rest_start').length;
  const totalVol = session.exercises.reduce((sum, e) => sum + (e.weight || 0) * (e.sets || 0) * (e.repsPerSet || 0), 0);

  const partGroups: Record<string, typeof session.exercises> = {};
  session.bodyParts.forEach(p => { partGroups[p] = session.exercises.filter(e => e.bodyPart === p); });

  return (
    <div className="screen fade-up">
      {/* 헤더 */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 13, color: 'var(--text-3)', marginBottom: 6 }}>{dateShort}</div>
        <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 10 }}>운동 완료 🎉</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {session.bodyParts.map(p => <span key={p} className="pill pill-lime">{p}</span>)}
        </div>
      </div>

      {/* 통계 그리드 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 24 }}>
        <div className="stat-card">
          <div className="stat-val">{fmtDur(session.totalDuration)}</div>
          <div className="stat-lbl">총 운동 시간</div>
        </div>
        <div className="stat-card">
          <div className="stat-val">{restCount}회</div>
          <div className="stat-lbl">휴식 횟수</div>
        </div>
        <div className="stat-card">
          <div className="stat-val">{fmtDur(session.avgWorkTime)}</div>
          <div className="stat-lbl">평균 운동 구간</div>
        </div>
        <div className="stat-card">
          <div className="stat-val">{fmtDur(session.avgRestTime)}</div>
          <div className="stat-lbl">평균 휴식 구간</div>
        </div>
      </div>

      {/* 이번 세션 볼륨 */}
      {totalVol > 0 && (
        <div className="card" style={{ marginBottom: 24, textAlign: 'center' }}>
          <div style={{ fontSize: 13, color: 'var(--text-3)', marginBottom: 6 }}>이번 세션 볼륨</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--lime)', letterSpacing: '-0.03em' }}>
            {totalVol.toLocaleString('ko-KR')}<span style={{ fontSize: 18 }}>kg</span>
          </div>
        </div>
      )}

      {/* 운동 내역 */}
      <div style={{ marginBottom: 28 }}>
        <div className="section-label">운동 내역</div>
        {Object.entries(partGroups).map(([part, exs]) => (
          <div key={part} style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--lime)', marginBottom: 8 }}>{part}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {exs.map(e => (
                <div key={e.id} className="card-inner" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 15, fontWeight: 600 }}>{e.name || '이름 없음'}</span>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <span style={{ fontSize: 13, color: 'var(--text-2)' }}>{e.sets}×{e.repsPerSet}</span>
                    {e.weight > 0 && <span className="pill pill-dark">{e.weight}kg</span>}
                  </div>
                </div>
              ))}
              {exs.length === 0 && (
                <div style={{ fontSize: 14, color: 'var(--text-3)', padding: '8px 0' }}>운동 없음</div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* 버튼 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <button className="btn btn-full btn-lime" onClick={resetWorkout}>새 운동 시작</button>
        <button className="btn btn-full btn-dark" onClick={() => setScreen('history')}>기록 보기</button>
      </div>
    </div>
  );
}
