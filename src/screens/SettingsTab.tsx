import { useState } from 'react';
import { BODY_PARTS } from '../constants';

type Templates = Record<string, string[]>;

interface Props {
  templates: Templates;
  onUpdate: (templates: Templates) => void;
}

export default function SettingsTab({ templates, onUpdate }: Props) {
  const [activeTab, setActiveTab] = useState<string>(BODY_PARTS[0]);
  const [inputValue, setInputValue] = useState('');

  const current = templates[activeTab] ?? [];

  const handleAdd = () => {
    const name = inputValue.trim();
    if (!name) return;
    if (current.includes(name)) { setInputValue(''); return; }
    const next = { ...templates, [activeTab]: [...current, name] };
    onUpdate(next);
    setInputValue('');
  };

  const handleDelete = (name: string) => {
    const next = { ...templates, [activeTab]: current.filter(n => n !== name) };
    onUpdate(next);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleAdd();
  };

  return (
    <div className="fade-up" style={{ paddingBottom: 'calc(var(--nav-h) + env(safe-area-inset-bottom, 0px) + 16px)' }}>
      {/* 헤더 */}
      <div style={{ padding: '24px 20px 0' }}>
        <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-3)', marginBottom: 4 }}>환경설정</div>
        <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 6 }}>설정</div>
      </div>

      {/* 섹션 타이틀 */}
      <div style={{ padding: '20px 20px 0' }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>운동 종목 관리</div>
        <div style={{ fontSize: 13, color: 'var(--text-3)', marginBottom: 16 }}>
          부위별 운동 종목을 미리 등록하면 운동 탭에서 빠르게 선택할 수 있어요.
        </div>
      </div>

      {/* 부위 탭바 */}
      <div style={{
        display: 'flex', gap: 8, overflowX: 'auto',
        padding: '0 20px 16px', scrollbarWidth: 'none',
      }}>
        {BODY_PARTS.map(part => {
          const count = (templates[part] ?? []).length;
          return (
            <button
              key={part}
              className={`part-tab${activeTab === part ? ' active' : ''}`}
              onClick={() => { setActiveTab(part); setInputValue(''); }}
              style={{ position: 'relative' }}
            >
              {part}
              {count > 0 && (
                <span style={{
                  marginLeft: 5, fontSize: 11, fontWeight: 700,
                  color: activeTab === part ? 'var(--lime-text)' : 'var(--lime)',
                  opacity: activeTab === part ? 0.8 : 1,
                }}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 종목 목록 */}
      <div style={{ padding: '0 20px' }}>
        {current.length === 0 ? (
          <div style={{
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: 14, padding: '20px 16px', textAlign: 'center',
            color: 'var(--text-3)', fontSize: 14, marginBottom: 12,
          }}>
            아직 등록된 종목이 없어요
          </div>
        ) : (
          <div style={{ marginBottom: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {current.map((name, i) => (
              <div
                key={i}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  background: 'var(--surface)', border: '1px solid var(--border)',
                  borderRadius: 12, padding: '12px 14px',
                }}
              >
                <span style={{ fontSize: 15, fontWeight: 500, color: 'var(--text)' }}>
                  {name}
                </span>
                <button
                  className="btn-icon"
                  style={{ width: 28, height: 28, borderRadius: 8, flexShrink: 0 }}
                  onClick={() => handleDelete(name)}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}

        {/* 종목 추가 입력 */}
        <div style={{
          display: 'flex', gap: 8,
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 14, padding: '10px 14px',
          alignItems: 'center',
        }}>
          <input
            type="text"
            placeholder={`${activeTab} 종목 이름 입력`}
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            style={{ flex: 1, fontSize: 15, color: 'var(--text)', background: 'none', border: 'none', outline: 'none' }}
          />
          <button
            className="btn btn-lime btn-sm"
            style={{ flexShrink: 0, height: 36, fontSize: 13, borderRadius: 10, padding: '0 14px' }}
            onClick={handleAdd}
            disabled={!inputValue.trim()}
          >
            추가
          </button>
        </div>
      </div>
    </div>
  );
}
