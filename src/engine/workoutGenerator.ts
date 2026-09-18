// The orchestrator: "what should this athlete do next?"
//
// Fully deterministic. Given the same context (profile, training state, history,
// library, requested duration, limitations, variant seed) this always returns
// the same workout. Variety comes from an explicit `variantSeed`, never from
// randomness, and variety never overrides progression: loads and rep targets
// always come from the progression engine applied to the athlete's own history.

import type {
  Exercise,
  GeneratedWorkout,
  LimitationArea,
  Modality,
  MovementPattern,
  ProgressionDecision,
  WorkoutExercise,
  WorkoutGenerationContext,
  AthleteProfile,
} from '../types';

import { decideProgression } from './progressionEngine';
import { explainModalityChoice, getNextModality } from './rotationEngine';
import {
  describeLimitationArea,
  getConflictingLimitations,
  getSafeAlternative,
  getSubstitutionReason,
  isExerciseSafe,
} from './safetyEngine';

/** Minutes of general warm-up assumed in every session estimate. */
const WARMUP_MINUTES = 5;

/** Bounds for the conditioning block. */
const MIN_CARDIO_MINUTES = 8;
const MAX_CARDIO_MINUTES = 28;

/** Never drop a compound below this many sets when shortening a session. */
const MIN_COMPOUND_SETS = 2;

interface SlotSpec {
  key: string;
  label: string;
  patterns: MovementPattern[];
  /** When set, only exercises carrying this tag qualify for the slot. */
  requiredTag?: string;
  /** When set, exercises carrying this tag are excluded from the slot. */
  excludedTag?: string;
  targetSets: number;
  /** Compound slots are protected from duration trimming. */
  compound: boolean;
  minutesPerSet: number;
  /** Offset into the variant seed so two slots of the same pattern differ. */
  seedOffset: number;
}

const SLOTS: SlotSpec[] = [
  {
    key: 'horizontal-push',
    label: 'Horizontal push',
    patterns: ['HORIZONTAL_PUSH'],
    targetSets: 3,
    compound: true,
    minutesPerSet: 2,
    seedOffset: 0,
  },
  {
    key: 'vertical-pull',
    label: 'Vertical pull',
    patterns: ['VERTICAL_PULL'],
    targetSets: 3,
    compound: true,
    minutesPerSet: 2,
    seedOffset: 0,
  },
  {
    key: 'vertical-push',
    label: 'Vertical push',
    patterns: ['VERTICAL_PUSH'],
    targetSets: 3,
    compound: true,
    minutesPerSet: 2,
    seedOffset: 1,
  },
  {
    key: 'horizontal-pull',
    label: 'Horizontal pull',
    patterns: ['HORIZONTAL_PULL'],
    targetSets: 3,
    compound: true,
    minutesPerSet: 2,
    seedOffset: 0,
  },
  {
    key: 'hinge',
    label: 'Hip hinge',
    patterns: ['HINGE'],
    excludedTag: 'lower-body-accessory',
    targetSets: 3,
    compound: true,
    minutesPerSet: 2,
    seedOffset: 0,
  },
  {
    key: 'carry',
    label: 'Loaded carry',
    patterns: ['CARRY'],
    targetSets: 3,
    compound: false,
    minutesPerSet: 1.5,
    seedOffset: 0,
  },
  {
    key: 'lower-body-accessory',
    label: 'Lower-body accessory',
    patterns: ['SQUAT', 'HINGE'],
    requiredTag: 'lower-body-accessory',
    targetSets: 3,
    compound: false,
    minutesPerSet: 1.8,
    seedOffset: 0,
  },
  {
    key: 'core',
    label: 'Core',
    patterns: ['CORE'],
    targetSets: 2,
    compound: false,
    minutesPerSet: 1.5,
    seedOffset: 0,
  },
  {
    key: 'isolation-a',
    label: 'Isolation accessory',
    patterns: ['ISOLATION'],
    targetSets: 3,
    compound: false,
    minutesPerSet: 1.5,
    seedOffset: 0,
  },
  {
    key: 'isolation-b',
    label: 'Isolation accessory',
    patterns: ['ISOLATION'],
    targetSets: 2,
    compound: false,
    minutesPerSet: 1.5,
    seedOffset: 1,
  },
];

