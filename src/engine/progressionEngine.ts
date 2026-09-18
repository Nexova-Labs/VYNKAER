// Progressive overload decisions.
//
// Pure, deterministic rules — no randomness, no model calls. Given what the
// athlete actually logged last time for an exercise, decide whether to add
// load, hold, or ease off, and always produce a plain-English reason that the
// UI can show verbatim.

import type { ProgressionDecision, ProgressionDecisionType } from '../types';

export interface LoggedSetSummary {
  reps: number;
  rpe?: number;
}

/** Above this set RPE we do not auto-add load, even if reps were on target. */
export const MAX_RPE_FOR_INCREASE = 8.5;

/** At or above this RPE we treat the effort as excessive strain. */
export const HIGH_EFFORT_RPE = 9;

function round(value: number): number {
  return Math.round(value * 100) / 100;
}

function formatLoad(load: number): string {
  return `${round(load)}kg`;
}

function formatReps(sets: LoggedSetSummary[]): string {
  return sets.map((set) => set.reps).join('/');
}

function decision(
  exerciseId: string,
  type: ProgressionDecisionType,
  currentLoad: number,
  recommendedLoad: number,
  reason: string,
): ProgressionDecision {
  return {
    exerciseId,
    decision: type,
    currentLoad: round(currentLoad),
    recommendedLoad: round(Math.max(0, recommendedLoad)),
    reason,
  };
}

/**
 * Decide the next load for an exercise from the last logged performance.
 *
 * Rules (in order):
 *  1. Every working set at the top of the range, with acceptable effort -> INCREASE.
 *  2. Reps on target but effort very high (RPE >= 9) -> MAINTAIN (never auto-increase).
 *  3. Multiple sets below the target minimum -> MAINTAIN, or REDUCE if effort was also very high.
 *  4. Anything else inside the range -> MAINTAIN and build total reps first.
 */
export function decideProgression(
  exerciseId: string,
  targetRepMin: number,
  targetRepMax: number,
  setsLogged: LoggedSetSummary[],
  currentLoad: number,
  loadIncrement: number,
  sessionRPE?: number,
): ProgressionDecision {
  const workingSets = setsLogged.filter((set) => Number.isFinite(set.reps));

  if (workingSets.length === 0) {
    return decision(
      exerciseId,
      'MAINTAIN',
      currentLoad,
      currentLoad,
      `No completed sets were logged last time, so we repeat ${formatLoad(currentLoad)} to get a clean reference point.`,
    );
  }

  const rpes = workingSets
    .map((set) => set.rpe)
    .filter((rpe): rpe is number => typeof rpe === 'number' && Number.isFinite(rpe));

  const maxSetRPE = rpes.length > 0 ? Math.max(...rpes) : undefined;
  const hardSetCount = rpes.filter((rpe) => rpe >= HIGH_EFFORT_RPE).length;
  const setsFeltVeryHard = rpes.length > 0 && hardSetCount >= Math.ceil(rpes.length / 2);
  const sessionFeltVeryHard = typeof sessionRPE === 'number' && sessionRPE >= HIGH_EFFORT_RPE;
  const excessiveStrain = setsFeltVeryHard || sessionFeltVeryHard;

  const increaseIsSafe =
    (maxSetRPE === undefined || maxSetRPE <= MAX_RPE_FOR_INCREASE) && !sessionFeltVeryHard;

  const allAtTop = workingSets.every((set) => set.reps >= targetRepMax);
  const setsBelowMin = workingSets.filter((set) => set.reps < targetRepMin);

  const repsText = formatReps(workingSets);
  const rangeText = `${targetRepMin}-${targetRepMax}`;

  // 1 / 2 — top of the range.
  if (allAtTop) {
    if (increaseIsSafe) {
      return decision(
        exerciseId,
        'INCREASE',
        currentLoad,
        currentLoad + loadIncrement,
        `Every set (${repsText}) reached the top of the target range of ${rangeText} reps at manageable effort, so the load goes up by ${formatLoad(loadIncrement)} to ${formatLoad(currentLoad + loadIncrement)}.`,
      );
    }

    return decision(
      exerciseId,
      'MAINTAIN',
      currentLoad,
      currentLoad,
      `Reps (${repsText}) reached the top of the ${rangeText} range, but the effort was very high, so we are avoiding automatic progression at this effort level and repeating ${formatLoad(currentLoad)}.`,
    );
  }

  // 3 — multiple sets short of the target minimum.
  if (setsBelowMin.length >= 2) {
    if (excessiveStrain) {
      const reduced = Math.max(0, currentLoad - loadIncrement);
      return decision(
        exerciseId,
        'REDUCE',
        currentLoad,
        reduced,
        `Several sets (${repsText}) finished below the ${targetRepMin}-rep minimum and the effort was very high, which points to excessive strain rather than a productive session. Easing back to ${formatLoad(reduced)} to restore clean execution.`,
      );
    }

    return decision(
      exerciseId,
      'MAINTAIN',
      currentLoad,
      currentLoad,
      `Reps (${repsText}) fell below the ${targetRepMin}-rep minimum, so we hold ${formatLoad(currentLoad)} and rebuild rep quality before adding load.`,
    );
  }

  // 4 — inside the range.
  if (excessiveStrain) {
    return decision(
      exerciseId,
      'MAINTAIN',
      currentLoad,
      currentLoad,
      `Reps (${repsText}) stayed inside the ${rangeText} range but the effort was very high, so we are avoiding automatic progression at this effort level and repeating ${formatLoad(currentLoad)}.`,
    );
  }

  return decision(
    exerciseId,
    'MAINTAIN',
    currentLoad,
    currentLoad,
    `Reps (${repsText}) stayed inside the ${rangeText} range, so we are maintaining ${formatLoad(currentLoad)} and improving execution and total reps before the next load increase.`,
  );
}

/** True when a decision would add load — used by the safety layer to cap progression. */
export function isProgressiveDecision(type: ProgressionDecisionType): boolean {
  return type === 'INCREASE';
}
