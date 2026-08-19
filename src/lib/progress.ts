export type DayResult = {
  score: number;
  stars: 1 | 2 | 3;
  xpEarned: number;
  completedAt: string;
  kind?: 'lesson' | 'challenge';
};

export type ProgressState = {
  currentDay: number;
  totalXp: number;
  streak: number;
  longestStreak: number;
  completedDays: number[];
  dayResults: Record<number, DayResult>;
  learnedWords: string[];
  learnedChunks: string[];
  passportStamps: string[];
  achievements: string[];
  lastStudyDate?: string;
};

const STORAGE_KEY = 'polyyaps-progress-v1';

const initialProgress: ProgressState = {
  currentDay: 1,
  totalXp: 0,
  streak: 0,
  longestStreak: 0,
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
  if (existing.lastStudyDate === today) return existing.streak;
  if (!existing.lastStudyDate) return 1;
  const gap = daysBetween(existing.lastStudyDate, today);
  return gap === 1 ? existing.streak + 1 : 1;
}

export function loadProgress(): ProgressState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return initialProgress;
    const parsed = JSON.parse(raw) as Partial<ProgressState>;
    return {
      ...initialProgress,
      ...parsed,
      passportStamps: parsed.passportStamps ?? [],
      achievements: parsed.achievements ?? [],
    };
  } catch {
    return initialProgress;
  }
}

export function saveProgress(progress: ProgressState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

export function completeLesson(day: number, score: number, wordIds: string[], chunkIds: string[]): ProgressState {
  const existing = loadProgress();
  const today = localDateKey();
  const previousResult = existing.dayResults[day];
  const stars: 1 | 2 | 3 = score >= 90 ? 3 : score >= 75 ? 2 : 1;
  const baseXp = 100;
  const scoreBonus = score === 100 ? 15 : score >= 90 ? 10 : 0;
  const xpEarned = previousResult ? Math.max(10, scoreBonus) : baseXp + scoreBonus;
  const streak = updateStreak(existing, today);
  const achievements = new Set(existing.achievements);
  if (!existing.completedDays.includes(day)) achievements.add('primeiras-palavras');
  if (existing.learnedWords.length + wordIds.length >= 100) achievements.add('cem-palavras');

  const next: ProgressState = {
    ...existing,
    currentDay: Math.max(existing.currentDay, Math.min(30, day + 1)),
    totalXp: existing.totalXp + xpEarned,
    streak,
    longestStreak: Math.max(existing.longestStreak, streak),
    completedDays: Array.from(new Set([...existing.completedDays, day])).sort((a, b) => a - b),
    dayResults: {
      ...existing.dayResults,
      [day]: { score, stars, xpEarned, completedAt: new Date().toISOString(), kind: 'lesson' },
    },
    learnedWords: Array.from(new Set([...existing.learnedWords, ...wordIds.map((id) => `d${day}:word:${id}`)])),
    learnedChunks: Array.from(new Set([...existing.learnedChunks, ...chunkIds.map((id) => `d${day}:chunk:${id}`)])),
    achievements: Array.from(achievements),
    lastStudyDate: today,
  };

  saveProgress(next);
  return next;
}

export function completeChallenge(
  day: number,
  score: number,
  rewardXp: number,
  stampId: string,
  wordIds: string[],
  chunkIds: string[],
): ProgressState {
  const existing = loadProgress();
  const today = localDateKey();
  const previousResult = existing.dayResults[day];
  const stars: 1 | 2 | 3 = score >= 90 ? 3 : score >= 75 ? 2 : 1;
  const passed = score >= 70;
  const xpEarned = previousResult ? 15 : passed ? rewardXp : 60;
  const streak = updateStreak(existing, today);
  const stamps = new Set(existing.passportStamps);
  const achievements = new Set(existing.achievements);
  if (passed) {
    stamps.add(stampId);
    achievements.add('um-cafe-por-favor');
  }

  const next: ProgressState = {
    ...existing,
    currentDay: passed ? Math.max(existing.currentDay, Math.min(30, day + 1)) : Math.max(existing.currentDay, day),
    totalXp: existing.totalXp + xpEarned,
    streak,
    longestStreak: Math.max(existing.longestStreak, streak),
    completedDays: passed ? Array.from(new Set([...existing.completedDays, day])).sort((a, b) => a - b) : existing.completedDays,
    dayResults: {
      ...existing.dayResults,
      [day]: { score, stars, xpEarned, completedAt: new Date().toISOString(), kind: 'challenge' },
    },
    learnedWords: Array.from(new Set([...existing.learnedWords, ...wordIds.map((id) => `d${day}:word:${id}`)])),
    learnedChunks: Array.from(new Set([...existing.learnedChunks, ...chunkIds.map((id) => `d${day}:chunk:${id}`)])),
    passportStamps: Array.from(stamps),
    achievements: Array.from(achievements),
    lastStudyDate: today,
  };

  saveProgress(next);
  return next;
}

export function resetProgress() {
  localStorage.removeItem(STORAGE_KEY);
}
