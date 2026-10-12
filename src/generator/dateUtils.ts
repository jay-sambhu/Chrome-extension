/**
 * Small AD (Gregorian) calendar helpers operating on YYYY-MM-DD strings in UTC,
 * so results never drift with the host timezone.
 */

const MS_PER_DAY = 86_400_000;

function pad2(n: number): string {
  return n.toString().padStart(2, '0');
}

export function parseAdDate(dateStr: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr);
  if (!match) return null;
  const d = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])));
  return isNaN(d.getTime()) ? null : d;
}

export function formatAdDate(date: Date): string {
  return `${date.getUTCFullYear()}-${pad2(date.getUTCMonth() + 1)}-${pad2(date.getUTCDate())}`;
}

/**
 * Today's local calendar day as a UTC-midnight Date.
 */
export function todayUtc(now: Date = new Date()): Date {
  return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
}

export function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * MS_PER_DAY);
}

/**
 * Adds whole calendar years. Feb 29 rolls back to Feb 28 in non-leap target years.
 */
export function addYears(date: Date, years: number): Date {
  const y = date.getUTCFullYear() + years;
  const m = date.getUTCMonth();
  const d = date.getUTCDate();
  const result = new Date(Date.UTC(y, m, d));
  if (result.getUTCMonth() !== m) {
    return new Date(Date.UTC(y, m + 1, 0));
  }
  return result;
}

export function daysBetween(from: Date, to: Date): number {
  return Math.round((to.getTime() - from.getTime()) / MS_PER_DAY);
}

/**
 * Uniform random day in the inclusive range [from, to]. Returns null if the range is empty.
 */
export function randomDateBetween(from: Date, to: Date): Date | null {
  const span = daysBetween(from, to);
  if (span < 0) return null;
  return addDays(from, Math.floor(Math.random() * (span + 1)));
}

/**
 * Exact completed years between birth date and reference date.
 */
export function completedYears(birth: Date, on: Date): number {
  let age = on.getUTCFullYear() - birth.getUTCFullYear();
  const beforeBirthday =
    on.getUTCMonth() < birth.getUTCMonth() ||
    (on.getUTCMonth() === birth.getUTCMonth() && on.getUTCDate() < birth.getUTCDate());
  if (beforeBirthday) age--;
  return age;
}

export function minDate(a: Date, b: Date): Date {
  return a.getTime() <= b.getTime() ? a : b;
}

export function maxDate(a: Date, b: Date): Date {
  return a.getTime() >= b.getTime() ? a : b;
}
