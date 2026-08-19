import { getAllMastery, replaceAllMastery, clearMastery } from './learningDb';
import { loadProgress, saveProgress, resetProgress, type ProgressState } from './progress';
import type { MasteryRecord } from '../types/learning';

export type PolyYapsBackup = {
  version: 1;
  exportedAt: string;
  progress: ProgressState;
  mastery: MasteryRecord[];
};

export async function createBackup(): Promise<PolyYapsBackup> {
  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    progress: loadProgress(),
    mastery: await getAllMastery(),
  };
}

export async function downloadBackup() {
  const backup = await createBackup();
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `polyyaps-backup-${backup.exportedAt.slice(0, 10)}.json`;
  anchor.click();
  URL.revokeObjectURL(url);
}

export async function importBackupText(text: string) {
  const parsed = JSON.parse(text) as Partial<PolyYapsBackup>;
  if (parsed.version !== 1 || !parsed.progress || !Array.isArray(parsed.mastery)) throw new Error('Dit is geen geldige PolyYaps-back-up.');
  saveProgress(parsed.progress);
  await replaceAllMastery(parsed.mastery);
  return parsed.progress;
}

export async function resetAllLearningData() {
  resetProgress();
  await clearMastery();
}
