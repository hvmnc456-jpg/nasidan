import { BODY_PARTS } from '../constants';

interface Props {
  selectedBodyParts: string[];
  toggleBodyPart: (part: string) => void;
  goToExercises: () => void;
}

export default function HomeScreen({ selectedBodyParts, toggleBodyPart, goToExercises }: Props) {
  return (
    <div className="flex flex-col min-h-full">
      {/* 헤더 */}
      <div className="px-5 pt-10 pb-5">
        <p className="text-zinc-500 text-xs font-sans mb-0.5">운동 시작</p>
        <h1 className="text-zinc-50 text-xl font-bold font-sans leading-tight">
          오늘 운동할 부위 선택
        </h1>
      </div>

      {/* 부위 선택 그리드 */}
      <div className="px-5 flex-1">
        <div className="grid grid-cols-3 gap-3">
          {BODY_PARTS.map(part => {
            const selected = selectedBodyParts.includes(part);
            return (
              <button
                key={part}
                onClick={() => toggleBodyPart(part)}
                className={[
                  'h-16 rounded-2xl text-base font-bold font-sans transition-all duration-150 active:scale-95',
                  selected
                    ? 'bg-lime-400 text-zinc-950 shadow-lg shadow-lime-400/20'
                    : 'bg-zinc-900 text-zinc-300 border border-zinc-800',
                ].join(' ')}
              >
                {part}
              </button>
            );
          })}
        </div>

        {selectedBodyParts.length > 0 && (
          <p className="text-zinc-600 text-xs font-sans mt-4 text-center">
            {selectedBodyParts.join(' · ')} 선택됨
          </p>
        )}
      </div>

      {/* 다음 버튼 */}
      <div className="px-5 pt-4 pb-8 border-t border-zinc-800/60 mt-6">
        <button
          onClick={goToExercises}
          disabled={selectedBodyParts.length === 0}
          className={[
            'w-full h-14 rounded-2xl text-base font-bold font-sans transition-all duration-150',
            selectedBodyParts.length > 0
              ? 'bg-lime-400 text-zinc-950 active:scale-95 shadow-lg shadow-lime-400/20'
              : 'bg-zinc-900 text-zinc-600 cursor-not-allowed border border-zinc-800',
          ].join(' ')}
        >
          다음 →
        </button>
      </div>
    </div>
  );
}
