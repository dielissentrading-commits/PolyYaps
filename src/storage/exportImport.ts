import { STORE_NAMES, clearAll, getAll, put, type StoreName } from './db';

/**
 * Manual backup — docs/07-technical-architecture.md, section 22.
 *
 * Progress lives only on this device until cloud sync exists, so the learner
 * needs a way to carry it off the device themselves.
 */

export const EXPORT_FORMAT = 'polyyaps-progress';
export const EXPORT_VERSION = 1;

export interface ProgressExport {
  format: typeof EXPORT_FORMAT;
  version: number;
  exportedAt: string;
  data: Partial<Record<StoreName, unknown[]>>;
}

export async function exportProgress(): Promise<ProgressExport> {
  const data: Partial<Record<StoreName, unknown[]>> = {};

  for (const store of STORE_NAMES) {
    data[store] = await getAll(store);
  }

  return {
    format: EXPORT_FORMAT,
    version: EXPORT_VERSION,
    exportedAt: new Date().toISOString(),
    data,
  };
}

export function exportFilename(date: Date = new Date()): string {
  const stamp = date.toISOString().slice(0, 10);
  return `polyyaps-voortgang-${stamp}.json`;
}

export class ImportError extends Error {}

/**
 * Checks a parsed file before anything is written.
 *
 * Import replaces everything, so a malformed file must be rejected while the
 * existing progress is still intact.
 */
export function validateExport(value: unknown): ProgressExport {
  if (typeof value !== 'object' || value === null) {
    throw new ImportError('Dit bestand bevat geen PolyYaps-voortgang.');
  }

  const candidate = value as Partial<ProgressExport>;

  if (candidate.format !== EXPORT_FORMAT) {
    throw new ImportError('Dit is geen PolyYaps-back-up.');
  }
  if (typeof candidate.version !== 'number' || candidate.version > EXPORT_VERSION) {
    throw new ImportError(
      'Deze back-up komt uit een nieuwere versie van PolyYaps. Werk de app eerst bij.',
    );
  }
  if (typeof candidate.data !== 'object' || candidate.data === null) {
    throw new ImportError('Deze back-up bevat geen gegevens.');
  }

  for (const [store, rows] of Object.entries(candidate.data)) {
    if (!STORE_NAMES.includes(store as StoreName)) {
      throw new ImportError(`Onbekend onderdeel in de back-up: ${store}.`);
    }
    if (!Array.isArray(rows)) {
      throw new ImportError(`Onderdeel ${store} heeft een onverwachte vorm.`);
    }
  }

  return candidate as ProgressExport;
}

/** Replaces all stored progress with the contents of a validated export. */
export async function importProgress(value: unknown): Promise<void> {
  const backup = validateExport(value);

  await clearAll();

  for (const [store, rows] of Object.entries(backup.data)) {
    for (const row of rows as Array<Record<string, unknown>>) {
      await put(store as StoreName, row);
    }
  }
}

export async function readExportFile(file: File): Promise<ProgressExport> {
  let parsed: unknown;
  try {
    parsed = JSON.parse(await file.text());
  } catch {
    throw new ImportError('Dit bestand is geen geldige JSON.');
  }
  return validateExport(parsed);
}
