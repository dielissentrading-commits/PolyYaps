import { describe, expect, it } from 'vitest';
import { DAYS_PER_FREEZE, MAX_FREEZES, applyStudyDay } from '@/engine/streak';

const user = (values: Partial<Parameters<typeof applyStudyDay>[0]> = {}) => ({
  streak: 0,
  longestStreak: 0,
  streakFreezes: 0,
  ...values,
});

describe('applyStudyDay', () => {
  it('starts a streak on the first completed day', () => {
    const result = applyStudyDay(user(), '2026-08-19');
    expect(result.streak).toBe(1);
    expect(result.longestStreak).toBe(1);
    expect(result.lastCompletedDate).toBe('2026-08-19');
  });

  it('extends the streak on consecutive days', () => {
    const result = applyStudyDay(
      user({ streak: 3, longestStreak: 3, lastCompletedDate: '2026-08-18' }),
      '2026-08-19',
    );
    expect(result.streak).toBe(4);
  });

  it('does not count a second lesson on the same day', () => {
    const result = applyStudyDay(
      user({ streak: 4, longestStreak: 4, lastCompletedDate: '2026-08-19' }),
      '2026-08-19',
    );
    expect(result.streak).toBe(4);
    expect(result.freezeUsed).toBe(false);
  });

  it('resets after a missed day when no freeze is stored', () => {
    const result = applyStudyDay(
      user({ streak: 9, longestStreak: 9, lastCompletedDate: '2026-08-17' }),
      '2026-08-19',
    );
    expect(result.streak).toBe(1);
    expect(result.longestStreak).toBe(9);
  });

  it('spends a freeze to cover exactly one missed day', () => {
    const result = applyStudyDay(
      user({ streak: 9, longestStreak: 9, streakFreezes: 1, lastCompletedDate: '2026-08-17' }),
      '2026-08-19',
    );
    expect(result.streak).toBe(10);
    expect(result.freezeUsed).toBe(true);
    expect(result.streakFreezes).toBe(1); // spent one, earned one at day 10
  });

  it('does not stretch a freeze over a longer gap', () => {
    const result = applyStudyDay(
      user({ streak: 9, longestStreak: 9, streakFreezes: 2, lastCompletedDate: '2026-08-10' }),
      '2026-08-19',
    );
    expect(result.streak).toBe(1);
    expect(result.freezeUsed).toBe(false);
    expect(result.streakFreezes).toBe(2);
  });

  it('earns a freeze every fifth consecutive day', () => {
    const result = applyStudyDay(
      user({
        streak: DAYS_PER_FREEZE - 1,
        longestStreak: DAYS_PER_FREEZE - 1,
        lastCompletedDate: '2026-08-18',
      }),
      '2026-08-19',
    );
    expect(result.streak).toBe(DAYS_PER_FREEZE);
    expect(result.streakFreezes).toBe(1);
  });

  it('caps how many freezes can be held', () => {
    const result = applyStudyDay(
      user({
        streak: 9,
        longestStreak: 9,
        streakFreezes: MAX_FREEZES,
        lastCompletedDate: '2026-08-18',
      }),
      '2026-08-19',
    );
    expect(result.streakFreezes).toBe(MAX_FREEZES);
  });

  it('remembers the longest streak after a reset', () => {
    const result = applyStudyDay(
      user({ streak: 2, longestStreak: 21, lastCompletedDate: '2026-08-01' }),
      '2026-08-19',
    );
    expect(result.streak).toBe(1);
    expect(result.longestStreak).toBe(21);
  });

  it('ignores a completion dated before the last one', () => {
    const result = applyStudyDay(
      user({ streak: 5, longestStreak: 5, lastCompletedDate: '2026-08-19' }),
      '2026-08-15',
    );
    expect(result.streak).toBe(5);
    expect(result.lastCompletedDate).toBe('2026-08-19');
  });
});
