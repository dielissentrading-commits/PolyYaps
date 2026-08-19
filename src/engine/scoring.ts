import type {
  AnswerResult,
  ExerciseType,
  LessonProgress,
  SkillKey,
  StarCount,
} from '@/types';

/**
 * Daily score — docs/07-technical-architecture.md, section 13.
 *
 * The day's score is built from skill components rather than a flat percentage,
 * so the Progress screen can show long-term trends per skill.
 */

/** Which skill each exercise type trains, for single words. */
const SKILL_OF_EXERCISE: Record<ExerciseType, SkillKey> = {
  recognition: 'vocabulary',
  production: 'vocabulary',
  listening: 'listening',
  sentence: 'chunks',
  speaking: 'speaking',
  context: 'practical',
  spontaneous: 'practical',
};

/**
 * The skill an answer scores.
 *
 * Working with a chunk trains chunks, whether the learner recognised it or
 * produced it — the material decides, not only the exercise format. Listening
 * and speaking stay tied to the exercise, because those are about the channel
 * rather than the material.
 */
function skillOf(answer: AnswerResult): SkillKey {
  const byExercise = SKILL_OF_EXERCISE[answer.exerciseType];
  if (answer.itemType === 'chunk' && (byExercise === 'vocabulary' || byExercise === 'chunks')) {
    return 'chunks';
  }
  return byExercise;
}

/** Weight of each skill in a normal lesson score. */
export const NORMAL_LESSON_WEIGHTS: Record<SkillKey, number> = {
  vocabulary: 0.2,
  chunks: 0.2,
  listening: 0.2,
  speaking: 0.15,
  pronunciation: 0.1,
  practical: 0.15,
};

/** Checkpoint days lean on speaking and practical use instead. */
export const CHECKPOINT_WEIGHTS: Record<SkillKey, number> = {
  vocabulary: 0.15,
  chunks: 0.15,
  listening: 0.15,
  speaking: 0.25,
  pronunciation: 0.1,
  practical: 0.2,
};

/** An answer as stored, kept as its own name for readability in the engine. */
export type AnsweredExercise = AnswerResult;

/** Percentage correct per skill, for the skills the session actually covered. */
export function skillScores(answers: AnsweredExercise[]): Partial<Record<SkillKey, number>> {
  const totals = new Map<SkillKey, { earned: number; possible: number }>();

  for (const answer of answers) {
    const skill = skillOf(answer);
    const entry = totals.get(skill) ?? { earned: 0, possible: 0 };
    entry.possible += answer.weight;
    if (answer.correct) entry.earned += answer.weight;
    totals.set(skill, entry);
  }

  const scores: Partial<Record<SkillKey, number>> = {};
  for (const [skill, { earned, possible }] of totals) {
    scores[skill] = possible ? Math.round((earned / possible) * 100) : 0;
  }
  return scores;
}

/**
 * Combines skill scores into one day score.
 *
 * Skills the lesson did not practise are left out and the remaining weights are
 * renormalised, so a lesson without speaking is not scored as if speaking was
 * failed.
 */
export function lessonScore(
  answers: AnsweredExercise[],
  options: { checkpoint?: boolean } = {},
): number {
  const scores = skillScores(answers);
  const weights = options.checkpoint ? CHECKPOINT_WEIGHTS : NORMAL_LESSON_WEIGHTS;

  let weighted = 0;
  let totalWeight = 0;

  for (const [skill, score] of Object.entries(scores) as Array<[SkillKey, number]>) {
    const weight = weights[skill];
    weighted += score * weight;
    totalWeight += weight;
  }

  return totalWeight ? Math.round(weighted / totalWeight) : 0;
}

/** Star rules — architecture section 16. */
export function starsFor(score: number): StarCount {
  if (score >= 90) return 3;
  if (score >= 75) return 2;
  return 1;
}

/** Builds the stored record for a finished lesson. */
export function buildLessonProgress(options: {
  day: number;
  answers: AnsweredExercise[];
  minutes: number;
  xpEarned: number;
  checkpoint?: boolean;
}): LessonProgress {
  const score = lessonScore(options.answers, { checkpoint: options.checkpoint });
  const scores = skillScores(options.answers);

  return {
    day: options.day,
    completed: true,
    timeSpentMinutes: options.minutes,
    lessonScore: score,
    xpEarned: options.xpEarned,
    stars: starsFor(score),
    vocabularyScore: scores.vocabulary,
    listeningScore: scores.listening,
    speakingScore: scores.speaking,
    practicalScore: scores.practical,
  };
}
