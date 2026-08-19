import type { AchievementProgress, ItemProgress, LessonProgress, UserProgress } from '@/types';

/**
 * Achievement rules — masterplan step 5.
 *
 * Each rule reports a percentage towards its goal, so the UI can show progress
 * on the ones still running instead of a flat locked or unlocked.
 */

export interface AchievementInput {
  user: UserProgress;
  lessons: LessonProgress[];
  items: ItemProgress[];
}

type Rule = (input: AchievementInput) => number;

/** Progress as a percentage, capped at 100. */
function ratio(value: number, target: number): number {
  if (target <= 0) return 0;
  return Math.min(100, Math.round((value / target) * 100));
}

function completedDays(lessons: LessonProgress[]): Set<number> {
  return new Set(lessons.filter((lesson) => lesson.completed).map((lesson) => lesson.day));
}

/** Percentage of a required set of days that is finished. */
function daysDone(lessons: LessonProgress[], days: number[]): number {
  const done = completedDays(lessons);
  return ratio(days.filter((day) => done.has(day)).length, days.length);
}

function isWord(item: ItemProgress): boolean {
  return !item.itemId.startsWith('c-');
}

const RULES: Record<string, Rule> = {
  'primeiras-palavras': ({ items }) => ratio(items.filter(isWord).length, 25),

  'um-cafe': ({ lessons }) => daysDone(lessons, [5]),

  'cem-palavras': ({ items }) =>
    ratio(items.filter((item) => isWord(item) && item.masteryLevel >= 3).length, 100),

  'estou-a-ouvir': ({ user }) => ratio(user.listeningCorrect ?? 0, 50),

  // "A whole lesson without English": every answer in a day correct.
  'sem-ingles': ({ lessons }) =>
    lessons.some((lesson) => lesson.completed && lesson.lessonScore >= 100) ? 100 : 0,

  'boa-viagem': ({ lessons }) => daysDone(lessons, [11, 12, 13, 14, 15]),

  'a-portuguesa': ({ lessons }) => daysDone(lessons, [22, 23, 24]),

  negocios: ({ lessons }) => daysDone(lessons, [26, 27, 28]),

  persistente: ({ user }) => ratio(user.longestStreak, 14),

  'desafio-30': ({ lessons }) => ratio(completedDays(lessons).size, 30),
};

/** Evaluates every achievement against current progress. */
export function evaluateAchievements(
  input: AchievementInput,
  previous: AchievementProgress[] = [],
): AchievementProgress[] {
  const before = new Map(previous.map((entry) => [entry.achievementId, entry]));

  return Object.entries(RULES).map(([achievementId, rule]) => {
    const progress = rule(input);
    const earlier = before.get(achievementId);
    const unlocked = progress >= 100;

    return {
      achievementId,
      progress,
      unlocked: unlocked || Boolean(earlier?.unlocked),
      // An achievement keeps the date it was first earned.
      unlockedAt:
        earlier?.unlockedAt ?? (unlocked ? new Date().toISOString() : undefined),
    };
  });
}

/** Achievements unlocked by the latest change, for a one-off celebration. */
export function newlyUnlocked(
  before: AchievementProgress[],
  after: AchievementProgress[],
): string[] {
  const wasUnlocked = new Set(
    before.filter((entry) => entry.unlocked).map((entry) => entry.achievementId),
  );
  return after
    .filter((entry) => entry.unlocked && !wasUnlocked.has(entry.achievementId))
    .map((entry) => entry.achievementId);
}
