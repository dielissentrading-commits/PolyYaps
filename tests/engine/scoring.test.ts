import { describe, expect, it } from 'vitest';
import { buildLessonProgress, lessonScore, skillScores, starsFor } from '@/engine/scoring';
import type { AnsweredExercise } from '@/engine/scoring';

const answer = (
  exerciseType: AnsweredExercise['exerciseType'],
  correct: boolean,
  weight = 1,
): AnsweredExercise => ({ itemId: 'x', correct, weight, exerciseType });

describe('skillScores', () => {
  it('scores each skill from the exercises that trained it', () => {
    const scores = skillScores([
      answer('recognition', true),
      answer('recognition', false),
      answer('sentence', true, 3),
    ]);
    expect(scores.vocabulary).toBe(50);
    expect(scores.chunks).toBe(100);
  });

  it('leaves out skills the lesson did not practise', () => {
    const scores = skillScores([answer('recognition', true)]);
    expect(scores.speaking).toBeUndefined();
  });

  it('weights heavier exercises more within a skill', () => {
    const scores = skillScores([answer('recognition', false, 1), answer('production', true, 2)]);
    expect(scores.vocabulary).toBe(67);
  });
});

describe('lessonScore', () => {
  it('is zero without answers', () => {
    expect(lessonScore([])).toBe(0);
  });

  it('does not punish a lesson for skills it never covered', () => {
    // Vocabulary only, all correct: a full score, not 20 percent of one.
    expect(lessonScore([answer('recognition', true)])).toBe(100);
  });

  it('weighs speaking more heavily on a checkpoint day', () => {
    const answers = [answer('speaking', false, 3), answer('recognition', true)];
    expect(lessonScore(answers, { checkpoint: true })).toBeLessThan(lessonScore(answers));
  });
});

describe('starsFor', () => {
  it('follows the star thresholds', () => {
    expect(starsFor(50)).toBe(1);
    expect(starsFor(75)).toBe(2);
    expect(starsFor(90)).toBe(3);
    expect(starsFor(100)).toBe(3);
  });

  it('always awards a star for finishing', () => {
    expect(starsFor(0)).toBe(1);
  });
});

describe('buildLessonProgress', () => {
  it('stores skill scores separately for long-term trends', () => {
    const record = buildLessonProgress({
      day: 3,
      minutes: 55,
      xpEarned: 100,
      answers: [answer('recognition', true), answer('speaking', false, 3)],
    });

    expect(record.day).toBe(3);
    expect(record.completed).toBe(true);
    expect(record.vocabularyScore).toBe(100);
    expect(record.speakingScore).toBe(0);
    expect(record.stars).toBeGreaterThanOrEqual(1);
  });
});

describe('skill attribution by material', () => {
  it('scores chunk recognition under chunks, not vocabulary', () => {
    const scores = skillScores([
      { itemId: 'c-ola-bom-dia', correct: true, weight: 1, exerciseType: 'recognition', itemType: 'chunk' },
    ]);
    expect(scores.chunks).toBe(100);
    expect(scores.vocabulary).toBeUndefined();
  });

  it('still scores single words under vocabulary', () => {
    const scores = skillScores([
      { itemId: 'w-ola', correct: true, weight: 1, exerciseType: 'recognition', itemType: 'word' },
    ]);
    expect(scores.vocabulary).toBe(100);
    expect(scores.chunks).toBeUndefined();
  });

  it('keeps listening with listening even for a chunk', () => {
    const scores = skillScores([
      { itemId: 'c-ola', correct: true, weight: 2, exerciseType: 'listening', itemType: 'chunk' },
    ]);
    expect(scores.listening).toBe(100);
    expect(scores.chunks).toBeUndefined();
  });
});
