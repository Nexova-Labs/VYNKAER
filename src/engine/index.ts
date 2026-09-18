// VYNKÆR deterministic training engine — public surface.

export {
  DEFAULT_ROTATION_SEQUENCE,
  describeModality,
  explainModalityChoice,
  getNextModality,
  getRotationPreview,
} from './rotationEngine';

export {
  HIGH_EFFORT_RPE,
  MAX_RPE_FOR_INCREASE,
  decideProgression,
  isProgressiveDecision,
} from './progressionEngine';
export type { LoggedSetSummary } from './progressionEngine';

export {
  describeLimitationArea,
  getActiveLimitationAreas,
  getConflictingLimitations,
  getSafeAlternative,
  getSubstitutionReason,
  isExerciseSafe,
  shouldUseConservativeSelection,
} from './safetyEngine';

export { generateWorkout, getDefaultStartingLoad, resolveRepRange } from './workoutGenerator';
