import AsyncStorage from '@react-native-async-storage/async-storage';

import { SEED_ATHLETE_PROFILE, SEED_TRAINING_STATE, SEED_WORKOUT_HISTORY } from '../../../data/seed';
import type { WorkoutSession } from '../../../types';
import {
  AthleteRepository,
  SettingsRepository,
  StorageKeys,
  StorageReadError,
  TrainingStateRepository,
  WorkoutRepository,
} from '..';

jest.mock('@react-native-async-storage/async-storage', () =>
  jest.requireActual('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

// D1: an unreadable value must never be treated as "first launch" and overwritten with the demo
// seed. Only a genuinely missing key may be seeded; anything else is preserved or quarantined.

const REAL_SESSION = { ...SEED_WORKOUT_HISTORY[0], id: 'real-session-1', workoutNumber: 999 } as WorkoutSession;
const REAL_HISTORY = [REAL_SESSION];

async function quarantined(): Promise<Record<string, string | null>> {
  const keys = (await AsyncStorage.getAllKeys()).filter((k) => k.includes('quarantine'));
  const out: Record<string, string | null> = {};
  for (const k of keys) out[k] = await AsyncStorage.getItem(k);
  return out;
}

// The official AsyncStorage mock is already a jest.fn, so a fresh spy still carries earlier calls
// (including this test's own setup writes). Clear it so only writes made by the code under test count.
function watchWrites() {
  const spy = jest.spyOn(AsyncStorage, 'setItem');
  spy.mockClear();
  return spy;
}

function failNextRead(error = new Error('disk read failed')) {
  return jest.spyOn(AsyncStorage, 'getItem').mockRejectedValueOnce(error);
}

beforeEach(async () => {
  await AsyncStorage.clear();
  jest.clearAllMocks();
});

describe('WorkoutRepository.loadHistory', () => {
  it('seeds the demo history on a genuine first launch', async () => {
    const history = await WorkoutRepository.loadHistory();
    expect(history).toEqual(SEED_WORKOUT_HISTORY);
    expect(JSON.parse((await AsyncStorage.getItem(StorageKeys.workoutHistory)) as string)).toEqual(SEED_WORKOUT_HISTORY);
  });

  it('returns stored history untouched and writes nothing', async () => {
    await AsyncStorage.setItem(StorageKeys.workoutHistory, JSON.stringify(REAL_HISTORY));
    const setItem = watchWrites();

    expect(await WorkoutRepository.loadHistory()).toEqual(REAL_HISTORY);
    expect(setItem).not.toHaveBeenCalled();
  });

  it('does not overwrite real history when the read fails; it throws instead', async () => {
    await AsyncStorage.setItem(StorageKeys.workoutHistory, JSON.stringify(REAL_HISTORY));
    failNextRead();
    const setItem = watchWrites();

    const error = await WorkoutRepository.loadHistory().then(
      () => null,
      (e: unknown) => e,
    );
    expect(error).toBeInstanceOf(StorageReadError);
    expect(setItem).not.toHaveBeenCalled();
    expect(JSON.parse((await AsyncStorage.getItem(StorageKeys.workoutHistory)) as string)).toEqual(REAL_HISTORY);
  });

  it('keeps a copy of corrupt data in quarantine before falling back to the seed', async () => {
    const corrupt = '[{"id":"real-session-1","workoutNumber":9';
    await AsyncStorage.setItem(StorageKeys.workoutHistory, corrupt);

    const history = await WorkoutRepository.loadHistory();

    expect(history).toEqual(SEED_WORKOUT_HISTORY);
    expect(Object.values(await quarantined())).toContain(corrupt);
  });

  it('keeps a copy of well-formed but wrongly shaped data in quarantine', async () => {
    const wrongShape = JSON.stringify({ not: 'an array' });
    await AsyncStorage.setItem(StorageKeys.workoutHistory, wrongShape);

    expect(await WorkoutRepository.loadHistory()).toEqual(SEED_WORKOUT_HISTORY);
    expect(Object.values(await quarantined())).toContain(wrongShape);
  });

  it('does not fall back to the seed if the quarantine copy cannot be written', async () => {
    const corrupt = '{broken';
    await AsyncStorage.setItem(StorageKeys.workoutHistory, corrupt);
    jest.spyOn(AsyncStorage, 'setItem').mockRejectedValueOnce(new Error('storage full'));

    await expect(WorkoutRepository.loadHistory()).rejects.toThrow();
    expect(await AsyncStorage.getItem(StorageKeys.workoutHistory)).toBe(corrupt);
  });
});

describe('WorkoutRepository.appendCompletedSession', () => {
  it('appends to real history', async () => {
    await AsyncStorage.setItem(StorageKeys.workoutHistory, JSON.stringify(REAL_HISTORY));
    const added = { ...REAL_SESSION, id: 'real-session-2' } as WorkoutSession;

    const next = await WorkoutRepository.appendCompletedSession(added);

    expect(next.map((s) => s.id)).toEqual(['real-session-1', 'real-session-2']);
  });

  it('never replaces real history with seed + the new session when the read fails', async () => {
    await AsyncStorage.setItem(StorageKeys.workoutHistory, JSON.stringify(REAL_HISTORY));
    failNextRead();

    await expect(
      WorkoutRepository.appendCompletedSession({ ...REAL_SESSION, id: 'real-session-2' } as WorkoutSession),
    ).rejects.toThrow();
    expect(JSON.parse((await AsyncStorage.getItem(StorageKeys.workoutHistory)) as string)).toEqual(REAL_HISTORY);
  });
});

describe('WorkoutRepository.loadActiveWorkout', () => {
  it('returns null when there is no active session', async () => {
    expect(await WorkoutRepository.loadActiveWorkout()).toBeNull();
  });

  it('throws instead of dropping an in-progress session on a read failure', async () => {
    await AsyncStorage.setItem(StorageKeys.activeWorkout, JSON.stringify(REAL_SESSION));
    failNextRead();
    await expect(WorkoutRepository.loadActiveWorkout()).rejects.toThrow();
    expect(await AsyncStorage.getItem(StorageKeys.activeWorkout)).not.toBeNull();
  });

  it('quarantines a corrupt in-progress session and returns null', async () => {
    await AsyncStorage.setItem(StorageKeys.activeWorkout, '{oops');
    expect(await WorkoutRepository.loadActiveWorkout()).toBeNull();
    expect(Object.values(await quarantined())).toContain('{oops');
  });
});

describe('AthleteRepository / TrainingStateRepository / SettingsRepository', () => {
  it('seed on first launch', async () => {
    expect(await AthleteRepository.load()).toEqual(SEED_ATHLETE_PROFILE);
    expect(await TrainingStateRepository.load()).toEqual(SEED_TRAINING_STATE);
    expect((await SettingsRepository.load()).onboardingComplete).toBe(false);
  });

  it('do not overwrite stored data when the read fails', async () => {
    const profile = { ...SEED_ATHLETE_PROFILE, displayName: 'Real Athlete' };
    const state = { ...SEED_TRAINING_STATE, sessionsCompleted: 99 };
    await AsyncStorage.setItem(StorageKeys.athleteProfile, JSON.stringify(profile));
    await AsyncStorage.setItem(StorageKeys.trainingState, JSON.stringify(state));
    await AsyncStorage.setItem(StorageKeys.settings, JSON.stringify({ onboardingComplete: true, hapticsEnabled: true }));

    failNextRead();
    await expect(AthleteRepository.load()).rejects.toThrow();
    failNextRead();
    await expect(TrainingStateRepository.load()).rejects.toThrow();
    failNextRead();
    await expect(SettingsRepository.load()).rejects.toThrow();

    expect(JSON.parse((await AsyncStorage.getItem(StorageKeys.athleteProfile)) as string).displayName).toBe('Real Athlete');
    expect(JSON.parse((await AsyncStorage.getItem(StorageKeys.trainingState)) as string).sessionsCompleted).toBe(99);
    expect(JSON.parse((await AsyncStorage.getItem(StorageKeys.settings)) as string).onboardingComplete).toBe(true);
  });

  it('quarantine corrupt values before falling back', async () => {
    await AsyncStorage.setItem(StorageKeys.athleteProfile, '{bad-profile');
    await AsyncStorage.setItem(StorageKeys.trainingState, '{bad-state');

    expect(await AthleteRepository.load()).toEqual(SEED_ATHLETE_PROFILE);
    expect(await TrainingStateRepository.load()).toEqual(SEED_TRAINING_STATE);
    const q = Object.values(await quarantined());
    expect(q).toContain('{bad-profile');
    expect(q).toContain('{bad-state');
  });

  it('explicit reset still restores the demo data (user action, not a read failure)', async () => {
    await AsyncStorage.setItem(StorageKeys.workoutHistory, JSON.stringify(REAL_HISTORY));
    expect(await WorkoutRepository.reset()).toEqual(SEED_WORKOUT_HISTORY);
  });
});
