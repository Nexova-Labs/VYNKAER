import AsyncStorage from '@react-native-async-storage/async-storage';

// Thin, defensive JSON wrapper around AsyncStorage. All repositories go
// through this so persistence access never gets scattered through the UI.

export const StorageKeys = {
  athleteProfile: 'vynkaer.athleteProfile',
  workoutHistory: 'vynkaer.workoutHistory',
  activeWorkout: 'vynkaer.activeWorkout',
  trainingState: 'vynkaer.trainingState',
  settings: 'vynkaer.settings',
  // Unreadable values are copied to `${quarantinePrefix}${originalKey}.${timestamp}` before they
  // are ever replaced, so a bad read can never silently destroy an athlete's data (audit D1).
  quarantinePrefix: 'vynkaer.quarantine.',
} as const;

/** Device storage could not be read, or an unreadable value could not be preserved. Nothing was overwritten. */
export class StorageReadError extends Error {
  readonly key: string;
  readonly cause?: unknown;

  constructor(key: string, message: string, cause?: unknown) {
    super(message);
    this.name = 'StorageReadError';
    this.key = key;
    this.cause = cause;
  }
}

export type StoredValue<T> =
  | { kind: 'missing' }
  | { kind: 'ok'; value: T; raw: string }
  | { kind: 'corrupt'; raw: string };

/**
 * Reads and parses a key, keeping "nothing stored yet" apart from "stored but unusable".
 * Throws StorageReadError if the storage layer itself fails: the caller must not treat that
 * as an empty store.
 */
export async function readStored<T>(key: string): Promise<StoredValue<T>> {
  let raw: string | null;
  try {
    raw = await AsyncStorage.getItem(key);
  } catch (error) {
    throw new StorageReadError(key, `Could not read "${key}" from device storage.`, error);
  }
  if (raw == null) return { kind: 'missing' };
  try {
    return { kind: 'ok', value: JSON.parse(raw) as T, raw };
  } catch {
    return { kind: 'corrupt', raw };
  }
}

/** Copies an unusable raw value aside. If that fails the caller must stop: do not overwrite the original. */
export async function quarantineRaw(key: string, raw: string): Promise<void> {
  const quarantineKey = `${StorageKeys.quarantinePrefix}${key}.${Date.now()}`;
  try {
    await AsyncStorage.setItem(quarantineKey, raw);
  } catch (error) {
    throw new StorageReadError(key, `Could not preserve the unreadable value of "${key}", so it was left untouched.`, error);
  }
}

/**
 * Returns the stored value if it is present and valid.
 *  - missing            -> first launch: write and return the seed.
 *  - corrupt / invalid  -> copy the raw value to quarantine first, then write and return the seed.
 *  - storage failure    -> StorageReadError; nothing is written.
 */
export async function loadOrSeed<T>(key: string, seed: T, isValid: (value: unknown) => value is T): Promise<T> {
  const stored = await readStored<unknown>(key);
  if (stored.kind === 'ok' && isValid(stored.value)) return stored.value;
  if (stored.kind !== 'missing') await quarantineRaw(key, stored.raw);
  await writeJSON(key, seed);
  return seed;
}

export async function writeJSON<T>(key: string, value: T): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Persistence failures are non-fatal for a local-first V1 prototype;
    // the in-memory state remains usable for the rest of the session.
  }
}

export async function removeKey(key: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(key);
  } catch {
    // no-op
  }
}
