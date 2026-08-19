import type { LessonModuleType } from '@/types';

/**
 * Presentation metadata for the module types — the canonical order from the
 * masterplan's "Vast lesuur" (step 4) and the XP values from
 * docs/07-technical-architecture.md, section 14.
 *
 * A day's actual modules and their durations come from the generated content
 * (scripts/build-content.mjs); this module only supplies how each type is
 * labelled and what it is worth.
 */
export interface ModuleDefinition {
  type: LessonModuleType;
  label: string;
  /** Indicative XP; the XP engine (V0.5) owns the real numbers. */
  xp: number;
}

export const LESSON_MODULES: ModuleDefinition[] = [
  { type: 'review', label: 'Review', xp: 15 },
  { type: 'vocabulary', label: 'Woorden', xp: 20 },
  { type: 'chunks', label: 'Chunks', xp: 0 },
  { type: 'listening', label: 'Luisteren', xp: 15 },
  { type: 'grammar', label: 'Microgrammatica', xp: 10 },
  { type: 'speaking', label: 'Spreken', xp: 25 },
  { type: 'test', label: 'Dagtoets', xp: 15 },
];

export function getModuleDefinition(type: string): ModuleDefinition | undefined {
  return LESSON_MODULES.find((module) => module.type === type);
}
