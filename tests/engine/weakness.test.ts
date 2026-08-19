import { describe, expect, it } from 'vitest';
import { FOCUS_THRESHOLD, applyWeaknessEvent, currentFocus } from '@/engine/weakness';
import type { WeaknessCounts } from '@/engine/weakness';

describe('applyWeaknessEvent', () => {
  it('counts a mistake against the category', () => {
    const counts = applyWeaknessEvent({}, { category: 'SER_VS_ESTAR', correct: false });
    expect(counts.SER_VS_ESTAR).toBe(1);
  });

  it('lets correct answers work the count back down', () => {
    let counts: WeaknessCounts = { SER_VS_ESTAR: 2 };
    counts = applyWeaknessEvent(counts, { category: 'SER_VS_ESTAR', correct: true });
    counts = applyWeaknessEvent(counts, { category: 'SER_VS_ESTAR', correct: true });
    expect(counts.SER_VS_ESTAR).toBe(1);
  });

  it('never drops below zero', () => {
    const counts = applyWeaknessEvent({ NUMBERS: 0 }, { category: 'NUMBERS', correct: true });
    expect(counts.NUMBERS).toBe(0);
  });
});

describe('currentFocus', () => {
  it('stays quiet below the threshold', () => {
    expect(currentFocus({ SER_VS_ESTAR: FOCUS_THRESHOLD - 1 })).toBeUndefined();
  });

  it('surfaces a category once it passes the threshold', () => {
    const focus = currentFocus({ SER_VS_ESTAR: FOCUS_THRESHOLD });
    expect(focus?.category).toBe('SER_VS_ESTAR');
    expect(focus?.label).toBe('ser vs. estar');
  });

  it('picks the worst category when several qualify', () => {
    const focus = currentFocus({ SER_VS_ESTAR: 4, PAST_TENSE: 7 });
    expect(focus?.category).toBe('PAST_TENSE');
  });

  it('stops surfacing a category once it recovers', () => {
    let counts: WeaknessCounts = { NUMBERS: FOCUS_THRESHOLD };
    expect(currentFocus(counts)).toBeDefined();
    for (let round = 0; round < 4; round += 1) {
      counts = applyWeaknessEvent(counts, { category: 'NUMBERS', correct: true });
    }
    expect(currentFocus(counts)).toBeUndefined();
  });
});
