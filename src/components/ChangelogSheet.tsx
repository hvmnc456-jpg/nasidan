import { useEffect } from 'react';
import { CHANGELOG } from '../data/changelog';

interface Props {
  onClose: () => void;
}

const DAYS_KR = ['일', '월', '화', '수', '목', '금', '토'];

function formatDate(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const dow = DAYS_KR[new Date(y, m - 1, d).getDay()];
  return `${y}년 ${m}월 ${d}일 (${dow})`;
}

export default function ChangelogSheet({ onClose }: Props) {
  // 바깥 스크롤 방지
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  return (
    <>
      {/* 오버레이 */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.6)',
          zIndex: 200,
          backdropFilter: 'blur(2px)',
          WebkitBackdropFilter: 'blur(2px)',
        }}
      />

      {/* 바텀 시트 */}
      <div
        style={{
          position: 'fixed',
          left: 0, right: 0, bottom: 0,
          maxWidth: 430,
          margin: '0 auto',
          zIndex: 201,
          background: 'var(--surface)',
          borderRadius: '20px 20px 0 0',
          borderTop: '1px solid var(--border)',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
          maxHeight: '80dvh',
          display: 'flex',
          flexDirection: 'column',
          animation: 'slideUp 0.25s cubic-bezier(0.32,0.72,0,1)',
        }}
      >
        {/* 핸들 */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 4px' }}>
          <div style={{ width: 36, height: 4, borderRadius: 9999, background: 'var(--surface-3)' }} />
        </div>

        {/* 헤더 */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 20px 16px' }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.01em' }}>업데이트 내역</div>
            <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>최근 5일 기준</div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'var(--surface-2)', border: 'none', cursor: 'pointer',
              width: 32, height: 32, borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--text-2)',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* 내용 (스크롤) */}
        <div style={{ overflowY: 'auto', padding: '0 20px 24px', flex: 1 }}>
          {CHANGELOG.map((entry, ei) => (
            <div key={ei} style={{ marginBottom: ei < CHANGELOG.length - 1 ? 24 : 0 }}>
              {/* 날짜 행 */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: ei === 0 ? 'var(--lime)' : 'var(--surface-3)', flexShrink: 0 }} />
                <span style={{ fontSize: 13, fontWeight: 700, color: ei === 0 ? 'var(--text)' : 'var(--text-2)' }}>
                  {formatDate(entry.date)}
                </span>
                {entry.label && (
                  <span className={`pill ${ei === 0 ? 'pill-lime' : 'pill-dark'}`} style={{ fontSize: 10 }}>
                    {entry.label}
                  </span>
                )}
              </div>

              {/* 항목 목록 */}
              <div style={{ paddingLeft: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {entry.items.map((item, ii) => (
                  <div key={ii} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                    <span style={{ fontSize: 13, color: 'var(--text-3)', flexShrink: 0, marginTop: 1 }}>·</span>
                    <span style={{ fontSize: 14, color: ei === 0 ? 'var(--text)' : 'var(--text-2)', lineHeight: 1.5 }}>
                      {item}
                    </span>
                  </div>
                ))}
              </div>

              {/* 구분선 */}
              {ei < CHANGELOG.length - 1 && (
                <div style={{ height: 1, background: 'var(--border-2)', marginTop: 20 }} />
              )}
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to   { transform: translateY(0); }
        }
      `}</style>
    </>
  );
}
