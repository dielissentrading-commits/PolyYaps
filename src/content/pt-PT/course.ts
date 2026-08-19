import type { Course, CourseDay, CoursePhase, LessonTask, PhaseDefinition } from '@/types';
import { days as generatedDays } from './days';

/**
 * The 30-day curriculum — docs/01-masterplan-stap-1-tm-5.md, step 2.
 *
 * Day titles, goals and all learning items come from content/lessons/*.md via
 * scripts/build-content.mjs. This module adds the course-level structure the
 * editorial source does not carry: phases and boss-challenge names.
 */

const PHASES: PhaseDefinition[] = [
  { phase: 1, title: 'Survival', dayRange: [1, 5] },
  { phase: 2, title: 'Over jezelf praten', dayRange: [6, 10] },
  { phase: 3, title: 'Reizen', dayRange: [11, 15] },
  { phase: 4, title: 'Tijd en verhalen', dayRange: [16, 20] },
  { phase: 5, title: 'Sociaal Portugees', dayRange: [21, 25] },
  { phase: 5, title: 'Werk en integratie', dayRange: [26, 30] },
];

const CHALLENGE_TITLES: Record<string, string> = {
  'cafe-challenge': 'Café Challenge',
  'meet-a-local': 'Meet a Local',
  'travel-day': 'Portugal Travel Day',
  'ontem-hoje-amanha': 'Ontem, Hoje, Amanhã',
  'night-out': 'Night Out in Portugal',
  'the-portuguese-challenge': 'The Portuguese Challenge',
};

function phaseEntry(day: number): PhaseDefinition | undefined {
  return PHASES.find(({ dayRange }) => day >= dayRange[0] && day <= dayRange[1]);
}

const days: CourseDay[] = generatedDays.map((day) => {
  const phase = phaseEntry(day.day);
  return {
    ...day,
    phase: (phase?.phase ?? 5) as CoursePhase,
    phaseTitle: phase?.title ?? '',
  };
});

export const course: Course = {
  id: 'pt-PT-30-days',
  language: 'pt-PT',
  title: 'Europees Portugees in 30 dagen',
  totalDays: days.length,
  phases: PHASES,
  days,
};

export function getDay(day: number): CourseDay | undefined {
  return days.find((lessonDay) => lessonDay.day === day);
}

export function getPhaseTitle(day: number): string {
  return phaseEntry(day)?.title ?? '';
}

export function getChallengeTitle(challengeId: string): string | undefined {
  return CHALLENGE_TITLES[challengeId];
}

/** Total learning items introduced on a day, across all its modules. */
export function countItems(day: CourseDay): number {
  return day.modules.reduce((total, module) => total + module.items.length, 0);
}

/** Indicative minutes for a day, from its actual modules. */
export function countMinutes(day: CourseDay): number {
  return day.modules.reduce((total, module) => total + module.estimatedMinutes, 0);
}

/** The checkpoint assignment for a boss-challenge day, if the day has one. */
export function getChallengeTask(day: CourseDay): LessonTask | undefined {
  for (const module of day.modules) {
    const task = module.tasks?.find((entry) => entry.kind === 'challenge');
    if (task) return task;
  }
  return undefined;
}
