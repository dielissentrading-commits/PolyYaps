/**
 * Minimal IndexedDB access — docs/07-technical-architecture.md, section 8.
 *
 * Deliberately small and dependency-free: the app needs key-value stores with
 * promises, not a query engine. Components never call this directly; they go
 * through progressRepository, which keeps a later move to cloud sync cheap.
 */

export const DB_NAME = 'polyyaps';
export const DB_VERSION = 1;

export type StoreName =
  | 'userProgress'
  | 'itemProgress'
  | 'lessonProgress'
  | 'achievementProgress'
  | 'passportStamps'
  | 'reviewHistory'
  | 'settings';

/** Store definitions; the key path is the field records are looked up by. */
const STORES: Array<{ name: StoreName; keyPath: string; autoIncrement?: boolean }> = [
  { name: 'userProgress', keyPath: 'id' },
  { name: 'itemProgress', keyPath: 'itemId' },
  { name: 'lessonProgress', keyPath: 'day' },
  { name: 'achievementProgress', keyPath: 'achievementId' },
  { name: 'passportStamps', keyPath: 'id' },
  { name: 'reviewHistory', keyPath: 'id', autoIncrement: true },
  { name: 'settings', keyPath: 'key' },
];

/**
 * In-memory stand-in for browsers where IndexedDB is unavailable — private
 * windows, blocked storage, tests. The app keeps working for the session;
 * `isPersistent()` tells the UI that nothing is being saved.
 */
class MemoryBackend {
  private data = new Map<StoreName, Map<IDBValidKey, unknown>>();

  private store(name: StoreName) {
    let store = this.data.get(name);
    if (!store) {
      store = new Map();
      this.data.set(name, store);
    }
    return store;
  }

  get<T>(name: StoreName, key: IDBValidKey): T | undefined {
    return this.store(name).get(key) as T | undefined;
  }

  getAll<T>(name: StoreName): T[] {
    return [...this.store(name).values()] as T[];
  }

  put(name: StoreName, value: Record<string, unknown>) {
    const definition = STORES.find((entry) => entry.name === name);
    const key = definition ? (value[definition.keyPath] as IDBValidKey) : undefined;
    if (key !== undefined) this.store(name).set(key, value);
  }

  remove(name: StoreName, key: IDBValidKey) {
    this.store(name).delete(key);
  }

  clear(name: StoreName) {
    this.store(name).clear();
  }
}

const memory = new MemoryBackend();
let database: IDBDatabase | null = null;
let openFailed = false;

function indexedDBAvailable(): boolean {
  return typeof indexedDB !== 'undefined';
}

function openDatabase(): Promise<IDBDatabase | null> {
  if (database) return Promise.resolve(database);
  if (openFailed || !indexedDBAvailable()) return Promise.resolve(null);

  return new Promise((resolve) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      for (const { name, keyPath, autoIncrement } of STORES) {
        if (!db.objectStoreNames.contains(name)) {
          db.createObjectStore(name, { keyPath, autoIncrement });
        }
      }
    };

    request.onsuccess = () => {
      database = request.result;
      // A second tab upgrading the schema would otherwise block silently.
      database.onversionchange = () => {
        database?.close();
        database = null;
      };
      resolve(database);
    };

    request.onerror = () => {
      openFailed = true;
      resolve(null);
    };
  });
}

function run<T>(
  name: StoreName,
  mode: IDBTransactionMode,
  action: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  return openDatabase().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        if (!db) {
          reject(new Error('IndexedDB unavailable'));
          return;
        }
        const transaction = db.transaction(name, mode);
        const request = action(transaction.objectStore(name));
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      }),
  );
}

/** True when writes actually survive a reload. */
export async function isPersistent(): Promise<boolean> {
  return (await openDatabase()) !== null;
}

export async function get<T>(name: StoreName, key: IDBValidKey): Promise<T | undefined> {
  try {
    return await run<T | undefined>(name, 'readonly', (store) => store.get(key));
  } catch {
    return memory.get<T>(name, key);
  }
}

export async function getAll<T>(name: StoreName): Promise<T[]> {
  try {
    return await run<T[]>(name, 'readonly', (store) => store.getAll());
  } catch {
    return memory.getAll<T>(name);
  }
}

export async function put<T extends Record<string, unknown>>(
  name: StoreName,
  value: T,
): Promise<void> {
  memory.put(name, value);
  try {
    await run(name, 'readwrite', (store) => store.put(value));
  } catch {
    // The memory backend already holds it; the session continues unsaved.
  }
}

export async function putAll<T extends Record<string, unknown>>(
  name: StoreName,
  values: T[],
): Promise<void> {
  for (const value of values) {
    await put(name, value);
  }
}

export async function remove(name: StoreName, key: IDBValidKey): Promise<void> {
  memory.remove(name, key);
  try {
    await run(name, 'readwrite', (store) => store.delete(key));
  } catch {
    // Already removed from the fallback.
  }
}

export async function clearStore(name: StoreName): Promise<void> {
  memory.clear(name);
  try {
    await run(name, 'readwrite', (store) => store.clear());
  } catch {
    // Already cleared from the fallback.
  }
}

/** Wipes every store — used by import and by "start over" in settings. */
export async function clearAll(): Promise<void> {
  for (const { name } of STORES) {
    await clearStore(name);
  }
}

export const STORE_NAMES = STORES.map((store) => store.name);
