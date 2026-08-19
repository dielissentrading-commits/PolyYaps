import type { LessonModuleType } from '@/types';

/**
 * The fixed module sequence of a normal lesson — masterplan step 4 ("Vast
 * lesuur") and docs/07-technical-architecture.md sections 6 and 14.
 *
 * Minutes and XP are the plan's indicative values; the XP engine (V0.5) will
 * own the real numbers.
 */
export interface ModuleDefinition {
  type: LessonModuleType;
  label: string;
  description: string;
  estimatedMinutes: number;
  xp: number;
}

export const LESSON_MODULES: ModuleDefinition[] = [
  {
    type: 'review',
    label: 'Review',
    description: 'Spaced repetition van eerdere dagen',
    estimatedMinutes: 10,
    xp: 15,
  },
  {
    type: 'vocabulary',
    label: 'Woorden',
    description: '15 kernwoorden zien, horen en ophalen',
    estimatedMinutes: 8,
    xp: 20,
  },
  {
    type: 'chunks',
    label: 'Chunks',
    description: '8 zinnen die je direct kunt gebruiken',
    estimatedMinutes: 7,
    xp: 0,
  },
  {
    type: 'listening',
    label: 'Luisteren',
    description: 'Verstaan zonder tekst en uitspraak',
    estimatedMinutes: 10,
    xp: 15,
  },
  {
    type: 'grammar',
    label: 'Microgrammatica',
    description: 'Eén concept in context',
    estimatedMinutes: 5,
    xp: 10,
  },
  {
    type: 'speaking',
    label: 'Spreken',
    description: 'Scenario hardop oefenen',
    estimatedMinutes: 15,
    xp: 25,
  },
  {
    type: 'test',
    label: 'Dagtoets',
    description: 'Korte toets over vandaag',
    estimatedMinutes: 5,
    xp: 15,
  },
];

export function getModuleDefinition(type: string): ModuleDefinition | undefined {
  return LESSON_MODULES.find((module) => module.type === type);
}
