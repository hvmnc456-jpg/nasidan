import { useState } from 'react';
import type { Exercise, Screen } from '../types';
import ExerciseItem from '../components/ExerciseItem';

interface Props {
  selectedBodyParts: string[];
  exercises: Exercise[];
  addExercise: (bodyPart: string) => void;
  updateExercise: (id: string, field: 'name' | 'weight' | 'sets' | 'repsPerSet', value: string | number) => void;
  removeExercise: (id: string) => void;
  startWorkout: () => void;
  setScreen: (screen: Screen) => void;
}

export default function ExerciseListScreen({
  selectedBodyParts,
  exercises,
  addExercise,
  updateExercise,
  removeExercise,
  startWorkout,
  setScreen,
}: Props) {
  const [activeTab, setActiveTab] = useState(selectedBodyParts[0] ?? '');
  const currentExercises = exercises.filter(ex => ex.bodyPart === activeTab);

  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <div className="px-5 pt-14 pb-4 flex items-center gap-3 border-b border-zinc-800/60">
        <button
          onClick={() => setScreen('home')}
          className="w-9 h-9 flex items-center justify-center text-zinc-400 hover:text-zinc-50 transition-colors"
        >
          ←
        </button>
        <h1 className="text-zinc-50 text-lg font-bold font-sans">운동 목록</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 px-5 py-3 overflow-x-auto border-b border-zinc-800/60">
        {selectedBodyParts.map(part => (
          <button
            key={part}
            onClick={() => setActiveTab(part)}
            className={[
              'shrink-0 px-4 py-2 rounded-xl text-sm font-semibold font-sans transition-all duration-150',
              activeTab === part
                ? 'bg-lime-400 text-zinc-950'
                : 'bg-zinc-900 text-zinc-400 border border-zinc-800',
            ].join(' ')}
          >
            {part}
          </button>
        ))}
      </div>

      {/* Exercise List */}
      <div className="flex-1 overflow-y-auto px-5 pt-4 pb-4">
        {currentExercises.length === 0 && (
          <div className="text-center text-zinc-600 text-sm font-sans py-8">
            + 운동을 추가하세요
          </div>
        )}

        {currentExercises.map(ex => (
          <ExerciseItem
            key={ex.id}
            exercise={ex}
            onUpdate={updateExercise}
            onRemove={removeExercise}
          />
        ))}

        <button
          onClick={() => addExercise(activeTab)}
          className="w-full h-12 rounded-2xl bg-zinc-900 border border-zinc-800 border-dashed text-zinc-500 text-sm font-sans hover:text-lime-400 hover:border-lime-400/40 transition-colors"
        >
          + 운동 추가
        </button>
      </div>

      {/* Start Button */}
      <div className="px-5 pb-10 pt-3 border-t border-zinc-800/60">
        <button
          onClick={startWorkout}
          className="w-full h-14 rounded-2xl bg-lime-400 text-zinc-950 text-base font-bold font-sans active:scale-95 transition-all shadow-lg shadow-lime-400/20"
        >
          운동 시작
        </button>
      </div>
    </div>
  );
}
