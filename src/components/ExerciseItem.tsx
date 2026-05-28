import type { Exercise } from '../types';

interface Props {
  exercise: Exercise;
  onUpdate: (id: string, field: 'name' | 'weight' | 'sets' | 'repsPerSet', value: string | number) => void;
  onRemove: (id: string) => void;
}

export default function ExerciseItem({ exercise, onUpdate, onRemove }: Props) {
  return (
    <div className="bg-zinc-900 rounded-2xl p-4 mb-3">
      <div className="flex items-center gap-2 mb-3">
        <input
          type="text"
          value={exercise.name}
          onChange={e => onUpdate(exercise.id, 'name', e.target.value)}
          placeholder="운동 이름"
          className="flex-1 bg-zinc-800 text-zinc-50 placeholder-zinc-600 rounded-xl px-3 py-2 text-sm font-sans outline-none focus:ring-2 focus:ring-lime-400/40"
        />
        <button
          onClick={() => onRemove(exercise.id)}
          className="w-8 h-8 flex items-center justify-center text-zinc-500 hover:text-red-400 transition-colors shrink-0"
        >
          ✕
        </button>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div>
          <label className="block text-zinc-500 text-xs mb-1 text-center">무게 (kg)</label>
          <input
            type="number"
            min="0"
            step="0.5"
            value={exercise.weight || ''}
            onChange={e => onUpdate(exercise.id, 'weight', parseFloat(e.target.value) || 0)}
            className="w-full bg-zinc-800 text-zinc-50 rounded-xl px-2 py-2 text-sm font-mono text-center outline-none focus:ring-2 focus:ring-lime-400/40"
          />
        </div>
        <div>
          <label className="block text-zinc-500 text-xs mb-1 text-center">세트</label>
          <input
            type="number"
            min="1"
            value={exercise.sets || ''}
            onChange={e => onUpdate(exercise.id, 'sets', parseInt(e.target.value) || 0)}
            className="w-full bg-zinc-800 text-zinc-50 rounded-xl px-2 py-2 text-sm font-mono text-center outline-none focus:ring-2 focus:ring-lime-400/40"
          />
        </div>
        <div>
          <label className="block text-zinc-500 text-xs mb-1 text-center">횟수</label>
          <input
            type="number"
            min="1"
            value={exercise.repsPerSet || ''}
            onChange={e => onUpdate(exercise.id, 'repsPerSet', parseInt(e.target.value) || 0)}
            className="w-full bg-zinc-800 text-zinc-50 rounded-xl px-2 py-2 text-sm font-mono text-center outline-none focus:ring-2 focus:ring-lime-400/40"
          />
        </div>
      </div>
    </div>
  );
}
