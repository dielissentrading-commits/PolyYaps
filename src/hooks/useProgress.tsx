import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { course, getDay } from '@/content/pt-PT/course';
import {
  achievements,
  levelTitles,
  mockAchievementProgress,
  mockLessonProgress,
  mockPassportStamps,
  mockReviewSummary,
  mockSkillScores,
  mockUserProgress,
  mockVocabularyStats,
} from '@/mock/progress';
import type {
  Achievement,
  AchievementProgress,
  CourseDay,
  LessonProgress,
  PassportStamp,
  ReviewQueueSummary,
  SkillScore,
  UserProgress,
} from '@/types';

/**
 * Single read model for everything the shell renders.
 *
 * V0.1 resolves it from mock data. From V0.3 the same context will be filled by
 * progressRepository (IndexedDB), so screens keep consuming one stable
 * interface instead of reaching into storage themselves.
 */
export interface ProgressState {
  user: UserProgress;
  levelTitle: string;
  lessons: LessonProgress[];
  skills: SkillScore[];
  review: ReviewQueueSummary;
  vocabulary: typeof mockVocabularyStats;
  achievements: Achievement[];
  achievementProgress: AchievementProgress[];
  passportStamps: PassportStamp[];
  /** The day the user should study next. */
  todayLesson?: CourseDay;
  completionPercentage: number;
  lessonProgressFor: (day: number) => LessonProgress | undefined;
}

const ProgressContext = createContext<ProgressState | null>(null);

export function ProgressProvider({ children }: { children: ReactNode }) {
  const value = useMemo<ProgressState>(() => {
    const user = mockUserProgress;
    const completedDays = mockLessonProgress.filter((lesson) => lesson.completed).length;

    return {
      user,
      levelTitle: levelTitles[Math.min(user.level - 1, levelTitles.length - 1)] ?? levelTitles[0],
      lessons: mockLessonProgress,
      skills: mockSkillScores,
      review: mockReviewSummary,
      vocabulary: mockVocabularyStats,
      achievements,
      achievementProgress: mockAchievementProgress,
      passportStamps: mockPassportStamps,
      todayLesson: getDay(user.currentDay),
      completionPercentage: Math.round((completedDays / course.totalDays) * 100),
      lessonProgressFor: (day) => mockLessonProgress.find((lesson) => lesson.day === day),
    };
  }, []);

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

export function useProgress(): ProgressState {
  const context = useContext(ProgressContext);
  if (!context) {
    throw new Error('useProgress must be used inside a ProgressProvider');
  }
  return context;
}
