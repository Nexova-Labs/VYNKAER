import AsyncStorage from '@react-native-async-storage/async-storage';

// Thin, defensive JSON wrapper around AsyncStorage. All repositories go
// through this so persistence access never gets scattered through the UI.

export async function readJSON<T>(key: string): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (raw == null) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
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

export const StorageKeys = {
  athleteProfile: 'vynkaer.athleteProfile',
  workoutHistory: 'vynkaer.workoutHistory',
  activeWorkout: 'vynkaer.activeWorkout',
  trainingState: 'vynkaer.trainingState',
  settings: 'vynkaer.settings',
} as const;
