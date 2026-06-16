import { useState, useEffect } from 'react';
import { useWorkout } from './hooks/useWorkout';
import type { AppTab } from './types';

import BottomNav from './components/BottomNav';
import UpdateNotification from './components/UpdateNotification';

import HomeTab from './screens/HomeTab';
import DietTab from './screens/DietTab';
import RecordsTab from './screens/RecordsTab';
import SettingsTab from './screens/SettingsTab';
import HomeScreen from './screens/HomeScreen';
import ExerciseListScreen from './screens/ExerciseListScreen';
import SummaryScreen from './screens/SummaryScreen';
import HistoryScreen from './screens/HistoryScreen';

type Templates = Record<string, string[]>;

function loadTemplates(): Templates {
  try {
    const raw = localStorage.getItem('exercise-templates');
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

// 기본값은 다크 모드. localStorage 'theme'이 'light'일 때만 라이트 모드
function loadDarkMode(): boolean {
  return localStorage.getItem('theme') !== 'light';
}

export default function App() {
  const [appTab, setAppTab] = useState<AppTab>('home');
  const [templates, setTemplates] = useState<Templates>(() => loadTemplates());
  const [darkMode, setDarkMode] = useState<boolean>(() => loadDarkMode());

  useEffect(() => {
    document.documentElement.classList.toggle('light', !darkMode);
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', darkMode ? '#09090b' : '#f4f4f5');
    document.querySelector('meta[name="color-scheme"]')?.setAttribute('content', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  const workout = useWorkout();
  const { screen, completedSession } = workout;

  const contentKey = appTab === 'workout' ? `workout-${screen}` : appTab;

  const handleTemplatesUpdate = (next: Templates) => {
    setTemplates(next);
    localStorage.setItem('exercise-templates', JSON.stringify(next));
  };

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
    if (appTab === 'settings') {
      return (
        <SettingsTab
          templates={templates}
          onUpdate={handleTemplatesUpdate}
          darkMode={darkMode}
          onToggleDarkMode={() => setDarkMode(v => !v)}
        />
      );
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
            templates={templates}
            addExercise={workout.addExercise}
            addExerciseWithName={workout.addExerciseWithName}
            updateExerciseName={workout.updateExerciseName}
            updateSet={workout.updateSet}
            addSet={workout.addSet}
            removeSet={workout.removeSet}
            removeExercise={workout.removeExercise}
            completeWorkout={workout.completeWorkout}
            setScreen={workout.setScreen}
          />
        )}
        {screen === 'summary' && completedSession && (
          <SummaryScreen
            session={completedSession}
            templates={templates}
            onUpdateTemplates={handleTemplatesUpdate}
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
        setTab={setAppTab}
      />
      <UpdateNotification />
    </div>
  );
}
