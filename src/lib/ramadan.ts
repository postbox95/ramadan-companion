export const RAMADAN_START = new Date(2026, 1, 19); // Feb 19, 2026

export function getRamadanDay(date: Date = new Date()): { day: number | null; daysUntil: number | null; totalDays: number } {
  const totalDays = 30;
  const start = new Date(RAMADAN_START);
  start.setHours(0, 0, 0, 0);
  const today = new Date(date);
  today.setHours(0, 0, 0, 0);

  const diffMs = today.getTime() - start.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return { day: null, daysUntil: Math.abs(diffDays), totalDays };
  }
  if (diffDays >= totalDays) {
    return { day: null, daysUntil: null, totalDays };
  }
  return { day: diffDays + 1, daysUntil: null, totalDays };
}

export function getTodayDateString(): string {
  return new Date().toISOString().split('T')[0];
}

export const PRAYERS = ['Fajr', 'Zohar', 'Asr', 'Maghrib', 'Isha', 'Taraweeh'] as const;
export type PrayerName = typeof PRAYERS[number];
