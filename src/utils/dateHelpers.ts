export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

export function parseDate(dateString: string): Date {
  return new Date(dateString);
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function addWeeks(date: Date, weeks: number): Date {
  return addDays(date, weeks * 7);
}

export function addMonths(date: Date, months: number): Date {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
}

export function getWeekStart(date: Date): Date {
  const result = new Date(date);
  const day = result.getDay();
  const diff = result.getDate() - day + (day === 0 ? -6 : 1);
  result.setDate(diff);
  result.setHours(0, 0, 0, 0);
  return result;
}

export function getMonthStart(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function isSameDay(date1: Date, date2: Date): boolean {
  return formatDate(date1) === formatDate(date2);
}

export function daysBetween(start: Date, end: Date): number {
  const msPerDay = 1000 * 60 * 60 * 24;
  const startMs = start.getTime();
  const endMs = end.getTime();
  return Math.round((endMs - startMs) / msPerDay);
}

export function getWeeksInRange(start: Date, end: Date): Date[] {
  const weeks: Date[] = [];
  let current = getWeekStart(start);
  const endTime = end.getTime();

  while (current.getTime() <= endTime) {
    weeks.push(new Date(current));
    current = addWeeks(current, 1);
  }

  return weeks;
}

export function getMonthsInRange(start: Date, end: Date): Date[] {
  const months: Date[] = [];
  let current = getMonthStart(start);
  const endTime = end.getTime();

  while (current.getTime() <= endTime) {
    months.push(new Date(current));
    current = addMonths(current, 1);
  }

  return months;
}

export function formatMonthYear(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

export function formatWeekRange(date: Date): string {
  const weekStart = getWeekStart(date);
  const weekEnd = addDays(weekStart, 6);

  return `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
}
