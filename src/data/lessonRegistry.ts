import { day1 } from './day1';
import { day2 } from './day2';
import { day3 } from './day3';
import { day4 } from './day4';
import { day5Challenge } from './day5Challenge';
import type { ChallengeContent, LessonContent } from '../types/learning';

export const lessonRegistry: Record<number, LessonContent> = {
  1: day1,
  2: day2,
  3: day3,
  4: day4,
};

export const challengeRegistry: Record<number, ChallengeContent> = {
  5: day5Challenge,
};

export function getLesson(day: number) {
  return lessonRegistry[day];
}

export function getChallenge(day: number) {
  return challengeRegistry[day];
}

export function getAvailableDays() {
  return Array.from(new Set([...Object.keys(lessonRegistry), ...Object.keys(challengeRegistry)]))
    .map(Number)
    .sort((a, b) => a - b);
}

export function getDayTitle(day: number) {
  return getLesson(day)?.title ?? getChallenge(day)?.title ?? `Dag ${day}`;
}
