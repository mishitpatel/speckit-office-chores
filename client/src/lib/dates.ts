import {
  addMonths,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
  eachDayOfInterval,
} from "date-fns";

export function formatYmd(d: Date): string {
  return format(d, "yyyy-MM-dd");
}

export function isToday(d: Date, today: Date = new Date()): boolean {
  return isSameDay(d, today);
}

export function shiftMonth(d: Date, by: number): Date {
  return addMonths(d, by);
}

/** Returns 6 weeks (42 days) covering the month, starting on Sunday. */
export function monthMatrix(month: Date): Date[] {
  const first = startOfMonth(month);
  const last = endOfMonth(month);
  const start = startOfWeek(first, { weekStartsOn: 0 });
  const end = endOfWeek(last, { weekStartsOn: 0 });
  const days = eachDayOfInterval({ start, end });
  // Pad to 42 if a 5-week month produced fewer (rare with the above, but cheap insurance).
  while (days.length < 42) {
    const next = new Date(days[days.length - 1]!);
    next.setDate(next.getDate() + 1);
    days.push(next);
  }
  return days.slice(0, 42);
}

export function isInMonth(d: Date, month: Date): boolean {
  return isSameMonth(d, month);
}
