import type { Exercise } from '../types';

interface Props {
  exercise: Exercise;
  onUpdate: (id: string, field: 'name' | 'weight' | 'sets' | 'repsPerSet', value: string | number) => void;
  onRemove: (id: string) => void;
}

export default function ExerciseItem({ exercise, onUpdate, onRemove }: Props) {
  return (
    <div className="card">
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <input
          type="text"
          value={exercise.name}
          onChange={e => onUpdate(exercise.id, 'name', e.target.value)}
          placeholder="운동 이름"
          style={{ flex: 1, fontSize: 16, fontWeight: 500 }}
        />
        <button className="btn-icon" onClick={() => onRemove(exercise.id)}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        <div className="num-input-wrap">
          <label>무게(kg)</label>
          <input
            type="number"
            min="0"
            step="0.5"
            value={exercise.weight || ''}
            placeholder="0"
            onChange={e => onUpdate(exercise.id, 'weight', parseFloat(e.target.value) || 0)}
          />
        </div>
        <div className="num-input-wrap">
          <label>세트</label>
          <input
            type="number"
            min="1"
            value={exercise.sets || ''}
            placeholder="3"
            onChange={e => onUpdate(exercise.id, 'sets', parseInt(e.target.value) || 0)}
          />
        </div>
        <div className="num-input-wrap">
          <label>횟수</label>
          <input
            type="number"
            min="1"
            value={exercise.repsPerSet || ''}
            placeholder="10"
            onChange={e => onUpdate(exercise.id, 'repsPerSet', parseInt(e.target.value) || 0)}
          />
        </div>
      </div>
    </div>
  );
}
