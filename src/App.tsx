import { useState } from 'react';
import { useWorkout } from './hooks/useWorkout';
import type { AppTab } from './types';

import BottomNav from './components/BottomNav';
import UpdateNotification from './components/UpdateNotification';

import HomeTab from './screens/HomeTab';
import DietTab from './screens/DietTab';
import HomeScreen from './screens/HomeScreen';
import ExerciseListScreen from './screens/ExerciseListScreen';
import TimerScreen from './screens/TimerScreen';
import SummaryScreen from './screens/SummaryScreen';
import HistoryScreen from './screens/HistoryScreen';

export default function App() {
  const [appTab, setAppTab] = useState<AppTab>('home');
  const workout = useWorkout();
  const { screen, completedSession } = workout;

  // 타이머 진행 중에는 탭 전환 잠금
  const isTimerActive = screen === 'timer';

  // 애니메이션 key: 탭 전환 또는 운동 화면 전환 시 fade
  const contentKey = appTab === 'workout' ? `workout-${screen}` : appTab;

  const renderContent = () => {
    if (appTab === 'home') {
      return <HomeTab history={workout.history} deleteSession={workout.deleteSession} />;
    }

    if (appTab === 'diet') {
      return <DietTab />;
    }

    // [운동] 탭 — workout flow
    return (
      <>
        {screen === 'home' && (
          <HomeScreen
            selectedBodyParts={workout.selectedBodyParts}
            toggleBodyPart={workout.toggleBodyPart}
            goToExercises={workout.goToExercises}
          />
        )}
        {screen === 'exercises' && (
          <ExerciseListScreen
            selectedBodyParts={workout.selectedBodyParts}
            exercises={workout.exercises}
            addExercise={workout.addExercise}
            updateExercise={workout.updateExercise}
            removeExercise={workout.removeExercise}
            startWorkout={workout.startWorkout}
            setScreen={workout.setScreen}
          />
        )}
        {screen === 'timer' && (
          <TimerScreen
            elapsedSeconds={workout.elapsedSeconds}
            status={workout.status}
            lapLog={workout.lapLog}
            startRest={workout.startRest}
            resumeWorkout={workout.resumeWorkout}
            completeWorkout={workout.completeWorkout}
          />
        )}
        {screen === 'summary' && completedSession && (
          <SummaryScreen
            session={completedSession}
            resetWorkout={workout.resetWorkout}
            setScreen={workout.setScreen}
          />
        )}
        {screen === 'history' && (
          <HistoryScreen
            history={workout.history}
            completedSession={workout.completedSession}
            setScreen={workout.setScreen}
            deleteSession={workout.deleteSession}
          />
        )}
      </>
    );
  };

  return (
    <div className="flex justify-center bg-zinc-950" style={{ minHeight: '100dvh' }}>
      <div
        className="flex flex-col w-full max-w-[430px]"
        style={{
          height: '100dvh',
          paddingTop: 'var(--sat)',
          paddingLeft: 'var(--sal)',
          paddingRight: 'var(--sar)',
        }}
      >
        {/* 컨텐츠 영역 — 스크롤 가능 */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          <div key={contentKey} className="animate-fade-in min-h-full">
            {renderContent()}
          </div>
        </div>

        {/* 하단 탭 네비게이션 */}
        <div className="shrink-0" style={{ paddingBottom: 'var(--sab)' }}>
          <BottomNav
            tab={appTab}
            setTab={tab => {
              if (isTimerActive) return; // 타이머 중 전환 방지
              setAppTab(tab);
            }}
            disabled={isTimerActive}
          />
        </div>
      </div>

      {/* PWA 업데이트 알림 */}
      <UpdateNotification />
    </div>
  );
}
