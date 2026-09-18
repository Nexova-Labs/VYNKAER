import type { Exercise, WorkoutAdaptation, WorkoutExercise } from '../types';

// Applies a confirmed Coach proposal (or a manual Train-screen action) to a
// list of WorkoutExercise entries. Pure function — the caller decides
// whether the target is the active session or the pre-start draft plan.
export function applyStructuralAdaptation(
  exercises: WorkoutExercise[],
  library: Exercise[],
  adaptation: WorkoutAdaptation
): WorkoutExercise[] {
  const byId = new Map(library.map((e) => [e.id, e]));

  switch (adaptation.type) {
    case 'REMOVE_MOVEMENT_PATTERN': {
      return exercises.map((ex) => {
        const def = byId.get(ex.exerciseId);
        if (def && def.movementPattern === adaptation.movementPattern) {
          return { ...ex, skipped: true, notes: 'Removed by Coach adaptation.' };
        }
        return ex;
      });
    }

    case 'INCREASE_CARDIO': {
      const delta = adaptation.cardioDeltaMinutes ?? 2;
      return exercises.map((ex) => {
        const def = byId.get(ex.exerciseId);
        if (def && def.movementPattern === 'CONDITIONING') {
          const nextMax = ex.targetRepMax + delta;
          return { ...ex, targetRepMin: ex.targetRepMin + delta, targetRepMax: nextMax };
        }
        return ex;
      });
    }

    case 'SUBSTITUTE_EXERCISE': {
      return exercises.map((ex) => {
        if (ex.exerciseId !== adaptation.exerciseId) return ex;
        const current = byId.get(ex.exerciseId);
        const alt = current?.substitutions
          .map((s) => byId.get(s.exerciseId))
          .find((candidate): candidate is Exercise => Boolean(candidate));
        if (!alt) return ex;
        return {
          ...ex,
          exerciseId: alt.id,
          substitutedFromExerciseId: ex.exerciseId,
          targetRepMin: alt.defaultRepRange[0],
          targetRepMax: alt.defaultRepRange[1],
          recommendationReason: 'Substituted by Coach. Starting conservatively at a comfortable load.',
        };
      });
    }

    case 'SHORTEN_DURATION': {
      const targetMinutes = adaptation.targetDurationMinutes ?? 40;
      const approxPerExercise = 8;
      const keepCount = Math.max(3, Math.round(targetMinutes / approxPerExercise));
      const ranked = [...exercises].sort((a, b) => {
        const pa = byId.get(a.exerciseId)?.priority ?? 0;
        const pb = byId.get(b.exerciseId)?.priority ?? 0;
        return pb - pa;
      });
      const keepIds = new Set(ranked.slice(0, keepCount).map((e) => e.exerciseId));
      return exercises.map((ex) =>
        keepIds.has(ex.exerciseId) ? ex : { ...ex, skipped: true, notes: 'Trimmed to fit the requested time.' }
      );
    }

    case 'EASIER': {
      return exercises.map((ex) => {
        const def = byId.get(ex.exerciseId);
        if (!def || def.movementPattern === 'CONDITIONING') return ex;
        const nextLoad = Math.max(0, ex.recommendedLoad - def.loadIncrement);
        return { ...ex, recommendedLoad: nextLoad, recommendationReason: 'Reduced by Coach for today only.' };
      });
    }

    case 'HARDER': {
      return exercises.map((ex) => {
        const def = byId.get(ex.exerciseId);
        if (!def || def.movementPattern === 'CONDITIONING') return ex;
        const nextLoad = ex.recommendedLoad + def.loadIncrement;
        return { ...ex, recommendedLoad: nextLoad, recommendationReason: 'Increased by Coach for today only.' };
      });
    }

    default:
      return exercises;
  }
}

export interface AdaptationMetaPatch {
  targetRPE?: number;
  estimatedDurationMinutes?: number;
  cardioMinutes?: number;
}

export function computeAdaptationMetaPatch(adaptation: WorkoutAdaptation, current: AdaptationMetaPatch): AdaptationMetaPatch {
  switch (adaptation.type) {
    case 'EASIER':
      return { targetRPE: Math.max(4, (current.targetRPE ?? 7) - 1) };
    case 'HARDER':
      return { targetRPE: Math.min(9, (current.targetRPE ?? 7) + 1) };
    case 'SHORTEN_DURATION':
      return { estimatedDurationMinutes: adaptation.targetDurationMinutes };
    case 'INCREASE_CARDIO':
      return { cardioMinutes: (current.cardioMinutes ?? 15) + (adaptation.cardioDeltaMinutes ?? 2) };
    default:
      return {};
  }
}
