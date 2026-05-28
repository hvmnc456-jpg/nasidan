import type { AppTab } from '../types';

interface Props {
  tab: AppTab;
  setTab: (tab: AppTab) => void;
  disabled?: boolean;
}

function HomeIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
      stroke={active ? '#a3e635' : '#52525b'} strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H5a1 1 0 01-1-1V9.5z" />
      <path d="M9 21V12h6v9" />
    </svg>
  );
}

function WorkoutIcon({ active }: { active: boolean }) {
  const c = active ? '#a3e635' : '#52525b';
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
      stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="10.5" width="3" height="3" rx="1" fill={c} stroke="none" />
      <rect x="5" y="8.5" width="3" height="7" rx="1" />
      <rect x="8" y="11" width="8" height="2" rx="1" fill={c} stroke="none" />
      <rect x="16" y="8.5" width="3" height="7" rx="1" />
      <rect x="19" y="10.5" width="3" height="3" rx="1" fill={c} stroke="none" />
    </svg>
  );
}

function DietIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
      stroke={active ? '#a3e635' : '#52525b'} strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8h1a4 4 0 010 8h-1" />
      <path d="M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z" />
      <line x1="6" y1="1" x2="6" y2="4" />
      <line x1="10" y1="1" x2="10" y2="4" />
      <line x1="14" y1="1" x2="14" y2="4" />
    </svg>
  );
}

const TABS: { id: AppTab; label: string }[] = [
  { id: 'home',    label: '홈'  },
  { id: 'workout', label: '운동' },
  { id: 'diet',   label: '식단' },
];

export default function BottomNav({ tab, setTab, disabled }: Props) {
  return (
    <div className="flex border-t border-zinc-800 bg-zinc-950">
      {TABS.map(t => {
        const active = tab === t.id;
        return (
          <button
            key={t.id}
            onClick={() => !disabled && setTab(t.id)}
            className={[
              'flex-1 flex flex-col items-center justify-center py-3 gap-1 transition-colors',
              disabled && t.id !== tab ? 'opacity-40' : '',
            ].join(' ')}
          >
            {t.id === 'home'    && <HomeIcon    active={active} />}
            {t.id === 'workout' && <WorkoutIcon active={active} />}
            {t.id === 'diet'   && <DietIcon    active={active} />}
            <span className={[
              'text-[10px] font-sans font-medium leading-none',
              active ? 'text-lime-400' : 'text-zinc-600',
            ].join(' ')}>
              {t.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
