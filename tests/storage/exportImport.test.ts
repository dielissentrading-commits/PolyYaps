import { describe, expect, it } from 'vitest';
import {
  EXPORT_FORMAT,
  EXPORT_VERSION,
  ImportError,
  exportFilename,
  validateExport,
} from '@/storage/exportImport';

const valid = {
  format: EXPORT_FORMAT,
  version: EXPORT_VERSION,
  exportedAt: '2026-08-19T10:00:00.000Z',
  data: { userProgress: [{ id: 'current', totalXP: 300 }], itemProgress: [] },
};

describe('validateExport', () => {
  it('accepts a well-formed backup', () => {
    expect(validateExport(valid).version).toBe(EXPORT_VERSION);
  });

  it('rejects a file from another app', () => {
    expect(() => validateExport({ ...valid, format: 'something-else' })).toThrow(ImportError);
  });

  it('rejects a backup from a newer version of the app', () => {
    expect(() => validateExport({ ...valid, version: EXPORT_VERSION + 1 })).toThrow(
      /nieuwere versie/,
    );
  });

  it('rejects unknown stores rather than writing them', () => {
    expect(() => validateExport({ ...valid, data: { ...valid.data, secrets: [] } })).toThrow(
      /Onbekend onderdeel/,
    );
  });

  it('rejects a store that is not a list', () => {
    expect(() => validateExport({ ...valid, data: { userProgress: {} } })).toThrow(
      /onverwachte vorm/,
    );
  });

  it('rejects values that are not objects at all', () => {
    expect(() => validateExport(null)).toThrow(ImportError);
    expect(() => validateExport('progress')).toThrow(ImportError);
  });

  it('accepts an older backup version', () => {
    expect(() => validateExport({ ...valid, version: 1 })).not.toThrow();
  });
});

describe('exportFilename', () => {
  it('names the file by date', () => {
    expect(exportFilename(new Date('2026-08-19T22:00:00Z'))).toBe(
      'polyyaps-voortgang-2026-08-19.json',
    );
  });
});
