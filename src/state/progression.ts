import { decideProgression } from '../engine';
import type { Exercise, ExerciseProgressionState, WorkoutExercise } from '../types';

// Folds a finished session into the per-exercise progression state the generator reads next time.
// Pure so it can be tested without React or storage; finishWorkout in AppStateContext calls it.
//
// Convention (shared with the seed in src/data/seed.ts and with the generator in
// src/engine/workoutGenerator.ts): `lastLoad` is the load the athlete PERFORMED, and
// `lastRepsPerSet` the reps they did at it. The generator re-runs decideProgression on exactly
// those two values to pick the next load, so storing anything else here (for example the
// already-incremented next load) makes the progression rule apply twice.
export function applySessionProgression(
  current: Record<string, ExerciseProgressionState>,
  exercises: WorkoutExercise[],
  library: Exercise[],
  sessionRPE: number,
  nowIso: string,
): Record<string, ExerciseProgressionState> {
  const next: Record<string, ExerciseProgressionState> = { ...current };

  for (const ex of exercises) {
    if (ex.skipped) continue;
    const completedSets = ex.sets.filter((s) => s.completed);
    if (completedSets.length === 0) continue;

    const libraryExercise = library.find((e) => e.id === ex.exerciseId);
    const decision = decideProgression(
      ex.exerciseId,
      ex.targetRepMin,
      ex.targetRepMax,
      completedSets.map((s) => ({ reps: s.reps, rpe: s.rpe })),
      ex.recommendedLoad,
      libraryExercise?.loadIncrement ?? 2.5,
      sessionRPE,
    );
    const previous = next[ex.exerciseId];
    next[ex.exerciseId] = {
      exerciseId: ex.exerciseId,
      lastLoad: ex.recommendedLoad,
      lastRepsPerSet: completedSets.map((s) => s.reps),
      lastCompletedAt: nowIso,
      consecutiveCleanSessions:
        decision.decision === 'INCREASE' ? (previous?.consecutiveCleanSessions ?? 0) + 1 : 0,
      trend: decision.decision,
    };
  }

  return next;
}
