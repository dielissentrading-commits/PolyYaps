import { describe, expect, it } from 'vitest';
import { BASE_LESSON_XP, lessonXP, scoreBonus } from '@/engine/xp';

describe('scoreBonus', () => {
  it('pays nothing below 90 percent', () => {
    expect(scoreBonus(89)).toBe(0);
  });

  it('rewards a strong day and a perfect one differently', () => {
    expect(scoreBonus(90)).toBe(10);
    expect(scoreBonus(100)).toBe(15);
  });
});

describe('lessonXP', () => {
  it('pays the base amount for a normal lesson', () => {
    expect(lessonXP({ score: 80 })).toBe(BASE_LESSON_XP);
  });

  it('adds the score bonus on top', () => {
    expect(lessonXP({ score: 95 })).toBe(BASE_LESSON_XP + 10);
  });

  it('adds up the modules actually finished', () => {
    expect(lessonXP({ score: 50, modules: ['vocabulary', 'speaking'] })).toBe(45);
  });

  it('pays only the bonus when repeating a finished day', () => {
    expect(lessonXP({ score: 95, repeat: true })).toBe(10);
    expect(lessonXP({ score: 60, repeat: true })).toBe(0);
  });

  it('makes grinding an old lesson worth less than a new one', () => {
    expect(lessonXP({ score: 100, repeat: true })).toBeLessThan(lessonXP({ score: 60 }));
  });
});
