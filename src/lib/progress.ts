export type DayResult = {
  score: number;
  stars: 1 | 2 | 3;
  xpEarned: number;
  cumulativeXp?: number;
  completedAt: string;
  kind?: 'lesson' | 'challenge';
};

export type ProgressState = {
  currentDay: number;
  totalXp: number;
  streak: number;
  longestStreak: number;
  streakFreezes: number;
  completedDays: number[];
  dayResults: Record<number, DayResult>;
  learnedWords: string[];
  learnedChunks: string[];
  passportStamps: string[];
  achievements: string[];
  lastStudyDate?: string;
  courseCompletedAt?: string;
};

const STORAGE_KEY = 'polyyaps-progress-v1';

const initialProgress: ProgressState = {
  currentDay: 1,
  totalXp: 0,
  streak: 0,
  longestStreak: 0,
  streakFreezes: 0,
  completedDays: [],
  dayResults: {},
  learnedWords: [],
  learnedChunks: [],
  passportStamps: [],
  achievements: [],
};

function localDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function daysBetween(a: string, b: string) {
  const first = new Date(`${a}T12:00:00`);
  const second = new Date(`${b}T12:00:00`);
  return Math.round((second.getTime() - first.getTime()) / 86_400_000);
}

function updateStreak(existing: ProgressState, today: string) {
  if (existing.lastStudyDate === today) return { streak: existing.streak, freezes: existing.streakFreezes ?? 0, advanced: false };
  if (!existing.lastStudyDate) return { streak: 1, freezes: existing.streakFreezes ?? 0, advanced: true };
  const gap = daysBetween(existing.lastStudyDate, today);
  if (gap === 1) return { streak: existing.streak + 1, freezes: existing.streakFreezes ?? 0, advanced: true };
  if (gap === 2 && (existing.streakFreezes ?? 0) > 0) return { streak: existing.streak + 1, freezes: existing.streakFreezes - 1, advanced: true };
  return { streak: 1, freezes: existing.streakFreezes ?? 0, advanced: true };
}

function applyStreakRewards(existing: ProgressState, streakState: ReturnType<typeof updateStreak>, achievements: Set<string>) {
  let freezes = streakState.freezes;
  if (streakState.streak >= 5) achievements.add('em-boa-forma');
  if (streakState.streak >= 20) achievements.add('persistente');
  if (streakState.advanced && streakState.streak > 0 && streakState.streak % 5 === 0) freezes = Math.min(2, freezes + 1);
  return freezes;
}

function mergeLearningKeys(existing: string[], day: number, type: 'word' | 'chunk', ids: string[]) {
  return Array.from(new Set([...existing, ...ids.map((id) => `d${day}:${type}:${id}`)]));
}

export function loadProgress(): ProgressState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return initialProgress;
    const parsed = JSON.parse(raw) as Partial<ProgressState>;
    return { ...initialProgress, ...parsed, streakFreezes: parsed.streakFreezes ?? 0, passportStamps: parsed.passportStamps ?? [], achievements: parsed.achievements ?? [] };
  } catch {
    return initialProgress;
  }
}

