import type {
  Achievement,
  AchievementProgress,
  LessonProgress,
  PassportStamp,
  ReviewQueueSummary,
  SkillScore,
  StarCount,
  UserProgress,
} from '@/types';

/**
 * Mock progress for the V0.1 shell.
 *
 * These are plausible values for a user partway through the course, so the
 * layout can be judged with realistic numbers. V0.3 replaces this module with
 * a progressRepository backed by IndexedDB; the shapes stay identical.
 */

const CURRENT_DAY = 8;

export const mockUserProgress: UserProgress = {
  currentDay: CURRENT_DAY,
  totalXP: 745,
  level: 3,
  streak: 6,
  longestStreak: 6,
  streakFreezes: 1,
  totalLearningMinutes: 412,
  lastCompletedDate: '2026-08-18',
};

/** The gamification level titles from the masterplan, step 5. */
export const levelTitles = [
  'Novato',
  'Principiante',
  'Explorador',
  'Viajante',
  'Comunicador',
  'Conversador',
  'Aventureiro',
  'Confiante',
  'Quase Português',
  'Desafio Completo',
];

const completedDayScores: Array<{ score: number; stars: StarCount }> = [
  { score: 92, stars: 3 },
  { score: 88, stars: 2 },
  { score: 76, stars: 2 },
  { score: 95, stars: 3 },
  { score: 81, stars: 2 },
  { score: 90, stars: 3 },
  { score: 84, stars: 2 },
];

export const mockLessonProgress: LessonProgress[] = completedDayScores.map(
  ({ score, stars }, index) => ({
    day: index + 1,
    completed: true,
    timeSpentMinutes: 55 + (index % 3) * 4,
    lessonScore: score,
    xpEarned: 100 + (score >= 90 ? 10 : 0),
    stars,
  }),
);

export const mockSkillScores: SkillScore[] = [
  { key: 'vocabulary', label: 'Woordenschat', score: 82 },
  { key: 'chunks', label: 'Chunks', score: 74 },
  { key: 'listening', label: 'Luisteren', score: 61 },
  { key: 'speaking', label: 'Spreken', score: 58 },
  { key: 'pronunciation', label: 'Uitspraak', score: 66 },
  { key: 'practical', label: 'Praktisch Portugees', score: 71 },
];

export const mockReviewSummary: ReviewQueueSummary = {
  dueCount: 24,
  weakCount: 6,
  estimatedMinutes: 9,
  focusCategory: 'SER_VS_ESTAR',
  focusLabel: 'ser vs. estar',
  focusHint: 'Je koos de laatste dagen vaker het verkeerde werkwoord bij gevoelens.',
};

export const mockVocabularyStats = {
  itemsIntroduced: 138,
  itemsActive: 61,
  chunksIntroduced: 54,
  chunksActive: 22,
};

export const achievements: Achievement[] = [
  { id: 'primeiras-palavras', title: 'Primeiras Palavras', description: 'Je eerste 25 woorden geleerd.', icon: '✳︎' },
  { id: 'um-cafe', title: 'Um café, por favor', description: 'Café Challenge voltooid.', icon: '☕︎' },
  { id: 'cem-palavras', title: 'Cem Palavras', description: '100 woorden actief beheerst.', icon: '⌘' },
  { id: 'estou-a-ouvir', title: 'Estou a ouvir', description: '50 zinnen verstaan zonder tekst.', icon: '◍' },
  { id: 'sem-ingles', title: 'Sem Inglês', description: 'Een hele les zonder Engels afgerond.', icon: '∅' },
  { id: 'boa-viagem', title: 'Boa Viagem', description: 'Alle reisscenario’s voltooid.', icon: '✈' },
  { id: 'a-portuguesa', title: 'À Portuguesa', description: 'Cultuur- en eetscenario’s voltooid.', icon: '✦' },
  { id: 'negocios', title: 'Negócios', description: 'Zakelijke scenario’s voltooid.', icon: '▣' },
  { id: 'persistente', title: 'Persistente', description: '14 dagen streak volgehouden.', icon: '◆' },
  { id: 'desafio-30', title: 'Desafio dos 30 Dias', description: 'De volledige 30 dagen afgerond.', icon: '★' },
];

export const mockAchievementProgress: AchievementProgress[] = [
  { achievementId: 'primeiras-palavras', unlocked: true, unlockedAt: '2026-08-13', progress: 100 },
  { achievementId: 'um-cafe', unlocked: true, unlockedAt: '2026-08-17', progress: 100 },
  { achievementId: 'cem-palavras', unlocked: false, progress: 61 },
  { achievementId: 'estou-a-ouvir', unlocked: false, progress: 38 },
  { achievementId: 'sem-ingles', unlocked: true, unlockedAt: '2026-08-18', progress: 100 },
  { achievementId: 'boa-viagem', unlocked: false, progress: 0 },
  { achievementId: 'a-portuguesa', unlocked: false, progress: 0 },
  { achievementId: 'negocios', unlocked: false, progress: 0 },
  { achievementId: 'persistente', unlocked: false, progress: 43 },
  { achievementId: 'desafio-30', unlocked: false, progress: 23 },
];

export const mockPassportStamps: PassportStamp[] = [
  { id: 'cafe', title: 'Café', scenario: 'Een koffie bestellen en afrekenen', earned: true, earnedAt: '2026-08-17' },
  { id: 'restaurante', title: 'Restaurante', scenario: 'Uit eten van tafel tot rekening', earned: false },
  { id: 'estacao', title: 'Estação', scenario: 'Een kaartje kopen en de trein halen', earned: false },
  { id: 'hotel', title: 'Hotel', scenario: 'Inchecken en iets vragen', earned: false },
  { id: 'cidade', title: 'Cidade', scenario: 'De weg vragen in de stad', earned: false },
  { id: 'cultura', title: 'Cultura', scenario: 'Praten over eten, wijn en cultuur', earned: false },
  { id: 'conversa', title: 'Conversa', scenario: 'Smalltalk met een local', earned: false },
  { id: 'trabalho', title: 'Trabalho', scenario: 'Een zakelijke kennismaking', earned: false },
];
