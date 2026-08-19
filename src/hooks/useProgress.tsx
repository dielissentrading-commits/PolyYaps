import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { course, getDay } from '@/content/pt-PT/course';
import { achievements } from '@/content/pt-PT/achievements';
import { stamps, stampsForDay } from '@/content/pt-PT/passport';
import { levelForXP, levelTitle } from '@/content/pt-PT/levels';
import { dayKey } from '@/engine/dates';
import { applyAnswer, emptyItemProgress } from '@/engine/mastery';
import { buildReviewQueue, estimateMinutes, weakItems } from '@/engine/review';
import { buildLessonProgress } from '@/engine/scoring';
import { applyStudyDay } from '@/engine/streak';
import { lessonXP } from '@/engine/xp';
import { currentFocus, type WeaknessCounts } from '@/engine/weakness';
import { evaluateAchievements, newlyUnlocked } from '@/engine/achievements';
import { scheduleNextReview } from '@/engine/review';
import * as repository from '@/storage/progressRepository';
import type {
  Achievement,
  AchievementProgress,
  AnswerResult,
  CourseDay,
  ItemProgress,
  LessonProgress,
  LessonSession,
  PassportStamp,
  ReviewQueueSummary,
  SkillKey,
  SkillScore,
  UserProgress,
} from '@/types';

/**
 * Single read/write model for learner progress.
 *
 * Screens read from this context and call its actions; the engines decide what
 * an answer means and the repository decides where it is stored. Neither
 * concern leaks into a screen.
 */

const SKILL_LABELS: Array<[SkillKey, string]> = [
  ['vocabulary', 'Woordenschat'],
  ['chunks', 'Chunks'],
  ['listening', 'Luisteren'],
  ['speaking', 'Spreken'],
  ['pronunciation', 'Uitspraak'],
  ['practical', 'Praktisch Portugees'],
];

/** Category per item, so the review queue can keep a session varied. */
const ITEM_CATEGORY = new Map<string, string>();
for (const day of course.days) {
  for (const module of day.modules) {
    for (const item of module.items) {
      ITEM_CATEGORY.set(item.id, item.category);
    }
  }
}

export interface VocabularyStats {
  itemsIntroduced: number;
  itemsActive: number;
  chunksIntroduced: number;
  chunksActive: number;
}

export interface ProgressState {
  /** False until stored progress has been read back. */
  ready: boolean;
  /** False when this browser cannot persist, so the UI can say so. */
  persistent: boolean;
  user: UserProgress;
  levelTitle: string;
  lessons: LessonProgress[];
  items: Record<string, ItemProgress>;
  skills: SkillScore[];
  review: ReviewQueueSummary;
  reviewQueue: ItemProgress[];
  vocabulary: VocabularyStats;
  achievements: Achievement[];
  achievementProgress: AchievementProgress[];
  /** Achievements unlocked by the most recent completion, for one celebration. */
  justUnlocked: string[];
  passportStamps: PassportStamp[];
  todayLesson?: CourseDay;
  completionPercentage: number;
  lessonProgressFor: (day: number) => LessonProgress | undefined;
  session?: LessonSession;
  /** Called by the player after each module; updates mastery and scheduling. */
  recordAnswers: (results: AnswerResult[]) => void;
  /** Finishes the day: score, stars, XP, streak, and the next day unlocked. */
  completeLesson: (day: number) => Promise<LessonProgress | undefined>;
  clearSession: () => void;
  resetProgress: () => Promise<void>;
  /** Re-reads everything from storage, e.g. after importing a backup. */
  reload: () => Promise<void>;
}

const ProgressContext = createContext<ProgressState | null>(null);

