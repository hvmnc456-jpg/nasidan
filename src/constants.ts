export const BODY_PARTS = ['가슴', '어깨', '등', '이두', '삼두', '복근', '하체'] as const;

// 누적 kg 보드에 표시할 부위 (복근 제외 — 주로 맨몸 운동)
export const CUMULATIVE_PARTS = ['가슴', '어깨', '등', '이두', '삼두', '하체'] as const;
export type CumulativePart = typeof CUMULATIVE_PARTS[number];
