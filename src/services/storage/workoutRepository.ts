import type { WorkoutSession } from '../../types';
import { SEED_WORKOUT_HISTORY } from '../../data/seed';
import { readJSON, writeJSON, removeKey, StorageKeys } from './storage';

function isValidHistory(value: unknown): value is WorkoutSession[] {
  return Array.isArray(value) && value.every((s) => s && typeof (s as WorkoutSession).id === 'string');
}

export const WorkoutRepository = {
  async loadHistory(): Promise<WorkoutSession[]> {
    const stored = await readJSON<WorkoutSession[]>(StorageKeys.workoutHistory);
    if (stored && isValidHistory(stored)) return stored;
    await writeJSON(StorageKeys.workoutHistory, SEED_WORKOUT_HISTORY);
    return SEED_WORKOUT_HISTORY;
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
    const stored = await readJSON<WorkoutSession>(StorageKeys.activeWorkout);
    if (stored && typeof stored.id === 'string') return stored;
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
