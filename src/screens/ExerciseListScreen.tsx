import { useState } from 'react';
import type { Exercise, Screen } from '../types';
import ExerciseItem from '../components/ExerciseItem';

interface Props {
  selectedBodyParts: string[];
  exercises: Exercise[];
  addExercise: (bodyPart: string) => void;
  updateExerciseName: (id: string, name: string) => void;
  updateSet: (id: string, setIndex: number, field: 'weight' | 'reps', value: number) => void;
  addSet: (id: string) => void;
  removeSet: (id: string, setIndex: number) => void;
  removeExercise: (id: string) => void;
  startWorkout: () => void;
  setScreen: (screen: Screen) => void;
}

export default function ExerciseListScreen({
  selectedBodyParts, exercises,
  addExercise, updateExerciseName, updateSet, addSet, removeSet, removeExercise,
  startWorkout, setScreen,
}: Props) {
  const [activeTab, setActiveTab] = useState(selectedBodyParts[0] ?? '');
  const currentExercises = exercises.filter(ex => ex.bodyPart === activeTab);

  return (
    <div className="fade-up" style={{ display: 'flex', flexDirection: 'column', minHeight: 'calc(100dvh - var(--nav-h) - env(safe-area-inset-bottom, 0px))' }}>
      {/* 헤더 */}
      <div style={{ padding: '20px 20px 0' }}>
        <div className="hdr">
          <button className="btn-icon" onClick={() => setScreen('home')}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>
          <span className="hdr-title">운동 목록</span>
        </div>
      </div>

      {/* 부위 탭바 */}
      <div className="part-tabs">
        {selectedBodyParts.map(p => {
          const count = exercises.filter(e => e.bodyPart === p && e.name).length;
          return (
            <button
              key={p}
              className={`part-tab${activeTab === p ? ' active' : ''}`}
              onClick={() => setActiveTab(p)}
            >
              {p}
              {count > 0 && <span style={{ marginLeft: 4, fontSize: 11, opacity: 0.7 }}>{count}</span>}
            </button>
          );
        })}
      </div>

      {/* 운동 목록 (스크롤) */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 20px 16px' }}>
        {currentExercises.length === 0 && (
          <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-3)', fontSize: 14 }}>
            + 운동을 추가하세요
          </div>
        )}

        {currentExercises.map(ex => (
          <ExerciseItem
            key={ex.id}
            exercise={ex}
            onUpdateName={updateExerciseName}
            onUpdateSet={updateSet}
            onAddSet={addSet}
            onRemoveSet={removeSet}
            onRemove={removeExercise}
          />
        ))}

        <button className="add-ex-btn" onClick={() => addExercise(activeTab)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          운동 추가
        </button>
      </div>

      {/* 운동 시작 버튼 */}
      <div style={{ padding: '12px 20px 20px', borderTop: '1px solid var(--border-2)' }}>
        <button className="btn btn-full btn-lime" onClick={startWorkout}>
          운동 시작
        </button>
      </div>
    </div>
  );
}
