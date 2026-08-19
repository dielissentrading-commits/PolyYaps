import { describe, expect, it } from 'vitest';
import { evaluateAchievements, newlyUnlocked } from '@/engine/achievements';
import { emptyItemProgress } from '@/engine/mastery';
import type { AchievementInput } from '@/engine/achievements';
import type { ItemProgress, LessonProgress, UserProgress } from '@/types';

const user = (values: Partial<UserProgress> = {}): UserProgress => ({
  currentDay: 1,
  totalXP: 0,
  level: 1,
  streak: 0,
  longestStreak: 0,
  streakFreezes: 0,
  totalLearningMinutes: 0,
  ...values,
});

const lesson = (day: number, score = 80): LessonProgress => ({
  day,
  completed: true,
  timeSpentMinutes: 50,
  lessonScore: score,
  xpEarned: 100,
  stars: 2,
});

const words = (count: number, mastery = 0): ItemProgress[] =>
  Array.from({ length: count }, (_, index) => ({
    ...emptyItemProgress(`w-${index}`),
    masteryLevel: mastery as ItemProgress['masteryLevel'],
  }));

const input = (values: Partial<AchievementInput> = {}): AchievementInput => ({
  user: user(),
  lessons: [],
  items: [],
  ...values,
});

function find(entries: ReturnType<typeof evaluateAchievements>, id: string) {
  const entry = entries.find((candidate) => candidate.achievementId === id);
  if (!entry) throw new Error(`No achievement ${id}`);
  return entry;
}

describe('evaluateAchievements', () => {
  it('reports partial progress before unlocking', () => {
    const result = find(evaluateAchievements(input({ items: words(10) })), 'primeiras-palavras');
    expect(result.progress).toBe(40);
    expect(result.unlocked).toBe(false);
  });

  it('unlocks once the goal is reached', () => {
    const result = find(evaluateAchievements(input({ items: words(25) })), 'primeiras-palavras');
    expect(result.unlocked).toBe(true);
    expect(result.unlockedAt).toBeTruthy();
  });

  it('counts only actively mastered words for Cem Palavras', () => {
    const seen = find(evaluateAchievements(input({ items: words(100) })), 'cem-palavras');
    expect(seen.progress).toBe(0);

    const mastered = find(
      evaluateAchievements(input({ items: words(100, 3) })),
      'cem-palavras',
    );
    expect(mastered.unlocked).toBe(true);
  });

  it('tracks a set of days as a group', () => {
    const partial = find(
      evaluateAchievements(input({ lessons: [lesson(11), lesson(12)] })),
      'boa-viagem',
    );
    expect(partial.progress).toBe(40);

    const complete = find(
      evaluateAchievements(
        input({ lessons: [11, 12, 13, 14, 15].map((day) => lesson(day)) }),
      ),
      'boa-viagem',
    );
    expect(complete.unlocked).toBe(true);
  });

  it('requires a flawless lesson for Sem Inglês', () => {
    expect(find(evaluateAchievements(input({ lessons: [lesson(1, 99)] })), 'sem-ingles').unlocked)
      .toBe(false);
    expect(find(evaluateAchievements(input({ lessons: [lesson(1, 100)] })), 'sem-ingles').unlocked)
      .toBe(true);
  });

  it('uses the longest streak, so a reset does not take the badge back', () => {
    const result = find(
      evaluateAchievements(input({ user: user({ streak: 1, longestStreak: 14 }) })),
      'persistente',
    );
    expect(result.unlocked).toBe(true);
  });

  it('keeps an achievement unlocked when progress later falls', () => {
    const earned = evaluateAchievements(input({ items: words(25) }));
    const after = evaluateAchievements(input({ items: words(3) }), earned);
    expect(find(after, 'primeiras-palavras').unlocked).toBe(true);
  });

  it('keeps the original unlock date', () => {
    const earned = evaluateAchievements(input({ items: words(25) }));
    const first = find(earned, 'primeiras-palavras').unlockedAt;
    const again = evaluateAchievements(input({ items: words(30) }), earned);
    expect(find(again, 'primeiras-palavras').unlockedAt).toBe(first);
  });
});

describe('newlyUnlocked', () => {
  it('reports only what changed', () => {
    const before = evaluateAchievements(input({ items: words(25) }));
    const after = evaluateAchievements(
      input({ items: words(25), user: user({ longestStreak: 14 }) }),
      before,
    );
    expect(newlyUnlocked(before, after)).toEqual(['persistente']);
  });

  it('reports nothing when nothing changed', () => {
    const before = evaluateAchievements(input({ items: words(25) }));
    const after = evaluateAchievements(input({ items: words(25) }), before);
    expect(newlyUnlocked(before, after)).toEqual([]);
  });
});
