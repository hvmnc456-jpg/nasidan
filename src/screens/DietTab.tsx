export default function DietTab() {
  return (
    <div className="screen fade-up" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '70vh', gap: 16, textAlign: 'center' }}>
      <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="var(--text-3)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="8" y1="2" x2="8" y2="22"/>
        <path d="M5 2v4a3 3 0 0 0 6 0V2"/>
        <path d="M19 2v6.5a2.5 2.5 0 0 1-2.5 2.5H15V22"/>
        <line x1="19" y1="2" x2="15" y2="7"/>
      </svg>
      <div>
        <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.01em', marginBottom: 8 }}>식단 기록</div>
        <div style={{ fontSize: 15, color: 'var(--text-3)', lineHeight: 1.7 }}>
          준비 중인 기능이에요<br />곧 업데이트될 예정입니다
        </div>
      </div>
    </div>
  );
}
