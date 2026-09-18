import { EXERCISE_BY_ID, EXERCISE_LIBRARY } from '../../data/exercises';
import { SEED_ATHLETE_PROFILE, SEED_TRAINING_STATE, SEED_WORKOUT_HISTORY } from '../../data/seed';
import type { Exercise, GeneratedWorkout, LimitationArea, WorkoutGenerationContext } from '../../types';
import { generateWorkout } from '../workoutGenerator';

function buildContext(overrides: Partial<WorkoutGenerationContext> = {}): WorkoutGenerationContext {
  return {
    profile: SEED_ATHLETE_PROFILE,
    trainingState: SEED_TRAINING_STATE,
    history: SEED_WORKOUT_HISTORY,
    exerciseLibrary: EXERCISE_LIBRARY,
    requestedDurationMinutes: 60,
    activeLimitations: ['KNEE'],
    workoutNumber: 14,
    variantSeed: 0,
    ...overrides,
  };
}

function exercisesOf(workout: GeneratedWorkout): Exercise[] {
  return workout.exercises.map((item) => {
    const exercise = EXERCISE_BY_ID[item.exerciseId];
    expect(exercise).toBeDefined();
    return exercise;
  });
}

function hasPattern(workout: GeneratedWorkout, patterns: string[]): boolean {
  return exercisesOf(workout).some((exercise) => patterns.includes(exercise.movementPattern));
}

describe('generateWorkout — modality rotation', () => {
  it('advances the modality from the last completed session', () => {
    // The seeded athlete's last session was FREE_WEIGHT.
    expect(SEED_TRAINING_STATE.lastModality).toBe('FREE_WEIGHT');
    expect(generateWorkout(buildContext()).modality).toBe('MACHINE_CABLE');
  });

  it('advances MACHINE_CABLE to MIXED', () => {
    const workout = generateWorkout(
      buildContext({
        trainingState: { ...SEED_TRAINING_STATE, lastModality: 'MACHINE_CABLE' },
      }),
    );
    expect(workout.modality).toBe('MIXED');
    expect(workout.generationExplanation[0]).toContain('Machine/Cable');
    expect(workout.generationExplanation[0]).toContain('Mixed');
  });

  it('starts a brand new athlete on the first modality of the sequence', () => {
    const workout = generateWorkout(
      buildContext({
        trainingState: {
          ...SEED_TRAINING_STATE,
          lastModality: null,
          lastWorkoutId: null,
          exerciseProgression: {},
          lastCardioMinutes: 0,
          recentSessionRPE: [],
        },
        activeLimitations: [],
      }),
    );
    expect(workout.modality).toBe('FREE_WEIGHT');
    expect(workout.exercises.length).toBeGreaterThan(0);
  });
});

describe('generateWorkout — structure', () => {
  const workout = generateWorkout(buildContext());

  it('returns a structurally valid GeneratedWorkout', () => {
    expect(typeof workout.focus).toBe('string');
    expect(workout.focus.length).toBeGreaterThan(0);
    expect(workout.targetRPE).toBeGreaterThanOrEqual(6);
    expect(workout.targetRPE).toBeLessThanOrEqual(7);
    expect(workout.estimatedDurationMinutes).toBeGreaterThan(0);
    expect(workout.exercises.length).toBeGreaterThan(0);
    expect(workout.generationExplanation.length).toBeGreaterThan(1);
  });

  it('produces well-formed workout exercises in order', () => {
    workout.exercises.forEach((item, index) => {
      expect(EXERCISE_BY_ID[item.exerciseId]).toBeDefined();
      expect(item.order).toBe(index + 1);
      expect(item.targetSets).toBeGreaterThanOrEqual(1);
      expect(item.targetRepMin).toBeLessThanOrEqual(item.targetRepMax);
      expect(item.recommendedLoad).toBeGreaterThanOrEqual(0);
      expect(item.recommendationReason.length).toBeGreaterThan(0);
      expect(item.skipped).toBe(false);
      expect(item.sets).toEqual([]);
    });
  });

  it('includes a progressing conditioning block rather than an arbitrary jump', () => {
    const cardio = workout.exercises.find(
      (item) => EXERCISE_BY_ID[item.exerciseId].movementPattern === 'CONDITIONING',
    );
    expect(cardio).toBeDefined();
    expect(workout.cardioMinutes).toBeGreaterThan(SEED_TRAINING_STATE.lastCardioMinutes);
    expect(workout.cardioMinutes).toBeLessThanOrEqual(SEED_TRAINING_STATE.lastCardioMinutes + 3);
    expect(workout.cardioMinutes).toBeLessThanOrEqual(28);
    expect(workout.generationExplanation.join(' ')).toMatch(/minutes/i);
  });

  it('omits conditioning when the athlete has switched it off', () => {
    const workout2 = generateWorkout(
      buildContext({ profile: { ...SEED_ATHLETE_PROFILE, conditioningEnabled: false } }),
    );
    expect(workout2.cardioMinutes).toBe(0);
    expect(hasPattern(workout2, ['CONDITIONING'])).toBe(false);
  });
});

