import { useState } from 'react';
import { useWorkout } from './hooks/useWorkout';
import type { AppTab } from './types';

import BottomNav from './components/BottomNav';
import UpdateNotification from './components/UpdateNotification';

import HomeTab from './screens/HomeTab';
import DietTab from './screens/DietTab';
import RecordsTab from './screens/RecordsTab';
import HomeScreen from './screens/HomeScreen';
import ExerciseListScreen from './screens/ExerciseListScreen';
import SummaryScreen from './screens/SummaryScreen';
import HistoryScreen from './screens/HistoryScreen';

export default function App() {
  const [appTab, setAppTab] = useState<AppTab>('home');
  const [isTimerActive, setIsTimerActive] = useState(false);
  const workout = useWorkout();
  const { screen, completedSession } = workout;

  const contentKey = appTab === 'workout' ? `workout-${screen}` : appTab;

  const renderContent = () => {
    if (appTab === 'home') {
      return <HomeTab history={workout.history} deleteSession={workout.deleteSession} />;
    }
    if (appTab === 'diet') {
      return <DietTab />;
    }
    if (appTab === 'records') {
      return <RecordsTab history={workout.history} />;
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
            updateExerciseName={workout.updateExerciseName}
            updateSet={workout.updateSet}
            addSet={workout.addSet}
            removeSet={workout.removeSet}
            removeExercise={workout.removeExercise}
            updateExerciseTimer={workout.updateExerciseTimer}
            completeWorkout={workout.completeWorkout}
            onTimerChange={setIsTimerActive}
            setScreen={workout.setScreen}
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
