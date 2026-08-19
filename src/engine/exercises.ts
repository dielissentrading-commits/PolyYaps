import type { ExerciseType, ItemProgress, LearningItem, MasteryLevel } from '@/types';
import { acceptableAnswers } from './answers';

/**
 * Exercise generation.
 *
 * Exercise types and their learning weight come from the masterplan (step 5)
 * and docs/07-technical-architecture.md, section 9. Contextual production is
 * worth more than recognition, so the review engine can prefer it later.
 */

export type { ExerciseType };

export const EXERCISE_WEIGHTS: Record<ExerciseType, number> = {
  recognition: 1,
  production: 2,
  listening: 2,
  sentence: 3,
  speaking: 3,
  context: 4,
  spontaneous: 5,
};

export interface Exercise {
  id: string;
  type: ExerciseType;
  itemId: string;
  /** What the learner is asked. */
  prompt: string;
  /** Language of the prompt, for correct pronunciation and rendering. */
  promptLang: 'pt-PT' | 'nl';
  /** The expected answer, which may list alternatives with a slash. */
  expected: string;
  answerLang: 'pt-PT' | 'nl';
  /** Present for multiple-choice exercises. */
  options?: string[];
  /** Hide the written prompt: the learner has to go on the audio alone. */
  audioOnly?: boolean;
  weight: number;
}

/** A single learning step in a module: study the item, or answer about it. */
export type LessonStep =
  | { kind: 'study'; item: LearningItem }
  | { kind: 'exercise'; item: LearningItem; exercise: Exercise };

/** Deterministic RNG so options do not reshuffle on every render. */
function seededRandom(seed: string): () => number {
  let hash = 2166136261;
  for (let index = 0; index < seed.length; index += 1) {
    hash ^= seed.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return () => {
    hash += 0x6d2b79f5;
    let value = hash;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle<T>(values: T[], random: () => number): T[] {
  const result = [...values];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(random() * (index + 1));
    [result[index], result[swap]] = [result[swap], result[index]];
  }
  return result;
}

/** The first listed alternative, used as the label on a choice button. */
function primary(value: string): string {
  return acceptableAnswers(value)[0] ?? value;
}

/**
 * Builds a recognition exercise: read the Portuguese, pick the Dutch meaning.
 * Distractors come from the same pool so the choice is about meaning rather
 * than about which option looks out of place.
 */
function recognitionExercise(
  item: LearningItem,
  pool: LearningItem[],
  random: () => number,
): Exercise {
  const answer = primary(item.dutch ?? '');
  const distractors = shuffle(
    pool.filter((other) => other.id !== item.id && other.dutch),
    random,
  )
    .map((other) => primary(other.dutch ?? ''))
    .filter((option) => option !== answer)
    .slice(0, 3);

  return {
    id: `${item.id}-recognition`,
    type: 'recognition',
    itemId: item.id,
    prompt: item.portuguese,
    promptLang: 'pt-PT',
    expected: answer,
    answerLang: 'nl',
    options: shuffle([answer, ...distractors], random),
    weight: EXERCISE_WEIGHTS.recognition,
  };
}

/** Builds a production exercise: read the Dutch, write the Portuguese. */
function productionExercise(item: LearningItem): Exercise {
  const type: ExerciseType = item.type === 'chunk' ? 'sentence' : 'production';
  return {
    id: `${item.id}-${type}`,
    type,
    itemId: item.id,
    prompt: item.dutch ?? '',
    promptLang: 'nl',
    expected: item.portuguese,
    answerLang: 'pt-PT',
    weight: EXERCISE_WEIGHTS[type],
  };
}

/**
 * Picks the exercise that matches what the learner should already be able to
 * do. Recognition for brand new material, active production once the item has
 * been seen before — the progression from the learning cycle in step 4.
 */
export function buildExercise(
  item: LearningItem,
  pool: LearningItem[],
  options: { produce: boolean; seed?: string },
): Exercise {
  if (options.produce) return productionExercise(item);
  return recognitionExercise(item, pool, seededRandom(options.seed ?? item.id));
}

/** Items are taught and tested in small batches rather than all at once. */
export const BATCH_SIZE = 5;

/**
 * Turns a module's items into a study-then-recall sequence: see a small batch,
 * then actively retrieve it, before moving to the next batch.
 */
export function buildSteps(
  items: LearningItem[],
  options: { currentDay: number; seed: string },
): LessonStep[] {
  const steps: LessonStep[] = [];
  const random = seededRandom(options.seed);

  for (let start = 0; start < items.length; start += BATCH_SIZE) {
    const batch = items.slice(start, start + BATCH_SIZE);

    for (const item of batch) {
      steps.push({ kind: 'study', item });
    }

    for (const item of shuffle(batch, random)) {
      steps.push({
        kind: 'exercise',
        item,
        exercise: buildExercise(item, items, {
          // Material introduced on an earlier day is revisited actively.
          produce: item.dayIntroduced < options.currentDay,
          seed: `${options.seed}-${item.id}`,
        }),
      });
    }
  }

  return steps;
}

/**
 * Exercise type for a review item, by mastery level — architecture section 11.
 *
 * Listening, context and spontaneous exercises are not implemented yet, so the
 * top levels currently practise full production, which is the hardest form the
 * app can actually ask for.
 */
export function reviewExerciseFor(mastery: MasteryLevel): 'recognition' | 'production' {
  return mastery <= 1 ? 'recognition' : 'production';
}

/**
 * Turns a review queue into exercises. Review has no study phase: the point is
 * retrieval, so every step asks a question.
 */
export function buildReviewSteps(
  entries: Array<{ item: LearningItem; progress: ItemProgress }>,
  options: { seed: string },
): LessonStep[] {
  const pool = entries.map((entry) => entry.item);

  return entries.map(({ item, progress }) => ({
    kind: 'exercise' as const,
    item,
    exercise: buildExercise(item, pool, {
      produce: reviewExerciseFor(progress.masteryLevel) === 'production',
      seed: `${options.seed}-${item.id}`,
    }),
  }));
}

/**
 * Listening: hear the sentence, choose what it means, with the text hidden.
 * This is "luisteren zonder tekst" from the learning cycle in step 4.
 */
export function listeningExercise(
  item: LearningItem,
  pool: LearningItem[],
  seed: string,
): Exercise {
  const base = recognitionExercise(item, pool, seededRandom(seed));
  return {
    ...base,
    id: `${item.id}-listening`,
    type: 'listening',
    audioOnly: true,
    weight: EXERCISE_WEIGHTS.listening,
  };
}

/** A listening round over a module's items. */
export function buildListeningSteps(
  items: LearningItem[],
  options: { seed: string },
): LessonStep[] {
  return items.map((item) => ({
    kind: 'exercise' as const,
    item,
    exercise: listeningExercise(item, items, `${options.seed}-${item.id}`),
  }));
}

/**
 * A daily test: no study phase and no multiple choice, only active production.
 * Recognition has already been practised earlier in the lesson.
 */
export function buildTestSteps(
  items: LearningItem[],
  options: { seed: string },
): LessonStep[] {
  const random = seededRandom(options.seed);

  return shuffle(items, random).map((item) => ({
    kind: 'exercise' as const,
    item,
    exercise: buildExercise(item, items, { produce: true, seed: `${options.seed}-${item.id}` }),
  }));
}