describe('generateWorkout — duration adaptation', () => {
  const short = generateWorkout(buildContext({ requestedDurationMinutes: 30 }));
  const long = generateWorkout(buildContext({ requestedDurationMinutes: 90 }));

  it('returns fewer exercises for a 30 minute request than for a 90 minute request', () => {
    expect(short.exercises.length).toBeLessThan(long.exercises.length);
    expect(short.estimatedDurationMinutes).toBeLessThan(long.estimatedDurationMinutes);
  });

  it('keeps at least one push and one pull in the shortened session', () => {
    expect(hasPattern(short, ['HORIZONTAL_PUSH', 'VERTICAL_PUSH'])).toBe(true);
    expect(hasPattern(short, ['HORIZONTAL_PULL', 'VERTICAL_PULL'])).toBe(true);
  });

  it('trims accessories, not primary compounds', () => {
    const shortPatterns = exercisesOf(short).map((exercise) => exercise.movementPattern);
    expect(shortPatterns).toContain('HORIZONTAL_PUSH');
    expect(shortPatterns).toContain('VERTICAL_PULL');
    expect(shortPatterns).toContain('HINGE');
    expect(shortPatterns).not.toContain('ISOLATION');
    expect(short.generationExplanation.join(' ')).toMatch(/30 minutes/);
  });

  it('reduces working sets rather than dropping compounds when the budget is very tight', () => {
    const shortSets = short.exercises.reduce((total, item) => total + item.targetSets, 0);
    const longSets = long.exercises.reduce((total, item) => total + item.targetSets, 0);
    expect(shortSets).toBeLessThan(longSets);
  });

  it('fits a 90 minute request without exceeding it', () => {
    expect(long.estimatedDurationMinutes).toBeLessThanOrEqual(90);
  });
});

describe('generateWorkout — safety and limitations', () => {
  const kneeLimited = generateWorkout(buildContext({ requestedDurationMinutes: 90 }));
  const unrestricted = generateWorkout(
    buildContext({ requestedDurationMinutes: 90, activeLimitations: [] as LimitationArea[] }),
  );

  it('never increases the load on a knee-dominant exercise when KNEE is active', () => {
    kneeLimited.exercises.forEach((item) => {
      const exercise = EXERCISE_BY_ID[item.exerciseId];
      if (!exercise.isKneeDominant) {
        return;
      }
      const lastLoad = SEED_TRAINING_STATE.exerciseProgression[exercise.id]?.lastLoad;
      if (typeof lastLoad === 'number') {
        expect(item.recommendedLoad).toBeLessThanOrEqual(lastLoad);
      }
    });
  });

  it('substitutes knee-dominant work out entirely when a safe alternative exists', () => {
    const kneeDominant = exercisesOf(kneeLimited).filter((exercise) => exercise.isKneeDominant);
    expect(kneeDominant).toHaveLength(0);

    const substituted = kneeLimited.exercises.find((item) => item.substitutedFromExerciseId);
    expect(substituted).toBeDefined();
    expect(EXERCISE_BY_ID[substituted!.substitutedFromExerciseId!].isKneeDominant).toBe(true);
    expect(EXERCISE_BY_ID[substituted!.exerciseId].isKneeDominant).toBe(false);
  });

  it('explains that conservative selection is active', () => {
    expect(kneeLimited.generationExplanation.join(' ')).toMatch(/conservative/i);
  });

  it('programs the knee-dominant movement when no limitation is active', () => {
    expect(exercisesOf(unrestricted).some((exercise) => exercise.isKneeDominant)).toBe(true);
  });
});

describe('generateWorkout — variety without losing progression', () => {
  const seedZero = generateWorkout(buildContext({ requestedDurationMinutes: 90, variantSeed: 0 }));
  const seedOne = generateWorkout(buildContext({ requestedDurationMinutes: 90, variantSeed: 1 }));

  it('is deterministic for the same seed', () => {
    expect(generateWorkout(buildContext({ requestedDurationMinutes: 90, variantSeed: 0 }))).toEqual(seedZero);
  });

  it('varies exercise selection with the variant seed', () => {
    const idsZero = seedZero.exercises.map((item) => item.exerciseId);
    const idsOne = seedOne.exercises.map((item) => item.exerciseId);
    expect(idsZero).not.toEqual(idsOne);
  });

  it('keeps progression anchored to history regardless of the seed', () => {
    const rowId = 'seated-cable-row';
    const fromZero = seedZero.exercises.find((item) => item.exerciseId === rowId);
    const fromOne = seedOne.exercises.find((item) => item.exerciseId === rowId);
    expect(fromZero).toBeDefined();
    expect(fromOne).toBeDefined();
    expect(fromZero!.recommendedLoad).toBe(fromOne!.recommendedLoad);

    const lastLoad = SEED_TRAINING_STATE.exerciseProgression[rowId].lastLoad;
    expect(fromZero!.recommendedLoad).toBeGreaterThanOrEqual(lastLoad);
  });

  it('starts an unseen exercise from a sensible baseline instead of resetting history', () => {
    const unseen = seedZero.exercises.find(
      (item) => !SEED_TRAINING_STATE.exerciseProgression[item.exerciseId],
    );
    if (unseen) {
      expect(unseen.recommendedLoad).toBeGreaterThanOrEqual(0);
      expect(unseen.recommendationReason).toMatch(/first time/i);
    }
  });
});