interface PlannedExercise {
  slot: SlotSpec;
  exercise: Exercise;
  substitutedFromExerciseId?: string;
  substitutionNote?: string;
  targetSets: number;
  targetRepMin: number;
  targetRepMax: number;
  decision: ProgressionDecision;
  limitationCapped: boolean;
  isNewExercise: boolean;
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}

/** Sensible first-time load when the athlete has never logged this exercise. */
export function getDefaultStartingLoad(exercise: Exercise): number {
  switch (exercise.equipment) {
    case 'BARBELL':
      return 20;
    case 'MACHINE':
      return 15;
    case 'CABLE':
      return 10;
    case 'DUMBBELL':
      return 7.5;
    case 'BODYWEIGHT':
    case 'BIKE':
    case 'OTHER':
    default:
      return 0;
  }
}

/**
 * Compounds follow the athlete's primary rep range; isolation, carries, core and
 * conditioning keep their own (usually higher) default range.
 */
export function resolveRepRange(exercise: Exercise, profile: AthleteProfile): [number, number] {
  const ownRangePatterns: MovementPattern[] = ['ISOLATION', 'CARRY', 'CORE', 'CONDITIONING'];
  if (ownRangePatterns.includes(exercise.movementPattern)) {
    return exercise.defaultRepRange;
  }
  if (exercise.tags.includes('accessory') || exercise.tags.includes('lower-body-accessory')) {
    return exercise.defaultRepRange;
  }
  return profile.primaryRepRange;
}

function matchesSlot(exercise: Exercise, slot: SlotSpec, modality: Modality): boolean {
  if (!exercise.modalityCompatibility.includes(modality)) {
    return false;
  }
  if (!slot.patterns.includes(exercise.movementPattern)) {
    return false;
  }
  if (slot.requiredTag && !exercise.tags.includes(slot.requiredTag)) {
    return false;
  }
  if (slot.excludedTag && exercise.tags.includes(slot.excludedTag)) {
    return false;
  }
  return true;
}

/** Deterministic candidate ordering: highest priority first, id as tie-breaker. */
function orderCandidates(candidates: Exercise[]): Exercise[] {
  return [...candidates].sort((a, b) => {
    if (b.priority !== a.priority) {
      return b.priority - a.priority;
    }
    return a.id.localeCompare(b.id);
  });
}

interface SlotSelection {
  exercise: Exercise;
  substitutedFromExerciseId?: string;
  substitutionNote?: string;
}

function selectForSlot(
  slot: SlotSpec,
  library: Exercise[],
  modality: Modality,
  limitations: LimitationArea[],
  usedIds: Set<string>,
  variantSeed: number,
): SlotSelection | null {
  const pool = orderCandidates(library.filter((exercise) => matchesSlot(exercise, slot, modality))).filter(
    (exercise) => !usedIds.has(exercise.id),
  );

  if (pool.length === 0) {
    return null;
  }

  const index = Math.abs(variantSeed + slot.seedOffset) % pool.length;
  const preferred = pool[index];

  if (isExerciseSafe(preferred, limitations)) {
    return { exercise: preferred };
  }

  // The variety pick conflicts with an active limitation — try its declared
  // substitutions first, then any other safe candidate for the same slot.
  const alternative = getSafeAlternative(preferred, library, limitations);
  if (alternative && !usedIds.has(alternative.id) && alternative.modalityCompatibility.includes(modality)) {
    return {
      exercise: alternative,
      substitutedFromExerciseId: preferred.id,
      substitutionNote: getSubstitutionReason(preferred, alternative.id),
    };
  }

  const safeFallback = pool.find((exercise) => isExerciseSafe(exercise, limitations));
  if (safeFallback) {
    return {
      exercise: safeFallback,
      substitutedFromExerciseId: preferred.id,
    };
  }

  return null;
}

