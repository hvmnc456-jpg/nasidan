export default function DietTab() {
  return (
    <div className="flex flex-col items-center justify-center min-h-full px-8 text-center">
      <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-5">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
          stroke="#52525b" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8h1a4 4 0 010 8h-1" />
          <path d="M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z" />
          <line x1="6" y1="1" x2="6" y2="4" />
          <line x1="10" y1="1" x2="10" y2="4" />
          <line x1="14" y1="1" x2="14" y2="4" />
        </svg>
      </div>
      <p className="text-zinc-300 font-semibold font-sans text-base mb-2">식단 기록</p>
      <p className="text-zinc-600 text-sm font-sans leading-relaxed">
        준비 중인 기능이에요
        <br />
        곧 업데이트될 예정입니다
      </p>
    </div>
  );
}
