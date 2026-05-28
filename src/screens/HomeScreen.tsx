import { BODY_PARTS } from '../constants';

interface Props {
  selectedBodyParts: string[];
  toggleBodyPart: (part: string) => void;
  goToExercises: () => void;
}

export default function HomeScreen({ selectedBodyParts, toggleBodyPart, goToExercises }: Props) {
  return (
    <div className="screen" style={{ display: 'flex', flexDirection: 'column', minHeight: '100%' }}>
      <div style={{ marginBottom: 6 }}>
        <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-3)', marginBottom: 4 }}>운동 시작</div>
        <div style={{ fontSize: 21, fontWeight: 700, letterSpacing: '-0.02em' }}>오늘 운동할 부위 선택</div>
      </div>

      <div style={{ height: 1, background: 'var(--border-2)', margin: '20px 0' }} />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 20 }}>
        {BODY_PARTS.map(part => {
          const active = selectedBodyParts.includes(part);
          return (
            <button
              key={part}
              onClick={() => toggleBodyPart(part)}
              style={{
                height: 64,
                borderRadius: 14,
                border: `1px solid ${active ? 'var(--lime)' : 'var(--border)'}`,
                background: active ? 'var(--lime)' : 'var(--surface)',
                color: active ? 'var(--lime-text)' : 'var(--text-2)',
                fontFamily: 'var(--font-sans)',
                fontSize: 15,
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s',
                boxShadow: active ? '0 0 16px rgba(163,230,53,0.2)' : 'none',
              }}
            >
              {part}
            </button>
          );
        })}
      </div>

      {selectedBodyParts.length > 0 && (
        <div style={{ fontSize: 14, color: 'var(--lime)', fontWeight: 500, marginBottom: 16, textAlign: 'center' }}>
          {selectedBodyParts.join(' · ')} 선택됨
        </div>
      )}

      <div style={{ marginTop: 'auto' }}>
        <button
          className="btn btn-full btn-lime"
          disabled={selectedBodyParts.length === 0}
          onClick={goToExercises}
        >
          다음
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </button>
      </div>
    </div>
  );
}
