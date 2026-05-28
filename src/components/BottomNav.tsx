import type { AppTab } from '../types';

interface Props {
  tab: AppTab;
  setTab: (tab: AppTab) => void;
  disabled?: boolean;
}

function IconHome({ active: _active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V9.5z" />
      <path d="M9 21V12h6v9" />
    </svg>
  );
}

function IconDumbbell({ active: _active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="9" width="3" height="6" rx="1" />
      <rect x="4.5" y="10.5" width="2" height="3" rx="0.5" />
      <rect x="17.5" y="10.5" width="2" height="3" rx="0.5" />
      <rect x="19" y="9" width="3" height="6" rx="1" />
      <line x1="6.5" y1="12" x2="17.5" y2="12" strokeWidth="2.5" />
    </svg>
  );
}

function IconDiet({ active: _active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="8" y1="2" x2="8" y2="22" />
      <path d="M5 2v4a3 3 0 0 0 6 0V2" />
      <path d="M19 2v6.5a2.5 2.5 0 0 1-2.5 2.5H15V22" />
      <line x1="19" y1="2" x2="15" y2="7" />
    </svg>
  );
}

const TABS: { id: AppTab; label: string }[] = [
  { id: 'home',    label: '홈'  },
  { id: 'workout', label: '운동' },
  { id: 'diet',    label: '식단' },
];

export default function BottomNav({ tab, setTab, disabled }: Props) {
  return (
    <nav className="nav">
      {TABS.map(t => {
        const active = tab === t.id;
        const locked = !!disabled && t.id !== tab;
        return (
          <button
            key={t.id}
            className={`nav-btn${active ? ' active' : ''}${locked ? ' locked' : ''}`}
            onClick={() => !locked && setTab(t.id)}
          >
            {t.id === 'home'    && <IconHome    active={active} />}
            {t.id === 'workout' && <IconDumbbell active={active} />}
            {t.id === 'diet'    && <IconDiet    active={active} />}
            <span>{t.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