function planProgression(
  exercise: Exercise,
  context: WorkoutGenerationContext,
  targetRepMin: number,
  targetRepMax: number,
): { decision: ProgressionDecision; isNew: boolean } {
  const state = context.trainingState.exerciseProgression[exercise.id];
  const recentRPE = context.trainingState.recentSessionRPE;
  const lastSessionRPE = recentRPE.length > 0 ? recentRPE[recentRPE.length - 1] : undefined;

  if (!state) {
    const startingLoad = getDefaultStartingLoad(exercise);
    return {
      isNew: true,
      decision: {
        exerciseId: exercise.id,
        decision: 'MAINTAIN',
        currentLoad: startingLoad,
        recommendedLoad: startingLoad,
        reason: `First time programming ${exercise.name}. Starting at ${startingLoad}kg to establish a clean baseline before adding load.`,
      },
    };
  }

  return {
    isNew: false,
    decision: decideProgression(
      exercise.id,
      targetRepMin,
      targetRepMax,
      state.lastRepsPerSet.map((reps) => ({ reps })),
      state.lastLoad,
      exercise.loadIncrement,
      lastSessionRPE,
    ),
  };
}

function planCardioMinutes(context: WorkoutGenerationContext): number {
  const { lastCardioMinutes, recentSessionRPE } = context.trainingState;
  const lastRPE = recentSessionRPE.length > 0 ? recentSessionRPE[recentSessionRPE.length - 1] : undefined;

  if (!lastCardioMinutes || lastCardioMinutes <= 0) {
    return MIN_CARDIO_MINUTES + 2;
  }

  let step = 2;
  if (typeof lastRPE === 'number') {
    if (lastRPE >= 8) {
      step = 1;
    } else if (lastRPE <= 6) {
      step = 3;
    }
  }

  return Math.min(MAX_CARDIO_MINUTES, Math.max(MIN_CARDIO_MINUTES, lastCardioMinutes + step));
}

function strengthMinutes(planned: PlannedExercise[]): number {
  return planned.reduce((total, item) => total + item.targetSets * item.slot.minutesPerSet, 0);
}

function estimateTotalMinutes(planned: PlannedExercise[], cardioMinutes: number): number {
  return Math.round(WARMUP_MINUTES + strengthMinutes(planned) + cardioMinutes);
}

function buildFocus(modality: Modality, profile: AthleteProfile, hasCardio: boolean): string {
  const base =
    profile.trainingGoal === 'CONDITIONING'
      ? 'Conditioning + Strength'
      : profile.trainingGoal === 'MUSCLE'
        ? 'Hypertrophy'
        : profile.trainingGoal === 'MOVEMENT_QUALITY'
          ? 'Movement Quality'
          : 'Strength';

  const detail = modality === 'MIXED' ? 'Push / Pull / Carry' : 'Push / Pull / Hinge';
  return hasCardio ? `${base} + Conditioning — ${detail}` : `${base} — ${detail}`;
}

function buildTargetRPE(context: WorkoutGenerationContext): number {
  const recent = context.trainingState.recentSessionRPE.slice(-3);
  if (recent.length === 0) {
    return 7;
  }
  const average = recent.reduce((sum, value) => sum + value, 0) / recent.length;
  if (average >= 8 || context.activeLimitations.length > 0) {
    return 6;
  }
  return 7;
}

