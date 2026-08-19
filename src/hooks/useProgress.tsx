import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { course, getDay } from '@/content/pt-PT/course';
import { achievements } from '@/content/pt-PT/achievements';
import { stamps } from '@/content/pt-PT/passport';
import { levelForXP, levelTitle } from '@/content/pt-PT/levels';
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
  SkillScore,
  UserProgress,
} from '@/types';

/**
 * Single read/write model for learner progress.
 *
 * Screens talk only to this context. What backs it changes over time — an
 * in-memory store today, IndexedDB next — without the screens noticing.
 */

const SKILL_LABELS: Array<[SkillScore['key'], string]> = [
  ['vocabulary', 'Woordenschat'],
  ['chunks', 'Chunks'],
  ['listening', 'Luisteren'],
  ['speaking', 'Spreken'],
  ['pronunciation', 'Uitspraak'],
  ['practical', 'Praktisch Portugees'],
];

const emptyUser: UserProgress = {
  currentDay: 1,
  totalXP: 0,
  level: 1,
  streak: 0,
  longestStreak: 0,
  streakFreezes: 0,
  totalLearningMinutes: 0,
};

export interface VocabularyStats {
  itemsIntroduced: number;
  itemsActive: number;
  chunksIntroduced: number;
  chunksActive: number;
}

export interface ProgressState {
  user: UserProgress;
  levelTitle: string;
  lessons: LessonProgress[];
  items: Record<string, ItemProgress>;
  skills: SkillScore[];
  review: ReviewQueueSummary;
  vocabulary: VocabularyStats;
  achievements: Achievement[];
  achievementProgress: AchievementProgress[];
  passportStamps: PassportStamp[];
  todayLesson?: CourseDay;
  completionPercentage: number;
  lessonProgressFor: (day: number) => LessonProgress | undefined;
  /** Answers from the lesson currently in progress, if any. */
  session?: LessonSession;
  /** Called by the lesson player when it finishes a module. */
  recordAnswers: (results: AnswerResult[]) => void;
  clearSession: () => void;
}

const ProgressContext = createContext<ProgressState | null>(null);

/** Averages the skill scores of every completed lesson. */
function skillAverages(lessons: LessonProgress[]): SkillScore[] {
  const completed = lessons.filter((lesson) => lesson.completed);

  return SKILL_LABELS.map(([key, label]) => {
    const field = `${key}Score` as keyof LessonProgress;
    const values = completed
      .map((lesson) => lesson[field])
      .filter((value): value is number => typeof value === 'number');

    const score = values.length
      ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length)
      : 0;

    return { key, label, score };
  });
}

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [user] = useState<UserProgress>(emptyUser);
  const [lessons] = useState<LessonProgress[]>([]);
  const [items] = useState<Record<string, ItemProgress>>({});
  const [session, setSession] = useState<LessonSession | undefined>();

  const recordAnswers = useCallback(
    (results: AnswerResult[]) => {
      if (results.length === 0) return;
      setSession((previous) => {
        if (previous && previous.day === user.currentDay) {
          return { ...previous, answers: [...previous.answers, ...results] };
        }
        return {
          day: user.currentDay,
          answers: results,
          startedAt: new Date().toISOString(),
        };
      });
    },
    [user.currentDay],
  );

  const clearSession = useCallback(() => setSession(undefined), []);

  const value = useMemo<ProgressState>(() => {
    const completedDays = lessons.filter((lesson) => lesson.completed).length;
    const tracked = Object.values(items);

    // "Active" means mastery level 3 or higher: produced or used freely.
    const active = tracked.filter((item) => item.masteryLevel >= 3);
    const isChunk = (itemId: string) => itemId.startsWith('c-');

    return {
      user,
      levelTitle: levelTitle(levelForXP(user.totalXP)),
      lessons,
      items,
      skills: skillAverages(lessons),
      review: {
        dueCount: 0,
        weakCount: 0,
        estimatedMinutes: 0,
      },
      vocabulary: {
        itemsIntroduced: tracked.filter((item) => !isChunk(item.itemId)).length,
        itemsActive: active.filter((item) => !isChunk(item.itemId)).length,
        chunksIntroduced: tracked.filter((item) => isChunk(item.itemId)).length,
        chunksActive: active.filter((item) => isChunk(item.itemId)).length,
      },
      achievements,
      achievementProgress: achievements.map((achievement) => ({
        achievementId: achievement.id,
        unlocked: false,
        progress: 0,
      })),
      passportStamps: stamps.map<PassportStamp>((stamp) => ({
        id: stamp.id,
        title: stamp.title,
        scenario: stamp.scenario,
        earned: false,
      })),
      todayLesson: getDay(user.currentDay),
      completionPercentage: Math.round((completedDays / course.totalDays) * 100),
      lessonProgressFor: (day) => lessons.find((lesson) => lesson.day === day),
      session,
      recordAnswers,
      clearSession,
    };
  }, [user, lessons, items, session, recordAnswers, clearSession]);

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

export function useProgress(): ProgressState {
  const context = useContext(ProgressContext);
  if (!context) {
    throw new Error('useProgress must be used inside a ProgressProvider');
  }
  return context;
}