export function saveProgress(progress: ProgressState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

export function grantAchievement(id: string): ProgressState {
  const existing = loadProgress();
  if (existing.achievements.includes(id)) return existing;
  const next = { ...existing, achievements: [...existing.achievements, id] };
  saveProgress(next);
  return next;
}

export function completeLesson(day: number, score: number, wordIds: string[], chunkIds: string[]): ProgressState {
  const existing = loadProgress();
  const today = localDateKey();
  const previousResult = existing.dayResults[day];
  const stars: 1 | 2 | 3 = score >= 90 ? 3 : score >= 75 ? 2 : 1;
  const targetXp = 100 + (score === 100 ? 15 : score >= 90 ? 10 : 0);
  const priorCumulative = previousResult?.cumulativeXp ?? previousResult?.xpEarned ?? 0;
  const xpEarned = previousResult ? Math.max(0, Math.min(15, score - previousResult.score)) : targetXp;
  const cumulativeXp = priorCumulative + xpEarned;
  const streakState = updateStreak(existing, today);
  const achievements = new Set(existing.achievements);
  const learnedWords = mergeLearningKeys(existing.learnedWords, day, 'word', wordIds);
  const learnedChunks = mergeLearningKeys(existing.learnedChunks, day, 'chunk', chunkIds);

  if (!existing.completedDays.includes(day)) achievements.add('primeiras-palavras');
  if (learnedWords.length >= 100) achievements.add('cem-palavras');
  if (day >= 27) achievements.add('negocios');
  const streakFreezes = applyStreakRewards(existing, streakState, achievements);

  const next: ProgressState = {
    ...existing,
    currentDay: Math.max(existing.currentDay, Math.min(30, day + 1)),
    totalXp: existing.totalXp + xpEarned,
    streak: streakState.streak,
    longestStreak: Math.max(existing.longestStreak, streakState.streak),
    streakFreezes,
    completedDays: Array.from(new Set([...existing.completedDays, day])).sort((a, b) => a - b),
    dayResults: { ...existing.dayResults, [day]: { score, stars, xpEarned, cumulativeXp, completedAt: new Date().toISOString(), kind: 'lesson' } },
    learnedWords,
    learnedChunks,
    achievements: Array.from(achievements),
    lastStudyDate: today,
  };
  saveProgress(next);
  return next;
}

export function completeChallenge(day: number, score: number, rewardXp: number, stampId: string, wordIds: string[], chunkIds: string[], achievementId = 'um-cafe-por-favor'): ProgressState {
  const existing = loadProgress();
  const today = localDateKey();
  const previousResult = existing.dayResults[day];
  const previouslyPassed = existing.completedDays.includes(day);
  const stars: 1 | 2 | 3 = score >= 90 ? 3 : score >= 75 ? 2 : 1;
  const passed = score >= 70;
  const priorCumulative = previousResult?.cumulativeXp ?? previousResult?.xpEarned ?? 0;
  let xpEarned = 0;
  if (!previousResult && !passed) xpEarned = Math.min(60, rewardXp);
  else if (!previouslyPassed && passed) xpEarned = Math.max(0, rewardXp - priorCumulative);
  const cumulativeXp = priorCumulative + xpEarned;
  const streakState = updateStreak(existing, today);
  const stamps = new Set(existing.passportStamps);
  const achievements = new Set(existing.achievements);
  const learnedWords = mergeLearningKeys(existing.learnedWords, day, 'word', wordIds);
  const learnedChunks = mergeLearningKeys(existing.learnedChunks, day, 'chunk', chunkIds);

  if (passed) {
    stamps.add(stampId);
    achievements.add(achievementId);
  }
  if (learnedWords.length >= 100) achievements.add('cem-palavras');
  const streakFreezes = applyStreakRewards(existing, streakState, achievements);
  const completedDays = passed ? Array.from(new Set([...existing.completedDays, day])).sort((a, b) => a - b) : existing.completedDays;
  const completedAt = day === 30 && passed ? new Date().toISOString() : existing.courseCompletedAt;

  const next: ProgressState = {
    ...existing,
    currentDay: passed ? Math.max(existing.currentDay, Math.min(30, day + 1)) : Math.max(existing.currentDay, day),
    totalXp: existing.totalXp + xpEarned,
    streak: streakState.streak,
    longestStreak: Math.max(existing.longestStreak, streakState.streak),
    streakFreezes,
    completedDays,
    dayResults: { ...existing.dayResults, [day]: { score, stars, xpEarned, cumulativeXp, completedAt: new Date().toISOString(), kind: 'challenge' } },
    learnedWords,
    learnedChunks,
    passportStamps: Array.from(stamps),
    achievements: Array.from(achievements),
    lastStudyDate: today,
    courseCompletedAt: completedAt,
  };
  saveProgress(next);
  return next;
}

export function resetProgress() {
  localStorage.removeItem(STORAGE_KEY);
}
