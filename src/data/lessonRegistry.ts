import { day1 } from './day1';
import { day2 } from './day2';
import { day3 } from './day3';
import { day4 } from './day4';
import { day5Challenge } from './day5Challenge';
import { day6 } from './day6';
import { day7 } from './day7';
import { day8 } from './day8';
import { day9 } from './day9';
import { day10Challenge } from './day10Challenge';
import type { ChallengeContent, LessonContent } from '../types/learning';

export const lessonRegistry: Record<number, LessonContent> = {
  1: day1,
  2: day2,
  3: day3,
  4: day4,
  6: day6,
  7: day7,
  8: day8,
  9: day9,
};

export const challengeRegistry: Record<number, ChallengeContent> = {
  5: day5Challenge,
  10: day10Challenge,
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
