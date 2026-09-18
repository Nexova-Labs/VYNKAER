import type { AthleteProfile } from '../../types';
import { SEED_ATHLETE_PROFILE } from '../../data/seed';
import { readJSON, writeJSON, StorageKeys } from './storage';

function isValidProfile(value: unknown): value is AthleteProfile {
  if (!value || typeof value !== 'object') return false;
  const p = value as Partial<AthleteProfile>;
  return typeof p.id === 'string' && typeof p.displayName === 'string' && Array.isArray(p.trainingStyles);
}

export const AthleteRepository = {
  async load(): Promise<AthleteProfile> {
    const stored = await readJSON<AthleteProfile>(StorageKeys.athleteProfile);
    if (stored && isValidProfile(stored)) return stored;
    await writeJSON(StorageKeys.athleteProfile, SEED_ATHLETE_PROFILE);
    return SEED_ATHLETE_PROFILE;
  },

  async save(profile: AthleteProfile): Promise<void> {
    await writeJSON(StorageKeys.athleteProfile, { ...profile, updatedAt: new Date().toISOString() });
  },

  async reset(): Promise<AthleteProfile> {
    await writeJSON(StorageKeys.athleteProfile, SEED_ATHLETE_PROFILE);
    return SEED_ATHLETE_PROFILE;
  },
};
