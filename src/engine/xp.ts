import type { LessonModuleType } from '@/types';

/**
 * XP — docs/07-technical-architecture.md, section 14.
 *
 * XP rewards effort and completion, not language mastery. Mastery can still
 * improve when no XP is awarded; that separation is deliberate.
 */

/** XP for finishing each module of a normal lesson. */
export const MODULE_XP: Partial<Record<LessonModuleType, number>> = {
  review: 15,
  vocabulary: 20,
  chunks: 0,
  listening: 15,
  grammar: 10,
  speaking: 25,
  test: 15,
};

export const BASE_LESSON_XP = 100;

/** Extra XP for a strong day score. */
export function scoreBonus(score: number): number {
  if (score >= 100) return 15;
  if (score >= 90) return 10;
  return 0;
}

export interface LessonXPOptions {
  score: number;
  /** True when this day was already completed before. */
  repeat?: boolean;
  /** Modules actually finished, when awarding per module. */
  modules?: LessonModuleType[];
}

/**
 * XP for completing a day.
 *
 * Anti-farming: repeating a day the learner has already finished pays only the
 * score bonus, so grinding an easy lesson is not worth more than moving on.
 */
export function lessonXP(options: LessonXPOptions): number {
  const bonus = scoreBonus(options.score);

  if (options.repeat) {
    return bonus;
  }

  const base = options.modules
    ? options.modules.reduce((total, module) => total + (MODULE_XP[module] ?? 0), 0)
    : BASE_LESSON_XP;

  return base + bonus;
}
