import { useMemo } from 'react';
import type { WorkoutSession } from '../types';
import { CUMULATIVE_PARTS } from '../constants';
import { formatDate } from '../utils/time';
import Calendar from '../components/Calendar';

interface Props {
  history: WorkoutSession[];
  deleteSession: (id: string) => void;
}

export default function HomeTab({ history, deleteSession }: Props) {
  const today = new Date();

  const volumeStats = useMemo(() => {
    const parts: Record<string, number> = {};
    CUMULATIVE_PARTS.forEach(p => { parts[p] = 0; });
    let total = 0;
    history.forEach(s => {
      s.exercises.forEach(e => {
        const vol = (e.weight || 0) * (e.sets || 0) * (e.repsPerSet || 0);
        total += vol;
        if (e.bodyPart in parts) parts[e.bodyPart] += vol;
      });
    });
    return { total, parts };
  }, [history]);

  return (
    <div className="screen">
      {/* Date header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-3)', marginBottom: 5 }}>오늘</div>
        <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.02em' }}>
          {formatDate(today)}
        </div>
      </div>

      {/* Calendar */}
      <Calendar history={history} deleteSession={deleteSession} />

      {/* Divider */}
      <div className="divider" />

      {/* Volume board */}
      <div>
        <div className="section-label">누적 kg</div>
        {history.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-3)', fontSize: 14 }}>
            운동을 완료하면 볼륨이 쌓여요
          </div>
        ) : (
          <>
            <div style={{ marginBottom: 20 }}>
              <div className="vol-total">
                {volumeStats.total.toLocaleString()}
                <span style={{ fontSize: 22, marginLeft: 2, fontWeight: 500 }}>kg</span>
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-3)', marginTop: 6 }}>전체 누적 볼륨</div>
            </div>
            <div className="vol-grid">
              {CUMULATIVE_PARTS.map(p => {
                const val = volumeStats.parts[p] ?? 0;
                return (
                  <div key={p} className="vol-part">
                    <div className="vol-part-name">{p}</div>
                    <div className={`vol-part-val${val > 0 ? ' active' : ''}`}>
                      {val > 0 ? val.toLocaleString() : '—'}
                    </div>
                    {val > 0 && <div style={{ fontSize: 11, color: 'var(--text-3)' }}>kg</div>}
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
