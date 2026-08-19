import { day1 } from './day1';
import { day2 } from './day2';
import type { LessonContent } from '../types/learning';

export const lessonRegistry: Record<number, LessonContent> = {
  1: day1,
  2: day2,
};

export function getLesson(day: number) {
  return lessonRegistry[day];
}

export function getAvailableDays() {
  return Object.keys(lessonRegistry).map(Number).sort((a, b) => a - b);
}
