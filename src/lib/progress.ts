export type DayResult = {
  score: number;
  stars: 1 | 2 | 3;
  xpEarned: number;
  completedAt: string;
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

export function loadProgress(): ProgressState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return initialProgress;
    return { ...initialProgress, ...JSON.parse(raw) } as ProgressState;
  } catch {
    return initialProgress;
  }
}

export function saveProgress(progress: ProgressState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

export function completeDayOne(score: number, wordIds: string[], chunkIds: string[]): ProgressState {
  const existing = loadProgress();
  const today = localDateKey();
  const previousResult = existing.dayResults[1];
  const stars: 1 | 2 | 3 = score >= 90 ? 3 : score >= 75 ? 2 : 1;
  const baseXp = 100;
  const scoreBonus = score === 100 ? 15 : score >= 90 ? 10 : 0;
  const xpEarned = previousResult ? Math.max(10, scoreBonus) : baseXp + scoreBonus;

  let streak = existing.streak;
  if (existing.lastStudyDate !== today) {
    if (!existing.lastStudyDate) streak = 1;
    else {
      const gap = daysBetween(existing.lastStudyDate, today);
      streak = gap === 1 ? existing.streak + 1 : 1;
    }
  }

  const next: ProgressState = {
    ...existing,
    currentDay: Math.max(existing.currentDay, 2),
    totalXp: existing.totalXp + xpEarned,
    streak,
    longestStreak: Math.max(existing.longestStreak, streak),
    completedDays: Array.from(new Set([...existing.completedDays, 1])),
    dayResults: {
      ...existing.dayResults,
      1: { score, stars, xpEarned, completedAt: new Date().toISOString() },
    },
    learnedWords: Array.from(new Set([...existing.learnedWords, ...wordIds])),
    learnedChunks: Array.from(new Set([...existing.learnedChunks, ...chunkIds])),
    lastStudyDate: today,
  };

  saveProgress(next);
  return next;
}

export function resetProgress() {
  localStorage.removeItem(STORAGE_KEY);
}
