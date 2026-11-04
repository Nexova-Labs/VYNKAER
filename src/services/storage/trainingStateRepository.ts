import type { TrainingState } from '../../types';
import { SEED_TRAINING_STATE } from '../../data/seed';
import { loadOrSeed, writeJSON, StorageKeys } from './storage';

function isValidTrainingState(value: unknown): value is TrainingState {
  return !!value && typeof value === 'object' && typeof (value as TrainingState).sessionsCompleted === 'number';
}

export const TrainingStateRepository = {
  async load(): Promise<TrainingState> {
    return loadOrSeed(StorageKeys.trainingState, SEED_TRAINING_STATE, isValidTrainingState);
  },

  async save(state: TrainingState): Promise<void> {
    await writeJSON(StorageKeys.trainingState, { ...state, updatedAt: new Date().toISOString() });
  },

  async reset(): Promise<TrainingState> {
    await writeJSON(StorageKeys.trainingState, SEED_TRAINING_STATE);
    return SEED_TRAINING_STATE;
  },
};
