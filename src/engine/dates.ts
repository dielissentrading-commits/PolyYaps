/**
 * All date handling lives here so timezone behaviour stays consistent —
 * docs/07-technical-architecture.md, section 15.
 *
 * Study days are local calendar days: a lesson finished at 23:50 and one
 * finished at 00:10 are different days, wherever the learner is.
 */

/** Local calendar day as YYYY-MM-DD. */
export function dayKey(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/** Whole calendar days from `from` to `to`; negative when `to` is earlier. */
export function daysBetween(from: string, to: string): number {
  // Midday avoids daylight-saving shifts turning a day into 23 or 25 hours.
  const start = new Date(`${from}T12:00:00`).getTime();
  const end = new Date(`${to}T12:00:00`).getTime();
  return Math.round((end - start) / 86_400_000);
}

export function addDays(dayString: string, days: number): string {
  const date = new Date(`${dayString}T12:00:00`);
  date.setDate(date.getDate() + days);
  return dayKey(date);
}

/** True when `dayString` is today or in the past. */
export function isDue(dayString: string, today: string = dayKey()): boolean {
  return daysBetween(dayString, today) >= 0;
}
