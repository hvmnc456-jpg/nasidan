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

function seedDemoData() {
  try {
    if (localStorage.getItem('workout-history')) return;
    const today = new Date();
    const fmt = (offset: number) => {
      const d = new Date(today);
      d.setDate(d.getDate() - offset);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    };
    const demo = [
      {
        id: 'demo-a', date: fmt(2), bodyParts: ['가슴', '삼두'],
        exercises: [
          { id: 'da1', bodyPart: '가슴', name: '벤치프레스',           weight: 80, sets: 4, repsPerSet: 8  },
          { id: 'da2', bodyPart: '가슴', name: '인클라인 덤벨 프레스', weight: 30, sets: 3, repsPerSet: 12 },
          { id: 'da3', bodyPart: '삼두', name: '트라이셉스 푸시다운',  weight: 25, sets: 3, repsPerSet: 15 },
        ],
        lapLog: [
          { timestamp: 0,    type: 'workout_start' },
          { timestamp: 1440, type: 'rest_start'     },
          { timestamp: 1560, type: 'workout_resume' },
          { timestamp: 3000, type: 'rest_start'     },
          { timestamp: 3120, type: 'workout_resume' },
          { timestamp: 4200, type: 'complete'       },
        ],
        totalDuration: 4200, avgWorkTime: 1380, avgRestTime: 120, restCount: 2,
      },
      {
        id: 'demo-b', date: fmt(5), bodyParts: ['등', '이두'],
        exercises: [
          { id: 'db1', bodyPart: '등',  name: '데드리프트', weight: 100, sets: 4, repsPerSet: 5  },
          { id: 'db2', bodyPart: '등',  name: '랫풀다운',   weight: 55,  sets: 3, repsPerSet: 12 },
          { id: 'db3', bodyPart: '이두', name: '바벨 컬',    weight: 35,  sets: 3, repsPerSet: 10 },
          { id: 'db4', bodyPart: '이두', name: '해머 컬',    weight: 16,  sets: 3, repsPerSet: 12 },
        ],
        lapLog: [
          { timestamp: 0,    type: 'workout_start' },
          { timestamp: 1800, type: 'rest_start'     },
          { timestamp: 1920, type: 'workout_resume' },
          { timestamp: 3600, type: 'rest_start'     },
          { timestamp: 3720, type: 'workout_resume' },
          { timestamp: 5100, type: 'complete'       },
        ],
        totalDuration: 5100, avgWorkTime: 1695, avgRestTime: 120, restCount: 2,
      },
      {
        id: 'demo-c', date: fmt(9), bodyParts: ['하체'],
        exercises: [
          { id: 'dc1', bodyPart: '하체', name: '스쿼트',       weight: 90,  sets: 5, repsPerSet: 5  },
          { id: 'dc2', bodyPart: '하체', name: '레그프레스',    weight: 120, sets: 3, repsPerSet: 12 },
          { id: 'dc3', bodyPart: '하체', name: '레그 익스텐션', weight: 40,  sets: 3, repsPerSet: 15 },
        ],
        lapLog: [
          { timestamp: 0,    type: 'workout_start' },
          { timestamp: 2100, type: 'rest_start'     },
          { timestamp: 2220, type: 'workout_resume' },
          { timestamp: 4500, type: 'complete'       },
        ],
        totalDuration: 4500, avgWorkTime: 2145, avgRestTime: 120, restCount: 1,
      },
    ];
    localStorage.setItem('workout-history', JSON.stringify(demo));
  } catch {}
}

seedDemoData();

export default function App() {
  const [appTab, setAppTab] = useState<AppTab>('home');
  const workout = useWorkout();
  const { screen, completedSession } = workout;

  const isTimerActive = screen === 'timer';
  const contentKey = appTab === 'workout' ? `workout-${screen}` : appTab;

  const renderContent = () => {
    if (appTab === 'home') {
      return <HomeTab history={workout.history} deleteSession={workout.deleteSession} />;
    }
    if (appTab === 'diet') {
      return <DietTab />;
    }
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
            selectedBodyParts={workout.selectedBodyParts}
            exercises={workout.exercises}
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
    <div className="shell">
      <div className="content">
        <div key={contentKey} className="animate-fade-in" style={{ minHeight: '100%' }}>
          {renderContent()}
        </div>
      </div>
      <BottomNav
        tab={appTab}
        setTab={tab => {
          if (isTimerActive) return;
          setAppTab(tab);
        }}
        disabled={isTimerActive}
      />
      <UpdateNotification />
    </div>
  );
}
