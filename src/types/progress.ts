import type { ExerciseType, LearningItemType } from './content';

/**
 * Progress contracts — docs/07-technical-architecture.md section 7.
 * V0.1 serves these from mock data; V0.3 serves the same shapes from IndexedDB
 * through a repository layer, so screens will not have to change.
 */

export type MasteryLevel = 0 | 1 | 2 | 3 | 4;
export type StarCount = 0 | 1 | 2 | 3;

export interface UserProgress {
  currentDay: number;
  totalXP: number;
  level: number;
  streak: number;
  longestStreak: number;
  streakFreezes: number;
  totalLearningMinutes: number;
  lastCompletedDate?: string;
}

export interface ItemProgress {
  itemId: string;
  masteryLevel: MasteryLevel;
  strength: number;
  timesSeen: number;
  timesCorrect: number;
  timesWrong: number;
  lastReviewed?: string;
  nextReview?: string;
  spokenCorrect: number;
  usedSpontaneously: number;
  weaknessCategory?: string;
}

export interface LessonProgress {
  day: number;
  completed: boolean;
  timeSpentMinutes: number;
  lessonScore: number;
  xpEarned: number;
  stars: StarCount;
  vocabularyScore?: number;
  listeningScore?: number;
  speakingScore?: number;
  pronunciationScore?: number;
  practicalScore?: number;
}

export interface AchievementProgress {
  achievementId: string;
  unlocked: boolean;
  unlockedAt?: string;
  progress: number;
}

/** The six skill tracks shown on the Progress screen. */
export type SkillKey =
  | 'vocabulary'
  | 'chunks'
  | 'listening'
  | 'speaking'
  | 'pronunciation'
  | 'practical';

export interface SkillScore {
  key: SkillKey;
  label: string;
  /** 0–100. */
  score: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export interface PassportStamp {
  id: string;
  title: string;
  scenario: string;
  earned: boolean;
  earnedAt?: string;
}

/** One answered exercise, the unit the engines consume. */
export interface AnswerResult {
  itemId: string;
  correct: boolean;
  /** Exercise weight, from EXERCISE_WEIGHTS. */
  weight: number;
  exerciseType: ExerciseType;
  /** What kind of material was practised, which decides the skill it scores. */
  itemType?: LearningItemType;
}

/** Answers collected while working through one day's lesson. */
export interface LessonSession {
  day: number;
  answers: AnswerResult[];
  startedAt: string;
}

export interface ReviewQueueSummary {
  dueCount: number;
  weakCount: number;
  estimatedMinutes: number;
  /** Weakness category currently surfaced as Today's Focus, if any. */
  focusCategory?: string;
  focusLabel?: string;
  focusHint?: string;
}
