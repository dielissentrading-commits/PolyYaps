import { describe, expect, it } from 'vitest';
import { emptyItemProgress } from '@/engine/mastery';
import {
  buildReviewQueue,
  dueItems,
  estimateMinutes,
  intervalForStrength,
  scheduleNextReview,
  weakItems,
} from '@/engine/review';
import type { ItemProgress } from '@/types';

function progress(id: string, values: Partial<ItemProgress> = {}): ItemProgress {
  return { ...emptyItemProgress(id), ...values };
}

describe('intervalForStrength', () => {
  it('follows the interval table from the architecture', () => {
    expect(intervalForStrength(10)).toBe(1);
    expect(intervalForStrength(30)).toBe(3);
    expect(intervalForStrength(55)).toBe(7);
    expect(intervalForStrength(70)).toBe(14);
    expect(intervalForStrength(85)).toBe(30);
    expect(intervalForStrength(100)).toBe(30);
  });

  it('schedules stronger items further out', () => {
    expect(intervalForStrength(90)).toBeGreaterThan(intervalForStrength(40));
  });
});

describe('scheduleNextReview', () => {
  it('schedules a strong correct item far ahead', () => {
    const result = scheduleNextReview(progress('w-ola', { strength: 90 }), {
      correct: true,
      today: '2026-08-19',
    });
    expect(result.nextReview).toBe('2026-09-18');
  });

  it('brings a wrong answer forward to tomorrow, however strong', () => {
    const result = scheduleNextReview(progress('w-ola', { strength: 95 }), {
      correct: false,
      today: '2026-08-19',
    });
    expect(result.nextReview).toBe('2026-08-20');
  });

  it('crosses month boundaries correctly', () => {
    const result = scheduleNextReview(progress('w-ola', { strength: 0 }), {
      correct: true,
      today: '2026-08-31',
    });
    expect(result.nextReview).toBe('2026-09-01');
  });
});

describe('dueItems', () => {
  it('includes items due today and overdue ones', () => {
    const items = [
      progress('a', { nextReview: '2026-08-19' }),
      progress('b', { nextReview: '2026-08-10' }),
      progress('c', { nextReview: '2026-08-25' }),
      progress('d'),
    ];
    const due = dueItems(items, '2026-08-19').map((item) => item.itemId);
    expect(due).toEqual(['a', 'b']);
  });
});

describe('buildReviewQueue', () => {
  it('puts the weakest items first', () => {
    const items = [
      progress('strong', { strength: 80, nextReview: '2026-08-19' }),
      progress('weak', { strength: 10, nextReview: '2026-08-19' }),
      progress('middle', { strength: 45, nextReview: '2026-08-19' }),
    ];
    const queue = buildReviewQueue(items, { today: '2026-08-19' });
    expect(queue.map((item) => item.itemId)).toEqual(['weak', 'middle', 'strong']);
  });

  it('respects the session limit', () => {
    const items = Array.from({ length: 40 }, (_, index) =>
      progress(`item-${index}`, { strength: index, nextReview: '2026-08-19' }),
    );
    expect(buildReviewQueue(items, { today: '2026-08-19', limit: 12 })).toHaveLength(12);
  });

  it('breaks up long runs of one category', () => {
    const items = Array.from({ length: 6 }, (_, index) =>
      progress(`cafe-${index}`, { strength: index, nextReview: '2026-08-19' }),
    ).concat([progress('other', { strength: 99, nextReview: '2026-08-19' })]);

    const queue = buildReviewQueue(items, {
      today: '2026-08-19',
      maxPerCategory: 2,
      categoryOf: (id) => (id.startsWith('cafe') ? 'cafe' : 'other'),
    });

    // Everything still gets reviewed, just not all in one uninterrupted run.
    expect(queue).toHaveLength(7);
    expect(queue.slice(0, 3).some((item) => item.itemId === 'other')).toBe(true);
  });

  it('returns nothing when nothing is due', () => {
    expect(buildReviewQueue([progress('a', { nextReview: '2026-09-01' })], {
      today: '2026-08-19',
    })).toEqual([]);
  });
});

describe('weakItems', () => {
  it('only counts items the learner has actually seen', () => {
    const items = [
      progress('unseen', { strength: 0 }),
      progress('struggling', { strength: 20, timesSeen: 4 }),
      progress('solid', { strength: 80, timesSeen: 4 }),
    ];
    expect(weakItems(items).map((item) => item.itemId)).toEqual(['struggling']);
  });
});

describe('estimateMinutes', () => {
  it('never promises less than a minute of work', () => {
    expect(estimateMinutes(1)).toBe(1);
    expect(estimateMinutes(24)).toBe(6);
  });
});
