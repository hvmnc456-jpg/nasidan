import { useState } from 'react';
import type { WorkoutSession, Screen } from '../types';

type Templates = Record<string, string[]>;

interface Props {
  session: WorkoutSession;
  templates: Templates;
  onUpdateTemplates: (t: Templates) => void;
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

function exVolume(e: WorkoutSession['exercises'][number]): number {
  return e.sets.reduce((sum, s) => sum + (s.weight || 0) * (s.reps || 0), 0);
}

export default function SummaryScreen({ session, templates, onUpdateTemplates, resetWorkout, setScreen }: Props) {
  const [y, m, d] = session.date.split('-').map(Number);
  const dow = DAYS_KR[new Date(y, m - 1, d).getDay()];
  const dateShort = `${m}월 ${d}일 (${dow})`;
  const restCount = session.lapLog.filter(l => l.type === 'rest_start').length;
  const totalVol = session.exercises.reduce((sum, e) => sum + exVolume(e), 0);

  const partGroups: Record<string, typeof session.exercises> = {};
  session.bodyParts.forEach(p => { partGroups[p] = session.exercises.filter(e => e.bodyPart === p); });

  // 직접 추가된 종목 감지 (템플릿에 없고 이름이 있는 것)
  const newByPart = session.exercises.reduce<Record<string, string[]>>((acc, e) => {
    if (!e.name.trim()) return acc;
    const saved = templates[e.bodyPart] ?? [];
    if (!saved.includes(e.name)) {
      if (!acc[e.bodyPart]) acc[e.bodyPart] = [];
      if (!acc[e.bodyPart].includes(e.name)) acc[e.bodyPart].push(e.name);
    }
    return acc;
  }, {});
  const hasNew = Object.keys(newByPart).length > 0;

  const [promptDismissed, setPromptDismissed] = useState(false);

  const handleSaveToTemplates = () => {
    const next = { ...templates };
    Object.entries(newByPart).forEach(([part, names]) => {
      next[part] = [...(next[part] ?? []), ...names];
    });
    onUpdateTemplates(next);
    setPromptDismissed(true);
  };

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
          <div className="stat-val">{session.exercises.filter(e => e.timerDuration).length}개</div>
          <div className="stat-lbl">타이머 사용 운동</div>
        </div>
        <div className="stat-card">
          <div className="stat-val">{restCount}회</div>
          <div className="stat-lbl">총 휴식 횟수</div>
        </div>
        <div className="stat-card">
          <div className="stat-val">{session.exercises.reduce((sum, e) => sum + e.sets.length, 0)}세트</div>
          <div className="stat-lbl">총 세트</div>
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

      {/* 신규 종목 저장 안내 */}
      {hasNew && !promptDismissed && (
        <div style={{
          marginBottom: 20,
          background: 'var(--lime-bg)',
          border: '1px solid rgba(163,230,53,0.3)',
          borderRadius: 16,
          padding: 16,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--lime)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--lime)' }}>
              새 종목을 설정에 추가할까요?
            </span>
          </div>

          {/* 추가될 종목 목록 */}
          <div style={{ marginBottom: 12 }}>
            {Object.entries(newByPart).map(([part, names]) => (
              <div key={part} style={{ display: 'flex', alignItems: 'flex-start', gap: 6, marginBottom: 4 }}>
                <span className="pill pill-lime" style={{ fontSize: 11, flexShrink: 0 }}>{part}</span>
                <span style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.6 }}>
                  {names.join(', ')}
                </span>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button
              className="btn btn-sm btn-ghost"
              style={{ flex: 1, height: 38 }}
              onClick={() => setPromptDismissed(true)}
            >
              아니요
            </button>
            <button
              className="btn btn-sm btn-lime"
              style={{ flex: 1, height: 38 }}
              onClick={handleSaveToTemplates}
            >
              네, 추가할게요
            </button>
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
              {exs.length === 0 && (
                <div style={{ fontSize: 14, color: 'var(--text-3)', padding: '8px 0' }}>운동 없음</div>
              )}
              {exs.map(e => (
                <div key={e.id} className="card-inner">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: e.sets.length > 0 ? 10 : 0 }}>
                    <span style={{ fontSize: 15, fontWeight: 600 }}>{e.name || '이름 없음'}</span>
                    <span className="pill pill-dark">{e.sets.length}세트</span>
                  </div>
                  {e.sets.map((s, i) => (
                    <div key={i} style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      paddingTop: 6,
                      borderTop: i === 0 ? '1px solid var(--border-2)' : 'none',
                    }}>
                      <span style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 600, width: 36 }}>{i + 1}세트</span>
                      <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', flex: 1 }}>
                        {s.weight > 0 ? `${s.weight}kg` : '—'}
                      </span>
                      <span style={{ fontSize: 13, color: 'var(--text-2)' }}>{s.reps}회</span>
                    </div>
                  ))}
                </div>
              ))}
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
