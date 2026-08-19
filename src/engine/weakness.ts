import type { WeaknessCategory } from '@/types';

/**
 * Weakness tracking — docs/07-technical-architecture.md, section 12.
 *
 * Mistakes can be tagged to a category. Once a category passes a threshold it
 * becomes Today's Focus and gets extra questions in Smart Review, and it fades
 * again after repeated successes.
 */

export const WEAKNESS_LABELS: Record<WeaknessCategory, string> = {
  SER_VS_ESTAR: 'ser vs. estar',
  GOSTAR_DE: 'gostar de',
  TER_AGE: 'ter voor leeftijd',
  PAST_TENSE: 'verleden tijd',
  NUMBERS: 'getallen',
  LISTENING_REDUCED_VOWELS: 'gereduceerde klinkers',
  PRONUNCIATION_R: 'de Portugese r',
};

/** Mistakes in one category before it is surfaced as Today's Focus. */
export const FOCUS_THRESHOLD = 3;

/** Correct answers that cancel out one earlier mistake. */
export const RECOVERY_RATIO = 2;

export type WeaknessCounts = Partial<Record<WeaknessCategory, number>>;

export interface WeaknessEvent {
  category: WeaknessCategory;
  correct: boolean;
}

/**
 * Updates the rolling mistake count for a category.
 * Correct answers reduce it, so a fixed weakness stops being surfaced.
 */
export function applyWeaknessEvent(
  counts: WeaknessCounts,
  event: WeaknessEvent,
): WeaknessCounts {
  const current = counts[event.category] ?? 0;
  const next = event.correct
    ? Math.max(0, current - 1 / RECOVERY_RATIO)
    : current + 1;

  return { ...counts, [event.category]: next };
}

export interface FocusCategory {
  category: WeaknessCategory;
  label: string;
  mistakes: number;
}

/** The category most in need of attention, if any has crossed the threshold. */
export function currentFocus(counts: WeaknessCounts): FocusCategory | undefined {
  let worst: FocusCategory | undefined;

  for (const [category, count] of Object.entries(counts) as Array<
    [WeaknessCategory, number]
  >) {
    if (count < FOCUS_THRESHOLD) continue;
    if (!worst || count > worst.mistakes) {
      worst = {
        category,
        label: WEAKNESS_LABELS[category],
        mistakes: Math.round(count),
      };
    }
  }

  return worst;
}
