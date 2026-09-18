// Limitation / safety guard.
//
// The athlete's limitations are training constraints, not diagnoses. This layer
// only decides which movement patterns to avoid and what to swap in instead.

import type { AthleteLimitation, Exercise, LimitationArea } from '../types';

type LimitationFlagCheck = (exercise: Exercise) => boolean;

/** Which exercise flag makes an exercise unsuitable for a given limitation area. */
const LIMITATION_FLAGS: Record<LimitationArea, LimitationFlagCheck> = {
  KNEE: (exercise) => exercise.isKneeDominant,
  LOWER_BACK: (exercise) => exercise.isLowerBackDominant,
  SHOULDER: (exercise) => exercise.isShoulderDominant,
  HIP: () => false,
  ELBOW: () => false,
  WRIST: () => false,
  OTHER: () => false,
};

/** True when the exercise does not load an area the athlete is currently protecting. */
export function isExerciseSafe(exercise: Exercise, activeLimitations: LimitationArea[]): boolean {
  if (!activeLimitations || activeLimitations.length === 0) {
    return true;
  }

  return !activeLimitations.some((area) => {
    const check = LIMITATION_FLAGS[area];
    return typeof check === 'function' ? check(exercise) : false;
  });
}

/** The limitation areas an exercise conflicts with (empty when it is safe). */
export function getConflictingLimitations(
  exercise: Exercise,
  activeLimitations: LimitationArea[],
): LimitationArea[] {
  return (activeLimitations ?? []).filter((area) => {
    const check = LIMITATION_FLAGS[area];
    return typeof check === 'function' ? check(exercise) : false;
  });
}

/**
 * Walk the exercise's declared substitutions and return the first one that both
 * exists in the library and is safe under the active limitations.
 */
export function getSafeAlternative(
  exercise: Exercise,
  library: Exercise[],
  activeLimitations: LimitationArea[],
): Exercise | null {
  for (const substitution of exercise.substitutions ?? []) {
    const candidate = library.find((item) => item.id === substitution.exerciseId);
    if (!candidate || candidate.id === exercise.id) {
      continue;
    }
    if (isExerciseSafe(candidate, activeLimitations)) {
      return candidate;
    }
  }

  return null;
}

/** The stated reason attached to a substitution pair, if the library declares one. */
export function getSubstitutionReason(from: Exercise, toExerciseId: string): string | undefined {
  return (from.substitutions ?? []).find((sub) => sub.exerciseId === toExerciseId)?.reason;
}

/** True when at least one active limitation asks for conservative programming. */
export function shouldUseConservativeSelection(limitations: AthleteLimitation[]): boolean {
  return (limitations ?? []).some((limitation) => limitation.active && limitation.conservativeMode);
}

/** The limitation areas currently active on a profile. */
export function getActiveLimitationAreas(limitations: AthleteLimitation[]): LimitationArea[] {
  return (limitations ?? []).filter((limitation) => limitation.active).map((limitation) => limitation.area);
}

/** Readable label for explanation lines. */
export function describeLimitationArea(area: LimitationArea): string {
  switch (area) {
    case 'LOWER_BACK':
      return 'lower back';
    default:
      return area.toLowerCase();
  }
}
