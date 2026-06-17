import type { Exercise } from '../types';

interface Props {
  exercise: Exercise;
  onUpdateName: (id: string, name: string) => void;
  onUpdateSet: (id: string, setIndex: number, field: 'weight' | 'reps', value: number) => void;
  onAddSet: (id: string) => void;
  onRemoveSet: (id: string, setIndex: number) => void;
  onRemove: (id: string) => void;
  onToggleExpanded: (id: string) => void;
  onToggleDone: (id: string) => void;
}

export default function ExerciseItem({
  exercise,
  onUpdateName, onUpdateSet, onAddSet, onRemoveSet, onRemove,
  onToggleExpanded, onToggleDone,
}: Props) {
  // 펼침 상태는 exercise 객체에 저장돼 탭/앱 전환에도 유지됨 (기본 펼침)
  const isExpanded = exercise.expanded !== false;

  // ─── 완료된 상태 ─────────────────────────────────
  // 완료 종목은 클릭해도 펼쳐지지 않음. '되돌리기'로만 다시 편집 가능.
  if (exercise.done) {
    return (
      <div className="card" style={{ marginBottom: 12, borderColor: 'var(--lime)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ color: 'var(--lime)', flexShrink: 0, lineHeight: 0 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
          </div>
          <span style={{ flex: 1, fontSize: 15, fontWeight: 600, color: 'var(--text-3)', textDecoration: 'line-through' }}>
            {exercise.name || '운동 이름'}
          </span>
          <span className="pill pill-dark" style={{ fontSize: 11 }}>{exercise.sets.length}세트</span>
          <button
            onClick={() => onToggleDone(exercise.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: 4,
              padding: '5px 10px', borderRadius: 9999,
              border: '1px solid var(--border)', background: 'none',
              color: 'var(--text-3)', fontSize: 12, fontWeight: 600,
              fontFamily: 'var(--ff)', cursor: 'pointer',
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>
            </svg>
            되돌리기
          </button>
        </div>
      </div>
    );
  }

  // ─── 접힌 상태 ───────────────────────────────────
  if (!isExpanded) {
    return (
      <div className="card" style={{ marginBottom: 12 }}>
        <div
          style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}
          onClick={() => onToggleExpanded(exercise.id)}
        >
          <div style={{ color: 'var(--text-3)', flexShrink: 0, lineHeight: 0 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </div>
          <span style={{ flex: 1, fontSize: 15, fontWeight: 600, color: exercise.name ? 'var(--text)' : 'var(--text-3)' }}>
            {exercise.name || '운동 이름'}
          </span>
          <span className="pill pill-dark" style={{ fontSize: 11 }}>{exercise.sets.length}세트</span>
        </div>
      </div>
    );
  }

  // ─── 펼친 상태 ───────────────────────────────────
  return (
    <div className="card" style={{ marginBottom: 12 }}>
      {/* 운동 이름 행 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <button
          style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: 'var(--text-3)', lineHeight: 0, flexShrink: 0 }}
          onClick={() => onToggleExpanded(exercise.id)}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="18 15 12 9 6 15"/>
          </svg>
        </button>
        <input
          type="text"
          placeholder="운동 이름"
          value={exercise.name}
          onChange={e => onUpdateName(exercise.id, e.target.value)}
          style={{ flex: 1, fontSize: 16, fontWeight: 600, color: 'var(--text)' }}
        />
        <button className="btn-icon" onClick={() => onRemove(exercise.id)}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>

      {/* 세트 헤더 */}
      <div style={{ display: 'grid', gridTemplateColumns: '28px 1fr 1fr 28px', gap: 6, marginBottom: 6 }}>
        <div />
        <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-3)', textAlign: 'center', letterSpacing: '0.04em' }}>무게 (kg)</div>
        <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-3)', textAlign: 'center', letterSpacing: '0.04em' }}>횟수</div>
        <div />
      </div>

      {/* 세트 행 */}
      {exercise.sets.map((set, i) => (
        <div key={i} style={{ display: 'grid', gridTemplateColumns: '28px 1fr 1fr 28px', gap: 6, marginBottom: 6, alignItems: 'center' }}>
          <div style={{
            width: 24, height: 24, borderRadius: '50%',
            background: 'var(--surface-2)', color: 'var(--text-3)',
            fontSize: 11, fontWeight: 700,
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            {i + 1}
          </div>
          <div className="num-input-wrap" style={{ padding: '8px 10px' }}>
            <input
              type="number" min="0" step="0.5"
              value={set.weight || ''} placeholder="0"
              onChange={e => onUpdateSet(exercise.id, i, 'weight', parseFloat(e.target.value) || 0)}
            />
          </div>
          <div className="num-input-wrap" style={{ padding: '8px 10px' }}>
            <input
              type="number" min="1"
              value={set.reps || ''} placeholder="10"
              onChange={e => onUpdateSet(exercise.id, i, 'reps', parseInt(e.target.value) || 0)}
            />
          </div>
          {exercise.sets.length > 1 ? (
            <button className="btn-icon" style={{ width: 24, height: 24, borderRadius: 6, flexShrink: 0 }}
              onClick={() => onRemoveSet(exercise.id, i)}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          ) : <div />}
        </div>
      ))}

      {/* 세트 추가 */}
      <button className="add-ex-btn" style={{ marginTop: 8, height: 36, fontSize: 13 }}
        onClick={() => onAddSet(exercise.id)}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        세트 추가
      </button>

      {/* 운동 완료 — 완료 시 접히고 탭/앱 전환에도 다시 펼쳐지지 않음 */}
      <button className="add-ex-btn is-primary" style={{ marginTop: 8, height: 40, fontSize: 14 }}
        onClick={() => onToggleDone(exercise.id)}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
        운동 완료
      </button>
    </div>
  );
}
