import { describe, expect, it } from 'vitest';
import { applyAnswer, emptyItemProgress, isActive } from '@/engine/mastery';
import type { ItemProgress } from '@/types';

const at = (day: string) => new Date(`${day}T10:00:00`);

describe('applyAnswer', () => {
  it('counts every answer as a sighting', () => {
    const result = applyAnswer(emptyItemProgress('w-ola'), {
      exerciseType: 'recognition',
      correct: true,
    });
    expect(result.timesSeen).toBe(1);
    expect(result.timesCorrect).toBe(1);
    expect(result.timesWrong).toBe(0);
  });

  it('raises strength more for harder exercises', () => {
    const base = emptyItemProgress('w-ola');
    const recognised = applyAnswer(base, { exerciseType: 'recognition', correct: true });
    const produced = applyAnswer(base, { exerciseType: 'sentence', correct: true });
    expect(produced.strength).toBeGreaterThan(recognised.strength);
  });

  it('lifts mastery to what the exercise proves', () => {
    const base = emptyItemProgress('w-ola');
    expect(applyAnswer(base, { exerciseType: 'recognition', correct: true }).masteryLevel).toBe(1);
    expect(applyAnswer(base, { exerciseType: 'production', correct: true }).masteryLevel).toBe(2);
    expect(applyAnswer(base, { exerciseType: 'sentence', correct: true }).masteryLevel).toBe(3);
    expect(applyAnswer(base, { exerciseType: 'context', correct: true }).masteryLevel).toBe(4);
  });

  it('never lowers mastery on a correct answer', () => {
    const strong: ItemProgress = { ...emptyItemProgress('w-ola'), masteryLevel: 4, strength: 90 };
    const result = applyAnswer(strong, { exerciseType: 'recognition', correct: true });
    expect(result.masteryLevel).toBe(4);
  });

  it('lowers strength on a mistake', () => {
    const known: ItemProgress = { ...emptyItemProgress('w-ola'), strength: 80, masteryLevel: 3 };
    const result = applyAnswer(known, { exerciseType: 'production', correct: false });
    expect(result.strength).toBeLessThan(80);
    expect(result.timesWrong).toBe(1);
  });

  it('keeps mastery at recognised at worst after a mistake', () => {
    let progress: ItemProgress = { ...emptyItemProgress('w-ola'), strength: 10, masteryLevel: 3 };
    for (let round = 0; round < 5; round += 1) {
      progress = applyAnswer(progress, { exerciseType: 'sentence', correct: false });
    }
    expect(progress.masteryLevel).toBeGreaterThanOrEqual(1);
    expect(progress.strength).toBe(0);
  });

  it('keeps strength inside 0 and 100', () => {
    let progress: ItemProgress = emptyItemProgress('w-ola');
    for (let round = 0; round < 20; round += 1) {
      progress = applyAnswer(progress, { exerciseType: 'spontaneous', correct: true });
    }
    expect(progress.strength).toBe(100);
  });

  it('tracks spoken and spontaneous use separately', () => {
    const spoken = applyAnswer(emptyItemProgress('w-ola'), {
      exerciseType: 'speaking',
      correct: true,
    });
    expect(spoken.spokenCorrect).toBe(1);
    expect(spoken.usedSpontaneously).toBe(0);

    const free = applyAnswer(emptyItemProgress('w-ola'), {
      exerciseType: 'spontaneous',
      correct: true,
    });
    expect(free.usedSpontaneously).toBe(1);
  });

  it('records when the item was last reviewed', () => {
    const result = applyAnswer(emptyItemProgress('w-ola'), {
      exerciseType: 'recognition',
      correct: true,
      answeredAt: at('2026-08-19'),
    });
    expect(result.lastReviewed?.startsWith('2026-08-19')).toBe(true);
  });

  it('treats produced and above as active vocabulary', () => {
    expect(isActive({ ...emptyItemProgress('w-ola'), masteryLevel: 2 })).toBe(false);
    expect(isActive({ ...emptyItemProgress('w-ola'), masteryLevel: 3 })).toBe(true);
  });
});
