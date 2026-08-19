import type { UserProgress } from '@/types';
import { dayKey, daysBetween } from './dates';

/**
 * Streaks — docs/07-technical-architecture.md, section 15.
 *
 * A streak is earned by completing the day's lesson. Score is not a
 * requirement: showing up is the behaviour being rewarded.
 */

/** A freeze is earned after this many consecutive days. */
export const DAYS_PER_FREEZE = 5;

/** Freezes the learner can hold at once. */
export const MAX_FREEZES = 2;

export interface StreakUpdate {
  streak: number;
  longestStreak: number;
  streakFreezes: number;
  lastCompletedDate: string;
  /** True when a stored freeze covered a missed day. */
  freezeUsed: boolean;
}

/**
 * Applies a completed study day to the streak.
 *
 * Completing twice on one day changes nothing. Missing exactly one day spends
 * a freeze if one is available; a longer gap restarts the streak.
 */
export function applyStudyDay(
  user: Pick<
    UserProgress,
    'streak' | 'longestStreak' | 'streakFreezes' | 'lastCompletedDate'
  >,
  today: string = dayKey(),
): StreakUpdate {
  const unchanged: StreakUpdate = {
    streak: user.streak,
    longestStreak: user.longestStreak,
    streakFreezes: user.streakFreezes,
    lastCompletedDate: today,
    freezeUsed: false,
  };

  if (user.lastCompletedDate === today) {
    return unchanged;
  }

  let streak: number;
  let freezes = user.streakFreezes;
  let freezeUsed = false;

  if (!user.lastCompletedDate) {
    streak = 1;
  } else {
    const gap = daysBetween(user.lastCompletedDate, today);

    if (gap <= 0) {
      // A completion dated before the last one cannot extend the streak, and
      // must not move the last-completed date backwards either: that would
      // make the next real study day look like a gap.
      return { ...unchanged, lastCompletedDate: user.lastCompletedDate };
    }
    if (gap === 1) {
      streak = user.streak + 1;
    } else if (gap === 2 && freezes > 0) {
      streak = user.streak + 1;
      freezes -= 1;
      freezeUsed = true;
    } else {
      streak = 1;
    }
  }

  // A freeze is earned at every fifth consecutive day, up to the cap.
  if (streak > 0 && streak % DAYS_PER_FREEZE === 0 && freezes < MAX_FREEZES) {
    freezes += 1;
  }

  return {
    streak,
    longestStreak: Math.max(user.longestStreak, streak),
    streakFreezes: freezes,
    lastCompletedDate: today,
    freezeUsed,
  };
}