export function generateWorkout(context: WorkoutGenerationContext): GeneratedWorkout {
  const {
    profile,
    trainingState,
    exerciseLibrary,
    requestedDurationMinutes,
    activeLimitations,
    variantSeed = 0,
  } = context;

  const explanation: string[] = [];

  // 1 — modality rotation.
  const modality = getNextModality(trainingState.lastModality, profile.rotationSequence);
  explanation.push(explainModalityChoice(trainingState.lastModality, modality));

  if (activeLimitations.length > 0) {
    explanation.push(
      `Conservative selection is on for your ${activeLimitations
        .map(describeLimitationArea)
        .join(' and ')}: movements that load that area are swapped out or held at their current weight.`,
    );
  }

  // 2 / 3 — slot selection plus progression.
  const usedIds = new Set<string>();
  const planned: PlannedExercise[] = [];

  for (const slot of SLOTS) {
    const selection = selectForSlot(
      slot,
      exerciseLibrary,
      modality,
      activeLimitations,
      usedIds,
      variantSeed,
    );

    if (!selection) {
      continue;
    }

    const exercise = selection.exercise;
    usedIds.add(exercise.id);

    const [targetRepMin, targetRepMax] = resolveRepRange(exercise, profile);
    const { decision, isNew } = planProgression(exercise, context, targetRepMin, targetRepMax);

    // 6 — safety cap: never add load to an exercise that loads a protected area.
    let finalDecision = decision;
    let limitationCapped = false;
    const conflicts = getConflictingLimitations(exercise, activeLimitations);

    if (conflicts.length > 0 && decision.decision === 'INCREASE') {
      limitationCapped = true;
      finalDecision = {
        ...decision,
        decision: 'MAINTAIN',
        recommendedLoad: decision.currentLoad,
        reason: `${decision.reason} Load is held at ${round(decision.currentLoad)}kg anyway because this movement loads your ${conflicts
          .map(describeLimitationArea)
          .join(' and ')} while conservative mode is active.`,
      };
    }

    planned.push({
      slot,
      exercise,
      substitutedFromExerciseId: selection.substitutedFromExerciseId,
      substitutionNote: selection.substitutionNote,
      targetSets: slot.targetSets,
      targetRepMin,
      targetRepMax,
      decision: finalDecision,
      limitationCapped,
      isNewExercise: isNew,
    });
  }

  // 5 — conditioning block.
  const conditioningExercise = profile.conditioningEnabled
    ? orderCandidates(
        exerciseLibrary.filter(
          (exercise) =>
            exercise.movementPattern === 'CONDITIONING' && exercise.modalityCompatibility.includes(modality),
        ),
      )[0] ?? null
    : null;

  let cardioMinutes = conditioningExercise ? planCardioMinutes(context) : 0;

  // 4 — duration adaptation.
  const budget = requestedDurationMinutes > 0 ? requestedDurationMinutes : profile.preferredDurationMinutes;
  const trimmedNames: string[] = [];

  // (a) drop optional accessories, lowest priority first.
  const trimOrder = planned
    .map((item, index) => ({ item, index }))
    .filter(({ item }) => !item.slot.compound)
    .sort((a, b) => {
      if (a.item.exercise.priority !== b.item.exercise.priority) {
        return a.item.exercise.priority - b.item.exercise.priority;
      }
      return b.index - a.index;
    });

  let kept = [...planned];
  for (const { item } of trimOrder) {
    if (estimateTotalMinutes(kept, cardioMinutes) <= budget) {
      break;
    }
    kept = kept.filter((candidate) => candidate !== item);
    trimmedNames.push(item.exercise.name);
  }

  // (b) then pull back the conditioning block (never below the floor).
  if (cardioMinutes > 0 && estimateTotalMinutes(kept, cardioMinutes) > budget) {
    const overflow = estimateTotalMinutes(kept, cardioMinutes) - budget;
    cardioMinutes = Math.max(MIN_CARDIO_MINUTES, cardioMinutes - overflow);
  }

  // (c) last resort: reduce sets on the lowest-priority compounds. Compound
  // movements are never removed just to hit a short duration.
  if (estimateTotalMinutes(kept, cardioMinutes) > budget) {
    const setReductionOrder = [...kept]
      .filter((item) => item.slot.compound)
      .sort((a, b) => a.exercise.priority - b.exercise.priority);

    for (const item of setReductionOrder) {
      if (estimateTotalMinutes(kept, cardioMinutes) <= budget) {
        break;
      }
      if (item.targetSets > MIN_COMPOUND_SETS) {
        item.targetSets = MIN_COMPOUND_SETS;
      }
    }
  }

  // Accessories that survived a shortened session are flagged as optional.
  const sessionWasShortened = trimmedNames.length > 0;
  const exercises: WorkoutExercise[] = kept.map((item, index) => ({
    exerciseId: item.exercise.id,
    order: index + 1,
    targetSets: item.targetSets,
    targetRepMin: item.targetRepMin,
    targetRepMax: item.targetRepMax,
    recommendedLoad: round(item.decision.recommendedLoad),
    recommendationReason: item.decision.reason,
    optional: !item.slot.compound && sessionWasShortened,
    ...(item.substitutedFromExerciseId ? { substitutedFromExerciseId: item.substitutedFromExerciseId } : {}),
    skipped: false,
    sets: [],
    ...(item.substitutionNote ? { notes: item.substitutionNote } : {}),
  }));

  if (conditioningExercise && cardioMinutes > 0) {
    exercises.push({
      exerciseId: conditioningExercise.id,
      order: exercises.length + 1,
      targetSets: 1,
      targetRepMin: cardioMinutes,
      targetRepMax: cardioMinutes,
      recommendedLoad: 0,
      recommendationReason: `${cardioMinutes} minutes of steady ${profile.preferredCardio.toLowerCase()} work, progressing from your last ${trainingState.lastCardioMinutes} minutes.`,
      optional: false,
      skipped: false,
      sets: [],
    });
  }

  // 7 — explanation lines.
  for (const item of kept) {
    if (item.substitutedFromExerciseId) {
      const original = exerciseLibrary.find((exercise) => exercise.id === item.substitutedFromExerciseId);
      explanation.push(
        `${original ? original.name : item.substitutedFromExerciseId} was replaced with ${item.exercise.name}${
          item.substitutionNote ? ` — ${item.substitutionNote.replace(/\.$/, '')}` : ''
        }.`,
      );
    }
  }

  for (const item of kept) {
    if (item.decision.decision === 'INCREASE' || item.decision.decision === 'REDUCE' || item.limitationCapped) {
      explanation.push(`${item.exercise.name}: ${item.decision.reason}`);
    }
  }

  const maintained = kept.filter(
    (item) => item.decision.decision === 'MAINTAIN' && !item.limitationCapped && !item.isNewExercise,
  );
  if (maintained.length > 0) {
    explanation.push(
      `${maintained.length} movement${maintained.length === 1 ? '' : 's'} stay at the same load today to build rep quality before the next increase.`,
    );
  }

  if (sessionWasShortened) {
    explanation.push(
      `You asked for ${budget} minutes, so ${trimmedNames.join(', ')} came out first. Every primary compound movement was kept.`,
    );
  }

  if (conditioningExercise && cardioMinutes > 0) {
    explanation.push(
      `${conditioningExercise.name} moves from ${trainingState.lastCardioMinutes} to ${cardioMinutes} minutes — a gradual step rather than a jump.`,
    );
  } else if (!profile.conditioningEnabled) {
    explanation.push('Conditioning is switched off in your profile, so today is strength work only.');
  }

  const activeMilestone = profile.currentMilestones.find((milestone) => milestone.active);
  if (activeMilestone) {
    const stage = activeMilestone.stages[activeMilestone.currentStageIndex];
    explanation.push(
      `Milestone "${activeMilestone.name}" is at the ${stage} stage — keep chipping away at it after your pressing work.`,
    );
  }

  return {
    modality,
    focus: buildFocus(modality, profile, cardioMinutes > 0),
    targetRPE: buildTargetRPE(context),
    estimatedDurationMinutes: estimateTotalMinutes(kept, cardioMinutes),
    exercises,
    cardioMinutes,
    generationExplanation: explanation,
  };
}
