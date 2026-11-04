import type { WorkoutSession } from '../../types';
import { SEED_WORKOUT_HISTORY } from '../../data/seed';
import { loadOrSeed, quarantineRaw, readStored, writeJSON, removeKey, StorageKeys } from './storage';

function isValidHistory(value: unknown): value is WorkoutSession[] {
  return Array.isArray(value) && value.every((s) => s && typeof (s as WorkoutSession).id === 'string');
}

export const WorkoutRepository = {
  async loadHistory(): Promise<WorkoutSession[]> {
    // Seeds only on a genuine first launch. If storage cannot be read this throws (StorageReadError)
    // rather than returning the demo history, because appendCompletedSession would then save it over
    // the athlete's real log.
    return loadOrSeed(StorageKeys.workoutHistory, SEED_WORKOUT_HISTORY, isValidHistory);
  },

  async saveHistory(history: WorkoutSession[]): Promise<void> {
    await writeJSON(StorageKeys.workoutHistory, history);
  },

  async appendCompletedSession(session: WorkoutSession): Promise<WorkoutSession[]> {
    const history = await this.loadHistory();
    const next = [...history, session];
    await this.saveHistory(next);
    return next;
  },

  async loadActiveWorkout(): Promise<WorkoutSession | null> {
    const stored = await readStored<WorkoutSession>(StorageKeys.activeWorkout);
    if (stored.kind === 'ok' && stored.value && typeof stored.value.id === 'string') return stored.value;
    if (stored.kind !== 'missing') {
      // Unusable in-progress session: keep a copy, then clear the key so it is not re-quarantined each launch.
      await quarantineRaw(StorageKeys.activeWorkout, stored.raw);
      await removeKey(StorageKeys.activeWorkout);
    }
    return null;
  },

  async saveActiveWorkout(session: WorkoutSession | null): Promise<void> {
    if (session == null) {
      await removeKey(StorageKeys.activeWorkout);
      return;
    }
    await writeJSON(StorageKeys.activeWorkout, session);
  },

  async reset(): Promise<WorkoutSession[]> {
    await writeJSON(StorageKeys.workoutHistory, SEED_WORKOUT_HISTORY);
    await removeKey(StorageKeys.activeWorkout);
    return SEED_WORKOUT_HISTORY;
  },
};
