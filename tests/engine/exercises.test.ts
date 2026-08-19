import { describe, expect, it } from 'vitest';
import { BATCH_SIZE, EXERCISE_WEIGHTS, buildExercise, buildSteps } from '@/engine/exercises';
import type { LearningItem } from '@/types';

function item(id: string, portuguese: string, dutch: string, day = 1): LearningItem {
  return {
    id,
    type: id.startsWith('c-') ? 'chunk' : 'word',
    portuguese,
    dutch,
    dayIntroduced: day,
    category: 'test',
    priority: 1,
  };
}

const pool: LearningItem[] = [
  item('w-ola', 'olá', 'hallo'),
  item('w-sim', 'sim', 'ja'),
  item('w-nao', 'não', 'nee / niet'),
  item('w-eu', 'eu', 'ik'),
  item('w-tu', 'tu', 'jij'),
];

describe('buildExercise', () => {
  it('asks for recognition when the material is new', () => {
    const exercise = buildExercise(pool[0], pool, { produce: false });
    expect(exercise.type).toBe('recognition');
    expect(exercise.prompt).toBe('olá');
    expect(exercise.expected).toBe('hallo');
    expect(exercise.options).toHaveLength(4);
    expect(exercise.options).toContain('hallo');
  });

  it('asks for production once the material has been seen', () => {
    const exercise = buildExercise(pool[0], pool, { produce: true });
    expect(exercise.type).toBe('production');
    expect(exercise.prompt).toBe('hallo');
    expect(exercise.expected).toBe('olá');
    expect(exercise.options).toBeUndefined();
  });

  it('weights sentence production above single words', () => {
    const chunk = item('c-ola-bom-dia', 'Olá, bom dia.', 'Hallo, goedemorgen.');
    const exercise = buildExercise(chunk, pool, { produce: true });
    expect(exercise.type).toBe('sentence');
    expect(exercise.weight).toBeGreaterThan(EXERCISE_WEIGHTS.production);
  });

  it('offers only the first alternative as a choice label', () => {
    const exercise = buildExercise(pool[2], pool, { produce: false });
    expect(exercise.expected).toBe('nee');
  });

  it('never uses the answer as its own distractor', () => {
    const exercise = buildExercise(pool[1], pool, { produce: false });
    const answers = exercise.options?.filter((option) => option === exercise.expected);
    expect(answers).toHaveLength(1);
  });

  it('produces the same options for the same seed', () => {
    const first = buildExercise(pool[0], pool, { produce: false, seed: 'stable' });
    const second = buildExercise(pool[0], pool, { produce: false, seed: 'stable' });
    expect(first.options).toEqual(second.options);
  });
});

describe('buildSteps', () => {
  it('teaches a batch before testing it', () => {
    const steps = buildSteps(pool, { currentDay: 1, seed: 'day-1' });

    expect(steps).toHaveLength(pool.length * 2);
    expect(steps.slice(0, pool.length).every((step) => step.kind === 'study')).toBe(true);
    expect(steps.slice(pool.length).every((step) => step.kind === 'exercise')).toBe(true);
  });

  it('splits longer modules into batches', () => {
    const many = Array.from({ length: 12 }, (_, index) =>
      item(`w-${index}`, `pt-${index}`, `nl-${index}`),
    );
    const steps = buildSteps(many, { currentDay: 1, seed: 'day-1' });

    expect(steps).toHaveLength(many.length * 2);
    // First batch: BATCH_SIZE study steps, then BATCH_SIZE exercises.
    expect(steps.slice(0, BATCH_SIZE).every((step) => step.kind === 'study')).toBe(true);
    expect(
      steps.slice(BATCH_SIZE, BATCH_SIZE * 2).every((step) => step.kind === 'exercise'),
    ).toBe(true);
  });

  it('tests every item exactly once', () => {
    const steps = buildSteps(pool, { currentDay: 1, seed: 'day-1' });
    const tested = steps.filter((step) => step.kind === 'exercise').map((step) => step.item.id);
    expect(new Set(tested).size).toBe(pool.length);
  });

  it('asks for production on material introduced earlier', () => {
    const revisited = [item('w-fazer', 'fazer', 'doen', 7)];
    const steps = buildSteps(revisited, { currentDay: 8, seed: 'day-8' });
    const exercise = steps.find((step) => step.kind === 'exercise');
    expect(exercise?.kind === 'exercise' && exercise.exercise.type).toBe('production');
  });

  it('returns nothing for a module without items', () => {
    expect(buildSteps([], { currentDay: 1, seed: 'empty' })).toEqual([]);
  });
});
