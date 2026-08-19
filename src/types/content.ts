/**
 * Course-content contracts — docs/07-technical-architecture.md sections 5, 6 and 19.
 * Content is data: lesson screens render these objects, they never hardcode a day.
 */

export type LearningItemType = 'word' | 'chunk' | 'grammar' | 'listening' | 'scenario';

export type WeaknessCategory =
  | 'SER_VS_ESTAR'
  | 'GOSTAR_DE'
  | 'TER_AGE'
  | 'PAST_TENSE'
  | 'NUMBERS'
  | 'LISTENING_REDUCED_VOWELS'
  | 'PRONUNCIATION_R';

export interface LearningItem {
  id: string;
  type: LearningItemType;
  portuguese: string;
  dutch?: string;
  dayIntroduced: number;
  category: string;
  priority: number;
  example?: string;
  audioPath?: string;
  weaknessCategory?: WeaknessCategory;
}

export type LessonModuleType =
  | 'review'
  | 'vocabulary'
  | 'chunks'
  | 'listening'
  | 'grammar'
  | 'speaking'
  | 'test';

/** A short explanation shown in a grammar or listening module. */
export interface LessonNote {
  title: string;
  /** Paragraphs of prose. */
  body: string[];
  /** Bullet points, e.g. verb forms or key phrases. */
  points: string[];
}

export type LessonTaskKind = 'speaking' | 'challenge' | 'test';

/** A practice assignment: a speaking prompt, a challenge or an exam part. */
export interface LessonTask {
  title: string;
  kind: LessonTaskKind;
  body: string[];
  steps: string[];
}

export interface LessonModule {
  id: string;
  lessonDay: number;
  type: LessonModuleType;
  estimatedMinutes: number;
  items: LearningItem[];
  notes?: LessonNote[];
  tasks?: LessonTask[];
}

/** The five curriculum phases from docs/01-masterplan-stap-1-tm-5.md, step 2. */
export type CoursePhase = 1 | 2 | 3 | 4 | 5;

export interface LessonDay {
  day: number;
  title: string;
  /** What the learner can do after this day, from the editorial source. */
  goal: string;
  checkpoint: boolean;
  /** Present on checkpoint days, which replace the normal module sequence. */
  challengeId?: string;
  modules: LessonModule[];
}

/** A curriculum day with its position in the course attached. */
export interface CourseDay extends LessonDay {
  phase: CoursePhase;
  phaseTitle: string;
}

export interface PhaseDefinition {
  phase: CoursePhase;
  title: string;
  dayRange: [number, number];
}

export interface Course {
  id: string;
  language: string;
  title: string;
  totalDays: number;
  phases: PhaseDefinition[];
  days: CourseDay[];
}
