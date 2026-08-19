import { describe, expect, it } from 'vitest';
import { addDays, dayKey, daysBetween, isDue } from '@/engine/dates';

describe('dayKey', () => {
  it('formats a local calendar day', () => {
    expect(dayKey(new Date(2026, 7, 19, 23, 50))).toBe('2026-08-19');
  });

  it('treats late evening and just after midnight as different days', () => {
    expect(dayKey(new Date(2026, 7, 19, 23, 50))).not.toBe(dayKey(new Date(2026, 7, 20, 0, 10)));
  });
});

describe('daysBetween', () => {
  it('counts whole days forwards and backwards', () => {
    expect(daysBetween('2026-08-18', '2026-08-19')).toBe(1);
    expect(daysBetween('2026-08-19', '2026-08-18')).toBe(-1);
    expect(daysBetween('2026-08-19', '2026-08-19')).toBe(0);
  });

  it('crosses months and years', () => {
    expect(daysBetween('2026-08-31', '2026-09-01')).toBe(1);
    expect(daysBetween('2026-12-31', '2027-01-01')).toBe(1);
  });

  it('is unaffected by daylight saving changes', () => {
    // Central European clocks go back on 25 October 2026.
    expect(daysBetween('2026-10-24', '2026-10-26')).toBe(2);
  });
});

describe('addDays', () => {
  it('rolls over month and year boundaries', () => {
    expect(addDays('2026-08-31', 1)).toBe('2026-09-01');
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01');
    expect(addDays('2026-08-19', 30)).toBe('2026-09-18');
  });
});

describe('isDue', () => {
  it('is due today and when overdue, not in the future', () => {
    expect(isDue('2026-08-19', '2026-08-19')).toBe(true);
    expect(isDue('2026-08-10', '2026-08-19')).toBe(true);
    expect(isDue('2026-08-20', '2026-08-19')).toBe(false);
  });
});
