import type { TrainingState } from '../../types';
import { SEED_TRAINING_STATE } from '../../data/seed';
import { readJSON, writeJSON, StorageKeys } from './storage';

export const TrainingStateRepository = {
  async load(): Promise<TrainingState> {
    const stored = await readJSON<TrainingState>(StorageKeys.trainingState);
    if (stored && typeof stored.sessionsCompleted === 'number') return stored;
    await writeJSON(StorageKeys.trainingState, SEED_TRAINING_STATE);
    return SEED_TRAINING_STATE;
  },

  async save(state: TrainingState): Promise<void> {
    await writeJSON(StorageKeys.trainingState, { ...state, updatedAt: new Date().toISOString() });
  },

  async reset(): Promise<TrainingState> {
    await writeJSON(StorageKeys.trainingState, SEED_TRAINING_STATE);
    return SEED_TRAINING_STATE;
  },
};