/** Averages each skill over the lessons that measured it. */
function skillAverages(lessons: LessonProgress[]): SkillScore[] {
  const completed = lessons.filter((lesson) => lesson.completed);

  return SKILL_LABELS.map(([key, label]) => {
    const field = `${key}Score` as keyof LessonProgress;
    const values = completed
      .map((lesson) => lesson[field])
      .filter((value): value is number => typeof value === 'number');

    return {
      key,
      label,
      score: values.length
        ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length)
        : 0,
    };
  });
}

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [persistent, setPersistent] = useState(true);
  const [user, setUser] = useState<UserProgress>(repository.defaultUserProgress);
  const [lessons, setLessons] = useState<LessonProgress[]>([]);
  const [items, setItems] = useState<Record<string, ItemProgress>>({});
  const [weakness, setWeakness] = useState<WeaknessCounts>({});
  const [stampsEarned, setStampsEarned] = useState<Record<string, string>>({});
  const [achievementProgress, setAchievementProgress] = useState<AchievementProgress[]>([]);
  const [justUnlocked, setJustUnlocked] = useState<string[]>([]);
  const [session, setSession] = useState<LessonSession | undefined>();

  const reload = useCallback(async () => {
    const stored = await repository.loadProgress();
    setUser(stored.user);
    setLessons(stored.lessons);
    setItems(stored.items);
    setWeakness(stored.weakness);
    setAchievementProgress(stored.achievements);
    setStampsEarned(
      Object.fromEntries(stored.stamps.map((stamp) => [stamp.id, stamp.earnedAt])),
    );
    setPersistent(stored.persistent);
    setReady(true);
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  /**
   * Applies answers to item mastery and schedules the next review for each.
   * The session buffer keeps the raw answers so the daily score can be
   * calculated from what was actually asked.
   */
  const recordAnswers = useCallback((results: AnswerResult[]) => {
    if (results.length === 0) return;

    setItems((previous) => {
      const next = { ...previous };
      const today = dayKey();

      for (const result of results) {
        const before = next[result.itemId] ?? emptyItemProgress(result.itemId);
        const after = applyAnswer(before, {
          exerciseType: result.exerciseType,
          correct: result.correct,
          weight: result.weight,
        });
        next[result.itemId] = scheduleNextReview(after, {
          correct: result.correct,
          today,
        });
      }

      void repository.saveItems(results.map((result) => next[result.itemId]));
      return next;
    });

    setSession((previous) =>
      previous
        ? { ...previous, answers: [...previous.answers, ...results] }
        : { day: 0, answers: results, startedAt: new Date().toISOString() },
    );
  }, []);

  const clearSession = useCallback(() => setSession(undefined), []);

  /**
   * Completes a study day. Score comes from the answers given, XP from the
   * score, and the streak from the calendar — each from its own engine.
   */
  const completeLesson = useCallback(
    async (day: number): Promise<LessonProgress | undefined> => {
      const answers = session?.answers ?? [];
      if (answers.length === 0) return undefined;

      const lessonDay = getDay(day);
      const alreadyDone = lessons.some((lesson) => lesson.day === day && lesson.completed);
      const minutes = Math.max(
        1,
        Math.round((Date.now() - new Date(session!.startedAt).getTime()) / 60_000),
      );

      const record = buildLessonProgress({
        day,
        answers,
        minutes,
        checkpoint: lessonDay?.checkpoint,
        xpEarned: 0,
      });
      record.xpEarned = lessonXP({ score: record.lessonScore, repeat: alreadyDone });

      const streak = applyStudyDay(user);
      const totalXP = user.totalXP + record.xpEarned;

      const nextUser: UserProgress = {
        ...user,
        totalXP,
        level: levelForXP(totalXP),
        streak: streak.streak,
        longestStreak: streak.longestStreak,
        streakFreezes: streak.streakFreezes,
        lastCompletedDate: streak.lastCompletedDate,
        totalLearningMinutes: user.totalLearningMinutes + minutes,
        listeningCorrect:
          (user.listeningCorrect ?? 0) +
          answers.filter((answer) => answer.exerciseType === 'listening' && answer.correct).length,
        // Finishing today's lesson unlocks the next day, never skipping ahead.
        currentDay: day === user.currentDay ? Math.min(day + 1, course.totalDays) : user.currentDay,
      };

      setLessons((previous) => {
        const others = previous.filter((lesson) => lesson.day !== day);
        return [...others, record].sort((a, b) => a.day - b.day);
      });
      setUser(nextUser);

      // Gamification follows from the day being finished, never the other way
      // around: XP and stamps are consequences, not inputs.
      const nextLessons = [...lessons.filter((entry) => entry.day !== day), record];
      const nextAchievements = evaluateAchievements(
        { user: nextUser, lessons: nextLessons, items: Object.values(items) },
        achievementProgress,
      );
      setJustUnlocked(newlyUnlocked(achievementProgress, nextAchievements));
      setAchievementProgress(nextAchievements);

      const earnedNow = stampsForDay(day).filter((stamp) => !stampsEarned[stamp.id]);
      const earnedAt = new Date().toISOString();
      if (earnedNow.length) {
        setStampsEarned((previous) => ({
          ...previous,
          ...Object.fromEntries(earnedNow.map((stamp) => [stamp.id, earnedAt])),
        }));
      }

      await Promise.all([
        repository.saveLesson(record),
        repository.saveUser(nextUser),
        repository.saveAchievements(nextAchievements),
        ...earnedNow.map((stamp) => repository.saveStamp(stamp.id, earnedAt)),
        repository.appendHistory({
          day,
          answered: answers.length,
          correct: answers.filter((answer) => answer.correct).length,
          completedAt: new Date().toISOString(),
        }),
      ]);

      return record;
    },
    [session, lessons, user, items, achievementProgress, stampsEarned],
  );

  const reset = useCallback(async () => {
    await repository.resetProgress();
    setUser({ ...repository.defaultUserProgress });
    setLessons([]);
    setItems({});
    setWeakness({});
    setStampsEarned({});
    setAchievementProgress([]);
    setJustUnlocked([]);
    setSession(undefined);
  }, []);

  const value = useMemo<ProgressState>(() => {
    const tracked = Object.values(items);
    const active = tracked.filter((item) => item.masteryLevel >= 3);
    const isChunk = (itemId: string) => itemId.startsWith('c-');

    const queue = buildReviewQueue(tracked, {
      categoryOf: (itemId) => ITEM_CATEGORY.get(itemId),
    });
    const focus = currentFocus(weakness);
    const completedDays = lessons.filter((lesson) => lesson.completed).length;

    return {
      ready,
      persistent,
      user,
      levelTitle: levelTitle(levelForXP(user.totalXP)),
      lessons,
      items,
      skills: skillAverages(lessons),
      review: {
        dueCount: queue.length,
        weakCount: weakItems(tracked).length,
        estimatedMinutes: estimateMinutes(queue.length),
        focusCategory: focus?.category,
        focusLabel: focus?.label,
        focusHint: focus
          ? `Deze categorie ging de laatste tijd ${focus.mistakes} keer mis.`
          : undefined,
      },
      reviewQueue: queue,
      vocabulary: {
        itemsIntroduced: tracked.filter((item) => !isChunk(item.itemId)).length,
        itemsActive: active.filter((item) => !isChunk(item.itemId)).length,
        chunksIntroduced: tracked.filter((item) => isChunk(item.itemId)).length,
        chunksActive: active.filter((item) => isChunk(item.itemId)).length,
      },
      achievements,
      achievementProgress,
      justUnlocked,
      passportStamps: stamps.map<PassportStamp>((stamp) => ({
        id: stamp.id,
        title: stamp.title,
        scenario: stamp.scenario,
        earned: Boolean(stampsEarned[stamp.id]),
        earnedAt: stampsEarned[stamp.id],
      })),
      todayLesson: getDay(user.currentDay),
      completionPercentage: Math.round((completedDays / course.totalDays) * 100),
      lessonProgressFor: (day) => lessons.find((lesson) => lesson.day === day),
      session,
      recordAnswers,
      completeLesson,
      clearSession,
      resetProgress: reset,
      reload,
    };
  }, [
    ready,
    persistent,
    user,
    lessons,
    items,
    weakness,
    stampsEarned,
    achievementProgress,
    justUnlocked,
    session,
    recordAnswers,
    completeLesson,
    clearSession,
    reset,
    reload,
  ]);

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

export function useProgress(): ProgressState {
  const context = useContext(ProgressContext);
  if (!context) {
    throw new Error('useProgress must be used inside a ProgressProvider');
  }
  return context;
}
