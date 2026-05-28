export function formatTime(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return [h, m, s].map(v => String(v).padStart(2, '0')).join(':');
}

export function formatDate(date: Date): string {
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const dayOfWeek = days[date.getDay()];
  return `${year}년 ${month}월 ${day}일 ${dayOfWeek}요일`;
}

export function formatDateShort(dateStr: string): string {
  const parts = dateStr.split('-');
  return `${parts[0]}년 ${parts[1]}월 ${parts[2]}일`;
}

export function todayString(): string {
  return new Date().toISOString().split('T')[0];
}
