import type { ItemProgress } from '@/types';
import { addDays, dayKey, daysBetween } from './dates';

/**
 * Spaced repetition — docs/07-technical-architecture.md, section 10.
 *
 * The doc is explicit that a simple, readable rule set beats an opaque
 * algorithm, so the interval follows directly from strength, with a wrong
 * answer always pulling the next review forward.
 */

/** Strength thresholds and the interval in days they earn. */
const INTERVALS: Array<{ minStrength: number; days: number }> = [
  { minStrength: 85, days: 30 },
  { minStrength: 70, days: 14 },
  { minStrength: 50, days: 7 },
  { minStrength: 30, days: 3 },
  { minStrength: 0, days: 1 },
];

export function intervalForStrength(strength: number): number {
  const match = INTERVALS.find((entry) => strength >= entry.minStrength);
  return match ? match.days : 1;
}

/**
 * Schedules the next review for an item.
 * A mistake always means tomorrow, whatever the strength was before.
 */
export function scheduleNextReview(
  progress: ItemProgress,
  options: { correct: boolean; today?: string } = { correct: true },
): ItemProgress {
  const today = options.today ?? dayKey();
  const days = options.correct ? intervalForStrength(progress.strength) : 1;

  return {
    ...progress,
    lastReviewed: progress.lastReviewed ?? new Date().toISOString(),
    nextReview: addDays(today, days),
  };
}

export interface QueueOptions {
  today?: string;
  /** Maximum items in one review session. */
  limit?: number;
  /** How many items of one category may follow each other. */
  maxPerCategory?: number;
  /** Category per item id, used to keep the queue varied. */
  categoryOf?: (itemId: string) => string | undefined;
}

/** Items whose next review date has arrived. */
export function dueItems(
  progress: ItemProgress[],
  today: string = dayKey(),
): ItemProgress[] {
  return progress.filter(
    (item) => item.nextReview !== undefined && daysBetween(item.nextReview, today) >= 0,
  );
}

/**
 * Builds the Smart Review queue — architecture section 11.
 *
 * Weak and overdue items come first, and the queue is then spread so the same
 * category does not dominate a run: "the review queue should feel varied
 * rather than like a list of identical flashcards".
 */
export function buildReviewQueue(
  progress: ItemProgress[],
  options: QueueOptions = {},
): ItemProgress[] {
  const today = options.today ?? dayKey();
  const limit = options.limit ?? 20;
  const maxPerCategory = options.maxPerCategory ?? 2;
  const categoryOf = options.categoryOf ?? (() => undefined);

  const ranked = [...dueItems(progress, today)].sort((a, b) => {
    const overdueA = a.nextReview ? daysBetween(a.nextReview, today) : 0;
    const overdueB = b.nextReview ? daysBetween(b.nextReview, today) : 0;
    // Weakest first, then most overdue.
    if (a.strength !== b.strength) return a.strength - b.strength;
    return overdueB - overdueA;
  });

  const queue: ItemProgress[] = [];
  const held: ItemProgress[] = [];
  let lastCategory: string | undefined;
  let run = 0;

  for (const item of ranked) {
    if (queue.length >= limit) break;
    const category = categoryOf(item.itemId);

    if (category !== undefined && category === lastCategory && run >= maxPerCategory) {
      held.push(item);
      continue;
    }

    run = category !== undefined && category === lastCategory ? run + 1 : 1;
    lastCategory = category;
    queue.push(item);
  }

  // Items held back to break up a run still belong in the session.
  for (const item of held) {
    if (queue.length >= limit) break;
    queue.push(item);
  }

  return queue;
}

/** Items that keep going wrong, for the weakness engine and Progress. */
export function weakItems(progress: ItemProgress[], threshold = 50): ItemProgress[] {
  return progress.filter((item) => item.timesSeen > 0 && item.strength < threshold);
}

/** Rough minutes for a review session, at about 15 seconds per item. */
export function estimateMinutes(itemCount: number): number {
  return Math.max(1, Math.round((itemCount * 15) / 60));
}
