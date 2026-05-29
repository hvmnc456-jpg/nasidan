import { useState, useEffect, useRef } from 'react';
import type { Exercise, LapEntry, ExerciseTimerStatus } from '../types';
import { formatTime } from '../utils/time';

interface Props {
  exercise: Exercise;
  onUpdateName: (id: string, name: string) => void;
  onUpdateSet: (id: string, setIndex: number, field: 'weight' | 'reps', value: number) => void;
  onAddSet: (id: string) => void;
  onRemoveSet: (id: string, setIndex: number) => void;
  onRemove: (id: string) => void;
  onTimerComplete: (id: string, duration: number, lapLog: LapEntry[]) => void;
  onTimerStateChange: (id: string, isActive: boolean) => void;
}

interface LapRow {
  label: string;
  duration: number;
  isRest: boolean;
  isLive: boolean;
}

// lapLog + 현재 elapsed → 세트/휴식 구간 계산
function computeLaps(lapLog: LapEntry[], currentElapsed: number): LapRow[] {
  const rows: LapRow[] = [];
  let setIdx = 0;

  for (let i = 0; i < lapLog.length; i++) {
    const cur = lapLog[i];
    if (cur.type === 'complete') break;

    const next = lapLog[i + 1];
    const end = next ? next.timestamp : currentElapsed;
    const duration = Math.max(0, end - cur.timestamp);
    const isLive = !next;

    if (cur.type === 'workout_start' || cur.type === 'workout_resume') {
      setIdx++;
      rows.push({ label: `${setIdx}세트`, duration, isRest: false, isLive });
    } else if (cur.type === 'rest_start') {
      rows.push({ label: '휴식', duration, isRest: true, isLive });
    }
  }
  return rows;
}

