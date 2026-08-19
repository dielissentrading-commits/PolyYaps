import type { EvidenceType, ItemDescriptor, MasteryLevel, MasteryRecord } from '../types/learning';

const DB_NAME = 'polyyaps-learning';
const DB_VERSION = 1;
const STORE = 'itemMastery';

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE)) {
        const store = db.createObjectStore(STORE, { keyPath: 'key' });
        store.createIndex('nextReview', 'nextReview', { unique: false });
        store.createIndex('day', 'day', { unique: false });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function requestToPromise<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function transactionDone(tx: IDBTransaction) {
  return new Promise<void>((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}

export function itemKey(day: number, itemType: 'word' | 'chunk', itemId: string) {
  return `d${day}:${itemType}:${itemId}`;
}

export function descriptorFromItem(
  day: number,
  itemType: 'word' | 'chunk',
  item: { id: string; portuguese: string; dutch: string; weaknessCategory?: string },
): ItemDescriptor {
  return {
    key: itemKey(day, itemType, item.id),
    itemId: item.id,
    day,
    itemType,
    portuguese: item.portuguese,
    dutch: item.dutch,
    weaknessCategory: item.weaknessCategory,
  };
}

function initialRecord(item: ItemDescriptor): MasteryRecord {
  return {
    ...item,
    masteryLevel: 0,
    strength: 0,
    timesSeen: 0,
    timesCorrect: 0,
    timesWrong: 0,
    spokenCorrect: 0,
    usedSpontaneously: 0,
  };
}

export async function getMastery(key: string): Promise<MasteryRecord | undefined> {
  const db = await openDb();
  const tx = db.transaction(STORE, 'readonly');
  const result = await requestToPromise(tx.objectStore(STORE).get(key));
  db.close();
  return result as MasteryRecord | undefined;
}

export async function getAllMastery(): Promise<MasteryRecord[]> {
  const db = await openDb();
  const tx = db.transaction(STORE, 'readonly');
  const result = await requestToPromise(tx.objectStore(STORE).getAll());
  db.close();
  return result as MasteryRecord[];
}

export async function ensureItems(items: ItemDescriptor[]) {
  const existing = new Set((await getAllMastery()).map((record) => record.key));
  const missing = items.filter((item) => !existing.has(item.key));
  if (!missing.length) return;

  const db = await openDb();
  const tx = db.transaction(STORE, 'readwrite');
  const store = tx.objectStore(STORE);
  for (const item of missing) store.put(initialRecord(item));
  await transactionDone(tx);
  db.close();
}

function addDays(date: Date, days: number) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result.toISOString();
}

function intervalForStrength(strength: number, correct: boolean) {
  if (!correct) return 1;
  if (strength < 25) return 1;
  if (strength < 45) return 3;
  if (strength < 65) return 7;
  if (strength < 80) return 14;
  return 30;
}

const positiveDelta: Record<EvidenceType, number> = {
  exposure: 7,
  recognition: 9,
  recall: 14,
  listening: 12,
  sentence: 16,
  speaking: 17,
  context: 20,
  spontaneous: 24,
  quiz: 14,
};

const negativeDelta: Record<EvidenceType, number> = {
  exposure: 5,
  recognition: 11,
  recall: 16,
  listening: 14,
  sentence: 17,
  speaking: 18,
  context: 20,
  spontaneous: 22,
  quiz: 16,
};

function nextMasteryLevel(record: MasteryRecord, evidence: EvidenceType, correct: boolean, strength: number): MasteryLevel {
  if (!correct) return Math.max(record.timesSeen > 0 ? 1 : 0, record.masteryLevel - (strength < 20 ? 1 : 0)) as MasteryLevel;
  let level = Math.max(record.masteryLevel, 1) as MasteryLevel;
  if (['recall', 'listening', 'quiz'].includes(evidence)) level = Math.max(level, 2) as MasteryLevel;
  if (['sentence', 'speaking', 'context'].includes(evidence)) level = Math.max(level, 3) as MasteryLevel;
  if (evidence === 'spontaneous' || (strength >= 82 && record.timesCorrect >= 3)) level = 4;
  return level;
}

export async function recordAttempt(item: ItemDescriptor, evidence: EvidenceType, correct: boolean): Promise<MasteryRecord> {
  const existing = (await getMastery(item.key)) ?? initialRecord(item);
  const delta = correct ? positiveDelta[evidence] : -negativeDelta[evidence];
  const strength = Math.max(0, Math.min(100, existing.strength + delta));
  const now = new Date();
  const next: MasteryRecord = {
    ...existing,
    ...item,
    strength,
    masteryLevel: nextMasteryLevel(existing, evidence, correct, strength),
    timesSeen: existing.timesSeen + 1,
    timesCorrect: existing.timesCorrect + (correct ? 1 : 0),
    timesWrong: existing.timesWrong + (correct ? 0 : 1),
    lastReviewed: now.toISOString(),
    nextReview: addDays(now, intervalForStrength(strength, correct)),
    lastEvidence: evidence,
    spokenCorrect: existing.spokenCorrect + (correct && evidence === 'speaking' ? 1 : 0),
    usedSpontaneously: existing.usedSpontaneously + (correct && evidence === 'spontaneous' ? 1 : 0),
  };

  const db = await openDb();
  const tx = db.transaction(STORE, 'readwrite');
  tx.objectStore(STORE).put(next);
  await transactionDone(tx);
  db.close();
  return next;
}

export async function getDueItems(limit = 20): Promise<MasteryRecord[]> {
  const all = await getAllMastery();
  const now = Date.now();
  return all
    .filter((item) => item.timesSeen > 0 && item.nextReview && new Date(item.nextReview).getTime() <= now)
    .sort((a, b) => a.strength - b.strength || new Date(a.nextReview ?? 0).getTime() - new Date(b.nextReview ?? 0).getTime())
    .slice(0, limit);
}

export async function getReviewSnapshot() {
  const all = (await getAllMastery()).filter((item) => item.timesSeen > 0);
  const due = await getDueItems(1000);
  const dueKeys = new Set(due.map((item) => item.key));
  const categoryMap = new Map<string, { count: number; strength: number; due: number }>();

  for (const item of all) {
    if (!item.weaknessCategory) continue;
    const current = categoryMap.get(item.weaknessCategory) ?? { count: 0, strength: 0, due: 0 };
    current.count += 1;
    current.strength += item.strength;
    current.due += dueKeys.has(item.key) ? 1 : 0;
    categoryMap.set(item.weaknessCategory, current);
  }

  const weaknesses = Array.from(categoryMap.entries())
    .map(([category, stats]) => ({
      category,
      count: stats.count,
      due: stats.due,
      averageStrength: Math.round(stats.strength / stats.count),
    }))
    .sort((a, b) => a.averageStrength - b.averageStrength || b.due - a.due);

  return {
    learned: all.length,
    due: due.length,
    weak: all.filter((item) => item.strength < 35).length,
    attention: all.filter((item) => item.strength >= 35 && item.strength < 70).length,
    strong: all.filter((item) => item.strength >= 70).length,
    active: all.filter((item) => item.masteryLevel === 4).length,
    averageStrength: all.length ? Math.round(all.reduce((sum, item) => sum + item.strength, 0) / all.length) : 0,
    weaknesses,
  };
}
