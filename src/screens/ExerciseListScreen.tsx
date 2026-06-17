import { useState, useRef, useEffect, useLayoutEffect } from 'react';
import type { Exercise, Screen } from '../types';
import ExerciseItem from '../components/ExerciseItem';

type Templates = Record<string, string[]>;

// 리마운트(탭 전환)·백그라운드 복귀 후에도 스크롤 위치를 유지하기 위해
// 컴포넌트 외부(모듈 스코프)에 마지막 스크롤 위치를 보관
let savedScrollTop = 0;

interface Props {
  selectedBodyParts: string[];
  exercises: Exercise[];
  templates: Templates;
  addExercise: (bodyPart: string) => void;
  addExerciseWithName: (bodyPart: string, name: string) => void;
  updateExerciseName: (id: string, name: string) => void;
  updateSet: (id: string, setIndex: number, field: 'weight' | 'reps', value: number) => void;
  addSet: (id: string) => void;
  removeSet: (id: string, setIndex: number) => void;
  removeExercise: (id: string) => void;
  toggleExpanded: (id: string) => void;
  toggleDone: (id: string) => void;
  completeWorkout: () => void;
  setScreen: (screen: Screen) => void;
}

export default function ExerciseListScreen({
  selectedBodyParts, exercises, templates,
  addExercise, addExerciseWithName, updateExerciseName, updateSet, addSet, removeSet, removeExercise,
  toggleExpanded, toggleDone, completeWorkout, setScreen,
}: Props) {
  const [activeTab, setActiveTab] = useState(selectedBodyParts[0] ?? '');
  const scrollRef = useRef<HTMLDivElement>(null);

  const currentExercises = exercises.filter(ex => ex.bodyPart === activeTab);
  const savedTemplates = templates[activeTab] ?? [];
  // 이미 추가된 종목 이름 목록 (중복 추가 방지용)
  const addedNames = new Set(currentExercises.map(e => e.name));

  // 스크롤 중 위치 저장
  const handleScroll = () => {
    if (scrollRef.current) savedScrollTop = scrollRef.current.scrollTop;
  };

  // 마운트(탭 전환 복귀 포함) 시 저장된 위치 복원 — 페인트 전에 실행해 깜빡임 방지
  useLayoutEffect(() => {
    if (scrollRef.current && savedScrollTop > 0) {
      scrollRef.current.scrollTop = savedScrollTop;
    }
  }, []);

  // 다른 앱에 갔다가 포그라운드 복귀 시 위치 복원 (브라우저가 내부 스크롤을 리셋하는 경우 대비)
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState !== 'visible' || !scrollRef.current) return;
      // 키보드 닫힘 등 레이아웃 재계산 이후 복원
      requestAnimationFrame(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = savedScrollTop;
      });
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, []);

  // 운동 목록을 떠날 때(뒤로가기) 저장 위치 초기화
  const handleBack = () => {
    savedScrollTop = 0;
    setScreen('home');
  };

  return (
    <div className="fade-up" style={{ display: 'flex', flexDirection: 'column', minHeight: 'calc(100dvh - var(--nav-h) - env(safe-area-inset-bottom, 0px))' }}>
      {/* 헤더 */}
      <div style={{ padding: '20px 20px 0' }}>
        <div className="hdr">
          <button className="btn-icon" onClick={handleBack}>
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

      {/* 운동 목록 */}
      <div ref={scrollRef} onScroll={handleScroll} style={{ flex: 1, overflowY: 'auto', padding: '0 20px 16px' }}>

        {/* ── 저장된 종목 빠른 추가 ── */}
        {savedTemplates.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-3)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 8 }}>
              저장된 종목
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {savedTemplates.map(name => {
                const already = addedNames.has(name);
                return (
                  <button
                    key={name}
                    onClick={() => !already && addExerciseWithName(activeTab, name)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 5,
                      padding: '7px 12px',
                      borderRadius: 9999,
                      border: `1px solid ${already ? 'var(--border)' : 'var(--lime)'}`,
                      background: already ? 'var(--surface-2)' : 'var(--lime-bg)',
                      color: already ? 'var(--text-3)' : 'var(--lime)',
                      fontSize: 13, fontWeight: 600,
                      fontFamily: 'var(--ff)',
                      cursor: already ? 'default' : 'pointer',
                      transition: 'all 0.15s',
                    }}
                  >
                    {already ? (
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    ) : (
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                        <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                      </svg>
                    )}
                    {name}
                  </button>
                );
              })}
            </div>
            <div style={{ height: 1, background: 'var(--border-2)', margin: '14px 0 4px' }} />
          </div>
        )}

        {/* 추가된 운동 없을 때 안내 */}
        {currentExercises.length === 0 && savedTemplates.length === 0 && (
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
            onToggleExpanded={toggleExpanded}
            onToggleDone={toggleDone}
          />
        ))}

        {/* 직접 추가 */}
        <button className="add-ex-btn is-primary" onClick={() => addExercise(activeTab)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          직접 추가
        </button>
      </div>

      {/* 전체 운동 완료 버튼 */}
      <div style={{ padding: '12px 20px 20px', borderTop: '1px solid var(--border-2)' }}>
        <button className="btn btn-full btn-lime" onClick={completeWorkout}>
          운동 완료
        </button>
      </div>
    </div>
  );
}
