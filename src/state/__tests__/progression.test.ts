import { EXERCISE_BY_ID, EXERCISE_LIBRARY } from '../../data/exercises';
import { SEED_ATHLETE_PROFILE, SEED_TRAINING_STATE, SEED_WORKOUT_HISTORY } from '../../data/seed';
import { generateWorkout } from '../../engine';
import type { SetLog, TrainingState, WorkoutExercise, WorkoutGenerationContext } from '../../types';
import { applySessionProgression } from '../progression';

const NOW = '2026-11-04T10:00:00.000Z';

function context(trainingState: TrainingState): WorkoutGenerationContext {
  return {
    profile: SEED_ATHLETE_PROFILE,
    trainingState,
    history: SEED_WORKOUT_HISTORY,
    exerciseLibrary: EXERCISE_LIBRARY,
    requestedDurationMinutes: 60,
    activeLimitations: ['KNEE'],
    workoutNumber: 14,
    variantSeed: 0,
  };
}

function sets(reps: number[], weight: number, rpe?: number): SetLog[] {
  return reps.map((r, i) => ({
    setNumber: i + 1,
    weight,
    reps: r,
    rpe,
    completed: true,
    createdAt: NOW,
  }));
}

function logged(base: WorkoutExercise, reps: number[], rpe?: number): WorkoutExercise {
  return { ...base, sets: sets(reps, base.recommendedLoad, rpe) };
}

// An exercise the generator plans today that the knee limitation does not cap, so that load
// progression is not suppressed by the safety layer, and whose load has headroom to go down.
function pickPlannedExercise() {
  const plan = generateWorkout(context(SEED_TRAINING_STATE));
  const planned = plan.exercises.find((item) => {
    const def = EXERCISE_BY_ID[item.exerciseId];
    return def.movementPattern !== 'CONDITIONING' && !def.isKneeDominant && item.recommendedLoad > def.loadIncrement * 2;
  });
  expect(planned).toBeDefined();
  return { plan, planned: planned!, def: EXERCISE_BY_ID[planned!.exerciseId] };
}

function nextRecommendation(exerciseId: string, progression: TrainingState['exerciseProgression'], sessionRPE: number) {
  const state: TrainingState = {
    ...SEED_TRAINING_STATE,
    exerciseProgression: progression,
    recentSessionRPE: [...SEED_TRAINING_STATE.recentSessionRPE, sessionRPE].slice(-5),
  };
  const next = generateWorkout(context(state)).exercises.find((item) => item.exerciseId === exerciseId);
  expect(next).toBeDefined();
  return next!;
}

describe('applySessionProgression: what is stored', () => {
  it('records the load that was performed, not the next recommendation (D2)', () => {
    const { planned } = pickPlannedExercise();
    const done = logged(planned, Array(planned.targetSets).fill(planned.targetRepMax));

    const result = applySessionProgression({}, [done], EXERCISE_LIBRARY, 7, NOW);

    expect(result[planned.exerciseId].lastLoad).toBe(planned.recommendedLoad);
    expect(result[planned.exerciseId].trend).toBe('INCREASE');
  });

  it('records the completed reps per set and the completion time', () => {
    const { planned } = pickPlannedExercise();
    const done = logged(planned, [planned.targetRepMax, planned.targetRepMax - 1, planned.targetRepMin]);

    const state = applySessionProgression({}, [done], EXERCISE_LIBRARY, 7, NOW)[planned.exerciseId];

    expect(state.lastRepsPerSet).toEqual([planned.targetRepMax, planned.targetRepMax - 1, planned.targetRepMin]);
    expect(state.lastCompletedAt).toBe(NOW);
  });

  it('leaves skipped and fully uncompleted exercises untouched', () => {
    const { planned } = pickPlannedExercise();
    const before = SEED_TRAINING_STATE.exerciseProgression;
    const skipped = { ...logged(planned, [planned.targetRepMax]), skipped: true };
    const notDone = { ...planned, sets: planned.sets.map((s) => ({ ...s, completed: false })) };

    expect(applySessionProgression(before, [skipped, notDone], EXERCISE_LIBRARY, 7, NOW)).toEqual(before);
  });
});

describe('applySessionProgression → generateWorkout: the next load moves exactly one step (D2)', () => {
  it('adds one increment after a clean top-of-range session, not two', () => {
    const { planned, def } = pickPlannedExercise();
    const done = logged(planned, Array(planned.targetSets).fill(planned.targetRepMax));

    const progression = applySessionProgression(SEED_TRAINING_STATE.exerciseProgression, [done], EXERCISE_LIBRARY, 7, NOW);
    const next = nextRecommendation(planned.exerciseId, progression, 7);

    expect(next.recommendedLoad).toBeCloseTo(planned.recommendedLoad + def.loadIncrement, 5);
  });

  it('removes one increment after a failed, very hard session, not two', () => {
    const { planned, def } = pickPlannedExercise();
    const done = logged(planned, Array(planned.targetSets).fill(planned.targetRepMin - 2), 9.5);

    const progression = applySessionProgression(SEED_TRAINING_STATE.exerciseProgression, [done], EXERCISE_LIBRARY, 9.5, NOW);
    expect(progression[planned.exerciseId].trend).toBe('REDUCE');
    const next = nextRecommendation(planned.exerciseId, progression, 9.5);

    expect(next.recommendedLoad).toBeCloseTo(planned.recommendedLoad - def.loadIncrement, 5);
  });

  it('holds the load when reps stay inside the range', () => {
    const { planned } = pickPlannedExercise();
    const done = logged(planned, Array(planned.targetSets).fill(planned.targetRepMin));

    const progression = applySessionProgression(SEED_TRAINING_STATE.exerciseProgression, [done], EXERCISE_LIBRARY, 7, NOW);
    const next = nextRecommendation(planned.exerciseId, progression, 7);

    expect(next.recommendedLoad).toBeCloseTo(planned.recommendedLoad, 5);
  });
});
