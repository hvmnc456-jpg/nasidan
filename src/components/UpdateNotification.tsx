import { useEffect, useRef } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';

// 30초마다 새 버전 체크
const POLL_MS = 30_000;

export default function UpdateNotification() {
  const regRef = useRef<ServiceWorkerRegistration | null>(null);

  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      // SW 등록 완료 시 ref에 저장
      regRef.current = r ?? null;
    },
  });

  useEffect(() => {
    const check = () => void regRef.current?.update();

    // ① 페이지 로드 직후 5초 뒤 첫 체크 (SW 등록 완료 대기)
    const initial = window.setTimeout(check, 5_000);

    // ② 30초 간격 주기 폴링
    const timer = window.setInterval(check, POLL_MS);

    // ③ 앱이 포그라운드로 돌아오면 즉시 체크 (홈버튼 → 앱 복귀 등)
    const onVisible = () => {
      if (document.visibilityState === 'visible') check();
    };
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      window.clearTimeout(initial);
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, []);

  if (!needRefresh) return null;

  return (
    // 하단 탭 네비게이션(~63px) 위에 띄움
    <div
      className="fixed left-0 right-0 z-50 flex justify-center px-4"
      style={{ bottom: 'calc(var(--nav-h) + 8px + var(--sab, 0px))' }}
    >
      <div className="w-full max-w-[400px] bg-zinc-900 border border-lime-400/30 rounded-2xl px-4 py-3.5 flex items-center gap-3 shadow-2xl shadow-black/60">
        {/* 아이콘 */}
        <div className="w-9 h-9 rounded-full bg-lime-400/10 border border-lime-400/20 flex items-center justify-center shrink-0">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18" height="18" viewBox="0 0 24 24"
            fill="none" stroke="#a3e635" strokeWidth="2.5"
            strokeLinecap="round" strokeLinejoin="round"
          >
            <polyline points="23 4 23 10 17 10" />
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
          </svg>
        </div>

        {/* 텍스트 */}
        <div className="flex-1 min-w-0">
          <p className="text-zinc-50 text-sm font-semibold font-sans leading-tight">
            업데이트 사용 가능
          </p>
          <p className="text-zinc-500 text-xs font-sans mt-0.5 truncate">
            새 버전이 준비됐어요
          </p>
        </div>

        {/* 업데이트 버튼 */}
        <button
          onClick={() => updateServiceWorker(true)}
          className="bg-lime-400 text-zinc-950 px-4 py-2 rounded-xl text-sm font-bold font-sans active:scale-95 transition-all duration-150 shrink-0"
        >
          업데이트
        </button>
      </div>
    </div>
  );
}
