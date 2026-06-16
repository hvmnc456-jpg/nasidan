import { useState } from 'react';
import type { Exercise } from '../types';

interface Props {
  exercise: Exercise;
  onUpdateName: (id: string, name: string) => void;
  onUpdateSet: (id: string, setIndex: number, field: 'weight' | 'reps', value: number) => void;
  onAddSet: (id: string) => void;
  onRemoveSet: (id: string, setIndex: number) => void;
  onRemove: (id: string) => void;
}

export default function ExerciseItem({
  exercise,
  onUpdateName, onUpdateSet, onAddSet, onRemoveSet, onRemove,
}: Props) {
  const [isExpanded, setIsExpanded] = useState(true);

  // ─── 접힌 상태 ───────────────────────────────────
  if (!isExpanded) {
    return (
      <div className="card" style={{ marginBottom: 12 }}>
        <div
          style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}
          onClick={() => setIsExpanded(true)}
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
          onClick={() => setIsExpanded(false)}
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
    </div>
  );
}
