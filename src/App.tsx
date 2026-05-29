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
            exercises={workout.exercises}
            selectedParts={workout.selectedBodyParts}
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
        <div key={contentKey} className="fade-up">
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
