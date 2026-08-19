import type { ExerciseType, ItemProgress, MasteryLevel } from '@/types';
import { EXERCISE_WEIGHTS } from './exercises';

/**
 * Mastery and strength — docs/07-technical-architecture.md, section 9.
 *
 * The two are deliberately separate: mastery is what the learner can do with
 * an item, strength is how securely they can do it right now. Strength decays
 * with mistakes and time; mastery only moves when the evidence supports it.
 */

/** Mastery level reached by each exercise type when answered correctly. */
const LEVEL_EVIDENCE: Record<ExerciseType, MasteryLevel> = {
  recognition: 1,
  listening: 2,
  production: 2,
  sentence: 3,
  speaking: 3,
  context: 4,
  spontaneous: 4,
};

/** Strength gained per weight point on a correct answer. */
const GAIN_PER_WEIGHT = 6;

/** Strength lost per weight point on a wrong answer. */
const LOSS_PER_WEIGHT = 7;

/** A wrong answer can drop mastery, but never below "recognised". */
const MIN_MASTERY_AFTER_MISTAKE: MasteryLevel = 1;

export function emptyItemProgress(itemId: string): ItemProgress {
  return {
    itemId,
    masteryLevel: 0,
    strength: 0,
    timesSeen: 0,
    timesCorrect: 0,
    timesWrong: 0,
    spokenCorrect: 0,
    usedSpontaneously: 0,
  };
}

function clampStrength(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

export interface AnswerEvidence {
  exerciseType: ExerciseType;
  correct: boolean;
  /** Defaults to the type's standard weight. */
  weight?: number;
  answeredAt?: Date;
}

/**
 * Applies one answer to an item's progress.
 *
 * Correct answers to harder exercises move mastery further and raise strength
 * faster, so producing a sentence counts for more than recognising a word.
 */
export function applyAnswer(
  progress: ItemProgress,
  evidence: AnswerEvidence,
): ItemProgress {
  const weight = evidence.weight ?? EXERCISE_WEIGHTS[evidence.exerciseType];
  const answeredAt = evidence.answeredAt ?? new Date();

  const next: ItemProgress = {
    ...progress,
    timesSeen: progress.timesSeen + 1,
    lastReviewed: answeredAt.toISOString(),
  };

  if (evidence.correct) {
    next.timesCorrect = progress.timesCorrect + 1;
    next.strength = clampStrength(progress.strength + weight * GAIN_PER_WEIGHT);

    // Mastery rises to what this exercise proves, and never falls on success.
    const proven = LEVEL_EVIDENCE[evidence.exerciseType];
    next.masteryLevel = Math.max(progress.masteryLevel, proven) as MasteryLevel;

    if (evidence.exerciseType === 'speaking') {
      next.spokenCorrect = progress.spokenCorrect + 1;
    }
    if (evidence.exerciseType === 'spontaneous') {
      next.usedSpontaneously = progress.usedSpontaneously + 1;
    }
  } else {
    next.timesWrong = progress.timesWrong + 1;
    next.strength = clampStrength(progress.strength - weight * LOSS_PER_WEIGHT);

    // A mistake on an item the learner had produced means it is not secure
    // any more, but the recognition it earned earlier is not undone.
    next.masteryLevel = Math.max(
      MIN_MASTERY_AFTER_MISTAKE,
      Math.min(progress.masteryLevel, next.strength >= 50 ? progress.masteryLevel : 2),
    ) as MasteryLevel;
  }

  return next;
}

/** Human-readable mastery names — masterplan step 5. */
export const MASTERY_LABELS: Record<MasteryLevel, string> = {
  0: 'Nieuw',
  1: 'Herkend',
  2: 'Herinnerd',
  3: 'Geproduceerd',
  4: 'Actief',
};

/** An item counts as actively available from mastery 3 upwards. */
export function isActive(progress: ItemProgress): boolean {
  return progress.masteryLevel >= 3;
}
