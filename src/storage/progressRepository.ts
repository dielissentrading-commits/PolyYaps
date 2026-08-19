import type {
  AchievementProgress,
  ItemProgress,
  LessonProgress,
  UserProgress,
} from '@/types';
import type { WeaknessCounts } from '@/engine/weakness';
import { clearAll, get, getAll, isPersistent, put, putAll } from './db';

/**
 * The only way the app reads or writes learner progress.
 *
 * UI -> progressRepository -> IndexedDB, exactly as architecture section 8
 * prescribes. Swapping in cloud sync later means changing this file, not the
 * screens.
 */

/** userProgress holds one row; this is its key. */
const USER_KEY = 'current';

export const defaultUserProgress: UserProgress = {
  currentDay: 1,
  totalXP: 0,
  level: 1,
  streak: 0,
  longestStreak: 0,
  streakFreezes: 0,
  totalLearningMinutes: 0,
};

interface UserRecord extends UserProgress {
  id: string;
}

interface SettingRecord {
  key: string;
  value: unknown;
}

interface StampRecord {
  id: string;
  earnedAt: string;
}

export interface StoredProgress {
  user: UserProgress;
  items: Record<string, ItemProgress>;
  lessons: LessonProgress[];
  achievements: AchievementProgress[];
  stamps: StampRecord[];
  weakness: WeaknessCounts;
  persistent: boolean;
}

export async function loadProgress(): Promise<StoredProgress> {
  const [user, items, lessons, achievements, stamps, weaknessSetting, persistent] =
    await Promise.all([
      get<UserRecord>('userProgress', USER_KEY),
      getAll<ItemProgress>('itemProgress'),
      getAll<LessonProgress>('lessonProgress'),
      getAll<AchievementProgress>('achievementProgress'),
      getAll<StampRecord>('passportStamps'),
      get<SettingRecord>('settings', 'weakness'),
      isPersistent(),
    ]);

  return {
    user: user ? stripId(user) : { ...defaultUserProgress },
    items: Object.fromEntries(items.map((item) => [item.itemId, item])),
    lessons: lessons.sort((a, b) => a.day - b.day),
    achievements,
    stamps,
    weakness: (weaknessSetting?.value as WeaknessCounts | undefined) ?? {},
    persistent,
  };
}

function stripId(record: UserRecord): UserProgress {
  const { id: _id, ...user } = record;
  return user;
}

export async function saveUser(user: UserProgress): Promise<void> {
  await put('userProgress', { ...user, id: USER_KEY });
}

export async function saveItems(items: ItemProgress[]): Promise<void> {
  await putAll('itemProgress', items as unknown as Array<Record<string, unknown>>);
}

export async function saveLesson(lesson: LessonProgress): Promise<void> {
  await put('lessonProgress', lesson as unknown as Record<string, unknown>);
}

export async function saveAchievements(entries: AchievementProgress[]): Promise<void> {
  await putAll('achievementProgress', entries as unknown as Array<Record<string, unknown>>);
}

export async function saveStamp(id: string, earnedAt: string): Promise<void> {
  await put('passportStamps', { id, earnedAt });
}

export async function saveWeakness(counts: WeaknessCounts): Promise<void> {
  await put('settings', { key: 'weakness', value: counts });
}

/** Appends one finished review or lesson session, for later analysis. */
export async function appendHistory(entry: {
  day: number;
  answered: number;
  correct: number;
  completedAt: string;
}): Promise<void> {
  await put('reviewHistory', { ...entry });
}

export async function resetProgress(): Promise<void> {
  await clearAll();
}