export default function ExerciseItem({
  exercise,
  onUpdateName, onUpdateSet, onAddSet, onRemoveSet, onRemove,
  onTimerComplete, onTimerStateChange,
}: Props) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [timerStatus, setTimerStatus] = useState<ExerciseTimerStatus>('idle');
  const [elapsed, setElapsed] = useState(0);
  const [lapLog, setLapLog] = useState<LapEntry[]>([]);

  const startTimeRef = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lapLogRef = useRef<LapEntry[]>([]);
  const elapsedRef = useRef(0);
  const lapScrollRef = useRef<HTMLDivElement>(null);

  // 인터벌 관리
  useEffect(() => {
    if (timerStatus === 'working' || timerStatus === 'resting') {
      intervalRef.current = setInterval(() => {
        const s = Math.floor((Date.now() - startTimeRef.current) / 1000);
        elapsedRef.current = s;
        setElapsed(s);
      }, 200);
    } else {
      if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
    }
    return () => { if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; } };
  }, [timerStatus]);

  // 랩 추가될 때마다 스크롤 하단으로
  useEffect(() => {
    if (lapScrollRef.current) {
      lapScrollRef.current.scrollTop = lapScrollRef.current.scrollHeight;
    }
  }, [lapLog.length]);

  const isActive = timerStatus === 'working' || timerStatus === 'resting';
  const timerColor = timerStatus === 'resting' ? 'var(--amber)' : 'var(--lime)';


  const handleStart = () => {
    startTimeRef.current = Date.now();
    const entry: LapEntry = { timestamp: 0, type: 'workout_start' };
    lapLogRef.current = [entry];
    setLapLog([entry]);
    setTimerStatus('working');
    onTimerStateChange(exercise.id, true);
  };

  const handleRest = () => {
    const ts = elapsedRef.current;
    const entry: LapEntry = { timestamp: ts, type: 'rest_start' };
    const next = [...lapLogRef.current, entry];
    lapLogRef.current = next;
    setLapLog(next);
    setTimerStatus('resting');
  };

  const handleResume = () => {
    const ts = elapsedRef.current;
    const entry: LapEntry = { timestamp: ts, type: 'workout_resume' };
    const next = [...lapLogRef.current, entry];
    lapLogRef.current = next;
    setLapLog(next);
    setTimerStatus('working');
  };

  const handleComplete = () => {
    const ts = elapsedRef.current;
    const finalLog: LapEntry[] = [...lapLogRef.current, { timestamp: ts, type: 'complete' }];
    lapLogRef.current = finalLog;
    setLapLog(finalLog);
    setTimerStatus('completed');
    onTimerStateChange(exercise.id, false);
    onTimerComplete(exercise.id, ts, finalLog);
    setIsExpanded(false);
  };

  const laps = computeLaps(lapLog, elapsed);
  // isLive = 현재 진행 중 → 아직 완료된 세트가 아님
  const completedSets = laps.filter(l => !l.isRest && !l.isLive).length;

  // ─── 랩 로그 테이블 ───────────────────────────
  const LapLog = ({ scrollable }: { scrollable: boolean }) => (
    <div
      ref={scrollable ? lapScrollRef : undefined}
      style={{
        marginTop: 10,
        maxHeight: scrollable ? 140 : undefined,
        overflowY: scrollable ? 'auto' : 'visible',
        borderRadius: 10,
        background: 'var(--surface-2)',
        padding: '4px 0',
      }}
    >
      {laps.map((row, i) => (
        <div key={i} style={{
          display: 'flex', alignItems: 'center',
          padding: '7px 12px',
          borderBottom: i < laps.length - 1 ? '1px solid var(--border-2)' : 'none',
        }}>
          {/* 세트/휴식 레이블 */}
          <span style={{
            width: 46, fontSize: 12, fontWeight: 700,
            color: row.isRest ? 'var(--amber)' : 'var(--lime)',
            flexShrink: 0,
          }}>
            {row.label}
          </span>

          {/* 구간 시간 */}
          <span style={{
            fontFamily: 'var(--ff-mono)', fontSize: 13,
            color: row.isLive
              ? (row.isRest ? 'var(--amber)' : 'var(--lime)')
              : 'var(--text-2)',
            flex: 1,
          }}>
            {formatTime(row.duration)}
          </span>

          {/* 현재 진행 중 표시 */}
          {row.isLive && (
            <div className="blink" style={{
              width: 6, height: 6, borderRadius: '50%',
              background: row.isRest ? 'var(--amber)' : 'var(--lime)',
              flexShrink: 0,
            }} />
          )}
        </div>
      ))}
    </div>
  );

  // ─── 접힌 상태 ───────────────────────────────────
  if (!isExpanded) {
    return (
      <div className="card" style={{ marginBottom: 12 }}>
        {/* 이름 행 — 클릭하면 펼치기 */}
        <div
          style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}
          onClick={() => setIsExpanded(true)}
        >
          <div style={{ color: 'var(--text-3)', flexShrink: 0, lineHeight: 0 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </div>
          <span style={{ flex: 1, fontSize: 15, fontWeight: 600, color: exercise.name ? 'var(--text)' : 'var(--text-3)' }}>
            {exercise.name || '운동 이름'}
          </span>
          <div style={{ display: 'flex', gap: 4, alignItems: 'center', flexShrink: 0 }}>
            <span className="pill pill-dark" style={{ fontSize: 11 }}>{exercise.sets.length}세트</span>
            {timerStatus === 'completed' && (
              <span className="pill pill-lime" style={{ fontSize: 11 }}>✓ {formatTime(elapsed)}</span>
            )}
            {isActive && (
              <span className={timerStatus === 'working' ? 'pill pill-lime' : 'pill pill-amber'} style={{ fontSize: 11 }}>
                {timerStatus === 'working' ? `${completedSets + 1}세트 중` : '휴식 중'}
              </span>
            )}
          </div>
        </div>

        {/* 타이머 섹션 — 항상 표시, 이벤트 버블링 차단 */}
        <div
          style={{ marginTop: 12, paddingTop: 10, borderTop: '1px solid var(--border-2)' }}
          onClick={e => e.stopPropagation()}
        >
          {/* 대기 */}
          {timerStatus === 'idle' && (
            <button className="btn btn-full btn-dark" style={{ height: 40, fontSize: 14 }} onClick={handleStart}>
              운동 시작
            </button>
          )}

          {/* 진행 중 / 휴식 중 */}
          {isActive && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <div className="blink" style={{ width: 8, height: 8, borderRadius: '50%', background: timerColor, flexShrink: 0 }} />
                <span className={timerStatus === 'working' ? 'pill pill-lime' : 'pill pill-amber'} style={{ fontSize: 11 }}>
                  {timerStatus === 'working' ? `${completedSets + 1}세트 운동 중` : '휴식 중'}
                </span>
                <span style={{ fontFamily: 'var(--ff-mono)', fontSize: 18, fontWeight: 700, color: timerColor, letterSpacing: '-0.02em', marginLeft: 'auto' }}>
                  {formatTime(elapsed)}
                </span>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                {timerStatus === 'working'
                  ? <button className="btn btn-dark" style={{ flex: 1, height: 40, fontSize: 14 }} onClick={handleRest}>휴식</button>
                  : <button className="btn btn-amber" style={{ flex: 1, height: 40, fontSize: 14 }} onClick={handleResume}>운동 재개</button>
                }
                <button className="btn btn-lime" style={{ flex: 1, height: 40, fontSize: 14 }} onClick={handleComplete}>완료</button>
              </div>
            </>
          )}

          {/* 완료 */}
          {timerStatus === 'completed' && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--lime)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              <span style={{ fontSize: 13, color: 'var(--text-2)' }}>총 {completedSets}세트 완료</span>
              <span style={{ fontFamily: 'var(--ff-mono)', fontSize: 15, fontWeight: 700, color: 'var(--lime)' }}>
                {formatTime(elapsed)}
              </span>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ─── 펼친 상태 ───────────────────────────────────
  return (
    <div className="card" style={{ marginBottom: 12 }}>
      {/* 운동 이름 행 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <button
          style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: 'var(--text-3)', lineHeight: 0, flexShrink: 0 }}
          onClick={() => setIsExpanded(false)}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="18 15 12 9 6 15"/>
          </svg>
        </button>
        <input
          type="text"
          placeholder="운동 이름"
          value={exercise.name}
          onChange={e => onUpdateName(exercise.id, e.target.value)}
          style={{ flex: 1, fontSize: 16, fontWeight: 600, color: 'var(--text)' }}
          readOnly={isActive || timerStatus === 'completed'}
        />
        {timerStatus === 'idle' && (
          <button className="btn-icon" onClick={() => onRemove(exercise.id)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        )}
        {timerStatus === 'completed' && (
          <span className="pill pill-lime" style={{ fontSize: 11 }}>완료</span>
        )}
      </div>

      {/* 세트 헤더 */}
      <div style={{ display: 'grid', gridTemplateColumns: '28px 1fr 1fr 28px', gap: 6, marginBottom: 6 }}>
        <div />
        <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-3)', textAlign: 'center', letterSpacing: '0.04em' }}>무게 (kg)</div>
        <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-3)', textAlign: 'center', letterSpacing: '0.04em' }}>횟수</div>
        <div />
      </div>

      {/* 세트 행 */}
      {exercise.sets.map((set, i) => {
        // 완료된 세트는 하이라이트 (lapLog 기준)
        const completedSetCount = laps.filter(l => !l.isRest && !l.isLive).length;
        const isDone = i < completedSetCount;
        return (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '28px 1fr 1fr 28px', gap: 6, marginBottom: 6, alignItems: 'center', opacity: isDone ? 0.5 : 1 }}>
            <div style={{
              width: 24, height: 24, borderRadius: '50%',
              background: isDone ? 'var(--lime-bg)' : 'var(--surface-2)',
              color: isDone ? 'var(--lime)' : 'var(--text-3)',
              fontSize: 11, fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              {isDone ? '✓' : i + 1}
            </div>
            <div className="num-input-wrap" style={{ padding: '8px 10px' }}>
              <input
                type="number" min="0" step="0.5"
                value={set.weight || ''} placeholder="0"
                readOnly={isActive || timerStatus === 'completed'}
                onChange={e => onUpdateSet(exercise.id, i, 'weight', parseFloat(e.target.value) || 0)}
              />
            </div>
            <div className="num-input-wrap" style={{ padding: '8px 10px' }}>
              <input
                type="number" min="1"
                value={set.reps || ''} placeholder="10"
                readOnly={isActive || timerStatus === 'completed'}
                onChange={e => onUpdateSet(exercise.id, i, 'reps', parseInt(e.target.value) || 0)}
              />
            </div>
            {timerStatus === 'idle' && exercise.sets.length > 1 ? (
              <button className="btn-icon" style={{ width: 24, height: 24, borderRadius: 6, flexShrink: 0 }}
                onClick={() => onRemoveSet(exercise.id, i)}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            ) : <div />}
          </div>
        );
      })}

      {/* 세트 추가 */}
      {timerStatus === 'idle' && (
        <button className="add-ex-btn" style={{ marginTop: 8, height: 36, fontSize: 13 }}
          onClick={() => onAddSet(exercise.id)}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          세트 추가
        </button>
      )}

      {/* ─── 타이머 섹션 ─── */}
      <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid var(--border-2)' }}>

        {/* 대기 */}
        {timerStatus === 'idle' && (
          <button className="btn btn-full btn-dark" style={{ height: 44, fontSize: 15 }} onClick={handleStart}>
            운동 시작
          </button>
        )}

        {/* 진행 중 / 휴식 중 */}
        {isActive && (
          <>
            {/* 상태 + 전체 경과 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <div className="blink" style={{ width: 8, height: 8, borderRadius: '50%', background: timerColor, flexShrink: 0 }} />
              <span className={timerStatus === 'working' ? 'pill pill-lime' : 'pill pill-amber'} style={{ fontSize: 12 }}>
                {timerStatus === 'working' ? `${completedSets + 1}세트 운동 중` : '휴식 중'}
              </span>
              <span style={{ fontFamily: 'var(--ff-mono)', fontSize: 20, fontWeight: 700, color: timerColor, letterSpacing: '-0.02em', marginLeft: 'auto' }}>
                {formatTime(elapsed)}
              </span>
            </div>

            {/* 랩 로그 */}
            {laps.length > 0 && <LapLog scrollable />}

            {/* 버튼 */}
            <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
              {timerStatus === 'working'
                ? <button className="btn btn-dark" style={{ flex: 1, height: 44, fontSize: 14 }} onClick={handleRest}>휴식</button>
                : <button className="btn btn-amber" style={{ flex: 1, height: 44, fontSize: 14 }} onClick={handleResume}>운동 재개</button>
              }
              <button className="btn btn-lime" style={{ flex: 1, height: 44, fontSize: 14 }} onClick={handleComplete}>완료</button>
            </div>
          </>
        )}

        {/* 완료 */}
        {timerStatus === 'completed' && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--lime)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              <span style={{ fontSize: 13, color: 'var(--text-2)' }}>
                총 {completedSets}세트 완료
              </span>
              <span style={{ fontFamily: 'var(--ff-mono)', fontSize: 16, fontWeight: 700, color: 'var(--lime)' }}>
                {formatTime(elapsed)}
              </span>
            </div>
            {laps.length > 0 && <LapLog scrollable={false} />}
          </>
        )}
      </div>
    </div>
  );
}
